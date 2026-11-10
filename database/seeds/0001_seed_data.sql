-- ========================================================================
-- ForgeOS Database Seed Data (0001_seed_data.sql)
-- Complete seed dataset for development, staging and demonstrations
-- ========================================================================

-- Clean existing data in reverse dependency order
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE bills CASCADE;
TRUNCATE TABLE stock_transactions CASCADE;
TRUNCATE TABLE machinery_entries CASCADE;
TRUNCATE TABLE labour_entries CASCADE;
TRUNCATE TABLE daily_logs CASCADE;
TRUNCATE TABLE project_material_plans CASCADE;
TRUNCATE TABLE vendors CASCADE;
TRUNCATE TABLE materials CASCADE;
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE lands CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE users CASCADE;

-- 1. USERS
-- Default passwords:
-- Admin: Admin@123
-- PMs: Pm@12345
INSERT INTO users (id, name, email, password_hash, role, phone, is_active, created_at, updated_at) VALUES
(1, 'Administrator', 'admin@forgeos.com', '$2b$10$wT8K8U1Q2/sXmI7g8Eeq.OPd9j8v4rEa4qT4a5Y7qK6l.ZkK8aW3C', 'ADMIN', '+91 98100 00001', TRUE, NOW(), NOW()),
(2, 'Aarav Sharma', 'aarav@forgeos.com', '$2b$10$wT8K8U1Q2/sXmI7g8Eeq.OPd9j8v4rEa4qT4a5Y7qK6l.ZkK8aW3C', 'PM', '+91 98200 00002', TRUE, NOW(), NOW()),
(3, 'Priya Mehta', 'priya@forgeos.com', '$2b$10$wT8K8U1Q2/sXmI7g8Eeq.OPd9j8v4rEa4qT4a5Y7qK6l.ZkK8aW3C', 'PM', '+91 98300 00003', TRUE, NOW(), NOW()),
(4, 'Rohan Verma', 'rohan@forgeos.com', '$2b$10$wT8K8U1Q2/sXmI7g8Eeq.OPd9j8v4rEa4qT4a5Y7qK6l.ZkK8aW3C', 'PM', '+91 98400 00004', TRUE, NOW(), NOW()),
(5, 'Neha Kapoor', 'neha@forgeos.com', '$2b$10$wT8K8U1Q2/sXmI7g8Eeq.OPd9j8v4rEa4qT4a5Y7qK6l.ZkK8aW3C', 'PM', '+91 98500 00005', TRUE, NOW(), NOW());

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 2. LANDS
INSERT INTO lands (id, name, address_line, city, state, pincode, area_value, area_unit, survey_number, owner_name, purchase_date, purchase_cost, created_by_id, created_at, updated_at) VALUES
(1, 'Sector 62 Parcel A', 'Golf Course Ext Road', 'Gurugram', 'Haryana', '122001', 4.50, 'ACRE', 'SUR-GGN-2024-89', 'ForgeOS Holdings Ltd', '2024-03-15', 38000000.00, 1, NOW(), NOW()),
(2, 'Okhla Industrial Plot 42', 'Phase 3, Near Crown Plaza', 'Delhi', 'Delhi', '110020', 2.80, 'ACRE', 'SUR-DL-2024-11', 'ForgeOS Commercial Infra', '2024-06-20', 54000000.00, 1, NOW(), NOW()),
(3, 'Expressway Sector 137', 'Noida-Greater Noida Expy', 'Noida', 'Uttar Pradesh', '201305', 3.20, 'ACRE', 'SUR-NOI-2023-74', 'ForgeOS Living Spaces', '2023-11-10', 29000000.00, 1, NOW(), NOW()),
(4, 'Ajmer Road Growth Hub', 'Near Mahindra SEZ', 'Jaipur', 'Rajasthan', '302026', 6.00, 'ACRE', 'SUR-JPR-2025-03', 'ForgeOS Rajasthan Ventures', '2025-01-18', 21000000.00, 1, NOW(), NOW());

SELECT setval('lands_id_seq', (SELECT MAX(id) FROM lands));

