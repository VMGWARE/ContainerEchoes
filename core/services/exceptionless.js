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

  // TODO: Add a method disable/enabled the Exceptionless client

  /**
   * Update the Exceptionless client with the latest settings
   * @param {*} apiKey - The API key for the Exceptionless project
   * @param {*} serverUrl - The URL of the Exceptionless server
   */
  async updateClient(apiKey, serverUrl) {
    if (!this.Exceptionless) {
      throw new Error("Exceptionless has not been initialized yet.");
    }

    // If serverUrl or apiKey are not provided, use the existing values
    if (!apiKey) {
      apiKey = this.Exceptionless.config.apiKey;
    }
    if (!serverUrl) {
      serverUrl = this.Exceptionless.config.serverUrl;
    }

    // Update the client
    const instance = this.getInstance();
    instance.config.apiKey = apiKey;
    instance.config.serverUrl = serverUrl;
  }
}

// Export a singleton instance
const exceptionlessManager = new ExceptionlessManager();
module.exports = exceptionlessManager;
