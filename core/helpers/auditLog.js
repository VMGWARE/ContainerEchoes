const knex = require("../database");
const log = require("@vmgware/js-logger");

/**
 * Audit Log
 */
class AuditLog {
	/**
	 * Log an event to the audit log
	 *
	 * @param event - A unique name for the event like "user.created"
	 * @param subjectTable - The table name of the subject like "user"
	 * @param subjectId - The id of the subject like "1"
	 * @param [description=null] - A description of the event like "Created a new user"
	 * @param [properties=null] - Extra data like the old and new values
	 * @param [causerTable=null] - The table name of the causer like "user"
	 * @param [causerId=null] - The id of the causer like "1"
	 */
	static async log(
		event,
		subjectTable,
		subjectId,
		description = null,
		properties = null,
		causerTable = null,
		causerId = null
	) {
		try {
			try {
				await knex("audit_log").insert({
					event,
					description,
					subjectTable: subjectTable,
					subjectId: subjectId,
					causerTable: causerTable,
					causerId: causerId,
					properties,
				});
				log.debug("auditlog", `Logged event: ${event}`);
			} catch (error) {
				log.error("auditlog", error);
			}
		} catch (error) {
			console.log(error);
		}
	}
}

module.exports = AuditLog;
