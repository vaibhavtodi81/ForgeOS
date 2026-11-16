// Imports useCallback, useEffect, useMemo, useState from react so this module can reuse that component, helper, or library.
import { useCallback, useEffect, useMemo, useState } from 'react'
// Imports type  FormEvent, ReactNode from react so this module can reuse that component, helper, or library.
import type { FormEvent, ReactNode } from 'react'
// Imports AppShell from ../../app-shell/components/AppShell so this module can reuse that component, helper, or library.
import { AppShell } from '../../app-shell/components/AppShell'
// Imports useAuth from ../../authentication/auth/useAuth so this module can reuse that component, helper, or library.
import { useAuth } from '../../authentication/auth/useAuth'
// Imports useProjects from ../../projects/useProjects so this module can reuse that component, helper, or library.
import { useProjects } from '../../projects/useProjects'
// Imports ApiError from ../../../lib/api so this module can reuse that component, helper, or library.
import { ApiError } from '../../../lib/api'
// Continues the component or data expression so its related values and behavior stay grouped together.
import {
  // Continues the component or data expression so its related values and behavior stay grouped together.
  approveBill,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  assignVendor,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  createBill,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  createVendor,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  deleteBill,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  listBillPayments,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  listBills,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  listVendors,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  paymentHistory,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  projectExpenses,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  recordPayment,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  rejectBill,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  updateBill,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  vendorOutstanding,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type Bill,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type BillCategory,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type BillInput,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type Payment,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type PaymentHistoryEntry,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type PaymentMode,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type Vendor,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type VendorOutstanding,
// Continues the component or data expression so its related values and behavior stay grouped together.
} from '../data/vendorBillingApi'

// Continues the component or data expression so its related values and behavior stay grouped together.
type View = 'bills' | 'expenses' | 'outstanding' | 'payments'
// Stores the value in categories so later lines can reuse this data or behavior for the current feature.
const categories: BillCategory[] = ['MATERIAL', 'LABOUR', 'MACHINERY', 'SERVICES', 'OTHER']
// Stores the value in modes so later lines can reuse this data or behavior for the current feature.
const modes: PaymentMode[] = ['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'OTHER']
// Stores the value in statuses so later lines can reuse this data or behavior for the current feature.
const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'PARTIALLY_PAID', 'PAID']
// Stores the value in today so later lines can reuse this data or behavior for the current feature.
const today = new Date().toISOString().slice(0, 10)

