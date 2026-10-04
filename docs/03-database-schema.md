# Database Schema

Core Tables
organizations
• id
• name
• created_at
users
• id
• organization_id
• name
• email
• phone
• password_hash
• status
• created_at
roles
• id
• name
user_roles
• user_id
• role_id
projects
• id
• organization_id
• name
• description
• location
• status
• start_date
• planned_end_date
• actual_end_date
• approved_budget
• created_by
• created_at
project_members
• project_id
• user_id
• role
land_assets
• id
• project_id
• parcel/reference_number
• area
• acquisition_status
• notes
milestones
• id
• project_id
• name
• planned_date
• actual_date
• status
• weight
tasks
• id
• project_id
• milestone_id
• assigned_to
• title
• description
• priority
• status
• planned_start
• due_date
• completed_at
progress_updates
• id
• project_id
• task_id
• percentage
• note
• submitted_by
• created_at
budgets
• id
• project_id
• category
• planned_amount
expenses
• id
• project_id
• category
• vendor_id
• amount
• expense_date
• description
• status
• created_by
• created_at
vendors
• id
• organization_id
• name
• phone
• email
• type
bills
• id
• expense_id
• bill_number
• bill_date
• amount
• file_id
• verification_status
documents
• id
• project_id
• type
• title
• file_id
• uploaded_by
• created_at
files
• id
• storage_key
• original_name
• mime_type
• size
• uploaded_by
• created_at
approvals
• id
• project_id
• reference_type
• reference_id
• requested_by
• approved_by
• status
• comments
• created_at
notifications
• id
• user_id
• type
• channel
• title
• message
• status
• sent_at
audit_logs
• id
• user_id
• action
• entity_type
• entity_id
• metadata
• created_at
Relationships
erDiagram
ORGANIZATIONS ||--o{ USERS : has
ORGANIZATIONS ||--o{ PROJECTS : owns
PROJECTS ||--o{ PROJECT_MEMBERS : has
USERS ||--o{ PROJECT_MEMBERS : joins
PROJECTS ||--o{ MILESTONES : contains
MILESTONES ||--o{ TASKS : contains
PROJECTS ||--o{ TASKS : contains
PROJECTS ||--o{ EXPENSES : records
VENDORS ||--o{ EXPENSES : receives
EXPENSES ||--o| BILLS : has
BILLS }o--|| FILES : references
PROJECTS ||--o{ DOCUMENTS : contains
DOCUMENTS }o--|| FILES : references
PROJECTS ||--o{ BUDGETS : has
USERS ||--o{ NOTIFICATIONS : receives
USERS ||--o{ AUDIT_LOGS : creates