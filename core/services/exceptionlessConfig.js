// Load environment variables
const config = require("../config").getInstance();

let Exceptionless;

async function initializeExceptionless() {
  if (!Exceptionless) {
    Exceptionless = (await import("@exceptionless/node")).Exceptionless;

    await Exceptionless.startup((c) => {
      c.apiKey = config.exceptionless.apiKey;
      c.serverUrl = config.exceptionless.serverUrl;
    });
  }
  return Exceptionless;
}

module.exports = initializeExceptionless;
