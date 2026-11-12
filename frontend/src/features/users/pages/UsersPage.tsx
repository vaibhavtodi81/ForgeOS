import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Search, Plus, Users, ShieldCheck, BriefcaseBusiness, UserCheck, Pencil, X } from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'
import { useAuth } from '../../authentication/auth/useAuth'
import { ApiError } from '../../../lib/api'
import { createUser, fetchUsers, updateUser, updateUserStatus, type ApiUser, type UserRole } from '../data/usersApi'

const pageSize = 20

function messageOf(error: unknown) {
  return error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<ApiUser[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [refreshVersion, setRefreshVersion] = useState(0)
  const [loadedRequest, setLoadedRequest] = useState('')
  const [saving, setSaving] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('PM')
  const [phone, setPhone] = useState('')

  const requestKey = `${page}:${search}:${refreshVersion}`
  const loading = loadedRequest !== requestKey

  useEffect(() => {
    const controller = new AbortController()
    void fetchUsers({ page, pageSize, search }, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setUsers(result.users)
        setTotal(result.total)
        setTotalPages(Math.max(1, result.totalPages))
        setError(null)
        setLoadedRequest(requestKey)
      })
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return
        setError(messageOf(loadError))
        setLoadedRequest(requestKey)
      })
    return () => controller.abort()
  }, [page, search, requestKey])

  const activeCount = useMemo(() => users.filter((item) => item.isActive).length, [users])
  const adminCount = useMemo(() => users.filter((item) => item.role === 'ADMIN').length, [users])
  const pmCount = users.length - adminCount

  const resetForm = () => {
    setEditingUser(null)
    setName('')
    setEmail('')
    setPassword('')
    setRole('PM')
    setPhone('')
    setFormOpen(false)
  }

  const openAddForm = () => {
    resetForm()
    setFormOpen(true)
  }

  const openEditForm = (item: ApiUser) => {
    setEditingUser(item)
    setName(item.name)
    setEmail(item.email)
    setPassword('')
    setRole(item.role)
    setPhone(item.phone ?? '')
    setFormOpen(true)
  }

  const saveUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const common = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        phone: phone.trim() || null,
      }
      if (editingUser) {
        await updateUser(editingUser.id, { ...common, ...(password ? { password } : {}) })
        setSuccess('User details updated.')
      } else {
        await createUser({ ...common, password })
        setSuccess('User created.')
      }
      resetForm()
      setRefreshVersion((version) => version + 1)
    } catch (saveError) {
      setError(messageOf(saveError))
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (item: ApiUser) => {
    const nextStatus = !item.isActive
    if (!nextStatus && item.id === currentUser?.id && !window.confirm('You are about to deactivate your own account. The server may reject this action. Continue?')) return
    setUpdatingStatus(item.id)
    setError(null)
    setSuccess(null)
    try {
      await updateUserStatus(item.id, nextStatus)
      setSuccess(`User ${nextStatus ? 'activated' : 'deactivated'}.`)
      setRefreshVersion((version) => version + 1)
    } catch (statusError) {
      setError(messageOf(statusError))
    } finally {
      setUpdatingStatus(null)
    }
  }

  const cards = [
    { label: 'Total Users', value: total, icon: Users },
    { label: 'Administrators (this page)', value: adminCount, icon: ShieldCheck },
    { label: 'Project Managers (this page)', value: pmCount, icon: BriefcaseBusiness },
    { label: 'Active Users (this page)', value: activeCount, icon: UserCheck },
  ]

  return (
    <AppShell currentPath="/app/users">
      <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-[#8E827A]">Workspace / Administration</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">User Management</h1>
            <p className="mt-2 text-sm text-[#8E827A]">Manage team members, roles, and account status.</p>
          </div>
          <button onClick={openAddForm} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#323232] px-5 py-3 text-sm font-medium text-white hover:bg-[#1E1E1E]">
            <Plus size={17} /> Add User
          </button>
        </section>

        {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><span>{error}</span><button onClick={() => setRefreshVersion((version) => version + 1)} className="shrink-0 underline">Retry</button></div>}
        {success && <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{success}</p>}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-[#8E827A]">{label}</p><h2 className="mt-3 text-3xl font-semibold text-[#323232]">{value}</h2></div>
                <div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]"><Icon size={21} /></div>
              </div>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
          <div className="flex flex-col justify-between gap-4 border-b border-[#E8DCD4] p-5 sm:flex-row sm:items-center">
            <div><h2 className="font-semibold text-[#323232]">Team Members</h2><p className="mt-1 text-xs text-[#8E827A]">{total} users found</p></div>
            <div className="flex items-center gap-2 rounded-xl border border-[#C8BCB4] px-3 py-2">
              <Search size={17} className="text-[#8E827A]" />
              <input aria-label="Search users" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search users..." className="w-full bg-transparent text-sm outline-none sm:w-56" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]"><tr><th className="px-5 py-4 font-medium">User</th><th className="px-5 py-4 font-medium">Role</th><th className="px-5 py-4 font-medium">Status</th><th className="px-5 py-4 font-medium">Joined Date</th><th className="px-5 py-4 text-right font-medium">Actions</th></tr></thead>
              <tbody className="divide-y divide-[#E8DCD4]">
                {loading ? <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-[#8E827A]">Loading users…</td></tr>
                  : users.length === 0 ? <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-[#8E827A]">{search.trim() ? 'No users match your search.' : 'No users found.'}</td></tr>
                    : users.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F7F3EE]/60">
                        <td className="px-5 py-4"><p className="text-sm font-medium text-[#323232]">{item.name}</p><p className="mt-1 text-xs text-[#8E827A]">{item.email}{item.phone ? ` · ${item.phone}` : ''}</p></td>
                        <td className="px-5 py-4 text-sm text-[#595552]">{item.role === 'ADMIN' ? 'Admin' : 'Project Manager'}</td>
                        <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.isActive ? 'bg-[#E8EFE5] text-[#617858]' : 'bg-[#F5EDE1] text-[#9A7950]'}`}>{item.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td className="px-5 py-4 text-sm text-[#595552]">{formatDate(item.createdAt)}</td>
                        <td className="px-5 py-4"><div className="flex justify-end gap-2">
                          <button onClick={() => openEditForm(item)} title={`Edit ${item.name}`} aria-label={`Edit ${item.name}`} className="rounded-lg p-2 text-[#595552] hover:bg-[#F7F3EE]"><Pencil size={16} /></button>
                          <button disabled={updatingStatus === item.id || (item.id === currentUser?.id && item.isActive)} onClick={() => void toggleStatus(item)} title={item.id === currentUser?.id && item.isActive ? 'You cannot deactivate your own account' : item.isActive ? 'Deactivate user' : 'Activate user'} className="rounded-lg px-2 py-1 text-xs text-[#595552] hover:bg-[#F7F3EE] disabled:opacity-50">{updatingStatus === item.id ? 'Saving…' : item.isActive ? 'Deactivate' : 'Activate'}</button>
                        </div></td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-[#E8DCD4] px-5 py-3 text-sm text-[#595552]">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-[#C8BCB4] px-3 py-1.5 disabled:opacity-50">Previous</button>
              <button disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-[#C8BCB4] px-3 py-1.5 disabled:opacity-50">Next</button>
            </div>
          </div>
        </section>
      </div>

      {formOpen && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
        <form onSubmit={(event) => void saveUser(event)} className="my-6 w-full max-w-lg space-y-5 rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold text-[#323232]">{editingUser ? 'Edit User' : 'Add New User'}</h2><p className="mt-1 text-sm text-[#8E827A]">Enter the team member details below.</p></div><button type="button" onClick={resetForm} aria-label="Close user form" className="rounded-lg p-2 text-[#8E827A] hover:bg-[#F7F3EE]"><X size={19} /></button></div>
          <label className="block text-sm font-medium text-[#595552]">Full Name<input required maxLength={255} value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 text-sm outline-none focus:border-[#595552]" placeholder="Enter full name" /></label>
          <label className="block text-sm font-medium text-[#595552]">Email Address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 text-sm outline-none focus:border-[#595552]" placeholder="name@company.com" /></label>
          <label className="block text-sm font-medium text-[#595552]">{editingUser ? 'New Password (optional)' : 'Password'}<input required={!editingUser} minLength={8} maxLength={200} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 text-sm outline-none focus:border-[#595552]" placeholder={editingUser ? 'Leave blank to keep current password' : 'At least 8 characters'} /></label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-[#595552]">Role<select value={role} onChange={(event) => setRole(event.target.value as UserRole)} className="mt-2 w-full rounded-xl border border-[#C8BCB4] bg-white px-3 py-3 text-sm"><option value="PM" disabled={editingUser?.id === currentUser?.id}>Project Manager</option><option value="ADMIN">Admin</option></select></label>
            <label className="text-sm font-medium text-[#595552]">Phone<input maxLength={50} value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 w-full rounded-xl border border-[#C8BCB4] px-4 py-3 text-sm outline-none" /></label>
          </div>
          {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={resetForm} className="rounded-xl border border-[#C8BCB4] px-4 py-2.5 text-sm text-[#595552]">Cancel</button><button type="submit" disabled={saving} className="rounded-xl bg-[#323232] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Saving…' : editingUser ? 'Save Changes' : 'Add User'}</button></div>
        </form>
      </div>}
    </AppShell>
  )
}
