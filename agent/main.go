package main

import (
	"context"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"

	"echoes/shared/trsa"
	"echoes/version"

	"github.com/docker/docker/client"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"

	// _ "github.com/joho/godotenv/autoload"
	"github.com/rs/zerolog/log"
	"github.com/urfave/cli/v2"
)

type response struct {
	Status    string      `json:"status"`
	Event     string      `json:"event"`
	Data      interface{} `json:"data"`
	MessageId string      `json:"messageId"`
}

// Create a custom struct for PublicKey and Token
type AgentInfo struct {
	Token    string `json:"token"`
	Hostname string `json:"hostname"`
}

const (
	retryDuration = 60 * time.Second // Total duration to keep retrying
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Error().Err(err).Msg("Error loading .env file")
	}

	app := cli.NewApp()
	app.Name = "echoes-agent"
	app.Version = version.String()
	app.Usage = "echoes agent"
	app.Action = runAgent
	app.Commands = []*cli.Command{
		{
			Name:  "ping",
			Usage: "ping the agent",
			// Action: pinger,
		},
		{
			Name:   "health",
			Usage:  "check the health of the server",
			Action: healthchecker,
		},
	}
	app.Flags = flags

	if err := app.Run(os.Args); err != nil {
		log.Fatal().Err(err).Msg("error running agent")
	}
}

func runAgent(context *cli.Context) error {
	startTime := time.Now()

	// log the agent starting
	log.Info().Msg("Starting agent")

	// load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Error().Err(err).Msg("Error loading .env file")
	}

	// perform check to ensure the server is healthy and ready to accept connections
	healthcheckAddress := context.String("healthcheck-addr")
	if strings.HasPrefix(healthcheckAddress, ":") {
		healthcheckAddress = "localhost" + healthcheckAddress
	}

	// Build the protocol
	protocol := "http"
	if context.Bool("ssl") {
		protocol = "https"
	}

	// Build the healthcheck URL
	if context.Bool("dev-mode") {
		healthcheckAddress = protocol + "://" + healthcheckAddress + "/general/healthcheck"
	} else {
		healthcheckAddress = protocol + "://" + healthcheckAddress + "/api/general/healthcheck"
	}

	log.Debug().Msg("Healthcheck address: " + healthcheckAddress)

	if !checkServerHealth(healthcheckAddress) {
		log.Error().Msg("Server is not healthy")
		return nil
	}

	agent := Agent{}
	// Initialize the agent
	agent.Initialize(context.String("secret"))

	// Infinite loop replaced with loop that runs for retryDuration
	for {
		if time.Since(startTime) > retryDuration {
			log.Error().Msg("Connection retry time exceeded")
			break
		}

		if connectToServer(&agent, context) {
			handleServerCommunication(&agent)
		}

		// Sleep before retrying
		time.Sleep(5 * time.Second)
	}

	return nil
}

// Connect to the server
func connectToServer(agent *Agent, context *cli.Context) bool {
	u := url.URL{Scheme: "ws", Host: context.String("server"), Path: "/ws"}

	// If we are not in dev mode, we need to use the api/ws endpoint
	if !context.Bool("dev-mode") {
		// Create a new URL struct
		u = url.URL{Scheme: "wss", Host: context.String("server"), Path: "/api/ws"}
	}

	// Schema for the server if SSL is enabled
	if context.Bool("ssl") {
		u.Scheme = "wss"
	} else {
		u.Scheme = "ws"
	}

	log.Debug().Msg("Scheme: " + u.Scheme)

	log.Debug().Msg("Connecting to server: " + u.String())

	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Error().Err(err).Msg("Error connecting to server")
		return false
	}

	agent.Connection = c // Assuming you store the connection in the Agent struct
	log.Info().Msg("Connected to server")
	return true
}

