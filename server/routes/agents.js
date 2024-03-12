// Dependencies
const express = require("express");
const router = express.Router();

// Controller
const AgentsController = require("../controllers/agents");

// Middleware
const { auth } = require("../middleware/auth");

// Routes
router.get("/agents", auth, AgentsController.getAll);
router.get("/agents/:agentId", auth, AgentsController.getOne);
router.get("/agents/:agentId/containers", auth, AgentsController.getContainers);

module.exports = router;
