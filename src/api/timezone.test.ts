import { describe, expect, test } from 'vitest'
import { STADIUM_TZ, zonedWallTimeToDate } from './timezone'

describe('zonedWallTimeToDate', () => {
  test('Mexico City 13:00 in June 2026 is 19:00 UTC (UTC-6, no DST)', () => {
    const d = zonedWallTimeToDate(2026, 6, 11, 13, 0, 'America/Mexico_City')
    expect(d.toISOString()).toBe('2026-06-11T19:00:00.000Z')
  })

  test('Los Angeles 12:00 in June 2026 is 19:00 UTC (PDT, UTC-7)', () => {
    const d = zonedWallTimeToDate(2026, 6, 28, 12, 0, 'America/Los_Angeles')
    expect(d.toISOString()).toBe('2026-06-28T19:00:00.000Z')
  })

  test('New York 15:00 in June 2026 is 19:00 UTC (EDT, UTC-4)', () => {
    const d = zonedWallTimeToDate(2026, 6, 12, 15, 0, 'America/New_York')
    expect(d.toISOString()).toBe('2026-06-12T19:00:00.000Z')
  })

  test('winter date uses standard offset (NY in January is UTC-5)', () => {
    const d = zonedWallTimeToDate(2026, 1, 15, 12, 0, 'America/New_York')
    expect(d.toISOString()).toBe('2026-01-15T17:00:00.000Z')
  })
})

describe('STADIUM_TZ', () => {
  test('covers all 16 stadium ids', () => {
    for (let id = 1; id <= 16; id++) {
      expect(STADIUM_TZ[String(id)], `stadium ${id}`).toBeTruthy()
    }
  })
})
