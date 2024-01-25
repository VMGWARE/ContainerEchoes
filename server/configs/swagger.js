const { getVersion } = require("../utils/general");
const path = require("path");
const config = require("@container-echoes/core/config").getInstance();

const currentPath = path.dirname(__filename);
const controllersPath = path.join(currentPath, "../controllers");
const routesPath = path.join(currentPath, "../routes");

const url = config.app.url;

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
				url,
			},
		],
	},
	apis: [`${controllersPath}/*.js`, `${routesPath}/*.js`],
};

module.exports = options;
