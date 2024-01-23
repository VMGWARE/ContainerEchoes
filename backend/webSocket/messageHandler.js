const fs = require("fs");
const path = require("path");

class WebSocketMessageHandler {
	constructor(webSocketManager) {
		this.webSocketManager = webSocketManager;
		this.handlers = {};
		this.loadHandlers();
	}

	loadHandlers() {
		const handlersPath = path.join(__dirname, "handlers");
		fs.readdirSync(handlersPath).forEach((file) => {
			if (file.endsWith(".js")) {
				const HandlerClass = require(path.join(handlersPath, file));

				// Only if the file name is not "messageHandlerBase"
				if (HandlerClass.name === "MessageHandlerBase") {
					return;
				}

				const handlerInstance = new HandlerClass(this.webSocketManager);
				const eventType = handlerInstance.getEventType();
				this.handlers[eventType] = handlerInstance.handle.bind(handlerInstance);
			}
		});
	}

	async handleMessage(ws, message) {
		const messageObj = JSON.parse(message);

		if (this.handlers[messageObj.event]) {
			await this.handlers[messageObj.event](ws, messageObj);
		} else {
			console.log(`No handler registered for event: ${messageObj.event}`);
		}
	}
}

module.exports = WebSocketMessageHandler;
