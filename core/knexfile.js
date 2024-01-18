// Update with your config settings.
const env = require("./config").getInstance();
const path = require("path");

const config = {
  client: env.db.client || "mysql2",
  connection: {
    host: env.db.host || "localhost",
    port: env.db.port || 3306,
    database: env.db.name || "container-echoes",
    user: env.db.user || "root",
    password: env.db.pass || "",
  },
  pool: {
    min: 0,
    max: 10,
  },
  migrations: {
    tableName: "migration",
    getNewMigrationName: (name) => {
      return `${+new Date()}-${name}.js`;
    },
    directory: path.join(__dirname, "database/migrations"),
  },
  seeds: {
    directory: path.join(__dirname, "database/seeds"),
  },
};

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: config,
  production: config,
};
