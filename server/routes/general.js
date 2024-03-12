// Dependencies
const express = require("express");
const router = express.Router();

// Controller
const GeneralController = require("../controllers/general");

// Middleware
const { auth } = require("../middleware/auth");

router.get("/general/healthcheck", GeneralController.healthcheck);

router.get(
	"/general/system-information",
	auth,
	GeneralController.getSystemInformation
);

module.exports = router;
