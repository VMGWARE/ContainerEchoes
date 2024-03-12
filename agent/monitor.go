package main

import (
	"bufio"
	"context"
	"regexp"
	"sync"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/rs/zerolog/log"
)

// LogCallback defines the signature for the callback function to be invoked with new log messages
type LogCallback func(containerId int, containerName string, logLines []string)

// Monitor holds data for monitoring container logs
type Monitor struct {
	ID           int
	RegexPattern *regexp.Regexp
	Client       *client.Client
	OnNewLog     LogCallback // Callback function to be invoked when new logs are received
}

type Container struct {
	ID      string
	Pattern string
}

// NewMonitor creates a new log monitor with the given regex pattern for container names and a log callback function
func NewMonitor(id int, pattern string, onNewLog LogCallback) (*Monitor, error) {
	regex, err := regexp.Compile(pattern)
	if err != nil {
		return nil, err
	}
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}
	return &Monitor{ID: id, RegexPattern: regex, Client: cli, OnNewLog: onNewLog}, nil
}

// StartMonitoring starts log monitoring for all containers matching the regex pattern in a non-blocking way
func (m *Monitor) StartMonitoring(ctx context.Context, wg *sync.WaitGroup) {
	go func() {
		defer wg.Done()

		containers, err := m.Client.ContainerList(ctx, types.ContainerListOptions{})
		if err != nil {
			// fmt.Printf("Error fetching container list: %v\n", err)
			log.Error().Err(err).Msg("Error fetching container list")
			return
		}

		for _, container := range containers {
			if m.RegexPattern.MatchString(container.Names[0]) {
				log.Info().Str("container", container.Names[0]).Msg("Monitoring logs for container")
				wg.Add(1)
				go m.monitorContainerLogs(ctx, container.ID, container.Names[0], wg)
			} else {
				log.Debug().Str("container", container.Names[0]).Msg("Skipping container")
			}
		}
	}()
}

// monitorContainerLogs streams and processes logs for a single container in a non-blocking way
func (m *Monitor) monitorContainerLogs(ctx context.Context, containerID, containerName string, wg *sync.WaitGroup) {
	defer wg.Done()

	options := types.ContainerLogsOptions{ShowStdout: true, ShowStderr: true, Follow: true, Tail: "all"}
	logStream, err := m.Client.ContainerLogs(ctx, containerID, options)
	if err != nil {
		log.Error().Str("container", containerName).Err(err).Msg("Error getting logs for container")
		return
	}
	defer logStream.Close()

	const chunkSize = 1500
	logLines := make([]string, 0, chunkSize)

	scanner := bufio.NewScanner(logStream)
	for scanner.Scan() {
		logLine := scanner.Text()
		logLines = append(logLines, logLine)

		// When we've collected chunkSize logs, call the callback with the chunk
		if len(logLines) >= chunkSize {
			if m.OnNewLog != nil {
				m.OnNewLog(m.ID, containerName, logLines)
			}
			logLines = make([]string, 0, chunkSize) // Reset the slice
		}
	}

	// Call the callback with any remaining logs if there are any
	if len(logLines) > 0 && m.OnNewLog != nil {
		m.OnNewLog(m.ID, containerName, logLines)
	}

	if err := scanner.Err(); err != nil {
		log.Error().Str("container", containerName).Err(err).Msg("Error scanning log stream")
	}
}
