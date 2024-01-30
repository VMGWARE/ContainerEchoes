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
		super(webSocketManager, "ping");
	}

	/**
	 * Returns a pong
	 * @param {WebSocket} ws - The WebSocket connection instance.
	 * @param {Object} messageObj - The received message object.
	 * @returns {Promise<void>} A Promise that resolves when the handling is complete.
	 */
	async handle(ws, messageObj) {
		this.webSocketManager.sendMessage(
			ws,
			this.webSocketManager.buildMessage("ok", "pong")
		);
	}
}

module.exports = HandleHandshake;
