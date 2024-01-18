// Used by: backend/app.js
// Used for: Auth routes like login, register, etc.

/**
 * @swagger
 * components:
 *  securitySchemes:
 *    BearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 *      description: JWT authorization header using the Bearer scheme.
 */

const authRoutes = require("./auth");
const generalRoutes = require("./general");
const log = require("@vmgware/js-logger");

// Function to log routes for a given router
function logRoutes(router, routerName) {
	router.stack.forEach((route) => {
		if (route.route) {
			let methods;
			if (route.route.methods) {
				methods = Object.keys(route.route.methods).join(", ");
			} else {
				methods = "ALL";
			}

			log.debug(
				`routes.${routerName}`,
				"Registered route: " + route.route.path + " (" + methods + ")"
			);
		}
	});
}

// Log routes for each router
logRoutes(authRoutes, "auth");
logRoutes(generalRoutes, "general");

// Export all routes
module.exports = {
	authRoutes,
	generalRoutes,
};
