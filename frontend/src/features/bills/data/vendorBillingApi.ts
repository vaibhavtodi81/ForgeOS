import { apiGet, apiPost, apiRequest } from '../../../lib/api'

export type VendorType = 'MATERIAL_SUPPLIER' | 'LABOUR_CONTRACTOR' | 'MACHINERY_RENTAL' | 'SERVICE_PROVIDER' | 'OTHER'
export type BillCategory = 'MATERIAL' | 'LABOUR' | 'MACHINERY' | 'SERVICES' | 'OTHER'
export type BillStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PARTIALLY_PAID' | 'PAID'
export type PaymentMode = 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE' | 'OTHER'

export interface Vendor {
  id: number
  name: string
  vendorType: VendorType
  contactPerson: string | null
  phone: string | null
  email: string | null
  gstin: string | null
  address: string | null
  isActive: boolean
  projectAssignments?: Array<{ projectId: number; vendor?: Vendor; unassignedAt?: string | null; assignedAt?: string }>
}

export interface VendorInput {
  name: string
  vendorType: VendorType
  contactPerson?: string | null
  phone?: string | null
  email?: string | null
  gstin?: string | null
  address?: string | null
}

export interface VendorAssignment {
  id: number
  projectId: number
  vendorId: number
  assignedAt: string
  unassignedAt: string | null
  vendor: Vendor
}

export interface Payment {
  id: number
  billId: number
  amount: number | string
  paymentDate: string
  mode: PaymentMode
  referenceNumber: string | null
  remarks: string | null
  recordedById: number
  createdAt: string
  recordedBy?: { id: number; name: string }
}

export interface Bill {
  id: number
  projectId: number
  vendorId: number
  billNumber: string
  billDate: string
  dueDate: string | null
  category: BillCategory
  description: string | null
  baseAmount: number | string
  gstPercent: number | string
  gstAmount: number | string
  totalAmount: number | string
  status: BillStatus
  submittedById: number
  approvedById: number | null
  approvedAt: string | null
  rejectionReason: string | null
  paidAmount: number
  outstandingAmount: number
  vendor: Vendor
  project?: { id: number; code: string; name: string }
  submittedBy?: { id: number; name: string; email: string }
  approvedBy?: { id: number; name: string; email: string } | null
  payments?: Payment[]
}

export interface BillInput {
  projectId: number
  vendorId: number
  billNumber: string
  billDate: string
  dueDate?: string | null
  category: BillCategory
  description?: string | null
  baseAmount: number
  gstPercent: 0 | 5 | 12 | 18 | 28
}

export interface PaymentInput {
  amount: number
  paymentDate: string
  mode: PaymentMode
  referenceNumber?: string | null
  remarks?: string | null
}

export interface BillListResponse {
  bills: Bill[]
  meta: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    totals: { totalAmount: number; paidAmount: number; outstandingAmount: number }
  }
}

export interface VendorOutstanding {
  vendorId: number
  vendorName: string
  totalAmount: number
  paidAmount: number
  outstandingAmount: number
}

export interface ProjectExpense extends Bill {}

export interface PaymentHistoryEntry extends Payment {
  bill: { id: number; billNumber: string; projectId: number; vendor: { id: number; name: string } }
  recordedBy: { id: number; name: string }
}

function queryString(values: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  const result = search.toString()
  return result ? `?${result}` : ''
}

export async function listVendors(options: { search?: string; isActive?: boolean } = {}, signal?: AbortSignal): Promise<Vendor[]> {
  return (await apiGet<Vendor[]>(`/vendors${queryString(options)}`, { signal })).data
}

export async function createVendor(input: VendorInput): Promise<Vendor> {
  return (await apiPost<Vendor>('/vendors', input)).data
}

export async function updateVendor(id: number, input: Partial<VendorInput>): Promise<Vendor> {
  return (await apiRequest<Vendor>(`/vendors/${id}`, { method: 'PATCH', body: JSON.stringify(input) })).data
}

