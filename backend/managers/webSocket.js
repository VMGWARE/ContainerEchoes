const log = require("@vmgware/js-logger");
const WebSocket = require("ws");
const forge = require("node-forge");
const knex = require("@container-echoes/core/database");
const config = require("@container-echoes/core/config");
const { hostname } = require("os");

/**
 * Manages WebSocket connections
 */
class WebSocketManager {
	/**
	 * The WebSocket server
	 */
	wss;

	/**
	 * The public key of the agent
	 */
	publicKey;

	/**
	 * The public and private keys of the server
	 */
	server = {
		publicKey: "",
		privateKey: "",
	};

	/**
	 * New WebSocketManager
	 * @param {*} wss - The WebSocket server
	 */
	constructor(wss, serverPublicKey, serverPrivateKey) {
		this.wss = wss;
		this.server.publicKey = serverPublicKey;
		this.server.privateKey = serverPrivateKey;

		this.wss.getUniqueID = function () {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000)
					.toString(16)
					.substring(1);
			}
			return s4() + s4() + "-" + s4();
		};

		this.wss.on("connection", (ws) => {
			log.debug("WebSocketManager", "New WebSocket connection");

			// https://stackoverflow.com/questions/13364243/websocketserver-node-js-how-to-differentiate-clients

			// TODO: The public key should be retrieved from the database

			// TODO: Perform handshake with the agent (send the public key, receive the agent's public key)
			this.sendMessage(
				ws,
				this.buildMessage("handshake", {
					publicKey: this.server.publicKey,
				})
			);

			// TODO: Get the agents info

			// TODO: Check if the agent is valid (if flag to auto add is set, add the agent to the database

			// Ask for the agent info
			this.sendMessage(ws, this.buildMessage("agentInfo"));

			// Handle incoming messages
			ws.on("message", async (message) => {
				await this.handleMessage(ws, message);
			});
		});

		this.wss.on("error", (error) => {
			log.error("WebSocketManager", "WebSocket error: " + error.message);
		});

		this.wss.on("close", () => {
			log.debug("WebSocketManager", "WebSocket closed");
		});
	}

	/**
	 * Handles incoming messages
	 * @param {*} ws - The WebSocket connection
	 * @param {*} message - The message
	 * @returns {void}
	 */
	async handleMessage(ws, message) {
		// Handle incoming messages
		log.debug("WebSocketManager", "Received message: " + message);
		// Your custom message handling logic goes here

		const messageObj = JSON.parse(message);

		if (messageObj.type === "handshake") {
			// Store the agent's public key
			ws.publicKey = messageObj.data.publicKey;
			this.publicKey = messageObj.data.publicKey;
		}
		if (messageObj.type === "agentInfo") {
			let token = messageObj.data.token;
			let hostname = messageObj.data.hostname;

			// Check if the agent is valid
			let agent = await knex("agent")
				.where({
					token: token,
				})
				.first();

			if (!agent) {
				if (config.app.autoAddAgents) {
					log.debug(
						"WebSocketManager",
						"Agent is not valid, but auto add is enabled"
					);

					// Add the agent to the database
					await knex("agent").insert({
						token: token,
						publickey: ws.publicKey,
						hostname: hostname,
					});

					// Get the agent's info
					agent = await knex("agent")
						.where({
							token: token,
						})
						.first();
				} else {
					log.debug("WebSocketManager", "Agent is not valid");
					ws.close();
				}
			}

			// Store the agent's id
			ws.id = agent.agentId;

			log.debug("WebSocketManager", `Authenticated agent ${agent.agentId}`);

			// Send the agent's id to the agent
			this.sendMessage(
				ws,
				this.buildMessage("agentId", {
					agentId: agent.agentId,
				})
			);
		}
	}

	/**
	 * Sends a message to the client
	 * @param {*} ws - The WebSocket connection
	 * @param {*} message - The message
	 * @returns {void}
	 */
	sendMessage(ws, message) {
		try {
			ws.send(message);
		} catch (error) {
			log.error("WebSocketManager", "Error sending message: " + error.message);
		}
	}

	/**
	 * Builds a message to send to the client
	 * @param {*} type - The type of message
	 * @param {*} data - The data to send
	 * @returns {string} The message to send
	 */
	buildMessage(type, data) {
		return JSON.stringify({
			type: type,
			data: data,
		});
	}

	/**
	 * Sends a message to all connected clients
	 * @param {*} type - The type of message
	 * @param {*} data - The data to send
	 * @returns {void}
	 */
	broadcastMessage(type, data) {
		this.wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				this.sendMessage(client, this.buildMessage(type, data));
			}
		});

		log.debug("WebSocketManager", "Sent message to all clients");
	}

	/**
	 * Sends a message to a specific client
	 * @param {*} id - The id of the client to send the message to
	 * @param {*} type - The type of message
	 * @param {*} data - The data to send
	 * @returns {void}
	 */
	sendMessageToClient(id, type, data) {
		this.wss.clients.forEach((client) => {
			if (client.id === id && client.readyState === WebSocket.OPEN) {
				this.sendMessage(client, this.buildMessage(type, data));
			}
		});

		log.debug("WebSocketManager", "Sent message to client " + id);
	}

	/**
	 * Sends a message to all clients except the one specified
	 * @param {*} id - The id of the client to exclude
	 * @param {*} type - The type of message
	 * @param {*} data - The data to send
	 * @returns {void}
	 */
	broadcastMessageExcept(id, type, data) {
		this.wss.clients.forEach((client) => {
			if (client.id !== id && client.readyState === WebSocket.OPEN) {
				this.sendMessage(client, this.buildMessage(type, data));
			}
		});

		log.debug("WebSocketManager", "Sent message to all clients except " + id);
	}

	/**
	 * Encrypts a message using RSA encryption with the provided public key
	 * @param {string} message - The message to encrypt
	 * @param {string} publicKey - The RSA public key in PEM format
	 * @returns {string} The encrypted message in hexadecimal format
	 */
	encryptMessageWithRSA(message, publicKey) {
		const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
		const encryptedMessage = publicKeyObj.encrypt(message, "RSA-OAEP", {
			md: forge.md.sha256.create(),
			mgf1: {
				md: forge.md.sha1.create(),
			},
		});

		// Convert the encrypted message to hexadecimal format
		return forge.util.bytesToHex(encryptedMessage);
	}

	/**
	 * Sends a message to a specific client and waits for a response
	 * @param {*} id - The id of the client to send the message to
	 * @param {*} type - The type of message
	 * @param {*} data - The data to send
	 * @returns {Promise<string>} The response from the client
	 */
	async sendMessageAndWaitForResponse(id, type, data) {
		// TODO: Test this
		return new Promise((resolve) => {
			this.wss.clients.forEach((client) => {
				if (client.id === id && client.readyState === WebSocket.OPEN) {
					this.sendMessage(client, this.buildMessage(type, data));

					client.on("message", (message) => {
						resolve(message);
					});
				}
			});
		});
	}
}

module.exports = WebSocketManager;
