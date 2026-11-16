// Imports apiGet, apiPost, apiRequest from ../../../lib/api so this module can reuse that component, helper, or library.
import { apiGet, apiPost, apiRequest } from '../../../lib/api'

// Continues the component or data expression so its related values and behavior stay grouped together.
export type AreaUnit = 'SQFT' | 'SQYD' | 'SQM' | 'ACRE'

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface ApiLand {
  // Sets the id field so the surrounding object or component receives this setting.
  id: number
  // Sets the name field so the surrounding object or component receives this setting.
  name: string
  // Sets the addressLine field so the surrounding object or component receives this setting.
  addressLine: string | null
  // Sets the city field so the surrounding object or component receives this setting.
  city: string
  // Sets the state field so the surrounding object or component receives this setting.
  state: string
  // Sets the pincode field so the surrounding object or component receives this setting.
  pincode: string | null
  // Sets the areaValue field so the surrounding object or component receives this setting.
  areaValue: number | string
  // Sets the areaUnit field so the surrounding object or component receives this setting.
  areaUnit: AreaUnit
  // Sets the surveyNumber field so the surrounding object or component receives this setting.
  surveyNumber: string | null
  // Sets the ownerName field so the surrounding object or component receives this setting.
  ownerName: string | null
  // Sets the purchaseDate field so the surrounding object or component receives this setting.
  purchaseDate: string | null
  // Sets the purchaseCost field so the surrounding object or component receives this setting.
  purchaseCost: number | string | null
  // Sets the notes field so the surrounding object or component receives this setting.
  notes: string | null
  // Sets the createdById field so the surrounding object or component receives this setting.
  createdById: number
  // Sets the createdAt field so the surrounding object or component receives this setting.
  createdAt: string
  // Sets the updatedAt field so the surrounding object or component receives this setting.
  updatedAt: string
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface LandInput {
  // Sets the name field so the surrounding object or component receives this setting.
  name: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  addressLine?: string | null
  // Sets the city field so the surrounding object or component receives this setting.
  city: string
  // Sets the state field so the surrounding object or component receives this setting.
  state: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  pincode?: string | null
  // Sets the areaValue field so the surrounding object or component receives this setting.
  areaValue: number
  // Sets the areaUnit field so the surrounding object or component receives this setting.
  areaUnit: AreaUnit
  // Continues the component or data expression so its related values and behavior stay grouped together.
  surveyNumber?: string | null
  // Continues the component or data expression so its related values and behavior stay grouped together.
  ownerName?: string | null
  // Continues the component or data expression so its related values and behavior stay grouped together.
  purchaseDate?: string | null
  // Continues the component or data expression so its related values and behavior stay grouped together.
  purchaseCost?: number | null
  // Continues the component or data expression so its related values and behavior stay grouped together.
  notes?: string | null
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface LandListResult {
  // Sets the lands field so the surrounding object or component receives this setting.
  lands: ApiLand[]
  // Sets the page field so the surrounding object or component receives this setting.
  page: number
  // Sets the pageSize field so the surrounding object or component receives this setting.
  pageSize: number
  // Sets the total field so the surrounding object or component receives this setting.
  total: number
  // Sets the totalPages field so the surrounding object or component receives this setting.
  totalPages: number
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines fetchLands so this module can perform its named task when needed.
export async function fetchLands(
  // Sets the options field so the surrounding object or component receives this setting.
  options: { page?: number; pageSize?: number; search?: string } = {},
  // Continues the component or data expression so its related values and behavior stay grouped together.
  signal?: AbortSignal,
// Continues the component or data expression so its related values and behavior stay grouped together.
): Promise<LandListResult> {
  // Stores the value in query so later lines can reuse this data or behavior for the current feature.
  const query = new URLSearchParams({
    // Sets the page field so the surrounding object or component receives this setting.
    page: String(options.page ?? 1),
    // Sets the pageSize field so the surrounding object or component receives this setting.
    pageSize: String(options.pageSize ?? 20),
  // Continues the component or data expression so its related values and behavior stay grouped together.
  })
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (options.search?.trim()) query.set('search', options.search.trim())
  // Stores the value in response so later lines can reuse this data or behavior for the current feature.
  const response = await apiGet<ApiLand[]>(`/lands?${query}`, { signal })
  // Returns the result so the caller or React receives the value or interface this function provides.
  return {
    // Sets the lands field so the surrounding object or component receives this setting.
    lands: response.data,
    // Sets the page field so the surrounding object or component receives this setting.
    page: Number(response.meta?.page ?? options.page ?? 1),
    // Sets the pageSize field so the surrounding object or component receives this setting.
    pageSize: Number(response.meta?.pageSize ?? options.pageSize ?? 20),
    // Sets the total field so the surrounding object or component receives this setting.
    total: Number(response.meta?.total ?? response.data.length),
    // Sets the totalPages field so the surrounding object or component receives this setting.
    totalPages: Number(response.meta?.totalPages ?? 1),
  // Closes the current block or object so the grouped statements or settings end here.
  }
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines createLand so this module can perform its named task when needed.
export async function createLand(input: LandInput): Promise<ApiLand> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiPost<ApiLand>('/lands', input)).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines updateLand so this module can perform its named task when needed.
export async function updateLand(id: number, input: Partial<LandInput>): Promise<ApiLand> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiRequest<ApiLand>(`/lands/${id}`, {
    // Sets the method field so the surrounding object or component receives this setting.
    method: 'PATCH',
    // Sets the body field so the surrounding object or component receives this setting.
    body: JSON.stringify(input),
  // Continues the component or data expression so its related values and behavior stay grouped together.
  })).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines deleteLand so this module can perform its named task when needed.
export async function deleteLand(id: number): Promise<void> {
  // Waits for the asynchronous result before using it, so later work receives completed data.
  await apiRequest<null>(`/lands/${id}`, { method: 'DELETE' })
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Provides API and data-access helpers for the lands feature.
