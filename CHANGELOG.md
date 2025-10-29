# CHANGELOG

// Authored in part by GitHub Copilot - 2025-10-29

## Unreleased

### 2025-10-29

- Integrated OpenID Connect authentication using openid-client and express-session in server/server.ts.
- Added secure session management and PKCE support for OIDC login flows.
- Implemented global redirect for unauthenticated users and improved error handling.
- Added no-cache headers for all responses.
- Updated HTTPS server setup to enforce TLS 1.3.
- Improved type safety for Express session and request objects.
- Updated vite.config.ts to add Tailwind CSS support via @tailwindcss/vite plugin.

### 2025-10-28

- Added initial project setup with SvelteKit and related configurations.
- Configured hardened Express hosting and disabled built-in Vite server.
- Added SVG logo for Odin.
- Included image assets (32x32, 64x64, 512x512).
- Created robots.txt to allow all web crawlers.
- Set up SvelteKit configuration in svelte.config.js.
- Configured TypeScript settings in tsconfig.json.
- Established Vite configuration with HTTPS support in vite.config.ts.
- Added Vitest setup for client testing.

### 2025-10-06

- Initial commit.
- Initial repository setup.
- Set package ecosystem to 'cargo' in dependabot config.
