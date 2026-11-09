import { useEffect, useMemo, useState } from 'react'
import { ScrollText, Search, Ban, X, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import { isAdmin } from '../../authentication/utils/permissions'
import type { Material } from '../../materials/types/material'
import { getStoredMaterials } from '../../materials/data/materialStore'
import type { StockTransaction } from '../types/stock'
import {
  formatDate,
  formatINR,
  formatQty,
  getStoredStockTransactions,
  voidStockTransaction,
} from '../data/stockStore'

type Project = {
  id: number
  code: string
  name: string
}

const PAGE_SIZE = 15

export function StockLedgerPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [materials] = useState<Material[]>(() => getStoredMaterials())
  const [transactions, setTransactions] = useState<StockTransaction[]>(() => getStoredStockTransactions())
  const [projectFilter, setProjectFilter] = useState('All')
  const [materialFilter, setMaterialFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [showVoided, setShowVoided] = useState(true)
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [voidTarget, setVoidTarget] = useState<StockTransaction | null>(null)
  const [voidReason, setVoidReason] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('forgeos_projects')
      setProjects(saved ? JSON.parse(saved) : [])
    } catch {
      setProjects([])
    }
  }, [])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [showVoided, projectFilter, materialFilter, typeFilter, fromDate, toDate, search])

  const filtered = useMemo(() => {
    return transactions
      .filter((tx) => (showVoided ? true : !tx.voided))
      .filter((tx) => (projectFilter === 'All' ? true : tx.projectId === projectFilter))
      .filter((tx) => (materialFilter === 'All' ? true : tx.materialId === materialFilter))
      .filter((tx) => (typeFilter === 'All' ? true : tx.type === typeFilter))
      .filter((tx) => (fromDate ? tx.date >= fromDate : true))
      .filter((tx) => (toDate ? tx.date <= toDate : true))
      .filter((tx) => {
        if (!search.trim()) return true
        const query = search.toLowerCase()
        return `${tx.materialName} ${tx.projectName} ${tx.vendorName ?? ''} ${tx.challanNumber ?? ''} ${tx.notes ?? ''} ${tx.id}`.toLowerCase().includes(query)
      })
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.createdAt < b.createdAt ? 1 : -1))
  }, [transactions, showVoided, projectFilter, materialFilter, typeFilter, fromDate, toDate, search])

  const totals = useMemo(() => {
    let totalIn = 0
    let totalOut = 0
    let voidedCount = 0
    for (const tx of filtered) {
      if (tx.voided) {
        voidedCount += 1
        continue
      }
      if (tx.type === 'IN') totalIn += tx.quantity
      else totalOut += tx.quantity
    }
    return { totalIn, totalOut, voidedCount }
  }, [filtered])

  const confirmVoid = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!voidTarget) return
    const result = voidStockTransaction(voidTarget.id, voidReason, isAdmin())
    if (result.ok) {
      setTransactions(getStoredStockTransactions())
      setError('')
    } else {
      setError(result.error)
    }
    setVoidTarget(null)
    setVoidReason('')
  }

  return (
    <AppShell currentPath="/app/stock-ledger">
      <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-[#8E827A]">Workspace / Stock / Ledger</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">Stock Ledger</h1>
            <p className="mt-2 text-sm text-[#8E827A]">Complete transaction history. Voided rows are struck through and excluded from balances.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#F1EAF6] px-4 py-2 text-sm font-medium text-[#806B96]">
            <ScrollText size={16} /> {filtered.length} entries
          </span>
        </section>

        {error && <p className="rounded-xl bg-[#F8ECEA] px-4 py-3 text-sm text-[#9B625A]">{error}</p>}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total IN (filtered)', value: formatQty(totals.totalIn), icon: ArrowDownToLine },
            { label: 'Total OUT (filtered)', value: formatQty(totals.totalOut), icon: ArrowUpFromLine },
            { label: 'Voided rows', value: String(totals.voidedCount), icon: Ban },
            { label: 'Net movement', value: formatQty(totals.totalIn - totals.totalOut), icon: ScrollText },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8E827A]">{stat.label}</p>
                    <h2 className="mt-3 text-2xl font-semibold text-[#323232]">{stat.value}</h2>
                  </div>
                  <div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]"><Icon size={21} /></div>
                </div>
              </div>
            )
          })}
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
          <div className="flex flex-col gap-4 border-b border-[#E8DCD4] p-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <label className="text-xs font-medium text-[#8E827A]">Project
                <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#C8BCB4] bg-white px-3 py-2 text-sm font-normal text-[#595552] outline-none">
                  <option>All</option>
                  {projects.map((project) => (
                    <option key={project.id} value={String(project.id)}>{project.code} — {project.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-[#8E827A]">Material
                <select value={materialFilter} onChange={(e) => setMaterialFilter(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#C8BCB4] bg-white px-3 py-2 text-sm font-normal text-[#595552] outline-none">
                  <option>All</option>
                  {materials.map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}
                </select>
              </label>
              <label className="text-xs font-medium text-[#8E827A]">Type
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#C8BCB4] bg-white px-3 py-2 text-sm font-normal text-[#595552] outline-none">
                  <option>All</option>
                  <option value="IN">Stock IN</option>
                  <option value="OUT">Stock OUT</option>
                </select>
              </label>
              <label className="text-xs font-medium text-[#8E827A]">From date
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#C8BCB4] px-3 py-2 text-sm font-normal text-[#595552] outline-none" />
              </label>
              <label className="text-xs font-medium text-[#8E827A]">To date
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#C8BCB4] px-3 py-2 text-sm font-normal text-[#595552] outline-none" />
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-[#8E827A] xl:mt-5">
                <input type="checkbox" checked={showVoided} onChange={(e) => setShowVoided(e.target.checked)} className="h-4 w-4" />
                Show voided entries
              </label>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[#C8BCB4] px-3 py-2">
              <Search size={17} className="text-[#8E827A]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search challan, vendor, notes..." className="w-full bg-transparent text-sm outline-none xl:w-52" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left">
              <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]">
                <tr>
                  <th className="px-5 py-4 font-medium">Date</th>
                  <th className="px-5 py-4 font-medium">Type</th>
                  <th className="px-5 py-4 font-medium">Project</th>
                  <th className="px-5 py-4 font-medium">Material</th>
                  <th className="px-5 py-4 font-medium">Qty</th>
                  <th className="px-5 py-4 font-medium">Rate</th>
                  <th className="px-5 py-4 font-medium">Details</th>
                  <th className="px-5 py-4 font-medium">Recorded By</th>
                  <th className="px-5 py-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCD4]">
                {filtered.slice(0, visibleCount).map((tx) => (
                  <tr key={tx.id} className={`hover:bg-[#F7F3EE]/60 ${tx.voided ? 'opacity-60' : ''}`}>
                    <td className="px-5 py-4 text-sm text-[#595552]">
                      <span className={tx.voided ? 'line-through' : ''}>{formatDate(tx.date)}</span>
                      <span className="block text-xs text-[#8E827A]">{tx.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tx.type === 'IN' ? 'bg-[#E8EFE5] text-[#617858]' : 'bg-[#F5EDE1] text-[#9A7950]'}`}>
                        {tx.type === 'IN' ? <ArrowDownToLine size={12} /> : <ArrowUpFromLine size={12} />} {tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#595552]">{tx.projectCode}</td>
                    <td className="px-5 py-4 text-sm font-medium text-[#323232]">
                      <span className={tx.voided ? 'line-through' : ''}>{tx.materialName}</span>
                    </td>
                    <td className={`px-5 py-4 text-sm ${tx.type === 'IN' ? 'text-[#617858]' : 'text-[#9A7950]'}`}>
                      {tx.type === 'IN' ? '+' : '−'}{formatQty(tx.quantity)} {tx.materialUnit}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#595552]">{tx.rate != null ? formatINR(tx.rate) : '—'}</td>
                    <td className="px-5 py-4 text-sm text-[#595552]">
                      {tx.type === 'IN'
                        ? <span>{tx.vendorName ?? '—'}{tx.challanNumber ? ` · ${tx.challanNumber}` : ''}{tx.billReference ? ` · Bill ${tx.billReference}` : ''}</span>
                        : <span>{tx.reason ?? '—'}{tx.notes ? ` · ${tx.notes}` : ''}</span>}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#595552]">{tx.recordedBy}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        {tx.voided ? (
                          <span className="rounded-full bg-[#F8ECEA] px-2.5 py-1 text-xs font-medium text-[#9B625A]" title={tx.voidReason}>Voided</span>
                        ) : (
                          <button onClick={() => { setVoidTarget(tx); setVoidReason('') }} title="Void entry" className="rounded-lg p-2 text-[#9B625A] hover:bg-[#F8ECEA]"><Ban size={15} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-[#8E827A]">No ledger entries match the current filters.</td></tr>}
              </tbody>
            </table>
          </div>

          {visibleCount < filtered.length && (
            <div className="border-t border-[#E8DCD4] p-4 text-center">
              <button onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="rounded-xl border border-[#C8BCB4] px-5 py-2.5 text-sm text-[#595552] hover:bg-[#F7F3EE]">
                Load more ({filtered.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </section>
      </div>

      {voidTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form onSubmit={confirmVoid} className="my-6 w-full max-w-lg space-y-5 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#323232]">Void Ledger Entry</h2>
                <p className="mt-1 text-sm text-[#8E827A]">{voidTarget.id} · {voidTarget.type} · {formatQty(voidTarget.quantity)} {voidTarget.materialUnit} {voidTarget.materialName}</p>
              </div>
              <button type="button" onClick={() => setVoidTarget(null)} className="rounded-lg p-2 text-[#8E827A] hover:bg-[#F7F3EE]"><X size={19} /></button>
            </div>
            <p className="rounded-xl bg-[#F5EDE1] px-4 py-3 text-xs text-[#9A7950]">
              Voiding keeps the row for audit but removes it from balances. Admin can void anytime; PM entries only within 48 hours.
            </p>
            <label className="block text-sm font-medium text-[#595552]">Reason (required)
              <input required value={voidReason} onChange={(e) => setVoidReason(e.target.value)} placeholder="e.g. Duplicate entry" className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 font-normal outline-none" />
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setVoidTarget(null)} className="rounded-xl border border-[#C8BCB4] px-4 py-2.5 text-sm text-[#595552]">Cancel</button>
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#9B625A] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#84504A]"><Ban size={15} /> Void Entry</button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  )
}
