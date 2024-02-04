let Exceptionless;

async function initializeExceptionless(apiKey, serverUrl) {
  if (!Exceptionless) {
    Exceptionless = (await import("@exceptionless/node")).Exceptionless;

    // Cut off the trailing slash if it exists
    if (serverUrl && serverUrl.endsWith("/")) {
      serverUrl = serverUrl.substring(0, serverUrl.length - 1);
    }

    await Exceptionless.startup((c) => {
      c.apiKey = apiKey;
      c.serverUrl = serverUrl;
    });
  }

  return Exceptionless;
}

module.exports = initializeExceptionless;
