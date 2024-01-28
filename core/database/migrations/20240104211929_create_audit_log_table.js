/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
	return knex.schema.createTable("audit_log", function (table) {
		table.increments("id");

		// Event (What happened): created, updated, deleted, restored, etc.
		table.string("event", 255).notNullable().index();

		// Description (Why did it happen): Removed the user from account
		table.string("description", 255).nullable();

		// Subject (What was changed or affected)
		table.string("subjectTable", 255).notNullable().index();
		table.string("subjectId", 255).notNullable().index();

		// Causer (Who did this)
		table.string("causerTable", 255).nullable().index();
		table.string("causerId", 255).nullable().index();

		// Extra data (Normally used for storing the old and new values)
		table.json("properties").nullable();

		// Timestamp
		table.timestamp("createdAt").defaultTo(knex.fn.now());
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
	return knex.schema.dropTable("audit_log");
};
