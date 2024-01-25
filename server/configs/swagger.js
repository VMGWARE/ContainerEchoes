const { getVersion } = require("../utils/general");
const path = require("path");

const currentPath = path.dirname(__filename);
const controllersPath = path.join(currentPath, "../controllers");
const routesPath = path.join(currentPath, "../routes");

const options = {
	definition: {
		openapi: "3.1.0",
		info: {
			title: "Container Echoes API",
			version: getVersion(),
			description:
				"The Container Echoes API is a RESTful API that allows you to interact with the Container Echoes application.",
		},
		servers: [
			{
				url: "https://echoes.vmgware.dev/api",
				description: "Production server (uses live data)",
			},
			{
				url: "http://localhost:5000",
				description: "Development server (uses test data)",
			},
		],
	},
	apis: [`${controllersPath}/*.js`, `${routesPath}/*.js`],
};

module.exports = options;
