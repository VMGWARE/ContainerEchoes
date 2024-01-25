// Dependencies
const express = require("express");
const router = express.Router();

// Controller
const AgentsController = require("../controllers/agents");

// Routes
router.get("/agents", AgentsController.getAll);

module.exports = router;
