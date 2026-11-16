// Imports useEffect, useMemo, useState, type FormEvent from react so this module can reuse that component, helper, or library.
import { useEffect, useMemo, useState, type FormEvent } from 'react'
// Imports ScrollText, ArrowDownToLine, ArrowUpFromLine, Scale, RefreshCw from lucide-react so this module can reuse that component, helper, or library.
import { ScrollText, ArrowDownToLine, ArrowUpFromLine, Scale, RefreshCw } from 'lucide-react'
// Imports AppShell from ../../app-shell/components/AppShell so this module can reuse that component, helper, or library.
import { AppShell } from '../../app-shell/components/AppShell'
// Imports useProjects from ../../projects/useProjects so this module can reuse that component, helper, or library.
import { useProjects } from '../../projects/useProjects'
// Imports ApiError from ../../../lib/api so this module can reuse that component, helper, or library.
import { ApiError } from '../../../lib/api'
// Continues the component or data expression so its related values and behavior stay grouped together.
import {
  // Continues the component or data expression so its related values and behavior stay grouped together.
  createStockTransaction,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  fetchProjectInventory,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  fetchTransactions,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type InventoryRow,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type StockTransaction,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type TransactionType,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  type AdjustmentDirection,
// Continues the component or data expression so its related values and behavior stay grouped together.
} from '../data/inventoryApi'
// Imports formatQty, todayISO from ../data/formatting so this module can reuse that component, helper, or library.
import { formatQty, todayISO } from '../data/formatting'

// Stores the value in initialForm so later lines can reuse this data or behavior for the current feature.
const initialForm = { materialId: '', quantity: '', direction: 'INCREASE' as AdjustmentDirection, txnDate: todayISO(), remarks: '' }

// Defines StockLedgerPage so this module can perform its named task when needed.
export function StockLedgerPage() {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const { projects, selectedProject, selectedProjectId, selectProject, isLoading: projectsLoading, error: projectsError, retry: retryProjects } = useProjects()
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [inventory, setInventory] = useState<InventoryRow[]>([])
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [typeFilter, setTypeFilter] = useState<'All' | TransactionType>('All')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [materialFilter, setMaterialFilter] = useState('All')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [from, setFrom] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [to, setTo] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [includeVoided, setIncludeVoided] = useState(true)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [search, setSearch] = useState('')
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  const [showAdjustment, setShowAdjustment] = useState(false)
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
      fetchTransactions(selectedProjectId, {
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ...(materialFilter === 'All' ? {} : { materialId: Number(materialFilter) }),
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ...(typeFilter === 'All' ? {} : { txnType: typeFilter }),
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ...(from ? { from } : {}),
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ...(to ? { to } : {}),
        // Continues the component or data expression so its related values and behavior stay grouped together.
        includeVoided,
      // Continues the component or data expression so its related values and behavior stay grouped together.
      }, controller.signal),
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
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load the stock ledger.')
    // Continues the component or data expression so its related values and behavior stay grouped together.
    }).finally(() => {
      // Checks this condition before continuing so the code can choose the correct path for the current state.
      if (!controller.signal.aborted) setLoading(false)
    // Continues the component or data expression so its related values and behavior stay grouped together.
    })
    // Returns the result so the caller or React receives the value or interface this function provides.
    return () => controller.abort()
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }, [selectedProjectId, materialFilter, typeFilter, from, to, includeVoided, retry])

  // Caches filtered so its calculation is repeated only when its inputs change.
  // Caches filtered so its calculation is repeated only when its inputs change.
  const filtered = useMemo(() => transactions.filter((transaction) => {
    // Stores the value in query so later lines can reuse this data or behavior for the current feature.
    const query = search.trim().toLowerCase()
    // Returns the result so the caller or React receives the value or interface this function provides.
    return !query || `${transaction.material.name} ${transaction.challanNumber ?? ''} ${transaction.remarks ?? ''} ${transaction.createdBy.name} ${transaction.id}`.toLowerCase().includes(query)
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }), [transactions, search])
  // Stores the value in activeTransactions so later lines can reuse this data or behavior for the current feature.
  const activeTransactions = filtered.filter((transaction) => !transaction.isVoided)
  // Stores the value in totalIn so later lines can reuse this data or behavior for the current feature.
  const totalIn = activeTransactions.filter((transaction) => transaction.txnType === 'IN').reduce((sum, transaction) => sum + Number(transaction.quantity), 0)
  // Stores the value in totalOut so later lines can reuse this data or behavior for the current feature.
  const totalOut = activeTransactions.filter((transaction) => transaction.txnType === 'OUT').reduce((sum, transaction) => sum + Number(transaction.quantity), 0)
  // Stores the value in adjustmentNet so later lines can reuse this data or behavior for the current feature.
  const adjustmentNet = activeTransactions.filter((transaction) => transaction.txnType === 'ADJUSTMENT').reduce(
    // Continues the component or data expression so its related values and behavior stay grouped together.
    (sum, transaction) => sum + (transaction.adjustmentDirection === 'INCREASE' ? 1 : -1) * Number(transaction.quantity),
    // Continues the component or data expression so its related values and behavior stay grouped together.
    0,
  // Closes this function call or grouped expression so the surrounding code can continue.
  )
  // Stores the value in selectedMaterial so later lines can reuse this data or behavior for the current feature.
  const selectedMaterial = inventory.find((row) => row.materialId === Number(form.materialId))

  // Stores the value in postAdjustment so later lines can reuse this data or behavior for the current feature.
  const postAdjustment = async (event: FormEvent<HTMLFormElement>) => {
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
        materialId: selectedMaterial.materialId,
        // Sets the txnType field so the surrounding object or component receives this setting.
        txnType: 'ADJUSTMENT',
        // Sets the quantity field so the surrounding object or component receives this setting.
        quantity: Number(form.quantity),
        // Sets the txnDate field so the surrounding object or component receives this setting.
        txnDate: form.txnDate,
        // Sets the adjustmentDirection field so the surrounding object or component receives this setting.
        adjustmentDirection: form.direction,
        // Continues the component or data expression so its related values and behavior stay grouped together.
        ...(form.remarks.trim() ? { remarks: form.remarks.trim() } : {}),
      // Continues the component or data expression so its related values and behavior stay grouped together.
      })
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSuccess(`Stock adjustment recorded for ${selectedMaterial.materialName}.`)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setForm({ ...initialForm, txnDate: todayISO() })
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setShowAdjustment(false)
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      refresh()
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } catch (cause) {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setError(cause instanceof ApiError ? cause.message : 'Unable to record the adjustment.')
    // Continues the component or data expression so its related values and behavior stay grouped together.
    } finally {
      // Calls this helper or component so the feature can perform the operation or render the control represented here.
      setSaving(false)
    // Closes the current block or object so the grouped statements or settings end here.
    }
  // Closes the current block or object so the grouped statements or settings end here.
  }

  // Returns the result so the caller or React receives the value or interface this function provides.
  return <AppShell currentPath="/app/stock-ledger">
    {/* Starts the <div> element to organize this part of the interface. */}
    <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
      {/* Starts the <header> element to organize this part of the interface. */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm text-[#8E827A]">Workspace / Stock / Ledger</p><h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Stock Ledger</h1><p className="mt-2 text-sm text-[#8E827A]">Project stock transaction history from the backend.</p></div><div className="flex gap-2"><span className="inline-flex items-center gap-2 rounded-full bg-[#F1EAF6] px-4 py-2 text-sm font-medium text-[#806B96]"><ScrollText size={16} />{filtered.length} entries</span><button type="button" onClick={() => { setShowAdjustment(true); setError(null); setSuccess('') }} disabled={!selectedProjectId} className="rounded-xl bg-[#323232] px-4 py-2 text-sm text-white disabled:opacity-50"><Scale className="mr-1 inline h-4 w-4" />Adjustment</button></div></header>
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="flex flex-wrap gap-3"><select aria-label="Project" value={selectedProjectId} onChange={(event) => selectProject(event.target.value)} disabled={projectsLoading || !projects.length} className="rounded-xl border border-[#C8BCB4] bg-white px-4 py-3 text-sm">{projects.map((project) => <option key={project.id} value={String(project.id)}>{project.code} — {project.name}</option>)}</select><button type="button" onClick={refresh} className="rounded-xl border border-[#C8BCB4] px-4 py-3 text-sm"><RefreshCw className="mr-1 inline h-4 w-4" />Refresh</button></div>
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {projectsError && <Banner message={projectsError} retry={retryProjects} />}{error && <Banner message={error} retry={refresh} />}{success && <p role="status" className="rounded-xl bg-[#E8EFE5] px-4 py-3 text-sm text-[#617858]">{success}</p>}
      {/* Starts the <section> element to group related content into a meaningful region. */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{ label: 'Total IN (filtered)', value: formatQty(totalIn), icon: ArrowDownToLine }, { label: 'Total OUT (filtered)', value: formatQty(totalOut), icon: ArrowUpFromLine }, { label: 'Net movement incl. adjustments', value: formatQty(totalIn - totalOut + adjustmentNet), icon: ScrollText }, { label: 'Transactions', value: String(filtered.length), icon: Scale }].map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5"><p className="text-sm text-[#8E827A]">{label}</p><div className="mt-3 flex items-center justify-between"><strong className="text-2xl text-[#323232]">{loading ? '—' : value}</strong><Icon size={20} className="text-[#595552]" /></div></div>)}</section>

      {/* Starts the <section> element to group related content into a meaningful region. */}
      <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="grid gap-3 border-b border-[#E8DCD4] p-5 sm:grid-cols-2 xl:grid-cols-5">
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="text-xs font-medium text-[#8E827A]">Material<select value={materialFilter} onChange={(event) => setMaterialFilter(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#C8BCB4] bg-white px-3 py-2 text-sm"><option>All</option>{inventory.map((row) => <option key={row.materialId} value={row.materialId}>{row.materialName}</option>)}</select></label>
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="text-xs font-medium text-[#8E827A]">Transaction type<select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as 'All' | TransactionType)} className="mt-1.5 w-full rounded-xl border border-[#C8BCB4] bg-white px-3 py-2 text-sm"><option>All</option><option value="IN">IN</option><option value="OUT">OUT</option><option value="ADJUSTMENT">ADJUSTMENT</option></select></label>
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="text-xs font-medium text-[#8E827A]">From<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#C8BCB4] px-3 py-2 text-sm" /></label>
          {/* Starts the <label> element to name a form control for users and assistive technology. */}
          <label className="text-xs font-medium text-[#8E827A]">To<input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#C8BCB4] px-3 py-2 text-sm" /></label>
          {/* Starts the <div> element to organize this part of the interface. */}
          <div className="flex flex-col justify-end gap-2"><label className="flex items-center gap-2 text-xs text-[#8E827A]"><input type="checkbox" checked={includeVoided} onChange={(event) => setIncludeVoided(event.target.checked)} />Include voided</label><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reference, remarks…" className="rounded-xl border border-[#C8BCB4] px-3 py-2 text-sm" /></div>
        {/* Closes the <div> element so later content is no longer part of this region. */}
        </div>
        {/* Starts the <div> element to organize this part of the interface. */}
        <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left"><thead className="bg-[#F7F3EE] text-xs text-[#8E827A]"><tr><th className="px-5 py-4 font-medium">Date</th><th className="px-5 py-4 font-medium">Type</th><th className="px-5 py-4 font-medium">Material</th><th className="px-5 py-4 font-medium">Quantity</th><th className="px-5 py-4 font-medium">Details</th><th className="px-5 py-4 font-medium">Rate</th><th className="px-5 py-4 font-medium">Recorded By</th><th className="px-5 py-4 font-medium">State</th></tr></thead><tbody className="divide-y divide-[#E8DCD4]">
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {filtered.map((transaction) => <tr key={transaction.id} className={transaction.isVoided ? 'opacity-60' : ''}><td className="px-5 py-4 text-sm">{transaction.txnDate.slice(0, 10)}<span className="block text-xs text-[#8E827A]">#{transaction.id}</span></td><td className="px-5 py-4 text-sm">{transaction.txnType}</td><td className="px-5 py-4 text-sm font-medium">{transaction.material.name}</td><td className="px-5 py-4 text-sm">{transaction.txnType === 'IN' || transaction.adjustmentDirection === 'INCREASE' ? '+' : '−'}{formatQty(Number(transaction.quantity))} {transaction.material.unit}</td><td className="px-5 py-4 text-sm">{transaction.outReason ?? transaction.adjustmentDirection ?? transaction.challanNumber ?? '—'}{transaction.remarks ? ` · ${transaction.remarks}` : ''}</td><td className="px-5 py-4 text-sm">{transaction.unitRate == null ? '—' : Number(transaction.unitRate).toLocaleString('en-IN')}</td><td className="px-5 py-4 text-sm">{transaction.createdBy.name}</td><td className="px-5 py-4 text-sm">{transaction.isVoided ? `Voided${transaction.voidReason ? `: ${transaction.voidReason}` : ''}` : 'Active'}</td></tr>)}
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {loading && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-[#8E827A]">Loading transactions…</td></tr>}
          {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
          {!loading && !error && filtered.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-[#8E827A]">No ledger entries match these filters.</td></tr>}
        {/* Closes the <tbody> element so later content is no longer part of this region. */}
        </tbody></table></div>
        {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
        {!loading && <p className="border-t border-[#E8DCD4] p-4 text-xs text-[#8E827A]">Transaction voiding is not exposed by the current API; entries cannot be voided here.</p>}
      {/* Closes the <section> element so later content is no longer part of this region. */}
      </section>
    {/* Closes the <div> element so later content is no longer part of this region. */}
    </div>
    {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
    {showAdjustment && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><form onSubmit={(event) => void postAdjustment(event)} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl">
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">Stock Adjustment</h2><p className="mt-1 text-sm text-[#8E827A]">{selectedProject?.code} · adjust a planned material balance</p></div><button type="button" onClick={() => setShowAdjustment(false)} className="text-sm">Close</button></div>
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {error && <p role="alert" className="rounded-lg bg-[#F8ECEA] p-3 text-sm text-[#9B625A]">{error}</p>}
      {/* Starts the <label> element to name a form control for users and assistive technology. */}
      <label className="block text-sm">Material<select required value={form.materialId} onChange={(event) => setForm({ ...form, materialId: event.target.value })} className="mt-1 w-full rounded-lg border p-3"><option value="">Select material</option>{inventory.map((row) => <option key={row.materialId} value={row.materialId}>{row.materialName} · {formatQty(row.availableStock)} {row.unit} available</option>)}</select></label>
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {selectedMaterial && <p className="text-xs text-[#8E827A]">Current balance: {formatQty(selectedMaterial.availableStock)} {selectedMaterial.unit}</p>}
      {/* Starts the <div> element to organize this part of the interface. */}
      <div className="grid grid-cols-2 gap-3"><label className="block text-sm">Direction<select value={form.direction} onChange={(event) => setForm({ ...form, direction: event.target.value as AdjustmentDirection })} className="mt-1 w-full rounded-lg border p-3"><option value="INCREASE">Increase</option><option value="DECREASE">Decrease</option></select></label><label className="block text-sm">Quantity<input required type="number" min="0.001" step="0.001" max={form.direction === 'DECREASE' ? selectedMaterial?.availableStock : undefined} value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} className="mt-1 w-full rounded-lg border p-3" /></label></div>
      {/* Adds this JSX content to the surrounding interface so related information or controls appear in the right place. */}
      {selectedMaterial && form.direction === 'DECREASE' && Number(form.quantity) > selectedMaterial.availableStock && <p role="alert" className="rounded-lg bg-[#F8ECEA] p-3 text-sm text-[#9B625A]">Adjustment exceeds available stock ({formatQty(selectedMaterial.availableStock)} {selectedMaterial.unit}).</p>}
      {/* Starts the <label> element to name a form control for users and assistive technology. */}
      <label className="block text-sm">Date<input required type="date" max={todayISO()} value={form.txnDate} onChange={(event) => setForm({ ...form, txnDate: event.target.value })} className="mt-1 w-full rounded-lg border p-3" /></label>
      {/* Starts the <label> element to name a form control for users and assistive technology. */}
      <label className="block text-sm">Remarks (optional)<textarea maxLength={1000} value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} className="mt-1 w-full rounded-lg border p-3" /></label>
      {/* Starts the <button> element to provide an action the user can activate. */}
      <button disabled={saving || !selectedMaterial || Number(form.quantity) <= 0 || (form.direction === 'DECREASE' && Number(form.quantity) > (selectedMaterial?.availableStock ?? 0))} type="submit" className="rounded-xl bg-[#323232] px-4 py-2.5 text-sm text-white disabled:opacity-50">{saving ? 'Posting…' : 'Post adjustment'}</button>
    {/* Closes the <form> element so later content is no longer part of this region. */}
    </form></div>}
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
