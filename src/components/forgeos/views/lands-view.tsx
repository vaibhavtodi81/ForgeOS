'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MapPin, Plus } from 'lucide-react'
import type { LandRow, SessionUser } from '@/lib/forgeos-types'
import { api, ApiError } from '@/lib/client-api'
import { formatQty } from '@/lib/format'
import { EmptyState, ErrorState, LoadingRows, PageHeader } from '@/components/forgeos/ui-bits'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function LandsView({ user }: { user: SessionUser }) {
  const isAdmin = user.role === 'ADMIN'
  const [addOpen, setAddOpen] = useState(false)

  const landsQuery = useQuery({
    queryKey: ['lands'],
    queryFn: () => api<{ items: LandRow[] }>('/api/lands'),
  })

  const lands = landsQuery.data?.items ?? []

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Lands" description="Land parcels and plots under development.">
        {isAdmin ? (
          <Button onClick={() => setAddOpen(true)}>
            <Plus aria-hidden /> Add Land
          </Button>
        ) : null}
      </PageHeader>

      {landsQuery.isLoading ? (
        <LoadingRows rows={6} />
      ) : landsQuery.isError ? (
        <ErrorState
          message={landsQuery.error instanceof Error ? landsQuery.error.message : 'Failed to load lands'}
          onRetry={() => void landsQuery.refetch()}
        />
      ) : lands.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No lands yet"
          description={isAdmin ? 'Add the first land parcel to get started.' : 'Lands will appear here once added.'}
        />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Land</TableHead>
                <TableHead className="text-right">Area</TableHead>
                <TableHead>Khasra / Survey No.</TableHead>
                <TableHead className="text-right">Projects</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lands.map((land) => (
                <TableRow key={land.id}>
                  <TableCell>
                    <p className="text-sm font-medium">{land.name}</p>
                    <p className="text-xs text-muted-foreground">{land.location}</p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right tabular-nums">
                    {land.areaSqft != null ? `${formatQty(land.areaSqft)} sq ft` : '—'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {land.khasraNumber ?? '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{land.projectCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddLandDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Add land dialog
// ---------------------------------------------------------------------------

function AddLandDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [areaSqft, setAreaSqft] = useState('')
  const [khasraNumber, setKhasraNumber] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function close() {
    setName('')
    setLocation('')
    setAreaSqft('')
    setKhasraNumber('')
    setSubmitted(false)
    onOpenChange(false)
  }

  const nameError = name.trim() === '' ? 'Name is required' : null
  const locationError = location.trim() === '' ? 'Location is required' : null
  const areaNum = parseFloat(areaSqft)
  const areaError =
    areaSqft.trim() === ''
      ? null
      : isNaN(areaNum) || areaNum <= 0
        ? 'Enter a valid area in sq ft'
        : null
  const valid = nameError === null && locationError === null && areaError === null

  const createMutation = useMutation({
    mutationFn: () =>
      api('/api/lands', {
        method: 'POST',
        body: {
          name: name.trim(),
          location: location.trim(),
          areaSqft: areaSqft.trim() === '' ? null : areaNum,
          khasraNumber: khasraNumber.trim() || null,
        },
      }),
    onSuccess: () => {
      toast.success('Land added')
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
          <DialogTitle>Add Land</DialogTitle>
          <DialogDescription>
            Record a parcel or plot so projects can be mapped to it.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="land-name">Name</Label>
            <Input
              id="land-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Green Valley Plot 3"
            />
            {submitted && nameError ? (
              <p className="text-sm text-red-600 dark:text-red-400">{nameError}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="land-location">Location</Label>
            <Input
              id="land-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Village, city or locality"
            />
            {submitted && locationError ? (
              <p className="text-sm text-red-600 dark:text-red-400">{locationError}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="land-area">Area (sq ft, optional)</Label>
              <Input
                id="land-area"
                type="number"
                min="0"
                inputMode="decimal"
                value={areaSqft}
                onChange={(e) => setAreaSqft(e.target.value)}
                placeholder="e.g. 7200"
              />
              {submitted && areaError ? (
                <p className="text-sm text-red-600 dark:text-red-400">{areaError}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="land-khasra">Khasra / survey no. (optional)</Label>
              <Input
                id="land-khasra"
                value={khasraNumber}
                onChange={(e) => setKhasraNumber(e.target.value)}
                placeholder="e.g. 142/3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adding…' : 'Add Land'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
