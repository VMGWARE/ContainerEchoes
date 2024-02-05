---
sidebar_position: 3
---

# Environment Variables

## Purpose of Environment Variables

Environment variables in Container Echoes are used to configure various aspects of the system, including database connections, server URLs, authentication mechanisms, and more.

## List of Environment Variables

### General Application Variables

- `APP_PORT`: The port number for the application server.
- `APP_ENV`: The environment in which the app is running, e.g., 'development', 'production'.
- `APP_URL`: The base URL of the application.
- `FRONTEND_URL`: The base URL of the web application.
- `AUTO_ADD_AGENTS`: Automatically integrate new agents with the system.

### Database Variables

- `DB_CLIENT`: Database client (e.g., 'mysql2', 'pg').
- `DB_HOST`: Hostname of the database server.
- `DB_PORT`: Database server port number.
- `DB_NAME`: Name of the database.
- `DB_USER`: Database user name.
- `DB_PASS`: Database password.

### JWT (JSON Web Token) Variables

- `JWT_SECRET`: Secret key used for signing JWTs.

### Sentry Configuration

- `SENTRY_SERVER_DSN`: Sentry DSN for server error tracking.

### Email Configuration

- `EMAIL_HOST`: Host address of the email server.
- `EMAIL_PORT`: Port number on which the email server is running.
- `EMAIL_USER`: Username for email server access.
- `EMAIL_PASS`: Password for email server access.
- `EMAIL_FROM_ADDRESS`: Email address from which all emails will be sent.
- `EMAIL_FROM_NAME`: Name from which all emails will be sent.

### Exceptionless Configuration

- `EXCEPTIONLESS_API_KEY`: API key for Exceptionless.
- `EXCEPTIONLESS_SERVER_URL`: URL of the Exceptionless server.

### Elasticsearch Configuration

- `ELASTICSEARCH_URL`: URL of the Elasticsearch server.
- `ELASTICSEARCH_API_KEY`: API key for Elasticsearch.
- `ELASTICSEARCH_INDEX`: Index name for Elasticsearch.
- `ELASTICSEARCH_CA`: CA for Elasticsearch.

### RSA Configuration

- `RSA_PRIVATE_KEY`: Private key for RSA.
- `RSA_PUBLIC_KEY`: Public key for RSA.

## Setting Environment Variables

Environment variables can be set in a `.env` file or directly in your shell before starting the server or agent.

For example, to set the database host in your shell:

```bash
export DB_HOST=localhost
```

Remember to replace `localhost` with your actual database host.