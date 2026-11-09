import type { Material, MaterialPlan, MaterialStatus } from '../types/material'

const MATERIALS_KEY = 'forgeos_materials'
const PLANS_KEY = 'forgeos_material_plans'
const PROGRESS_KEY = 'forgeos_material_progress'

export const initialMaterials: Material[] = [
  { id: 'MAT-001', name: 'OPC 53 Grade Cement', category: 'Cement', unit: 'Bag', referenceRate: 395, status: 'Active', createdAt: '2026-09-01T09:00:00Z' },
  { id: 'MAT-002', name: 'PPC Cement', category: 'Cement', unit: 'Bag', referenceRate: 370, status: 'Active', createdAt: '2026-09-01T09:05:00Z' },
  { id: 'MAT-003', name: 'TMT Rebar Fe 550D 12mm', category: 'Steel', unit: 'Tonne', referenceRate: 58500, status: 'Active', createdAt: '2026-09-01T09:10:00Z' },
  { id: 'MAT-004', name: 'TMT Rebar Fe 500D 8mm', category: 'Steel', unit: 'Tonne', referenceRate: 56000, status: 'Active', createdAt: '2026-09-01T09:15:00Z' },
  { id: 'MAT-005', name: 'M25 Ready Mix Concrete', category: 'Ready Mix Concrete', unit: 'Cum', referenceRate: 4650, status: 'Active', createdAt: '2026-09-01T09:20:00Z' },
  { id: 'MAT-006', name: 'River Sand', category: 'Aggregates & Sand', unit: 'Cum', referenceRate: 1450, status: 'Active', createdAt: '2026-09-01T09:25:00Z' },
  { id: 'MAT-007', name: 'Aggregate 20mm', category: 'Aggregates & Sand', unit: 'Cum', referenceRate: 1150, status: 'Active', createdAt: '2026-09-01T09:30:00Z' },
  { id: 'MAT-008', name: 'Red Clay Bricks', category: 'Bricks & Blocks', unit: 'Nos', referenceRate: 9, status: 'Active', createdAt: '2026-09-01T09:35:00Z' },
  { id: 'MAT-009', name: 'AAC Block 200mm', category: 'Bricks & Blocks', unit: 'Nos', referenceRate: 68, status: 'Active', createdAt: '2026-09-01T09:40:00Z' },
  { id: 'MAT-010', name: 'Binding Wire', category: 'Hardware', unit: 'Kg', referenceRate: 85, status: 'Active', createdAt: '2026-09-01T09:45:00Z' },
  { id: 'MAT-011', name: 'Shuttering Ply 12mm', category: 'Consumables', unit: 'Nos', referenceRate: 1150, status: 'Active', createdAt: '2026-09-01T09:50:00Z' },
  { id: 'MAT-012', name: 'Emulsion Paint', category: 'Paint & Finishing', unit: 'Litre', referenceRate: 310, status: 'Inactive', createdAt: '2026-09-01T09:55:00Z' },
]

export const initialPlans: MaterialPlan[] = [
  { id: 'PLN-001', projectId: '1', materialId: 'MAT-001', plannedQty: 8000, plannedRate: 395, lowStockThreshold: 800, wastageThreshold: 8 },
  { id: 'PLN-002', projectId: '1', materialId: 'MAT-003', plannedQty: 85, plannedRate: 58500, lowStockThreshold: 8 },
  { id: 'PLN-003', projectId: '1', materialId: 'MAT-004', plannedQty: 45, plannedRate: 56000, lowStockThreshold: 5 },
  { id: 'PLN-004', projectId: '1', materialId: 'MAT-005', plannedQty: 620, plannedRate: 4650, lowStockThreshold: 50 },
  { id: 'PLN-005', projectId: '1', materialId: 'MAT-006', plannedQty: 950, plannedRate: 1450 },
  { id: 'PLN-006', projectId: '1', materialId: 'MAT-007', plannedQty: 700, plannedRate: 1150 },
  { id: 'PLN-007', projectId: '1', materialId: 'MAT-008', plannedQty: 120000, plannedRate: 9 },
  { id: 'PLN-008', projectId: '1', materialId: 'MAT-010', plannedQty: 1200, plannedRate: 85, lowStockThreshold: 100 },
  { id: 'PLN-009', projectId: '1', materialId: 'MAT-011', plannedQty: 900, plannedRate: 1150 },
  { id: 'PLN-010', projectId: '2', materialId: 'MAT-001', plannedQty: 12000, plannedRate: 395, lowStockThreshold: 1000 },
  { id: 'PLN-011', projectId: '2', materialId: 'MAT-003', plannedQty: 150, plannedRate: 58500, lowStockThreshold: 12 },
  { id: 'PLN-012', projectId: '2', materialId: 'MAT-005', plannedQty: 1400, plannedRate: 4650, lowStockThreshold: 40 },
  { id: 'PLN-013', projectId: '2', materialId: 'MAT-006', plannedQty: 1800, plannedRate: 1450 },
  { id: 'PLN-014', projectId: '2', materialId: 'MAT-007', plannedQty: 1500, plannedRate: 1150, lowStockThreshold: 100 },
  { id: 'PLN-015', projectId: '2', materialId: 'MAT-009', plannedQty: 45000, plannedRate: 68 },
]

