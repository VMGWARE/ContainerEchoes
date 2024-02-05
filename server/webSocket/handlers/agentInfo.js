const MessageHandlerBase = require("./messageHandlerBase");
const knex = require("@container-echoes/core/database");
const config = require("@container-echoes/core/config").getInstance();
const rsa = require("trsa");
const log = require("@vmgware/js-logger").getInstance();

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
		super(webSocketManager, "agentInfo");
	}

	/**
	 * Handles the handshake message from the agent.
	 * Decrypts the message data, checks agent validity, and sends a response.
	 * @param {WebSocket} ws - The WebSocket connection instance.
	 * @param {Object} messageObj - The received message object.
	 * @throws {Error} Throws an error if there is an issue decrypting the message data.
	 * @returns {Promise<void>} A Promise that resolves when the handling is complete.
	 */
	async handle(ws, messageObj) {
		messageObj.data = JSON.parse(
			rsa.decrypt(messageObj.data, this.webSocketManager.server.privateKey)
		);

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

		this.webSocketManager.agents[agent.agentId] = ws;

		log.debug("WebSocketManager", `Authenticated agent ${agent.agentId}`);

		// Send the agent's id to the agent
		this.webSocketManager.sendMessage(
			ws,
			this.webSocketManager.buildMessage(
				"ok",
				"agentId",
				{
					agentId: agent.agentId,
				},
				true,
				ws.publicKey
			)
		);

		await this.dispatchMonitorList(ws, agent.agentId);
	}

	/**
	 * Dispatches a list of containers to monitor to the agent.
	 * @param {WebSocket} ws - The WebSocket connection instance.
	 * @param {number} agentId - The agent's id.
	 * @returns {Promise<void>} A Promise that resolves when the handling is complete.
	 */
	async dispatchMonitorList(ws, agentId) {
		// TODO: Then trigger another function to send a list of the containers we want to monitor to the agent
		let containers = await knex("container")
			.where({
				agent: agentId,
			})
			.select("id", "pattern");

		// TODO: Get the last timestamp of the last log entry for each container and send it to the agent
		// So that we don't get a huge amount of logs when we first connect

		let monitorList = [];

		for (let container of containers) {
			monitorList.push({
				id: container.id,
				pattern: container.pattern,
			});
		}

		this.webSocketManager.sendMessage(
			ws,
			this.webSocketManager.buildMessage(
				"ok",
				"monitor",
				{
					monitor: monitorList,
				},
				true,
				ws.publicKey
			)
		);
	}
}

module.exports = HandleHandshake;
