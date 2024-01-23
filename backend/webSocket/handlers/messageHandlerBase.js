/**
 * Abstract base class for message handlers in a WebSocket context.
 */
class MessageHandlerBase {
	/**
	 * Constructs an instance of a message handler.
	 * @param {Object} webSocketManager - The WebSocketManager instance for managing WebSocket connections.
	 * @param {string} eventType - The event type that this handler will manage.
	 * @throws {Error} If attempted to instantiate directly or without an eventType.
	 */
	constructor(webSocketManager, eventType) {
		if (new.target === MessageHandlerBase) {
			throw new Error(
				"Abstract class 'MessageHandlerBase' cannot be instantiated directly."
			);
		}

		if (!eventType) {
			throw new Error("Event type must be provided");
		}

		this.webSocketManager = webSocketManager;
		this.eventType = eventType;
	}

	/**
	 * Gets the event type that this handler is responsible for.
	 * @returns {string} The event type.
	 */
	getEventType() {
		return this.eventType;
	}

	/**
	 * Abstract method for handling a message. This method should be implemented by subclasses.
	 * @param {WebSocket} ws - The WebSocket connection instance.
	 * @param {Object} messageObj - The message object received from the WebSocket.
	 * @throws {Error} If this method is not implemented by the subclass.
	 */
	async handle(ws, messageObj) {
		throw new Error("Method 'handle()' must be implemented.");
	}
}

module.exports = MessageHandlerBase;
