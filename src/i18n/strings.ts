export type Locale = 'en' | 'de'

const strings = {
  appTitle: { en: 'World Cup', de: 'WM' },
  tabMatches: { en: 'Matches', de: 'Spiele' },
  tabGroups: { en: 'Groups', de: 'Gruppen' },
  tabBracket: { en: 'Bracket', de: 'K.O.-Phase' },
  live: { en: 'LIVE', de: 'LIVE' },
  finished: { en: 'FT', de: 'Ende' },
  today: { en: 'Today', de: 'Heute' },
  tomorrow: { en: 'Tomorrow', de: 'Morgen' },
  yesterday: { en: 'Yesterday', de: 'Gestern' },
  matchday: { en: 'Matchday', de: 'Spieltag' },
  group: { en: 'Group', de: 'Gruppe' },
  roundOf32: { en: 'Round of 32', de: 'Sechzehntelfinale' },
  roundOf16: { en: 'Round of 16', de: 'Achtelfinale' },
  quarterFinals: { en: 'Quarter-finals', de: 'Viertelfinale' },
  semiFinals: { en: 'Semi-finals', de: 'Halbfinale' },
  thirdPlace: { en: 'Third place', de: 'Spiel um Platz 3' },
  final: { en: 'Final', de: 'Finale' },
  loading: { en: 'Loading…', de: 'Lädt…' },
  error: { en: 'Could not load data. Pull to retry.', de: 'Daten konnten nicht geladen werden.' },
  retry: { en: 'Retry', de: 'Erneut versuchen' },
  refresh: { en: 'Refresh', de: 'Aktualisieren' },
  updated: { en: 'Updated', de: 'Aktualisiert' },
  noMatchesToday: { en: 'No matches this day', de: 'Keine Spiele an diesem Tag' },
  team: { en: 'Team', de: 'Team' },
  statPlayed: { en: 'P', de: 'Sp' },
  statDiff: { en: '+/−', de: '+/−' },
  statPoints: { en: 'Pts', de: 'Pkt' },
  winnerGroup: { en: 'Winner Group', de: 'Sieger Gruppe' },
  runnerUpGroup: { en: 'Runner-up Group', de: 'Zweiter Gruppe' },
  thirdGroup: { en: '3rd Group', de: 'Dritter Gruppe' },
  winnerMatch: { en: 'Winner Match', de: 'Sieger Spiel' },
  loserMatch: { en: 'Loser Match', de: 'Verlierer Spiel' },
  capacity: { en: 'Capacity', de: 'Kapazität' },
  localTime: { en: 'local time', de: 'Ortszeit' },
  legend: { en: 'Top 2 + best thirds advance', de: 'Top 2 + beste Dritte kommen weiter' },
} as const

export type StringKey = keyof typeof strings

export function t(key: StringKey, locale: Locale): string {
  return strings[key][locale]
}

/** Localize KO placeholder labels like "Winner Group E" / "3rd Group A/B/C/D/F". */
export function localizeLabel(label: string, locale: Locale): string {
  if (locale === 'en') return label
  return label
    .replace(/^Winner Group/, 'Sieger Gruppe')
    .replace(/^Runner-up Group/, 'Zweiter Gruppe')
    .replace(/^3rd Group/, 'Dritter Gruppe')
    .replace(/^Winner Match/, 'Sieger Spiel')
    .replace(/^Loser Match/, 'Verlierer Spiel')
    .replace(/^Winner (SF\d)/, 'Sieger $1')
    .replace(/^Loser (SF\d)/, 'Verlierer $1')
}
