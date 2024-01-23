const fs = require("fs");
const path = require("path");

/**
 * Manages WebSocket message handling by delegating messages to respective handlers.
 */
class WebSocketMessageHandler {
	/**
	 * Constructs a WebSocketMessageHandler instance.
	 * @param {Object} webSocketManager - An instance of the WebSocketManager.
	 */
	constructor(webSocketManager) {
		this.webSocketManager = webSocketManager;
		this.handlers = {};
		this.loadHandlers();
	}

	/**
	 * Dynamically loads all handler classes from the handlers directory and initializes them.
	 * This method assumes that each handler class is named after the event it handles and
	 * extends from the MessageHandlerBase class.
	 */
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

	/**
	 * Handles incoming WebSocket messages by delegating them to the appropriate handler based on the event type.
	 * @param {WebSocket} ws - The WebSocket connection instance.
	 * @param {string} message - The raw message received from the WebSocket connection.
	 */
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
