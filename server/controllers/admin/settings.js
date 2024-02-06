/**
 * @swagger
 * tags:
 *   name: Admin - Settings
 *   description: Manage settings for the application
 */

// Dependencies
const log = require("@vmgware/js-logger").getInstance();

// Helpers/utilities
const {
	genericInternalServerError,
	standardResponse,
} = require("../../utils/responses");
// const AuditLog = require("@container-echoes/core/helpers/auditLog");
const exceptionlessManager = require("@container-echoes/core/services/exceptionless");
const config = require("@container-echoes/core/config").getInstance();

// Database
const knex = require("@container-echoes/core/database");

/**
 * @swagger
 * /admin/settings:
 *   get:
 *     tags:
 *       - Admin - Settings
 *     summary: Get all settings
 *     description: Get all settings
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully retrieved all settings
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
 *                   example: Successfully retrieved all settings
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       settingId:
 *                         type: number
 *                         example: 1
 *                       key:
 *                         type: string
 *                         example: "email.host"
 *                       value:
 *                         type: string
 *                         example: "smtp.example.com"
 *                       createdAt:
 *                         type: string
 *                         example: "2020-01-01T00:00:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         example: "2020-01-01T00:00:00.000Z"
 */
async function getAll(req, res) {
	try {
		const settings = await knex("setting").select("*");
		return standardResponse(res, "Successfully retrieved all settings", settings);
	} catch (error) {
		log.error("admin.settings.getAll", error);
		return genericInternalServerError(res, error, "admin.settings.getAll");
	}
}

/**
 * @swagger
 * /admin/settings:
 *   put:
 *     tags:
 *       - Admin - Settings
 *     summary: Update settings
 *     description: Update one or more settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties:
 *               type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully updated settings
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
 *                   example: Successfully updated settings
 */
async function updateAll(req, res) {
	try {
		const updates = req.body;
		const keys = Object.keys(updates);

		for (const key of keys) {
			const exists = await knex("setting").where({ key }).first();

			if (exists) {
				// If we are setting the value to null, delete the setting
				if (updates[key] == null || updates[key] === "") {
					await knex("setting").where({ key }).delete();
					continue;
				} else {
					// If the setting exists, update it
					await knex("setting")
						.where({ key })
						.update({ value: updates[key], updatedAt: new Date() });
				}
			} else {
				// If the setting value is null, skip it
				if (!updates[key] || updates[key] == null) {
					continue;
				}

				// if it is not in the list of allowed keys, skip it
				if (!config.allowedSettings.includes(key)) {
					continue;
				}

				// If the setting does not exist, insert it
				await knex("setting").insert({
					key,
					value: updates[key],
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			}
		}

		// Update the configuration
		await config.refreshConfig();

		// If Exceptionless is was updated, update the client
		if (
			keys.includes("exceptionless.apiKey") ||
			keys.includes("exceptionless.serverUrl")
		) {
			await exceptionlessManager.updateClient(
				keys["exceptionless.apiKey"],
				keys["exceptionless.serverUrl"]
			);
		}

		return standardResponse(res, "Successfully updated settings");
	} catch (error) {
		log.error("admin.settings.updateAll", error);
		return genericInternalServerError(res, error, "admin.settings.updateAll");
	}
}

module.exports = {
	getAll,
	updateAll,
};
