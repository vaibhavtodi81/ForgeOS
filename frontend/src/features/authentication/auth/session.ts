// Continues the component or data expression so its related values and behavior stay grouped together.
export interface AuthUser {
  // Sets the id field so the surrounding object or component receives this setting.
  id: number
  // Sets the name field so the surrounding object or component receives this setting.
  name: string
  // Sets the email field so the surrounding object or component receives this setting.
  email: string
  // Sets the role field so the surrounding object or component receives this setting.
  role: 'ADMIN' | 'PM'
  // Sets the phone field so the surrounding object or component receives this setting.
  phone: string | null
  // Sets the isActive field so the surrounding object or component receives this setting.
  isActive: boolean
  // Sets the createdAt field so the surrounding object or component receives this setting.
  createdAt: string
  // Sets the updatedAt field so the surrounding object or component receives this setting.
  updatedAt: string
// Closes the current block or object so the grouped statements or settings end here.
}

// Stores the value in TOKEN_KEY so later lines can reuse this data or behavior for the current feature.
const TOKEN_KEY = 'forgeos_access_token'
// Stores the value in currentUser so later lines can reuse this data or behavior for the current feature.
let currentUser: AuthUser | null = null

// Defines getAccessToken so this module can perform its named task when needed.
export function getAccessToken(): string | null {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY)
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines saveAccessToken so this module can perform its named task when needed.
export function saveAccessToken(token: string, rememberMe: boolean): void {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  clearAccessToken()
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (rememberMe) localStorage.setItem(TOKEN_KEY, token)
  // Handles the alternative branch when the preceding condition was not met.
  else sessionStorage.setItem(TOKEN_KEY, token)
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines clearAccessToken so this module can perform its named task when needed.
export function clearAccessToken(): void {
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  sessionStorage.removeItem(TOKEN_KEY)
  // Calls this helper or component so the feature can perform the operation or render the control represented here.
  localStorage.removeItem(TOKEN_KEY)
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines setAuthUser so this module can perform its named task when needed.
export function setAuthUser(user: AuthUser | null): void {
  // Continues the component or data expression so its related values and behavior stay grouped together.
  currentUser = user
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines getAuthUserSnapshot so this module can perform its named task when needed.
export function getAuthUserSnapshot(): AuthUser | null {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return currentUser
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Supports frontend authentication through session.
