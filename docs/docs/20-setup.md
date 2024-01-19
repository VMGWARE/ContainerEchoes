---
sidebar_position: 2
---

# Setting Up

## Prerequisites

Before installing Container Echoes, ensure you have the following:

- Docker installed and running
- Node.js (version 18 or later)
- MySQL or MariaDB database

## Installation Steps

### Server Setup

1. Clone the Container Echoes repository.
2. Navigate to the backend directory.
3. Run `npm install` to install dependencies.
4. Configure the database connection in the `.env` file.
5. Start the server using `npm start`.

### Agent Setup

1. On each Docker host, pull the Container Echoes agent image from the Docker registry.
2. Run the agent container with the appropriate environment variables set.
3. Verify connectivity with the server.

## Initial Configuration

- Set environment variables as per your setup requirements (see [Environment Variables](30-env-vars.md)).
- Configure log paths and retention policies through the web interface.

## Next Steps

With Container Echoes installed, the next step is to configure your environment variables as detailed in [Environment Variables](env-vars).
