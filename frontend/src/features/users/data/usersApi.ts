import { apiGet, apiPost, apiRequest } from '../../../lib/api'

export type UserRole = 'ADMIN' | 'PM'

export interface ApiUser {
  id: number
  name: string
  email: string
  role: UserRole
  phone: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserInput {
  name: string
  email: string
  password: string
  role: UserRole
  phone?: string | null
}

export interface UserUpdateInput {
  name?: string
  email?: string
  password?: string
  role?: UserRole
  phone?: string | null
}

export interface UserListResult {
  users: ApiUser[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export async function fetchUsers(
  options: { page?: number; pageSize?: number; search?: string } = {},
  signal?: AbortSignal,
): Promise<UserListResult> {
  const query = new URLSearchParams({
    page: String(options.page ?? 1),
    pageSize: String(options.pageSize ?? 20),
  })
  if (options.search?.trim()) query.set('search', options.search.trim())
  const response = await apiGet<ApiUser[]>(`/users?${query}`, { signal })
  return {
    users: response.data,
    page: Number(response.meta?.page ?? options.page ?? 1),
    pageSize: Number(response.meta?.pageSize ?? options.pageSize ?? 20),
    total: Number(response.meta?.total ?? response.data.length),
    totalPages: Number(response.meta?.totalPages ?? 1),
  }
}

export async function createUser(input: UserInput): Promise<ApiUser> {
  return (await apiPost<ApiUser>('/users', input)).data
}

export async function updateUser(id: number, input: UserUpdateInput): Promise<ApiUser> {
  return (await apiRequest<ApiUser>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })).data
}

export async function updateUserStatus(id: number, isActive: boolean): Promise<ApiUser> {
  return (await apiRequest<ApiUser>(`/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  })).data
}
