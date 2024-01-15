// Packages
const Sentry = require("@sentry/node");
const express = require("express");

const helmet = require("helmet");
const swaggerJsdoc = require("swagger-jsdoc");
const { getVersion } = require("./utils/general");
const { apiReference } = require("@scalar/express-api-reference");
const log = require("@vmgware/js-logger");
const gracefulShutdown = require("http-graceful-shutdown");
const knex = require("@container-echoes/core/database");
const limiter = require("./middleware/rateLimit");
const config = require("@container-echoes/core/config");

// Load environment variables
require("dotenv").config();

// Initialize Exceptionless
let Exceptionless;
const initializeExceptionless = require("@container-echoes/core/services/exceptionlessConfig");

log.info("server", "Container Echoes backend service starting");

// Create the Express app
log.debug("server", "Creating Express app");
const app = express();
const port = config.app.port;
const url = config.app.url;

// Begin the server
(async () => {
	// Initialize Exceptionless
	log.debug("server", "Initializing Exceptionless");
	if (!config.exceptionless.apiKey || !config.exceptionless.serverUrl) {
		log.warn(
			"server",
			"Exceptionless API key or server URL not set. Exceptionless will be disabled."
		);
	} else {
		Exceptionless = await initializeExceptionless();
		log.debug("server", "Exceptionless initialized");
	}

	// Make sure the database is up and running
	log.info("server", "Checking database connection...");
	await knex.raw("SELECT 1+1 AS result");
	log.info("server", "Database connection successful");

	// Migrate the database using knex
	log.info("server", "Migrating database...");
	await new Promise((resolve, reject) => {
		knex.migrate.latest().then(resolve).catch(reject);
	}).catch(async (err) => {
		await Exceptionless.submitException(err);
		log.error("server", "Error migrating database: " + err);
		process.exit(1);
	});
	log.info("server", "Database migrated");

	// Log the latest migration
	log.info(
		"server",
		"Latest migration: " + (await knex.migrate.currentVersion())
	);

	// Initialize the app
	log.debug("server", "Initializing app");
	app.use(express.json());
	app.disable("X-Powered-By");
	app.set("trust proxy", 1);
	app.use(express.static("public"));

	// Sentry
	log.debug("server", "Initializing Sentry");
	Sentry.init({
		dsn: config.sentry.backend,
		integrations: [
			// enable HTTP calls tracing
			new Sentry.Integrations.Http({
				tracing: true,
			}),
			// enable Express.js middleware tracing
			new Sentry.Integrations.Express({
				app,
			}),
		],
		// Performance Monitoring
		tracesSampleRate: 1.0, // TODO: Capture 100% of the transactions, reduce in production!,
	});

	// Trace incoming requests
	log.debug("server", "Tracing requests");
	app.use(Sentry.Handlers.requestHandler());
	app.use(Sentry.Handlers.tracingHandler());

	// Allow CORS
	log.info("server", "Allowing CORS for " + config.app.frontendUrl);
	app.use(function (req, res, next) {
		res.header("Access-Control-Allow-Origin", config.app.frontendUrl);
		res.header(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Forwarded-For"
		);
		res.header(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, PATCH, DELETE, OPTIONS"
		);
		res.header("Access-Control-Allow-Credentials", true);
		next();
	});

	// Global Middleware
	log.debug("server", "Setting global middleware");
	app.use(function (req, res, next) {
		res.setHeader("X-Frame-Options", "SAMEORIGIN");
		res.removeHeader("X-Powered-By");

		// Log should look like: 172.70.114.212 - "GET /api/v1/health HTTP/1.1" 200
		log.debug("server", `${req.ip} - "${req.method} ${req.url}"`);
		next();
	});

	// Apply the rate limiting middleware to all requests.
	app.use(limiter);

	// Attach middleware
	log.debug("server", "Registering middleware");
	app.use(helmet.hidePoweredBy());
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	// Load & attach routes
	log.debug("server", "Loading routes");
	const Routes = require("./routes");
	app.use("/", Routes.authRoutes);

	// Health check
	log.debug("server", "Loading health check");
	app.use("/health", (req, res) => {
		res.status(200).json({
			status: "success",
			code: 200,
			message: "OK",
			data: null,
		});
	});

	// Swagger documentation
	log.debug("server", "Loading Swagger documentation");
	const options = require("./configs/swagger");
	const specs = swaggerJsdoc(options);
	app.use(
		"/reference",
		apiReference({
			theme: "purple",
			spec: {
				content: specs,
			},
		})
	);

	// The error handler must be registered before any other error middleware and after all controllers
	log.debug("server", "Registering error handler");
	app.use(Sentry.Handlers.errorHandler());

	// 404 middleware
	app.use((req, res) => {
		// Log should look like: 172.70.114.212 - "GET /api/v1/health HTTP/1.1" 200
		log.debug("server", `${req.ip} - "${req.method} ${req.url}" 404`);
		res.status(404).json({
			status: "error",
			code: 404,
			message: "The requested resource could not be found.",
			data: null,
		});
	});

	// 500 middleware
	app.use(async (error, req, res) => {
		await Exceptionless.submitException(error);
		return res.status(500).json({
			status: "error",
			code: 500,
			message: "An internal server error has occurred.",
			data: null,
		});
	});

	// Start listening for requests
	app.listen(port, async () => {
		// Show the version number and the port that the app is running on
		log.info(
			"server",
			`Container Echoes version ${getVersion()} is serving at ${url}`
		);

		// Show the API documentation URL
		log.info("server", `API documentation is available at ${url}/reference`);
	});
})();

/**
 * Shutdown the application
 * @param {string} signal The signal that triggered this function to be called.
 * @returns {Promise<void>}
 */
async function shutdownFunction(signal) {
	log.info("server", "Shutdown requested");
	log.info("server", "Called signal: " + signal);

	app.close();

	await new Promise((resolve) => setTimeout(resolve, 2000));
	await knex.destroy();
}

/**
 * Final function called before application exits
 * @returns {void}
 */
function finalFunction() {
	log.info("server", "Graceful shutdown successful!");
}

// Graceful shutdown
gracefulShutdown(app, {
	signals: "SIGINT SIGTERM",
	timeout: 30000, // timeout: 30 secs
	development: false, // not in dev mode
	forceExit: true, // triggers process.exit() at the end of shutdown process
	onShutdown: shutdownFunction, // shutdown function (async) - e.g. for cleanup DB, ...
	finally: finalFunction, // finally function (sync) - e.g. for logging
});

// Catch unhandled rejections
process.on("unhandledRejection", (err) => {
	log.error("server", "Unhandled rejection: " + err);
});
process.on("uncaughtException", (err) => {
	log.error("server", "Uncaught exception: " + err);
});
