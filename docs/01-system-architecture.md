# System Architecture

1. System Goal
Build a centralized project and financial management platform for
builders who manage multiple real estate/construction projects and
managers who maintain operational records.
The central design principle is:
**Manager data entry → centralized storage → validation/processing →
analytics → Builder decision-making**
2. High-Level Architecture
flowchart LR
U1[Builder]
U2[Project Manager / Site Team]
U1 --> BG[Builder Gateway]
U2 --> MG[Manager Gateway]
BG --> FE[Web Frontend]
MG --> FE
FE --> API[Backend API]
API --> AUTH[Auth + RBAC]
API --> PROJECT[Project Service]
API --> TASK[Task & Milestone Service]
API --> FIN[Finance Service]
API --> DOC[Document Service]
API --> ANALYTICS[Analytics Service]
API --> NOTIFY[Notification Service]
PROJECT --> DB[(PostgreSQL / Relational DB)]
TASK --> DB
FIN --> DB
DOC --> DB
ANALYTICS --> DB
DOC --> STORAGE[(Object Storage)]
NOTIFY --> WA[WhatsApp Business API]
3. Frontend
The frontend can be implemented as a modern SPA using React/Next.js or
an equivalent framework.
Major areas: - Authentication - Builder dashboard - Manager dashboard -
Project details - Tasks and milestones - Expenses - Bills and receipts -
Documents - Analytics - Notifications - User/profile management
The UI should be responsive and permission-aware.
4. Backend
The backend exposes authenticated APIs and owns business rules.
Core responsibilities: - Authentication - Authorization - CRUD
operations - Validation - Project calculations - Expense aggregation -
Progress calculations - Forecasting - File metadata management -
Notification triggering - Audit logging
A modular monolith is recommended for the capstone. It keeps deployment
and debugging manageable while preserving clean service boundaries.
Microservices can wait for their inevitable appearance in a future
architecture diagram.
5. Authentication and RBAC
Recommended roles: - Builder/Owner - Project Manager - Site
Manager/Staff - Admin
Example permissions:
Capability Builder Manager Site Staff Admin
-------------------------- ---------- ---------- ------------ -------
View all projects Yes Assigned Assigned Yes
View financial analytics Yes Limited Limited Yes
Update project progress Optional Yes Yes Yes
Add expenses Optional Yes Yes Yes
Upload bills/receipts Optional Yes Yes Yes
Manage users No No No Yes
Configure projects Yes Limited No Yes
6. Database
Use a relational database because projects, users, tasks, expenses,
documents, vendors, and approvals have strong relationships.
Primary entities: - organizations - users - roles - projects -
project_members - land_assets - milestones - tasks - progress_updates -
budgets - expenses - vendors - bills - documents - notifications -
approvals - audit_logs
7. File Storage
Binary files such as receipts, bills, images, and documents should not
be stored directly inside the relational database.
Store: - file URL/key - file name - MIME type - size - uploader -
project ID - expense/bill/document reference - upload timestamp
in the database, while the actual file is kept in object storage.
8. Financial Analytics
Core calculations: - Budget = approved project budget - Actual spend =
sum of approved/recorded expenses - Remaining budget = Budget - Actual
spend - Estimated remaining cost = forecast of costs required to
complete the project - Projected final cost = Actual spend + Estimated
remaining cost - Variance = Projected final cost - Budget
The system should clearly distinguish actual recorded costs from
estimates.
9. Progress Analytics
Track: - Planned start/end date - Actual progress percentage - Planned
progress percentage - Milestones - Task completion - Delayed tasks
Example risk logic: - On Track: actual progress is close to planned
progress - Watch: moderate schedule/cost variance - At Risk: material
variance or overdue critical milestone - Delayed: deadline exceeded or
critical milestone missed
These thresholds should be configurable rather than hard-coded.
10. WhatsApp Integration
The backend should communicate with WhatsApp through the official
Business API/provider.
Outbound flow:
Event occurs
↓
Backend creates notification
↓
Notification worker
↓
WhatsApp API
↓
User receives message
Inbound flow:
User replies
↓
WhatsApp webhook
↓
Backend verifies webhook
↓
Identify user/context
↓
Process supported command
↓
Update database or create task
The first version should keep WhatsApp actions narrow and auditable. Do
not allow arbitrary financial changes from a text message.
11. Security
Required controls: - Password hashing - Session/JWT security - RBAC -
Server-side authorization checks - Input validation - File type and size
validation - Secure object-storage permissions - Rate limiting - Audit
logs - HTTPS - Secret management - Database backups - Webhook signature
verification
12. Deployment
Suggested production layout:
Browser
↓ HTTPS
Frontend Hosting / CDN
↓
Backend Application
■■■ Relational Database
■■■ Object Storage
■■■ Background Worker
■■■ WhatsApp API
Containerization with Docker is recommended for consistent development
and deployment.