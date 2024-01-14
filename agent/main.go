package main

import (
	"bytes"
	"context"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
)

func main() {
	logger := Logger{}

	logger.Info("Main", "Application is starting")
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}

	containerID := "ef06b44b236a67d71d164a637c9a8f28d6aaf9ba3e17e8f9b404e42e1762932a" // Replace with your container ID
	logsOptions := types.ContainerLogsOptions{ShowStdout: true, ShowStderr: true, Follow: false}

	logger.Info("Main", "Getting logs from container "+containerID)

	logs, err := cli.ContainerLogs(context.Background(), containerID, logsOptions)
	if err != nil {
		panic(err)
	}
	logger.Info("Main", "Logs received from container "+containerID)
	defer logs.Close()

	// Read logs
	buf, err := ioutil.ReadAll(logs)
	if err != nil {
		panic(err)
	}
	logger.Info("Main", "Sending logs to API")

	// Log to console
	fmt.Println(string(buf))

	// Define API endpoint
	apiURL := "http://yourapi.com/logs" // Replace with your API URL

	// Create a new request
	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(buf))
	if err != nil {
		panic(err)
	}
	req.Header.Set("Content-Type", "application/json")

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	// Read the response
	body, _ := ioutil.ReadAll(resp.Body)
	fmt.Println("Response Body:", string(body))
}
