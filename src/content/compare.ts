// Reeng vs. the usual ways to pay. Columns are product categories, not named
// competitors — "varies" marks features that depend on the provider.

export type Mark = 'yes' | 'no' | 'varies'

export const compareColumns = [
  { id: 'reeng', name: 'Reeng' },
  { id: 'card', name: 'Bank card' },
  { id: 'phone', name: 'Phone wallet' },
  { id: 'rings', name: 'Other smart rings' },
] as const

export const compareRows: { feature: string; marks: [Mark, Mark, Mark, Mark] }[] = [
  { feature: 'Tap to pay at card terminals', marks: ['yes', 'yes', 'yes', 'varies'] },
  { feature: 'Spend stablecoins directly', marks: ['yes', 'no', 'varies', 'no'] },
  { feature: 'You hold the keys', marks: ['yes', 'no', 'varies', 'varies'] },
  { feature: 'Never needs charging', marks: ['yes', 'yes', 'no', 'varies'] },
  { feature: 'Works when your phone dies', marks: ['yes', 'yes', 'no', 'varies'] },
  { feature: 'Waterproof, always on you', marks: ['yes', 'no', 'no', 'yes'] },
  { feature: 'PIN, limits and time locks', marks: ['yes', 'varies', 'varies', 'no'] },
  { feature: 'Receive by email alias', marks: ['yes', 'no', 'no', 'no'] },
]
