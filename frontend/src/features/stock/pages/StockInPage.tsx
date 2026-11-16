// Imports useEffect, useMemo, useState, type FormEvent from react so this module can reuse that component, helper, or library.
import { useEffect, useMemo, useState, type FormEvent } from 'react'
// Imports ArrowDownToLine, RefreshCw from lucide-react so this module can reuse that component, helper, or library.
import { ArrowDownToLine, RefreshCw } from 'lucide-react'
// Imports AppShell from ../../app-shell/components/AppShell so this module can reuse that component, helper, or library.
import { AppShell } from '../../app-shell/components/AppShell'
// Imports useProjects from ../../projects/useProjects so this module can reuse that component, helper, or library.
import { useProjects } from '../../projects/useProjects'
// Imports ApiError from ../../../lib/api so this module can reuse that component, helper, or library.
import { ApiError } from '../../../lib/api'
// Imports createStockTransaction, fetchMaterials, fetchProjectInventory, fetchTransactions, type ApiMaterial, type InventoryRow, type StockTransaction from ../data/inventoryApi so this module can reuse that component, helper, or library.
import { createStockTransaction, fetchMaterials, fetchProjectInventory, fetchTransactions, type ApiMaterial, type InventoryRow, type StockTransaction } from '../data/inventoryApi'
// Imports formatQty, todayISO from ../data/formatting so this module can reuse that component, helper, or library.
import { formatQty, todayISO } from '../data/formatting'

// Stores the value in initialForm so later lines can reuse this data or behavior for the current feature.
const initialForm = { materialId: '', quantity: '', txnDate: todayISO(), unitRate: '', vendorId: '', billId: '', challanNumber: '', remarks: '' }

