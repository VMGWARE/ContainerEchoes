// Dependencies
const express = require("express");
const router = express.Router();

// Controller
const AdminSettingsController = require("../controllers/admin/settings");

// Middleware
const { auth } = require("../middleware/auth");

// Routes
router.get("/admin/settings", auth, AdminSettingsController.getAll);
router.put("/admin/settings", auth, AdminSettingsController.updateAll);

module.exports = router;
