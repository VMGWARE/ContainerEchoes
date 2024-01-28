const fs = require("fs");
const path = require("path");
const log = require("@vmgware/js-logger").getInstance();

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
				try {
					const HandlerClass = require(path.join(handlersPath, file));

					// Only if the file name is not "messageHandlerBase"
					if (HandlerClass.name === "MessageHandlerBase") {
						return;
					}

					// Check if it even exports a class
					if (!HandlerClass.prototype) {
						log.error(
							"ws.loadHandlers",
							`Handler file ${file} does not export a class. This handler will not be available.`
						);
						return;
					}

					const handlerInstance = new HandlerClass(this.webSocketManager);
					const eventType = handlerInstance.getEventType();
					this.handlers[eventType] = handlerInstance.handle.bind(handlerInstance);
				} catch (err) {
					if (err.code === "MODULE_NOT_FOUND") {
						log.error("ws.loadHandlers", `Could not find handler file ${file}`);
					}
					if (err instanceof SyntaxError) {
						log.error(
							"ws.loadHandlers",
							`Syntax error in handler file ${file}: ${err.message}`
						);
					}
					if (err instanceof TypeError) {
						log.error(
							"ws.loadHandlers",
							`Type error in handler file ${file}: ${err.message}`
						);
					} else {
						log.error(
							"ws.loadHandlers",
							`Unknown error in handler file ${file}: ${err.message}`
						);
					}

					log.warn(
						"ws.loadHandlers",
						`Failed to load handler file ${file}. This handler will not be available.`
					);
				}
			} else {
				log.warn(
					"ws.loadHandlers",
					`File ${file} should not be in the handlers directory. This file will be ignored.`
				);
			}
		});

		log.debug("ws.loadHandlers", "Loaded handlers");
	}

	/**
	 * Handles incoming WebSocket messages by delegating them to the appropriate handler based on the event type.
	 * @param {WebSocket} ws - The WebSocket connection instance.
	 * @param {string} message - The raw message received from the WebSocket connection.
	 */
	async handleMessage(ws, message) {
		log.debug("ws.handleMessage", "Received message and delegating to handler");
		const messageObj = JSON.parse(message);

		if (this.handlers[messageObj.event]) {
			await this.handlers[messageObj.event](ws, messageObj);
		} else {
			log.warn(
				"ws.handleMessage",
				`No handler found for event type ${messageObj.event}`
			);
		}
	}
}

module.exports = WebSocketMessageHandler;
