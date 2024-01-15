package main

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
)

// Agent represents the client that will communicate with the server
type Agent struct {
	PrivateKey *rsa.PrivateKey
	PublicKey  []byte
	Token      string
}

// agentDir is the directory where the agent stores its RSA keys and other files
var agentDir string

// NewAgent creates a new Agent instance
func NewAgent() *Agent {
	return &Agent{}
}

// Initialize sets up the Agent by generating RSA keys
func (a *Agent) Initialize() {
	// TODO: Only allow 1 agent per server

	// if on windows, store the RSA keys in %APPDATA%\Echoes\agent
	if os.Getenv("OS") == "Windows_NT" {
		agentDir = os.Getenv("APPDATA") + "\\Echoes\\agent"
	} else {
		agentDir = "/etc/echoes/agent"
	}

	// Check if the files /etc/echoes/agent/private_key and /etc/echoes/agent/public_key exist
	if _, err := os.Stat(agentDir + "/private_key"); os.IsNotExist(err) {
		// Generate RSA Keys
		var err error
		a.PrivateKey, err = rsa.GenerateKey(rand.Reader, 2048)
		if err != nil {
			panic(err) // In production, handle this error properly
		}

		// Extract the public key
		pubKeyBytes, err := x509.MarshalPKIXPublicKey(&a.PrivateKey.PublicKey)
		if err != nil {
			panic(err) // Handle error
		}
		a.PublicKey = pem.EncodeToMemory(&pem.Block{
			Type:  "RSA PUBLIC KEY",
			Bytes: pubKeyBytes,
		})

		Logger.Info(Logger{}, "agent", "Generated RSA keys")

		// Store the RSA keys in /etc/echoes/agent
		os.MkdirAll(agentDir, os.ModePerm)
		os.WriteFile(agentDir+"/private_key", x509.MarshalPKCS1PrivateKey(a.PrivateKey), 0644)
		os.WriteFile(agentDir+"/public_key", a.PublicKey, 0644)

		Logger.Info(Logger{}, "agent", "Stored RSA keys in "+agentDir)
	} else {
		// Read the private key from the file
		privateKeyBytes, err := os.ReadFile(agentDir + "/private_key")
		if err != nil {
			panic(err) // Handle error
		}

		// Decode the private key
		a.PrivateKey, err = x509.ParsePKCS1PrivateKey(privateKeyBytes)
		if err != nil {
			panic(err) // Handle error
		}

		// Read the public key from the file
		a.PublicKey, err = os.ReadFile(agentDir + "/public_key")
		if err != nil {
			panic(err) // Handle error
		}

		Logger.Info(Logger{}, "agent", "Loaded RSA keys from disk")
	}
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
