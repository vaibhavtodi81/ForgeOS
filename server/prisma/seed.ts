import { randomBytes, scryptSync } from 'node:crypto'
import { PrismaClient, ProjectStatus, Role, type MaterialCategory } from '@prisma/client'

const prisma = new PrismaClient()

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `scrypt$${salt}$${hash}`
}

const DEMO_PASSWORD = 'ForgeOS2026'

async function main() {
  console.log('Seeding ForgeOS database...')

  // ── Users ──────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@forgeos.local' },
    update: { name: 'Vaibhav (Admin)', role: Role.ADMIN, isActive: true, passwordHash: hashPassword(DEMO_PASSWORD) },
    create: { name: 'Vaibhav (Admin)', email: 'admin@forgeos.local', role: Role.ADMIN, isActive: true, passwordHash: hashPassword(DEMO_PASSWORD), phone: '+91-98765-43210' },
  })

  const pm1 = await prisma.user.upsert({
    where: { email: 'riya@forgeos.local' },
    update: { name: 'Riya (PM)', role: Role.PM, isActive: true, passwordHash: hashPassword(DEMO_PASSWORD) },
    create: { name: 'Riya (PM)', email: 'riya@forgeos.local', role: Role.PM, isActive: true, passwordHash: hashPassword(DEMO_PASSWORD), phone: '+91-98765-11111' },
  })

  const pm2 = await prisma.user.upsert({
    where: { email: 'yashmeen@forgeos.local' },
    update: { name: 'Yashmeen (PM)', role: Role.PM, isActive: true, passwordHash: hashPassword(DEMO_PASSWORD) },
    create: { name: 'Yashmeen (PM)', email: 'yashmeen@forgeos.local', role: Role.PM, isActive: true, passwordHash: hashPassword(DEMO_PASSWORD), phone: '+91-98765-22222' },
  })

  const pm3 = await prisma.user.upsert({
    where: { email: 'vinayak@forgeos.local' },
    update: { name: 'Vinayak (PM)', role: Role.PM, isActive: true, passwordHash: hashPassword(DEMO_PASSWORD) },
    create: { name: 'Vinayak (PM)', email: 'vinayak@forgeos.local', role: Role.PM, isActive: true, passwordHash: hashPassword(DEMO_PASSWORD), phone: '+91-98765-33333' },
  })

  const pm4 = await prisma.user.upsert({
    where: { email: 'pm-inactive@forgeos.local' },
    update: { name: 'Inactive PM', role: Role.PM, isActive: false, passwordHash: hashPassword(DEMO_PASSWORD) },
    create: { name: 'Inactive PM', email: 'pm-inactive@forgeos.local', role: Role.PM, isActive: false, passwordHash: hashPassword(DEMO_PASSWORD) },
  })

  // ── Lands ─────────────────────────────────────────────
  const land1 = await prisma.land.upsert({
    where: { name: 'Sector 56 Parcel' },
    update: {},
    create: { name: 'Sector 56 Parcel', city: 'Gurugram', state: 'Haryana', areaValue: 2.5, areaUnit: 'ACRE', ownershipType: 'FREEHOLD', createdById: admin.id },
  })
  const land2 = await prisma.land.upsert({
    where: { name: 'Whitefield Plot' },
    update: {},
    create: { name: 'Whitefield Plot', city: 'Bengaluru', state: 'Karnataka', areaValue: 1.8, areaUnit: 'ACRE', ownershipType: 'LEASEHOLD', createdById: admin.id },
  })
  const land3 = await prisma.land.upsert({
    where: { name: 'Baner Hills Estate' },
    update: {},
    create: { name: 'Baner Hills Estate', city: 'Pune', state: 'Maharashtra', areaValue: 3.2, areaUnit: 'ACRE', ownershipType: 'FREEHOLD', createdById: admin.id },
  })

  // ── Projects ──────────────────────────────────────────
  const project1 = await prisma.project.upsert({
    where: { code: 'GGN-56-A' },
    update: {},
    create: {
      code: 'GGN-56-A', name: 'Greenwood Residences', landId: land1.id, status: ProjectStatus.ACTIVE,
      startDate: new Date('2026-01-15'), expectedEndDate: new Date('2027-06-30'),
      totalBudget: 45000000, wastageThresholdPct: 10, assignedPmId: pm1.id, createdById: admin.id,
      description: 'Premium residential complex with 3 towers and 120 units.',
    },
  })
  const project2 = await prisma.project.upsert({
    where: { code: 'BLR-WF-1' },
    update: {},
    create: {
      code: 'BLR-WF-1', name: 'Tech Park Phase 2', landId: land2.id, status: ProjectStatus.ACTIVE,
      startDate: new Date('2026-03-01'), expectedEndDate: new Date('2027-12-31'),
      totalBudget: 82000000, wastageThresholdPct: 8, assignedPmId: pm2.id, createdById: admin.id,
      description: 'IT park with 4 office blocks and parking for 2000 vehicles.',
    },
  })
  const project3 = await prisma.project.upsert({
    where: { code: 'PUN-BH-3' },
    update: {},
    create: {
      code: 'PUN-BH-3', name: 'Hillside Villas', landId: land3.id, status: ProjectStatus.ON_HOLD,
      startDate: new Date('2025-10-01'), expectedEndDate: new Date('2027-03-31'),
      totalBudget: 35000000, wastageThresholdPct: 12, assignedPmId: pm3.id, createdById: admin.id,
      description: '20 luxury villas with clubhouse and infinity pool.',
    },
  })
  const project4 = await prisma.project.upsert({
    where: { code: 'GGN-56-B' },
    update: {},
    create: {
      code: 'GGN-56-B', name: 'Greenwood Commercial', landId: land1.id, status: ProjectStatus.PLANNING,
      startDate: new Date('2027-01-15'), expectedEndDate: new Date('2028-12-31'),
      totalBudget: 60000000, wastageThresholdPct: 10, assignedPmId: pm1.id, createdById: admin.id,
      description: 'Commercial tower with retail and office space.',
    },
  })
  const project5 = await prisma.project.upsert({
    where: { code: 'BLR-WF-2' },
    update: {},
    create: {
      code: 'BLR-WF-2', name: 'Tech Park Annex', landId: land2.id, status: ProjectStatus.ACTIVE,
      startDate: new Date('2026-06-01'), expectedEndDate: new Date('2027-09-30'),
      totalBudget: 28000000, wastageThresholdPct: 10, assignedPmId: pm2.id, createdById: admin.id,
      description: 'Annex building with food court and amenity floor.',
    },
  })

  // ── Materials ─────────────────────────────────────────
  const materials = [
    { name: 'OPC 53 Grade Cement', category: 'CEMENT' as MaterialCategory, unit: 'BAG' },
    { name: 'PPC Cement', category: 'CEMENT' as MaterialCategory, unit: 'BAG' },
    { name: 'TMT Steel Bars 12mm', category: 'STEEL' as MaterialCategory, unit: 'TON' },
    { name: 'TMT Steel Bars 16mm', category: 'STEEL' as MaterialCategory, unit: 'TON' },
    { name: 'M-Sand', category: 'SAND_AGGREGATE' as MaterialCategory, unit: 'CFT' },
    { name: '20mm Aggregate', category: 'SAND_AGGREGATE' as MaterialCategory, unit: 'CFT' },
    { name: 'Red Clay Bricks', category: 'BRICKS_BLOCKS' as MaterialCategory, unit: 'NOS' },
    { name: 'AAC Blocks 600x200x150', category: 'BRICKS_BLOCKS' as MaterialCategory, unit: 'NOS' },
    { name: 'Plywood 18mm', category: 'TIMBER' as MaterialCategory, unit: 'SQFT' },
    { name: 'PVC Pipes 4 inch', category: 'PLUMBING' as MaterialCategory, unit: 'MTR' },
    { name: 'Copper Wire 2.5mm', category: 'ELECTRICAL' as MaterialCategory, unit: 'MTR' },
    { name: 'Primer White', category: 'PAINT_FINISH' as MaterialCategory, unit: 'LTR' },
  ]
  const materialRecords = []
  for (const m of materials) {
    const rec = await prisma.material.upsert({
      where: { name: m.name },
      update: {},
      create: { ...m, isActive: true },
    })
    materialRecords.push(rec)
  }
  const [cement, , steel12, , msand, aggregate, bricks, aacBlocks, , pvcPipe, copperWire, primer] = materialRecords

  // ── Vendors ───────────────────────────────────────────
  const vendor1 = await prisma.vendor.upsert({
    where: { name: 'Shree Balaji Cement Suppliers' },
    update: {},
    create: { name: 'Shree Balaji Cement Suppliers', gstin: '06AAACB1234D1Z5', phone: '+91-124-4567890', email: 'sales@balajicement.in', vendorType: 'MATERIAL', isActive: true },
  })
  const vendor2 = await prisma.vendor.upsert({
    where: { name: 'JSW Steel Distributors' },
    update: {},
    create: { name: 'JSW Steel Distributors', gstin: '27AAACJ6789E1Z2', phone: '+91-22-28765432', email: 'orders@jswsteel.in', vendorType: 'MATERIAL', isActive: true },
  })
  const vendor3 = await prisma.vendor.upsert({
    where: { name: 'Sai Sand & Aggregate' },
    update: {},
    create: { name: 'Sai Sand & Aggregate', phone: '+91-80-23456789', vendorType: 'MATERIAL', isActive: true },
  })
  const vendor4 = await prisma.vendor.upsert({
    where: { name: 'Bharat Brick Works' },
    update: {},
    create: { name: 'Bharat Brick Works', phone: '+91-20-27654321', vendorType: 'MATERIAL', isActive: true },
  })
  const vendor5 = await prisma.vendor.upsert({
    where: { name: 'Perfect Electricals' },
    update: {},
    create: { name: 'Perfect Electricals', gstin: '29AABCPE5678F1Z9', phone: '+91-80-25551234', email: 'info@pelec.in', vendorType: 'MATERIAL', isActive: true },
  })

  // ── Material Plans (Project 1: Greenwood Residences) ──
  const plan1cement = await prisma.projectMaterialPlan.upsert({
    where: { projectId_materialId: { projectId: project1.id, materialId: cement.id } },
    update: {},
    create: { projectId: project1.id, materialId: cement.id, openingQuantity: 0, plannedQuantity: 5000, plannedUnitRate: 380, lowStockThreshold: 200, wastageThresholdPct: 8 },
  })
  const plan1steel = await prisma.projectMaterialPlan.upsert({
    where: { projectId_materialId: { projectId: project1.id, materialId: steel12.id } },
    update: {},
    create: { projectId: project1.id, materialId: steel12.id, openingQuantity: 0, plannedQuantity: 120, plannedUnitRate: 62000, lowStockThreshold: 5, wastageThresholdPct: 5 },
  })
  const plan1msand = await prisma.projectMaterialPlan.upsert({
    where: { projectId_materialId: { projectId: project1.id, materialId: msand.id } },
    update: {},
    create: { projectId: project1.id, materialId: msand.id, openingQuantity: 0, plannedQuantity: 15000, plannedUnitRate: 45, lowStockThreshold: 500, wastageThresholdPct: 10 },
  })
  const plan1bricks = await prisma.projectMaterialPlan.upsert({
    where: { projectId_materialId: { projectId: project1.id, materialId: bricks.id } },
    update: {},
    create: { projectId: project1.id, materialId: bricks.id, openingQuantity: 0, plannedQuantity: 80000, plannedUnitRate: 8, lowStockThreshold: 2000, wastageThresholdPct: 7 },
  })

  // ── Material Plans (Project 2: Tech Park Phase 2) ─────
  const plan2cement = await prisma.projectMaterialPlan.upsert({
    where: { projectId_materialId: { projectId: project2.id, materialId: cement.id } },
    update: {},
    create: { projectId: project2.id, materialId: cement.id, openingQuantity: 500, plannedQuantity: 12000, plannedUnitRate: 375, lowStockThreshold: 300, wastageThresholdPct: 6 },
  })
  const plan2steel = await prisma.projectMaterialPlan.upsert({
    where: { projectId_materialId: { projectId: project2.id, materialId: steel12.id } },
    update: {},
    create: { projectId: project2.id, materialId: steel12.id, openingQuantity: 10, plannedQuantity: 350, plannedUnitRate: 61500, lowStockThreshold: 10, wastageThresholdPct: 5 },
  })
  const plan2aggregate = await prisma.projectMaterialPlan.upsert({
    where: { projectId_materialId: { projectId: project2.id, materialId: aggregate.id } },
    update: {},
    create: { projectId: project2.id, materialId: aggregate.id, openingQuantity: 0, plannedQuantity: 20000, plannedUnitRate: 55, lowStockThreshold: 800, wastageThresholdPct: 10 },
  })

  // ── Material Plans (Project 5: Tech Park Annex) ──────
  const plan5cement = await prisma.projectMaterialPlan.upsert({
    where: { projectId_materialId: { projectId: project5.id, materialId: cement.id } },
    update: {},
    create: { projectId: project5.id, materialId: cement.id, openingQuantity: 0, plannedQuantity: 3000, plannedUnitRate: 385, lowStockThreshold: 150, wastageThresholdPct: 8 },
  })
  const plan5aac = await prisma.projectMaterialPlan.upsert({
    where: { projectId_materialId: { projectId: project5.id, materialId: aacBlocks.id } },
    update: {},
    create: { projectId: project5.id, materialId: aacBlocks.id, openingQuantity: 0, plannedQuantity: 15000, plannedUnitRate: 65, lowStockThreshold: 500, wastageThresholdPct: 5 },
  })

  // ── Daily Logs (Project 1, progress 5% → 35%) ────────
  const logDates = ['2026-01-20', '2026-01-27', '2026-02-03', '2026-02-10', '2026-02-17', '2026-02-24', '2026-03-03', '2026-03-10']
  const progressPercents = [5, 8, 12, 18, 22, 28, 32, 35]
  const logIds = []
  for (let i = 0; i < logDates.length; i++) {
    const log = await prisma.dailyLog.upsert({
      where: { projectId_logDate: { projectId: project1.id, logDate: new Date(`${logDates[i]}T00:00:00.000Z`) } },
      update: {},
      create: {
        projectId: project1.id, logDate: new Date(`${logDates[i]}T00:00:00.000Z`),
        progressPercent: progressPercents[i], weather: 'CLEAR', notes: `Day ${i + 1}: excavation and foundation work progressing.`,
        createdById: pm1.id,
      },
    })
    logIds.push(log)
  }

  // Labour entries for first 3 logs
  await prisma.labourEntry.createMany({
    data: [
      { dailyLogId: logIds[0].id, trade: 'MASON', headCount: 8, hours: 8, contractorName: 'Lakshmi Labour Co.' },
      { dailyLogId: logIds[0].id, trade: 'HELPER', headCount: 12, hours: 8 },
      { dailyLogId: logIds[1].id, trade: 'MASON', headCount: 10, hours: 8, contractorName: 'Lakshmi Labour Co.' },
      { dailyLogId: logIds[1].id, trade: 'BAR_BENDER', headCount: 6, hours: 8 },
      { dailyLogId: logIds[2].id, trade: 'MASON', headCount: 12, hours: 9 },
      { dailyLogId: logIds[2].id, trade: 'CARPENTER', headCount: 4, hours: 8 },
    ],
    skipDuplicates: true,
  })

  // Machinery entries
  await prisma.machineryEntry.createMany({
    data: [
      { dailyLogId: logIds[0].id, machineName: 'JCB Excavator', hours: 6, fuelLitres: 25 },
      { dailyLogId: logIds[1].id, machineName: 'Concrete Mixer', hours: 4, fuelLitres: 8 },
      { dailyLogId: logIds[2].id, machineName: 'Tower Crane', hours: 8 },
    ],
    skipDuplicates: true,
  })

  // ── Daily Logs (Project 2, progress 10% → 25%) ──────
  const log2Dates = ['2026-03-10', '2026-03-17', '2026-03-24', '2026-03-31']
  const log2Progress = [10, 15, 20, 25]
  const log2Ids = []
  for (let i = 0; i < log2Dates.length; i++) {
    const log = await prisma.dailyLog.upsert({
      where: { projectId_logDate: { projectId: project2.id, logDate: new Date(`${log2Dates[i]}T00:00:00.000Z`) } },
      update: {},
      create: {
        projectId: project2.id, logDate: new Date(`${log2Dates[i]}T00:00:00.000Z`),
        progressPercent: log2Progress[i], weather: 'CLEAR', notes: `Phase 2 progress report ${i + 1}.`,
        createdById: pm2.id,
      },
    })
    log2Ids.push(log)
  }

  // ── Stock Transactions (Project 1) ───────────────────
  // Cement: 2000 IN, 1800 OUT (some wastage, slight overrun at 35% progress)
  await prisma.stockTransaction.createMany({
    data: [
      { projectId: project1.id, materialId: cement.id, txnType: 'IN', quantity: 1000, txnDate: new Date('2026-01-15'), unitRate: 380, vendorId: vendor1.id, challanNumber: 'CH-001', createdById: pm1.id },
      { projectId: project1.id, materialId: cement.id, txnType: 'IN', quantity: 1000, txnDate: new Date('2026-02-01'), unitRate: 380, vendorId: vendor1.id, challanNumber: 'CH-002', createdById: pm1.id },
      { projectId: project1.id, materialId: cement.id, txnType: 'OUT', quantity: 800, txnDate: new Date('2026-02-05'), outReason: 'USED', createdById: pm1.id },
      { projectId: project1.id, materialId: cement.id, txnType: 'OUT', quantity: 600, txnDate: new Date('2026-02-15'), outReason: 'USED', createdById: pm1.id },
      { projectId: project1.id, materialId: cement.id, txnType: 'OUT', quantity: 350, txnDate: new Date('2026-02-20'), outReason: 'USED', createdById: pm1.id },
      { projectId: project1.id, materialId: cement.id, txnType: 'OUT', quantity: 50, txnDate: new Date('2026-02-22'), outReason: 'DAMAGED', createdById: pm1.id },
    ],
    skipDuplicates: true,
  })

  // Steel: 80 IN, 45 OUT (heavy overrun to trigger wastage alert)
  await prisma.stockTransaction.createMany({
    data: [
      { projectId: project1.id, materialId: steel12.id, txnType: 'IN', quantity: 50, txnDate: new Date('2026-01-20'), unitRate: 62000, vendorId: vendor2.id, challanNumber: 'CH-ST-001', createdById: pm1.id },
      { projectId: project1.id, materialId: steel12.id, txnType: 'IN', quantity: 30, txnDate: new Date('2026-02-10'), unitRate: 62000, vendorId: vendor2.id, challanNumber: 'CH-ST-002', createdById: pm1.id },
      { projectId: project1.id, materialId: steel12.id, txnType: 'OUT', quantity: 25, txnDate: new Date('2026-02-12'), outReason: 'USED', createdById: pm1.id },
      { projectId: project1.id, materialId: steel12.id, txnType: 'OUT', quantity: 20, txnDate: new Date('2026-02-25'), outReason: 'USED', createdById: pm1.id },
    ],
    skipDuplicates: true,
  })

  // M-Sand: normal usage
  await prisma.stockTransaction.createMany({
    data: [
      { projectId: project1.id, materialId: msand.id, txnType: 'IN', quantity: 5000, txnDate: new Date('2026-01-18'), unitRate: 45, vendorId: vendor3.id, createdById: pm1.id },
      { projectId: project1.id, materialId: msand.id, txnType: 'OUT', quantity: 3000, txnDate: new Date('2026-02-01'), outReason: 'USED', createdById: pm1.id },
      { projectId: project1.id, materialId: msand.id, txnType: 'OUT', quantity: 1500, txnDate: new Date('2026-02-20'), outReason: 'USED', createdById: pm1.id },
    ],
    skipDuplicates: true,
  })

  // Bricks: normal usage, low stock
  await prisma.stockTransaction.createMany({
    data: [
      { projectId: project1.id, materialId: bricks.id, txnType: 'IN', quantity: 50000, txnDate: new Date('2026-01-25'), unitRate: 8, vendorId: vendor4.id, createdById: pm1.id },
      { projectId: project1.id, materialId: bricks.id, txnType: 'OUT', quantity: 48000, txnDate: new Date('2026-03-01'), outReason: 'USED', createdById: pm1.id },
    ],
    skipDuplicates: true,
  })

  // ── Stock Transactions (Project 2) ───────────────────
  await prisma.stockTransaction.createMany({
    data: [
      { projectId: project2.id, materialId: cement.id, txnType: 'IN', quantity: 3000, txnDate: new Date('2026-03-05'), unitRate: 375, vendorId: vendor1.id, createdById: pm2.id },
      { projectId: project2.id, materialId: cement.id, txnType: 'OUT', quantity: 1800, txnDate: new Date('2026-03-15'), outReason: 'USED', createdById: pm2.id },
      { projectId: project2.id, materialId: steel12.id, txnType: 'IN', quantity: 100, txnDate: new Date('2026-03-08'), unitRate: 61500, vendorId: vendor2.id, createdById: pm2.id },
      { projectId: project2.id, materialId: steel12.id, txnType: 'OUT', quantity: 60, txnDate: new Date('2026-03-20'), outReason: 'USED', createdById: pm2.id },
    ],
    skipDuplicates: true,
  })

  // ── Bills ─────────────────────────────────────────────
  const bill1 = await prisma.bill.create({
    data: {
      projectId: project1.id, vendorId: vendor1.id, billNumber: 'INV-2026-001',
      billDate: new Date('2026-02-01'), dueDate: new Date('2026-03-01'),
      category: 'MATERIAL', baseAmount: 380000, gstPercent: 18,
      status: 'APPROVED', submittedById: pm1.id, approvedById: admin.id, approvedAt: new Date('2026-02-03'),
    },
  })
  const bill2 = await prisma.bill.create({
    data: {
      projectId: project1.id, vendorId: vendor2.id, billNumber: 'INV-2026-002',
      billDate: new Date('2026-02-12'), dueDate: new Date('2026-03-12'),
      category: 'MATERIAL', baseAmount: 3100000, gstPercent: 18,
      status: 'APPROVED', submittedById: pm1.id, approvedById: admin.id, approvedAt: new Date('2026-02-14'),
    },
  })
  const bill3 = await prisma.bill.create({
    data: {
      projectId: project1.id, vendorId: vendor3.id, billNumber: 'INV-2026-003',
      billDate: new Date('2026-02-20'), dueDate: new Date('2026-03-20'),
      category: 'MATERIAL', baseAmount: 225000, gstPercent: 18,
      status: 'PENDING', submittedById: pm1.id,
    },
  })
  const bill4 = await prisma.bill.create({
    data: {
      projectId: project2.id, vendorId: vendor1.id, billNumber: 'INV-2026-004',
      billDate: new Date('2026-03-05'), dueDate: new Date('2026-04-05'),
      category: 'MATERIAL', baseAmount: 1125000, gstPercent: 18,
      status: 'APPROVED', submittedById: pm2.id, approvedById: admin.id, approvedAt: new Date('2026-03-07'),
    },
  })
  const bill5 = await prisma.bill.create({
    data: {
      projectId: project2.id, vendorId: vendor5.id, billNumber: 'INV-2026-005',
      billDate: new Date('2026-03-15'), dueDate: new Date('2026-04-15'),
      category: 'MATERIAL', baseAmount: 85000, gstPercent: 18,
      status: 'REJECTED', submittedById: pm2.id, approvedById: admin.id, approvedAt: new Date('2026-03-17'),
      rejectionReason: 'Rate mismatch with agreed contract price. Please revise.',
    },
  })
  const bill6 = await prisma.bill.create({
    data: {
      projectId: project1.id, vendorId: vendor4.id, billNumber: 'INV-2026-006',
      billDate: new Date('2026-01-28'), dueDate: new Date('2026-02-28'),
      category: 'MATERIAL', baseAmount: 400000, gstPercent: 18,
      status: 'PAID', submittedById: pm1.id, approvedById: admin.id, approvedAt: new Date('2026-01-30'),
    },
  })

  // ── Payments ──────────────────────────────────────────
  await prisma.payment.createMany({
    data: [
      { billId: bill1.id, amount: 448400, paymentDate: new Date('2026-02-25'), paymentMode: 'BANK_TRANSFER', reference: 'NEFT-001', recordedById: admin.id },
      { billId: bill2.id, amount: 2000000, paymentDate: new Date('2026-02-28'), paymentMode: 'BANK_TRANSFER', reference: 'NEFT-002', recordedById: admin.id },
      { billId: bill6.id, amount: 472000, paymentDate: new Date('2026-02-15'), paymentMode: 'CHEQUE', reference: 'CHQ-001', recordedById: admin.id },
    ],
    skipDuplicates: true,
  })

  console.log('')
  console.log('=== ForgeOS Seed Complete ===')
  console.log('Demo credentials (all accounts use the same password):')
  console.log(`  Email: admin@forgeos.local       Password: ${DEMO_PASSWORD}   Role: ADMIN`)
  console.log(`  Email: riya@forgeos.local        Password: ${DEMO_PASSWORD}   Role: PM`)
  console.log(`  Email: yashmeen@forgeos.local    Password: ${DEMO_PASSWORD}   Role: PM`)
  console.log(`  Email: vinayak@forgeos.local     Password: ${DEMO_PASSWORD}   Role: PM`)
  console.log('')
  console.log('Seed data: 5 users, 3 lands, 5 projects, 12 materials, 5 vendors,')
  console.log('7 material plans, 12 daily logs, 20+ stock transactions, 6 bills, 3 payments.')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