-- 3. PROJECTS
INSERT INTO projects (id, land_id, code, name, description, status, start_date, expected_end_date, total_budget, wastage_threshold_pct, assigned_pm_id, created_by_id, created_at, updated_at) VALUES
(1, 1, 'PRJ-001', 'Green Valley Residency', 'Four towers G+18 premium residential community with club house and basement parking.', 'ACTIVE', '2026-01-10', '2026-12-20', 25000000.00, 8.00, 2, 1, NOW(), NOW()),
(2, 2, 'PRJ-002', 'Skyline Commercial Hub', 'Grade-A IT & commercial complex with 3 basements, retail podium and 14 office floors.', 'ACTIVE', '2026-02-01', '2027-03-15', 42000000.00, 10.00, 3, 1, NOW(), NOW()),
(3, 3, 'PRJ-003', 'Riverside Heights', 'Mid-rise riverfront gated villas and luxury apartments.', 'COMPLETED', '2025-06-01', '2026-08-30', 18000000.00, 7.50, 4, 1, NOW(), NOW()),
(4, 4, 'PRJ-004', 'Urban Square', 'Mixed-use residential and retail development on main expressway.', 'PLANNING', '2026-09-01', '2027-10-30', 31000000.00, 10.00, 5, 1, NOW(), NOW());

SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));

-- 4. MATERIALS
INSERT INTO materials (id, name, category, unit, is_active, created_at, updated_at) VALUES
(1, 'OPC 53 Grade Cement', 'CEMENT', 'Bags', TRUE, NOW(), NOW()),
(2, 'PPC Super Cement', 'CEMENT', 'Bags', TRUE, NOW(), NOW()),
(3, 'Fe500D TMT Steel 16mm', 'STEEL', 'MT', TRUE, NOW(), NOW()),
(4, 'Fe500D TMT Steel 25mm', 'STEEL', 'MT', TRUE, NOW(), NOW()),
(5, 'M35 Ready-Mix Concrete', 'SAND_AGGREGATE', 'Cu.M', TRUE, NOW(), NOW()),
(6, 'Coarse River Sand', 'SAND_AGGREGATE', 'Cu.Ft', TRUE, NOW(), NOW()),
(7, '20mm Blue Metal Aggregate', 'SAND_AGGREGATE', 'Cu.Ft', TRUE, NOW(), NOW()),
(8, 'Red Clay Bricks (Class 1)', 'BRICKS_BLOCKS', 'Nos', TRUE, NOW(), NOW()),
(9, 'AAC Lightweight Blocks', 'BRICKS_BLOCKS', 'Nos', TRUE, NOW(), NOW()),
(10, 'CPVC Pipes (1 inch SDR 11)', 'PLUMBING', 'Pcs', TRUE, NOW(), NOW()),
(11, 'Exterior Acrylic Emulsion Primer', 'PAINT_FINISH', 'Litre', TRUE, NOW(), NOW()),
(12, 'Copper Electrical Cables 2.5 sq mm', 'ELECTRICAL', 'Coil', TRUE, NOW(), NOW());

SELECT setval('materials_id_seq', (SELECT MAX(id) FROM materials));

-- 5. VENDORS
INSERT INTO vendors (id, name, contact_person, phone, email, gstin, address, is_active, created_at, updated_at) VALUES
(1, 'UltraTech Cement Ltd', 'Rajesh Singhania', '+91 98201 44521', 'r.singhania@adityabirla.com', '07AAACU8044B1Z5', 'Aditya Birla Centre, S.K. Ahire Marg, Worli, Mumbai', TRUE, NOW(), NOW()),
(2, 'Tata Steel Ltd (Tiscon)', 'Vikram Malhotra', '+91 98112 99823', 'v.malhotra@tatasteel.com', '07AAACT2727Q1ZT', 'Tata Centre, 43 Jawaharlal Nehru Road, Delhi NCR', TRUE, NOW(), NOW()),
(3, 'ACC ReadyMix Concrete', 'Sunil Kulkarni', '+91 98450 33219', 'sunil.k@acclimited.com', '06AAACA0544C1Z9', 'Udyog Vihar Phase 4, Plot 88, Gurugram', TRUE, NOW(), NOW()),
(4, 'Astral Pipes Ltd', 'Deepen Parekh', '+91 97240 66512', 'd.parekh@astralpipes.com', '24AABCA5463J1Z8', 'Astral House, Rajpath Rangoli Road, Ahmedabad', TRUE, NOW(), NOW()),
(5, 'Schneider Electric India', 'Ananya Sen', '+91 98233 11882', 'ananya.sen@se.com', '09AAACS9821L1Z4', 'Electra Tower, Cyber City Phase 2, Gurugram', TRUE, NOW(), NOW()),
(6, 'Devcon Earthmovers & Shoring', 'Hardeep Singh', '+91 98140 77123', 'devcon.excavation@gmail.com', '08AAACD4412E1Z2', 'Plot 14, Transport Nagar, Ajmer Road, Jaipur', TRUE, NOW(), NOW());

