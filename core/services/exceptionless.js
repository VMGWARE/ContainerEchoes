/**
 * Service for managing the Exceptionless client
 * @module core/services/exceptionless
 */
class ExceptionlessManager {
  constructor() {
    this.Exceptionless = null;
  }

  /**
   * Initialize the Exceptionless client
   * @param {*} apiKey - The API key for the Exceptionless project
   * @param {*} serverUrl - The URL of the Exceptionless server
   * @param {*} version - The version of the application
   */
  async initialize(apiKey, serverUrl, version = "") {
    if (!this.Exceptionless) {
      const { Exceptionless } = await import("@exceptionless/node");

      if (serverUrl && serverUrl.endsWith("/")) {
        serverUrl = serverUrl.substring(0, serverUrl.length - 1);
      }

      await Exceptionless.startup((c) => {
        c.apiKey = apiKey;
        c.serverUrl = serverUrl;
        c.version = version;
      });

      this.Exceptionless = Exceptionless;
    }
  }

  /**
   * Get the Exceptionless client instance
   */
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
