# 08. Development Workflow

How four people build one codebase without stepping on each other.

---

## 1. Principles

1. **Docs before code for contracts.** Change the API spec or schema doc in a PR first (or in the same PR), then code.
2. **Vertical slices.** Each member owns features end-to-end (DB → API → UI).
3. **Small PRs, merged often.** Aim for < 400 changed lines and merge at least every 1-2 days.
4. **`main` always works.** Never push directly. Never merge a red build.
5. **Pull before you push.** Rebase on `main` daily.

---

## 2. Git workflow

### 2.1 Branches
- `main`: protected; always deployable.
- Feature branches: `feat/<module>-<short-desc>` (e.g., `feat/bills-approval-flow`), `fix/…`, `docs/…`, `chore/…`.
- No long-lived `develop` branch (overkill for four people in one month).

### 2.2 Branch protection (GitHub → Settings → Branches)
- Require a pull request before merging, with **1 approval**.
- Require status checks (CI: lint, typecheck, test) to pass.
- Disallow force-push to `main`.

### 2.3 Commit messages (Conventional Commits)
```
feat(bills): add approve and reject endpoints
fix(stock): block OUT when balance is insufficient
docs(api): add wastage overview response
refactor(projects): extract summary query
test(stock): cover parallel OUT race
chore: bump prisma
```

### 2.4 Daily routine
```bash
git checkout main && git pull
git checkout -b feat/stock-ledger-ui
# ... work, commit often ...
git fetch origin && git rebase origin/main     # resolve conflicts locally
git push -u origin feat/stock-ledger-ui        # open PR
```

### 2.5 Conflict hotspots (coordinate before touching)
| File | Rule |
|---|---|
| `prisma/schema.prisma` | Announce in chat before editing. One schema PR at a time; merge it fast; everyone rebases |
| `routes/index.ts` (server), `routes/index.tsx` (client) | Each module adds one line. Resolve by keeping both |
| `package.json` / lockfile | Announce new dependencies; never commit a lockfile you regenerated from scratch |
| `docs/05-api-specification.md` | Edit only your module's section |
| `lib/constants.ts` | Append only |

---

## 3. Pull requests

### 3.1 Template (`.github/pull_request_template.md`)
```markdown
## What
<!-- One or two sentences -->

## Why / Linked task
<!-- Requirement IDs, e.g. BIL-3, BIL-R8 -->

## Changes
- [ ] Backend
- [ ] Frontend
- [ ] Database (migration included)
- [ ] Docs updated (API / schema / rules)

## How to test
<!-- Steps or seed logins, include role used -->

## Checklist
- [ ] `npm run lint && npm run typecheck && npm run test` pass locally
- [ ] Authorization checked for both roles
- [ ] Loading / empty / error states handled (UI)
- [ ] No new dependency (or listed here: …)
- [ ] Screenshots attached (UI changes)
```

### 3.2 Review rules
- Reviewer checks: contract match, business rules, authorisation scope, error handling, naming, tests. Don't just skim.
- Review within **24h**. Small PRs make this realistic.
- Author resolves every comment, then re-requests review. Squash-merge with a Conventional Commit title.

---

## 4. Code standards

### 4.1 TypeScript
- `strict: true`. No `any` (use `unknown` + narrowing). Prefer types inferred from Zod: `type BillCreate = z.infer<typeof billCreateSchema>`.
- Explicit return types on exported service functions.

### 4.2 Naming
| Thing | Rule | Example |
|---|---|---|
| Server files | `kebab-case.suffix.ts` | `bill.service.ts` |
| React components | `PascalCase.tsx` | `BillStatusBadge.tsx` |
| Hooks | `useXxx.ts` | `useBills.ts` |
| Functions/variables | `camelCase` | `approveBill` |
| Types/interfaces | `PascalCase` | `BillCreateInput` |
| Constants | `UPPER_SNAKE` | `EDIT_WINDOW_HOURS` |
| DB | `snake_case` | `daily_logs.log_date` |

### 4.3 Server do's and don'ts
- Controllers: ≤ ~15 lines per handler; no Prisma, no rules.
- Services: one exported function per use case, each with access check, rule checks, transaction, audit.
- Use `AppError` for all expected failures.
- No `console.log`; use the logger.
- Raw SQL only through tagged-template `$queryRaw` (parameterised).

### 4.4 Client do's and don'ts
- Data only via `features/*/api.ts` + hooks.
- Forms: RHF + Zod; show field errors; disable submit while pending.
- Components < ~200 lines; split when bigger.
- Keep money/quantity formatting in `lib/format.ts`, never inline.

