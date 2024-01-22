package main

import (
	"encoding/json"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	"github.com/urfave/cli/v2"
)

// Array of required environment variables
var requiredEnvVars = []string{
	"AGENT_SERVER_URL",
	"AGENT_SECRET",
}

type response struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
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
	// create a logger
	log := Logger{}

	app := cli.NewApp()
	app.Name = "echoes-agent"
	// app.Version = version.String()
	app.Usage = "echoes agent"
	app.Action = runAgent
	app.Commands = []*cli.Command{
		{
			Name:  "ping",
			Usage: "ping the agent",
			// Action: pinger,
		},
	}
	app.Flags = flags

	if err := app.Run(os.Args); err != nil {
		log.Error("agent", err.Error())
		return
	}
}

func runAgent(context *cli.Context) error {
	startTime := time.Now()

	// create a logger
	log := Logger{}

	// log the agent starting
	log.Info("agent", "Container Echoes Agent starting")

	// load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Error("agent", "Error loading .env file: "+err.Error())
	}

	// Checks to ensure required environment variables are set
	var missingEnvVars bool
	if (len(os.Args) == 2 && os.Args[1] == "init") || len(os.Args) == 1 {
		for _, envVar := range requiredEnvVars {
			if os.Getenv(envVar) == "" {
				log.Error("agent", "Missing required environment variable: "+envVar)
				missingEnvVars = true
			}
		}

		if missingEnvVars {
			log.Warn("agent", "I'm gonna give you a chance to re-check the config, surely you can fix it?")
			return nil
		}
	}

	// perform check to ensure the server is healthy and ready to accept connections
	healthcheckAddress := context.String("healthcheck-addr")
	if strings.HasPrefix(healthcheckAddress, ":") {
		healthcheckAddress = "localhost" + healthcheckAddress
	}
	if !checkServerHealth("http://" + healthcheckAddress + "/general/healthcheck") {
		log.Error("agent", "Server is not healthy")
		return nil
	}

	agent := Agent{}
	// Initialize the agent
	agent.Initialize(os.Getenv("AGENT_SECRET"))

	// Infinite loop replaced with loop that runs for retryDuration
	for {
		if time.Since(startTime) > retryDuration {
			log.Error("agent", "Connection retry time exceeded")
			break
		}

		if connectToServer(&agent, log) {
			handleServerCommunication(&agent, log)
		}

		// Sleep before retrying
		time.Sleep(5 * time.Second)
	}

	return nil
}

// Connect to the server
func connectToServer(agent *Agent, log Logger) bool {
	u := url.URL{Scheme: "ws", Host: "localhost:8080", Path: "/"}

	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Error("agent", "dial: "+err.Error())
		return false
	}

	agent.Connection = c // Assuming you store the connection in the Agent struct
	log.Info("agent", "WebSocket connected")
	return true
}

// Handle communication with the server
func handleServerCommunication(agent *Agent, log Logger) {
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
			log.Error("agent", "Error closing WebSocket connection")
		} else {
			log.Info("agent", "WebSocket connection closed")
		}

		// Exit the program
		os.Exit(0)
	}()

	// Inner loop for continuous message handling
	for {
		// Receive message
		_, message, err := c.ReadMessage()
		if err != nil {
			log.Error("agent", "read:"+err.Error())
			return
		}

		var resp response

		// Parse message
		err = json.Unmarshal(message, &resp)
		if err != nil {
			log.Error("agent", "Error unmarshaling JSON: "+err.Error())
		}

		// Handle message
		switch resp.Type {
		case "handshake":
			log.Info("agent", "Server performing handshake")

			// Check if resp.Data is a map and contains "publicKey" key
			data, ok := resp.Data.(map[string]interface{})
			if !ok {
				log.Error("agent", "Invalid handshake message format")
				// Handle the error appropriately, e.g., return or log
				return
			}

			publicKeyValue, ok := data["publicKey"].(string)
			if !ok {
				log.Error("agent", "Invalid publicKey format")
				// Handle the error appropriately, e.g., return or log
				return
			}

			// Convert the publicKeyValue string to []byte
			publicKeyBytes := []byte(publicKeyValue)

			// Now you can use publicKeyBytes as []byte
			agent.ServerPublicKey = publicKeyBytes

			// Build handshake message
			handshakeData := response{
				Type: "handshake",
				Data: struct {
					PublicKey string `json:"publicKey"`
				}{
					PublicKey: string(agent.PublicKey),
				},
			}

			// Convert the handshakeData struct to a JSON string
			jsonData, err := json.Marshal(handshakeData)
			if err != nil {
				log.Error("agent", "json.Marshal error:"+err.Error())
				return
			}

			// Send the JSON string as a byte slice
			err = c.WriteMessage(websocket.TextMessage, jsonData)
			if err != nil {
				log.Error("agent", "write:"+err.Error())
			}
		case "agentInfo":
			log.Info("agent", "Server interrogating for agent info")

			agentData := AgentInfo{
				Token:    agent.Token,
				Hostname: getHostName(),
			}

			// Build agent info message
			agentInfo := response{
				Type: "agentInfo",
				Data: agentData,
			}

			// Convert the agentInfo struct to a JSON string
			jsonData, err := json.Marshal(agentInfo)
			if err != nil {
				log.Error("agent", "json.Marshal error:"+err.Error())
				return
			}

			// Send the JSON string as a byte slice
			err = c.WriteMessage(websocket.TextMessage, jsonData)
			if err != nil {
				log.Error("agent", "write:"+err.Error())
			}
		case "containerList":
			log.Info("agent", "Server interrogating for container list")

			list := agent.GetContainers()

			// Build container list message
			containerList := response{
				Type: "containerList",
				Data: list,
			}

			// Convert the containerList struct to a JSON string
			jsonData, err := json.Marshal(containerList)
			if err != nil {
				log.Error("agent", "json.Marshal error:"+err.Error())
				return
			}

			// Send the JSON string as a byte slice
			err = c.WriteMessage(websocket.TextMessage, jsonData)
			if err != nil {
				log.Error("agent", "write:"+err.Error())
			}
		case "agentId":
			log.Info("agent", "Server sending agent id")

			// Check if resp.Data is a map and contains "agentId" key
			data, ok := resp.Data.(map[string]interface{})
			if !ok {
				log.Error("agent", "Invalid agentId message format")
				// Handle the error appropriately, e.g., return or log
				return
			}

			// Convert the agentIdValue string to int
			agentIdFloat, ok := data["agentId"].(float64)
			if !ok {
				log.Error("agent", "Invalid agentId format")
				// Handle the error appropriately, e.g., return or log
				return
			}

			agentId := int(agentIdFloat) // Convert to int if needed
			agent.Id = agentId
		default:
			log.Warn("agent", "Unknown message type: "+resp.Type)
		}

	}
}

// Check if the server is healthy
func checkServerHealth(url string) bool {
	resp, err := http.Get(url)
	if err != nil {
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
