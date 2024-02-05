---
sidebar_position: 1
---

# Getting Started

## Introduction

This guide will help you get started with the development of the project. It will guide you through the process of setting up the development environment, running the project, and contributing to the project.

## Project Overview

The project is a container logging application that allows users to monitor and log the activities of their containers, and is meant to be similar to PaperTrail but for docker containers. It consists of a server, a web application, an agent, and a core package.

For communication between the server and the agent, we use WebSockets. The agent is responsible for collecting container logs and sending them to the server via WebSockets. Hopefully, in the future, we can add more features to the agent like monitoring container stats and sending them to the server along with migrating from WebSockets to gRPC for better performance in regards to sending logs and stats to the server.

## Project Structure

The project is divided into two main parts:

1. **server**: The server is a Node.js application that serves as the backend for the project. It is responsible for handling the API requests and communicating with the database.

2. **web**: The web application is a React application that serves as the frontend for the project. It is responsible for rendering the user interface and communicating with the server.

3. **agent**: The agent is a Golang application that is responsible for collecting container logs and sending them to the server.

4. **core**: The core is a Node.js package that contains the database migrations and other important code. This allows for things like adding in like dedicated cron job runners, and other things that may be needed in the future (mainly for sharing code to different parts of the project like a cron job runner to seperate long running processes from the main server).

## Prerequisites

Before you start, you need to have the following tools installed on your machine:

- [Node.js v18+](https://nodejs.org/en/download/)
- [NPM v10+](https://www.npmjs.com/get-npm)
- [Golang v1.21+](https://golang.org/dl/)
- [Docker v20+](https://www.docker.com/products/docker-desktop)
- [Make v4+](https://www.gnu.org/software/make/)

## Setting up the Development Environment

To set up the development environment, follow these steps:

1. Clone the repository:

   ```bash
   gh clone VMGWARE/ContainerEchoes
   ```

2. Navigate to the project directory:

   ```bash
    cd ContainerEchoes
    ```

3. Install the project dependencies:

    ```bash
    make dependencies
    ```

4. Start the project:

    In two separate terminals, run the following commands from the project directory:

    ```bash
    make run-server
    ```

    ```bash
    make run-web
    ```

5. Open your browser and go to `http://localhost:3000` for the web application and `http://localhost:5000` for the server.

## Contributing

To contribute to the project, follow these steps:

1. Fork the project repository.
2. Create a new branch: `git checkout -b feature-name`.
3. Make your changes and commit them: `git commit -m 'feature-name'`.
4. Push to the branch: `git push origin feature-name`.
5. Submit a pull request.
6. After your pull request is reviewed and merged, you can safely delete your branch.
7. Make sure to pull the latest changes from the original repository before making a pull request.
