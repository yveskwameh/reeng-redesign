// Everyday places the tap-to-pay section walks through. Merchants and baskets are
// illustrative (made up), amounts in USD.

export type Place = { word: string; merchant: string; items: [string, string][]; amount: number }

export const PLACES: Place[] = [
  { word: 'COFFEE', merchant: 'Blue Bottle', items: [['Flat white', '4.20']], amount: 4.2 },
  { word: 'METRO', merchant: 'Metro', items: [['Single fare', '2.75']], amount: 2.75 },
  {
    word: 'MARKET',
    merchant: 'Corner Market',
    items: [
      ['Sourdough', '5.20'],
      ['Oat milk', '3.40'],
      ['Apples', '3.80'],
    ],
    amount: 12.4,
  },
  { word: 'CINEMA', merchant: 'Cinema', items: [['1 × Adult', '9.00']], amount: 9.0 },
]
