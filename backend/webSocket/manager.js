const log = require("@vmgware/js-logger").getInstance();
const WebSocket = require("ws");
const rsa = require("trsa");
const WebSocketMessageHandler = require("./messageHandler");

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

		this.messageHandler = new WebSocketMessageHandler(this);

		this.wss.on("connection", (ws) => {
			log.debug("WebSocketManager", "New WebSocket connection");

			// Send the initial handshake message
			this.sendMessage(
				ws,
				this.buildMessage(
					"ok",
					"handshake",
					{
						publicKey: this.server.publicKey,
					},
					false
				)
			);

			// Handle incoming messages
			ws.on("message", async (message) => {
				await this.messageHandler.handleMessage(ws, message);
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
	 * @param {*} status - The status of the message
	 * @param {*} event - The event of the message
	 * @param {*} data - The data to send
	 * @param {boolean} encrypted - Whether or not the message should be encrypted
	 * @returns {string} The message to send
	 */
	buildMessage(status = "ok", event, data = {}, encrypted = true) {
		let message = {
			status: status,
			event: event,
			data: data,
		};

		if (encrypted) {
			message.data = rsa.encrypt(JSON.stringify(message.data), this.publicKey);
		}

		return JSON.stringify(message);
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

	/**
	 * Closes the WebSocket server
	 * @returns {void}
	 */
	static close() {
		this.wss.close();
	}
}

module.exports = WebSocketManager;
