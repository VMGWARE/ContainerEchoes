const config =
  require("../knexfile.js")[
    require("../config/index.js").getInstance().app.env
  ];
module.exports = require("knex")(config);
