import { describe, expect, test } from 'vitest'
import { mapProject, type ApiProject } from '@/forgeos/features/projects/project-utils'

function makeApiProject(overrides: Partial<ApiProject> = {}): ApiProject {
  return {
    id: 'p1',
    code: 'SKY-01',
    name: 'Skyline Residency',
    description: null,
    location: null,
    status: 'ACTIVE',
    startDate: '2025-01-10',
    expectedEndDate: '2026-03-31',
    actualEndDate: null,
    totalBudget: '12500000.5',
    wastageThresholdPct: 12,
    assignedPm: null,
    land: null,
    ...overrides,
  }
}

describe('mapProject', () => {
  test('passes through the identity and schedule fields untouched', () => {
    const mapped = mapProject(
      makeApiProject({
        id: 'p-9',
        code: 'HG-07',
        name: 'Harbour Gateway',
        status: 'ON_HOLD',
        startDate: '2025-02-01',
        expectedEndDate: '2027-01-01',
        actualEndDate: '2026-12-20',
        totalBudget: 9800000,
      }),
    )

    expect(mapped).toMatchObject({
      id: 'p-9',
      code: 'HG-07',
      name: 'Harbour Gateway',
      status: 'ON_HOLD',
      startDate: '2025-02-01',
      expectedEndDate: '2027-01-01',
      actualEndDate: '2026-12-20',
      totalBudget: 9800000,
    })
  })

  test('budget strings are passed through verbatim (no numeric coercion)', () => {
    expect(mapProject(makeApiProject({ totalBudget: '125.75' })).totalBudget).toBe('125.75')
    expect(mapProject(makeApiProject({ totalBudget: 42 })).totalBudget).toBe(42)
  })

  test('wastageThresholdPct and assignedPm are forwarded', () => {
    const pm = { id: 'u-pm', name: 'Prakash Manager', email: 'prakash@forge.test' }
    const mapped = mapProject(makeApiProject({ wastageThresholdPct: 7, assignedPm: pm }))

    expect(mapped.wastageThresholdPct).toBe(7)
    expect(mapped.assignedPm).toEqual(pm)
  })

  test('assignedPm null stays null', () => {
    expect(mapProject(makeApiProject({ assignedPm: null })).assignedPm).toBeNull()
  })
})

describe('mapProject — location composition', () => {
  test('joins project location and land address parts with commas', () => {
    const mapped = mapProject(
      makeApiProject({
        location: 'Plot 12, Ring Road',
        land: { addressLine: 'MG Road', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
      }),
    )

    expect(mapped.location).toBe('Plot 12, Ring Road, MG Road, Pune, Maharashtra')
  })

  test('uses only the parts that are present', () => {
    const mapped = mapProject(
      makeApiProject({
        location: null,
        land: { addressLine: null, city: 'Pune', state: null, pincode: null },
      }),
    )
    expect(mapped.location).toBe('Pune')
  })

  test('falls back to "Location not specified" when everything is empty', () => {
    expect(mapProject(makeApiProject({ location: null, land: null })).location).toBe(
      'Location not specified',
    )
  })

  test('empty strings are filtered out of the join', () => {
    const mapped = mapProject(
      makeApiProject({
        location: '',
        land: { addressLine: '', city: 'Nashik', state: '', pincode: '' },
      }),
    )
    expect(mapped.location).toBe('Nashik')
  })

  test('a land without any address fields still falls back', () => {
    const mapped = mapProject(
      makeApiProject({ location: '', land: { addressLine: '', city: '', state: '', pincode: '' } }),
    )
    expect(mapped.location).toBe('Location not specified')
  })
})
