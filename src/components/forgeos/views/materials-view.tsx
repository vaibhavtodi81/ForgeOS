'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Search } from 'lucide-react'
import type { MaterialRow, SessionUser } from '@/lib/forgeos-types'
import { BADGE_CLASSES } from '@/lib/forgeos-types'
import { api, ApiError } from '@/lib/client-api'
import { formatMoney } from '@/lib/format'
import { EmptyState, ErrorState, LoadingRows, PageHeader } from '@/components/forgeos/ui-bits'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function MaterialsView({ user }: { user: SessionUser }) {
  const isAdmin = user.role === 'ADMIN'
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const materialsQuery = useQuery({
    queryKey: ['materials'],
    queryFn: () => api<{ items: MaterialRow[] }>('/api/materials'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api(`/api/materials/${id}`, { method: 'PATCH', body: { isActive } }),
    onSuccess: (_data, vars) => {
      toast.success(vars.isActive ? 'Material activated' : 'Material deactivated')
      void queryClient.invalidateQueries()
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong'),
  })

  const materials = useMemo(() => {
    const items = materialsQuery.data?.items ?? []
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (m) => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q),
    )
  }, [materialsQuery.data, search])

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Materials"
        description="The master material catalogue with units and last purchase rates."
      >
        {isAdmin ? (
          <Button onClick={() => setAddOpen(true)}>
            <Plus aria-hidden /> Add Material
          </Button>
        ) : null}
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or category"
          aria-label="Search materials"
        />
      </div>

      {materialsQuery.isLoading ? (
        <LoadingRows rows={8} />
      ) : materialsQuery.isError ? (
        <ErrorState
          message={materialsQuery.error instanceof Error ? materialsQuery.error.message : 'Failed to load materials'}
          onRetry={() => void materialsQuery.refetch()}
        />
      ) : materials.length === 0 ? (
        <EmptyState
          title={search.trim() === '' ? 'No materials yet' : 'No matching materials'}
          description={
            search.trim() === ''
              ? isAdmin
                ? 'Add the first material to the catalogue.'
                : 'Materials will appear here once added.'
              : 'Try a different search term.'
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Last Rate</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.category}</p>
                  </TableCell>
                  <TableCell className="text-sm">{m.unit}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {m.lastRate != null ? formatMoney(m.lastRate) : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={m.isActive}
                        disabled={!isAdmin || toggleMutation.isPending}
                        onCheckedChange={(isActive) => toggleMutation.mutate({ id: m.id, isActive })}
                        aria-label={`Toggle ${m.name}`}
                      />
                      {!m.isActive ? (
                        <Badge variant="outline" className={`whitespace-nowrap ${BADGE_CLASSES.VOID}`}>
                          Inactive
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddMaterialDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Add material dialog
// ---------------------------------------------------------------------------

function AddMaterialDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [category, setCategory] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function close() {
    setName('')
    setUnit('')
    setCategory('')
    setSubmitted(false)
    onOpenChange(false)
  }

  const nameError = name.trim() === '' ? 'Name is required' : null
  const unitError = unit.trim() === '' ? 'Unit is required' : null
  const categoryError = category.trim() === '' ? 'Category is required' : null
  const valid = nameError === null && unitError === null && categoryError === null

  const createMutation = useMutation({
    mutationFn: () =>
      api('/api/materials', {
        method: 'POST',
        body: { name: name.trim(), unit: unit.trim(), category: category.trim() },
      }),
    onSuccess: () => {
      toast.success('Material added')
      void queryClient.invalidateQueries()
      close()
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong'),
  })

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (!valid) return
    createMutation.mutate()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close()
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Material</DialogTitle>
          <DialogDescription>
            Master materials are used across plans and inventory transactions.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="material-name">Name</Label>
            <Input
              id="material-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="OPC 53 grade cement"
            />
            {submitted && nameError ? (
              <p className="text-sm text-red-600 dark:text-red-400">{nameError}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="material-unit">Unit</Label>
              <Input
                id="material-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="bag, tonne, cft…"
              />
              {submitted && unitError ? (
                <p className="text-sm text-red-600 dark:text-red-400">{unitError}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="material-category">Category</Label>
              <Input
                id="material-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Structure, Masonry, Finishing…"
              />
              {submitted && categoryError ? (
                <p className="text-sm text-red-600 dark:text-red-400">{categoryError}</p>
              ) : null}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adding…' : 'Add Material'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
