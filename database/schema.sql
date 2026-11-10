-- ========================================================================
-- ForgeOS - Centralized Construction Management Platform
-- Full Relational Database Schema (PostgreSQL 16+)
-- ========================================================================

-- Enable standard UUID / crypto extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================================================
-- 1. ENUMS
-- ========================================================================

DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('ADMIN', 'PM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AreaUnit" AS ENUM ('SQFT', 'SQYD', 'SQM', 'ACRE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "MaterialCategory" AS ENUM (
        'CEMENT',
        'STEEL',
        'SAND_AGGREGATE',
        'BRICKS_BLOCKS',
        'TIMBER',
        'ELECTRICAL',
        'PLUMBING',
        'PAINT_FINISH',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "StockTxnType" AS ENUM ('IN', 'OUT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "OutReason" AS ENUM ('USED', 'DAMAGED', 'LOST');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BillCategory" AS ENUM ('MATERIAL', 'LABOUR', 'MACHINERY', 'SERVICES', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BillStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PARTIALLY_PAID', 'PAID');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'VOID', 'LOGIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "NotificationType" AS ENUM (
        'LOW_STOCK',
        'WASTAGE_ALERT',
        'BILL_OVERDUE',
        'BILL_SUBMITTED',
        'BILL_APPROVED',
        'BILL_REJECTED',
        'BUDGET_ALERT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ========================================================================
-- 2. CORE TABLES
-- ========================================================================

-- Users (Admins and Project Managers)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role "Role" NOT NULL DEFAULT 'PM',
    phone VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Lands (Land Parcels)
CREATE TABLE IF NOT EXISTS lands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address_line TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20),
    area_value NUMERIC(14, 2) NOT NULL,
    area_unit "AreaUnit" NOT NULL,
    survey_number VARCHAR(100),
    owner_name VARCHAR(255),
    purchase_date DATE,
    purchase_cost NUMERIC(16, 2),
    notes TEXT,
    created_by_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_lands_city_state ON lands(city, state);

-- Projects (Construction Sites)
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    land_id INT NOT NULL REFERENCES lands(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    start_date DATE,
    expected_end_date DATE,
    actual_end_date DATE,
    total_budget NUMERIC(16, 2) NOT NULL DEFAULT 0,
    wastage_threshold_pct NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
    assigned_pm_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_by_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_projects_budget CHECK (total_budget >= 0),
    CONSTRAINT chk_projects_threshold CHECK (wastage_threshold_pct BETWEEN 0 AND 100)
);
CREATE INDEX IF NOT EXISTS idx_projects_land_id ON projects(land_id);
CREATE INDEX IF NOT EXISTS idx_projects_assigned_pm_id ON projects(assigned_pm_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Materials (Master Catalog)
CREATE TABLE IF NOT EXISTS materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category "MaterialCategory" NOT NULL,
    unit VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_materials_name_ci ON materials (lower(name));

-- Vendors (Suppliers & Contractors)
CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    gstin VARCHAR(20) UNIQUE,
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_vendors_name_ci ON vendors (lower(name));

-- Project Material Plans (Budgeted BOM per Project)
CREATE TABLE IF NOT EXISTS project_material_plans (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    material_id INT NOT NULL REFERENCES materials(id) ON DELETE RESTRICT,
    planned_quantity NUMERIC(14, 3) NOT NULL,
    planned_unit_rate NUMERIC(12, 2),
    low_stock_threshold NUMERIC(14, 3),
    wastage_threshold_pct NUMERIC(5, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_project_material UNIQUE (project_id, material_id),
    CONSTRAINT chk_plan_qty CHECK (planned_quantity > 0)
);
CREATE INDEX IF NOT EXISTS idx_pmp_project_id ON project_material_plans(project_id);

-- Daily Logs (One record per project per day)
CREATE TABLE IF NOT EXISTS daily_logs (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    progress_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
    work_summary TEXT NOT NULL,
    weather VARCHAR(100),
    issues TEXT,
    created_by_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_project_log_date UNIQUE (project_id, log_date),
    CONSTRAINT chk_log_progress CHECK (progress_percent BETWEEN 0 AND 100)
);
CREATE INDEX IF NOT EXISTS idx_daily_logs_project_date ON daily_logs(project_id, log_date DESC);

-- Labour Entries (Breakdown of workers per trade on a daily log)
CREATE TABLE IF NOT EXISTS labour_entries (
    id SERIAL PRIMARY KEY,
    daily_log_id INT NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    trade VARCHAR(100) NOT NULL,
    contractor_name VARCHAR(255),
    head_count INT NOT NULL,
    hours_worked NUMERIC(4, 1) NOT NULL DEFAULT 8.0,
    remarks TEXT,
    CONSTRAINT chk_labour_headcount CHECK (head_count > 0),
    CONSTRAINT chk_labour_hours CHECK (hours_worked >= 0 AND hours_worked <= 24)
);
CREATE INDEX IF NOT EXISTS idx_labour_entries_daily_log_id ON labour_entries(daily_log_id);

-- Machinery Entries (Equipment deployed on site)
CREATE TABLE IF NOT EXISTS machinery_entries (
    id SERIAL PRIMARY KEY,
    daily_log_id INT NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    machine_name VARCHAR(100) NOT NULL,
    operator_name VARCHAR(255),
    hours_used NUMERIC(5, 2) NOT NULL,
    fuel_litres NUMERIC(8, 2),
    remarks TEXT,
    CONSTRAINT chk_machinery_hours CHECK (hours_used >= 0 AND hours_used <= 24)
);
CREATE INDEX IF NOT EXISTS idx_machinery_entries_daily_log_id ON machinery_entries(daily_log_id);

-- Bills (Invoices from Vendors & Contractors)
CREATE TABLE IF NOT EXISTS bills (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    vendor_id INT NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
    bill_number VARCHAR(100) NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE,
    category "BillCategory" NOT NULL,
    description TEXT,
    base_amount NUMERIC(14, 2) NOT NULL,
    gst_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
    gst_amount NUMERIC(14, 2) NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL,
    status "BillStatus" NOT NULL DEFAULT 'PENDING',
    submitted_by_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    approved_by_id INT REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_vendor_bill_number UNIQUE (vendor_id, bill_number),
    CONSTRAINT chk_bill_amounts CHECK (
        base_amount >= 0 AND gst_percent BETWEEN 0 AND 100
        AND gst_amount >= 0 AND total_amount = base_amount + gst_amount
    ),
    CONSTRAINT chk_bill_due CHECK (due_date IS NULL OR due_date >= bill_date),
    CONSTRAINT chk_bill_approval CHECK (
        status NOT IN ('APPROVED','PARTIALLY_PAID','PAID') OR (approved_by_id IS NOT NULL AND approved_at IS NOT NULL)
    )
);
CREATE INDEX IF NOT EXISTS idx_bills_project_status ON bills(project_id, status);
CREATE INDEX IF NOT EXISTS idx_bills_status_due ON bills(status, due_date);
CREATE INDEX IF NOT EXISTS idx_bills_open_due ON bills (due_date) WHERE status IN ('APPROVED', 'PARTIALLY_PAID');

-- Stock Transactions (IN/OUT Inventory Movement Ledger)
CREATE TABLE IF NOT EXISTS stock_transactions (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    material_id INT NOT NULL REFERENCES materials(id) ON DELETE RESTRICT,
    txn_type "StockTxnType" NOT NULL,
    quantity NUMERIC(14, 3) NOT NULL,
    unit_rate NUMERIC(12, 2), -- Informational, IN only
    vendor_id INT REFERENCES vendors(id) ON DELETE SET NULL, -- IN only
    bill_id INT REFERENCES bills(id) ON DELETE SET NULL,     -- IN only
    challan_number VARCHAR(100),
    out_reason "OutReason",                                  -- OUT only
    txn_date DATE NOT NULL,
    daily_log_id INT REFERENCES daily_logs(id) ON DELETE SET NULL,
    remarks TEXT,
    created_by_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    is_voided BOOLEAN NOT NULL DEFAULT FALSE,
    voided_by_id INT REFERENCES users(id) ON DELETE SET NULL,
    voided_at TIMESTAMPTZ,
    void_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_stock_qty_positive CHECK (quantity > 0),
    CONSTRAINT chk_stock_reason CHECK (
        (txn_type = 'IN'  AND out_reason IS NULL) OR
        (txn_type = 'OUT' AND out_reason IS NOT NULL)
    ),
    CONSTRAINT chk_stock_in_only_links CHECK (
        txn_type = 'IN' OR (vendor_id IS NULL AND bill_id IS NULL AND unit_rate IS NULL)
    ),
    CONSTRAINT chk_stock_void_fields CHECK (
        is_voided = TRUE OR (voided_by_id IS NULL AND voided_at IS NULL AND void_reason IS NULL)
    )
);
CREATE INDEX IF NOT EXISTS idx_stock_txns_lookup ON stock_transactions(project_id, material_id, txn_date);
CREATE INDEX IF NOT EXISTS idx_stock_txns_vendor_id ON stock_transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_stock_txns_bill_id ON stock_transactions(bill_id);

-- Payments (Cash / Cheque / Bank Payouts recorded against bills)
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    bill_id INT NOT NULL REFERENCES bills(id) ON DELETE RESTRICT,
    amount NUMERIC(14, 2) NOT NULL,
    payment_date DATE NOT NULL,
    mode "PaymentMode" NOT NULL,
    reference_number VARCHAR(100),
    remarks TEXT,
    recorded_by_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_payment_amount CHECK (amount > 0)
);
CREATE INDEX IF NOT EXISTS idx_payments_bill_id ON payments(bill_id);

-- Audit Logs (Tamper-evident system activity log)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action "AuditAction" NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INT,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date ON audit_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Notifications (In-app notifications for alerts)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type "NotificationType" NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    project_id INT REFERENCES projects(id) ON DELETE SET NULL,
    link VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    dedupe_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at);

-- Attachments (Uploaded challans, site photos, test certs)
CREATE TABLE IF NOT EXISTS attachments (
    id SERIAL PRIMARY KEY,
    daily_log_id INT REFERENCES daily_logs(id) ON DELETE CASCADE,
    bill_id INT REFERENCES bills(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    stored_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes INT NOT NULL,
    uploaded_by_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_attachment_target CHECK (
        (daily_log_id IS NOT NULL)::int + (bill_id IS NOT NULL)::int = 1
    )
);
CREATE INDEX IF NOT EXISTS idx_attachments_daily_log ON attachments(daily_log_id);
CREATE INDEX IF NOT EXISTS idx_attachments_bill ON attachments(bill_id);

-- ========================================================================
-- 3. ANALYTICS & INVENTORY VIEWS
-- ========================================================================

-- Current Stock Balance View (per Project, per Material)
CREATE OR REPLACE VIEW v_stock_balance AS
SELECT
    t.project_id,
    t.material_id,
    COALESCE(SUM(t.quantity) FILTER (WHERE t.txn_type = 'IN'),  0) AS total_in,
    COALESCE(SUM(t.quantity) FILTER (WHERE t.txn_type = 'OUT'), 0) AS total_out,
    COALESCE(SUM(CASE WHEN t.txn_type = 'IN' THEN t.quantity ELSE -t.quantity END), 0) AS balance
FROM stock_transactions t
WHERE t.is_voided = FALSE
GROUP BY t.project_id, t.material_id;

-- Material Wastage & Overrun Analysis View
CREATE OR REPLACE VIEW v_wastage_status AS
WITH latest_progress AS (
    SELECT DISTINCT ON (project_id) project_id, progress_percent
    FROM daily_logs
    ORDER BY project_id, log_date DESC
),
usage AS (
    SELECT
        project_id,
        material_id,
        COALESCE(SUM(quantity) FILTER (WHERE txn_type = 'OUT'), 0) AS consumed_qty,
        COALESCE(SUM(quantity) FILTER (WHERE txn_type = 'OUT' AND out_reason IN ('DAMAGED','LOST')), 0) AS recorded_wastage_qty
    FROM stock_transactions
    WHERE is_voided = FALSE
    GROUP BY project_id, material_id
)
SELECT
    pl.project_id,
    pl.material_id,
    pl.planned_quantity,
    pl.planned_unit_rate,
    COALESCE(lp.progress_percent, 0) AS progress_percent,
    ROUND(pl.planned_quantity * COALESCE(lp.progress_percent, 0) / 100, 3) AS expected_qty,
    COALESCE(u.consumed_qty, 0) AS consumed_qty,
    COALESCE(u.recorded_wastage_qty, 0) AS recorded_wastage_qty,
    GREATEST(COALESCE(u.consumed_qty, 0) - ROUND(pl.planned_quantity * COALESCE(lp.progress_percent, 0) / 100, 3), 0) AS overrun_qty,
    COALESCE(pl.wastage_threshold_pct, p.wastage_threshold_pct) AS threshold_pct
FROM project_material_plans pl
JOIN projects p ON p.id = pl.project_id
LEFT JOIN latest_progress lp ON lp.project_id = pl.project_id
LEFT JOIN usage u ON u.project_id = pl.project_id AND u.material_id = pl.material_id;

-- Project Financials Summary View
CREATE OR REPLACE VIEW v_project_financials AS
WITH bill_totals AS (
    SELECT
        project_id,
        COALESCE(SUM(total_amount) FILTER (WHERE status IN ('APPROVED','PARTIALLY_PAID','PAID')), 0) AS committed_amount,
        COALESCE(SUM(total_amount) FILTER (WHERE status = 'PENDING'), 0) AS pending_exposure,
        COUNT(*) AS total_bills_count
    FROM bills
    GROUP BY project_id
),
payment_totals AS (
    SELECT
        b.project_id,
        COALESCE(SUM(p.amount), 0) AS total_paid
    FROM payments p
    JOIN bills b ON b.id = p.bill_id
    GROUP BY b.project_id
)
SELECT
    p.id AS project_id,
    p.code AS project_code,
    p.name AS project_name,
    p.total_budget,
    COALESCE(bt.committed_amount, 0) AS committed_amount,
    COALESCE(bt.pending_exposure, 0) AS pending_exposure,
    COALESCE(pt.total_paid, 0) AS total_paid,
    (p.total_budget - COALESCE(bt.committed_amount, 0)) AS remaining_budget,
    COALESCE(bt.total_bills_count, 0) AS total_bills_count
FROM projects p
LEFT JOIN bill_totals bt ON bt.project_id = p.id
LEFT JOIN payment_totals pt ON pt.project_id = p.id;
