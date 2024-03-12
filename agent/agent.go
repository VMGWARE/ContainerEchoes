package main

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"os"

	"echoes/shared/trsa"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/gorilla/websocket"
	"github.com/rs/zerolog/log"
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

		log.Info().Msg("Generated RSA keys")

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

		log.Info().Msg("Stored RSA keys in " + agentDir)

		// Set the agent's public and private keys
		a.PrivateKey = privateKey
		a.PublicKey = publicKey
	} else {
		// Read the private key from the file
		privateKey, err := os.ReadFile(agentDir + "/private_key")
		if err != nil {
			panic(err) // Handle error
		}
		a.PrivateKey = privateKey

		// Read the public key from the file
		a.PublicKey, err = os.ReadFile(agentDir + "/public_key")
		if err != nil {
			panic(err) // Handle error
		}

		log.Info().Msg("Loaded RSA keys from disk")
	}

	// Set the agent token
	a.Token = token
}

// TODO: This would then be sent to the server, to display the possible containers that can be monitored (to help with regex pattern making)
// Get a list of all the containers running on the host (used by the server to display the containers that can be monitored)
func (a *Agent) GetContainers() []types.Container {
	// Create a new docker client
	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		panic(err)
	}

	// Negotiate the API version
	cli.NegotiateAPIVersion(context.Background())

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

	// Negotiate the API version
	cli.NegotiateAPIVersion(context.Background())

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
