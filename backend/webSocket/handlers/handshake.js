const MessageHandlerBase = require("./messageHandlerBase");

class HandleHandshake extends MessageHandlerBase {
	constructor(webSocketManager) {
		super(webSocketManager, "handshake");
	}

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
