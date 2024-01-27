/**
 * @swagger
 * tags:
 *   name: General
 *   description: General API endpoints for the frontend
 */

// Helpers/utilities
const { genericInternalServerError } = require("../utils/responses");
const { getVersion } = require("../utils/general");
const log = require("@vmgware/js-logger").getInstance();
const si = require("systeminformation");
const knex = require("@container-echoes/core/database");
const axios = require("axios");
const semver = require("semver");

// System Information: current version, latest version (github), nodejs version, database version, OS, hostname, cpu cors, total ram, working dir.
/**
 * @swagger
 * /general/system-information:
 *   get:
 *     tags:
 *       - General
 *     summary: Get system information
 *     description: Get system information
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully retrieved system information.
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
 *                   example: Successfully retrieved system information.
 *       500:
 *         description: Something went wrong. But it's probably not your fault.
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
 *                   example: Something went wrong. But it's probably not your fault.
 *                 data:
 *                   type: null
 *                   example: null
 */
async function getSystemInformation(req, res) {
	try {
		const osInfo = await si.osInfo();

		// Get latest version from github
		const latestVersion = await axios
			.get("https://api.github.com/repos/VMGWARE/ContainerEchoes/releases/latest")
			.then((response) => {
				return response.data.tag_name;
			});

		const echoes = {
			version: getVersion(),
			latestVersion: latestVersion,
			needsUpdate: semver.gt(latestVersion, getVersion()),
			nodeVersion: process.version,
		};

		const database = {
			version: await knex.raw("SELECT VERSION()").then((version) => {
				return version[0][0]["VERSION()"];
			}),
			type: await knex.client.config.client,
		};

		const host = {
			// Operating System (OS) Ubuntu 22.04, Docker Container (Linux), etc
			os: osInfo.platform,
			// Hostname
			hostname: osInfo.hostname,
			cpuCores: await si.cpu().then((cpu) => {
				return cpu.cores;
			}),
			totalRam: await si.mem().then((mem) => {
				return mem.total;
			}),
			workingDir: process.cwd(),
		};

		const systemInformation = {
			echoes,
			database,
			host,
		};
		res.status(200).json({
			status: "success",
			code: 200,
			message: "Successfully retrieved system information.",
			data: systemInformation,
		});
	} catch (error) {
		log.error(error);
		genericInternalServerError(res);
	}
}

// Export the functions
module.exports = {
	getSystemInformation,
};
