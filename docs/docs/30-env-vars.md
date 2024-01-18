---
sidebar_position: 3
---

# Environment Variables

## Purpose of Environment Variables

Environment variables in Container Echoes are used to configure various aspects of the system, including database connections, log paths, and agent settings.

## List of Environment Variables

### General Variables

- `DB_HOST`: Hostname of the PostgreSQL database.
- `DB_USER`: Database user name.
- `DB_PASS`: Database password.

### Agent Variables

- `AGENT_LOG_PATH`: Path where the agent should store collected logs.
- `SERVER_URL`: URL of the Container Echoes server.

## Setting Environment Variables

Environment variables can be set in a `.env` file or directly in your shell before starting the server or agent.

For example, to set the database host in your shell:

```bash
export DB_HOST=localhost
```

Remember to replace `localhost` with your actual database host.

## Next Steps

With your environment variables configured, you can proceed to [Configuring the Container Echoes Agent](agent-configuration).
```
