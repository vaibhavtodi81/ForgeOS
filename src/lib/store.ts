'use client'

import { create } from 'zustand'

export type ViewId =
  | 'dashboard'
  | 'projects'
  | 'plans'
  | 'inventory'
  | 'logs'
  | 'billing'
  | 'wastage'
  | 'audit'
  | 'users'
  | 'materials'
  | 'lands'
  | 'suppliers'
  | 'profile'

interface AppState {
  view: ViewId
  setView: (view: ViewId) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  view: 'dashboard',
  setView: (view) => set({ view, sidebarOpen: false }),
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}))

export const VIEW_TITLES: Record<ViewId, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  plans: 'Material Plans',
  inventory: 'Inventory',
  logs: 'Daily Logs',
  billing: 'Billing & Payments',
  wastage: 'Wastage Analysis',
  audit: 'Audit Logs',
  users: 'Users',
  materials: 'Materials',
  lands: 'Lands',
  suppliers: 'Suppliers',
  profile: 'Profile',
}
