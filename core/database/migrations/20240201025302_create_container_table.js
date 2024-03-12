/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("container", function (table) {
    // Id
    table.increments("id").primary().notNullable();

    // Regex pattern
    table.string("pattern", 255).notNullable();

    // Container name
    table.string("name", 255);

    // The id of the agent that is responsible for this container
    table.integer("agent").unsigned();
    // Set agent to null if the agent is deleted
    table
      .foreign("agent")
      .references("agentId")
      .inTable("agent")
      .onDelete("SET NULL");

    // createdAt
    table
      .dateTime("createdAt")
      .notNullable()
      .defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    // updatedAt
    table
      .dateTime("updatedAt")
      .notNullable()
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("container");
};
