---
sidebar_position: 2
---

# Guides

## Database Migrations

For Container Echoes we make use of [Knex.js](http://knexjs.org/) for database migrations. This allows us to easily manage the database schema and keep it in sync with the application's codebase.

Before you can run the migrations, you need to copy/make the `.env.example` file and rename it to `.env`. This file contains the environment variables that are used to connect to the database you must copy this from `server/.env.example` to `core/.env` and fill in the appropriate values. When making migrations DO NOT run the server via `npm run live` as it will cause it run the migrations before you are ready. This is due to the server running the migrations on start up.

To create a new migration, run the following command in the `core` directory:

```bash
knex migrate:make migration_name
```

This will create a new migration file in the `core/database/migrations` directory. The file will contain two functions: `up` and `down`. The `up` function is used to define the changes that should be applied to the database, while the `down` function is used to define the changes that should be reverted.

Here's an example of a migration file:

```javascript
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('name');
    table.string('email');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
```

## Running Migrations

To run the migrations and apply the changes to the database, run the following command in the `core` directory:

```bash
knex migrate:latest
```

If you need to revert the changes made by a migration, you can run the following command in the `core` directory:

```bash
knex migrate:rollback
```
