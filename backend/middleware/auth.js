// Used by: lots of files

// Dependencies
const jwt = require("jsonwebtoken");
const log = require("@vmgware/js-logger");

/**
 * Middleware to authenticate user using JWT tokens
 */
const auth = async (req, res, next) => {
	// Check for token in the Authorization header
	const token = req.headers.authorization?.split(" ")[1];

	if (!token) {
		log.warn("auth", "No token provided");

		return res.status(401).json({
			status: "error",
			code: 401,
			message: "Authentication token is invalid or has expired.",
			data: null,
		});
	}

	try {
		// Verify the token and get user info
		const decoded = jwt.verify(token, process.env.JWT_SECRET); // Make sure to set your secret

		if (!decoded) {
			log.warn("auth", "Invalid token");

			return res.status(401).json({
				status: "error",
				code: 401,
				message: "Authentication token is invalid or has expired.",
				data: null,
			});
		}

		// Attach user information to the request
		req.user = decoded.sub;

		next(); // Move to the next middleware or route handler
	} catch (err) {
		if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
			log.warn("auth", "Invalid token");
			return res.status(401).json({
				status: "error",
				code: 401,
				message: "Authentication token is invalid or has expired.",
				data: null,
			});
		}

		// Log the error
		console.error(err);
		log.error("auth", err);

		// Handle the error
		return res.status(500).json({
			status: "error",
			code: 500,
			message: "Something went wrong while authenticating the user.",
			data: null,
		});
	}
};

module.exports = {
	auth,
};
