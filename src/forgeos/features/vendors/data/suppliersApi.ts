import { apiGet, apiPost, apiRequest } from '../../../lib/api'

export interface SupplierRow {
  id: string
  name: string
  phone: string
  email: string | null
  address: string | null
  supplyTxnCount: number
}

export interface SupplierInput {
  name: string
  phone: string
  email?: string | null
  address?: string | null
}

export async function fetchSuppliers(signal?: AbortSignal): Promise<SupplierRow[]> {
  return (await apiGet<{ items: SupplierRow[] }>('/suppliers', { signal })).data.items
}

export async function createSupplier(input: SupplierInput): Promise<SupplierRow> {
  return (await apiPost<{ supplier: SupplierRow }>('/suppliers', input)).data.supplier
}

export async function updateSupplier(id: string, input: Partial<SupplierInput>): Promise<SupplierRow> {
  return (await apiRequest<{ supplier: SupplierRow }>(`/suppliers/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })).data.supplier
}
