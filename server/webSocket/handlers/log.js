const MessageHandlerBase = require("./messageHandlerBase");
const rsa = require("trsa");
const knex = require("@container-echoes/core/database");

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
		const containerId = messageObj.data.id;
		const logs = messageObj.data.logs;

		// TODO: Switch from MySQL to PostgreSQL due to needed number of writes

		// TODO: Make helper class for logs:
		// 1. Storing of data (pg or elasticsearch if enabled)
		// 2. Migration of data (from pg to elasticsearch if enabled)
		// 3. Retrieval of data (from pg or elasticsearch if enabled)

		// TODO: Optimize, Optimize, Optimize

		// TODO: Ensure that after the logs are inserted, we let the agent know that we've received the logs and the next latest
		// timestamp we have for the logs so that it can send us the logs from that timestamp onwards

		// Insert the logs into the database
		await knex("log").insert(
			logs.map((log) => {
				return {
					container: containerId,
					// TODO: Add a timestamp to the logs
					// TODO: Extract the log level from the log message if it's present
					message: log,
				};
			})
		);
	}

	async preprocess(messageObj) {
		messageObj.data = JSON.parse(
			rsa.decrypt(messageObj.data, this.webSocketManager.server.privateKey)
		);

		return messageObj;
	}
}

module.exports = HandleHandshake;