// Defines messageOf so this module can perform its named task when needed.
function messageOf(error: unknown) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Something went wrong. Please try again.'
// Closes the current block or object so the grouped statements or settings end here.
}
// Defines amount so this module can perform its named task when needed.
function amount(value: number | string | null | undefined) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value ?? 0))
// Closes the current block or object so the grouped statements or settings end here.
}
// Defines dateLabel so this module can perform its named task when needed.
function dateLabel(value?: string | null) {
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (!value) return '—'
  // Stores the value in date so later lines can reuse this data or behavior for the current feature.
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  // Returns the result so the caller or React receives the value or interface this function provides.
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines BillsPage so this module can perform its named task when needed.
export function BillsPage({ openUpload = false }: { openUpload?: boolean }) {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { user } = useAuth()
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { projects, selectedProject, selectedProjectId, selectProject } = useProjects()
  // Stores the value in isAdmin so later lines can reuse this data or behavior for the current feature.
  const isAdmin = user?.role === 'ADMIN'
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [view, setView] = useState<View>('bills')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [bills, setBills] = useState<Bill[]>([])
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [billPage, setBillPage] = useState(1)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [totalBillPages, setTotalBillPages] = useState(1)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [vendors, setVendors] = useState<Vendor[]>([])
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [expenses, setExpenses] = useState<Bill[]>([])
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [outstanding, setOutstanding] = useState<VendorOutstanding[]>([])
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [history, setHistory] = useState<PaymentHistoryEntry[]>([])
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [billPayments, setBillPayments] = useState<Payment[]>([])
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [rejecting, setRejecting] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [loading, setLoading] = useState(true)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [saving, setSaving] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [error, setError] = useState<string | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [success, setSuccess] = useState<string | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [statusFilter, setStatusFilter] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [categoryFilter, setCategoryFilter] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [search, setSearch] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [from, setFrom] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [to, setTo] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [overdue, setOverdue] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [formOpen, setFormOpen] = useState(openUpload)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [editingId, setEditingId] = useState<number | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [rejectionReason, setRejectionReason] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [paymentTarget, setPaymentTarget] = useState<Bill | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [paymentAmount, setPaymentAmount] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [paymentDate, setPaymentDate] = useState(today)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('BANK_TRANSFER')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [paymentReference, setPaymentReference] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [paymentRemarks, setPaymentRemarks] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [vendorFormOpen, setVendorFormOpen] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [newVendorName, setNewVendorName] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [form, setForm] = useState<BillInput>({
    // Sets the projectId field so the surrounding object or component receives this setting.
    projectId: Number(selectedProjectId) || 0,
    // Sets the vendorId field so the surrounding object or component receives this setting.
    vendorId: 0,
    // Sets the billNumber field so the surrounding object or component receives this setting.
    billNumber: '',
    // Sets the billDate field so the surrounding object or component receives this setting.
    billDate: today,
    // Sets the dueDate field so the surrounding object or component receives this setting.
    dueDate: '',
    // Sets the category field so the surrounding object or component receives this setting.
    category: 'MATERIAL',
    // Sets the description field so the surrounding object or component receives this setting.
    description: '',
    // Sets the baseAmount field so the surrounding object or component receives this setting.
    baseAmount: 0,
    // Sets the gstPercent field so the surrounding object or component receives this setting.
    gstPercent: 18,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  })

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (selectedProjectId) setForm((current) => ({ ...current, projectId: Number(selectedProjectId) }))
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [selectedProjectId])

  // Stores the value in loadVendors so later lines can reuse this data or behavior for the current feature.
  const loadVendors = useCallback(async () => {
    // Starts an error-handling region so failures can be caught and handled safely.
    try {
      // Waits for the asynchronous result before using it, so later work receives completed data.
      setVendors(await listVendors({ isActive: true }))
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (loadError) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setError(messageOf(loadError))
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [])

  // Stores the value in load so later lines can reuse this data or behavior for the current feature.
  const load = useCallback(async () => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setLoading(true)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setError(null)
    // Starts an error-handling region so failures can be caught and handled safely.
    try {
      // Stores the value in filters so later lines can reuse this data or behavior for the current feature.
      const filters = {
        // Sets the projectId field so the surrounding object or component receives this setting.
        projectId: selectedProjectId ? Number(selectedProjectId) : undefined,
        // Sets the status field so the surrounding object or component receives this setting.
        status: statusFilter || undefined,
        // Sets the category field so the surrounding object or component receives this setting.
        category: (categoryFilter || undefined) as BillCategory | undefined,
        // Sets the search field so the surrounding object or component receives this setting.
        search: search.trim() || undefined,
        // Sets the overdue field so the surrounding object or component receives this setting.
        overdue: overdue || undefined,
        // Sets the from field so the surrounding object or component receives this setting.
        from: from || undefined,
        // Sets the to field so the surrounding object or component receives this setting.
        to: to || undefined,
        // Sets the page field so the surrounding object or component receives this setting.
        page: billPage,
        // Sets the pageSize field so the surrounding object or component receives this setting.
        pageSize: 20,
      // Closes the current block or object so the grouped statements or settings end here.
      }
      // Stores the value in requests so later lines can reuse this data or behavior for the current feature.
      const requests = await Promise.all([
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        listBills(filters),
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        selectedProjectId ? projectExpenses(selectedProjectId, from || undefined, to || undefined) : Promise.resolve([]),
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        vendorOutstanding(from || undefined, to || undefined),
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        paymentHistory(from || undefined, to || undefined),
      // Continues the component or data expression so its related values and behavior stay grouped together.
      ])
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setBills(requests[0].bills)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setTotalBillPages(requests[0].meta.totalPages)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setExpenses(requests[1])
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setOutstanding(requests[2])
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setHistory(requests[3])
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (loadError) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setError(messageOf(loadError))
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } finally {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setLoading(false)
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [selectedProjectId, statusFilter, categoryFilter, search, overdue, from, to, billPage])

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => { setBillPage(1) }, [selectedProjectId, statusFilter, categoryFilter, search, overdue, from, to])

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => { void load() }, [load])
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => { void loadVendors() }, [loadVendors])

  // Caches totals so its calculation is repeated only when its inputs change.
  // Caches totals so its calculation is repeated only when its inputs change.
  const totals = useMemo(() => bills.reduce((sum, bill) => ({
    // Sets the total field so the surrounding object or component receives this setting.
    total: sum.total + Number(bill.totalAmount),
    // Sets the paid field so the surrounding object or component receives this setting.
    paid: sum.paid + Number(bill.paidAmount ?? 0),
    // Sets the outstanding field so the surrounding object or component receives this setting.
    outstanding: sum.outstanding + Number(bill.outstandingAmount ?? 0),
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }), { total: 0, paid: 0, outstanding: 0 }), [bills])
  // Caches expenseTotals so its calculation is repeated only when its inputs change.
  // Caches expenseTotals so its calculation is repeated only when its inputs change.
  const expenseTotals = useMemo(() => expenses.reduce((sum, bill) => ({
    // Sets the total field so the surrounding object or component receives this setting.
    total: sum.total + Number(bill.totalAmount),
    // Sets the paid field so the surrounding object or component receives this setting.
    paid: sum.paid + Number(bill.paidAmount ?? 0),
    // Sets the outstanding field so the surrounding object or component receives this setting.
    outstanding: sum.outstanding + Number(bill.outstandingAmount ?? 0),
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }), { total: 0, paid: 0, outstanding: 0 }), [expenses])

  // Stores the value in resetBillForm so later lines can reuse this data or behavior for the current feature.
  const resetBillForm = () => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setForm({ projectId: Number(selectedProjectId) || 0, vendorId: 0, billNumber: '', billDate: today, dueDate: '', category: 'MATERIAL', description: '', baseAmount: 0, gstPercent: 18 })
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setEditingId(null)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setFormOpen(false)
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in submitBill so later lines can reuse this data or behavior for the current feature.
  const submitBill = async (event: FormEvent<HTMLFormElement>) => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    event.preventDefault()
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setSaving(true); setError(null); setSuccess(null)
    // Starts an error-handling region so failures can be caught and handled safely.
    try {
      // Stores the value in input so later lines can reuse this data or behavior for the current feature.
      const input: BillInput = { ...form, dueDate: form.dueDate || null, description: form.description?.trim() || null }
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (editingId !== null) {
        // Waits for the asynchronous result before using it, so later work receives completed data.
        await updateBill(editingId, input)
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setSuccess('Bill updated.')
      // Continues the component or data expression so its related values and behavior stay grouped together.
      } else {
        // Waits for the asynchronous result before using it, so later work receives completed data.
        await createBill(input)
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setSuccess('Bill submitted for review.')
      // Closes the current block or object so the grouped statements or settings end here.
      }
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      resetBillForm()
      // Waits for the asynchronous result before using it, so later work receives completed data.
      await load()
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (submitError) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setError(messageOf(submitError))
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } finally {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSaving(false)
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in beginEdit so later lines can reuse this data or behavior for the current feature.
  const beginEdit = (bill: Bill) => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setForm({
      // Sets the projectId field so the surrounding object or component receives this setting.
      projectId: bill.projectId,
      // Sets the vendorId field so the surrounding object or component receives this setting.
      vendorId: bill.vendorId,
      // Sets the billNumber field so the surrounding object or component receives this setting.
      billNumber: bill.billNumber,
      // Sets the billDate field so the surrounding object or component receives this setting.
      billDate: bill.billDate.slice(0, 10),
      // Sets the dueDate field so the surrounding object or component receives this setting.
      dueDate: bill.dueDate?.slice(0, 10) ?? '',
      // Sets the category field so the surrounding object or component receives this setting.
      category: bill.category,
      // Sets the description field so the surrounding object or component receives this setting.
      description: bill.description ?? '',
      // Sets the baseAmount field so the surrounding object or component receives this setting.
      baseAmount: Number(bill.baseAmount),
      // Sets the gstPercent field so the surrounding object or component receives this setting.
      gstPercent: Number(bill.gstPercent) as BillInput['gstPercent'],
    // Continues the component or data expression so its related values and behavior stay grouped together.
    })
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setEditingId(bill.id)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setFormOpen(true)
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in chooseBill so later lines can reuse this data or behavior for the current feature.
  const chooseBill = async (bill: Bill) => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setRejecting(false)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setSelectedBill(bill)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setError(null)
    // Starts an error-handling region so failures can be caught and handled safely.
    try {
      // Waits for the asynchronous result before using it, so later work receives completed data.
      setBillPayments(await listBillPayments(bill.id))
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (detailError) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setError(messageOf(detailError))
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setBillPayments([])
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in action so later lines can reuse this data or behavior for the current feature.
  const action = async (run: () => Promise<unknown>, message: string) => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setSaving(true); setError(null); setSuccess(null)
    // Starts an error-handling region so failures can be caught and handled safely.
    try {
      // Waits for the asynchronous result before using it, so later work receives completed data.
      await run()
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSuccess(message)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSelectedBill(null)
      // Waits for the asynchronous result before using it, so later work receives completed data.
      await load()
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (actionError) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setError(messageOf(actionError))
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } finally {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSaving(false)
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in submitPayment so later lines can reuse this data or behavior for the current feature.
  const submitPayment = async (event: FormEvent<HTMLFormElement>) => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    event.preventDefault()
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!paymentTarget) return
    // Waits for the asynchronous result before using it, so later work receives completed data.
    await action(() => recordPayment(paymentTarget.id, {
      // Sets the amount field so the surrounding object or component receives this setting.
      amount: Number(paymentAmount),
      // Continues the component or data expression so its related values and behavior stay grouped together.
      paymentDate,
      // Sets the mode field so the surrounding object or component receives this setting.
      mode: paymentMode,
      // Sets the referenceNumber field so the surrounding object or component receives this setting.
      referenceNumber: paymentReference.trim() || null,
      // Sets the remarks field so the surrounding object or component receives this setting.
      remarks: paymentRemarks.trim() || null,
    // Continues the component or data expression so its related values and behavior stay grouped together.
    }), 'Payment recorded.')
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setPaymentTarget(null)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setPaymentAmount('')
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setPaymentReference('')
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setPaymentRemarks('')
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in createQuickVendor so later lines can reuse this data or behavior for the current feature.
  const createQuickVendor = async () => {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!isAdmin && !selectedProjectId) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setError('Select a project before creating a vendor.')
      // Returns the result so the caller or React receives the value or interface this function provides.
      return
    // Closes the current block or object so the grouped statements or settings end here.
    }
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setSaving(true); setError(null)
    // Starts an error-handling region so failures can be caught and handled safely.
    try {
      // Stores the value in vendor so later lines can reuse this data or behavior for the current feature.
      const vendor = await createVendor({ name: newVendorName.trim(), vendorType: 'OTHER' })
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (!isAdmin && selectedProjectId) {
        // Starts an error-handling region so failures can be caught and handled safely.
        try {
          // Waits for the asynchronous result before using it, so later work receives completed data.
          await assignVendor(selectedProjectId, vendor.id)
        // Continues the component or data expression so its related values and behavior stay grouped together.
        } catch (assignError) {
          // Calls this helper or component so the feature can perform the operation or render the control represented here.
          setError(`Vendor created, but assignment failed: ${messageOf(assignError)}`)
          // Calls this helper or component so the feature can perform the operation or render the control represented here.
          setVendors((current) => [...current, vendor])
          // Calls this helper or component so the feature can perform the operation or render the control represented here.
          setForm((current) => ({ ...current, vendorId: vendor.id }))
          // Calls this helper or component so the feature can perform the operation or render the control represented here.
          setNewVendorName('')
          // Calls this helper or component so the feature can perform the operation or render the control represented here.
          setVendorFormOpen(false)
          // Returns the result so the caller or React receives the value or interface this function provides.
          return
        // Closes the current block or object so the grouped statements or settings end here.
        }
      // Closes the current block or object so the grouped statements or settings end here.
      }
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setVendors((current) => [...current, vendor])
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setForm((current) => ({ ...current, vendorId: vendor.id }))
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setNewVendorName('')
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setVendorFormOpen(false)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSuccess('Vendor created. It is now available for this bill.')
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (createError) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setError(messageOf(createError))
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } finally {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSaving(false)
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Stores the value in tableBills so later lines can reuse this data or behavior for the current feature.
  const tableBills = view === 'expenses' ? expenses : bills

  // Returns the result so the caller or React receives the value or interface this function provides.
  return (
    // Continues the component or data expression so its related values and behavior stay grouped together.
    <AppShell currentPath="/app/bills">
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="min-h-screen bg-[#F7F3EE] px-4 py-8 text-[#323232] sm:px-8">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Starts the <header> element to organize this part of the interface. */}
          <header className="flex flex-wrap items-end justify-between gap-4">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div><p className="text-sm font-medium uppercase tracking-wide text-[#8A6F52]">Finance</p><h1 className="text-3xl font-semibold">Bills & Payments</h1><p className="mt-1 text-sm text-gray-600">Track project bills, approvals, balances, and payment history.</p>{selectedProject && <p className="mt-1 text-sm text-gray-500">Selected project: {selectedProject.code} — {selectedProject.name}</p>}</div>
            {/* Starts the <button> element to provide an action the user can activate. */}
            <button onClick={() => { setEditingId(null); setFormOpen(true) }} className="rounded bg-[#323232] px-4 py-2 text-white">Create bill</button>
          {/* Closes the <header> element so later content is no longer part of this region. */}
          </header>

          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {error && <div role="alert" className="flex items-center justify-between rounded border border-red-300 bg-red-50 p-3 text-red-800"><span>{error}</span><button className="underline" onClick={() => void load()}>Retry</button></div>}
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {success && <p role="status" className="rounded border border-green-300 bg-green-50 p-3 text-green-800">{success}</p>}

          {/* Starts the <nav> element to organize this part of the interface. */}
          <nav className="flex flex-wrap gap-2" aria-label="Finance views">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {([['bills', 'Bills'], ['expenses', 'Project expenses'], ['outstanding', 'Vendor outstanding'], ['payments', 'Payment history']] as const).map(([key, label]) => <button key={key} onClick={() => setView(key)} className={`rounded border px-4 py-2 ${view === key ? 'border-[#323232] bg-[#323232] text-white' : 'bg-white'}`}>{label}</button>)}
          {/* Closes the <nav> element so later content is no longer part of this region. */}
          </nav>

          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {(view === 'bills' || view === 'expenses') && (
            // Continues the component or data expression so its related values and behavior stay grouped together.
            <>
              {/* Starts the <div> element to organize this part of the interface. */}
              <div className="grid gap-3 sm:grid-cols-3">
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                {view === 'expenses' && <>
                  {/* Starts the <Metric> element to organize this part of the interface. */}
                  <Metric label="Project expenses" value={amount(expenseTotals.total)} />
                  {/* Starts the <Metric> element to organize this part of the interface. */}
                  <Metric label="Paid" value={amount(expenseTotals.paid)} />
                  {/* Starts the <Metric> element to organize this part of the interface. */}
                  <Metric label="Outstanding" value={amount(expenseTotals.outstanding)} />
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                </>}
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                {view === 'bills' && <>
                {/* Starts the <Metric> element to organize this part of the interface. */}
                <Metric label="Bills on this page" value={amount(totals.total)} />
                {/* Starts the <Metric> element to organize this part of the interface. */}
                <Metric label="Paid on this page" value={amount(totals.paid)} />
                {/* Starts the <Metric> element to organize this part of the interface. */}
                <Metric label="Outstanding on this page" value={amount(totals.outstanding)} />
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                </>}
              {/* Closes the <div> element so later content is no longer part of this region. */}
              </div>
              {/* Starts the <section> element to group related content into a meaningful region. */}
              <section className="rounded-lg border bg-white p-5 shadow-sm">
                {/* Starts the <div> element to organize this part of the interface. */}
                <div className="mb-4 flex flex-wrap items-end gap-3">
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  {view === 'bills' && <>
                    {/* Starts the <label> element to name a form control for users and assistive technology. */}
                    <label className="text-sm">Status<select className="mt-1 block rounded border px-3 py-2" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
                    {/* Starts the <label> element to name a form control for users and assistive technology. */}
                    <label className="text-sm">Category<select className="mt-1 block rounded border px-3 py-2" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
                    {/* Starts the <label> element to name a form control for users and assistive technology. */}
                    <label className="text-sm">Search<input className="mt-1 block rounded border px-3 py-2" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Bill or vendor" /></label>
                    {/* Starts the <label> element to name a form control for users and assistive technology. */}
                    <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" checked={overdue} onChange={(event) => setOverdue(event.target.checked)} />Overdue only</label>
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  </>}
                  {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                  {view === 'expenses' && <label className="text-sm">Project<select className="mt-1 block rounded border px-3 py-2" value={selectedProjectId} onChange={(event) => {
                    /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
                    /* Calls this helper or component so the feature can perform the operation or render the control represented here. */
                    selectProject(event.target.value)
                  /* Transforms each collection item so the corresponding values or interface elements can be produced. */
                  /* Transforms each collection item so the corresponding values or interface elements can be produced. */
                  }}>{projects.map((project) => <option key={project.id} value={project.id}>{project.code} — {project.name}</option>)}</select></label>}
                  {/* Starts the <label> element to name a form control for users and assistive technology. */}
                  <label className="text-sm">From<input type="date" className="mt-1 block rounded border px-3 py-2" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
                  {/* Starts the <label> element to name a form control for users and assistive technology. */}
                  <label className="text-sm">To<input type="date" className="mt-1 block rounded border px-3 py-2" value={to} onChange={(event) => setTo(event.target.value)} /></label>
                {/* Closes the <div> element so later content is no longer part of this region. */}
                </div>
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                {loading ? <p className="py-10 text-center text-gray-500">Loading finance records…</p> : tableBills.length === 0 ? <p className="py-10 text-center text-gray-500">{view === 'expenses' ? 'No expenses recorded for this project and date range.' : 'No bills match these filters.'}</p> : (
                  <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm">
                    {/* Starts the <thead> element to organize this part of the interface. */}
                    <thead><tr className="border-b text-gray-500"><th className="py-2">Bill</th><th>Project</th><th>Vendor</th><th>Date</th><th>Total</th><th>Paid / outstanding</th><th>Status</th><th>Actions</th></tr></thead>
                    {/* Starts the <tbody> element to organize this part of the interface. */}
                    <tbody>{tableBills.map((bill) => <tr key={bill.id} className="border-b last:border-0">
                      {/* Starts the <td> element to organize this part of the interface. */}
                      <td className="py-3"><button className="font-medium text-blue-700 underline" onClick={() => void chooseBill(bill)}>{bill.billNumber}</button><div className="text-xs text-gray-500">{bill.category}</div></td>
                      {/* Starts the <td> element to organize this part of the interface. */}
                      <td>{bill.project?.code ?? bill.projectId}</td><td>{bill.vendor?.name ?? '—'}</td><td>{dateLabel(bill.billDate)}</td><td>{amount(bill.totalAmount)}</td>
                      {/* Starts the <td> element to organize this part of the interface. */}
                      <td>{amount(bill.paidAmount)} / {amount(bill.outstandingAmount)}</td><td>{bill.status.replaceAll('_', ' ')}</td>
                      {/* Starts the <td> element to organize this part of the interface. */}
                      <td className="space-x-2 whitespace-nowrap">
                        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                        {isAdmin && bill.status === 'PENDING' && <button className="text-green-700 underline" disabled={saving} onClick={() => void action(() => approveBill(bill.id), 'Bill approved.')}>Approve</button>}
                        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                        {isAdmin && bill.status === 'PENDING' && <button className="text-red-700 underline" disabled={saving} onClick={() => { setRejecting(true); setSelectedBill(bill) }}>Reject</button>}
                        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                        {isAdmin && ['APPROVED', 'PARTIALLY_PAID'].includes(bill.status) && <button className="text-blue-700 underline" onClick={() => setPaymentTarget(bill)}>Record payment</button>}
                        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                        {(isAdmin || bill.submittedById === user?.id) && ['PENDING', 'REJECTED'].includes(bill.status) && <button className="text-blue-700 underline" onClick={() => beginEdit(bill)}>Edit</button>}
                        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                        {(isAdmin || bill.submittedById === user?.id) && bill.status === 'PENDING' && <button className="text-red-700 underline" disabled={saving} onClick={() => { if (window.confirm(`Delete bill ${bill.billNumber}?`)) void action(() => deleteBill(bill.id), 'Bill deleted.') }}>Delete</button>}
                      {/* Closes the <td> element so later content is no longer part of this region. */}
                      </td>
                    {/* Closes the <tr> element so later content is no longer part of this region. */}
                    </tr>)}</tbody>
                  {/* Closes the <table> element so later content is no longer part of this region. */}
                  </table></div>
                )}
                {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
                {view === 'bills' && totalBillPages > 1 && <div className="mt-4 flex items-center justify-between text-sm"><span>Page {billPage} of {totalBillPages}</span><div className="flex gap-2"><button className="rounded border px-3 py-1 disabled:opacity-50" disabled={billPage <= 1 || loading} onClick={() => setBillPage((page) => page - 1)}>Previous</button><button className="rounded border px-3 py-1 disabled:opacity-50" disabled={billPage >= totalBillPages || loading} onClick={() => setBillPage((page) => page + 1)}>Next</button></div></div>}
              {/* Closes the <section> element so later content is no longer part of this region. */}
              </section>
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            </>
          )}

          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {view === 'outstanding' && <ReportSection title="Vendor outstanding" loading={loading} empty={!outstanding.length} emptyText="No outstanding balances for this date range.">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-gray-500"><th className="py-2">Vendor</th><th>Total</th><th>Paid</th><th>Outstanding</th></tr></thead><tbody>{outstanding.map((row) => <tr key={row.vendorId} className="border-b"><td className="py-3">{row.vendorName}</td><td>{amount(row.totalAmount)}</td><td>{amount(row.paidAmount)}</td><td>{amount(row.outstandingAmount)}</td></tr>)}</tbody></table></div>
          {/* Closes the <ReportSection> element so later content is no longer part of this region. */}
          </ReportSection>}

          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {view === 'payments' && <ReportSection title="Payment history" loading={loading} empty={!history.length} emptyText="No payments found for this date range.">
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b text-gray-500"><th className="py-2">Payment date</th><th>Bill</th><th>Vendor</th><th>Project</th><th>Amount</th><th>Mode</th><th>Reference</th><th>Recorded by</th></tr></thead><tbody>{history.map((payment) => <tr key={payment.id} className="border-b"><td className="py-3">{dateLabel(payment.paymentDate)}</td><td>{payment.bill.billNumber}</td><td>{payment.bill.vendor.name}</td><td>{projects.find((project) => project.id === payment.bill.projectId)?.code ?? payment.bill.projectId}</td><td>{amount(payment.amount)}</td><td>{payment.mode.replaceAll('_', ' ')}</td><td>{payment.referenceNumber || '—'}</td><td>{payment.recordedBy.name}</td></tr>)}</tbody></table></div>
          {/* Closes the <ReportSection> element so later content is no longer part of this region. */}
          </ReportSection>}
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>

      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {formOpen && <Modal title={editingId === null ? 'Create and submit bill' : 'Edit bill'} onClose={resetBillForm}>
        {/* Starts the <form> element to group controls that submit related information. */}
        <form className="space-y-3" onSubmit={(event) => void submitBill(event)}>
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="block text-sm">Project<select required className="mt-1 w-full rounded border px-3 py-2" value={form.projectId || ''} disabled={editingId !== null} onChange={(event) => setForm({ ...form, projectId: Number(event.target.value) })}><option value="">Choose project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.code} — {project.name}</option>)}</select></label>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex items-end gap-2"><label className="block flex-1 text-sm">Vendor<select required className="mt-1 w-full rounded border px-3 py-2" value={form.vendorId || ''} onChange={(event) => setForm({ ...form, vendorId: Number(event.target.value) })}><option value="">Choose vendor</option>{vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select></label><button type="button" className="rounded border px-3 py-2 text-sm" onClick={() => setVendorFormOpen((value) => !value)}>Add</button></div>
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {vendorFormOpen && <div className="flex gap-2"><input required className="min-w-0 flex-1 rounded border px-3 py-2" placeholder="Vendor name" value={newVendorName} onChange={(event) => setNewVendorName(event.target.value)} /><button type="button" className="rounded border px-3 py-2" disabled={saving || !newVendorName.trim()} onClick={() => void createQuickVendor()}>Create</button></div>}
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="block text-sm">Invoice number<input required maxLength={100} className="mt-1 w-full rounded border px-3 py-2" value={form.billNumber} onChange={(event) => setForm({ ...form, billNumber: event.target.value })} /></label>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="grid grid-cols-2 gap-3"><label className="block text-sm">Invoice date<input type="date" required className="mt-1 w-full rounded border px-3 py-2" value={form.billDate} onChange={(event) => setForm({ ...form, billDate: event.target.value })} /></label><label className="block text-sm">Due date<input type="date" min={form.billDate} className="mt-1 w-full rounded border px-3 py-2" value={form.dueDate ?? ''} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></label></div>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="grid grid-cols-2 gap-3"><label className="block text-sm">Category<select className="mt-1 w-full rounded border px-3 py-2" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as BillCategory })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="block text-sm">GST<select className="mt-1 w-full rounded border px-3 py-2" value={form.gstPercent} onChange={(event) => setForm({ ...form, gstPercent: Number(event.target.value) as BillInput['gstPercent'] })}>{[0, 5, 12, 18, 28].map((rate) => <option key={rate} value={rate}>{rate}%</option>)}</select></label></div>
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="block text-sm">Base amount<input type="number" min="0.01" step="0.01" required className="mt-1 w-full rounded border px-3 py-2" value={form.baseAmount || ''} onChange={(event) => setForm({ ...form, baseAmount: Number(event.target.value) })} /></label>
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="block text-sm">Description<textarea maxLength={5000} rows={2} className="mt-1 w-full rounded border px-3 py-2" value={form.description ?? ''} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          {/* Starts the <p> element to organize this part of the interface. */}
          <p className="text-sm text-gray-600">GST amount: {amount(Number(form.baseAmount || 0) * form.gstPercent / 100)} · Total: {amount(Number(form.baseAmount || 0) * (1 + form.gstPercent / 100))}</p>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex gap-2"><button disabled={saving || !projects.length} className="rounded bg-[#323232] px-4 py-2 text-white disabled:opacity-50">{saving ? 'Saving…' : editingId === null ? 'Submit bill' : 'Save changes'}</button><button type="button" className="rounded border px-4 py-2" onClick={resetBillForm}>Cancel</button></div>
        {/* Closes the <form> element so later content is no longer part of this region. */}
        </form>
      {/* Closes the <Modal> element so later content is no longer part of this region. */}
      </Modal>}

      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {selectedBill && <Modal title={rejecting ? `Reject ${selectedBill.billNumber}` : `Bill ${selectedBill.billNumber}`} onClose={() => { setSelectedBill(null); setRejecting(false); setRejectionReason('') }}>
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {rejecting && isAdmin ? <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void action(() => rejectBill(selectedBill.id, rejectionReason), 'Bill rejected.'); setRejectionReason('') }}><label className="block text-sm">Reason (5–1000 characters)<textarea minLength={5} maxLength={1000} required rows={4} className="mt-1 w-full rounded border px-3 py-2" value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} /></label><button disabled={saving} className="rounded bg-red-700 px-4 py-2 text-white">Reject bill</button></form> : <div className="space-y-3 text-sm">
          {/* Starts the <p> element to organize this part of the interface. */}
          <p><strong>Vendor:</strong> {selectedBill.vendor.name}</p><p><strong>Project:</strong> {selectedBill.project?.name ?? selectedBill.projectId}</p><p><strong>Status:</strong> {selectedBill.status.replaceAll('_', ' ')}</p><p><strong>Invoice date:</strong> {dateLabel(selectedBill.billDate)} · <strong>Due:</strong> {dateLabel(selectedBill.dueDate)}</p><p><strong>Amount:</strong> {amount(selectedBill.totalAmount)} · <strong>Paid:</strong> {amount(selectedBill.paidAmount)} · <strong>Outstanding:</strong> {amount(selectedBill.outstandingAmount)}</p>
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {selectedBill.rejectionReason && <p className="rounded bg-red-50 p-2 text-red-800">Rejection: {selectedBill.rejectionReason}</p>}
          {/* Starts the <h3> element to organize this part of the interface. */}
          <h3 className="font-semibold">Payments</h3>{billPayments.length ? <ul className="divide-y">{billPayments.map((payment) => <li key={payment.id} className="py-2">{dateLabel(payment.paymentDate)} · {amount(payment.amount)} · {payment.mode.replaceAll('_', ' ')} {payment.referenceNumber ? `· ${payment.referenceNumber}` : ''}</li>)}</ul> : <p className="text-gray-500">No payments recorded.</p>}
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>}
      {/* Closes the <Modal> element so later content is no longer part of this region. */}
      </Modal>}

      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {paymentTarget && <Modal title={`Record payment · ${paymentTarget.billNumber}`} onClose={() => setPaymentTarget(null)}>
        {/* Starts the <form> element to group controls that submit related information. */}
        <form className="space-y-3" onSubmit={(event) => void submitPayment(event)}>
          {/* Starts the <p> element to organize this part of the interface. */}
          <p className="text-sm text-gray-600">Outstanding balance: {amount(paymentTarget.outstandingAmount)}</p>
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="block text-sm">Amount<input required type="number" min="0.01" max={paymentTarget.outstandingAmount} step="0.01" className="mt-1 w-full rounded border px-3 py-2" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} /></label>
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="block text-sm">Payment date<input required type="date" min={paymentTarget.billDate.slice(0, 10)} max={today} className="mt-1 w-full rounded border px-3 py-2" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} /></label>
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="block text-sm">Mode<select className="mt-1 w-full rounded border px-3 py-2" value={paymentMode} onChange={(event) => setPaymentMode(event.target.value as PaymentMode)}>{modes.map((mode) => <option key={mode}>{mode}</option>)}</select></label>
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="block text-sm">Reference number<input maxLength={255} className="mt-1 w-full rounded border px-3 py-2" value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} /></label>
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="block text-sm">Remarks<textarea maxLength={1000} rows={2} className="mt-1 w-full rounded border px-3 py-2" value={paymentRemarks} onChange={(event) => setPaymentRemarks(event.target.value)} /></label>
          {/* Starts the <button> element to provide an action the user can activate. */}
          <button disabled={saving} className="rounded bg-[#323232] px-4 py-2 text-white">Record payment</button>
        {/* Closes the <form> element so later content is no longer part of this region. */}
        </form>
      {/* Closes the <Modal> element so later content is no longer part of this region. */}
      </Modal>}
    {/* Closes the <AppShell> element so later content is no longer part of this region. */}
    </AppShell>
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines Metric so this module can perform its named task when needed.
function Metric({ label, value }: { label: string; value: string }) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return <div className="rounded-lg border bg-white p-4 shadow-sm"><p className="text-sm text-gray-500">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines ReportSection so this module can perform its named task when needed.
function ReportSection({ title, loading, empty, emptyText, children }: { title: string; loading: boolean; empty: boolean; emptyText: string; children: ReactNode }) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return <section className="rounded-lg border bg-white p-5 shadow-sm"><h2 className="mb-4 text-xl font-semibold">{title}</h2>{loading ? <p className="py-10 text-center text-gray-500">Loading report…</p> : empty ? <p className="py-10 text-center text-gray-500">{emptyText}</p> : children}</section>
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines Modal so this module can perform its named task when needed.
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section role="dialog" aria-modal="true" aria-label={title} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"><div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-xl font-semibold">{title}</h2><button aria-label="Close dialog" className="rounded border px-3 py-1" onClick={onClose}>Close</button></div>{children}</section></div>
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the bills screen and coordinates its page-level interactions.
