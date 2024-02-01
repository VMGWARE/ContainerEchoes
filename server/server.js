// Packages
const http = require("http");
const Sentry = require("@sentry/node");
const express = require("express");

const helmet = require("helmet");
const swaggerJsdoc = require("swagger-jsdoc");
const { getVersion } = require("./utils/general");
const { apiReference } = require("@scalar/express-api-reference");
const log = require("@vmgware/js-logger").getInstance();
const gracefulShutdown = require("http-graceful-shutdown");
const knex = require("@container-echoes/core/database");
const limiter = require("./middleware/rateLimit");
const config = require("@container-echoes/core/config").getInstance();
const WebSocket = require("ws");
const { Client } = require("@elastic/elasticsearch");
const WebSocketManager = require("./webSocket/manager");
const rsa = require("trsa");

// Load environment variables
require("dotenv").config();

// If APP_LOG_LEVEL is set, override the default log level
if (process.env.APP_LOG_LEVEL) {
	log.setLogLevel(process.env.APP_LOG_LEVEL);
}

// Initialize Exceptionless
let Exceptionless;
const initializeExceptionless = require("@container-echoes/core/services/exceptionlessConfig");

log.info("server", "Container Echoes server service starting");

// Create the Express app
log.debug("server", "Creating Express app");
const app = express();
const port = config.app.port;
const url = config.app.url;

// Initialize a basic HTTP server
const server = http.createServer(app);

// Begin the server
(async () => {
	// Make sure the database is up and running
	log.info("server", "Checking database connection...");
	const dbVersion = await knex.raw("SELECT VERSION()");
	log.info(
		"server",
		"Database connection successful, version: " + dbVersion[0][0]["VERSION()"]
	);

	// Migrate the database using knex
	log.info("server", "Migrating database...");
	await new Promise((resolve, reject) => {
		knex.migrate.latest().then(resolve).catch(reject);
	}).catch(async (err) => {
		if (config.exceptionless.apiKey && config.exceptionless.serverUrl) {
			await Exceptionless.submitException(err);
		}
		log.error("server", "Error migrating database: " + err);
		process.exit(1);
	});
	log.info("server", "Database migrated");

	// Log the latest migration
	log.info(
		"server",
		"Latest migration: " + (await knex.migrate.currentVersion())
	);

	// Load configuration from database
	log.info("server", "Loading configuration from database...");
	await config.getDatabaseConfiguration();

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

	// Check connection to Elasticsearch
	if (config.elasticsearch.url && config.elasticsearch.apiKey) {
		log.info("server", "Checking Elasticsearch connection...");
		const client = new Client({
			node: config.elasticsearch.url,
			auth: {
				apiKey: config.elasticsearch.apiKey,
			},
			tls: {
				// ca: config.elasticsearch.ca,
				ca: Buffer.from(config.elasticsearch.ca, "base64").toString("ascii"),
				rejectUnauthorized: false,
			},
		});

		try {
			// API Key should have cluster monitor rights.
			const resp = await client.info();
			log.info(
				"server",
				"Elasticsearch connection successful, version: " + resp.version.number
			);
		} catch (err) {
			if (config.exceptionless.apiKey && config.exceptionless.serverUrl) {
				await Exceptionless.submitException(err);
			}
			log.error("server", "Error connecting to Elasticsearch: " + err);
			process.exit(1);
		}
	} else {
		log.warn(
			"server",
			"Elasticsearch URL or API key not set. Elasticsearch will be disabled."
		);
	}

	// Check if we have RSA keys stored in the database, if not, generate them
	log.info("server", "Checking RSA keys...");
	let publicKey = config.rsa.publicKey;
	let privateKey = config.rsa.privateKey;

	if (!publicKey || !privateKey) {
		log.info("server", "RSA keys not found, generating new keys...");
		const { publicKey, privateKey } = await generateRSAKeys();
		await knex("setting")
			.insert({ key: "rsa.publicKey", value: publicKey })
			.then(async () => {
				await knex("setting")
					.insert({ key: "rsa.privateKey", value: privateKey })
					.then(() => {
						log.info("server", "RSA keys stored in database");
					});
			});

		// Update the config object
		await config.getDatabaseConfiguration();
	} else {
		log.info("server", "RSA keys found in database");
	}

	// Initialize the app
	log.debug("server", "Initializing app");
	app.use(express.json());
	app.disable("X-Powered-By");
	app.set("trust proxy", 1);
	app.use(express.static("public"));

	// Initialize the WebSocket manager
	log.debug("server", "Initializing WebSocket server");
	const wss = new WebSocket.Server({ server, path: "/ws" });
	WebSocketManager.getInstance(wss, publicKey, privateKey);

	// Sentry
	log.debug("server", "Initializing Sentry");
	Sentry.init({
		dsn: config.sentry.server,
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
	log.info("server", "Allowing CORS for " + config.app.webUrl);
	app.use(function (req, res, next) {
		res.header("Access-Control-Allow-Origin", config.app.webUrl);
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
	Object.keys(Routes).forEach((route) => {
		app.use("/", Routes[route]);
	});

	// Swagger documentation
	log.debug("server", "Loading Swagger documentation");
	const options = require("./configs/swagger");
	const specs = swaggerJsdoc(options);
	app.get("/swagger.json", (req, res) => {
		res.setHeader("Content-Type", "application/json");
		res.send(specs);
	});
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
		if (config.exceptionless.apiKey && config.exceptionless.serverUrl) {
			await Exceptionless.submitException(error);
		}
		return res.status(500).json({
			status: "error",
			code: 500,
			message: "An internal server error has occurred.",
			data: null,
		});
	});

	// Start listening for requests
	server.listen(port, async () => {
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

	log.info("server", "Closing HTTP server...");
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

/**
 * Generates RSA keys
 * @returns {Promise<{publicKey: string, privateKey: string}>} The generated keys
 */
async function generateRSAKeys() {
	return new Promise((resolve, reject) => {
		try {
			const keypair = rsa.generateKeyPair({ bits: 2048 });

			resolve({
				publicKey: keypair.publicKey,
				privateKey: keypair.privateKey,
			});
		} catch (err) {
			log.error("server", "Error generating RSA keys: " + err);
			reject(err);
		}
	});
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
process.on("unhandledRejection", async (err) => {
	if (config.exceptionless.apiKey && config.exceptionless.serverUrl) {
		await Exceptionless.submitException(err);
	}

	log.error("server", "Unhandled rejection: " + err);
	console.error(err);
});
process.on("uncaughtException", async (err) => {
	if (config.exceptionless.apiKey && config.exceptionless.serverUrl) {
		await Exceptionless.submitException(err);
	}

	log.error("server", "Uncaught exception: " + err);
	console.error(err);
});
