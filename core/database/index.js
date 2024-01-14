const environment = require("../config/index.js").app.env;
const config = require("../knexfile.js")[environment];
module.exports = require("knex")(config);
