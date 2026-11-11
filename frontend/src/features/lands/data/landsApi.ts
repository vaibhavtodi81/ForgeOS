import { apiGet, apiPost, apiRequest } from '../../../lib/api'

export type AreaUnit = 'SQFT' | 'SQYD' | 'SQM' | 'ACRE'

export interface ApiLand {
  id: number
  name: string
  addressLine: string | null
  city: string
  state: string
  pincode: string | null
  areaValue: number | string
  areaUnit: AreaUnit
  surveyNumber: string | null
  ownerName: string | null
  purchaseDate: string | null
  purchaseCost: number | string | null
  notes: string | null
  createdById: number
  createdAt: string
  updatedAt: string
}

export interface LandInput {
  name: string
  addressLine?: string | null
  city: string
  state: string
  pincode?: string | null
  areaValue: number
  areaUnit: AreaUnit
  surveyNumber?: string | null
  ownerName?: string | null
  purchaseDate?: string | null
  purchaseCost?: number | null
  notes?: string | null
}

export interface LandListResult {
  lands: ApiLand[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export async function fetchLands(
  options: { page?: number; pageSize?: number; search?: string } = {},
  signal?: AbortSignal,
): Promise<LandListResult> {
  const query = new URLSearchParams({
    page: String(options.page ?? 1),
    pageSize: String(options.pageSize ?? 20),
  })
  if (options.search?.trim()) query.set('search', options.search.trim())
  const response = await apiGet<ApiLand[]>(`/lands?${query}`, { signal })
  return {
    lands: response.data,
    page: Number(response.meta?.page ?? options.page ?? 1),
    pageSize: Number(response.meta?.pageSize ?? options.pageSize ?? 20),
    total: Number(response.meta?.total ?? response.data.length),
    totalPages: Number(response.meta?.totalPages ?? 1),
  }
}

export async function createLand(input: LandInput): Promise<ApiLand> {
  return (await apiPost<ApiLand>('/lands', input)).data
}

export async function updateLand(id: number, input: Partial<LandInput>): Promise<ApiLand> {
  return (await apiRequest<ApiLand>(`/lands/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })).data
}

export async function deleteLand(id: number): Promise<void> {
  await apiRequest<null>(`/lands/${id}`, { method: 'DELETE' })
}
