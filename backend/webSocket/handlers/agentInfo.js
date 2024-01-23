const MessageHandlerBase = require("./messageHandlerBase");
const knex = require("@container-echoes/core/database");
const config = require("@container-echoes/core/config").getInstance();
const rsa = require("trsa");
const log = require("@vmgware/js-logger").getInstance();

class HandleHandshake extends MessageHandlerBase {
	constructor(webSocketManager) {
		super(webSocketManager, "agentInfo");
	}

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
				true
			)
		);
	}
}

module.exports = HandleHandshake;
