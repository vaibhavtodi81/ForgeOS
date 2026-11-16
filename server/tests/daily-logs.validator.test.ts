import { describe, expect, it } from 'vitest' // Imports test-runner helpers for defining and checking this behavior.
import { dailyLogBodySchema } from '../src/modules/daily-logs/daily-logs.validator.js' // Imports { dailyLogBodySchema } from '../src/modules/daily-logs/daily-logs.validator.js' so this module can reuse that functionality.

describe('daily log validation', () => { // Opens the function, callback, or control-flow block that groups the related statements.
  it('accepts a nested daily log payload', () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const result = dailyLogBodySchema.safeParse({ // Stores this intermediate `result` value so later lines can use it.
      logDate: '2026-10-04', // Separates this argument or property from the next item in the surrounding call or object.
      progressPercent: 43, // Separates this argument or property from the next item in the surrounding call or object.
      workSummary: 'Slab casting completed.', // Separates this argument or property from the next item in the surrounding call or object.
      labourEntries: [{ trade: 'Mason', headCount: 12, hoursWorked: 8 }], // Separates this argument or property from the next item in the surrounding call or object.
      machineryEntries: [{ machineName: 'Concrete Mixer', hoursUsed: 6.5 }], // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.

    expect(result.success).toBe(true) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  it('rejects invalid labour and machinery measurements', () => { // Opens the function, callback, or control-flow block that groups the related statements.
    const result = dailyLogBodySchema.safeParse({ // Stores this intermediate `result` value so later lines can use it.
      logDate: '2026-10-04', // Separates this argument or property from the next item in the surrounding call or object.
      progressPercent: 43, // Separates this argument or property from the next item in the surrounding call or object.
      workSummary: 'Invalid measurements.', // Separates this argument or property from the next item in the surrounding call or object.
      labourEntries: [{ trade: 'Mason', headCount: 0, hoursWorked: 25 }], // Separates this argument or property from the next item in the surrounding call or object.
      machineryEntries: [{ machineName: 'Mixer', hoursUsed: -1, fuelLitres: -2 }], // Separates this argument or property from the next item in the surrounding call or object.
    }) // Closes the current call, object, or collection so the surrounding expression can continue.

    expect(result.success).toBe(false) // Asserts that the observed result matches the behavior this test is meant to guarantee.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
// File purpose: Checks expected behavior for daily logs.validator.test using the project test runner.
