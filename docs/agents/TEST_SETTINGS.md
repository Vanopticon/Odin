# Test Settings

**Purpose**: Keep test-only configuration values in one place to avoid scattered `process.env` manipulation in tests.

**File**: `src/lib/test_settings.ts` exports deterministic values used by unit tests (DB_URL, PKCE/OAuth test secrets, cookie secret, HMR ports, etc.).

**Usage**:

```ts
// example in a Vitest test file
import { vi } from 'vitest';
const testSettings = await import('$lib/test_settings');
vi.doMock('$lib/settings', () => ({ ...testSettings, DB_URL: 'postgres://user:pass@localhost:5432/db' }));
const mod = await import('$lib/db/data-source');
```

**Why**:

* Avoids brittle `process.env` manipulation and ensures all tests use consistent defaults.
* Makes it easy to override specific values per-test by spreading `test_settings` and replacing keys.

**Best practices**:

* Keep `test_settings` values stable and deterministic.
* Only mock `$lib/settings` in tests where application code reads configuration during module initialization.
* Restore mocks with `vi.restoreAllMocks()` in `afterEach`.