SELECT setval('vendors_id_seq', (SELECT MAX(id) FROM vendors));

-- 6. PROJECT MATERIAL PLANS (BOM)
INSERT INTO project_material_plans (project_id, material_id, planned_quantity, planned_unit_rate, low_stock_threshold, wastage_threshold_pct, created_at, updated_at) VALUES
(1, 1, 15000.000, 360.00, 500.000, 5.00, NOW(), NOW()),
(1, 3, 220.000, 61000.00, 15.000, 4.00, NOW(), NOW()),
(1, 5, 2400.000, 4350.00, 100.000, 3.00, NOW(), NOW()),
(1, 6, 45000.000, 55.00, 2000.000, 8.00, NOW(), NOW()),
(1, 8, 120000.000, 9.50, 5000.000, 6.00, NOW(), NOW()),
(2, 1, 28000.000, 355.00, 800.000, 5.00, NOW(), NOW()),
(2, 3, 480.000, 60500.00, 25.000, 4.00, NOW(), NOW()),
(2, 5, 5200.000, 4400.00, 200.000, 3.00, NOW(), NOW());

-- 7. DAILY LOGS
INSERT INTO daily_logs (id, project_id, log_date, progress_percent, work_summary, weather, issues, created_by_id, created_at, updated_at) VALUES
(1, 1, '2026-10-25', 68.00, 'Tower B slab 12 casting completed. Formwork staging erected for Tower A level 14.', 'Sunny, 28C', 'Minor concrete pump line choke cleared in 20 mins.', 2, NOW(), NOW()),
(2, 1, '2026-10-26', 71.00, 'Brick masonry and MEP conduit laying in 6th floor apartments.', 'Clear, 26C', 'None. Work on schedule.', 2, NOW(), NOW()),
(3, 1, '2026-10-27', 74.00, 'Basement drainage pit waterproofing and external plastering on Tower C.', 'Cloudy, 24C', 'Water supply interrupted for 1 hour.', 2, NOW(), NOW()),
(4, 2, '2026-10-25', 48.00, 'Basement-2 shear wall reinforcement binding and column box erection.', 'Sunny, 30C', 'High humidity. Added extra hydration breaks for workers.', 3, NOW(), NOW()),
(5, 2, '2026-10-26', 52.00, 'Raft concrete pour segment 4: 380 Cu.M continuous pour.', 'Clear, 27C', 'Traffic congestion delayed two transit mixers by 15 mins.', 3, NOW(), NOW());

SELECT setval('daily_logs_id_seq', (SELECT MAX(id) FROM daily_logs));

-- 8. LABOUR ENTRIES
INSERT INTO labour_entries (daily_log_id, trade, contractor_name, head_count, hours_worked, remarks) VALUES
(1, 'Masons', 'Bhawani Construction', 14, 8.5, 'Tower B casting and plaster finish'),
(1, 'Barbenders', 'SteelTech Labour Works', 18, 9.0, 'Tower A level 14 rebar tying'),
(1, 'Carpenters & Shuttering', 'Apex Formwork', 12, 8.0, 'Slab staging and plywood prop leveling'),
(4, 'Rebar Fitters', 'Apex Steelworkers', 22, 9.0, 'Basement shear wall cage binding');

-- 9. MACHINERY ENTRIES
INSERT INTO machinery_entries (daily_log_id, machine_name, operator_name, hours_used, fuel_litres, remarks) VALUES
(1, 'Schwing Stetter Concrete Pump', 'Ramesh Yadav', 6.5, 45.00, 'Boom placer pump Tower B'),
(1, 'Tower Crane 1', 'Jagdish Kumar', 8.0, NULL, 'Rebar and shuttering bundle hoists'),
(5, 'Transit Mixer 04', 'Satnam Singh', 7.5, 52.00, 'Pour batching from Manesar plant');

