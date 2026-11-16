// Imports apiGet, apiPost, apiRequest from ../../../lib/api so this module can reuse that component, helper, or library.
import { apiGet, apiPost, apiRequest } from '../../../lib/api'

// Continues the component or data expression so its related values and behavior stay grouped together.
export type VendorType = 'MATERIAL_SUPPLIER' | 'LABOUR_CONTRACTOR' | 'MACHINERY_RENTAL' | 'SERVICE_PROVIDER' | 'OTHER'
// Continues the component or data expression so its related values and behavior stay grouped together.
export type BillCategory = 'MATERIAL' | 'LABOUR' | 'MACHINERY' | 'SERVICES' | 'OTHER'
// Continues the component or data expression so its related values and behavior stay grouped together.
export type BillStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PARTIALLY_PAID' | 'PAID'
// Continues the component or data expression so its related values and behavior stay grouped together.
export type PaymentMode = 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE' | 'OTHER'

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface Vendor {
  // Sets the id field so the surrounding object or component receives this setting.
  id: number
  // Sets the name field so the surrounding object or component receives this setting.
  name: string
  // Sets the vendorType field so the surrounding object or component receives this setting.
  vendorType: VendorType
  // Sets the contactPerson field so the surrounding object or component receives this setting.
  contactPerson: string | null
  // Sets the phone field so the surrounding object or component receives this setting.
  phone: string | null
  // Sets the email field so the surrounding object or component receives this setting.
  email: string | null
  // Sets the gstin field so the surrounding object or component receives this setting.
  gstin: string | null
  // Sets the address field so the surrounding object or component receives this setting.
  address: string | null
  // Sets the isActive field so the surrounding object or component receives this setting.
  isActive: boolean
  // Continues the component or data expression so its related values and behavior stay grouped together.
  projectAssignments?: Array<{ projectId: number; vendor?: Vendor; unassignedAt?: string | null; assignedAt?: string }>
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface VendorInput {
  // Sets the name field so the surrounding object or component receives this setting.
  name: string
  // Sets the vendorType field so the surrounding object or component receives this setting.
  vendorType: VendorType
  // Continues the component or data expression so its related values and behavior stay grouped together.
  contactPerson?: string | null
  // Continues the component or data expression so its related values and behavior stay grouped together.
  phone?: string | null
  // Continues the component or data expression so its related values and behavior stay grouped together.
  email?: string | null
  // Continues the component or data expression so its related values and behavior stay grouped together.
  gstin?: string | null
  // Continues the component or data expression so its related values and behavior stay grouped together.
  address?: string | null
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface VendorAssignment {
  // Sets the id field so the surrounding object or component receives this setting.
  id: number
  // Sets the projectId field so the surrounding object or component receives this setting.
  projectId: number
  // Sets the vendorId field so the surrounding object or component receives this setting.
  vendorId: number
  // Sets the assignedAt field so the surrounding object or component receives this setting.
  assignedAt: string
  // Sets the unassignedAt field so the surrounding object or component receives this setting.
  unassignedAt: string | null
  // Sets the vendor field so the surrounding object or component receives this setting.
  vendor: Vendor
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface Payment {
  // Sets the id field so the surrounding object or component receives this setting.
  id: number
  // Sets the billId field so the surrounding object or component receives this setting.
  billId: number
  // Sets the amount field so the surrounding object or component receives this setting.
  amount: number | string
  // Sets the paymentDate field so the surrounding object or component receives this setting.
  paymentDate: string
  // Sets the mode field so the surrounding object or component receives this setting.
  mode: PaymentMode
  // Sets the referenceNumber field so the surrounding object or component receives this setting.
  referenceNumber: string | null
  // Sets the remarks field so the surrounding object or component receives this setting.
  remarks: string | null
  // Sets the recordedById field so the surrounding object or component receives this setting.
  recordedById: number
  // Sets the createdAt field so the surrounding object or component receives this setting.
  createdAt: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  recordedBy?: { id: number; name: string }
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface Bill {
  // Sets the id field so the surrounding object or component receives this setting.
  id: number
  // Sets the projectId field so the surrounding object or component receives this setting.
  projectId: number
  // Sets the vendorId field so the surrounding object or component receives this setting.
  vendorId: number
  // Sets the billNumber field so the surrounding object or component receives this setting.
  billNumber: string
  // Sets the billDate field so the surrounding object or component receives this setting.
  billDate: string
  // Sets the dueDate field so the surrounding object or component receives this setting.
  dueDate: string | null
  // Sets the category field so the surrounding object or component receives this setting.
  category: BillCategory
  // Sets the description field so the surrounding object or component receives this setting.
  description: string | null
  // Sets the baseAmount field so the surrounding object or component receives this setting.
  baseAmount: number | string
  // Sets the gstPercent field so the surrounding object or component receives this setting.
  gstPercent: number | string
  // Sets the gstAmount field so the surrounding object or component receives this setting.
  gstAmount: number | string
  // Sets the totalAmount field so the surrounding object or component receives this setting.
  totalAmount: number | string
  // Sets the status field so the surrounding object or component receives this setting.
  status: BillStatus
  // Sets the submittedById field so the surrounding object or component receives this setting.
  submittedById: number
  // Sets the approvedById field so the surrounding object or component receives this setting.
  approvedById: number | null
  // Sets the approvedAt field so the surrounding object or component receives this setting.
  approvedAt: string | null
  // Sets the rejectionReason field so the surrounding object or component receives this setting.
  rejectionReason: string | null
  // Sets the paidAmount field so the surrounding object or component receives this setting.
  paidAmount: number
  // Sets the outstandingAmount field so the surrounding object or component receives this setting.
  outstandingAmount: number
  // Sets the vendor field so the surrounding object or component receives this setting.
  vendor: Vendor
  // Continues the component or data expression so its related values and behavior stay grouped together.
  project?: { id: number; code: string; name: string }
  // Continues the component or data expression so its related values and behavior stay grouped together.
  submittedBy?: { id: number; name: string; email: string }
  // Continues the component or data expression so its related values and behavior stay grouped together.
  approvedBy?: { id: number; name: string; email: string } | null
  // Continues the component or data expression so its related values and behavior stay grouped together.
  payments?: Payment[]
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface BillInput {
  // Sets the projectId field so the surrounding object or component receives this setting.
  projectId: number
  // Sets the vendorId field so the surrounding object or component receives this setting.
  vendorId: number
  // Sets the billNumber field so the surrounding object or component receives this setting.
  billNumber: string
  // Sets the billDate field so the surrounding object or component receives this setting.
  billDate: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  dueDate?: string | null
  // Sets the category field so the surrounding object or component receives this setting.
  category: BillCategory
  // Continues the component or data expression so its related values and behavior stay grouped together.
  description?: string | null
  // Sets the baseAmount field so the surrounding object or component receives this setting.
  baseAmount: number
  // Sets the gstPercent field so the surrounding object or component receives this setting.
  gstPercent: 0 | 5 | 12 | 18 | 28
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface PaymentInput {
  // Sets the amount field so the surrounding object or component receives this setting.
  amount: number
  // Sets the paymentDate field so the surrounding object or component receives this setting.
  paymentDate: string
  // Sets the mode field so the surrounding object or component receives this setting.
  mode: PaymentMode
  // Continues the component or data expression so its related values and behavior stay grouped together.
  referenceNumber?: string | null
  // Continues the component or data expression so its related values and behavior stay grouped together.
  remarks?: string | null
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface BillListResponse {
  // Sets the bills field so the surrounding object or component receives this setting.
  bills: Bill[]
  // Sets the meta field so the surrounding object or component receives this setting.
  meta: {
    // Sets the page field so the surrounding object or component receives this setting.
    page: number
    // Sets the pageSize field so the surrounding object or component receives this setting.
    pageSize: number
    // Sets the total field so the surrounding object or component receives this setting.
    total: number
    // Sets the totalPages field so the surrounding object or component receives this setting.
    totalPages: number
    // Sets the totals field so the surrounding object or component receives this setting.
    totals: { totalAmount: number; paidAmount: number; outstandingAmount: number }
  // Closes the current block or object so the grouped statements or settings end here.
  }
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface VendorOutstanding {
  // Sets the vendorId field so the surrounding object or component receives this setting.
  vendorId: number
  // Sets the vendorName field so the surrounding object or component receives this setting.
  vendorName: string
  // Sets the totalAmount field so the surrounding object or component receives this setting.
  totalAmount: number
  // Sets the paidAmount field so the surrounding object or component receives this setting.
  paidAmount: number
  // Sets the outstandingAmount field so the surrounding object or component receives this setting.
  outstandingAmount: number
// Closes the current block or object so the grouped statements or settings end here.
}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface ProjectExpense extends Bill {}

// Continues the component or data expression so its related values and behavior stay grouped together.
export interface PaymentHistoryEntry extends Payment {
  // Sets the bill field so the surrounding object or component receives this setting.
  bill: { id: number; billNumber: string; projectId: number; vendor: { id: number; name: string } }
  // Sets the recordedBy field so the surrounding object or component receives this setting.
  recordedBy: { id: number; name: string }
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines queryString so this module can perform its named task when needed.
function queryString(values: Record<string, string | number | boolean | undefined>) {
  // Stores the value in search so later lines can reuse this data or behavior for the current feature.
  const search = new URLSearchParams()
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  for (const [key, value] of Object.entries(values)) {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (value !== undefined && value !== '') search.set(key, String(value))
  // Closes the current block or object so the grouped statements or settings end here.
  }
  // Stores the value in result so later lines can reuse this data or behavior for the current feature.
  const result = search.toString()
  // Returns the result so the caller or React receives the value or interface this function provides.
  return result ? `?${result}` : ''
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines listVendors so this module can perform its named task when needed.
export async function listVendors(options: { search?: string; isActive?: boolean } = {}, signal?: AbortSignal): Promise<Vendor[]> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiGet<Vendor[]>(`/vendors${queryString(options)}`, { signal })).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines createVendor so this module can perform its named task when needed.
export async function createVendor(input: VendorInput): Promise<Vendor> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiPost<Vendor>('/vendors', input)).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines updateVendor so this module can perform its named task when needed.
export async function updateVendor(id: number, input: Partial<VendorInput>): Promise<Vendor> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiRequest<Vendor>(`/vendors/${id}`, { method: 'PATCH', body: JSON.stringify(input) })).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines deactivateVendor so this module can perform its named task when needed.
export async function deactivateVendor(id: number): Promise<Vendor> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiRequest<Vendor>(`/vendors/${id}`, { method: 'DELETE' })).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines listProjectVendors so this module can perform its named task when needed.
export async function listProjectVendors(projectId: string, signal?: AbortSignal): Promise<VendorAssignment[]> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiGet<VendorAssignment[]>(`/projects/${encodeURIComponent(projectId)}/vendors`, { signal })).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines assignVendor so this module can perform its named task when needed.
export async function assignVendor(projectId: string, vendorId: number): Promise<VendorAssignment> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiPost<VendorAssignment>(`/projects/${encodeURIComponent(projectId)}/vendors/${vendorId}`, {})).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines unassignVendor so this module can perform its named task when needed.
export async function unassignVendor(projectId: string, vendorId: number): Promise<void> {
  // Waits for the asynchronous result before using it, so later work receives completed data.
  await apiRequest<null>(`/projects/${encodeURIComponent(projectId)}/vendors/${vendorId}`, { method: 'DELETE' })
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines listBills so this module can perform its named task when needed.
export async function listBills(params: {
  // Continues the component or data expression so its related values and behavior stay grouped together.
  projectId?: number
  // Continues the component or data expression so its related values and behavior stay grouped together.
  vendorId?: number
  // Continues the component or data expression so its related values and behavior stay grouped together.
  status?: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  category?: BillCategory
  // Continues the component or data expression so its related values and behavior stay grouped together.
  overdue?: boolean
  // Continues the component or data expression so its related values and behavior stay grouped together.
  search?: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  from?: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  to?: string
  // Continues the component or data expression so its related values and behavior stay grouped together.
  page?: number
  // Continues the component or data expression so its related values and behavior stay grouped together.
  pageSize?: number
// Continues the component or data expression so its related values and behavior stay grouped together.
}, signal?: AbortSignal): Promise<BillListResponse> {
  // Stores the value in response so later lines can reuse this data or behavior for the current feature.
  const response = await apiGet<Bill[]>(`/bills${queryString({ page: 1, pageSize: 20, ...params })}`, { signal })
  // Returns the result so the caller or React receives the value or interface this function provides.
  return {
    // Sets the bills field so the surrounding object or component receives this setting.
    bills: response.data,
    // Sets the meta field so the surrounding object or component receives this setting.
    meta: {
      // Sets the page field so the surrounding object or component receives this setting.
      page: Number(response.meta?.page ?? 1),
      // Sets the pageSize field so the surrounding object or component receives this setting.
      pageSize: Number(response.meta?.pageSize ?? 100),
      // Sets the total field so the surrounding object or component receives this setting.
      total: Number(response.meta?.total ?? response.data.length),
      // Sets the totalPages field so the surrounding object or component receives this setting.
      totalPages: Number(response.meta?.totalPages ?? 1),
      // Sets the totals field so the surrounding object or component receives this setting.
      totals: (response.meta?.totals as BillListResponse['meta']['totals'] | undefined) ?? { totalAmount: 0, paidAmount: 0, outstandingAmount: 0 },
    // Closes the current block or object so the grouped statements or settings end here.
    },
  // Closes the current block or object so the grouped statements or settings end here.
  }
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines createBill so this module can perform its named task when needed.
export async function createBill(input: BillInput): Promise<Bill> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiPost<Bill>('/bills', input)).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines updateBill so this module can perform its named task when needed.
export async function updateBill(id: number, input: Partial<Omit<BillInput, 'projectId'>>): Promise<Bill> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiRequest<Bill>(`/bills/${id}`, { method: 'PATCH', body: JSON.stringify(input) })).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines deleteBill so this module can perform its named task when needed.
export async function deleteBill(id: number): Promise<void> {
  // Waits for the asynchronous result before using it, so later work receives completed data.
  await apiRequest<null>(`/bills/${id}`, { method: 'DELETE' })
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines approveBill so this module can perform its named task when needed.
export async function approveBill(id: number): Promise<Bill> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiPost<Bill>(`/bills/${id}/approve`, {})).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines rejectBill so this module can perform its named task when needed.
export async function rejectBill(id: number, reason: string): Promise<Bill> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiPost<Bill>(`/bills/${id}/reject`, { reason })).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines listBillPayments so this module can perform its named task when needed.
export async function listBillPayments(id: number, from?: string, to?: string, signal?: AbortSignal): Promise<Payment[]> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiGet<Payment[]>(`/bills/${id}/payments${queryString({ from, to })}`, { signal })).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines recordPayment so this module can perform its named task when needed.
export async function recordPayment(id: number, input: PaymentInput): Promise<{ payment: Payment; bill: Bill }> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiPost<{ payment: Payment; bill: Bill }>(`/bills/${id}/payments`, input)).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines projectExpenses so this module can perform its named task when needed.
export async function projectExpenses(projectId: string, from?: string, to?: string, signal?: AbortSignal): Promise<ProjectExpense[]> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiGet<ProjectExpense[]>(`/projects/${encodeURIComponent(projectId)}/expenses${queryString({ from, to })}`, { signal })).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines vendorOutstanding so this module can perform its named task when needed.
export async function vendorOutstanding(from?: string, to?: string, signal?: AbortSignal): Promise<VendorOutstanding[]> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiGet<VendorOutstanding[]>(`/reports/vendor-outstanding${queryString({ from, to })}`, { signal })).data
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines paymentHistory so this module can perform its named task when needed.
export async function paymentHistory(from?: string, to?: string, signal?: AbortSignal): Promise<PaymentHistoryEntry[]> {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return (await apiGet<PaymentHistoryEntry[]>(`/reports/payment-history${queryString({ from, to })}`, { signal })).data
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Provides API and data-access helpers for the bills feature.
