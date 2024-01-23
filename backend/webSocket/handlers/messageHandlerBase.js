class MessageHandlerBase {
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

	getEventType() {
		return this.eventType;
	}

	async handle(ws, messageObj) {
		throw new Error("Method 'handle()' must be implemented.");
	}
}

module.exports = MessageHandlerBase;