-- 10. BILLS
INSERT INTO bills (id, project_id, vendor_id, bill_number, bill_date, due_date, category, description, base_amount, gst_percent, gst_amount, total_amount, status, submitted_by_id, approved_by_id, approved_at, created_at, updated_at) VALUES
(1, 1, 1, 'INV-UTC-2026-891', '2026-10-15', '2026-11-20', 'MATERIAL', 'Supply of 2,500 bags of OPC 53 Grade Cement for Tower B slab casting.', 862500.00, 28.00, 241500.00, 1104000.00, 'APPROVED', 2, 1, NOW() - INTERVAL '10 days', NOW() - INTERVAL '15 days', NOW()),
(2, 1, 2, 'INV-TSL-2026-441', '2026-10-18', '2026-11-25', 'MATERIAL', 'Supply of 60 MT Fe500D 16mm TMT Steel Rebars.', 3600000.00, 18.00, 648000.00, 4248000.00, 'PARTIALLY_PAID', 2, 1, NOW() - INTERVAL '7 days', NOW() - INTERVAL '12 days', NOW()),
(3, 1, 3, 'INV-ACC-2026-112', '2026-10-22', '2026-11-15', 'MATERIAL', 'M35 Design Mix Concrete 420 Cu.M with pump.', 1827000.00, 18.00, 328860.00, 2155860.00, 'PENDING', 2, NULL, NULL, NOW() - INTERVAL '3 days', NOW()),
(4, 2, 6, 'INV-DEV-2026-031', '2026-09-28', '2026-10-20', 'MACHINERY', 'Excavation 12,000 Cu.M & disposal charges.', 1250000.00, 18.00, 225000.00, 1475000.00, 'PAID', 3, 1, NOW() - INTERVAL '30 days', NOW() - INTERVAL '40 days', NOW());

SELECT setval('bills_id_seq', (SELECT MAX(id) FROM bills));

-- 11. PAYMENTS
INSERT INTO payments (id, bill_id, amount, payment_date, mode, reference_number, remarks, recorded_by_id, created_at) VALUES
(1, 4, 1475000.00, '2026-10-18', 'BANK_TRANSFER', 'HDFCR9202610180041', 'Full and final settlement against RA bill 3', 1, NOW()),
(2, 2, 2000000.00, '2026-10-28', 'BANK_TRANSFER', 'ICICR9202610289912', 'Part payment 1 against 60 MT steel delivery', 1, NOW());

SELECT setval('payments_id_seq', (SELECT MAX(id) FROM payments));

-- 12. STOCK TRANSACTIONS
-- Inward deliveries
INSERT INTO stock_transactions (project_id, material_id, txn_type, quantity, unit_rate, vendor_id, bill_id, challan_number, out_reason, txn_date, daily_log_id, remarks, created_by_id, is_voided, created_at) VALUES
(1, 1, 'IN', 2500.000, 345.00, 1, 1, 'CH-UTC-8910', NULL, '2026-10-15', 1, 'Delivery received in good dry condition at Tower B yard.', 2, FALSE, NOW()),
(1, 3, 'IN', 60.000, 60000.00, 2, 2, 'CH-TSL-4410', NULL, '2026-10-18', 1, 'Primary steel mill test certs verified.', 2, FALSE, NOW()),
-- Outward consumption
(1, 1, 'OUT', 1200.000, NULL, NULL, NULL, NULL, 'USED', '2026-10-25', 1, 'Consumed in Tower B slab 12 casting.', 2, FALSE, NOW()),
(1, 1, 'OUT', 25.000, NULL, NULL, NULL, NULL, 'DAMAGED', '2026-10-26', 2, 'Bags torn during forklift offloading in rain.', 2, FALSE, NOW()),
(1, 3, 'OUT', 18.000, NULL, NULL, NULL, NULL, 'USED', '2026-10-27', 3, 'Tied into columns and shear walls.', 2, FALSE, NOW());

-- 13. AUDIT LOGS
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, created_at) VALUES
(1, 'CREATE', 'Project', 1, NULL, '{"code": "PRJ-001", "name": "Green Valley Residency"}'::jsonb, '127.0.0.1', NOW() - INTERVAL '30 days'),
(2, 'CREATE', 'Bill', 1, NULL, '{"billNumber": "INV-UTC-2026-891", "amount": 1104000}'::jsonb, '192.168.1.45', NOW() - INTERVAL '15 days'),
(1, 'APPROVE', 'Bill', 1, '{"status": "PENDING"}'::jsonb, '{"status": "APPROVED"}'::jsonb, '127.0.0.1', NOW() - INTERVAL '10 days');
