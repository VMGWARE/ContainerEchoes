require("dotenv").config();

class Config {
  allowedSettings = [
    "app.autoAddAgents",
    "email.host",
    "email.port",
    "email.user",
    "email.pass",
    "email.fromAddress",
    "email.fromName",
    "exceptionless.apiKey",
    "exceptionless.serverUrl",
    "rsa.privateKey",
    "rsa.publicKey",
  ];

  /**
   * @class Config
   * @description The Config class is a singleton class that holds all the configuration variables for the application.
   * @property app - Application related configuration.
   * @property db - Database related configuration.
   * @property jwt - JWT related configuration.
   * @property sentry - Sentry related configuration.
   * @property email - Email related configuration.
   * @property exceptionless - Exceptionless related configuration.
   * @property elasticsearch - Elasticsearch related configuration.
   * @property rsa - RSA related configuration.
   */
  constructor() {
    /**
     * Application related configuration
     * @property port - The port number for the application server.
     * @property env - The environment in which the app is running, e.g., 'development', 'production'.
     * @property url - The base URL of the application.
     * @property webUrl - The base URL of the web application.
     */
    this.app = {
      /**
       * Port number for the application server
       */
      port: process.env.APP_PORT || 5000,
      /**
       * Environment in which the app is running, e.g., 'development', 'production'
       */
      env: process.env.APP_ENV || "development",
      /**
       * Base URL of the application
       */
      url:
        process.env.APP_URL ||
        "http://localhost:" + (process.env.APP_PORT || 5000),
      /**
       * Base URL of the web application
       */
      webUrl: process.env.FRONTEND_URL || "http://localhost:3000",
      /**
       * Auto add agents
       * When a new agent is added to the system, it will automatically be integrated with the system.
       */
      autoAddAgents: process.env.AUTO_ADD_AGENTS || false,
    };

    /**
     * Database configuration
     * @property client - Database client: mysql or pg.
     * @property host - The host address of the Database server.
     * @property port - The port number on which the Database server is running.
     * @property db - The name of the Database database.
     * @property user - The username for Database database access.
     * @property pass - The password for Database database access.
     */
    this.db = {
      /**
       * Database client: mysql2 or pg
       */
      client: process.env.DB_CLIENT || "mysql2",
      /**
       * Host address of the Database server
       */
      host: process.env.DB_HOST || "localhost",
      /**
       * Port number on which the Database server is running
       */
      port: process.env.DB_PORT || 3306,
      /**
       * Name of the Database database
       */
      name: process.env.DB_NAME || "container-echoes",
      /**
       * Username for Database database access
       */
      user: process.env.DB_USER || "root",
      /**
       * Password for Database database access
       */
      pass: process.env.DB_PASS,
    };

    /**
     * JSON Web Token (JWT) configuration
     * @property secret - The secret key used for signing JWTs.
     */
    this.jwt = {
      /**
       * Secret key used for signing JWTs
       */
      secret: process.env.JWT_SECRET,
    };

    /**
     * Sentry configuration
     * @property server - Sentry DSN for server.
     * @property cron - Sentry DSN for cron.
     */
    this.sentry = {
      /**
       * Sentry DSN for server
       */
      server: process.env.SENTRY_SERVER_DSN,
    };

    /**
     * Email configuration
     * @property host - The host address of the email server.
     * @property port - The port number on which the email server is running.
     * @property user - The username for email server access.
     * @property pass - The password for email server access.
     * @property fromAddress - The email address from which all emails will be sent.
     * @property fromName - The name from which all emails will be sent.
     */
    this.email = {
      /**
       * Host address of the email server
       */
      host: process.env.EMAIL_HOST,
      /**
       * Port number on which the email server is running
       */
      port: process.env.EMAIL_PORT,
      /**
       * Username for email server access
       */
      user: process.env.EMAIL_USER,
      /**
       * Password for email server access
       */
      pass: process.env.EMAIL_PASS,
      /**
       * Email address from which all emails will be sent
       */
      fromAddress: process.env.EMAIL_FROM_ADDRESS,
      /**
       * Name from which all emails will be sent
       */
      fromName: process.env.EMAIL_FROM_NAME,
    };

    /**
     * Exceptionless configuration
     * @property apiKey - The API key for Exceptionless.
     * @property serverUrl - The URL of the Exceptionless server.
     */
    this.exceptionless = {
      /**
       * API key for Exceptionless
       */
      apiKey: process.env.EXCEPTIONLESS_API_KEY,
      /**
       * URL of the Exceptionless server
       */
      serverUrl: process.env.EXCEPTIONLESS_SERVER_URL,
    };

    /**
     * Elasticsearch configuration
     * @property url - The URL of the Elasticsearch server.
     * @property apiKey - The API key for Elasticsearch.
     * @property index - The index name for Elasticsearch.
     */
    this.elasticsearch = {
      /**
       * URL of the Elasticsearch server
       */
      url: process.env.ELASTICSEARCH_URL,
      /**
       * API key for Elasticsearch
       */
      apiKey: process.env.ELASTICSEARCH_API_KEY,
      /**
       * Index name for Elasticsearch
       */
      index: process.env.ELASTICSEARCH_INDEX,
      /**
       * CA for Elasticsearch
       */
      ca: process.env.ELASTICSEARCH_CA,
    };

    /**
     * RSA configuration - Used for encrypting and decrypting data.
     * @property privateKey - The private key for RSA.
     * @property publicKey - The public key for RSA.
     */
    this.rsa = {
      /**
       * Private key for RSA
       */
      privateKey: process.env.RSA_PRIVATE_KEY,
      /**
       * Public key for RSA
       */
      publicKey: process.env.RSA_PUBLIC_KEY,
    };
  }

