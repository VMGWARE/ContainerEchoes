/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("user_two_factor_auth", function (table) {
    table.renameColumn("tempQrCode", "otpauth");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("user_two_factor_auth", function (table) {
    table.renameColumn("otpauth", "tempQrCode");
  });
};
