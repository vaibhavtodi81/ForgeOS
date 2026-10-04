# Requirements

Problem
Builders managing multiple projects often depend on fragmented Excel
files, physical receipts, bills, documents, and informal communication.
Managers maintain operational data separately, causing duplication,
stale information, missing records, weak financial visibility, and
delayed identification of project issues.
Objective
Create a centralized platform where managers maintain reliable
operational records and builders consume those records through
portfolio-level dashboards, analytics, forecasts, and alerts.
Functional Requirements
Authentication
• User registration/invitation
• Login/logout
• Password reset
• Role-based access
• Organization/project-level permissions
Builder Gateway
• Portfolio dashboard
• Project cards/list
• Project detail
• Progress analytics
• Budget vs actual
• Expense breakdown
• Estimated remaining cost
• Projected final cost
• Timeline analysis
• Delay/risk indicators
• Reports
• Notifications
• Document visibility
Manager Gateway
• Assigned projects
• Task creation/update
• Milestone management
• Progress updates
• Expense entry
• Bill/receipt upload
• Document upload
• Vendor/contractor management
• Pending approvals
• Status submission
Expense Management
• Amount
• Date
• Category
• Vendor
• Project
• Description
• Payment status
• Receipt/bill attachment
• Approval status
Document Management
• Upload
• Categorization
• Project association
• Metadata
• Search/filter
• Access control
• Download/view
Notifications
• In-app notifications
• Email if required
• WhatsApp notifications
• Deadline reminders
• Approval alerts
• Project risk alerts
Non-Functional Requirements
Performance
Dashboard APIs should be designed for fast response using indexed
queries and aggregated data.
Security
All sensitive endpoints must enforce authentication and authorization
server-side.
Reliability
Database backups and error logging should be implemented.
Scalability
The architecture should support multiple organizations, projects, users,
and files without requiring a redesign.
Maintainability
Use modular backend components, API documentation, migrations, tests,
and environment-based configuration.
MVP Scope
Priority 1: - Authentication/RBAC - Builder dashboard - Manager
dashboard - Project management - Tasks/milestones - Progress updates -
Expense management - Bill/receipt upload - Database - Basic analytics
Priority 2: - WhatsApp notifications - Document search - Approvals -
Advanced reports - Cost forecasting
Priority 3: - OCR for receipts - Automated anomaly detection - Advanced
forecasting - Mobile/PWA improvements - External accounting integrations