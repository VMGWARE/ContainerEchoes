// Dependencies
const express = require("express");
const router = express.Router();

// Controller
const AdminSettingsController = require("../controllers/admin/settings");

// Routes
router.get("/admin/settings", AdminSettingsController.getAll);

module.exports = router;