// Defines StockInPage so this module can perform its named task when needed.
export function StockInPage() {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { projects, selectedProject, selectedProjectId, selectProject, isLoading: projectsLoading, error: projectsError, retry: retryProjects } = useProjects()
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [materials, setMaterials] = useState<ApiMaterial[]>([])
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [inventory, setInventory] = useState<InventoryRow[]>([])
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [form, setForm] = useState(initialForm)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [loading, setLoading] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [saving, setSaving] = useState(false)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [error, setError] = useState<string | null>(null)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [success, setSuccess] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [retry, setRetry] = useState(0)
  // Caches activeMaterials so its calculation is repeated only when its inputs change.
  // Caches activeMaterials so its calculation is repeated only when its inputs change.
  const activeMaterials = useMemo(() => new Map(materials.filter((material) => material.isActive).map((material) => [material.id, material])), [materials])
  // Stores the value in plannedRows so later lines can reuse this data or behavior for the current feature.
  const plannedRows = inventory.filter((row) => activeMaterials.has(row.materialId))
  // Stores the value in recentIn so later lines can reuse this data or behavior for the current feature.
  const recentIn = transactions.filter((transaction) => transaction.txnType === 'IN').slice(0, 10)

  // Stores the value in refresh so later lines can reuse this data or behavior for the current feature.
  const refresh = () => setRetry((value) => value + 1)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => {
    // Stores the value in controller so later lines can reuse this data or behavior for the current feature.
    const controller = new AbortController()
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setLoading(true)
    // Stores the value in requests so later lines can reuse this data or behavior for the current feature.
    const requests = [
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      fetchMaterials(controller.signal),
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      selectedProjectId ? fetchProjectInventory(selectedProjectId, controller.signal) : Promise.resolve([]),
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      selectedProjectId ? fetchTransactions(selectedProjectId, { includeVoided: true }, controller.signal) : Promise.resolve([]),
    // Continues the component or data expression so its related values and behavior stay grouped together.
    ] as const
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    Promise.all(requests).then(([catalogue, rows, history]) => {
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (!controller.signal.aborted) {
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setMaterials(catalogue)
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setInventory(rows)
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setTransactions(history)
        // Calls this helper or component so the feature can perform the operation or render the control represented here.
        setError(null)
      // Closes the current block or object so the grouped statements or settings end here.
      }
    // Continues the component or data expression so its related values and behavior stay grouped together.
    }).catch((cause: unknown) => {
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load stock receipt data.')
    // Continues the component or data expression so its related values and behavior stay grouped together.
    }).finally(() => {
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (!controller.signal.aborted) setLoading(false)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    })
    // Returns the result so the caller or React receives the value or interface this function provides.
    return () => controller.abort()
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [selectedProjectId, retry])

  // Stores the value in selectedMaterial so later lines can reuse this data or behavior for the current feature.
  const selectedMaterial = materials.find((material) => material.id === Number(form.materialId))
  // Stores the value in submit so later lines can reuse this data or behavior for the current feature.
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    event.preventDefault()
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!selectedProjectId || !selectedMaterial) return
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setSaving(true)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setError(null)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setSuccess('')
    // Starts an error-handling region so failures can be caught and handled safely.
    try {
      // Waits for the asynchronous result before using it, so later work receives completed data.
      await createStockTransaction(selectedProjectId, {
        // Sets the materialId field so the surrounding object or component receives this setting.
        materialId: selectedMaterial.id,
        // Sets the txnType field so the surrounding object or component receives this setting.
        txnType: 'IN',
        // Sets the quantity field so the surrounding object or component receives this setting.
        quantity: Number(form.quantity),
        // Sets the txnDate field so the surrounding object or component receives this setting.
        txnDate: form.txnDate,
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ...(form.unitRate ? { unitRate: Number(form.unitRate) } : {}),
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ...(form.vendorId ? { vendorId: Number(form.vendorId) } : {}),
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ...(form.billId ? { billId: Number(form.billId) } : {}),
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ...(form.challanNumber.trim() ? { challanNumber: form.challanNumber.trim() } : {}),
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ...(form.remarks.trim() ? { remarks: form.remarks.trim() } : {}),
      // Continues the component or data expression so its related values and behavior stay grouped together.
      })
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSuccess(`Stock IN recorded for ${selectedMaterial.name}.`)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setForm({ ...initialForm, txnDate: todayISO() })
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      refresh()
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (cause) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setError(cause instanceof ApiError ? cause.message : 'Unable to record this receipt.')
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } finally {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSaving(false)
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Returns the result so the caller or React receives the value or interface this function provides.
  return <AppShell currentPath="/app/stock-in">
    {/* Starts the <div> element to organize this part of the interface. */}
    <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
      {/* Starts the <header> element to organize this part of the interface. */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm text-[#8E827A]">Workspace / Stock / IN</p><h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Record Stock IN</h1><p className="mt-2 text-sm text-[#8E827A]">Post a material receipt to the selected project.</p></div><span className="inline-flex items-center gap-2 rounded-full bg-[#E8EFE5] px-4 py-2 text-sm font-medium text-[#617858]"><ArrowDownToLine size={16} /> Stock received</span></header>
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="flex flex-wrap gap-3">
        {/* Starts the <select> element to collect or display a value. */}
        <select aria-label="Project" value={selectedProjectId} onChange={(event) => selectProject(event.target.value)} disabled={projectsLoading || !projects.length} className="rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 text-sm">{projects.map((project) => <option key={project.id} value={String(project.id)}>{project.code} — {project.name}</option>)}</select>
        {/* Starts the <button> element to provide an action the user can activate. */}
        <button type="button" onClick={refresh} className="rounded-xl border border-[#C8BCB4] px-4 py-3 text-sm"><RefreshCw className="mr-1 inline h-4 w-4" />Refresh</button>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {projectsError && <Banner message={projectsError} retry={retryProjects} />}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {error && <Banner message={error} retry={refresh} />}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {success && <p role="status" className="rounded-xl bg-[#E8EFE5] px-4 py-3 text-sm text-[#617858]">{success}</p>}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {selectedProject && <p className="text-sm text-[#8E827A]">Receipt destination: {selectedProject.code} · {selectedProject.name}</p>}

      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.35fr]">
        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-6 shadow-sm">
          {/* Starts the <h2> element to organize this part of the interface. */}
          <h2 className="font-semibold text-[#323232]">Receipt Details</h2>
          {/* Starts the <p> element to organize this part of the interface. */}
          <p className="mt-1 text-xs text-[#8E827A]">Only materials already included in this project plan can receive stock.</p>
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {!loading && selectedProjectId && plannedRows.length === 0 && <p className="mt-4 rounded-xl bg-[#F5EDE1] px-4 py-3 text-sm text-[#9A7950]">No planned materials are available for this project. Stock receipts require an existing project material plan.</p>}
          {/* Starts the <form> element to group controls that submit related information. */}
          <form onSubmit={(event) => void submit(event)} className="mt-5 space-y-4">
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="block text-sm font-medium text-[#595552]">Material<select required value={form.materialId} onChange={(event) => setForm({ ...form, materialId: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 font-normal"><option value="">Select planned material</option>{plannedRows.map((row) => <option key={row.materialId} value={row.materialId}>{row.materialName} ({row.unit})</option>)}</select></label>
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {selectedMaterial && <p className="rounded-xl bg-[#F7F3EE] px-4 py-3 text-sm text-[#595552]">Current available stock: <strong>{formatQty(inventory.find((row) => row.materialId === selectedMaterial.id)?.availableStock ?? 0)} {selectedMaterial.unit}</strong></p>}
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="grid grid-cols-2 gap-4">
              {/* Starts the <label> element to name a form control for users and assistive technology. */}
              <label className="text-sm font-medium text-[#595552]">Quantity {selectedMaterial && `(${selectedMaterial.unit})`}<input required type="number" min="0.001" step="0.001" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label>
              {/* Starts the <label> element to name a form control for users and assistive technology. */}
              <label className="text-sm font-medium text-[#595552]">Transaction Date<input required type="date" max={todayISO()} value={form.txnDate} onChange={(event) => setForm({ ...form, txnDate: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="grid grid-cols-2 gap-4">
              {/* Starts the <label> element to name a form control for users and assistive technology. */}
              <label className="text-sm font-medium text-[#595552]">Unit Rate (optional)<input type="number" min="0" step="0.01" value={form.unitRate} onChange={(event) => setForm({ ...form, unitRate: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label>
              {/* Starts the <label> element to name a form control for users and assistive technology. */}
              <label className="text-sm font-medium text-[#595552]">Vendor ID (optional)<input type="number" min="1" step="1" value={form.vendorId} onChange={(event) => setForm({ ...form, vendorId: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="grid grid-cols-2 gap-4">
              {/* Starts the <label> element to name a form control for users and assistive technology. */}
              <label className="text-sm font-medium text-[#595552]">Bill ID (optional)<input type="number" min="1" step="1" value={form.billId} onChange={(event) => setForm({ ...form, billId: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label>
              {/* Starts the <label> element to name a form control for users and assistive technology. */}
              <label className="text-sm font-medium text-[#595552]">Challan No. (optional)<input maxLength={100} value={form.challanNumber} onChange={(event) => setForm({ ...form, challanNumber: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label>
            {/* Closes the <div> element so later content is no longer part of this region. */}
            </div>
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="block text-sm font-medium text-[#595552]">Remarks (optional)<textarea maxLength={1000} value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} rows={2} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label>
            {/* Starts the <button> element to provide an action the user can activate. */}
            <button disabled={saving || loading || !selectedProjectId || !plannedRows.length} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#323232] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"><ArrowDownToLine size={16} />{saving ? 'Recording…' : 'Record Stock IN'}</button>
          {/* Closes the <form> element so later content is no longer part of this region. */}
          </form>
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>

        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="border-b border-[#E8DCD4] p-5"><h2 className="font-semibold text-[#323232]">Recent Stock IN</h2><p className="mt-1 text-xs text-[#8E827A]">Recent receipts for the selected project</p></div>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead className="bg-[#F7F3EE] text-xs text-[#8E827A]"><tr><th className="px-5 py-4 font-medium">Date</th><th className="px-5 py-4 font-medium">Material</th><th className="px-5 py-4 font-medium">Quantity</th><th className="px-5 py-4 font-medium">Details</th><th className="px-5 py-4 font-medium">Recorded By</th></tr></thead><tbody className="divide-y divide-[#E8DCD4]">
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {recentIn.map((transaction) => <tr key={transaction.id}><td className="px-5 py-4 text-sm">{transaction.txnDate.slice(0, 10)}</td><td className="px-5 py-4 text-sm font-medium">{transaction.material.name}</td><td className="px-5 py-4 text-sm text-[#617858]">+{formatQty(Number(transaction.quantity))} {transaction.material.unit}</td><td className="px-5 py-4 text-sm">{transaction.challanNumber ?? '—'}{transaction.remarks ? ` · ${transaction.remarks}` : ''}</td><td className="px-5 py-4 text-sm">{transaction.createdBy.name}</td></tr>)}
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {loading && <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-[#8E827A]">Loading receipts…</td></tr>}
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {!loading && recentIn.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-[#8E827A]">No stock receipts returned for this project.</td></tr>}
          {/* Closes the <tbody> element so later content is no longer part of this region. */}
          </tbody></table></div>
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>
      {/* Closes the <div> element so later content is no longer part of this region. */}
      </div>
    {/* Closes the <div> element so later content is no longer part of this region. */}
    </div>
  {/* Closes the <AppShell> element so later content is no longer part of this region. */}
  </AppShell>
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines Banner so this module can perform its named task when needed.
function Banner({ message, retry }: { message: string; retry: () => void }) {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return <div role="alert" className="flex items-center justify-between gap-3 rounded-xl bg-[#F8ECEA] px-4 py-3 text-sm text-[#9B625A]"><span>{message}</span><button type="button" onClick={retry} className="font-semibold underline">Retry</button></div>
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Renders the stock screen and coordinates its page-level interactions.
