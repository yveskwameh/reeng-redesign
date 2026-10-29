// Everyday places the tap-to-pay section walks through, one tap each. Merchants and baskets are
// illustrative (made up), amounts in USD.

export type Place = { word: string; merchant: string; items: [string, string][]; amount: number }

// one tap is enough to get it across; add places here and the section grows to fit
export const PLACES: Place[] = [{ word: 'COFFEE', merchant: 'Blue Bottle', items: [['Flat white', '4.20']], amount: 4.2 }]
