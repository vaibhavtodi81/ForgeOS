/**
 * ForgeOS seed — realistic Indian construction portfolio.
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
    db.dailyLog.deleteMany(),
    db.inventoryTransaction.deleteMany(),
    db.materialPlan.deleteMany(),
    db.project.deleteMany(),
    db.material.deleteMany(),
    db.supplier.deleteMany(),
    db.land.deleteMany(),
    db.auditLog.deleteMany(),
    db.otpCode.deleteMany(),
    db.oAuthAccount.deleteMany(),
    db.user.deleteMany(),
  ])

  console.log('Creating users...')
  const pass = hashPassword('ForgeOS2026')
  const [admin, riya, yashmeen, vinayak, aisha] = await Promise.all([
    db.user.create({ data: { name: 'Vaibhav Todi', email: 'admin@forgeos.local', passwordHash: pass, role: 'ADMIN', createdAt: monthAgo(9) } }),
    db.user.create({ data: { name: 'Riya Sharma', email: 'riya@forgeos.local', passwordHash: pass, role: 'PROJECT_MANAGER', createdAt: monthAgo(8) } }),
    db.user.create({ data: { name: 'Yashmeen Khan', email: 'yashmeen@forgeos.local', passwordHash: pass, role: 'PROJECT_MANAGER', createdAt: monthAgo(7) } }),
    db.user.create({ data: { name: 'Vinayak Patil', email: 'vinayak@forgeos.local', passwordHash: pass, role: 'ACCOUNTANT', createdAt: monthAgo(6) } }),
    db.user.create({ data: { name: 'Aisha Rao', email: 'aisha@forgeos.local', passwordHash: pass, role: 'VIEWER', createdAt: monthAgo(5) } }),
  ])
  await db.user.create({
    data: { name: 'Rohit Deshmukh', email: 'rohit@forgeos.local', passwordHash: pass, role: 'PROJECT_MANAGER', isActive: false, createdAt: monthAgo(6) },
  })

  console.log('Creating lands...')
  const [whitefieldLand, kharadiLand, powaiLand, hinjewadiLand] = await Promise.all([
    db.land.create({ data: { name: 'Whitefield Plot', location: 'Whitefield, Bengaluru', areaSqft: 8400, khasraNumber: 'KIADB-1234', createdAt: monthAgo(9) } }),
    db.land.create({ data: { name: 'Kharadi Plot', location: 'Kharadi, Pune', areaSqft: 22000, khasraNumber: 'KHP-8871', createdAt: monthAgo(8) } }),
    db.land.create({ data: { name: 'Powai Plot', location: 'Powai, Mumbai', areaSqft: 11200, khasraNumber: 'MUM-4471', createdAt: monthAgo(8) } }),
    db.land.create({ data: { name: 'Hinjewadi Plot', location: 'Hinjewadi Phase 3, Pune', areaSqft: 15000, khasraNumber: 'HJP-2210', createdAt: monthAgo(3) } }),
  ])

  console.log('Creating suppliers...')
  const [venkCements, puneSteel, konkanSand, buildmart, deccanBlocks, shreeRmc] = await Promise.all([
    db.supplier.create({ data: { name: 'Sri Venkateswara Cements', phone: '+91 98450 12345', email: 'sales@svcemblr.in', address: 'Peenya, Bengaluru', createdAt: monthAgo(8) } }),
    db.supplier.create({ data: { name: 'Pune Steel Traders', phone: '+91 98220 44110', email: 'orders@puneSteel.co.in', address: 'Bhosari, Pune', createdAt: monthAgo(8) } }),
    db.supplier.create({ data: { name: 'Konkan Sand & Aggregates', phone: '+91 99675 88214', address: 'Talegaon, Pune', createdAt: monthAgo(7) } }),
    db.supplier.create({ data: { name: 'BuildMart Mumbai', phone: '+91 98330 55201', email: 'hello@buildmart.in', address: 'Bhiwandi, Mumbai', createdAt: monthAgo(7) } }),
    db.supplier.create({ data: { name: 'Deccan Block Works', phone: '+91 91750 33018', address: 'Chakan, Pune', createdAt: monthAgo(6) } }),
    db.supplier.create({ data: { name: 'Shree RMC Suppliers', phone: '+91 96890 77452', email: 'dispatch@shreermc.in', address: 'Wagholi, Pune', createdAt: monthAgo(5) } }),
  ])

  console.log('Creating materials...')
  interface MatSpec { name: string; unit: string; category: string; active?: boolean }
  const matSpecs: MatSpec[] = [
    { name: 'OPC 53 Grade Cement', unit: 'bag', category: 'Structure' },
    { name: 'TMT Steel Fe-500D 12mm', unit: 'tonne', category: 'Structure' },
    { name: 'TMT Steel Fe-500D 8mm', unit: 'tonne', category: 'Structure' },
    { name: 'Red Clay Bricks', unit: 'nos', category: 'Masonry' },
    { name: 'River Sand', unit: 'cft', category: 'Structure' },
    { name: 'Aggregate 20mm', unit: 'cft', category: 'Structure' },
    { name: 'AAC Block 600x200x150', unit: 'nos', category: 'Masonry' },
    { name: 'Ready Mix Concrete M25', unit: 'cum', category: 'Structure' },
    { name: 'Wall Putty', unit: 'bag', category: 'Finishing' },
    { name: 'Emulsion Paint', unit: 'litre', category: 'Finishing' },
    { name: 'Waterproofing Compound', unit: 'kg', category: 'Structure' },
    { name: 'PVC Pipe 4 inch', unit: 'nos', category: 'Plumbing' },
    { name: 'Electrical Wire 2.5 sqmm', unit: 'coil', category: 'Electrical' },
    { name: 'Asbestos Sheet', unit: 'nos', category: 'Roofing', active: false },
  ]
  const mats: Record<string, string> = {}
  for (const spec of matSpecs) {
    const m = await db.material.create({
      data: { name: spec.name, unit: spec.unit, category: spec.category, isActive: spec.active ?? true, createdAt: monthAgo(8) },
    })
    mats[spec.name] = m.id
  }

  console.log('Creating projects...')
  const whitefield = await db.project.create({
    data: {
      code: 'FOS-001', name: 'Whitefield Villas', landId: whitefieldLand.id, pmId: riya.id,
      status: 'ACTIVE', budget: 2_40_00_000, startDate: monthAgo(5), plannedEndDate: daysAhead(90), createdAt: monthAgo(6),
    },
  })
  const kharadiA = await db.project.create({
    data: {
      code: 'FOS-002', name: 'Kharadi Tower A', landId: kharadiLand.id, pmId: yashmeen.id,
      status: 'ACTIVE', budget: 5_80_00_000, startDate: monthAgo(3), plannedEndDate: daysAhead(270), createdAt: monthAgo(4),
    },
  })
  const powaiRow = await db.project.create({
    data: {
      code: 'FOS-003', name: 'Powai Row Houses', landId: powaiLand.id, pmId: riya.id,
      status: 'PLANNING', budget: 3_60_00_000, startDate: daysAhead(45), plannedEndDate: daysAhead(400), createdAt: monthAgo(2),
    },
  })
  const kharadiB = await db.project.create({
    data: {
      code: 'FOS-004', name: 'Kharadi Tower B', landId: kharadiLand.id,
      status: 'PLANNING', budget: 5_20_00_000, startDate: daysAhead(120), plannedEndDate: daysAhead(600), createdAt: monthAgo(1),
    },
  })
  const wfPhase2 = await db.project.create({
    data: {
      code: 'FOS-005', name: 'Whitefield Phase 2', landId: whitefieldLand.id, pmId: riya.id,
      status: 'ON_HOLD', budget: 1_80_00_000, startDate: monthAgo(2), plannedEndDate: daysAhead(200), createdAt: monthAgo(3),
    },
  })
  const powaiDuplex = await db.project.create({
    data: {
      code: 'FOS-006', name: 'Powai Duplex Home', landId: powaiLand.id, pmId: yashmeen.id,
      status: 'COMPLETED', budget: 95_00_000, startDate: monthAgo(10), plannedEndDate: daysAgo(30), actualEndDate: daysAgo(22), createdAt: monthAgo(11),
    },
  })

  console.log('Creating material plans...')
  interface PlanSpec { project: string; material: string; plannedQty: number; wastagePct: number; status: 'DRAFT' | 'APPROVED' | 'ARCHIVED'; notes?: string; by: string; daysOld: number }
  const planSpecs: PlanSpec[] = [
    { project: whitefield.id, material: 'OPC 53 Grade Cement', plannedQty: 18000, wastagePct: 3, status: 'APPROVED', by: riya.id, daysOld: 145 },
    { project: whitefield.id, material: 'TMT Steel Fe-500D 12mm', plannedQty: 210, wastagePct: 2.5, status: 'APPROVED', by: riya.id, daysOld: 140 },
    { project: whitefield.id, material: 'River Sand', plannedQty: 14500, wastagePct: 6, status: 'APPROVED', by: riya.id, daysOld: 138 },
    { project: whitefield.id, material: 'Red Clay Bricks', plannedQty: 138000, wastagePct: 5, status: 'APPROVED', by: riya.id, daysOld: 132 },
    { project: whitefield.id, material: 'Wall Putty', plannedQty: 850, wastagePct: 2, status: 'APPROVED', by: riya.id, daysOld: 90 },
    { project: kharadiA.id, material: 'OPC 53 Grade Cement', plannedQty: 26000, wastagePct: 3, status: 'APPROVED', by: yashmeen.id, daysOld: 88 },
    { project: kharadiA.id, material: 'TMT Steel Fe-500D 12mm', plannedQty: 340, wastagePct: 2.5, status: 'APPROVED', by: yashmeen.id, daysOld: 86 },
    { project: kharadiA.id, material: 'TMT Steel Fe-500D 8mm', plannedQty: 95, wastagePct: 2.5, status: 'APPROVED', by: yashmeen.id, daysOld: 85 },
    { project: kharadiA.id, material: 'River Sand', plannedQty: 21000, wastagePct: 6, status: 'APPROVED', by: yashmeen.id, daysOld: 80 },
    { project: kharadiA.id, material: 'Aggregate 20mm', plannedQty: 18500, wastagePct: 6, status: 'APPROVED', by: yashmeen.id, daysOld: 78 },
    { project: kharadiA.id, material: 'Ready Mix Concrete M25', plannedQty: 1450, wastagePct: 2, status: 'APPROVED', by: yashmeen.id, daysOld: 70 },
    { project: kharadiA.id, material: 'AAC Block 600x200x150', plannedQty: 24000, wastagePct: 4, status: 'DRAFT', by: yashmeen.id, daysOld: 12, notes: 'Pending approval after block-work sample review' },
    { project: powaiRow.id, material: 'OPC 53 Grade Cement', plannedQty: 9500, wastagePct: 3, status: 'DRAFT', by: riya.id, daysOld: 20 },
    { project: wfPhase2.id, material: 'OPC 53 Grade Cement', plannedQty: 6000, wastagePct: 3, status: 'APPROVED', by: riya.id, daysOld: 55 },
    { project: powaiDuplex.id, material: 'OPC 53 Grade Cement', plannedQty: 4200, wastagePct: 3, status: 'ARCHIVED', by: yashmeen.id, daysOld: 280 },
    { project: powaiDuplex.id, material: 'River Sand', plannedQty: 3200, wastagePct: 6, status: 'ARCHIVED', by: yashmeen.id, daysOld: 278 },
  ]
  for (const spec of planSpecs) {
    await db.materialPlan.create({
      data: {
        projectId: spec.project, materialId: mats[spec.material], plannedQty: spec.plannedQty,
        wastagePct: spec.wastagePct, status: spec.status, notes: spec.notes ?? null,
        createdById: spec.by, createdAt: daysAgo(spec.daysOld),
      },
    })
  }

  console.log('Creating inventory transactions...')
  // rate card (INR per unit) for procurement
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

  async function addIns(projectId: string, materialName: string, chunks: { qty: number; daysOld: number }[]) {
    for (const c of chunks) {
      await db.inventoryTransaction.create({
        data: {
          projectId, materialId: mats[materialName], supplierId: supplierFor[materialName],
          txnType: 'IN', quantity: c.qty, unitRate: Math.round(jitter(rates[materialName], 0.05)),
          txnDate: daysAgo(c.daysOld), recordedById: admin.id, createdAt: daysAgo(c.daysOld, 11),
        },
      })
    }
  }

  /** Splits totalQty into n dated OUT chunks spread over the last `span` days. */
  async function addOuts(projectId: string, materialName: string, totalQty: number, chunks: number, spanDays: number, recorderId: string) {
    const per = totalQty / chunks
    for (let i = 0; i < chunks; i++) {
      const daysOld = Math.round(spanDays * (1 - (i + 0.5) / chunks))
      await db.inventoryTransaction.create({
        data: {
          projectId, materialId: mats[materialName], txnType: 'OUT',
          quantity: Math.round(jitter(per, 0.08) * 100) / 100, unitRate: 0,
          txnDate: daysAgo(daysOld), recordedById: recorderId, createdAt: daysAgo(daysOld, 17),
        },
      })
    }
  }

  // Whitefield Villas — consumption targets create a realistic wastage spread
  await addIns(whitefield.id, 'OPC 53 Grade Cement', [{ qty: 6000, daysOld: 148 }, { qty: 6000, daysOld: 110 }, { qty: 5000, daysOld: 65 }])
  await addOuts(whitefield.id, 'OPC 53 Grade Cement', 19150, 9, 140, riya.id)
  await addIns(whitefield.id, 'TMT Steel Fe-500D 12mm', [{ qty: 110, daysOld: 142 }, { qty: 105, daysOld: 70 }])
  await addOuts(whitefield.id, 'TMT Steel Fe-500D 12mm', 203, 7, 130, riya.id)
  await addIns(whitefield.id, 'River Sand', [{ qty: 8000, daysOld: 139 }, { qty: 7000, daysOld: 60 }])
  await addOuts(whitefield.id, 'River Sand', 14000, 8, 125, riya.id)
  await addIns(whitefield.id, 'Red Clay Bricks', [{ qty: 70000, daysOld: 130 }, { qty: 75000, daysOld: 45 }])
  await addOuts(whitefield.id, 'Red Clay Bricks', 141000, 8, 120, riya.id)
  await addIns(whitefield.id, 'Wall Putty', [{ qty: 900, daysOld: 30 }])
  await addOuts(whitefield.id, 'Wall Putty', 760, 5, 25, riya.id)

  // Kharadi Tower A
  await addIns(kharadiA.id, 'OPC 53 Grade Cement', [{ qty: 9000, daysOld: 85 }, { qty: 9000, daysOld: 50 }, { qty: 6000, daysOld: 18 }])
  await addOuts(kharadiA.id, 'OPC 53 Grade Cement', 25800, 8, 80, yashmeen.id)
  await addIns(kharadiA.id, 'TMT Steel Fe-500D 12mm', [{ qty: 180, daysOld: 82 }, { qty: 180, daysOld: 40 }])
  await addOuts(kharadiA.id, 'TMT Steel Fe-500D 12mm', 352, 7, 75, yashmeen.id)
  await addIns(kharadiA.id, 'TMT Steel Fe-500D 8mm', [{ qty: 50, daysOld: 80 }, { qty: 48, daysOld: 38 }])
  await addOuts(kharadiA.id, 'TMT Steel Fe-500D 8mm', 90, 6, 70, yashmeen.id)
  await addIns(kharadiA.id, 'River Sand', [{ qty: 12000, daysOld: 78 }, { qty: 11000, daysOld: 25 }])
  await addOuts(kharadiA.id, 'River Sand', 22000, 8, 72, yashmeen.id)
  await addIns(kharadiA.id, 'Aggregate 20mm', [{ qty: 10000, daysOld: 76 }, { qty: 9500, daysOld: 22 }])
  await addOuts(kharadiA.id, 'Aggregate 20mm', 17900, 7, 68, yashmeen.id)
  await addIns(kharadiA.id, 'Ready Mix Concrete M25', [{ qty: 750, daysOld: 66 }, { qty: 700, daysOld: 20 }])
  await addOuts(kharadiA.id, 'Ready Mix Concrete M25', 1390, 6, 60, yashmeen.id)
  await addIns(kharadiA.id, 'AAC Block 600x200x150', [{ qty: 14000, daysOld: 14 }])
  await addOuts(kharadiA.id, 'AAC Block 600x200x150', 24800, 5, 10, yashmeen.id)

  // Whitefield Phase 2 (on hold) — some procurement before hold
  await addIns(wfPhase2.id, 'OPC 53 Grade Cement', [{ qty: 2200, daysOld: 50 }, { qty: 1800, daysOld: 46 }])
  await addOuts(wfPhase2.id, 'OPC 53 Grade Cement', 2600, 4, 40, riya.id)

  // Powai Duplex (completed)
  await addIns(powaiDuplex.id, 'OPC 53 Grade Cement', [{ qty: 2200, daysOld: 260 }, { qty: 2100, daysOld: 200 }])
  await addOuts(powaiDuplex.id, 'OPC 53 Grade Cement', 4150, 6, 210, yashmeen.id)
  await addIns(powaiDuplex.id, 'River Sand', [{ qty: 2000, daysOld: 240 }])
  await addOuts(powaiDuplex.id, 'River Sand', 3050, 5, 200, yashmeen.id)

  // One pre-voided transaction to showcase the void trail
  const voidedCement = await db.inventoryTransaction.create({
    data: {
      projectId: whitefield.id, materialId: mats['OPC 53 Grade Cement'], supplierId: venkCements.id,
      txnType: 'IN', quantity: 900, unitRate: 395, txnDate: daysAgo(9), recordedById: riya.id, createdAt: daysAgo(9, 12),
      voidedAt: daysAgo(8, 9), voidReason: 'Duplicate entry — challan 4471 was already recorded the same day',
    },
  })

  console.log('Creating daily logs...')
  interface LogSpec { project: string; daysOld: number; workDone: string; headcount: number; by: string; notes?: string }
  const logSpecs: LogSpec[] = [
    { project: whitefield.id, daysOld: 1, workDone: 'Slab shuttering for Villa 3, first floor', headcount: 24, by: riya.id },
    { project: whitefield.id, daysOld: 2, workDone: 'Column casting — Villa 4 footings completed', headcount: 18, by: riya.id, notes: 'M25 concrete from site mixer, 4 pours' },
    { project: whitefield.id, daysOld: 4, workDone: 'Brickwork — Villa 2 ground floor east wing', headcount: 22, by: riya.id },
    { project: whitefield.id, daysOld: 6, workDone: 'Curing and site cleanup after slab pour', headcount: 8, by: riya.id },
    { project: whitefield.id, daysOld: 8, workDone: 'Steel tying for beams 14-18, Villa 3', headcount: 12, by: riya.id },
    { project: whitefield.id, daysOld: 11, workDone: 'Plastering — Villa 1 internal walls', headcount: 16, by: riya.id },
    { project: kharadiA.id, daysOld: 1, workDone: 'Raft pour zone B — 320 cum M25 RMC', headcount: 35, by: yashmeen.id, notes: 'Night pour, 2 pump lines' },
    { project: kharadiA.id, daysOld: 3, workDone: 'Rebar fixing — raft zone C top mat', headcount: 28, by: yashmeen.id },
    { project: kharadiA.id, daysOld: 5, workDone: 'Block work sample wall approved by architect', headcount: 10, by: yashmeen.id },
    { project: kharadiA.id, daysOld: 7, workDone: 'De-watering and anti-termite treatment, zone A', headcount: 9, by: yashmeen.id },
    { project: kharadiA.id, daysOld: 10, workDone: 'Survey mark transfer to 3rd floor slab', headcount: 5, by: yashmeen.id },
    { project: wfPhase2.id, daysOld: 13, workDone: 'Site barricading before hold review', headcount: 6, by: riya.id },
  ]
  for (const spec of logSpecs) {
    await db.dailyLog.create({
      data: {
        projectId: spec.project, logDate: daysAgo(spec.daysOld), workDone: spec.workDone,
        headcount: spec.headcount, notes: spec.notes ?? null, createdById: spec.by, createdAt: daysAgo(spec.daysOld, 18),
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
  await db.payment.create({
    data: { invoiceId: inv7.id, amount: 0.0001, method: 'CASH', reference: null, paidAt: daysAgo(1), createdAt: daysAgo(1) },
  })
  // remove the placeholder zero-ish cash payment (kept only to reach inv7 reference)
  await db.payment.deleteMany({ where: { invoiceId: inv7.id } })

  console.log('Creating audit trail...')
  interface AuditSpec { daysOld: number; action: string; actorId: string | null; actorName: string; entityType?: string; entityId?: string; meta?: Record<string, unknown>; ip?: string }
  const auditSpecs: AuditSpec[] = [
    { daysOld: 5, action: 'LOGIN', actorId: admin.id, actorName: 'Vaibhav Todi', ip: '103.21.58.9' },
    { daysOld: 5, action: 'LOGIN', actorId: riya.id, actorName: 'Riya Sharma', ip: '49.36.18.201' },
    { daysOld: 4, action: 'PROJECT_STATUS_CHANGE', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'PROJECT', entityId: powaiDuplex.id, meta: { from: 'ACTIVE', to: 'COMPLETED', project: 'Powai Duplex Home' }, ip: '103.21.58.9' },
    { daysOld: 4, action: 'LOGIN', actorId: yashmeen.id, actorName: 'Yashmeen Khan', ip: '157.32.9.77' },
    { daysOld: 4, action: 'PLAN_CREATE', actorId: yashmeen.id, actorName: 'Yashmeen Khan', entityType: 'MATERIAL_PLAN', meta: { project: 'Kharadi Tower A', material: 'AAC Block 600x200x150', qty: 24000 }, ip: '157.32.9.77' },
    { daysOld: 3, action: 'INVENTORY_VOID', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'INVENTORY_TRANSACTION', entityId: voidedCement.id, meta: { reason: 'Duplicate entry — challan 4471 was already recorded the same day', quantity: 900, material: 'OPC 53 Grade Cement' }, ip: '103.21.58.9' },
    { daysOld: 3, action: 'LOGIN', actorId: vinayak.id, actorName: 'Vinayak Patil', ip: '182.70.44.12' },
    { daysOld: 3, action: 'INVOICE_CREATE', actorId: vinayak.id, actorName: 'Vinayak Patil', entityType: 'INVOICE', meta: { invoiceNo: inv7.invoiceNo, amount: 900000, gstPct: 12 }, ip: '182.70.44.12' },
    { daysOld: 2, action: 'LOGIN', actorId: riya.id, actorName: 'Riya Sharma', ip: '49.36.18.201' },
    { daysOld: 2, action: 'DAILY_LOG_CREATE', actorId: riya.id, actorName: 'Riya Sharma', entityType: 'DAILY_LOG', meta: { project: 'Whitefield Villas', headcount: 18 }, ip: '49.36.18.201' },
    { daysOld: 2, action: 'PAYMENT_CREATE', actorId: vinayak.id, actorName: 'Vinayak Patil', entityType: 'PAYMENT', meta: { invoiceNo: inv3.invoiceNo, amount: 30000000 / 100, method: 'UPI' }, ip: '182.70.44.12' },
    { daysOld: 1, action: 'LOGIN', actorId: admin.id, actorName: 'Vaibhav Todi', ip: '103.21.58.9' },
    { daysOld: 1, action: 'PROJECT_STATUS_CHANGE', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'PROJECT', entityId: wfPhase2.id, meta: { from: 'ACTIVE', to: 'ON_HOLD', project: 'Whitefield Phase 2' }, ip: '103.21.58.9' },
    { daysOld: 1, action: 'LOGIN', actorId: yashmeen.id, actorName: 'Yashmeen Khan', ip: '157.32.9.77' },
    { daysOld: 1, action: 'INVENTORY_CREATE', actorId: yashmeen.id, actorName: 'Yashmeen Khan', entityType: 'INVENTORY_TRANSACTION', meta: { type: 'IN', material: 'AAC Block 600x200x150', qty: 14000, project: 'Kharadi Tower A' }, ip: '157.32.9.77' },
    { daysOld: 0, action: 'LOGIN', actorId: riya.id, actorName: 'Riya Sharma', ip: '49.36.18.201' },
    { daysOld: 0, action: 'PLAN_STATUS_CHANGE', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'MATERIAL_PLAN', meta: { from: 'DRAFT', to: 'APPROVED', project: 'Whitefield Phase 2' }, ip: '103.21.58.9' },
    { daysOld: 0, action: 'LOGIN', actorId: aisha.id, actorName: 'Aisha Rao', ip: '152.58.102.4' },
    // Older history beyond the 7-day chart window
    { daysOld: 12, action: 'PM_ASSIGN', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'PROJECT', entityId: kharadiA.id, meta: { pm: 'Yashmeen Khan', project: 'Kharadi Tower A' }, ip: '103.21.58.9' },
    { daysOld: 15, action: 'INVOICE_STATUS_CHANGE', actorId: vinayak.id, actorName: 'Vinayak Patil', entityType: 'INVOICE', meta: { from: 'DRAFT', to: 'SENT', invoiceNo: inv1.invoiceNo }, ip: '182.70.44.12' },
    { daysOld: 18, action: 'MATERIAL_DEACTIVATE', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'MATERIAL', meta: { name: 'Asbestos Sheet' }, ip: '103.21.58.9' },
    { daysOld: 21, action: 'USER_DEACTIVATE', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'USER', meta: { email: 'rohit@forgeos.local', reason: 'Moved to procurement team' }, ip: '103.21.58.9' },
    { daysOld: 26, action: 'PROJECT_CREATE', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'PROJECT', entityId: kharadiB.id, meta: { name: 'Kharadi Tower B', budget: 52000000 }, ip: '103.21.58.9' },
    { daysOld: 33, action: 'LAND_CREATE', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'LAND', meta: { name: 'Hinjewadi Plot', location: 'Hinjewadi Phase 3, Pune' }, ip: '103.21.58.9' },
    { daysOld: 38, action: 'PAYMENT_CREATE', actorId: vinayak.id, actorName: 'Vinayak Patil', entityType: 'PAYMENT', meta: { invoiceNo: inv4.invoiceNo, amount: 18000000 / 100, method: 'BANK' }, ip: '182.70.44.12' },
    { daysOld: 47, action: 'PLAN_CREATE', actorId: riya.id, actorName: 'Riya Sharma', entityType: 'MATERIAL_PLAN', meta: { project: 'Whitefield Villas', material: 'Wall Putty', qty: 850 }, ip: '49.36.18.201' },
    { daysOld: 52, action: 'PROJECT_UPDATE', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'PROJECT', entityId: whitefield.id, meta: { budget: 24000000 }, ip: '103.21.58.9' },
    { daysOld: 60, action: 'INVOICE_STATUS_CHANGE', actorId: vinayak.id, actorName: 'Vinayak Patil', entityType: 'INVOICE', meta: { from: 'SENT', to: 'VOID', invoiceNo: `INV-${year}-006` }, ip: '182.70.44.12' },
    { daysOld: 88, action: 'PROJECT_STATUS_CHANGE', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'PROJECT', entityId: kharadiA.id, meta: { from: 'PLANNING', to: 'ACTIVE', project: 'Kharadi Tower A' }, ip: '103.21.58.9' },
    { daysOld: 150, action: 'PROJECT_CREATE', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'PROJECT', entityId: whitefield.id, meta: { name: 'Whitefield Villas', budget: 24000000 }, ip: '103.21.58.9' },
    { daysOld: 150, action: 'PROJECT_STATUS_CHANGE', actorId: admin.id, actorName: 'Vaibhav Todi', entityType: 'PROJECT', entityId: whitefield.id, meta: { from: 'PLANNING', to: 'ACTIVE', project: 'Whitefield Villas' }, ip: '103.21.58.9' },
  ]
  for (const spec of auditSpecs) {
    await db.auditLog.create({
      data: {
        actorId: spec.actorId, actorName: spec.actorName, action: spec.action,
        entityType: spec.entityType ?? null, entityId: spec.entityId ?? null,
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
