'use client'

import { AuthProvider } from '@/forgeos/features/authentication/auth/AuthProvider'
import { ProjectsProvider } from '@/forgeos/features/projects/ProjectsProvider'
import { App } from '@/forgeos/App'

export default function Page() {
  return (
    <AuthProvider>
      <ProjectsProvider>
        <App />
      </ProjectsProvider>
    </AuthProvider>
  )
}
