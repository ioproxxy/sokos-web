# Database migrations directory
To perform a local or cloud migration on your relational database instances:
1. Generate knex migrations: `npx knex migrate:make migration_name`
2. Run migrations: `npm run migrate` or using our shell scripts `scripts/migrate.sh`.