// Handle communication with the server
func handleServerCommunication(agent *Agent) {
	c := agent.Connection // Assuming you store the connection in the Agent struct

	defer c.Close()

	// Create a channel to listen for termination signals
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)

	// Set up a goroutine to handle the termination signal and close the WebSocket connection
	go func() {
		<-sigCh // Wait for a termination signal

		// Perform cleanup actions here, such as closing the WebSocket connection
		// Close the WebSocket connection gracefully
		if err := c.Close(); err != nil {
			log.Error().Err(err).Msg("Error closing WebSocket connection")
		} else {
			log.Info().Msg("WebSocket connection closed")
		}

		// Exit the program
		os.Exit(0)
	}()

	// Inner loop for continuous message handling
	for {
		// Receive message
		_, message, err := c.ReadMessage()
		if err != nil {
			log.Error().Err(err).Msg("Error reading message")
			return
		}

		var resp response

		// Parse message
		err = json.Unmarshal(message, &resp)
		if err != nil {
			// log.Error("agent", "Error unmarshaling JSON: "+err.Error())
			log.Error().Err(err).Msg("Error unmarshaling JSON")
		}

		// Handle message
		switch resp.Event {
		case "handshake":
			// log.Info("agent", "Server performing handshake")
			log.Info().Msg("Server performing handshake")

			// Check if resp.Data is a map and contains "publicKey" key
			data, ok := resp.Data.(map[string]interface{})
			if !ok {
				// log.Error("agent", "Invalid handshake message format")
				log.Error().Msg("Invalid handshake message format")
				// Handle the error appropriately, e.g., return or log
				return
			}

			publicKeyValue, ok := data["publicKey"].(string)
			if !ok {
				// log.Error("agent", "Invalid publicKey format")
				log.Error().Msg("Invalid publicKey format")
				// Handle the error appropriately, e.g., return or log
				return
			}

			// Convert the publicKeyValue string to []byte
			publicKeyBytes := []byte(publicKeyValue)

			// Now you can use publicKeyBytes as []byte
			agent.ServerPublicKey = publicKeyBytes

			// Build handshake message
			handshakeData := response{
				Event: "handshake",
				Data: struct {
					PublicKey string `json:"publicKey"`
				}{
					PublicKey: string(agent.PublicKey),
				},
			}

			// Convert the handshakeData struct to a JSON string
			jsonData, err := json.Marshal(handshakeData)
			if err != nil {
				// log.Error("agent", "json.Marshal error:"+err.Error())
				log.Error().Err(err).Msg("json.Marshal error")
				return
			}

			// Send the JSON string as a byte slice
			err = c.WriteMessage(websocket.TextMessage, jsonData)
			if err != nil {
				// log.Error("agent", "write:"+err.Error())
				log.Error().Err(err).Msg("Error writing message")
			}
		case "agentInfo":
			// log.Info("agent", "Server interrogating for agent info")
			log.Info().Msg("Server interrogating for agent info")

			agentData := AgentInfo{
				Token:    agent.Token,
				Hostname: getHostName(),
			}

			// Convert to JSON so that it can be encrypted
			agentDataJSON, err := json.Marshal(agentData)
			if err != nil {
				// log.Error("agent", "json.Marshal error:"+err.Error())
				log.Error().Err(err).Msg("json.Marshal error")
				return
			}

			// Encrypt the agentData using trsa.Encrypt with the server's public key
			encryptedData, err := trsa.Encrypt([]byte(agentDataJSON), agent.ServerPublicKey)
			if err != nil {
				// log.Error("agent", "Encryption error: "+err.Error())
				log.Error().Err(err).Msg("Encryption error")
				return
			}

			// Build agent info message
			agentInfo := response{
				Event: "agentInfo",
				Data:  hex.EncodeToString(encryptedData),
			}

			// Convert the agentInfo struct to a JSON string
			jsonData, err := json.Marshal(agentInfo)
			if err != nil {
				// log.Error("agent", "json.Marshal error:"+err.Error())
				log.Error().Err(err).Msg("json.Marshal error")
				return
			}

			// Send the JSON string as a byte slice
			err = c.WriteMessage(websocket.TextMessage, jsonData)
			if err != nil {
				// log.Error("agent", "write:"+err.Error())
				log.Error().Err(err).Msg("Error writing message")
			}
		case "containerList":
			// log.Info("agent", "Server interrogating for container list")
			log.Info().Msg("Server interrogating for container list")

			list := agent.GetContainers()

			// Convert to JSON so that it can be encrypted
			listJSON, err := json.Marshal(list)
			if err != nil {
				// log.Error("agent", "json.Marshal error:"+err.Error())
				log.Error().Err(err).Msg("json.Marshal error")
				return
			}

			// Encrypt the list using trsa.Encrypt with the server's public key
			encryptedData, err := trsa.Encrypt([]byte(listJSON), agent.ServerPublicKey)
			if err != nil {
				// log.Error("agent", "Encryption error: "+err.Error())
				log.Error().Err(err).Msg("Encryption error")
				return
			}

			// Build container list message
			containerList := response{
				Status: "ok",
				Event:  "containerList",
				Data:   hex.EncodeToString(encryptedData),
			}

			// If a message ID is present, add it to the response
			if resp.MessageId != "" {
				containerList.MessageId = resp.MessageId
			}

			// Convert the containerList struct to a JSON string
			jsonData, err := json.Marshal(containerList)
			if err != nil {
				// log.Error("agent", "json.Marshal error:"+err.Error())
				log.Error().Err(err).Msg("json.Marshal error")
				return
			}

			// Send the JSON string as a byte slice
			err = c.WriteMessage(websocket.TextMessage, jsonData)
			if err != nil {
				// log.Error("agent", "write:"+err.Error())
				log.Error().Err(err).Msg("Error writing message")
			}
		case "agentId":
			// log.Info("agent", "Server sending agent id")
			log.Info().Msg("Server sending agent id")

			decryptedJSON, err := decryptAndUnmarshal([]byte(resp.Data.(string)), agent.PrivateKey)
			if err != nil {
				// log.Error("agent", "Error decrypting message: "+err.Error())
				log.Error().Err(err).Msg("Error decrypting message")
				return
			}

			// Access and process the agentId
			agentIdValue, ok := decryptedJSON["agentId"]
			if !ok {
				// log.Error("agent", "Invalid agentId message format")
				log.Error().Msg("Invalid agentId message format")
				return
			}

			// Convert the agentIdValue to int
			agentIdFloat, ok := agentIdValue.(float64) // JSON numbers are float64 by default
			if !ok {
				// log.Error("agent", "Invalid agentId format")
				log.Error().Msg("Invalid agentId format")
				return
			}

			agentId := int(agentIdFloat)
			agent.Id = agentId
		case "monitor":
			// log.Info("agent", "Server requesting monitor")
			log.Info().Msg("Server requesting monitor")

			// Decrypt the message
			decryptedJSON, err := decryptAndUnmarshal([]byte(resp.Data.(string)), agent.PrivateKey)
			if err != nil {
				// log.Error("agent", "Error decrypting message: "+err.Error())
				log.Error().Err(err).Msg("Error decrypting message")
				return
			}

			// Access and process the monitor message
			monitorList, ok := decryptedJSON["monitor"]

			if !ok {
				// log.Error("agent", "Invalid monitor message format")
				log.Error().Msg("Invalid monitor message format")
				return
			}

			// Define a callback function that will be called with new logs.
			onNewLog := func(containerId int, containerName string, logLines []string) {
				fmt.Println("New log received for container:", containerName)
				logData := map[string]interface{}{
					"id":   containerId,
					"name": containerName,
					"logs": logLines,
				}

				// Convert to JSON so that it can be encrypted
				logDataJSON, err := json.Marshal(logData)
				if err != nil {
					// log.Error("agent", "json.Marshal error:"+err.Error())
					log.Error().Err(err).Msg("json.Marshal error")
					return
				}

				// Encrypt the list using trsa.Encrypt with the server's public key
				encryptedData, err := trsa.Encrypt([]byte(logDataJSON), agent.ServerPublicKey)
				if err != nil {
					// log.Error("agent", "Encryption error: "+err.Error())
					log.Error().Err(err).Msg("Encryption error")
					return
				}

				// Build log message
				logMessageData := response{
					Status: "ok",
					Event:  "log",
					Data:   hex.EncodeToString(encryptedData),
				}

				// Convert the logMessageData struct to a JSON string
				jsonData, err := json.Marshal(logMessageData)
				if err != nil {
					// log.Error("agent", "json.Marshal error:"+err.Error())
					log.Error().Err(err).Msg("json.Marshal error")
					return
				}

				// Send the JSON string as a byte slice
				err = c.WriteMessage(websocket.TextMessage, jsonData)
				if err != nil {
					// log.Error("agent", "write:"+err.Error())
					log.Error().Err(err).Msg("Error writing message")
				}

				// TODO: After successful send, we need to bump the lastTimestamp for the monitor to the current of the log
				// This will help us to avoid sending the same log again
			}

			// Initialize the Docker client.
			cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
			if err != nil {
				log.Error().Err(err).Msg("Error creating Docker client")
				return
			}

			// If their are no containers to monitor, we should stop monitoring
			if len(monitorList.([]interface{})) == 0 {
				log.Debug().Msg("No containers to monitor")
				return
			}

			// monitorList is an array of json objects with an id, and container name pattern

			// Start monitoring
			for _, monitorItem := range monitorList.([]interface{}) {
				monitorMap := monitorItem.(map[string]interface{})
				monitorId := int(monitorMap["id"].(float64))
				monitorPattern := monitorMap["pattern"].(string)
				// lastTimestamp := time.Now().Add(-1 * time.Hour) // TODO: We should get it from the server, if we don't we need to support not passing it

				// Create a new Monitor instance.
				log.Debug().Msg("Creating monitor for pattern: " + monitorPattern)
				monitor, err := NewMonitor(monitorId, monitorPattern, onNewLog)
				if err != nil {
					log.Error().Err(err).Msg("Error creating monitor")
					return
				}

				// Adjust the Monitor struct to hold the Docker client.
				monitor.Client = cli

				// Prepare a context and a WaitGroup for managing the lifecycle of the goroutines.
				ctx := context.Background()
				var wg sync.WaitGroup

				// Start monitoring in a non-blocking way. Now `StartMonitoring` needs to accept `lastTimestamp`.
				wg.Add(1) // Increment the WaitGroup counter before starting the goroutine.
				go func() {
					defer wg.Done() // Decrement the WaitGroup counter when the goroutine completes.
					monitor.StartMonitoring(ctx, &wg)
				}()

				// Wait for the monitoring process to complete or be stopped.
				wg.Wait()
			}
		default:
			// log.Warn("agent", "Unknown message event: "+resp.Event)
			log.Warn().Msg("Unknown message event")
		}

	}
}

