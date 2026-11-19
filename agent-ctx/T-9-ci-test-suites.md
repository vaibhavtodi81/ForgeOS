# T-9 — CI workflow + per-part test suites

## What was delivered

### 1. Frontend test suite (NEW — `tests/frontend/`)
13 files / 176 tests, jsdom + Testing Library + user-event, all network mocked
(vi.stubGlobal fetch — no DB, no server):

| Layer | Files | Coverage |
|---|---|---|
| Unit | 01-router, 02-api-client, 03-session-permissions, 04-project-utils, 05-dashboard-api | hash router, API client envelope/error mapping, RBAC matrix, project helpers, dashboard request shaping |
| Hooks | 06-auth-provider, 07-projects-provider, 08-useDashboardData | login/restore/logout, project list + selection + retry, dashboard loading→data→error |
| Components | 09-login-page, 10-app-shell-components, 11-dashboard-ui, 12-dashboard-pages | login form validation + submit + error, Sidebar/Topbar/Breadcrumbs/ProjectSelector/command palette, StatCard/ProgressBar/etc., full Admin + PM dashboard pages |

Shared helpers in `tests/frontend/test-utils.tsx` (fetch route stubbing, envelope
builders, user fixtures, state resets). Harness smoke test: `00-harness-smoke.test.tsx`.

### 2. Per-part npm scripts
- `test` — everything: `test:unit` → `test:integration` → `test:frontend`
- `test:backend` — unit + integration
- `typecheck` — `tsc --noEmit` (tsconfig now excludes `examples/`, `skills/`,
  `mini-services/`, `agent-ctx/` sandbox scaffolding that isn't app code)
- `db:seed` — `bun prisma/seed.ts`

### 3. CI workflow — `.github/workflows/ci.yml`
Separate job per part (bun + `--frozen-lockfile`, prisma generate, concurrency
cancel, read-only permissions):

1. **lint** — ESLint
2. **typecheck** — tsc --noEmit
3. **backend-unit** — 42 tests
4. **backend-integration** — recreates + reseeds `db/test.db` from scratch
   (`rm` → `db push` → seed with `DATABASE_URL` override), then 173 tests
5. **frontend-tests** — 176 jsdom tests
6. **build** — `next build` (needs lint + typecheck)
7. **ci-ok** — single green gate for branch protection

Triggers: push to main, all pull requests, manual dispatch.

## Environment fix (was breaking everything)
`.env` had been clobbered down to only `DATABASE_URL` — the missing
`JWT_SECRET` (a) failed `tests/setup.ts` on all 17 backend suites and
(b) broke runtime login (signSession throws without a ≥32-char secret).
Restored with a fresh 64-hex-char dev secret (committed — non-production).

## Test bugs found and fixed during review
- 4 ambiguous-query failures (getByText matching multiple legitimate elements)
- 1 race in the PM dashboard cockpit test (H1 renders on session restore, but
  the featured card needs BOTH the projects and dashboard fetch chains —
  now awaited via findByText)
- react-hooks/globals lint violation (outer-variable reassignment in render)
- `calledUrls` helper type rejected `Mock` instances (Parameters tuple mismatch)
- invalid `exact: true` option on getByRole

## Verified
- `bun run test` — 391/391 passing (42 + 173 + 176)
- `bun run lint`, `bun run typecheck` — clean
- CI integration-job sequence simulated locally end-to-end (fresh test.db
  recreate + seed + 173 tests green)
- Browser golden path: landing page → login (admin@forgeos.local) →
  `#/app/admin/dashboard` with live backend data, zero console errors
