// Dependencies
const express = require("express");
const router = express.Router();

// Controller
const AgentsController = require("../controllers/agents");

// Routes
router.get("/agents", AgentsController.getAll);
router.get("/agents/:agentId", AgentsController.getOne);
router.get("/agents/:agentId/containers", AgentsController.getContainers);

module.exports = router;