// Check if the server is healthy
func checkServerHealth(url string) bool {
	resp, err := http.Get(url)
	if err != nil {
		log.Error().Err(err).Msg("Error checking server health")
		return false // return false if unhealthy
	}
	defer resp.Body.Close()

	return resp.StatusCode == http.StatusOK // return true if healthy
}

// Get the hostname of the host
func getHostName() string {
	hostname, err := os.Hostname()
	if err != nil {
		return "unknown"
	}

	return hostname
}

// Check if the server is healthy
func healthchecker(context *cli.Context) error {
	// perform check to ensure the server is healthy and ready to accept connections
	healthcheckAddress := context.String("healthcheck-addr")
	if strings.HasPrefix(healthcheckAddress, ":") {
		healthcheckAddress = "localhost" + healthcheckAddress
	}
	if !checkServerHealth("http://" + healthcheckAddress + "/general/healthcheck") {
		log.Error().Msg("Server is not healthy")
		return nil
	} else {
		log.Info().Msg("Server is healthy")
	}

	return nil
}

// decryptAndUnmarshal takes a hex-encoded encrypted string and a private key,
// decrypts the string, and unmarshals the JSON content into a map.
// It returns the unmarshaled map and any error encountered.
func decryptAndUnmarshal(message, privateKey []byte) (map[string]interface{}, error) {
	// Decode the hex string to a byte slice
	dataBytes, err := hex.DecodeString(string(message))
	if err != nil {
		return nil, fmt.Errorf("Error decoding hex string: %v\n", err)
	}

	// Decrypt the data using trsa.Decrypt
	decryptedData, err := trsa.Decrypt(dataBytes, privateKey)
	if err != nil {
		return nil, fmt.Errorf("Decryption error: %v\n", err)
	}

	// Unmarshal the JSON from the decrypted data
	var decryptedJSON map[string]interface{}
	err = json.Unmarshal(decryptedData, &decryptedJSON)
	if err != nil {
		return nil, fmt.Errorf("Error unmarshaling JSON: %v\n", err)
	}

	// Return the decrypted json
	return decryptedJSON, nil
}
