import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '@/forgeos/features/authentication/auth/AuthProvider'
import { LoginPage } from '@/forgeos/features/authentication/pages/LoginPage'
import {
  calledUrls,
  errEnvelope,
  getHeader,
  makeUser,
  okEnvelope,
  requestBody,
  resetForgeOsState,
  stubFetch,
} from './test-utils'

beforeEach(() => {
  resetForgeOsState()
})

afterEach(() => {
  resetForgeOsState()
})

const TOKEN_KEY = 'forgeos_access_token'

/** Renders the full login page inside a real AuthProvider; /auth/me → 401. */
function renderLoginPage(extraRoutes: Record<string, () => Response> = {}) {
  const fetchMock = stubFetch((url) => {
    if (url === '/api/auth/me') return errEnvelope('Not authenticated', 401, 'UNAUTHORIZED')
    const route = Object.keys(extraRoutes).find((prefix) => url.startsWith(prefix))
    if (route) return extraRoutes[route]()
    return errEnvelope(`No route stubbed for ${url}`, 404, 'NOT_STUBBED')
  })
  const user = userEvent.setup()
  render(
    <AuthProvider>
      <LoginPage />
    </AuthProvider>,
  )
  return { fetchMock, user }
}

async function fillCredentials(user: ReturnType<typeof userEvent.setup>, email = 'asha@forge.test') {
  await user.type(screen.getByLabelText('Email address'), email)
  await user.type(screen.getByLabelText('Password'), 'secret123')
}

describe('LoginPage — rendering', () => {
  test('shows marketing heading, sign-in card and all form labels', () => {
    renderLoginPage()

    expect(
      screen.getByRole('heading', { level: 1, name: /Build better/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Sign in to your account' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to website' })).toHaveAttribute('href', '#/')
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /Remember me on this device/i })).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Email me a sign-in code' })).toBeEnabled()
    expect(screen.getByRole('link', { name: 'Continue with Google' })).toHaveAttribute(
      'href',
      '/api/auth/oauth/google',
    )
  })

  test('the password visibility toggle flips the input type and label', async () => {
    const { user } = renderLoginPage()

    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
  })
})

describe('LoginPage — password validation', () => {
  // The real inputs carry the `required` attribute, so a real browser blocks
  // submission with native validation UI. These tests drive the form's own
  // submit handler directly (fireEvent.submit bypasses constraint validation)
  // to cover the component's JS-level fallback messages.
  function submitForm(buttonName: string) {
    const button = screen.getByRole('button', { name: buttonName })
    const form = button.closest('form')
    expect(form).not.toBeNull()
    fireEvent.submit(form as HTMLFormElement)
  }

  test('submitting with empty fields shows an inline error and makes no API call', async () => {
    const { fetchMock } = renderLoginPage()

    submitForm('Sign in')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Please enter your email and password.',
    )
    expect(calledUrls(fetchMock).some((u) => u.includes('/auth/login'))).toBe(false)
  })

  test('a missing password is still treated as invalid', async () => {
    const { user } = renderLoginPage()

    await user.type(screen.getByLabelText('Email address'), 'asha@forge.test')
    submitForm('Sign in')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Please enter your email and password.',
    )
  })
})

describe('LoginPage — successful password login', () => {
  test('ADMIN users land on /app/admin/dashboard and keep the token in the session store', async () => {
    const admin = makeUser('ADMIN', { id: 'u-loginpage-1' })
    const { user, fetchMock } = renderLoginPage({
      '/api/auth/login': () => okEnvelope({ token: 'tok-admin', user: admin }),
    })

    await fillCredentials(user)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(window.location.hash).toBe('#/app/admin/dashboard'))

    const loginCall = fetchMock.mock.calls.find(([input]) => String(input) === '/api/auth/login')
    expect(loginCall).toBeDefined()
    const init = loginCall?.[1]
    expect(init?.method).toBe('POST')
    expect(getHeader(init, 'content-type')).toBe('application/json')
    expect(await requestBody(init)).toEqual({ email: 'asha@forge.test', password: 'secret123' })
    expect(sessionStorage.getItem(TOKEN_KEY)).toBe('tok-admin')
  })

  test('PM users land on /app/pm/dashboard', async () => {
    const pm = makeUser('PM', { id: 'u-loginpage-2', email: 'prakash@forge.test' })
    const { user } = renderLoginPage({
      '/api/auth/login': () => okEnvelope({ token: 'tok-pm', user: pm }),
    })

    await fillCredentials(user, 'prakash@forge.test')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(window.location.hash).toBe('#/app/pm/dashboard'))
  })

  test('VIEWER users land on /app/projects', async () => {
    const viewer = makeUser('VIEWER', { id: 'u-loginpage-3', email: 'vera@forge.test' })
    const { user } = renderLoginPage({
      '/api/auth/login': () => okEnvelope({ token: 'tok-viewer', user: viewer }),
    })

    await fillCredentials(user, 'vera@forge.test')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(window.location.hash).toBe('#/app/projects'))
  })

  test('remember me stores the token in localStorage instead of sessionStorage', async () => {
    const admin = makeUser('ADMIN', { id: 'u-loginpage-4' })
    const { user } = renderLoginPage({
      '/api/auth/login': () => okEnvelope({ token: 'tok-remember', user: admin }),
    })

    await fillCredentials(user)
    await user.click(screen.getByRole('checkbox', { name: /Remember me on this device/i }))
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(window.location.hash).toBe('#/app/admin/dashboard'))
    expect(localStorage.getItem(TOKEN_KEY)).toBe('tok-remember')
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  test('the email is trimmed before submission', async () => {
    const admin = makeUser('ADMIN', { id: 'u-loginpage-5' })
    const { user, fetchMock } = renderLoginPage({
      '/api/auth/login': () => okEnvelope({ token: 'tok-trim', user: admin }),
    })

    await user.type(screen.getByLabelText('Email address'), '  asha@forge.test  ')
    await user.type(screen.getByLabelText('Password'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(window.location.hash).toBe('#/app/admin/dashboard'))
    const loginCall = fetchMock.mock.calls.find(([input]) => String(input) === '/api/auth/login')
    expect(await requestBody(loginCall?.[1])).toEqual({ email: 'asha@forge.test', password: 'secret123' })
  })
})

