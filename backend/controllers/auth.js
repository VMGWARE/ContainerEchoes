/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User Authentication & Security
 * components:
 *   responses:
 *     UnauthorizedError:
 *       description: Authentication token is invalid or has expired.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: error
 *               code:
 *                 type: number
 *                 example: 401
 *               message:
 *                 type: string
 *                 example: Authentication token is invalid or has expired.
 *               data:
 *                 type: object
 *                 example: null
 */

// Dependencies
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const log = require("@vmgware/js-logger");
const speakeasy = require("speakeasy");

// Helpers/utilities
const Validator = require("@vmgware/js-validator");
const { hashPassword, generateUniqueId } = require("../utils/general");
const { genericInternalServerError } = require("../utils/responses");
const AuditLog = require("@container-echoes/core/helpers/auditLog");
const config = require("@container-echoes/core/config");

// Database
const knex = require("@container-echoes/core/database");

/**
 * Validate a two-factor code.
 * @param {string} secret The secret key.
 * @param {string} twoFactorCode The two-factor code.
 * @returns {boolean} Whether the two-factor code is valid.
 */
function validateTwoFactorCode(secret, twoFactorCode) {
	return speakeasy.totp.verify({
		secret: secret,
		encoding: "base32",
		token: twoFactorCode,
	});
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register
 *     description: Register a new user
 *     produces:
 *       - application/json
 *     requestBody:
 *       description: User registration details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 description: User's name
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 description: User's email address
 *                 type: string
 *                 example: john@doe.com
 *               password:
 *                 description: User's password
 *                 type: string
 *                 example: password123
 *               password_confirmation:
 *                 description: User's password confirmation
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: number
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Successfully registered user.
 *                 data:
 *                   type: object
 *                   example: null
 *       400:
 *         description: Failed to register user due to validation errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 code:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Failed to register user due to validation errors.
 *                 data:
 *                   type: object
 *       409:
 *         description: User with the provided email already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 code:
 *                  type: number
 *                  example: 409
 *                 message:
 *                   type: string
 *                   example: User with the provided email already exists.
 *                 data:
 *                   type: object
 *                   example: null
 *       500:
 *         description: Failed to register user due to an internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 code:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Failed to register user due to an internal server error.
 *                 data:
 *                   type: object
 *                   example: null
 */
/**
 * Register a new user.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} A response object.
 */
async function register(req, res) {
	try {
		// Validate the request body
		const validator = new Validator(
			// Things to validate/we can accept
			{
				name: {
					type: "string",
					required: true,
				},
				email: {
					validate: "email",
					type: "string",
					required: true,
					min: 5,
					max: 320,
				},
				password: {
					type: "string",
					required: true,
					min: 6,
				},
				password_confirmation: {
					type: "string",
					required: true,
					min: 6,
					match: "password",
				},
			},
			// Response messages for each validation
			{
				name: {
					type: "Name field must be a string.",
					required: "Name field is required.",
					min: "Name must be at least 3 characters long.",
					max: "Name must be at most 52 characters long.",
				},
				email: {
					type: "Email field must be a string.",
					validate: "Email is invalid.",
					required: "Email field is required.",
					min: "Email must be at least 5 characters long.",
					max: "Email must be at most 320 characters long.",
				},
				password: {
					type: "Password field must be a string.",
					required: "Password field is required.",
					min: "Password must be at least 8 characters long.",
					max: "Password must be at most 52 characters long.",
				},
				password_confirmation: {
					type: "Password confirmation field must be a string.",
					required: "Password confirmation field is required.",
					min: "Password confirmation must be at least 8 characters long.",
					max: "Password confirmation must be at most 52 characters long.",
					match: "Password confirmation does not match password.",
				},
			},
			// Options
			{
				trackPassedFields: true,
			}
		);
		if (!(await validator.validate(req.body))) {
			return res.status(400).json({
				status: "error",
				code: 400,
				message: "Failed to register user due to validation errors.",
				data: validator.errors,
			});
		}

		// Check if the user with the provided email already exists
		const existingUser = await knex("user")
			.where({
				email: validator.getPassedFields().email,
			})
			.first();

		// If the user exists, return an error
		if (existingUser) {
			return res.status(409).json({
				status: "error",
				code: 409,
				message: "User with the provided email already exists.",
				data: null,
			});
		}

		// Generate a hashed password
		const hashedPassword = hashPassword(validator.getPassedFields().password);
		const userId = await generateUniqueId(12);

		// Create the user
		await knex("user").insert({
			id: userId,
			name: validator.getPassedFields().name,
			email: validator.getPassedFields().email,
			password: hashedPassword,
		});

		log.debug("auth.register", `User ${userId} registered`);
		AuditLog.log(
			"user.registered",
			"user",
			userId,
			"User registered",
			{
				email: validator.getPassedFields().email,
			},
			"user",
			userId
		);

		// Return a success response
		return res.status(201).json({
			status: "success",
			code: 201,
			message: "Successfully registered user.",
			data: null,
		});
	} catch (err) {
		genericInternalServerError(res, err, "auth.register");
	}
}

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login
 *     description: Login an existing user
 *     produces:
 *       - application/json
 *     requestBody:
 *       description: User login details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 description: User's email address
 *                 type: string
 *                 example: john@doe.com
 *               password:
 *                 description: User's password
 *                 type: string
 *                 example: password123
 *               twoFactorCode:
 *                 description: User's two-factor code
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Successfully logged in.
 *                 data:
 *                   type: object
 *                   example:
 *                     token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
 *                     user:
 *                       _id: 5f8a9b5a4d5c2b1b4c5f7f4e
 *                       name: John Doe
 *                       email: john@doe.com
 *                       password: 123456
 *                       createdAt: 2020-10-17T15:16:26.000Z
 *                       updatedAt: 2020-10-17T15:16:26.000Z
 *       400:
 *         description: Failed to login user due to validation errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 code:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Failed to login user due to validation errors.
 *                 data:
 *                   type: object
 *                   example:
 *                     email: Email field is required.
 *                     password: Password field is required.
 *                     twoFactorCode: Two-factor code field is required.
 *       401:
 *         description: Your email or password is incorrect!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 code:
 *                  type: number
 *                  example: 401
 *                 message:
 *                   type: string
 *                   example: Your email or password is incorrect!
 *                 data:
 *                   type: object
 *                   example: null
 *       500:
 *         description: Failed to login user due to an internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 code:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Failed to login user due to an internal server error.
 *                 data:
 *                   type: object
 *                   example: null
 */
/**
 * Login a user.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} A response object.
 */
async function login(req, res) {
	try {
		// Validate the request body
		const validator = new Validator(
			{
				email: {
					validate: "email",
					type: "string",
					required: true,
					min: 5,
					max: 320,
				},
				password: {
					type: "string",
					required: true,
					min: 6,
				},
				twoFactorCode: {
					type: "string",
				},
			},
			// Response messages for each validation
			{
				email: {
					type: "Email field must be a string.",
					validate: "Email is invalid.",
					required: "Email field is required.",
					min: "Email must be at least 5 characters long.",
					max: "Email must be at most 320 characters long.",
				},
				password: {
					type: "Password field must be a string.",
					required: "Password field is required.",
					min: "Password must be at least 8 characters long.",
					max: "Password must be at most 52 characters long.",
				},
				twoFactorCode: {
					type: "Two-factor code field must be a string.",
				},
			},
			// Options
			{
				trackPassedFields: true,
			}
		);
		if (!(await validator.validate(req.body))) {
			log.debug("auth.login", "User failed to login due to validation errors");

			return res.status(400).json({
				status: "error",
				code: 400,
				message: "Failed to login user due to validation errors.",
				data: validator.errors,
			});
		}

		// Check if the email and password are provided
		const user = await knex("user")
			.where({
				email: validator.getPassedFields().email,
			})
			.select("id", "name", "email", "password")
			.first();

		// If the user does not exist, return an error
		if (
			!user ||
			!(await bcrypt.compareSync(
				validator.getPassedFields().password,
				user.password
			))
		) {
			log.debug(
				"auth.login",
				"User failed to login due to " +
					(user ? "incorrect password" : "user not found")
			);
			return res.status(401).json({
				status: "error",
				code: 401,
				message: "Your email or password is incorrect!",
				data: null,
			});
		}

		// Check if the user has two-factor authentication enabled
		const twoFactorAuth = await knex("user_two_factor_auth")
			.where({
				userId: user.id,
			})
			.first();

		// If the user has two-factor authentication enabled, check if the two-factor code is provided
		if (twoFactorAuth?.enabled) {
			// If the two-factor code is not provided, return an error
			if (!validator.getPassedFields().twoFactorCode) {
				log.debug(
					"auth.login",
					"User failed to login due to missing two-factor code"
				);
				return res.status(400).json({
					status: "error",
					code: 400,
					message: "Two-factor code field is required.",
					data: null,
				});
			}
			// If the two-factor code is provided, validate it
			if (
				!validateTwoFactorCode(
					twoFactorAuth.secret,
					validator.getPassedFields().twoFactorCode
				)
			) {
				log.debug(
					"auth.login",
					"User failed to login due to invalid two-factor code"
				);
				return res.status(401).json({
					status: "error",
					code: 401,
					message: "Your two-factor code is incorrect!",
					data: null,
				});
			}
		}

		// Create a JWT token
		const token = jwt.sign(
			{
				sub: user.id,
			},
			config.jwt.secret,
			{
				expiresIn: "1d",
			}
		);

		// Remove the password from the user object
		delete user.password;

		log.debug("auth.login", `User ${user.id} logged in`);
		AuditLog.log(
			"user.logged_in",
			"user",
			user.id,
			"User logged in",
			{
				email: user.email,
			},
			"user",
			user.id
		);

		// Return the JWT token
		return res.json({
			status: "success",
			code: 200,
			message: "Successfully logged in",
			data: {
				token: token,
				user: user,
			},
		});
	} catch (err) {
		genericInternalServerError(res, err, "auth.login");
	}
}

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get Me
 *     description: Get the currently logged in user
 *     produces:
 *       - application/json
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Successfully retrieved user.
 *                 data:
 *                   type: object
 *                   example:
 *                     _id: 5f8a9b5a4d5c2b1b4c5f7f4e
 *                     name: John Doe
 *                     email: john@doe.com
 *                     email_verified_at: 2020-10-17T15:16:26.000Z
 *                     twoFactorEnabled: 0
 *                     createdAt: 2020-10-17T15:16:26.000Z
 *                     updatedAt: 2020-10-17T15:16:26.000Z
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Failed to get user due to an internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 code:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Failed to get user due to an internal server error.
 *                 data:
 *                   type: object
 *                   example: null
 */
/**
 * Get the currently logged in user.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} A response object.
 */
async function me(req, res) {
	try {
		// Get the user
		const user = await knex("user")
			.where({
				id: req.user,
			})
			.leftJoin("user_two_factor_auth", "user_two_factor_auth.userId", "user.id")
			.select(
				"user.id",
				"user.name",
				"user.email",
				"user.emailVerifiedAt",
				"user.createdAt",
				"user.updatedAt",
				"user_two_factor_auth.enabled as twoFactorEnabled"
			)
			// Join the user_two_factor_auth table and get the enabled field
			.first();

		// If the user does not exist, return an error
		if (!user) {
			return res.status(404).json({
				status: "error",
				code: 404,
				message: "User not found.",
				data: null,
			});
		}

		log.debug("auth.me", `User ${user.id} retrieved`);

		// Return the user
		res.json({
			status: "success",
			code: 200,
			message: "Successfully retrieved user.",
			data: user,
		});
	} catch (err) {
		genericInternalServerError(res, err, "auth.me");
	}
}

/**
 * @swagger
 * /auth/me:
 *   patch:
 *     tags:
 *       - Auth
 *     summary: Update Me
 *     description: Update the currently logged in user
 *     produces:
 *       - application/json
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: User update details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 description: User's name
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 description: User's email address
 *                 type: string
 *                 example: john@doe.com
 *     responses:
 *       200:
 *         description: Successfully updated user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Successfully updated user.
 *                 data:
 *                   type: object
 *                   example: null
 *       400:
 *         description: Failed to update user due to validation errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                    type: string
 *                    example: error
 *                 code:
 *                    type: number
 *                    example: 400
 *                 message:
 *                   type: string
 *                   example: Failed to update user due to validation errors.
 *                 data:
 *                   type: object
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                    type: string
 *                    example: error
 *                 code:
 *                    type: number
 *                    example: 404
 *                 message:
 *                   type: string
 *                   example: User not found.
 *                 data:
 *                   type: object
 *       500:
 *         description: Failed to update user due to an internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                    type: string
 *                    example: error
 *                 code:
 *                    type: number
 *                    example: 500
 *                 message:
 *                   type: string
 *                   example: Failed to update user due to an internal server error.
 *                 data:
 *                   type: object
 *                   example: null
 */
/**
 * Update the currently logged in user.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} A response object.
 */
async function updateMe(req, res) {
	try {
		// Validate the request body
		const validator = new Validator(
			// Things to validate/we can accept
			{
				name: {
					type: "string",
					required: false,
				},
				email: {
					validate: "email",
					type: "string",
					required: false,
					min: 5,
					max: 320,
					custom: async (value) => {
						try {
							// Check if the email already exists and is not the user's current email
							const existingUser = await knex("user")
								.where({
									email: value,
								})
								.first();

							if (!existingUser) {
								return true;
							}

							return !(existingUser && existingUser.id !== req.user);
						} catch (error) {
							return false;
						}
					},
				},
			},
			// Response messages for each validation
			{
				name: {
					type: "Name field must be a string.",
					required: "Name field is required.",
					min: "Name must be at least 3 characters long.",
					max: "Name must be at most 52 characters long.",
				},
				email: {
					type: "Email field must be a string.",
					validate: "Email is invalid.",
					required: "Email field is required.",
					min: "Email must be at least 5 characters long.",
					max: "Email must be at most 320 characters long.",
					custom: "Email already exists.",
				},
			},
			// Options
			{
				trackPassedFields: true,
			}
		);

		// Check if the request body is valid
		if (!(await validator.validate(req.body))) {
			return res.status(400).json({
				status: "error",
				code: 400,
				message: "Failed to update user due to validation errors.",
				data: validator.getErrors(),
			});
		}

		// Get the user
		const user = await knex("user")
			.where({
				id: req.user,
			})
			.first();

		// If the user does not exist, return an error
		if (!user) {
			return res.status(404).json({
				status: "error",
				code: 404,
				message: "User not found.",
				data: null,
			});
		}

		// Create an object with the fields to update
		const updateUser = validator.getPassedFields();

		// If the email is being updated, create a new email validation
		if (
			validator.getPassedFields().email &&
			validator.getPassedFields().email !== user.email
		) {
			// Set the emailVerifiedAt field to null
			updateUser.emailVerifiedAt = null;

			// Send an email verification email
			await sendEmailVerificationEmail(
				req.user,
				validator.getPassedFields().email
					? validator.getPassedFields().email
					: user.email,
				validator.getPassedFields().name
					? validator.getPassedFields().name
					: user.name
			);
		}

		// Update the user
		await knex("user")
			.where({
				id: req.user,
			})
			.update(updateUser);

		log.debug("auth.updateMe", `User ${user.id} updated`);
		AuditLog.log(
			"user.updated",
			"user",
			user.id,
			"User updated",
			{
				email: user.email,
			},
			"user",
			user.id
		);

		// Return a success response
		return res.status(200).json({
			status: "success",
			code: 200,
			message: "Successfully updated user.",
			data: null,
		});
	} catch (error) {
		genericInternalServerError(res, error, "auth.updateMe");
	}
}

/**
 * @swagger
 * /auth/otp/generate:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Generate OTP Secret
 *     description: Generate an OTP secret for a user
 *     produces:
 *       - application/json
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully generated OTP secret.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                    type: string
 *                    example: success
 *                 code:
 *                    type: number
 *                    example: 200
 *                 message:
 *                   type: string
 *                   example: Successfully generated OTP secret.
 *                 data:
 *                   type: object
 *                   example:
 *                     otpauthURL: otpauth://totp/Container%20Echoes:john%40doe.com?secret=JBSWY3DPEHPK3PXP
 *                     base32: JBSWY3DPEHPK3PXP
 *       400:
 *         description: User already has 2FA enabled.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                    type: string
 *                    example: error
 *                 code:
 *                    type: number
 *                    example: 400
 *                 message:
 *                   type: string
 *                   example: User already has 2FA enabled.
 *                 data:
 *                   type: object
 *                   example: null
 *       500:
 *         description: Failed to generate OTP secret due to an internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                    type: string
 *                    example: error
 *                 code:
 *                    type: number
 *                    example: 500
 *                 message:
 *                   type: string
 *                   example: Failed to generate OTP secret due to an internal server error.
 *                 data:
 *                   type: object
 *                   example: null
 */
/**
 * Generate an OTP secret for a user.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} A response object.
 */
async function generateOtp(req, res) {
	try {
		// Check if the user already has 2FA enabled
		const user = await knex("user_two_factor_auth")
			.where({
				userId: req.user,
			})
			.first();

		if (user?.enabled) {
			return res.status(400).json({
				status: "error",
				code: 400,
				message: "User already has 2FA enabled.",
				data: null,
			});
		}

		// Generate a secret
		const secret = speakeasy.generateSecret({
			length: 20,
			name: "Container Echoes",
			issuer: "Container Echoes",
		});

		// If the user doesn't have a record in the user_two_factor_auth table, create one
		if (!user) {
			await knex("user_two_factor_auth").insert({
				userId: req.user,
				enabled: false,
				tempSecret: secret.base32,
				// TODO: Rename from tempQrCode to something else
				tempQrCode: secret.otpauth_url,
			});
		} else {
			// Update the user's secret
			await knex("user_two_factor_auth")
				.where({
					userId: req.user,
				})
				.update({
					enabled: false,
					tempSecret: secret.base32,
					tempQrCode: secret.otpauth_url,
				});
		}

		// Return the secret
		return res.json({
			status: "success",
			code: 200,
			message: "Successfully generated OTP secret.",
			data: {
				base32: secret.base32,
				otpauthURL: secret.otpauth_url,
			},
		});
	} catch (error) {
		genericInternalServerError(res, error, "auth.generateOtpSecret");
	}
}

// https://codevoweb.com/two-factor-authentication-2fa-in-nodejs/
// https://github.com/VMGWARE/Camphouse/blob/main/backend/controllers/TwoFAController.js
// Make use of both of these ^^^

/**
 * @swagger
 * /auth/otp/verify:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Verify OTP
 *     description: Verify an OTP for a user
 *     produces:
 *       - application/json
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: User OTP code
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               twoFactorCode:
 *                 description: User's OTP code
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Successfully verified OTP code.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                    type: string
 *                    example: success
 *                 code:
 *                    type: number
 *                    example: 200
 *                 message:
 *                   type: string
 *                   example: Successfully verified OTP code.
 *                 data:
 *                   type: object
 *                   example: null
 *       400:
 *         description: User does not have 2FA enabled or invalid 2FA code.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                    type: string
 *                    example: error
 *                 code:
 *                    type: number
 *                    example: 400
 *                 message:
 *                   type: string
 *                   example: User does not have 2FA enabled or invalid 2FA code.
 *                 data:
 *                   type: object
 *                   example: null
 *       500:
 *         description: Failed to verify OTP code due to an internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                    type: string
 *                    example: error
 *                 code:
 *                    type: number
 *                    example: 500
 *                 message:
 *                   type: string
 *                   example: Failed to verify OTP code due to an internal server error.
 *                 data:
 *                   type: object
 *                   example: null
 */
/**
 * Verify an OTP for a user.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} A response object.
 */
async function verifyOtp(req, res) {
	try {
		// Check if the user has 2FA enabled
		const user = await knex("user_two_factor_auth")
			.where({
				userId: req.user,
			})
			.first();

		if (user?.enabled) {
			return res.status(400).json({
				status: "error",
				code: 400,
				message: "User already has 2FA enabled.",
				data: null,
			});
		}

		// Check if the user has a valid 2FA code
		if (!validateTwoFactorCode(user.tempSecret, req.body.twoFactorCode)) {
			return res.status(400).json({
				status: "error",
				code: 400,
				message: "Invalid 2FA code.",
				data: null,
			});
		}

		// Update the user's secret
		await knex("user_two_factor_auth")
			.where({
				userId: req.user,
			})
			.update({
				enabled: true,
				secret: user.tempSecret,
				tempSecret: null,
				tempQrCode: null,
			});

		// Return a success response
		return res.json({
			status: "success",
			code: 200,
			message: "Successfully verified 2FA code.",
			data: null,
		});
	} catch (error) {
		genericInternalServerError(res, error, "auth.verifyOtp");
	}
}

/**
 * @swagger
 * /auth/otp/disable:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Disable OTP
 *     description: Disable OTP for a user
 *     produces:
 *       - application/json
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: User OTP secret and code
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               twoFactorCode:
 *                 description: User's OTP code
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Successfully disabled OTP.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                    type: string
 *                    example: success
 *                 code:
 *                    type: number
 *                    example: 200
 *                 message:
 *                   type: string
 *                   example: Successfully disabled OTP.
 *                 data:
 *                   type: object
 *                   example: null
 *       400:
 *         description: User does not have 2FA enabled or invalid 2FA code.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                    type: string
 *                    example: error
 *                 code:
 *                    type: number
 *                    example: 400
 *                 message:
 *                   type: string
 *                   example: User does not have 2FA enabled or invalid 2FA code.
 *                 data:
 *                   type: object
 *                   example: null
 *       500:
 *         description: Failed to disable OTP due to an internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                    type: string
 *                    example: error
 *                 code:
 *                    type: number
 *                    example: 500
 *                 message:
 *                   type: string
 *                   example: Failed to disable OTP due to an internal server error.
 *                 data:
 *                   type: object
 *                   example: null
 */
/**
 * Disable OTP for a user.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} A response object.
 */
async function disableOtp(req, res) {
	try {
		// Check if the user has 2FA enabled
		const user = await knex("user_two_factor_auth")
			.where({
				userId: req.user,
			})
			.first();

		if (!user?.enabled) {
			return res.status(400).json({
				status: "error",
				code: 400,
				message: "User does not have 2FA enabled.",
				data: null,
			});
		}

		// Check if the user has a valid 2FA code
		if (!validateTwoFactorCode(user.secret, req.body.twoFactorCode)) {
			return res.status(400).json({
				status: "error",
				code: 400,
				message: "Invalid 2FA code.",
				data: null,
			});
		}

		// Disable 2FA
		await knex("user_two_factor_auth")
			.where({
				userId: req.user,
			})
			.update({
				enabled: false,
				secret: null,
				tempSecret: null,
				tempQrCode: null,
			});

		// Return a success response
		return res.json({
			status: "success",
			code: 200,
			message: "Successfully disabled 2FA.",
			data: null,
		});
	} catch (error) {
		genericInternalServerError(res, error, "auth.disableOtp");
	}
}

// Export the functions
module.exports = {
	register,
	login,
	me,
	updateMe,
	generateOtp,
	verifyOtp,
	disableOtp,
};
