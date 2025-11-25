## Database: TypeORM setup

This project uses TypeORM with PostgreSQL. The TypeORM entities live under `src/lib/types` and the DataSource is defined at `src/lib/db/data-source.ts`.

Quick setup

- Install dependencies:

```bash
pnpm install
# or
npm install
```

- Provide a `DATABASE_URL` in a `.env` file at the project root. Example:

```env
DATABASE_URL=postgres://user:password@localhost:5432/odin_db
```

- Build the project (compiles TypeScript to JS under `dist/`):

```bash
pnpm build
```

- Run migrations (build step ensures compiled migration runner exists):

```bash
pnpm migrate:run
```

Notes

- The DataSource and migrations live inside the Svelte source at `src/lib/db` (no server-side wiring required).
- `synchronize` is set to `false` by default — use migrations to change schema safely.

If you want to run migrations without building, consider running the TypeScript runner directly (e.g., `ts-node`), but building is the supported path here.
