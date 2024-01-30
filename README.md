# ContainerEchoes

<br />
<p align="center">
<a href="https://ci.vmgware.dev/repos/143" title="Build Status">
   <img src="https://ci.vmgware.dev/api/badges/143/status.svg" alt="Build Status">
</a>
<a href="https://github.com/VMGWARE/ContainerEchoes/releases/latest" title="GitHub release">
   <img src="https://img.shields.io/github/v/release/vmgware/containerechoes?sort=semver" alt="GitHub release">
</a>
<a href="https://opensource.org/licenses/Apache-2.0" title="License: Apache-2.0">
   <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License: Apache-2.0">
</a>
</p>

## Description

ContainerEchoes is an open-source tool designed for efficient real-time Docker log management. It streamlines the process of streaming, storing, and analyzing logs from Docker containers. Built with developers in mind, it offers a comprehensive solution for debugging and monitoring containerized applications.

## Features

- **Real-Time Log Streaming**: Capture standard output (stdout) and standard error (stderr) from Docker containers in real-time.
- **Log Storage and Association**: Logs are stored and associated with specific containers, even after the container is deleted.
- **Web Interface and API**: Manage, query, and display logs through a user-friendly web interface and a robust API.
- **Flexible Log Retention**: Automatic log deletion after 48 hours, with options for longer retention.
- **Secure and Scalable**: Implements TLS/SSL for secure data transfer and is designed for scalability.
  
## Docker Image Support

ContainerEchoes provides Docker images for both its agent and server components, ensuring wide compatibility across different systems:

- **Agent Docker Images**: The agent, responsible for log collection, supports a broad range of architectures, including `linux/arm/v6`, `linux/arm/v7`, `linux/arm64/v8`, `linux/386`, `linux/amd64`, `linux/ppc64le`, `linux/riscv64`, `linux/s390x`, `freebsd/arm64`, `freebsd/amd64`, `openbsd/arm64`, and `openbsd/amd64`. This wide support ensures that ContainerEchoes can be deployed in diverse environments, from traditional x86 servers to IoT devices.

- **Server Docker Images**: The server component, which handles log storage, querying, and web interface, provides images for `amd64` and `arm64` architectures. The `arm64` image is available with a specific tag, such as `next-arm64`, to facilitate easy deployment on ARM-based systems.

You can find the latest Docker images on [Docker Hub](https://hub.docker.com/u/vmgware) but also on [Harbor](https://harbor.vmgware.dev/harbor/projects/3/repositories) (VMGWARE's self-hosted registry).

## Technology Stack

1. **Server-Side (API and Web Interface)**

   - Server: Node.js with Express.js
   - Database: PostgreSQL
   - Frontend: Vue.js
   - Authentication: JWT

2. **Agent (Log Collector)**

   - Language: Go or Python
   - Docker SDK integration

3. **Data Transfer**

   - gRPC or WebSockets

4. **Logging Framework**

   - ELK Stack (Elasticsearch, Logstash, Kibana) or similar

5. **DevOps Tools**
   - Docker, Woodpecker CI

## Installation

(Instructions will be provided here)

## Usage

(Instructions will be provided here)

## Contributing

We welcome contributions! Please read our [Contributing Guide](LINK-TO-CONTRIBUTING-GUIDE) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

To update the description of ContainerEchoes to include information about Docker images and their supported architectures, the revised document might look something like this:
