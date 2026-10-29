// Single source for product facts. Values marked `assumed` are placeholders
// (see research/PRODUCT_FACTS.md) — change them here when the client confirms.

export const product = {
  name: 'Reeng',
  tagline: 'Your wallet, on your finger.',
  summary:
    'A non-custodial stablecoin wallet you wear. Tap to pay anywhere contactless cards are accepted.',

  price: { regular: 20, earlyBird: 15, currency: 'USD' }, // confirmed by the client
  finishes: [
    { id: 'onyx', name: 'Onyx Black', color: '#050506', available: true },
    { id: 'graphite', name: 'Graphite', color: '#3a3b40', available: false }, // assumed
    { id: 'pearl', name: 'Pearl White', color: '#ecebef', available: false }, // assumed
  ],
  sizes: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13], // US, from the client's printable sizer

  specs: {
    shell: 'Zirconia ceramic, high-gloss', // assumed
    liner: 'Medical-grade resin', // assumed
    widthMm: 8, // assumed
    thicknessMm: 2.4, // assumed
    weightG: 5, // assumed
    chip: 'Passive NFC (13.56 MHz) with secure element', // assumed
    battery: 'None — never needs charging',
    water: 'IP68, swim-safe', // assumed
    warrantyYears: 5,
  },

  payments: {
    acceptedAt: 'Any contactless card terminal',
    coinsIn: ['USDC', 'USDT', 'cUSD'],
    settlesTo: 'USDC on Base',
    custody: 'Non-custodial — export your keys anytime',
  },

  app: { status: 'coming-soon' as const, platforms: ['iOS', 'Android'] },

  commerce: {
    shipping: 'Ships worldwide in 2–4 weeks', // assumed
    freeShippingOver: 150, // assumed
    returnsDays: 30, // assumed
  },

  social: {
    x: 'https://x.com/wearreeng',
    instagram: 'https://www.instagram.com/wearreeng/',
    linkedin: 'https://www.linkedin.com/company/wearreeng/',
  },
}

export type Finish = (typeof product.finishes)[number]
