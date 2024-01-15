/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  return knex.schema
    .createTable("user", function (table) {
      // Custom generated id via us
      table.string("id").index().unique().primary().notNullable();
      // name
      table.string("name").notNullable();
      // email
      table.string("email").notNullable().unique();
      // emailVerifiedAt
      table.timestamp("emailVerifiedAt").nullable();
      // password
      table.string("password").notNullable();
      // superuser
      table.boolean("superuser").defaultTo(false);
      // Timestamps
      table
        .timestamp("createdAt")
        .notNullable()
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      table
        .timestamp("updatedAt")
        .notNullable()
        .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
    })
    .createTable("user_two_factor_auth", function (table) {
      // UserId
      table
        .string("userId")
        .unique()
        .index()
        .notNullable()
        .references("id")
        .inTable("user")
        .onDelete("CASCADE");
      // Enabled
      table.boolean("enabled").defaultTo(false);
      // Secret
      table.string("secret");
      // TempSecret
      table.string("tempSecret");
      // TempQrCode
      table.string("tempQrCode");
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
exports.down = async function (knex) {
  return knex.schema.dropTable("user").dropTable("user_two_factor_auth");
};
