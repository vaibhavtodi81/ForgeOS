import { apiGet, apiPost, apiRequest } from '../../../lib/api'

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'VOID'
export type PaymentMethod = 'CASH' | 'BANK' | 'UPI' | 'CHEQUE'

export interface PaymentRow {
  id: string
  invoiceId: string
  amount: number
  method: PaymentMethod
  reference: string | null
  paidAt: string
}

export interface InvoiceRow {
  id: string
  invoiceNo: string
  projectId: string
  project: { code: string; name: string }
  amount: number
  gstPct: number
  totalWithGst: number
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  paidAmount: number
  balance: number
  payments: PaymentRow[]
}

export interface InvoiceSummary {
  invoiced: number
  collected: number
  receivables: number
  overdue: number
}

export interface InvoiceListResult {
  items: InvoiceRow[]
  summary: InvoiceSummary
}

export interface InvoiceInput {
  projectId: string
  amount: number
  gstPct: number
  issueDate: string
  dueDate: string
}

export interface PaymentInput {
  invoiceId: string
  amount: number
  method: PaymentMethod
  reference?: string | null
  paidAt: string
}

export async function fetchInvoices(
  filters: { status?: string; projectId?: string } = {},
  signal?: AbortSignal,
): Promise<InvoiceListResult> {
  const query = new URLSearchParams()
  if (filters.status) query.set('status', filters.status)
  if (filters.projectId) query.set('projectId', filters.projectId)
  const suffix = query.size ? `?${query.toString()}` : ''
  return (await apiGet<InvoiceListResult>(`/invoices${suffix}`, { signal })).data
}

export async function createInvoice(input: InvoiceInput): Promise<InvoiceRow> {
  return (await apiPost<{ invoice: InvoiceRow }>('/invoices', input)).data.invoice
}

export async function setInvoiceStatus(id: string, status: InvoiceStatus): Promise<InvoiceRow> {
  return (await apiRequest<{ invoice: InvoiceRow }>(`/invoices/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })).data.invoice
}

export async function fetchInvoicePayments(invoiceId: string, signal?: AbortSignal): Promise<PaymentRow[]> {
  return (await apiGet<{ items: PaymentRow[] }>(`/payments?invoiceId=${encodeURIComponent(invoiceId)}`, { signal })).data.items
}

export async function recordPayment(input: PaymentInput): Promise<{ payment: PaymentRow; invoice: InvoiceRow }> {
  return (await apiPost<{ payment: PaymentRow; invoice: InvoiceRow }>('/payments', input)).data
}
