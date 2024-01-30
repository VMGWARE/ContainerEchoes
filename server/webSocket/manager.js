const log = require("@vmgware/js-logger").getInstance();
const WebSocket = require("ws");
const rsa = require("trsa");
const WebSocketMessageHandler = require("./messageHandler");

/**
 * Manages WebSocket connections
 */
class WebSocketManager {
	/**
	 * The WebSocketManager instance
	 */
	static instance;

	/**
	 * The WebSocket server
	 */
	wss;

	/**
	 * The public and private keys of the server
	 */
	server = {
		publicKey: "",
		privateKey: "",
	};

	/**
	 * The connected agents
	 */
	agents = [];

	/**
	 * The message resolvers
	 */
	messageResolvers = new Map();

	/**
	 * New WebSocketManager
	 * @param {*} wss - The WebSocket server
	 */
	constructor(wss, serverPublicKey, serverPrivateKey) {
		if (WebSocketManager.instance) {
			throw new Error(
				"Instance already created. Use WebSocketManager.getInstance()"
			);
		}

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

		// Set the static instance
		WebSocketManager.instance = this;
	}

	/**
	 * Static method to get the instance of WebSocketManager
	 * @returns {WebSocketManager} instance of the WebSocketManager
	 */
	static getInstance(wss, serverPublicKey, serverPrivateKey) {
		if (!WebSocketManager.instance) {
			WebSocketManager.instance = new WebSocketManager(
				wss,
				serverPublicKey,
				serverPrivateKey
			);
		}
		return WebSocketManager.instance;
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
	 * @param {string} publicKey - The public key to encrypt the message with
	 * @param {string} messageId - The id of the message
	 * @returns {string} The message to send
	 */
	buildMessage(
		status = "ok",
		event,
		data = {},
		encrypted = true,
		publicKey = "",
		messageId = ""
	) {
		let message = {
			status: status,
			event: event,
			data: data,
		};

		if (messageId) {
			message.messageId = messageId;
		}

		if (encrypted && publicKey) {
			message.data = rsa.encrypt(JSON.stringify(message.data), publicKey);
		}

		return JSON.stringify(message);
	}

	// FIXME: These don't work
	// /**
	//  * Sends a message to all connected clients
	//  * @param {*} type - The type of message
	//  * @param {*} data - The data to send
	//  * @returns {void}
	//  */
	// broadcastMessage(type, data) {
	// 	this.wss.clients.forEach((client) => {
	// 		if (client.readyState === WebSocket.OPEN) {
	// 			this.sendMessage(client, this.buildMessage(type, data));
	// 		}
	// 	});

	// 	log.debug("WebSocketManager", "Sent message to all clients");
	// }

	// /**
	//  * Sends a message to a specific client
	//  * @param {*} id - The id of the client to send the message to
	//  * @param {*} type - The type of message
	//  * @param {*} data - The data to send
	//  * @returns {void}
	//  */
	// sendMessageToClient(id, type, data) {
	// 	this.wss.clients.forEach((client) => {
	// 		if (client.id === id && client.readyState === WebSocket.OPEN) {
	// 			this.sendMessage(client, this.buildMessage(type, data));
	// 		}
	// 	});

	// 	log.debug("WebSocketManager", "Sent message to client " + id);
	// }

	// /**
	//  * Sends a message to all clients except the one specified
	//  * @param {*} id - The id of the client to exclude
	//  * @param {*} type - The type of message
	//  * @param {*} data - The data to send
	//  * @returns {void}
	//  */
	// broadcastMessageExcept(id, type, data) {
	// 	this.wss.clients.forEach((client) => {
	// 		if (client.id !== id && client.readyState === WebSocket.OPEN) {
	// 			this.sendMessage(client, this.buildMessage(type, data));
	// 		}
	// 	});

	// 	log.debug("WebSocketManager", "Sent message to all clients except " + id);
	// }

	/**
	 * Sends a message to a specific client and waits for a response
	 * @param {*} id - The id of the client to send the message to
	 * @param {*} type - The type of message
	 * @param {*} data - The data to send
	 * @returns {Promise<string>} The response from the client
	 */
	async sendMessageAndWaitForResponse(id, type, data) {
		return new Promise((resolve, reject) => {
			const messageId = this.generateUniqueId();
			this.messageResolvers.set(messageId, resolve);

			const agent = this.agents[id];
			if (agent && agent.readyState === WebSocket.OPEN) {
				// Modify your message structure to include messageId
				const message = this.buildMessage(
					"ok",
					type,
					data,
					true,
					agent.publicKey,
					messageId
				);

				this.sendMessage(agent, message);
			} else {
				reject(new Error("Agent not found or not connected"));
			}
		});
	}

	/**
	 * Generates a unique id
	 * @returns {string} The unique id
	 */
	generateUniqueId() {
		return this.wss.getUniqueID();
	}

	/**
	 * Call this method in your message handler when a response is received
	 */
	handleMessageResponse(messageId, messageObj) {
		const resolve = this.messageResolvers.get(messageId);
		if (resolve) {
			resolve(messageObj); // Assuming messageObj contains the response data
			this.messageResolvers.delete(messageId);
		} else {
			log.error(
				"WebSocketManager",
				"No resolver found for message id " + messageId
			);
		}
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
