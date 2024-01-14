// Packages
const rateLimit = require("express-rate-limit");

/**
 * Rate limiting middleware
 */
const limiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	limit: 120, // limit each IP to 60 requests per windowMs
	standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	message: {
		status: "error",
		code: 429,
		message: "Too many requests, please try again later.",
		data: {
			retryAfter: 60,
		},
	},
});

module.exports = limiter;
