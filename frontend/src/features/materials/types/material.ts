export type MaterialUnit = 'Bag' | 'Tonne' | 'Kg' | 'Cum' | 'Sqm' | 'Rmt' | 'Nos' | 'Litre' | 'Box'

export type MaterialStatus = 'Active' | 'Inactive'

export interface Material {
  id: string
  name: string
  category: string
  unit: MaterialUnit
  referenceRate?: number
  status: MaterialStatus
  createdAt: string
}

export interface MaterialPlan {
  id: string
  projectId: string
  materialId: string
  plannedQty: number
  plannedRate?: number
  lowStockThreshold?: number
  wastageThreshold?: number
}

export const MATERIAL_CATEGORIES = [
  'Cement',
  'Steel',
  'Ready Mix Concrete',
  'Aggregates & Sand',
  'Bricks & Blocks',
  'Electrical',
  'Plumbing',
  'Paint & Finishing',
  'Waterproofing',
  'Tiles & Stone',
  'Doors & Windows',
  'Hardware',
  'Consumables',
  'Other',
]

export const MATERIAL_UNITS: MaterialUnit[] = [
  'Bag',
  'Tonne',
  'Kg',
  'Cum',
  'Sqm',
  'Rmt',
  'Nos',
  'Litre',
  'Box',
]
