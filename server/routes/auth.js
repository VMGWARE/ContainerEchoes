// Dependencies
const express = require("express");
const router = express.Router();

// Controller
const AuthController = require("../controllers/auth");

// Middleware
const { auth } = require("../middleware/auth");

// Routes
router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);
router.get("/auth/me", auth, AuthController.me);
router.patch("/auth/me", auth, AuthController.updateMe);
router.post("/auth/otp/generate", auth, AuthController.generateOtp);
router.post("/auth/otp/verify", auth, AuthController.verifyOtp);
router.post("/auth/otp/disable", auth, AuthController.disableOtp);

module.exports = router;
