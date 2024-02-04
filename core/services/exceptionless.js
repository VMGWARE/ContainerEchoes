class ExceptionlessManager {
  constructor() {
    this.Exceptionless = null;
  }

  async initialize(apiKey, serverUrl) {
    if (!this.Exceptionless) {
      const { Exceptionless } = await import("@exceptionless/node");

      if (serverUrl && serverUrl.endsWith("/")) {
        serverUrl = serverUrl.substring(0, serverUrl.length - 1);
      }

      await Exceptionless.startup((c) => {
        c.apiKey = apiKey;
        c.serverUrl = serverUrl;
      });

      this.Exceptionless = Exceptionless;
    }
  }

  getInstance() {
    if (!this.Exceptionless) {
      throw new Error("Exceptionless has not been initialized yet.");
    }
    return this.Exceptionless;
  }
}

// Export a singleton instance
const exceptionlessManager = new ExceptionlessManager();
module.exports = exceptionlessManager;
