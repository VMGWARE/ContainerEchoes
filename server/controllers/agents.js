/**
 * @swagger
 * tags:
 *   name: Agents
 *   description: Agent management
 */

// Dependencies
const log = require("@vmgware/js-logger").getInstance();

// Helpers/utilities
const {
	genericInternalServerError,
	standardResponse,
} = require("../utils/responses");
// const AuditLog = require("@container-echoes/core/helpers/auditLog");
// const config = require("@container-echoes/core/config").getInstance();
const WebSocketManager = require("../webSocket/manager").getInstance();

// Database
const knex = require("@container-echoes/core/database");

/**
 * @swagger
 * /agents:
 *   get:
 *     tags:
 *       - Agents
 *     summary: Get all agents
 *     description: Get all agents
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully retrieved all agents
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
 *                   example: Successfully retrieved all agents
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       agentId:
 *                         type: number
 *                         example: 1
 *                       agentName:
 *                         type: string
 *                         example: "Agent 1"
 *                       hostname:
 *                         type: string
 *                         example: "agent1"
 *                       createdAt:
 *                         type: string
 *                         example: "2020-01-01 00:00:00"
 *                       updatedAt:
 *                         type: string
 *                         example: "2020-01-01 00:00:00"
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
/**
 * Get all agents
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} A response object.
 */
async function getAll(req, res) {
	try {
		const agents = await knex("agent").select(
			"agentId",
			"agentName",
			"hostname",
			"createdAt",
			"updatedAt"
		);

		// Check if the agent id shows up in the web socket manager
		for (let i = 0; i < agents.length; i++) {
			agents[i].online = WebSocketManager.agents[agents[i].agentId] ? true : false;
		}

		return standardResponse(res, "Successfully retrieved all agents", agents);
	} catch (err) {
		log.error("agents", "Error getting all agents: " + err);
		genericInternalServerError(res, err, "agents");
	}
}

/**
 * @swagger
 * /agents/{agentId}:
 *   get:
 *     tags:
 *       - Agents
 *     summary: Get an agent
 *     description: Get an agent
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: agentId
 *         description: The id of the agent
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Successfully retrieved agent
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
 *                   example: Successfully retrieved agent
 *                 data:
 *                   type: object
 *                   properties:
 *                     agentId:
 *                       type: number
 *                       example: 1
 *                     agentName:
 *                       type: string
 *                       example: "Agent 1"
 *                     hostname:
 *                       type: string
 *                       example: "agent1"
 *                     createdAt:
 *                       type: string
 *                       example: "2020-01-01 00:00:00"
 *                     updatedAt:
 *                       type: string
 *                       example: "2020-01-01 00:00:00"
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
/**
 * Get an agent
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} A response object.
 */
async function getOne(req, res) {
	try {
		const agent = await knex("agent")
			.select("agentId", "agentName", "hostname", "createdAt", "updatedAt")
			.where("agentId", req.params.agentId)
			.first();

		return standardResponse(res, "Successfully retrieved agent", agent);
	} catch (err) {
		log.error("agents", "Error getting agent: " + err);
		genericInternalServerError(res, err, "agents");
	}
}

/**
 * @swagger
 * /agents/{agentId}/containers:
 *   get:
 *     tags:
 *       - Agents
 *     summary: Get containers for an agent
 *     description: Get containers for an agent
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: agentId
 *         description: The id of the agent
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Successfully retrieved containers for agent
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
 *                   example: Successfully retrieved containers for agent
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
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
/**
 * Get containers for an agent
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} A response object.
 */
async function getContainers(req, res) {
	try {
		const containers = await WebSocketManager.sendMessageAndWaitForResponse(
			req.params.agentId,
			WebSocketManager.events.CONTAINER_LIST,
			{}
		);

		return standardResponse(
			res,
			"Successfully retrieved containers for agent",
			containers.data
		);
	} catch (err) {
		log.error("agents", "Error getting containers: " + err);
		genericInternalServerError(res, err, "agents");
	}
}

module.exports = {
	getAll,
	getOne,
	getContainers,
};
