/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("log", function (table) {
    // Id
    table.increments("id").primary().notNullable();

    // The id of the container that this log belongs to
    table.integer("container").unsigned().notNullable().index();
    // Set container to null if the container is deleted
    table
      .foreign("container")
      .references("id")
      .inTable("container")
      .onDelete("CASCADE");

    // Log level (info, warning, error, etc.)
    table.string("level", 255).index();

    // Log message
    table.text("message").notNullable();

    // timestamp
    table
      .dateTime("timestamp")
      .notNullable()
      .defaultTo(knex.raw("CURRENT_TIMESTAMP"));
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("log");
};
