import { useMemo, useState, useEffect } from 'react'
import {
  Search, Plus, Users, ShieldCheck, BriefcaseBusiness,
  UserCheck, Pencil, Trash2, X
} from 'lucide-react'
import { AppShell } from '../../app-shell/components/AppShell'

type User = {
  id: number
  name: string
  email: string
  role: 'Admin' | 'Project Manager'
  status: 'Active' | 'Inactive'
  joined: string
}

const initialUsers: User[] = [
  { id: 1, name: 'Aarav Sharma', email: 'aarav@forgeos.com', role: 'Admin', status: 'Active', joined: '12 Jan 2026' },
  { id: 2, name: 'Priya Mehta', email: 'priya@forgeos.com', role: 'Project Manager', status: 'Active', joined: '18 Feb 2026' },
  { id: 3, name: 'Rohan Verma', email: 'rohan@forgeos.com', role: 'Project Manager', status: 'Active', joined: '04 Mar 2026' },
  { id: 4, name: 'Neha Kapoor', email: 'neha@forgeos.com', role: 'Project Manager', status: 'Inactive', joined: '21 Mar 2026' },
]

export function UsersPage() {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('forgeos_users')
      return saved ? JSON.parse(saved) as User[] : initialUsers
    } catch {
      return initialUsers
    }
  })

  useEffect(() => {
    localStorage.setItem('forgeos_users', JSON.stringify(users))
  }, [users])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<User['role']>('Project Manager')
  const [status, setStatus] = useState<User['status']>('Active')

  const filteredUsers = useMemo(() => users.filter((user) => {
    const matchesSearch = `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'All' || user.role === roleFilter
    return matchesSearch && matchesRole
  }), [users, search, roleFilter])

  const openAddForm = () => {
    setEditingUser(null)
    setName('')
    setEmail('')
    setRole('Project Manager')
    setStatus('Active')
    setShowForm(true)
  }

  const openEditForm = (user: User) => {
    setEditingUser(user)
    setName(user.name)
    setEmail(user.email)
    setRole(user.role)
    setStatus(user.status)
    setShowForm(true)
  }

  const saveUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    const duplicateEmail = users.some((user) =>
      user.email.trim().toLowerCase() === normalizedEmail &&
      user.id !== editingUser?.id
    )
    if (duplicateEmail) {
      window.alert('This email is already registered. Please use a different email.')
      return
    }
    if (!name.trim() || !normalizedEmail) {
      window.alert('Please enter a valid name and email address.')
      return
    }
    if (editingUser) {
      setUsers((current) => current.map((user) =>
        user.id === editingUser.id ? { ...user, name: name.trim(), email: normalizedEmail, role, status } : user
      ))
    } else {
      setUsers((current) => [...current, {
        id: Date.now(), name: name.trim(), email: normalizedEmail, role, status,
        joined: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      }])
    }
    setShowForm(false)
  }

  const deleteUser = (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers((current) => current.filter((user) => user.id !== id))
    }
  }

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users },
    { label: 'Administrators', value: users.filter((u) => u.role === 'Admin').length, icon: ShieldCheck },
    { label: 'Project Managers', value: users.filter((u) => u.role === 'Project Manager').length, icon: BriefcaseBusiness },
    { label: 'Active Users', value: users.filter((u) => u.status === 'Active').length, icon: UserCheck },
  ]

  return (
    <AppShell currentPath="/app/users">
      <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-7 lg:p-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-[#8E827A]">Workspace / Administration</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#323232] sm:text-3xl">User Management</h1>
            <p className="mt-2 text-sm text-[#8E827A]">Manage your team members, roles and access status.</p>
          </div>
          <button onClick={openAddForm} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#323232] px-5 py-3 text-sm font-medium text-white hover:bg-[#1E1E1E]">
            <Plus size={17} /> Add User
          </button>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="rounded-2xl border border-[#C8BCB4]/70 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#8E827A]">{stat.label}</p>
                    <h2 className="mt-3 text-3xl font-semibold text-[#323232]">{stat.value}</h2>
                  </div>
                  <div className="rounded-xl bg-[#F7F3EE] p-3 text-[#595552]"><Icon size={21} /></div>
                </div>
              </div>
            )
          })}
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#C8BCB4]/70 bg-white">
          <div className="flex flex-col justify-between gap-4 border-b border-[#E8DCD4] p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-[#323232]">Team Members</h2>
              <p className="mt-1 text-xs text-[#8E827A]">{filteredUsers.length} members found</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center gap-2 rounded-xl border border-[#C8BCB4] px-3 py-2">
                <Search size={17} className="text-[#8E827A]" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full bg-transparent text-sm outline-none sm:w-48" />
              </div>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-xl border border-[#C8BCB4] bg-white px-3 py-2 text-sm text-[#595552] outline-none">
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Project Manager">Project Manager</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-[#F7F3EE] text-xs text-[#8E827A]">
                <tr>
                  <th className="px-5 py-4 font-medium">User</th>
                  <th className="px-5 py-4 font-medium">Role</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Joined Date</th>
                  <th className="px-5 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCD4]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F7F3EE]/60">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-[#323232]">{user.name}</p>
                      <p className="mt-1 text-xs text-[#8E827A]">{user.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#595552]">{user.role}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.status === 'Active' ? 'bg-[#E8EFE5] text-[#617858]' : 'bg-[#F5EDE1] text-[#9A7950]'}`}>{user.status}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#595552]">{user.joined}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditForm(user)} title="Edit user" className="rounded-lg p-2 text-[#595552] hover:bg-[#F7F3EE]"><Pencil size={16} /></button>
                        <button onClick={() => deleteUser(user.id)} title="Delete user" className="rounded-lg p-2 text-[#9B625A] hover:bg-[#F8ECEA]"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-[#8E827A]">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={saveUser} className="w-full max-w-lg space-y-5 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#323232]">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                <p className="mt-1 text-sm text-[#8E827A]">Enter the team member details below.</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-2 text-[#8E827A] hover:bg-[#F7F3EE]"><X size={19} /></button>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#595552]">Full Name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-[#C8BCB4] px-4 py-3 text-sm outline-none focus:border-[#595552]" placeholder="Enter full name" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#595552]">Email Address</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-[#C8BCB4] px-4 py-3 text-sm outline-none focus:border-[#595552]" placeholder="name@company.com" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#595552]">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value as User['role'])} className="w-full rounded-xl border border-[#C8BCB4] bg-white px-3 py-3 text-sm">
                  <option>Project Manager</option><option>Admin</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#595552]">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as User['status'])} className="w-full rounded-xl border border-[#C8BCB4] bg-white px-3 py-3 text-sm">
                  <option>Active</option><option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-[#C8BCB4] px-4 py-2.5 text-sm text-[#595552]">Cancel</button>
              <button type="submit" className="rounded-xl bg-[#323232] px-5 py-2.5 text-sm font-medium text-white">{editingUser ? 'Save Changes' : 'Add User'}</button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  )
}
