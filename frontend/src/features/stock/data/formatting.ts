// Defines formatINR so this module can perform its named task when needed.
export function formatINR(value: number): string {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return new Intl.NumberFormat('en-IN', {
    // Sets the style field so the surrounding object or component receives this setting.
    style: 'currency',
    // Sets the currency field so the surrounding object or component receives this setting.
    currency: 'INR',
    // Sets the maximumFractionDigits field so the surrounding object or component receives this setting.
    maximumFractionDigits: 0,
  // Continues the component or data expression so its related values and behavior stay grouped together.
  }).format(value)
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines formatQty so this module can perform its named task when needed.
export function formatQty(value: number): string {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value)
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines formatDate so this module can perform its named task when needed.
export function formatDate(value: string): string {
  // Stores the value in parsed so later lines can reuse this data or behavior for the current feature.
  const parsed = new Date(value)
  // Checks this condition before continuing so the code can choose the correct path for the current state.
  if (Number.isNaN(parsed.getTime())) return value
  // Returns the result so the caller or React receives the value or interface this function provides.
  return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
// Closes the current block or object so the grouped statements or settings end here.
}

// Defines todayISO so this module can perform its named task when needed.
export function todayISO(): string {
  // Returns the result so the caller or React receives the value or interface this function provides.
  return new Date().toISOString().slice(0, 10)
// Closes the current block or object so the grouped statements or settings end here.
}
// File purpose: Formats stock values consistently for display in the frontend.
