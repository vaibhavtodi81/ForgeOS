// Imports StrictMode from react so this module can reuse that component, helper, or library.
import { StrictMode } from 'react'
// Imports createRoot from react-dom/client so this module can reuse that component, helper, or library.
import { createRoot } from 'react-dom/client'
// Continues the component or data expression so its related values and behavior stay grouped together.
import './index.css'
// Imports App from ./App.tsx so this module can reuse that component, helper, or library.
import App from './App.tsx'
// Imports AuthProvider from ./features/authentication/auth/AuthProvider so this module can reuse that component, helper, or library.
import { AuthProvider } from './features/authentication/auth/AuthProvider'
// Imports ProjectsProvider from ./features/projects/ProjectsProvider so this module can reuse that component, helper, or library.
import { ProjectsProvider } from './features/projects/ProjectsProvider'

// The HTML entry page guarantees #root; TypeScript's ! does not add a runtime check.
// Calls this helper or component so the feature can perform the operation or render the control represented here.
createRoot(document.getElementById('root')!).render(
  // Continues the component or data expression so its related values and behavior stay grouped together.
  <StrictMode>
    {/* Starts the <AuthProvider> element to organize this part of the interface. */}
    <AuthProvider>
      {/* Starts the <ProjectsProvider> element to organize this part of the interface. */}
      <ProjectsProvider>
        {/* Starts the <App> element to organize this part of the interface. */}
        <App />
      {/* Closes the <ProjectsProvider> element so later content is no longer part of this region. */}
      </ProjectsProvider>
    {/* Closes the <AuthProvider> element so later content is no longer part of this region. */}
    </AuthProvider>
  {/* Closes the <StrictMode> element so later content is no longer part of this region. */}
  </StrictMode>,
// Closes this function call or grouped expression so the surrounding code can continue.
)
// File purpose: Mounts the React application and its shared state providers in the browser.
