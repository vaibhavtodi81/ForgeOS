import { describe, expect, it } from 'vitest'
import { dailyLogBodySchema } from '../src/modules/daily-logs/daily-logs.validator.js'

describe('daily log validation', () => {
  it('accepts a nested daily log payload', () => {
    const result = dailyLogBodySchema.safeParse({
      logDate: '2026-10-04',
      progressPercent: 43,
      workSummary: 'Slab casting completed.',
      labourEntries: [{ trade: 'Mason', headCount: 12, hoursWorked: 8 }],
      machineryEntries: [{ machineName: 'Concrete Mixer', hoursUsed: 6.5 }],
    })

    expect(result.success).toBe(true)
  })

  it('rejects invalid labour and machinery measurements', () => {
    const result = dailyLogBodySchema.safeParse({
      logDate: '2026-10-04',
      progressPercent: 43,
      workSummary: 'Invalid measurements.',
      labourEntries: [{ trade: 'Mason', headCount: 0, hoursWorked: 25 }],
      machineryEntries: [{ machineName: 'Mixer', hoursUsed: -1, fuelLitres: -2 }],
    })

    expect(result.success).toBe(false)
  })
})