const initialProgress: Record<string, number> = { '1': 58, '2': 34 }

function readJson<T>(key: string, fallback: T, seed = true): T {
  try {
    const data = localStorage.getItem(key)
    if (!data) {
      if (seed) localStorage.setItem(key, JSON.stringify(fallback))
      return fallback
    }
    return JSON.parse(data) as T
  } catch {
    return fallback
  }
}

export function getStoredMaterials(): Material[] {
  return readJson<Material[]>(MATERIALS_KEY, initialMaterials)
}

export function saveStoredMaterials(materials: Material[]): void {
  try {
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials))
  } catch (error) {
    console.error('Failed to save materials in localStorage', error)
  }
}

export function addMaterial(
  data: Omit<Material, 'id' | 'status' | 'createdAt'>
): Material | null {
  const materials = getStoredMaterials()
  const nameTaken = materials.some(
    (m) => m.name.trim().toLowerCase() === data.name.trim().toLowerCase()
  )
  if (nameTaken) return null

  const material: Material = {
    ...data,
    name: data.name.trim(),
    id: `MAT-${Date.now().toString().slice(-6)}`,
    status: 'Active',
    createdAt: new Date().toISOString(),
  }
  saveStoredMaterials([material, ...materials])
  return material
}

export function updateMaterial(
  id: string,
  changes: Partial<Omit<Material, 'id' | 'createdAt'>>
): Material | null {
  const materials = getStoredMaterials()
  const index = materials.findIndex((m) => m.id === id)
  if (index === -1) return null

  if (changes.name) {
    const nameTaken = materials.some(
      (m) => m.id !== id && m.name.trim().toLowerCase() === changes.name!.trim().toLowerCase()
    )
    if (nameTaken) return null
  }

  const updated: Material = { ...materials[index], ...changes }
  materials[index] = updated
  saveStoredMaterials(materials)
  return updated
}

export function setMaterialStatus(id: string, status: MaterialStatus): Material | null {
  return updateMaterial(id, { status })
}

export function getStoredPlans(): MaterialPlan[] {
  return readJson<MaterialPlan[]>(PLANS_KEY, initialPlans)
}

export function saveStoredPlans(plans: MaterialPlan[]): void {
  try {
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans))
  } catch (error) {
    console.error('Failed to save material plans in localStorage', error)
  }
}

export function upsertPlan(
  projectId: string,
  materialId: string,
  data: Omit<MaterialPlan, 'id' | 'projectId' | 'materialId'>
): MaterialPlan {
  const plans = getStoredPlans()
  const index = plans.findIndex(
    (p) => p.projectId === projectId && p.materialId === materialId
  )

  if (index === -1) {
    const plan: MaterialPlan = {
      id: `PLN-${Date.now().toString().slice(-6)}`,
      projectId,
      materialId,
      ...data,
    }
    saveStoredPlans([...plans, plan])
    return plan
  }

  const updated: MaterialPlan = { ...plans[index], ...data }
  plans[index] = updated
  saveStoredPlans(plans)
  return updated
}

export function removePlan(planId: string): void {
  saveStoredPlans(getStoredPlans().filter((p) => p.id !== planId))
}

export function getProjectProgress(projectId: string): number {
  const progress = readJson<Record<string, number>>(PROGRESS_KEY, initialProgress)
  const value = progress[projectId]
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.min(100, Math.max(0, value))
}

export function setProjectProgress(projectId: string, percent: number): void {
  const progress = readJson<Record<string, number>>(PROGRESS_KEY, initialProgress)
  progress[projectId] = Math.min(100, Math.max(0, Math.round(percent)))
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  } catch (error) {
    console.error('Failed to save project progress in localStorage', error)
  }
}
