// Dependencies
const express = require("express");
const router = express.Router();

// Controller
const GeneralController = require("../controllers/general");

/**
 * @swagger
 * /healthcheck:
 *  get:
 *    summary: Health check for the API
 *    description: Health check for the API
 *    tags:
 *      - Health Check
 *    responses:
 *      200:
 *        description: The API is healthy.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: string
 *                  example: success
 *                code:
 *                  type: number
 *                  example: 200
 *                message:
 *                  type: string
 *                  example: The API is healthy.
 *                data:
 *                  type: null
 *                  example: null
 */
router.use("/healthcheck", (req, res) => {
	res.status(200).json({
		status: "success",
		code: 200,
		message: "The API is healthy.",
		data: null,
	});
});

// TODO: Only allow this route to be accessed in development mode or by superusers
router.get(
	"/general/system-information",
	GeneralController.getSystemInformation
);

module.exports = router;