export async function deactivateVendor(id: number): Promise<Vendor> {
  return (await apiRequest<Vendor>(`/vendors/${id}`, { method: 'DELETE' })).data
}

export async function listProjectVendors(projectId: string, signal?: AbortSignal): Promise<VendorAssignment[]> {
  return (await apiGet<VendorAssignment[]>(`/projects/${encodeURIComponent(projectId)}/vendors`, { signal })).data
}

export async function assignVendor(projectId: string, vendorId: number): Promise<VendorAssignment> {
  return (await apiPost<VendorAssignment>(`/projects/${encodeURIComponent(projectId)}/vendors/${vendorId}`, {})).data
}

export async function unassignVendor(projectId: string, vendorId: number): Promise<void> {
  await apiRequest<null>(`/projects/${encodeURIComponent(projectId)}/vendors/${vendorId}`, { method: 'DELETE' })
}

export async function listBills(params: {
  projectId?: number
  vendorId?: number
  status?: string
  category?: BillCategory
  overdue?: boolean
  search?: string
  from?: string
  to?: string
  page?: number
  pageSize?: number
}, signal?: AbortSignal): Promise<BillListResponse> {
  const response = await apiGet<Bill[]>(`/bills${queryString({ page: 1, pageSize: 20, ...params })}`, { signal })
  return {
    bills: response.data,
    meta: {
      page: Number(response.meta?.page ?? 1),
      pageSize: Number(response.meta?.pageSize ?? 100),
      total: Number(response.meta?.total ?? response.data.length),
      totalPages: Number(response.meta?.totalPages ?? 1),
      totals: (response.meta?.totals as BillListResponse['meta']['totals'] | undefined) ?? { totalAmount: 0, paidAmount: 0, outstandingAmount: 0 },
    },
  }
}

export async function createBill(input: BillInput): Promise<Bill> {
  return (await apiPost<Bill>('/bills', input)).data
}

export async function updateBill(id: number, input: Partial<Omit<BillInput, 'projectId'>>): Promise<Bill> {
  return (await apiRequest<Bill>(`/bills/${id}`, { method: 'PATCH', body: JSON.stringify(input) })).data
}

export async function deleteBill(id: number): Promise<void> {
  await apiRequest<null>(`/bills/${id}`, { method: 'DELETE' })
}

export async function approveBill(id: number): Promise<Bill> {
  return (await apiPost<Bill>(`/bills/${id}/approve`, {})).data
}

export async function rejectBill(id: number, reason: string): Promise<Bill> {
  return (await apiPost<Bill>(`/bills/${id}/reject`, { reason })).data
}

export async function listBillPayments(id: number, from?: string, to?: string, signal?: AbortSignal): Promise<Payment[]> {
  return (await apiGet<Payment[]>(`/bills/${id}/payments${queryString({ from, to })}`, { signal })).data
}

export async function recordPayment(id: number, input: PaymentInput): Promise<{ payment: Payment; bill: Bill }> {
  return (await apiPost<{ payment: Payment; bill: Bill }>(`/bills/${id}/payments`, input)).data
}

export async function projectExpenses(projectId: string, from?: string, to?: string, signal?: AbortSignal): Promise<ProjectExpense[]> {
  return (await apiGet<ProjectExpense[]>(`/projects/${encodeURIComponent(projectId)}/expenses${queryString({ from, to })}`, { signal })).data
}

export async function vendorOutstanding(from?: string, to?: string, signal?: AbortSignal): Promise<VendorOutstanding[]> {
  return (await apiGet<VendorOutstanding[]>(`/reports/vendor-outstanding${queryString({ from, to })}`, { signal })).data
}

export async function paymentHistory(from?: string, to?: string, signal?: AbortSignal): Promise<PaymentHistoryEntry[]> {
  return (await apiGet<PaymentHistoryEntry[]>(`/reports/payment-history${queryString({ from, to })}`, { signal })).data
}
