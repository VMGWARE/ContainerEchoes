# Migrations

## Creating a migration

To create a migration, run the following command:

```bash
npm run migration:create -- --name <migration-name>
```

This will create a new migration file in the `migrations` directory. The file name will be in the following format: `<timestamp>-<migration-name>.js`.

## Naming conventions

The migration file name should be in the following format: `<timestamp>-<migration-name>.js`. Some important things to not that it should be named like `20200101000000-create-users.js` or `20200101000000-add-username-to-users.js`.
