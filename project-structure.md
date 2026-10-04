project-scaffold/
├── backend/
│   └── src/
│       ├── modules/          # one folder per service: auth, users, organizations,
│       │                     # projects, tasks, finance, documents, analytics,
│       │                     # approvals, notifications — each with
│       │                     # routes / controller / service / repository / validators
│       ├── db/
│       │   ├── models/       # one file per entity from the schema (organizations,
│       │   │                 # users, projects, milestones, expenses, bills, etc.)
│       │   ├── migrations/
│       │   └── seeds/
│       ├── common/           # middleware (auth, rbac, error, validate, rateLimit),
│       │                     # config, utils, constants (roles, risk thresholds)
│       ├── integrations/
│       │   ├── whatsapp/     # client, webhook controller, command handlers
│       │   └── objectStorage/
│       └── jobs/             # reminder/notification scheduler
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── (auth)/       # login, register, reset-password
│       │   ├── (builder)/    # dashboard, projects, project detail, analytics, reports
│       │   ├── (manager)/    # assigned projects, tasks, expenses, bills, approvals...
│       │   └── (shared)/
│       ├── features/         # feature-scoped components (charts, forms, tables)
│       ├── components/       # shared UI + layout shells
│       ├── services/         # API clients, one per backend module
│       ├── hooks/, lib/, types/, styles/
├── docs/                     # your three source docs, ready to drop summaries into
└── README.md

database/
├── README.md            # how to run it standalone (psql, or your migration tool)
├── migrations/           # 11 numbered SQL files, in dependency order:
│   ├── 0001_organizations.sql
│   ├── 0002_users.sql
│   ├── 0003_roles.sql
│   ├── 0004_projects.sql            (+ project_members)
│   ├── 0005_land_assets.sql
│   ├── 0006_milestones_tasks.sql
│   ├── 0007_progress_updates.sql
│   ├── 0008_vendors.sql
│   ├── 0009_budgets_expenses.sql
│   ├── 0010_files_documents_bills.sql
│   └── 0011_approvals_notifications_audit.sql
├── seeds/
│   └── 0001_dev_seed.sql
└── docs/
    └── erd.md            # the mermaid ERD from your architecture doc