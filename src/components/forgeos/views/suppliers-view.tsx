'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Truck } from 'lucide-react'
import type { SessionUser, SupplierRow } from '@/lib/forgeos-types'
import { api, ApiError } from '@/lib/client-api'
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
import { Textarea } from '@/components/ui/textarea'

export default function SuppliersView({ user }: { user: SessionUser }) {
  const isAdmin = user.role === 'ADMIN'
  const [addOpen, setAddOpen] = useState(false)

  const suppliersQuery = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => api<{ items: SupplierRow[] }>('/api/suppliers'),
  })

  const suppliers = suppliersQuery.data?.items ?? []

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Suppliers" description="Vendors who supply your sites.">
        {isAdmin ? (
          <Button onClick={() => setAddOpen(true)}>
            <Plus aria-hidden /> Add Supplier
          </Button>
        ) : null}
      </PageHeader>

      {suppliersQuery.isLoading ? (
        <LoadingRows rows={6} />
      ) : suppliersQuery.isError ? (
        <ErrorState
          message={suppliersQuery.error instanceof Error ? suppliersQuery.error.message : 'Failed to load suppliers'}
          onRetry={() => void suppliersQuery.refetch()}
        />
      ) : suppliers.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No suppliers yet"
          description={isAdmin ? 'Add the first supplier to get started.' : 'Suppliers will appear here once added.'}
        />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Supply Txns</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="text-sm font-medium">{supplier.name}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm tabular-nums">
                    {supplier.phone}
                  </TableCell>
                  <TableCell className="text-sm">{supplier.email ?? '—'}</TableCell>
                  <TableCell className="max-w-[240px] truncate text-sm text-muted-foreground">
                    {supplier.address ?? '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{supplier.txnCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddSupplierDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Add supplier dialog
// ---------------------------------------------------------------------------

function AddSupplierDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function close() {
    setName('')
    setPhone('')
    setEmail('')
    setAddress('')
    setSubmitted(false)
    onOpenChange(false)
  }

  const nameError = name.trim() === '' ? 'Name is required' : null
  const phoneError = phone.trim() === '' ? 'Phone is required' : null
  const emailError =
    email.trim() === '' ? null : !/^\S+@\S+\.\S+$/.test(email) ? 'Enter a valid email' : null
  const valid = nameError === null && phoneError === null && emailError === null

  const createMutation = useMutation({
    mutationFn: () =>
      api('/api/suppliers', {
        method: 'POST',
        body: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          address: address.trim() || null,
        },
      }),
    onSuccess: () => {
      toast.success('Supplier added')
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
          <DialogTitle>Add Supplier</DialogTitle>
          <DialogDescription>
            Suppliers can be linked to stock-in transactions across projects.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="supplier-name">Name</Label>
              <Input
                id="supplier-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Shree Cement Agency"
              />
              {submitted && nameError ? (
                <p className="text-sm text-red-600 dark:text-red-400">{nameError}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="supplier-phone">Phone</Label>
              <Input
                id="supplier-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
              />
              {submitted && phoneError ? (
                <p className="text-sm text-red-600 dark:text-red-400">{phoneError}</p>
              ) : null}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="supplier-email">Email (optional)</Label>
            <Input
              id="supplier-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="billing@agency.in"
            />
            {submitted && emailError ? (
              <p className="text-sm text-red-600 dark:text-red-400">{emailError}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="supplier-address">Address (optional)</Label>
            <Textarea
              id="supplier-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Shop no, market, city"
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adding…' : 'Add Supplier'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
