import { Prisma, type Role } from '@prisma/client'
import { prisma } from '../../utils/prisma.js'
import { projectAccess } from '../projects/projects.service.js'

type Actor = { id: number; role: Role }

const dec = (v: Prisma.Decimal | number | string | null | undefined) => Number(v ?? 0)

async function fetchProjectsWithRelations(where: Prisma.ProjectWhereInput) {
  return prisma.project.findMany({
    where,
    select: {
      id: true,
      code: true,
      name: true,
      status: true,
      totalBudget: true,
      wastageThresholdPct: true,
      assignedPmId: true,
      land: { select: { name: true, city: true } },
      assignedPm: { select: { id: true, name: true, email: true } },
      dailyLogs: { orderBy: { logDate: 'desc' }, take: 1, select: { progressPercent: true, logDate: true } },
      bills: {
        select: {
          id: true,
          billNumber: true,
          status: true,
          totalAmount: true,
          dueDate: true,
          vendor: { select: { name: true } },
          payments: { select: { amount: true } },
        },
      },
      materialPlans: {
        select: {
          materialId: true,
          plannedQuantity: true,
          plannedUnitRate: true,
          wastageThresholdPct: true,
          lowStockThreshold: true,
          openingQuantity: true,
          material: { select: { name: true, unit: true } },
        },
      },
      stockTransactions: {
        where: { isVoided: false },
        select: { materialId: true, txnType: true, quantity: true, outReason: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

interface ProjectFinancialSummary {
  projectId: number
  projectCode: string
  projectName: string
  status: string
  totalBudget: number
  committed: number
  paid: number
  outstanding: number
  progressPercent: number
  lastLogDate: string | null
  pendingBillCount: number
  overdueBillCount: number
  lowStockCount: number
  wastageAlertCount: number
  estimatedWastageLoss: number
}

function computeFinancials(project: Awaited<ReturnType<typeof fetchProjectsWithRelations>>[number]): ProjectFinancialSummary {
  const bills = project.bills
  const committedBills = bills.filter((b) => ['APPROVED', 'PARTIALLY_PAID', 'PAID'].includes(b.status))
  const committed = committedBills.reduce((s, b) => s + dec(b.totalAmount), 0)
  const paid = bills.reduce((s, b) => s + b.payments.reduce((ps, p) => ps + dec(p.amount), 0), 0)
  const outstanding = Math.max(committed - paid, 0)
  const pendingBillCount = bills.filter((b) => b.status === 'PENDING').length
  const now = new Date()
  const overdueBillCount = bills.filter(
    (b) => (b.status === 'APPROVED' || b.status === 'PARTIALLY_PAID') && b.dueDate && new Date(b.dueDate) < now,
  ).length
  const progressPercent = dec(project.dailyLogs[0]?.progressPercent)
  const lastLogDate = project.dailyLogs[0]?.logDate?.toISOString().slice(0, 10) ?? null
  const projectThreshold = dec(project.wastageThresholdPct)

  let lowStockCount = 0
  let wastageAlertCount = 0
  let estimatedWastageLoss = 0

  for (const plan of project.materialPlans) {
    const txns = project.stockTransactions.filter((t) => t.materialId === plan.materialId)
    const totalIn = txns.filter((t) => t.txnType === 'IN').reduce((s, t) => s + dec(t.quantity), 0)
    const totalOut = txns.filter((t) => t.txnType === 'OUT').reduce((s, t) => s + dec(t.quantity), 0)
    const adjIn = txns.filter((t) => t.txnType === 'ADJUSTMENT').reduce((s, t) => s + dec(t.quantity), 0)
    const available = dec(plan.openingQuantity) + totalIn - totalOut + adjIn
    if (plan.lowStockThreshold !== null && available <= dec(plan.lowStockThreshold)) {
      lowStockCount++
    }

    const consumed = txns.filter((t) => t.txnType === 'OUT').reduce((s, t) => s + dec(t.quantity), 0)
    const expected = dec(plan.plannedQuantity) * progressPercent / 100
    const overrun = Math.max(consumed - expected, 0)
    const overrunPct = expected > 0 ? (overrun / expected) * 100 : null
    const threshold = plan.wastageThresholdPct !== null ? dec(plan.wastageThresholdPct) : projectThreshold
    const rate = dec(plan.plannedUnitRate)

    if (overrunPct !== null && overrunPct > threshold) {
      wastageAlertCount++
      estimatedWastageLoss += overrun * rate
    }
  }

  return {
    projectId: project.id,
    projectCode: project.code,
    projectName: project.name,
    status: project.status,
    totalBudget: dec(project.totalBudget),
    committed,
    paid,
    outstanding,
    progressPercent,
    lastLogDate,
    pendingBillCount,
    overdueBillCount,
    lowStockCount,
    wastageAlertCount,
    estimatedWastageLoss,
  }
}

export async function getAdminDashboard(actor: Actor) {
  if (actor.role !== 'ADMIN') {
    const err = new Error('Forbidden') as Error & { status: number; code: string }
    err.status = 403
    err.code = 'FORBIDDEN'
    throw err
  }

  const projects = await fetchProjectsWithRelations({})
  const financials = projects.map(computeFinancials)

  const statusCounts = {
    PLANNING: projects.filter((p) => p.status === 'PLANNING').length,
    ACTIVE: projects.filter((p) => p.status === 'ACTIVE').length,
    ON_HOLD: projects.filter((p) => p.status === 'ON_HOLD').length,
    COMPLETED: projects.filter((p) => p.status === 'COMPLETED').length,
  }

  const totals = {
    projectCount: projects.length,
    statusCounts,
    totalBudget: financials.reduce((s, p) => s + p.totalBudget, 0),
    totalCommitted: financials.reduce((s, p) => s + p.committed, 0),
    totalPaid: financials.reduce((s, p) => s + p.paid, 0),
    totalOutstanding: financials.reduce((s, p) => s + p.outstanding, 0),
    totalPendingApprovals: financials.reduce((s, p) => s + p.pendingBillCount, 0),
    totalOverdueBills: financials.reduce((s, p) => s + p.overdueBillCount, 0),
    totalWastageAlerts: financials.reduce((s, p) => s + p.wastageAlertCount, 0),
    totalEstimatedLoss: financials.reduce((s, p) => s + p.estimatedWastageLoss, 0),
    totalLowStock: financials.reduce((s, p) => s + p.lowStockCount, 0),
  }

  const topWastageAlerts = financials
    .filter((p) => p.wastageAlertCount > 0)
    .sort((a, b) => b.estimatedWastageLoss - a.estimatedWastageLoss)
    .slice(0, 10)
    .map((p) => ({
      projectId: p.projectId,
      projectCode: p.projectCode,
      projectName: p.projectName,
      wastageAlertCount: p.wastageAlertCount,
      estimatedLoss: p.estimatedWastageLoss,
    }))

  const spendByProject = financials
    .map((p) => ({
      projectCode: p.projectCode,
      projectName: p.projectName,
      budget: p.totalBudget,
      committed: p.committed,
      paid: p.paid,
      outstanding: p.outstanding,
    }))
    .sort((a, b) => b.committed - a.committed)

  const pendingApprovals = financials
    .filter((p) => p.pendingBillCount > 0)
    .map((p) => ({
      projectId: p.projectId,
      projectCode: p.projectCode,
      projectName: p.projectName,
      pendingBillCount: p.pendingBillCount,
    }))

  const projectDetails = projects.map((p, i) => ({
    ...financials[i],
    land: p.land,
    assignedPm: p.assignedPm,
  }))

  return {
    summary: totals,
    projects: projectDetails,
    topWastageAlerts,
    spendByProject,
    pendingApprovals,
  }
}

export async function getPmDashboard(actor: Actor) {
  const where = projectAccess(actor)
  const projects = await fetchProjectsWithRelations(where)
  const financials = projects.map(computeFinancials)

  const ownPendingBills = await prisma.bill.findMany({
    where: { project: where, status: { in: ['PENDING', 'REJECTED'] } },
    select: {
      id: true,
      billNumber: true,
      totalAmount: true,
      status: true,
      billDate: true,
      vendor: { select: { name: true } },
    },
    orderBy: { billDate: 'desc' },
    take: 10,
  })

  const projectDetails = projects.map((p, i) => ({
    ...financials[i],
    land: p.land,
  }))

  return {
    summary: {
      projectCount: projects.length,
      totalBudget: financials.reduce((s, p) => s + p.totalBudget, 0),
      totalCommitted: financials.reduce((s, p) => s + p.committed, 0),
      totalOutstanding: financials.reduce((s, p) => s + p.outstanding, 0),
      pendingBillCount: financials.reduce((s, p) => s + p.pendingBillCount, 0),
      lowStockCount: financials.reduce((s, p) => s + p.lowStockCount, 0),
      wastageAlertCount: financials.reduce((s, p) => s + p.wastageAlertCount, 0),
    },
    projects: projectDetails,
    ownPendingBills,
  }
}

export async function getPortfolioWastage(actor: Actor) {
  const where = projectAccess(actor)
  const projects = await prisma.project.findMany({
    where,
    select: {
      id: true,
      code: true,
      name: true,
      wastageThresholdPct: true,
      dailyLogs: { orderBy: { logDate: 'desc' }, take: 1, select: { progressPercent: true } },
      materialPlans: {
        select: {
          materialId: true,
          plannedQuantity: true,
          plannedUnitRate: true,
          wastageThresholdPct: true,
          material: { select: { name: true, unit: true } },
        },
      },
      stockTransactions: {
        where: { isVoided: false },
        select: { materialId: true, txnType: true, quantity: true, outReason: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const alerts: Array<{
    projectId: number
    projectCode: string
    projectName: string
    materialName: string
    unit: string
    plannedQuantity: number
    consumedQuantity: number
    expectedQuantity: number
    overrunQuantity: number
    overrunPercent: number | null
    estimatedLoss: number
    thresholdPercent: number
  }> = []

  for (const project of projects) {
    const progressPercent = dec(project.dailyLogs[0]?.progressPercent)
    const projectThreshold = dec(project.wastageThresholdPct)
    for (const plan of project.materialPlans) {
      const txns = project.stockTransactions.filter((t) => t.materialId === plan.materialId)
      const consumed = txns
        .filter((t) => t.txnType === 'OUT')
        .reduce((s, t) => s + dec(t.quantity), 0)
      const expected = dec(plan.plannedQuantity) * progressPercent / 100
      const overrun = Math.max(consumed - expected, 0)
      const overrunPct = expected > 0 ? (overrun / expected) * 100 : null
      const threshold = plan.wastageThresholdPct !== null ? dec(plan.wastageThresholdPct) : projectThreshold
      const rate = dec(plan.plannedUnitRate)

      if (overrunPct !== null && overrunPct > threshold) {
        alerts.push({
          projectId: project.id,
          projectCode: project.code,
          projectName: project.name,
          materialName: plan.material.name,
          unit: plan.material.unit,
          plannedQuantity: dec(plan.plannedQuantity),
          consumedQuantity: consumed,
          expectedQuantity: expected,
          overrunQuantity: overrun,
          overrunPercent: overrunPct,
          estimatedLoss: overrun * rate,
          thresholdPercent: threshold,
        })
      }
    }
  }

  alerts.sort((a, b) => b.estimatedLoss - a.estimatedLoss || (b.overrunPercent ?? 0) - (a.overrunPercent ?? 0))

  return {
    totalAlerts: alerts.length,
    totalEstimatedLoss: alerts.reduce((s, a) => s + a.estimatedLoss, 0),
    alerts: alerts.slice(0, 50),
  }
}
