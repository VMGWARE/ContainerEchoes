const MessageHandlerBase = require("./messageHandlerBase");

/**
 * Represents a handler for the handshake process with agents.
 * @extends MessageHandlerBase
 */
class HandleHandshake extends MessageHandlerBase {
	/**
	 * Creates an instance of HandleHandshake.
	 * @param {WebSocketManager} webSocketManager - The WebSocket manager instance.
	 */
	constructor(webSocketManager) {
		super(webSocketManager, "handshake");
	}

	/**
	 * Handles the handshake message from the agent.
	 * Updates the public key information and sends a response.
	 * @param {WebSocket} ws - The WebSocket connection instance.
	 * @param {Object} messageObj - The received message object.
	 * @returns {Promise<void>} A Promise that resolves when the handling is complete.
	 */
	async handle(ws, messageObj) {
		ws.publicKey = messageObj.data.publicKey;
		this.webSocketManager.publicKey = messageObj.data.publicKey;
		this.webSocketManager.sendMessage(
			ws,
			this.webSocketManager.buildMessage("ok", "agentInfo")
		);
	}
}

module.exports = HandleHandshake;
