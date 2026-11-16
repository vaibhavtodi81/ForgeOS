// Imports useEffect, useMemo, useState, type FormEvent from react so this module can reuse that component, helper, or library.
import { useEffect, useMemo, useState, type FormEvent } from 'react'
// Imports ArrowUpFromLine, PackageCheck, RefreshCw from lucide-react so this module can reuse that component, helper, or library.
import { ArrowUpFromLine, PackageCheck, RefreshCw } from 'lucide-react'
// Imports AppShell from ../../app-shell/components/AppShell so this module can reuse that component, helper, or library.
import { AppShell } from '../../app-shell/components/AppShell'
// Imports useProjects from ../../projects/useProjects so this module can reuse that component, helper, or library.
import { useProjects } from '../../projects/useProjects'
// Imports ApiError from ../../../lib/api so this module can reuse that component, helper, or library.
import { ApiError } from '../../../lib/api'
// Imports createStockTransaction, fetchProjectInventory, fetchTransactions, type InventoryRow, type StockTransaction, type OutReason from ../data/inventoryApi so this module can reuse that component, helper, or library.
import { createStockTransaction, fetchProjectInventory, fetchTransactions, type InventoryRow, type StockTransaction, type OutReason } from '../data/inventoryApi'
// Imports formatQty, todayISO from ../data/formatting so this module can reuse that component, helper, or library.
import { formatQty, todayISO } from '../data/formatting'

// Stores the value in reasons so later lines can reuse this data or behavior for the current feature.
const reasons: { value: OutReason; label: string; hint: string }[] = [
  // Continues the component or data expression so its related values and behavior stay grouped together.
  { value: 'USED', label: 'Used on site', hint: 'Consumed for construction work' },
  // Continues the component or data expression so its related values and behavior stay grouped together.
  { value: 'DAMAGED', label: 'Damaged', hint: 'Recorded as wastage' },
  // Continues the component or data expression so its related values and behavior stay grouped together.
  { value: 'LOST', label: 'Lost / Missing', hint: 'Recorded as wastage' },
// Continues the component or data expression so its related values and behavior stay grouped together.
]
// Stores the value in initialForm so later lines can reuse this data or behavior for the current feature.
const initialForm = { materialId: '', quantity: '', outReason: 'USED' as OutReason, txnDate: todayISO(), remarks: '' }

