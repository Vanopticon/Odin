# E2E Selenium + Chromedriver Design

This document explains the design decisions for the Selenium end-to-end (E2E) test runner used by Odin. The runner is implemented at `scripts/run-e2e-selenium.cjs` and is intended to run locally and in CI using a system-installed Chromedriver when possible.

Goals

- Use a stable, system-provided Chromedriver that matches the installed Chrome/Chromium.
- Avoid port conflicts and race conditions when starting Chromedriver and connecting Selenium.
- Make the runner reliable in CI (headless, sandbox-safe, no profile reuse) and informative for troubleshooting.

Key Design Decisions

Prefer system Chromedriver

The runner searches common system locations (e.g. `/usr/bin/chromedriver`, `/usr/local/bin`, distribution package locations) and `PATH` before falling back to any project-local binary. Using the system binary avoids version mismatches between the packaged `chromedriver` npm module and the system Chrome/Chromium used by CI or developer machines.

Spawn Chromedriver on an ephemeral port

To avoid "address already in use" errors and port collisions across parallel runners, the script spawns Chromedriver with `--port=0` (request ephemeral port). Chromedriver prints the final bound port to stdout; the runner parses stdout to extract the actual port.

Robust port detection

Chromedriver may emit interim messages (e.g. an early "on port 0" log) before the real port is chosen. The runner watches Chromedriver stdout/stderr for lines matching port patterns, prefers messages like "started successfully on port <n>" when present, and falls back to the last observed "on port <n>" entry that is non-zero.

Polling Chromedriver `/status` for readiness

Even after the process prints the bound port, the HTTP server may not be ready to accept connections. The runner polls `http://localhost:<port>/status` until it returns HTTP 200 before creating a Selenium session. This avoids `ECONNREFUSED` races.

Connect via Selenium `usingServer`

Once Chromedriver is listening, the runner passes the server URL (e.g. `http://localhost:<port>`) to the Selenium `Builder` using `usingServer(...)` so that the WebDriver client communicates over HTTP to the spawned Chromedriver.

Headless and sandbox flags

For CI and headless environments the runner configures Chrome options with safe flags: `--headless=new`, `--no-sandbox`, `--disable-dev-shm-usage`, `--disable-gpu`, and `--ignore-certificate-errors`.

Avoid reusing `--user-data-dir`

Reusing an existing Chrome profile can cause session creation failures (profile lock, incompatible preferences). The runner avoids passing a user data dir unless explicitly needed.

Subprocess lifecycle and cleanup

Chromedriver and the dev server are spawned as child processes. The runner ensures both are killed on success or error to prevent dangling processes in CI.

Environment & Usage

- Environment variables:
    + `OD_HOST` — Host used to construct `BASE_URL` (optional).
    + `OD_PORT` — Port used to construct `BASE_URL` (defaults to `3000`).
    + `OD_CHROMEDRIVER_PORT` — Optional explicit Chromedriver port; if unset, the runner uses an ephemeral port.

- Run locally:

```bash
pnpm test:e2e
```

Troubleshooting

- `SessionNotCreatedError` / `Chrome instance exited`:
    + Verify the installed `chromedriver` version matches the Chrome/Chromium version.
    + Check Chromedriver stdout/stderr for DevTools errors or permission issues.

- `ECONNREFUSED` to Chromedriver:
    + Ensure the Chromedriver binary is executable and not blocked by permissions or SELinux.
    + If using a fixed `OD_CHROMEDRIVER_PORT`, confirm the port is free; otherwise let the runner use an ephemeral port.

CI Recommendations

- For reliable CI runs, install a known-compatible Chrome and Chromedriver pair. Options:
    + Use "chrome-for-testing" releases pinned to a specific version.
    + Use distribution packages that include matching Chromedriver (e.g., `chromium-chromedriver`).
    + Cache browser binaries between runs where possible.

- Ensure the CI runner grants execution permission to the Chromedriver binary and that the runner can open ephemeral ports.

Notes

- This design favors reliability and explicitness in CI over convenience of using the `chromedriver` npm package. The code still falls back to a packaged binary when system binaries are unavailable, but the preferred path is the system Chromedriver.
