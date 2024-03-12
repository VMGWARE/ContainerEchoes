---
sidebar_position: 4
---

# Configuring the Agent

## Agent Role and Functionality

The Container Echoes Agent is a critical component of the log management system, capturing logs from Docker containers and forwarding them to the Container Echoes Server. Accurate configuration is key for efficient log collection and transmission.

## Configuration Options

### Setting Up the Agent

```bash
docker run -d \
-e ECHOES_SERVER='http://<server-ip>:<server-port>' \
-e ECHOES_ECHOES_AGENT_SECRET='<agent-secret>' \
-e ECHOES_HOSTNAME='<agent-hostname>' \
-e ECHOES_LOG_LEVEL='debug' \
-v /var/run/docker.sock:/var/run/docker.sock \
--name='container-echoes-agent' \
harbor.vmgware.dev/echoes/agent:latest
```

### Environment-Specific Settings

Customize settings like network configurations, proxy settings, or Docker socket paths based on your environment.

## Agent Environment Variables

Ensure these environment variables are set:

- `ECHOES_SERVER`: The URL of the Container Echoes Server.
- `ECHOES_AGENT_SECRET`: A secret key for secure communication with the server.

## Agent Initialization and Communication

1. **Health Check**: The agent checks the server's health at `/general/healthcheck` before initiating communication.
2. **WebSocket Connection**: Uses WebSocket for real-time communication with the server.
3. **Message Handling**: The agent handles various message types, including `handshake`, `agentInfo`, and `containerList`.
4. **Agent Identification**: The server sends an `agentId` for identification purposes.
5. **Termination Handling**: The agent listens for termination signals and gracefully closes the WebSocket connection.
