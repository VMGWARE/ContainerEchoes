package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"echoes/shared/trsa"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/gorilla/websocket"
)

// Agent represents the client that will communicate with the server
type Agent struct {
	PrivateKey      []byte
	PublicKey       []byte
	Token           string
	ServerPublicKey []byte
	Id              int
	Connection      *websocket.Conn
}

// agentDir is the directory where the agent stores its RSA keys and other files
var agentDir string

// NewAgent creates a new Agent instance
func NewAgent() *Agent {
	return &Agent{}
}

// Initialize sets up the Agent by generating RSA keys
func (a *Agent) Initialize(token string) {
	// if on windows, store the RSA keys in %APPDATA%\Echoes\agent
	if os.Getenv("OS") == "Windows_NT" {
		agentDir = os.Getenv("APPDATA") + "\\Echoes\\agent"
	} else {
		agentDir = "/etc/echoes/agent"
	}

	// Check if the files /etc/echoes/agent/private_key and /etc/echoes/agent/public_key exist
	if _, err := os.Stat(agentDir + "/private_key"); os.IsNotExist(err) {
		// Generate RSA Keys
		publicKey, privateKey, err := trsa.GenerateKeys(2048)
		if err != nil {
			fmt.Println(err)
			return
		}

		Logger.Info(Logger{}, "agent", "Generated RSA keys")

		// Store the RSA keys in /etc/echoes/agent
		err = os.MkdirAll(agentDir, os.ModePerm)
		if err != nil {
			panic(err) // Handle error
		}
		err = os.WriteFile(agentDir+"/private_key", privateKey, 0o644)
		if err != nil {
			panic(err) // Handle error
		}
		err = os.WriteFile(agentDir+"/public_key", publicKey, 0o644)
		if err != nil {
			panic(err) // Handle error
		}

		Logger.Info(Logger{}, "agent", "Stored RSA keys in "+agentDir)

		// Set the agent's public and private keys
		a.PrivateKey = privateKey
		a.PublicKey = publicKey
	} else {
		// Read the private key from the file
		privateKey, err := os.ReadFile(agentDir + "/private_key")
		if err != nil {
			panic(err) // Handle error
		}
		fmt.Println("Private Key:", string(privateKey))
		a.PrivateKey = privateKey

		// Read the public key from the file
		a.PublicKey, err = os.ReadFile(agentDir + "/public_key")
		if err != nil {
			panic(err) // Handle error
		}

		Logger.Info(Logger{}, "agent", "Loaded RSA keys from disk")
	}

	// Set the agent token
	a.Token = token
}

// PerformHandshake performs the E2E encryption handshake with the server
func (a *Agent) PerformHandshake(url string) error {
	Logger.Info(Logger{}, "agent", "Performing handshake with server...")

	// Send agent token and public key to the server as JSON
	jsonData := map[string]string{
		"agent_token": string(a.Token),
		"public_key":  string(a.PublicKey),
	}
	jsonValue, _ := json.Marshal(jsonData)

	response, err := http.Post(url, "application/json", bytes.NewBuffer(jsonValue))
	if err != nil {
		return err // In production, handle this error properly
	}
	defer response.Body.Close()

	// Check if the server responded with an error
	if response.StatusCode != 200 {
		return fmt.Errorf("Handshake with server failed: %s", response.Status)
	}

	// Read the server's public key
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return err // Handle error
	}

	// Here you might store the server's public key for further communication
	// For now, we'll just print it to the console
	Logger.Info(Logger{}, "agent", "Handshake with server successful")
	Logger.Info(Logger{}, "agent", "Server's Public Key: "+string(body))

	return nil
}

// TODO: This would then be sent to the server, to display the possible containers that can be monitored (to help with regex pattern making)
// Get a list of all the containers running on the host (used by the server to display the containers that can be monitored)
func (a *Agent) GetContainers() []types.Container {
	// Create a new docker client
	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		panic(err)
	}

	// List containers
	containers, err := cli.ContainerList(context.Background(), types.ContainerListOptions{})
	if err != nil {
		panic(err)
	}

	// Print the containers (for debugging)
	for _, container := range containers {
		fmt.Printf("%s %s\n", container.ID[:10], container.Image)
	}

	// return containers
	return containers
}

// GetContainerLog gets the logs of a container and returns them as a string
func (a *Agent) GetContainerLog(containerId string) (string, error) {
	// Create a new docker client
	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return "", err
	}

	// Get the container logs
	out, err := cli.ContainerLogs(context.Background(), containerId, types.ContainerLogsOptions{ShowStdout: true, ShowStderr: true})
	if err != nil {
		return "", err
	}
	defer out.Close()

	// Use a buffer to store the logs
	var buf bytes.Buffer
	if _, err := io.Copy(&buf, out); err != nil {
		return "", err
	}

	// Return the logs as a string
	return buf.String(), nil
}
