---
sidebar_position: 4
---

# Configuring the Agent

## Agent Role and Functionality

The Container Echoes Agent is a critical component of the log management system, capturing logs from Docker containers and forwarding them to the Container Echoes Server. Accurate configuration is key for efficient log collection and transmission.

## Configuration Options

### Setting Up the Agent

1. **Installation**: Deploy the agent as a Docker container on each host using the provided Docker image.

### Environment-Specific Settings

Customize settings like network configurations, proxy settings, or Docker socket paths based on your environment.

## Agent Environment Variables

Ensure these environment variables are set:

- `AGENT_SERVER_URL`: The URL of the Container Echoes Server.
- `AGENT_SECRET`: A secret key for secure communication with the server.

## Best Practices

- **Resource Allocation**: Allocate sufficient resources (CPU and memory) to the agent.
- **Security**: Ensure encrypted and authenticated traffic if the agent communicates over the network.
- **Log Rotation**: Implement log rotation to prevent disk space issues.

## Agent Initialization and Communication

1. **Health Check**: The agent checks the server's health at `/general/healthcheck` before initiating communication.
2. **WebSocket Connection**: Uses WebSocket for real-time communication with the server.
3. **Message Handling**: The agent handles various message types, including `handshake`, `agentInfo`, and `containerList`.
4. **Agent Identification**: The server sends an `agentId` for identification purposes.
5. **Termination Handling**: The agent listens for termination signals and gracefully closes the WebSocket connection.

## Testing and Verification

- Run a test container to generate logs and verify their appearance in the Container Echoes Server interface.

## Troubleshooting

- Check the agent's logs for error messages.
- Common issues: network connectivity, configuration errors, resource constraints.