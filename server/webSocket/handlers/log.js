const MessageHandlerBase = require("./messageHandlerBase");
const rsa = require("trsa");

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
		super(webSocketManager, "log");
	}

	/**
	 * @param {WebSocket} ws - The WebSocket connection instance.
	 * @returns {Promise<void>} A Promise that resolves when the handling is complete.
	 */
	async handle(ws, messageObj) {
		// console.log(messageObj); // Commented out as it dumps a lot of data to the console
	}

	async preprocess(messageObj) {
		messageObj.data = JSON.parse(
			rsa.decrypt(messageObj.data, this.webSocketManager.server.privateKey)
		);

		return messageObj;
	}
}

module.exports = HandleHandshake;
