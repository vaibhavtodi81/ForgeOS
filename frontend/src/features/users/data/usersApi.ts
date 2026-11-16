// Imports apiGet, apiPost, apiRequest from ../../../lib/api so this module can reuse that component, helper, or library.
import { apiGet, apiPost, apiRequest } from '../../../lib/api'

// Continues the component or data expression so its related values and behavior stay grouped together.
export type UserRole = 'ADMIN' | 'PM'

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface ApiUser {
  // Sets the id field so the surrounding object or component receives this setting.
  id: number
  // Sets the name field so the surrounding object or component receives this setting.
  name: string
  // Sets the email field so the surrounding object or component receives this setting.
  email: string
  // Sets the role field so the surrounding object or component receives this setting.
  role: UserRole
  // Sets the phone field so the surrounding object or component receives this setting.
  phone: string | null
  // Sets the isActive field so the surrounding object or component receives this setting.
  isActive: boolean
  // Sets the createdAt field so the surrounding object or component receives this setting.
  createdAt: string
  // Sets the updatedAt field so the surrounding object or component receives this setting.
  updatedAt: string
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface UserInput {
  // Sets the name field so the surrounding object or component receives this setting.
  name: string
  // Sets the email field so the surrounding object or component receives this setting.
  email: string
  // Sets the password field so the surrounding object or component receives this setting.
  password: string
  // Sets the role field so the surrounding object or component receives this setting.
  role: UserRole
  // Continues the component or data expression so its related values and behavior stay grouped together.
  phone?: string | null
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface UserUpdateInput {
  // Continues the component or data expression so its related values and behavior stay grouped together.
  name?: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  email?: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  password?: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  role?: UserRole
  // Continues the component or data expression so its related values and behavior stay grouped together.
  phone?: string | null
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface UserListResult {
  // Sets the users field so the surrounding object or component receives this setting.
  users: ApiUser[]
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

// Defines fetchUsers so this module can perform its named task when needed.
export async function fetchUsers(
  // Sets the options field so the surrounding object or component receives this setting.
  options: { page?: number; pageSize?: number; search?: string } = {},
  // Continues the component or data expression so its related values and behavior stay grouped together.
  signal?: AbortSignal,
// Continues the component or data expression so its related values and behavior stay grouped together.
): Promise<UserListResult> {
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
  const response = await apiGet<ApiUser[]>(`/users?${query}`, { signal })
  // Returns the result so the caller or React receives the value or interface this function provides.
  return {
    // Sets the users field so the surrounding object or component receives this setting.
    users: response.data,
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

// Defines createUser so this module can perform its named task when needed.
export async function createUser(input: UserInput): Promise<ApiUser> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiPost<ApiUser>('/users', input)).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines updateUser so this module can perform its named task when needed.
export async function updateUser(id: number, input: UserUpdateInput): Promise<ApiUser> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiRequest<ApiUser>(`/users/${id}`, {
    // Sets the method field so the surrounding object or component receives this setting.
    method: 'PATCH',
    // Sets the body field so the surrounding object or component receives this setting.
    body: JSON.stringify(input),
  // Continues the component or data expression so its related values and behavior stay grouped together.
  })).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines updateUserStatus so this module can perform its named task when needed.
export async function updateUserStatus(id: number, isActive: boolean): Promise<ApiUser> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiRequest<ApiUser>(`/users/${id}/status`, {
    // Sets the method field so the surrounding object or component receives this setting.
    method: 'PATCH',
    // Sets the body field so the surrounding object or component receives this setting.
    body: JSON.stringify({ isActive }),
  // Continues the component or data expression so its related values and behavior stay grouped together.
  })).data
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Provides API and data-access helpers for the users feature.
