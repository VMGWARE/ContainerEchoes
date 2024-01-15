package main

import (
	"net/http"
	"os"
)

// Array of required environment variables
var requiredEnvVars = []string{
	"AGENT_SERVER_URL",
	"AGENT_SECRET",
}

func main() {
	// create a logger
	log := Logger{}

	// log the agent starting
	log.Info("agent", "Container Echoes Agent starting")

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
			return
		}
	}

	// perform check to ensure the server is healthy and ready to accept connections
	if !checkServerHealth(os.Getenv("AGENT_SERVER_URL") + "/health") {
		log.Error("agent", "Server is not healthy")
		return
	}

	agent := Agent{}
	// Initialize the agent
	agent.Initialize()

	// Perform E2E Encryption Handshake
	agent.PerformHandshake(os.Getenv("AGENT_SERVER_URL") + "/handshake")

	// if the agent is being initialized, send the agent token to the server
	// once authenticated, the server will send a public key to encrypt traffic with
	// the agent will then send a public key to the server to encrypt traffic with the agent

	// After the handshake, the agent will begin polling the server for containers to monitor

	// if the server returns or changes the needed container name, add it to the list of containers to monitor

	// watch for new containers, and check if they are needed

	// watch for container logs, and send them to the server if they are needed

}

func checkServerHealth(url string) bool {
	resp, err := http.Get(url)
	if err != nil {
		return false // return false if unhealthy
	}
	defer resp.Body.Close()

	return resp.StatusCode == http.StatusOK // return true if healthy
}
