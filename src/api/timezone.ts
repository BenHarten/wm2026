/**
 * The API's `local_date` is stadium-local wall time (verified: all kickoffs
 * fall in the 12:00–22:00 window at every venue). Map the 16 venues to IANA
 * timezones so kickoffs can be converted to real instants and rendered in
 * the browser's timezone.
 */
export const STADIUM_TZ: Record<string, string> = {
  '1': 'America/Mexico_City', // Mexico City
  '2': 'America/Mexico_City', // Guadalajara
  '3': 'America/Monterrey', // Monterrey
  '4': 'America/Chicago', // Dallas
  '5': 'America/Chicago', // Houston
  '6': 'America/Chicago', // Kansas City
  '7': 'America/New_York', // Atlanta
  '8': 'America/New_York', // Miami
  '9': 'America/New_York', // Boston
  '10': 'America/New_York', // Philadelphia
  '11': 'America/New_York', // New York/New Jersey
  '12': 'America/Toronto', // Toronto
  '13': 'America/Vancouver', // Vancouver
  '14': 'America/Los_Angeles', // Seattle
  '15': 'America/Los_Angeles', // San Francisco Bay Area
  '16': 'America/Los_Angeles', // Los Angeles
}

/** Offset (local − UTC, in ms) of `tz` at the instant `utcMs`. */
function tzOffsetAt(utcMs: number, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date(utcMs))
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  const localAsUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour') % 24,
    get('minute'),
    get('second'),
  )
  return localAsUtc - utcMs
}

/** Convert a wall-clock time in `tz` to the actual instant (UTC Date). */
export function zonedWallTimeToDate(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
  tz: string,
): Date {
  const asUtc = Date.UTC(year, month - 1, day, hours, minutes)
  // two passes to converge across DST boundaries
  let offset = tzOffsetAt(asUtc, tz)
  offset = tzOffsetAt(asUtc - offset, tz)
  return new Date(asUtc - offset)
}