### 4.5 Tooling
- **ESLint** (typescript-eslint, react-hooks, import ordering) + **Prettier** (single quotes, semicolons, 100 cols). Format on save.
- Optional: `husky` + `lint-staged` to run Prettier/ESLint on commit.
- `.editorconfig` for consistent line endings. Commit `.gitattributes` with `* text=auto` (helps Windows/Mac mixes).

---

## 5. Local setup (new member checklist)

1. Install Node.js 22 LTS, Git, Docker Desktop.
2. Clone, copy both `.env.example` files (README quick start).
3. `docker compose up -d db`, `npm install`, `npm run db:migrate`, `npm run db:seed`, `npm run dev`.
4. Log in as Admin and as PM; click through every page once.
5. Read `AI_CONTEXT.md`, then `03`, `04`, `05` in order.

### Root `package.json` scripts (reference)
```jsonc
{
  "private": true,
  "workspaces": ["client", "server"],
  "scripts": {
    "dev": "concurrently -n server,client -c blue,green \"npm run dev -w server\" \"npm run dev -w client\"",
    "build": "npm run build -w server && npm run build -w client",
    "lint": "eslint .",
    "typecheck": "npm run typecheck -w server && npm run typecheck -w client",
    "test": "npm run test -w server && npm run test -w client",
    "db:migrate": "npm run prisma:migrate -w server",
    "db:seed": "npm run prisma:seed -w server",
    "db:reset": "npm run prisma:reset -w server",
    "db:studio": "npm run prisma:studio -w server"
  }
}
```

---

## 6. Testing workflow

- Integration tests use a **separate database** (`buildtrack_test`), configured via `DATABASE_URL` in `server/.env.test`. Each test file resets the data it needs (truncate tables or run in transactions).
- Write tests alongside the feature (see `07-business-rules.md` §10 for the minimum list).
- Frontend: test login, route protection, and one complex form (daily log or bill). Everything else is covered by manual QA.

---

## 7. CI (GitHub Actions): `.github/workflows/ci.yml`

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: buildtrack
          POSTGRES_PASSWORD: buildtrack
          POSTGRES_DB: buildtrack_test
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U buildtrack"
          --health-interval 5s --health-timeout 5s --health-retries 10
    env:
      DATABASE_URL: postgresql://buildtrack:buildtrack@localhost:5432/buildtrack_test?schema=public
      JWT_SECRET: ci-secret-ci-secret-ci-secret-ci-secret
      CORS_ORIGIN: http://localhost:5173
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npx prisma migrate deploy
        working-directory: server
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
```

---

## 8. Working with AI assistants

Everyone uses AI tools, so keep output consistent:

1. **Start every session** by giving the assistant `AI_CONTEXT.md`, then the specific docs for the task (e.g., `04`, `05`, `07` for a bills feature).
2. **One feature per prompt/branch.** Ask for the plan first, then code layer by layer (schema → service → controller → route → test → UI).
3. **Prompt template**
   ```
   Read AI_CONTEXT.md and docs/05 §3.10, docs/07 §4.
   Implement POST /bills/:id/approve (BIL-3, BIL-R8) following the module pattern
   in docs/03 §4. Include the service with transaction + audit, controller, route,
   Zod schema, and a Supertest test for success, wrong status, and PM forbidden.
   Do not change prisma/schema.prisma.
   ```
4. **Never accept blindly.** Run it, read the diff, check authorisation and edge cases against the rules doc.
5. **AI must not change** the schema, the API contract, or dependencies without a team decision. If it suggests it, raise it in the group chat.
6. **Keep docs the source of truth.** If the AI "improves" behaviour, update the docs in the same PR or revert.
7. Never paste secrets or real data into AI tools.

---

## 9. Definition of done (any task)

- [ ] Meets the requirement ID(s) and acceptance criteria in `02`
- [ ] Matches `05` (API) and `04` (schema); docs updated if changed
- [ ] Business rules from `07` enforced server-side
- [ ] Authorisation verified for Admin and PM (including a "not my project" check)
- [ ] Audit log written for mutations
- [ ] Tests added; lint, typecheck, and test pass
- [ ] UI: states handled, responsive, role-correct
- [ ] PR reviewed and merged to `main`

---

## 10. Communication

- Group chat for quick questions; GitHub issues/PR comments for decisions that need a record.
- **Stand-up (10 min), 2-3 times per week:** done / next / blocked.
- **Weekly demo (30 min):** each member shows their slice working on `main` with seed data.
- Record decisions in `docs/02-requirements.md` §2 (Decisions log).
- Task board: GitHub Projects with columns `Backlog → In progress → In review → Done`. One issue per requirement ID or small group of IDs.
