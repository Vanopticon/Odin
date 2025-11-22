# Express server (dev and prod)

This project includes two small Express entry points that let you run the app under Express:

- `server/dev.js` — runs an Express server that mounts Vite in middleware mode for development (HMR + Svelte plugin).
- `server/prod.js` — serves the `build/` output (static assets) and attempts to mount the adapter-node handler (`build/handler.js`) if present.

Commands

- Dev (use this while developing):

```bash
pnpm install
pnpm dev
# or
node server/dev.js
```

- Build and run production server:

```bash
pnpm build
node server/prod.js
# or
pnpm start
```

Notes

- `server/prod.js` will try to import `build/handler.js` (created by `@sveltejs/adapter-node`) and mount it. If it's not present the server will fall back to serving the static `build` output.
- `server/dev.js` runs Vite in middleware mode; it relies on your `vite.config.ts` and `svelte` plugin configuration.