  /**
   * @method getDatabaseConfig
   * @description Get the value of a configuration variable.
   * @param {string} key - The configuration variable key.
   * @returns {string} The value of the configuration variable.
   */
  async getDatabaseConfig(key) {
    try {
      const knex = require("../database/index");
      const result = await knex("setting").where({ key }).select("value");
      return result.length > 0 ? result[0].value : null;
    } catch (error) {
      console.error("Error fetching configuration from database:", error);
      return null;
    }
  }

  /**
   * @method getDatabaseConfiguration
   * @description Get the configuration from the database.
   */
  async getDatabaseConfiguration() {
    // Loop through the configuration variables, the key is the name of the variable and the value is the default value for example email.host
    // Below, are the only configuration variables that can be set in the database
    const configVariables = {
      "app.autoAddAgents": this.app.autoAddAgents,
      "email.host": this.email.host,
      "email.port": this.email.port,
      "email.user": this.email.user,
      "email.pass": this.email.pass,
      "email.fromAddress": this.email.fromAddress,
      "email.fromName": this.email.fromName,
      "exceptionless.apiKey": this.exceptionless.apiKey,
      "exceptionless.serverUrl": this.exceptionless.serverUrl,
      "rsa.privateKey": this.rsa.privateKey,
      "rsa.publicKey": this.rsa.publicKey,
    };

    // Loop through the configuration variables
    for (const key in configVariables) {
      // Get the value of the configuration variable from the database
      const value = await this.getDatabaseConfig(key);
      // If the value is not null, set the value of the configuration variable
      if (value !== null) {
        // Split the key by dot
        const keyParts = key.split(".");
        // Set the value of the configuration variable
        this[keyParts[0]][keyParts[1]] = value;
      }
    }
  }

  /**
   * @method getInstance
   * @description Get an instance of the Config class.
   * @returns {Config} An instance of the Config class.
   */
  static getInstance() {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * @method refreshConfig
   * @description Refresh the configuration from the database.
   */
  async refreshConfig() {
    await this.getDatabaseConfiguration();
  }
}

// Export an instance of the Config class
module.exports = Config;
