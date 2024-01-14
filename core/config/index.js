// Require all the environment variables
require("dotenv").config();

class Config {
  /**
   * @class Config
   * @description The Config class is a singleton class that holds all the configuration variables for the application.
   * @property app - Application related configuration.
   * @property db - Database related configuration.
   * @property jwt - JWT related configuration.
   * @property sentry - Sentry related configuration.
   * @property email - Email related configuration.
   * @property exceptionless - Exceptionless related configuration.
   */
  constructor() {
    /**
     * Application related configuration
     * @property port - The port number for the application server.
     * @property env - The environment in which the app is running, e.g., 'development', 'production'.
     * @property url - The base URL of the application.
     * @property frontendUrl - The base URL of the frontend application.
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
       * Base URL of the frontend application
       */
      frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
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
       * Database client: mysql or pg
       */
      client: process.env.DB_CLIENT || "mysql",
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
      name: process.env.DB_NAME || "automationwatchdog",
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
     * @property backend - Sentry DSN for backend.
     * @property cron - Sentry DSN for cron.
     */
    this.sentry = {
      /**
       * Sentry DSN for backend
       */
      backend: process.env.SENTRY_BACKEND_DSN,
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
  }
}

// Export an instance of the Config class
module.exports = new Config();
