/**
 * ForgeOS seed — realistic Indian construction portfolio (original contract schema).
 * Run with: bun prisma/seed.ts
 */
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const db = new PrismaClient()

const DAY = 24 * 60 * 60 * 1000
const now = Date.now()
const daysAgo = (n: number, hour = 10) => {
  const d = new Date(now - n * DAY)
  d.setHours(hour, 15, 0, 0)
  return d
}
const daysAhead = (n: number) => new Date(now + n * DAY)
const monthAgo = (n: number) => new Date(now - n * 30 * DAY)

// Deterministic pseudo-random for stable seed output
let seedState = 42
function rnd(): number {
  seedState = (seedState * 1103515245 + 12345) % 2147483648
  return seedState / 2147483648
}
const jitter = (v: number, pct: number) => v * (1 + (rnd() - 0.5) * 2 * pct)

async function main() {
  console.log('Clearing existing data...')
  await db.$transaction([
    db.payment.deleteMany(),
    db.invoice.deleteMany(),
    db.auditLog.deleteMany(),
    db.milestone.deleteMany(),
    db.machineryEntry.deleteMany(),
    db.labourEntry.deleteMany(),
    db.dailyLog.deleteMany(),
    db.inventoryTransaction.deleteMany(),
    db.materialPlan.deleteMany(),
    db.project.deleteMany(),
    db.material.deleteMany(),
    db.supplier.deleteMany(),
    db.land.deleteMany(),
    db.otpCode.deleteMany(),
    db.oAuthAccount.deleteMany(),
    db.user.deleteMany(),
  ])

  console.log('Creating users...')
  const pass = hashPassword('ForgeOS2026')
  const [admin, riya, yashmeen, vinayak, aisha] = await Promise.all([
    db.user.create({ data: { name: 'Vaibhav Todi', email: 'admin@forgeos.local', passwordHash: pass, role: 'ADMIN', phone: '+91 98200 11223', createdAt: monthAgo(9) } }),
    db.user.create({ data: { name: 'Riya Sharma', email: 'riya@forgeos.local', passwordHash: pass, role: 'PM', phone: '+91 98220 44510', createdAt: monthAgo(8) } }),
    db.user.create({ data: { name: 'Yashmeen Khan', email: 'yashmeen@forgeos.local', passwordHash: pass, role: 'PM', phone: '+91 99675 88214', createdAt: monthAgo(7) } }),
    db.user.create({ data: { name: 'Vinayak Patil', email: 'vinayak@forgeos.local', passwordHash: pass, role: 'PM', phone: '+91 91750 33018', createdAt: monthAgo(6) } }),
    db.user.create({ data: { name: 'Aisha Rao', email: 'aisha@forgeos.local', passwordHash: pass, role: 'VIEWER', phone: '+91 98330 55201', createdAt: monthAgo(5) } }),
  ])
  await db.user.create({
    data: { name: 'Rohit Deshmukh', email: 'rohit@forgeos.local', passwordHash: pass, role: 'PM', phone: '+91 96890 77452', isActive: false, createdAt: monthAgo(6) },
  })

  console.log('Creating lands...')
  const [whitefieldLand, kharadiLand, powaiLand, hinjewadiLand] = await Promise.all([
    db.land.create({
      data: {
        name: 'Whitefield Plot', addressLine: 'Survey 44/2, off Kadugodi Main Road', city: 'Bengaluru', state: 'Karnataka',
        pincode: '560067', areaValue: 8400, areaUnit: 'SQFT', surveyNumber: 'KIADB-1234', ownerName: 'Forge Estates Pvt Ltd',
        purchaseDate: monthAgo(11), purchaseCost: 3_10_00_000, notes: 'Corner plot with 40 ft road on two sides', createdById: admin.id, createdAt: monthAgo(11),
      },
    }),
    db.land.create({
      data: {
        name: 'Kharadi Plot', addressLine: 'Kharadi-Shikali Link Road', city: 'Pune', state: 'Maharashtra',
        pincode: '411014', areaValue: 22000, areaUnit: 'SQFT', surveyNumber: 'KHP-8871', ownerName: 'Forge Estates Pvt Ltd',
        purchaseDate: monthAgo(10), purchaseCost: 7_40_00_000, notes: 'Consolidated from two adjacent holdings', createdById: admin.id, createdAt: monthAgo(10),
      },
    }),
    db.land.create({
      data: {
        name: 'Powai Plot', addressLine: 'Near Hiranandani Gardens, Powai', city: 'Mumbai', state: 'Maharashtra',
        pincode: '400076', areaValue: 11200, areaUnit: 'SQFT', surveyNumber: 'MUM-4471', ownerName: 'Aditi Verma',
        purchaseDate: monthAgo(13), purchaseCost: 9_20_00_000, notes: 'Leasehold, 89 years remaining', createdById: admin.id, createdAt: monthAgo(13),
      },
    }),
    db.land.create({
      data: {
        name: 'Hinjewadi Plot', addressLine: 'Phase 3, behind Rajiv Gandhi Infotech Park', city: 'Pune', state: 'Maharashtra',
        pincode: '411057', areaValue: 15000, areaUnit: 'SQFT', surveyNumber: 'HJP-2210', ownerName: 'Forge Estates Pvt Ltd',
        purchaseDate: monthAgo(3), purchaseCost: 4_50_00_000, notes: 'Future mixed-use development', createdById: admin.id, createdAt: monthAgo(3),
      },
    }),
  ])

  console.log('Creating suppliers...')
  const [venkCements, puneSteel, konkanSand, buildmart, deccanBlocks, shreeRmc] = await Promise.all([
    db.supplier.create({ data: { name: 'Sri Venkateswara Cements', phone: '+91 98450 12345', email: 'sales@svcemblr.in', address: 'Peenya, Bengaluru', createdAt: monthAgo(8) } }),
    db.supplier.create({ data: { name: 'Pune Steel Traders', phone: '+91 98220 44110', email: 'orders@punesteel.co.in', address: 'Bhosari, Pune', createdAt: monthAgo(8) } }),
    db.supplier.create({ data: { name: 'Konkan Sand & Aggregates', phone: '+91 99675 88214', address: 'Talegaon, Pune', createdAt: monthAgo(7) } }),
    db.supplier.create({ data: { name: 'BuildMart Mumbai', phone: '+91 98330 55201', email: 'hello@buildmart.in', address: 'Bhiwandi, Mumbai', createdAt: monthAgo(7) } }),
    db.supplier.create({ data: { name: 'Deccan Block Works', phone: '+91 91750 33018', address: 'Chakan, Pune', createdAt: monthAgo(6) } }),
    db.supplier.create({ data: { name: 'Shree RMC Suppliers', phone: '+91 96890 77452', email: 'dispatch@shreermc.in', address: 'Wagholi, Pune', createdAt: monthAgo(5) } }),
  ])

  console.log('Creating materials...')
  interface MatSpec { name: string; unit: string; category: string; description: string; active?: boolean }
  const matSpecs: MatSpec[] = [
    { name: 'OPC 53 Grade Cement', unit: 'bag', category: 'CEMENT', description: '53 grade ordinary Portland cement, 50 kg bags' },
    { name: 'TMT Steel Fe-500D 12mm', unit: 'tonne', category: 'STEEL', description: 'Thermo-mechanically treated rebar, 12 mm dia' },
    { name: 'TMT Steel Fe-500D 8mm', unit: 'tonne', category: 'STEEL', description: 'Thermo-mechanically treated rebar, 8 mm dia' },
    { name: 'Red Clay Bricks', unit: 'nos', category: 'BRICKS_BLOCKS', description: 'Table-moulded red clay bricks, class A' },
    { name: 'River Sand', unit: 'cft', category: 'SAND_AGGREGATE', description: 'Natural river sand, zone II gradation' },
    { name: 'Aggregate 20mm', unit: 'cft', category: 'SAND_AGGREGATE', description: 'Crushed granite aggregate, 20 mm nominal' },
    { name: 'AAC Block 600x200x150', unit: 'nos', category: 'BRICKS_BLOCKS', description: 'Autoclaved aerated concrete block' },
    { name: 'Ready Mix Concrete M25', unit: 'cum', category: 'OTHER', description: 'Design mix M25, pumping included' },
    { name: 'Wall Putty', unit: 'bag', category: 'PAINT_FINISH', description: 'White cement based wall putty, 40 kg' },
    { name: 'Emulsion Paint', unit: 'litre', category: 'PAINT_FINISH', description: 'Interior acrylic emulsion, washable' },
    { name: 'Waterproofing Compound', unit: 'kg', category: 'OTHER', description: 'Integral crystalline waterproofing' },
    { name: 'PVC Pipe 4 inch', unit: 'nos', category: 'PLUMBING', description: 'SWR drainage pipe, 110 mm, 3 m length' },
    { name: 'Electrical Wire 2.5 sqmm', unit: 'coil', category: 'ELECTRICAL', description: 'FR PVC insulated copper wire, 90 m coil' },
    { name: 'Asbestos Sheet', unit: 'nos', category: 'OTHER', description: 'Corrugated cement asbestos sheet', active: false },
  ]
  const mats: Record<string, string> = {}
  for (const spec of matSpecs) {
    const m = await db.material.create({
      data: { name: spec.name, unit: spec.unit, category: spec.category, description: spec.description, isActive: spec.active ?? true, createdAt: monthAgo(8) },
    })
    mats[spec.name] = m.id
  }

  console.log('Creating projects...')
  const whitefield = await db.project.create({
    data: {
      code: 'FOS-001', name: 'Whitefield Villas', landId: whitefieldLand.id, assignedPmId: riya.id, createdById: admin.id,
      location: 'Whitefield, Bengaluru', description: 'Four luxury villas with clubhouse, G+1 structure',
      status: 'ACTIVE', totalBudget: 2_40_00_000, wastageThresholdPct: 5, startDate: monthAgo(5), expectedEndDate: daysAhead(90), createdAt: monthAgo(6),
    },
  })
  const kharadiA = await db.project.create({
    data: {
      code: 'FOS-002', name: 'Kharadi Tower A', landId: kharadiLand.id, assignedPmId: yashmeen.id, createdById: admin.id,
      location: 'Kharadi, Pune', description: 'Residential tower, 2 basements + 14 floors',
      status: 'ACTIVE', totalBudget: 5_80_00_000, wastageThresholdPct: 4, startDate: monthAgo(3), expectedEndDate: daysAhead(270), createdAt: monthAgo(4),
    },
  })
  const powaiRow = await db.project.create({
    data: {
      code: 'FOS-003', name: 'Powai Row Houses', landId: powaiLand.id, assignedPmId: riya.id, createdById: admin.id,
      location: 'Powai, Mumbai', description: 'Six premium row houses, G+2',
      status: 'PLANNING', totalBudget: 3_60_00_000, wastageThresholdPct: 5, startDate: daysAhead(45), expectedEndDate: daysAhead(400), createdAt: monthAgo(2),
    },
  })
  const kharadiB = await db.project.create({
    data: {
      code: 'FOS-004', name: 'Kharadi Tower B', landId: kharadiLand.id, createdById: admin.id,
      location: 'Kharadi, Pune', description: 'Second tower on the consolidated Kharadi plot',
      status: 'PLANNING', totalBudget: 5_20_00_000, wastageThresholdPct: 4, startDate: daysAhead(120), expectedEndDate: daysAhead(600), createdAt: monthAgo(1),
    },
  })
  const wfPhase2 = await db.project.create({
    data: {
      code: 'FOS-005', name: 'Whitefield Phase 2', landId: whitefieldLand.id, assignedPmId: riya.id, createdById: admin.id,
      location: 'Whitefield, Bengaluru', description: 'Clubhouse and landscape package for the villa enclave',
      status: 'ON_HOLD', totalBudget: 1_80_00_000, wastageThresholdPct: 6, startDate: monthAgo(2), expectedEndDate: daysAhead(200), createdAt: monthAgo(3),
    },
  })
  const powaiDuplex = await db.project.create({
    data: {
      code: 'FOS-006', name: 'Powai Duplex Home', landId: powaiLand.id, assignedPmId: yashmeen.id, createdById: admin.id,
      location: 'Powai, Mumbai', description: 'Standalone duplex, handed over last month',
      status: 'COMPLETED', totalBudget: 95_00_000, wastageThresholdPct: 5, startDate: monthAgo(10), expectedEndDate: daysAgo(30), actualEndDate: daysAgo(22), createdAt: monthAgo(11),
    },
  })

  console.log('Creating material plans...')
  interface PlanSpec {
    project: string; material: string; plannedQuantity: number; plannedUnitRate: number; wastageThresholdPct: number
    openingQuantity?: number; lowStockThreshold?: number; status: 'DRAFT' | 'APPROVED' | 'ARCHIVED'; notes?: string; by: string; daysOld: number
  }
  const planSpecs: PlanSpec[] = [
    { project: whitefield.id, material: 'OPC 53 Grade Cement', plannedQuantity: 18000, plannedUnitRate: 395, wastageThresholdPct: 3, openingQuantity: 2500, lowStockThreshold: 800, status: 'APPROVED', by: riya.id, daysOld: 145 },
    { project: whitefield.id, material: 'TMT Steel Fe-500D 12mm', plannedQuantity: 210, plannedUnitRate: 61500, wastageThresholdPct: 2.5, lowStockThreshold: 20, status: 'APPROVED', by: riya.id, daysOld: 140 },
    { project: whitefield.id, material: 'River Sand', plannedQuantity: 14500, plannedUnitRate: 55, wastageThresholdPct: 6, status: 'APPROVED', by: riya.id, daysOld: 138 },
    { project: whitefield.id, material: 'Red Clay Bricks', plannedQuantity: 138000, plannedUnitRate: 9.5, wastageThresholdPct: 5, status: 'APPROVED', by: riya.id, daysOld: 132 },
    { project: whitefield.id, material: 'Wall Putty', plannedQuantity: 850, plannedUnitRate: 720, wastageThresholdPct: 2, lowStockThreshold: 60, status: 'APPROVED', by: riya.id, daysOld: 90 },
    { project: kharadiA.id, material: 'OPC 53 Grade Cement', plannedQuantity: 26000, plannedUnitRate: 395, wastageThresholdPct: 3, openingQuantity: 1500, lowStockThreshold: 1000, status: 'APPROVED', by: yashmeen.id, daysOld: 88 },
    { project: kharadiA.id, material: 'TMT Steel Fe-500D 12mm', plannedQuantity: 340, plannedUnitRate: 61500, wastageThresholdPct: 2.5, lowStockThreshold: 30, status: 'APPROVED', by: yashmeen.id, daysOld: 86 },
    { project: kharadiA.id, material: 'TMT Steel Fe-500D 8mm', plannedQuantity: 95, plannedUnitRate: 60200, wastageThresholdPct: 2.5, status: 'APPROVED', by: yashmeen.id, daysOld: 85 },
    { project: kharadiA.id, material: 'River Sand', plannedQuantity: 21000, plannedUnitRate: 55, wastageThresholdPct: 6, status: 'APPROVED', by: yashmeen.id, daysOld: 80 },
    { project: kharadiA.id, material: 'Aggregate 20mm', plannedQuantity: 18500, plannedUnitRate: 48, wastageThresholdPct: 6, status: 'APPROVED', by: yashmeen.id, daysOld: 78 },
    { project: kharadiA.id, material: 'Ready Mix Concrete M25', plannedQuantity: 1450, plannedUnitRate: 5800, wastageThresholdPct: 2, status: 'APPROVED', by: yashmeen.id, daysOld: 70 },
    { project: kharadiA.id, material: 'AAC Block 600x200x150', plannedQuantity: 24000, plannedUnitRate: 58, wastageThresholdPct: 4, status: 'DRAFT', by: yashmeen.id, daysOld: 12, notes: 'Pending approval after block-work sample review' },
    { project: powaiRow.id, material: 'OPC 53 Grade Cement', plannedQuantity: 9500, plannedUnitRate: 395, wastageThresholdPct: 3, status: 'DRAFT', by: riya.id, daysOld: 20 },
    { project: wfPhase2.id, material: 'OPC 53 Grade Cement', plannedQuantity: 6000, plannedUnitRate: 395, wastageThresholdPct: 3, status: 'APPROVED', by: riya.id, daysOld: 55 },
    { project: powaiDuplex.id, material: 'OPC 53 Grade Cement', plannedQuantity: 4200, plannedUnitRate: 395, wastageThresholdPct: 3, status: 'ARCHIVED', by: yashmeen.id, daysOld: 280 },
    { project: powaiDuplex.id, material: 'River Sand', plannedQuantity: 3200, plannedUnitRate: 55, wastageThresholdPct: 6, status: 'ARCHIVED', by: yashmeen.id, daysOld: 278 },
  ]
  for (const spec of planSpecs) {
    await db.materialPlan.create({
      data: {
        projectId: spec.project, materialId: mats[spec.material], plannedQuantity: spec.plannedQuantity,
        plannedUnitRate: spec.plannedUnitRate, wastageThresholdPct: spec.wastageThresholdPct,
        openingQuantity: spec.openingQuantity ?? 0, lowStockThreshold: spec.lowStockThreshold ?? null,
        status: spec.status, notes: spec.notes ?? null,
        createdById: spec.by, createdAt: daysAgo(spec.daysOld),
      },
    })
  }

  console.log('Creating inventory transactions...')
  const rates: Record<string, number> = {
    'OPC 53 Grade Cement': 395,
    'TMT Steel Fe-500D 12mm': 61500,
    'TMT Steel Fe-500D 8mm': 60200,
    'Red Clay Bricks': 9.5,
    'River Sand': 55,
    'Aggregate 20mm': 48,
    'AAC Block 600x200x150': 58,
    'Ready Mix Concrete M25': 5800,
    'Wall Putty': 720,
  }
  const supplierFor: Record<string, string> = {
    'OPC 53 Grade Cement': venkCements.id,
    'TMT Steel Fe-500D 12mm': puneSteel.id,
    'TMT Steel Fe-500D 8mm': puneSteel.id,
    'Red Clay Bricks': deccanBlocks.id,
    'River Sand': konkanSand.id,
    'Aggregate 20mm': konkanSand.id,
    'AAC Block 600x200x150': deccanBlocks.id,
    'Ready Mix Concrete M25': shreeRmc.id,
    'Wall Putty': buildmart.id,
  }
  let challan = 4400
  const nextChallan = () => `CH-${++challan}`

  async function addIns(projectId: string, materialName: string, chunks: { qty: number; daysOld: number }[]) {
    for (const c of chunks) {
      await db.inventoryTransaction.create({
        data: {
          projectId, materialId: mats[materialName], vendorId: supplierFor[materialName],
          txnType: 'IN', quantity: c.qty, unitRate: Math.round(jitter(rates[materialName], 0.05)),
          challanNumber: nextChallan(), txnDate: daysAgo(c.daysOld), recordedById: admin.id, createdAt: daysAgo(c.daysOld, 11),
        },
      })
    }
  }

  /** Splits totalQty into n dated USED OUT chunks spread over the last `span` days. */
  async function addOuts(projectId: string, materialName: string, totalQty: number, chunks: number, spanDays: number, recorderId: string) {
    const per = totalQty / chunks
    for (let i = 0; i < chunks; i++) {
      const daysOld = Math.round(spanDays * (1 - (i + 0.5) / chunks))
      await db.inventoryTransaction.create({
        data: {
          projectId, materialId: mats[materialName], txnType: 'OUT',
          quantity: Math.round(jitter(per, 0.08) * 100) / 100, outReason: 'USED',
          txnDate: daysAgo(daysOld), recordedById: recorderId, createdAt: daysAgo(daysOld, 17),
        },
      })
    }
  }

  // Whitefield Villas — progress 62% of plan; consumption calibrated to show OK + OVERRUN mix
  await addIns(whitefield.id, 'OPC 53 Grade Cement', [{ qty: 6000, daysOld: 148 }, { qty: 6000, daysOld: 110 }, { qty: 5000, daysOld: 65 }])
  await addOuts(whitefield.id, 'OPC 53 Grade Cement', 11350, 9, 140, riya.id)
  await addIns(whitefield.id, 'TMT Steel Fe-500D 12mm', [{ qty: 110, daysOld: 142 }, { qty: 105, daysOld: 70 }])
  await addOuts(whitefield.id, 'TMT Steel Fe-500D 12mm', 152, 7, 130, riya.id)
  await addIns(whitefield.id, 'River Sand', [{ qty: 8000, daysOld: 139 }, { qty: 7000, daysOld: 60 }])
  await addOuts(whitefield.id, 'River Sand', 9100, 8, 125, riya.id)
  await addIns(whitefield.id, 'Red Clay Bricks', [{ qty: 52000, daysOld: 130 }, { qty: 48000, daysOld: 45 }])
  await addOuts(whitefield.id, 'Red Clay Bricks', 90400, 8, 120, riya.id)
  await db.inventoryTransaction.create({
    data: {
      projectId: whitefield.id, materialId: mats['Red Clay Bricks'], txnType: 'OUT', quantity: 600, outReason: 'DAMAGED',
      remarks: 'Broken during unloading at Villa 2', txnDate: daysAgo(44), recordedById: riya.id, createdAt: daysAgo(44, 16),
    },
  })
  await addIns(whitefield.id, 'Wall Putty', [{ qty: 600, daysOld: 30 }])
  await addOuts(whitefield.id, 'Wall Putty', 535, 5, 25, riya.id)
  // Stock reconciliation on sand after monsoon washout
  await db.inventoryTransaction.create({
    data: {
      projectId: whitefield.id, materialId: mats['River Sand'], txnType: 'ADJUSTMENT', quantity: -180,
      remarks: 'Reconciliation after rain washout at stock yard', txnDate: daysAgo(38), recordedById: riya.id, createdAt: daysAgo(38, 12),
    },
  })

  // Kharadi Tower A — progress 35%
  await addIns(kharadiA.id, 'OPC 53 Grade Cement', [{ qty: 9000, daysOld: 85 }, { qty: 9000, daysOld: 50 }, { qty: 6000, daysOld: 18 }])
  await addOuts(kharadiA.id, 'OPC 53 Grade Cement', 9250, 8, 80, yashmeen.id)
  await db.inventoryTransaction.create({
    data: {
      projectId: kharadiA.id, materialId: mats['OPC 53 Grade Cement'], txnType: 'OUT', quantity: 150, outReason: 'DAMAGED',
      remarks: 'Bags hardened in basement store', txnDate: daysAgo(21), recordedById: yashmeen.id, createdAt: daysAgo(21, 15),
    },
  })
  await addIns(kharadiA.id, 'TMT Steel Fe-500D 12mm', [{ qty: 180, daysOld: 82 }, { qty: 180, daysOld: 40 }])
  await addOuts(kharadiA.id, 'TMT Steel Fe-500D 12mm', 141, 7, 75, yashmeen.id)
  await addIns(kharadiA.id, 'TMT Steel Fe-500D 8mm', [{ qty: 50, daysOld: 80 }, { qty: 48, daysOld: 38 }])
  await addOuts(kharadiA.id, 'TMT Steel Fe-500D 8mm', 33.5, 6, 70, yashmeen.id)
  await addIns(kharadiA.id, 'River Sand', [{ qty: 12000, daysOld: 78 }, { qty: 11000, daysOld: 25 }])
  await addOuts(kharadiA.id, 'River Sand', 7500, 8, 72, yashmeen.id)
  await addIns(kharadiA.id, 'Aggregate 20mm', [{ qty: 10000, daysOld: 76 }, { qty: 9500, daysOld: 22 }])
  await addOuts(kharadiA.id, 'Aggregate 20mm', 6600, 7, 68, yashmeen.id)
  await db.inventoryTransaction.create({
    data: {
      projectId: kharadiA.id, materialId: mats['Aggregate 20mm'], txnType: 'ADJUSTMENT', quantity: 120,
      remarks: 'Recount surplus after stock verification', txnDate: daysAgo(19), recordedById: yashmeen.id, createdAt: daysAgo(19, 11),
    },
  })
  await addIns(kharadiA.id, 'Ready Mix Concrete M25', [{ qty: 750, daysOld: 66 }, { qty: 700, daysOld: 20 }])
  await addOuts(kharadiA.id, 'Ready Mix Concrete M25', 560, 6, 60, yashmeen.id)
  await addIns(kharadiA.id, 'AAC Block 600x200x150', [{ qty: 14000, daysOld: 14 }])
  await addOuts(kharadiA.id, 'AAC Block 600x200x150', 8200, 5, 10, yashmeen.id)

  // Whitefield Phase 2 (on hold) — early procurement before hold
  await addIns(wfPhase2.id, 'OPC 53 Grade Cement', [{ qty: 2200, daysOld: 50 }, { qty: 1800, daysOld: 46 }])
  await addOuts(wfPhase2.id, 'OPC 53 Grade Cement', 520, 4, 40, riya.id)

  // Powai Duplex (completed)
  await addIns(powaiDuplex.id, 'OPC 53 Grade Cement', [{ qty: 2200, daysOld: 260 }, { qty: 2100, daysOld: 200 }])
  await addOuts(powaiDuplex.id, 'OPC 53 Grade Cement', 4150, 6, 210, yashmeen.id)
  await addIns(powaiDuplex.id, 'River Sand', [{ qty: 2000, daysOld: 240 }, { qty: 1800, daysOld: 190 }])
  await addOuts(powaiDuplex.id, 'River Sand', 3420, 5, 200, yashmeen.id)

  // One pre-voided transaction to showcase the void trail
  const voidedCement = await db.inventoryTransaction.create({
    data: {
      projectId: whitefield.id, materialId: mats['OPC 53 Grade Cement'], vendorId: venkCements.id,
      txnType: 'IN', quantity: 900, unitRate: 395, challanNumber: 'CH-4471', txnDate: daysAgo(9), recordedById: riya.id, createdAt: daysAgo(9, 12),
      voidedAt: daysAgo(8, 9), voidReason: 'Duplicate entry — challan 4471 was already recorded the same day', voidedById: admin.id,
    },
  })

  console.log('Creating daily logs with labour and machinery entries...')
  interface LabourSpec { trade: string; contractorName?: string; headCount: number; hoursWorked: number }
  interface MachinerySpec { machineName: string; operatorName?: string; hoursUsed: number; fuelLitres?: number }
  interface LogSpec {
    project: string; daysOld: number; progressPercent: number; workSummary: string; weather?: string; issues?: string
    by: string; labour: LabourSpec[]; machinery: MachinerySpec[]
  }
  const logSpecs: LogSpec[] = [
    {
      project: whitefield.id, daysOld: 11, progressPercent: 38, by: riya.id, weather: 'Clear',
      workSummary: 'Plastering started on Villa 1 internal walls; slab area marked for Villa 3 first floor',
      labour: [
        { trade: 'Plasterer', contractorName: 'Ramesh Yadav', headCount: 12, hoursWorked: 8 },
        { trade: 'Helper', headCount: 6, hoursWorked: 8 },
      ],
      machinery: [{ machineName: 'Mixer 0.5 cum', operatorName: 'Suresh P', hoursUsed: 6.5, fuelLitres: 9 }],
    },
    {
      project: whitefield.id, daysOld: 8, progressPercent: 42, by: riya.id, weather: 'Clear',
      workSummary: 'Steel tying for beams 14-18, Villa 3; putty received and stacked in store',
      labour: [
        { trade: 'Bar Bender', contractorName: 'Md. Irfan', headCount: 12, hoursWorked: 9 },
        { trade: 'Helper', headCount: 4, hoursWorked: 8 },
      ],
      machinery: [{ machineName: 'Bar Cutting Machine', operatorName: 'Vikram S', hoursUsed: 4, fuelLitres: 5 }],
    },
    {
      project: whitefield.id, daysOld: 6, progressPercent: 45, by: riya.id, weather: 'Light rain', issues: 'Rain halted plastering for 3 hours on Villa 1',
      workSummary: 'Curing and site cleanup after slab pour; rain protection for cement store',
      labour: [
        { trade: 'Helper', headCount: 8, hoursWorked: 7 },
        { trade: 'Mason', contractorName: 'Ramesh Yadav', headCount: 4, hoursWorked: 5 },
      ],
      machinery: [],
    },
    {
      project: whitefield.id, daysOld: 4, progressPercent: 48, by: riya.id, weather: 'Clear',
      workSummary: 'Brickwork — Villa 2 ground floor east wing; AAC sample wall discussion with architect',
      labour: [
        { trade: 'Mason', contractorName: 'Ramesh Yadav', headCount: 14, hoursWorked: 8 },
        { trade: 'Helper', headCount: 8, hoursWorked: 8 },
      ],
      machinery: [{ machineName: 'Mixer 0.5 cum', operatorName: 'Suresh P', hoursUsed: 5.5, fuelLitres: 8 }],
    },
    {
      project: whitefield.id, daysOld: 2, progressPercent: 55, by: riya.id, weather: 'Clear',
      workSummary: 'Column casting — Villa 4 footings completed with M25 from site mixer, 4 pours',
      labour: [
        { trade: 'Mason', contractorName: 'Ramesh Yadav', headCount: 10, hoursWorked: 10 },
        { trade: 'Bar Bender', contractorName: 'Md. Irfan', headCount: 8, hoursWorked: 9 },
        { trade: 'Helper', headCount: 8, hoursWorked: 10 },
      ],
      machinery: [
        { machineName: 'Mixer 0.5 cum', operatorName: 'Suresh P', hoursUsed: 9, fuelLitres: 13 },
        { machineName: 'Needle Vibrator', hoursUsed: 3, fuelLitres: 2 },
      ],
    },
    {
      project: whitefield.id, daysOld: 1, progressPercent: 62, by: riya.id, weather: 'Clear',
      workSummary: 'Slab shuttering for Villa 3, first floor; beam alignment checked by structural consultant',
      labour: [
        { trade: 'Shuttering Carpenter', contractorName: 'Bhima Rao', headCount: 16, hoursWorked: 9 },
        { trade: 'Bar Bender', contractorName: 'Md. Irfan', headCount: 8, hoursWorked: 9 },
      ],
      machinery: [{ machineName: 'Concrete Pump', operatorName: 'Tata Ace crew', hoursUsed: 2, fuelLitres: 6 }],
    },
    {
      project: kharadiA.id, daysOld: 10, progressPercent: 12, by: yashmeen.id, weather: 'Clear',
      workSummary: 'Survey mark transfer to basement slab; de-watering wells running in zone A',
      labour: [{ trade: 'Surveyor', contractorName: 'Geoline Surveys', headCount: 5, hoursWorked: 6 }],
      machinery: [{ machineName: 'Dewatering Pump 10HP', hoursUsed: 14, fuelLitres: 18 }],
    },
    {
      project: kharadiA.id, daysOld: 7, progressPercent: 18, by: yashmeen.id, weather: 'Clear', issues: 'Anti-termite vendor delayed by a day',
      workSummary: 'De-watering and anti-termite treatment, zone A; PCC lean base cast for raft zone B',
      labour: [
        { trade: 'Helper', headCount: 9, hoursWorked: 8 },
        { trade: 'Mason', contractorName: 'Kalsekar Works', headCount: 6, hoursWorked: 8 },
      ],
      machinery: [{ machineName: 'Mixer 0.5 cum', operatorName: 'Imran K', hoursUsed: 7, fuelLitres: 10 }],
    },
    {
      project: kharadiA.id, daysOld: 5, progressPercent: 22, by: yashmeen.id, weather: 'Clear',
      workSummary: 'Block work sample wall approved by architect; raft steel stacking began',
      labour: [{ trade: 'Mason', contractorName: 'Kalsekar Works', headCount: 10, hoursWorked: 8 }],
      machinery: [],
    },
    {
      project: kharadiA.id, daysOld: 3, progressPercent: 28, by: yashmeen.id, weather: 'Clear',
      workSummary: 'Rebar fixing — raft zone C top mat; chairs and cover blocks placed',
      labour: [
        { trade: 'Bar Bender', contractorName: 'Md. Irfan', headCount: 28, hoursWorked: 9 },
        { trade: 'Helper', headCount: 6, hoursWorked: 9 },
      ],
      machinery: [{ machineName: 'Bar Cutting Machine', operatorName: 'Vikram S', hoursUsed: 6, fuelLitres: 7 }],
    },
    {
      project: kharadiA.id, daysOld: 1, progressPercent: 35, by: yashmeen.id, weather: 'Clear',
      workSummary: 'Raft pour zone B — 320 cum M25 RMC, night pour with 2 pump lines',
      labour: [
        { trade: 'Mason', contractorName: 'Kalsekar Works', headCount: 18, hoursWorked: 11 },
        { trade: 'Helper', headCount: 17, hoursWorked: 11 },
      ],
      machinery: [
        { machineName: 'Concrete Pump 42m', operatorName: 'Shree RMC crew', hoursUsed: 8, fuelLitres: 24 },
        { machineName: 'Needle Vibrator', hoursUsed: 8, fuelLitres: 5 },
      ],
    },
    {
      project: wfPhase2.id, daysOld: 13, progressPercent: 8, by: riya.id, weather: 'Clear', issues: 'Hold review pending with client committee',
      workSummary: 'Site barricading and material securing before hold review',
      labour: [{ trade: 'Helper', headCount: 6, hoursWorked: 6 }],
      machinery: [],
    },
    {
      project: powaiDuplex.id, daysOld: 30, progressPercent: 92, by: yashmeen.id, weather: 'Clear',
      workSummary: 'Snag list closure with client; final coat and fittings touch-up',
      labour: [
        { trade: 'Painter', contractorName: 'ColourCraft', headCount: 6, hoursWorked: 8 },
        { trade: 'Carpenter', headCount: 3, hoursWorked: 8 },
      ],
      machinery: [],
    },
    {
      project: powaiDuplex.id, daysOld: 22, progressPercent: 100, by: yashmeen.id, weather: 'Clear',
      workSummary: 'Handover walkthrough completed; all snugs closed and keys transferred',
      labour: [{ trade: 'Helper', headCount: 4, hoursWorked: 5 }],
      machinery: [],
    },
  ]
  const logIds: Record<string, string> = {}
  for (const spec of logSpecs) {
    const log = await db.dailyLog.create({
      data: {
        projectId: spec.project, logDate: daysAgo(spec.daysOld), progressPercent: spec.progressPercent,
        workSummary: spec.workSummary, weather: spec.weather ?? null, issues: spec.issues ?? null,
        createdById: spec.by, createdAt: daysAgo(spec.daysOld, 18),
        labourEntries: {
          create: spec.labour.map((l) => ({
            trade: l.trade, contractorName: l.contractorName ?? null, headCount: l.headCount,
            hoursWorked: l.hoursWorked, remarks: null,
          })),
        },
        machineryEntries: {
          create: spec.machinery.map((m) => ({
            machineName: m.machineName, operatorName: m.operatorName ?? null, hoursUsed: m.hoursUsed,
            fuelLitres: m.fuelLitres ?? null, remarks: null,
          })),
        },
      },
    })
    logIds[`${spec.project}:${spec.daysOld}`] = log.id
  }

  console.log('Creating milestones...')
  interface MilestoneSpec {
    project: string; name: string; sequence: number; status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED'
    progressPercent: number; plannedStart?: number; plannedEnd?: number; actualStart?: number; actualEnd?: number; description?: string
  }
  const milestoneSpecs: MilestoneSpec[] = [
    { project: whitefield.id, name: 'Excavation & Foundation', sequence: 1, status: 'COMPLETED', progressPercent: 100, plannedStart: 150, plannedEnd: 110, actualStart: 149, actualEnd: 105, description: 'Footings, PCC and plinth beams for all villas' },
    { project: whitefield.id, name: 'Structural Frame', sequence: 2, status: 'IN_PROGRESS', progressPercent: 55, plannedStart: 110, plannedEnd: 30, actualStart: 108, description: 'Columns, slabs and staircase per villa' },
    { project: whitefield.id, name: 'Masonry & Plaster', sequence: 3, status: 'IN_PROGRESS', progressPercent: 30, plannedStart: 70, plannedEnd: -20, actualStart: 40 },
    { project: whitefield.id, name: 'Finishing & Fittings', sequence: 4, status: 'PLANNED', progressPercent: 0, plannedStart: -20, plannedEnd: -70 },
    { project: whitefield.id, name: 'Handover', sequence: 5, status: 'PLANNED', progressPercent: 0, plannedStart: -70, plannedEnd: -90 },
    { project: kharadiA.id, name: 'Excavation & Piling', sequence: 1, status: 'COMPLETED', progressPercent: 100, plannedStart: 95, plannedEnd: 75, actualStart: 94, actualEnd: 72 },
    { project: kharadiA.id, name: 'Raft & Basement', sequence: 2, status: 'IN_PROGRESS', progressPercent: 40, plannedStart: 75, plannedEnd: -60, actualStart: 70 },
    { project: kharadiA.id, name: 'Tower Structure', sequence: 3, status: 'PLANNED', progressPercent: 0, plannedStart: -60, plannedEnd: -250 },
    { project: powaiDuplex.id, name: 'Construction', sequence: 1, status: 'COMPLETED', progressPercent: 100, plannedStart: 300, plannedEnd: 40, actualStart: 298, actualEnd: 35 },
    { project: powaiDuplex.id, name: 'Handover', sequence: 2, status: 'COMPLETED', progressPercent: 100, plannedStart: 40, plannedEnd: 25, actualStart: 30, actualEnd: 22 },
  ]
  for (const spec of milestoneSpecs) {
    await db.milestone.create({
      data: {
        projectId: spec.project, name: spec.name, sequence: spec.sequence, status: spec.status,
        progressPercent: spec.progressPercent, description: spec.description ?? null,
        plannedStartDate: spec.plannedStart !== undefined ? (spec.plannedStart >= 0 ? daysAgo(spec.plannedStart) : daysAhead(-spec.plannedStart)) : null,
        plannedEndDate: spec.plannedEnd !== undefined ? (spec.plannedEnd >= 0 ? daysAgo(spec.plannedEnd) : daysAhead(-spec.plannedEnd)) : null,
        actualStartDate: spec.actualStart !== undefined ? (spec.actualStart >= 0 ? daysAgo(spec.actualStart) : daysAhead(-spec.actualStart)) : null,
        actualEndDate: spec.actualEnd !== undefined ? (spec.actualEnd >= 0 ? daysAgo(spec.actualEnd) : daysAhead(-spec.actualEnd)) : null,
        createdAt: daysAgo(120),
      },
    })
  }

  console.log('Creating invoices and payments...')
  const year = new Date().getFullYear()
  let invSeq = 0
  const nextInvNo = () => `INV-${year}-${String(++invSeq).padStart(3, '0')}`

  const inv1 = await db.invoice.create({
    data: {
      invoiceNo: nextInvNo(), projectId: whitefield.id, amount: 32_00_000, gstPct: 18, status: 'SENT',
      issueDate: daysAgo(20), dueDate: daysAhead(10), createdAt: daysAgo(20),
    },
  })
  const inv2 = await db.invoice.create({
    data: {
      invoiceNo: nextInvNo(), projectId: whitefield.id, amount: 18_00_000, gstPct: 18, status: 'PARTIALLY_PAID',
      issueDate: daysAgo(42), dueDate: daysAgo(12), createdAt: daysAgo(42),
    },
  })
  await db.payment.create({
    data: { invoiceId: inv2.id, amount: 10_00_000, method: 'BANK', reference: 'NEFT/8273641', paidAt: daysAgo(35), createdAt: daysAgo(35) },
  })
  const inv3 = await db.invoice.create({
    data: {
      invoiceNo: nextInvNo(), projectId: kharadiA.id, amount: 55_00_000, gstPct: 18, status: 'PARTIALLY_PAID',
      issueDate: daysAgo(28), dueDate: daysAhead(2), createdAt: daysAgo(28),
    },
  })
  await db.payment.create({
    data: { invoiceId: inv3.id, amount: 30_00_000, method: 'UPI', reference: 'UPI/4472891', paidAt: daysAgo(24), createdAt: daysAgo(24) },
  })
  const inv4 = await db.invoice.create({
    data: {
      invoiceNo: nextInvNo(), projectId: kharadiA.id, amount: 28_00_000, gstPct: 18, status: 'PAID',
      issueDate: daysAgo(55), dueDate: daysAgo(25), createdAt: daysAgo(55),
    },
  })
  await db.payment.create({
    data: { invoiceId: inv4.id, amount: 15_04_000, method: 'CHEQUE', reference: 'CHQ 442015', paidAt: daysAgo(45), createdAt: daysAgo(45) },
  })
  await db.payment.create({
    data: { invoiceId: inv4.id, amount: 18_00_000, method: 'BANK', reference: 'RTGS/99112', paidAt: daysAgo(30), createdAt: daysAgo(30) },
  })
  await db.invoice.create({
    data: {
      invoiceNo: nextInvNo(), projectId: kharadiA.id, amount: 12_00_000, gstPct: 18, status: 'DRAFT',
      issueDate: daysAgo(3), dueDate: daysAhead(27), createdAt: daysAgo(3),
    },
  })
  await db.invoice.create({
    data: {
      invoiceNo: nextInvNo(), projectId: powaiDuplex.id, amount: 8_50_000, gstPct: 18, status: 'VOID',
      issueDate: daysAgo(60), dueDate: daysAgo(30), createdAt: daysAgo(60),
    },
  })
  const inv7 = await db.invoice.create({
    data: {
      invoiceNo: nextInvNo(), projectId: whitefield.id, amount: 9_00_000, gstPct: 12, status: 'SENT',
      issueDate: daysAgo(6), dueDate: daysAhead(24), createdAt: daysAgo(6),
    },
  })

  console.log('Creating audit trail...')
  interface AuditSpec {
    daysOld: number; action: string; actorId: string | null; actorName: string; entityType?: string; entityId?: string
    projectId?: string; meta?: Record<string, unknown>; ip?: string
  }
  const auditSpecs: AuditSpec[] = [
    { daysOld: 5, action: 'LOGIN', actorId: admin.id, actorName: 'Vaibhav Todi', ip: '103.21.58.9' },
    { daysOld: 5, action: 'LOGIN', actorId: riya.id, actorName: 'Riya Sharma', ip: '49.36.18.201' },
    { daysOld: 4, action: 'STATUS_CHANGE', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'project', entityId: powaiDuplex.id, projectId: powaiDuplex.id, meta: { from: 'ACTIVE', to: 'COMPLETED', project: 'Powai Duplex Home' }, ip: '103.21.58.9' },
    { daysOld: 4, action: 'LOGIN', actorId: yashmeen.id, actorName: 'Yashmeen Khan', ip: '157.32.9.77' },
    { daysOld: 4, action: 'PLAN_CREATE', actorId: yashmeen.id, actorName: 'Yashmeen Khan', entityType: 'material-plan', projectId: kharadiA.id, meta: { project: 'Kharadi Tower A', material: 'AAC Block 600x200x150', qty: 24000 }, ip: '157.32.9.77' },
    { daysOld: 3, action: 'TXN_VOID', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'stock-txn', entityId: voidedCement.id, projectId: whitefield.id, meta: { reason: 'Duplicate entry — challan 4471 was already recorded the same day', quantity: 900, material: 'OPC 53 Grade Cement' }, ip: '103.21.58.9' },
    { daysOld: 3, action: 'LOGIN', actorId: vinayak.id, actorName: 'Vinayak Patil', ip: '182.70.44.12' },
    { daysOld: 3, action: 'INVOICE_CREATE', actorId: vinayak.id, actorName: 'Vinayak Patil', entityType: 'invoice', projectId: whitefield.id, meta: { invoiceNo: inv7.invoiceNo, amount: 900000, gstPct: 12 }, ip: '182.70.44.12' },
    { daysOld: 2, action: 'LOGIN', actorId: riya.id, actorName: 'Riya Sharma', ip: '49.36.18.201' },
    { daysOld: 2, action: 'LOG_CREATE', actorId: riya.id, actorName: 'Riya Sharma', entityType: 'daily-log', projectId: whitefield.id, meta: { project: 'Whitefield Villas', progress: 48 }, ip: '49.36.18.201' },
    { daysOld: 2, action: 'PAYMENT_CREATE', actorId: vinayak.id, actorName: 'Vinayak Patil', entityType: 'payment', projectId: kharadiA.id, meta: { invoiceNo: inv3.invoiceNo, amount: 300000, method: 'UPI' }, ip: '182.70.44.12' },
    { daysOld: 1, action: 'LOGIN', actorId: admin.id, actorName: 'Vaibhav Todi', ip: '103.21.58.9' },
    { daysOld: 1, action: 'STATUS_CHANGE', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'project', entityId: wfPhase2.id, projectId: wfPhase2.id, meta: { from: 'ACTIVE', to: 'ON_HOLD', project: 'Whitefield Phase 2' }, ip: '103.21.58.9' },
    { daysOld: 1, action: 'LOGIN', actorId: yashmeen.id, actorName: 'Yashmeen Khan', ip: '157.32.9.77' },
    { daysOld: 1, action: 'TXN_CREATE', actorId: yashmeen.id, actorName: 'Yashmeen Khan', entityType: 'stock-txn', projectId: kharadiA.id, meta: { type: 'IN', material: 'AAC Block 600x200x150', qty: 14000, project: 'Kharadi Tower A' }, ip: '157.32.9.77' },
    { daysOld: 0, action: 'LOGIN', actorId: riya.id, actorName: 'Riya Sharma', ip: '49.36.18.201' },
    { daysOld: 0, action: 'PLAN_STATUS', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'material-plan', projectId: wfPhase2.id, meta: { from: 'DRAFT', to: 'APPROVED', project: 'Whitefield Phase 2' }, ip: '103.21.58.9' },
    { daysOld: 0, action: 'LOGIN', actorId: aisha.id, actorName: 'Aisha Rao', ip: '152.58.102.4' },
    // Older history beyond the 7-day chart window
    { daysOld: 12, action: 'ASSIGN', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'project', entityId: kharadiA.id, projectId: kharadiA.id, meta: { pm: 'Yashmeen Khan', project: 'Kharadi Tower A' }, ip: '103.21.58.9' },
    { daysOld: 15, action: 'INVOICE_STATUS_CHANGE', actorId: vinayak.id, actorName: 'Vinayak Patil', entityType: 'invoice', projectId: whitefield.id, meta: { from: 'DRAFT', to: 'SENT', invoiceNo: inv1.invoiceNo }, ip: '182.70.44.12' },
    { daysOld: 18, action: 'MATERIAL_UPDATE', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'material', entityId: mats['Asbestos Sheet'], meta: { name: 'Asbestos Sheet', isActive: false }, ip: '103.21.58.9' },
    { daysOld: 21, action: 'USER_UPDATE', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'user', meta: { email: 'rohit@forgeos.local', reason: 'Moved to procurement team' }, ip: '103.21.58.9' },
    { daysOld: 26, action: 'PROJECT_CREATE', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'project', entityId: kharadiB.id, projectId: kharadiB.id, meta: { name: 'Kharadi Tower B', budget: 52000000 }, ip: '103.21.58.9' },
    { daysOld: 33, action: 'LAND_CREATE', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'land', entityId: hinjewadiLand.id, meta: { name: 'Hinjewadi Plot', city: 'Pune', state: 'Maharashtra' }, ip: '103.21.58.9' },
    { daysOld: 38, action: 'PAYMENT_CREATE', actorId: vinayak.id, actorName: 'Vinayak Patil', entityType: 'payment', projectId: kharadiA.id, meta: { invoiceNo: inv4.invoiceNo, amount: 180000, method: 'BANK' }, ip: '182.70.44.12' },
    { daysOld: 47, action: 'PLAN_CREATE', actorId: riya.id, actorName: 'Riya Sharma', entityType: 'material-plan', projectId: whitefield.id, meta: { project: 'Whitefield Villas', material: 'Wall Putty', qty: 850 }, ip: '49.36.18.201' },
    { daysOld: 52, action: 'PROJECT_UPDATE', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'project', entityId: whitefield.id, projectId: whitefield.id, meta: { budget: 24000000 }, ip: '103.21.58.9' },
    { daysOld: 60, action: 'INVOICE_STATUS_CHANGE', actorId: vinayak.id, actorName: 'Vinayak Patil', entityType: 'invoice', projectId: powaiDuplex.id, meta: { from: 'SENT', to: 'VOID', invoiceNo: `INV-${year}-006` }, ip: '182.70.44.12' },
    { daysOld: 88, action: 'STATUS_CHANGE', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'project', entityId: kharadiA.id, projectId: kharadiA.id, meta: { from: 'PLANNING', to: 'ACTIVE', project: 'Kharadi Tower A' }, ip: '103.21.58.9' },
    { daysOld: 150, action: 'PROJECT_CREATE', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'project', entityId: whitefield.id, projectId: whitefield.id, meta: { name: 'Whitefield Villas', budget: 24000000 }, ip: '103.21.58.9' },
    { daysOld: 150, action: 'STATUS_CHANGE', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'project', entityId: whitefield.id, projectId: whitefield.id, meta: { from: 'PLANNING', to: 'ACTIVE', project: 'Whitefield Villas' }, ip: '103.21.58.9' },
  ]
  for (const spec of auditSpecs) {
    await db.auditLog.create({
      data: {
        actorId: spec.actorId, actorName: spec.actorName, action: spec.action,
        entityType: spec.entityType ?? null, entityId: spec.entityId ?? null, projectId: spec.projectId ?? null,
        meta: spec.meta ? JSON.stringify(spec.meta) : null, ip: spec.ip ?? null,
        createdAt: daysAgo(spec.daysOld, 9 + Math.floor(rnd() * 10)),
      },
    })
  }

  const counts = {
    users: await db.user.count(),
    lands: await db.land.count(),
    projects: await db.project.count(),
    materials: await db.material.count(),
    suppliers: await db.supplier.count(),
    plans: await db.materialPlan.count(),
    transactions: await db.inventoryTransaction.count(),
    logs: await db.dailyLog.count(),
    labourEntries: await db.labourEntry.count(),
    machineryEntries: await db.machineryEntry.count(),
    milestones: await db.milestone.count(),
    invoices: await db.invoice.count(),
    payments: await db.payment.count(),
    audit: await db.auditLog.count(),
  }
  console.log('Seed complete:', counts)
  console.log('Demo login: admin@forgeos.local / ForgeOS2026')
}

main()
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
