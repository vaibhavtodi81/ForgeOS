import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Infra smoke test — verifies the jsdom environment, React transform,
// jest-dom matchers and setup polyfills are all wired up correctly.
function Hello({ name }: { name: string }) {
  return (
    <div>
      <h1>Hello {name}</h1>
      <button type="button">Click me</button>
    </div>
  )
}

describe('frontend test harness', () => {
  test('renders JSX with jest-dom matchers available', () => {
    render(<Hello name="ForgeOS" />)
    expect(screen.getByRole('heading', { name: 'Hello ForgeOS' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Click me' })).toBeEnabled()
  })
})