describe('LoginPage — failed password login', () => {
  test('a 401 maps to the friendly invalid-credentials message with no token stored', async () => {
    const { user, fetchMock } = renderLoginPage({
      '/api/auth/login': () => errEnvelope('Invalid email or password', 401, 'INVALID_CREDENTIALS'),
    })

    await fillCredentials(user, 'asha@forge.test')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.')
    expect(window.location.hash).toBe('')
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(calledUrls(fetchMock).some((u) => u.includes('/auth/login'))).toBe(true)
  })

  test('a non-401 failure surfaces the raw server message', async () => {
    const { user } = renderLoginPage({
      '/api/auth/login': () => errEnvelope('Account deactivated', 403, 'FORBIDDEN'),
    })

    await fillCredentials(user)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Account deactivated')
    expect(window.location.hash).toBe('')
  })
})

describe('LoginPage — OTP sign-in mode', () => {
  test('switching modes replaces the password field with the OTP explainer', async () => {
    const { user } = renderLoginPage()

    await user.click(screen.getByRole('button', { name: 'Email me a sign-in code' }))

    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()
    expect(
      screen.getByText('We will email a 6-digit sign-in code to this address. No password needed.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send code' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Sign in with password instead' })).toBeEnabled()
  })

  test('requesting a code without an email shows an inline error', async () => {
    const { user, fetchMock } = renderLoginPage()

    await user.click(screen.getByRole('button', { name: 'Email me a sign-in code' }))
    // Bypass the email input's `required` constraint to reach the handler's
    // own guard (a real browser would block with native validation UI).
    const sendCodeButton = screen.getByRole('button', { name: 'Send code' })
    const form = sendCodeButton.closest('form')
    expect(form).not.toBeNull()
    fireEvent.submit(form as HTMLFormElement)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Please enter your email address first.',
    )
    expect(calledUrls(fetchMock).some((u) => u.includes('/auth/otp'))).toBe(false)
  })

  test('a successful code request posts the email and reveals the code input', async () => {
    const { user, fetchMock } = renderLoginPage({
      '/api/auth/otp/request': () =>
        okEnvelope({ ok: true, delivered: false, expiresInSeconds: 600, devCode: '654321' }),
    })

    await user.type(screen.getByLabelText('Email address'), 'asha@forge.test')
    await user.click(screen.getByRole('button', { name: 'Email me a sign-in code' }))
    await user.click(screen.getByRole('button', { name: 'Send code' }))

    expect(await screen.findByLabelText('Sign-in code')).toBeEnabled()
    expect(screen.getByText(/demo code:/i)).toHaveTextContent('654321')
    expect(screen.getByRole('button', { name: 'Verify and sign in' })).toBeEnabled()

    const otpCall = fetchMock.mock.calls.find(([input]) => String(input) === '/api/auth/otp/request')
    expect(otpCall).toBeDefined()
    expect(otpCall?.[1]?.method).toBe('POST')
    expect(await requestBody(otpCall?.[1])).toEqual({ email: 'asha@forge.test' })
  })

  // NOTE: the OTP *verify* success path is intentionally not tested here — it
  // calls window.location.reload(), which jsdom does not implement.
})

describe('LoginPage — OAuth error banner', () => {
  test('renders the mapped message for a known oauth_error code and strips the query param', async () => {
    window.history.replaceState(null, '', '/?oauth_error=cancelled')
    renderLoginPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('Google sign-in was cancelled.')
    expect(screen.queryByLabelText('Password')).toBeInTheDocument()
    // The effect removes the query parameter from the URL.
    await waitFor(() => expect(window.location.search).toBe(''))
  })

  test('an unknown oauth_error code falls back to a generic message', async () => {
    window.history.replaceState(null, '', '/?oauth_error=who-knows')
    renderLoginPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Google sign-in failed. Please try again.',
    )
  })
})