// Defines StockOutPage so this module can perform its named task when needed.
export function StockOutPage() {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { projects, selectedProject, selectedProjectId, selectProject, isLoading: projectsLoading, error: projectsError, retry: retryProjects } = useProjects()
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
  // Stores the value in refresh so later lines can reuse this data or behavior for the current feature.
  const refresh = () => setRetry((value) => value + 1)

  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  useEffect(() => {
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!selectedProjectId) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setInventory([])
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setTransactions([])
      // Returns the result so the caller or React receives the value or interface this function provides.
      return
    // Closes the current block or object so the grouped statements or settings end here.
    }
    // Stores the value in controller so later lines can reuse this data or behavior for the current feature.
    const controller = new AbortController()
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    setLoading(true)
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    Promise.all([
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      fetchProjectInventory(selectedProjectId, controller.signal),
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      fetchTransactions(selectedProjectId, { includeVoided: true }, controller.signal),
    // Continues the component or data expression so its related values and behavior stay grouped together.
    ]).then(([rows, history]) => {
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (!controller.signal.aborted) {
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
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load project stock.')
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

  // Stores the value in availableRows so later lines can reuse this data or behavior for the current feature.
  const availableRows = inventory.filter((row) => row.availableStock > 0)
  // Stores the value in material so later lines can reuse this data or behavior for the current feature.
  const material = inventory.find((row) => row.materialId === Number(form.materialId))
  // Stores the value in recentOut so later lines can reuse this data or behavior for the current feature.
  const recentOut = transactions.filter((transaction) => transaction.txnType === 'OUT').slice(0, 10)
  // Stores the value in quantity so later lines can reuse this data or behavior for the current feature.
  const quantity = Number(form.quantity)
  // Stores the value in canSubmit so later lines can reuse this data or behavior for the current feature.
  const canSubmit = Boolean(selectedProjectId && material && quantity > 0 && quantity <= (material?.availableStock ?? 0))
  // Caches historyCount so its calculation is repeated only when its inputs change.
  // Caches historyCount so its calculation is repeated only when its inputs change.
  const historyCount = useMemo(() => transactions.length, [transactions])

  // Stores the value in submit so later lines can reuse this data or behavior for the current feature.
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    // Calls this helper or component so the feature can perform the operation or render the control represented here.
    event.preventDefault()
    // Checks this condition before continuing so the code can choose the correct path for the current state.
    if (!selectedProjectId || !material) return
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
        materialId: material.materialId,
        // Sets the txnType field so the surrounding object or component receives this setting.
        txnType: 'OUT',
        // Sets the quantity field so the surrounding object or component receives this setting.
        quantity: Number(form.quantity),
        // Sets the txnDate field so the surrounding object or component receives this setting.
        txnDate: form.txnDate,
        // Sets the outReason field so the surrounding object or component receives this setting.
        outReason: form.outReason,
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ...(form.remarks.trim() ? { remarks: form.remarks.trim() } : {}),
      // Continues the component or data expression so its related values and behavior stay grouped together.
      })
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSuccess(`Stock OUT recorded for ${material.materialName}.`)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setForm({ ...initialForm, txnDate: todayISO() })
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      refresh()
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (cause) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setError(cause instanceof ApiError ? cause.message : 'Unable to record stock consumption.')
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } finally {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSaving(false)
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Returns the result so the caller or React receives the value or interface this function provides.
  return <AppShell currentPath="/app/stock-out">
    {/* Starts the <div> element to organize this part of the interface. */}
    <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
      {/* Starts the <header> element to organize this part of the interface. */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm text-[#8E827A]">Workspace / Stock / OUT</p><h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Record Stock OUT</h1><p className="mt-2 text-sm text-[#8E827A]">Record consumption, damaged stock, or lost stock against the selected project.</p></div><span className="inline-flex items-center gap-2 rounded-full bg-[#F5EDE1] px-4 py-2 text-sm font-medium text-[#9A7950]"><ArrowUpFromLine size={16} /> Stock issued</span></header>
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="flex flex-wrap gap-3"><select aria-label="Project" value={selectedProjectId} onChange={(event) => selectProject(event.target.value)} disabled={projectsLoading || !projects.length} className="rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 text-sm">{projects.map((project) => <option key={project.id} value={String(project.id)}>{project.code} — {project.name}</option>)}</select><button type="button" onClick={refresh} className="rounded-xl border border-[#C8BCB4] px-4 py-3 text-sm"><RefreshCw className="mr-1 inline h-4 w-4" />Refresh</button></div>
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {projectsError && <Banner message={projectsError} retry={retryProjects} />}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {error && <Banner message={error} retry={refresh} />}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {success && <p role="status" className="rounded-xl bg-[#E8EFE5] px-4 py-3 text-sm text-[#617858]">{success}</p>}
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {selectedProject && <p className="text-sm text-[#8E827A]">Selected project: {selectedProject.code} · {selectedProject.name}</p>}

      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.35fr]">
        {/* Starts the <section> element to group related content into a meaningful region. */}
        <section className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-6 shadow-sm">
          {/* Starts the <h2> element to organize this part of the interface. */}
          <h2 className="font-semibold text-[#323232]">Issue Details</h2><p className="mt-1 text-xs text-[#8E827A]">The backend rejects quantities greater than available stock.</p>
          {/* Starts the <form> element to group controls that submit related information. */}
          <form onSubmit={(event) => void submit(event)} className="mt-5 space-y-4">
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="block text-sm font-medium text-[#595552]">Material<select required value={form.materialId} onChange={(event) => setForm({ ...form, materialId: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 font-normal"><option value="">Select material with stock</option>{availableRows.map((row) => <option key={row.materialId} value={row.materialId}>{row.materialName} ({row.unit})</option>)}</select></label>
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {material && <p className="rounded-xl bg-[#F7F3EE] px-4 py-3 text-sm text-[#595552]">Available balance: <strong>{formatQty(material.availableStock)} {material.unit}</strong></p>}
            {/* Starts the <div> element to organize this part of the interface. */}
            <div className="grid grid-cols-2 gap-4"><label className="text-sm font-medium text-[#595552]">Quantity {material && `(${material.unit})`}<input required type="number" min="0.001" step="0.001" max={material?.availableStock} value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label><label className="text-sm font-medium text-[#595552]">Issue Date<input required type="date" max={todayISO()} value={form.txnDate} onChange={(event) => setForm({ ...form, txnDate: event.target.value })} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label></div>
            {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
            {material && Number(form.quantity) > material.availableStock && <p role="alert" className="rounded-xl bg-[#F8ECEA] px-4 py-3 text-sm text-[#9B625A]">Requested quantity exceeds available stock ({formatQty(material.availableStock)} {material.unit}). The backend also validates the balance when posting.</p>}
            {/* Starts the <fieldset> element to organize this part of the interface. */}
            <fieldset className="space-y-2"><legend className="text-sm font-medium text-[#595552]">Reason</legend>{reasons.map((reason) => <label key={reason.value} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${form.outReason === reason.value ? 'border-[#323232] bg-[#F7F3EE]' : 'border-[#C8BCB4]'}`}><input type="radio" name="outReason" checked={form.outReason === reason.value} onChange={() => setForm({ ...form, outReason: reason.value })} className="mt-1" /><span><span className="block text-sm font-medium text-[#323232]">{reason.label}</span><span className="block text-xs text-[#8E827A]">{reason.hint}</span></span></label>)}</fieldset>
            {/* Starts the <label> element to name a form control for users and assistive technology. */}
            <label className="block text-sm font-medium text-[#595552]">Remarks (optional)<textarea maxLength={1000} value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} rows={2} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal" /></label>
            {/* Starts the <button> element to provide an action the user can activate. */}
            <button disabled={saving || loading || !canSubmit} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#323232] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"><ArrowUpFromLine size={16} />{saving ? 'Recording…' : 'Record Stock OUT'}</button>
          {/* Closes the <form> element so later content is no longer part of this region. */}
          </form>
        {/* Closes the <section> element so later content is no longer part of this region. */}
        </section>

        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="space-y-6">
          {/* Starts the <section> element to group related content into a meaningful region. */}
          <section className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-6 shadow-sm"><h2 className="flex items-center gap-2 font-semibold text-[#323232]"><PackageCheck size={18} />Available at this site</h2><div className="mt-4 flex flex-wrap gap-2">{inventory.map((row) => <span key={row.materialId} className="rounded-full border border-[#E8DCD4] bg-[#F7F3EE] px-3 py-1.5 text-xs text-[#595552]">{row.materialName}: <strong>{formatQty(row.availableStock)} {row.unit}</strong></span>)}{!loading && availableRows.length === 0 && <p className="text-sm text-[#8E827A]">{inventory.length ? 'No positive stock balances are available to issue.' : 'No project inventory records.'}</p>}</div></section>
          {/* Starts the <section> element to group related content into a meaningful region. */}
          <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white"><div className="border-b border-[#E8DCD4] p-5"><h2 className="font-semibold text-[#323232]">Recent Stock OUT</h2><p className="mt-1 text-xs text-[#8E827A]">Showing recent issues · {historyCount} transactions loaded</p></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left"><thead className="bg-[#F7F3EE] text-xs text-[#8E827A]"><tr><th className="px-5 py-4 font-medium">Date</th><th className="px-5 py-4 font-medium">Material</th><th className="px-5 py-4 font-medium">Qty</th><th className="px-5 py-4 font-medium">Reason</th><th className="px-5 py-4 font-medium">Recorded By</th></tr></thead><tbody className="divide-y divide-[#E8DCD4]">{recentOut.map((transaction) => <tr key={transaction.id}><td className="px-5 py-4 text-sm">{transaction.txnDate.slice(0, 10)}</td><td className="px-5 py-4 text-sm font-medium">{transaction.material.name}{transaction.remarks && <span className="block text-xs font-normal text-[#8E827A]">{transaction.remarks}</span>}</td><td className="px-5 py-4 text-sm text-[#9A7950]">−{formatQty(Number(transaction.quantity))} {transaction.material.unit}</td><td className="px-5 py-4 text-sm">{transaction.outReason ?? '—'}</td><td className="px-5 py-4 text-sm">{transaction.createdBy.name}</td></tr>)}{loading && <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-[#8E827A]">Loading transactions…</td></tr>}{!loading && recentOut.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-[#8E827A]">No stock issues returned for this project.</td></tr>}</tbody></table></div></section>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
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
