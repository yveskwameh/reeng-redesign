import { product } from './product'
import { innerDiameter } from './sizing'

// Answers built from product.ts so they stay in step with the facts (and their
// "assumed" flags) — see research/PRODUCT_FACTS.md.
const { specs, payments, commerce, sizes } = product

export const faqTopics = ['Setup', 'Payments', 'Security', 'Hardware', 'Orders'] as const
export type FaqTopic = (typeof faqTopics)[number]

export const faq: { topic: FaqTopic; q: string; a: string }[] = [
  {
    topic: 'Setup',
    q: 'How do I set up my Reeng?',
    a: 'Pair it once in the Reeng app, set your PIN and limits, and it’s ready to tap. The app is coming soon to iOS and Android.',
  },
  {
    topic: 'Setup',
    q: 'How do I find my size?',
    a: `Use the sizer next to the size picker: measure on screen, print the A4 sizer, or get a free sizing kit first. Sizes run US ${sizes[0]}–${sizes[sizes.length - 1]} (${innerDiameter(sizes[0]).toFixed(1)}–${innerDiameter(sizes[sizes.length - 1]).toFixed(1)} mm inside). Between two? Pick the larger one.`,
  },
  {
    topic: 'Setup',
    q: 'Do I need my phone to pay?',
    a: 'No. Your phone is only for setup and settings. Once paired, the ring pays on its own — even if your phone is flat or at home.',
  },
  {
    topic: 'Payments',
    q: 'Where can I pay with Reeng?',
    a: `${payments.acceptedAt}. If it takes a tap from a card, it takes a tap from your ring.`,
  },
  {
    topic: 'Payments',
    q: 'Which stablecoins and chains does it support?',
    a: `Send ${payments.coinsIn.join(', ')} from any supported chain. Reeng bridges it automatically and holds it as ${payments.settlesTo}.`,
  },
  {
    topic: 'Payments',
    q: 'Can I receive money by email?',
    a: 'Yes. Share a one-time email alias; when someone pays it, the funds land on your ring and the alias is retired. Your real address is never shared.',
  },
  {
    topic: 'Payments',
    q: 'Does Reeng charge any fees?',
    a: 'Reeng has no hidden fees. Network and third-party fees may apply depending on the service used.',
  },
  {
    topic: 'Security',
    q: 'Is Reeng custodial?',
    a: `No. ${payments.custody}. Reeng never holds your funds.`,
  },
  {
    topic: 'Security',
    q: 'What happens if I lose my ring?',
    a: 'Revoke it in the app and it stops paying instantly. Your funds stay in your wallet, ready for a replacement ring.',
  },
  {
    topic: 'Security',
    q: 'Can I control when and how much it spends?',
    a: 'Yes. Turn on a PIN for every tap, set per-tap and daily limits, and choose the days and hours it’s active.',
  },
  {
    topic: 'Hardware',
    q: 'Does it need charging?',
    a: 'No, never. There’s no battery inside: the terminal’s own field powers the ring for the moment you tap.',
  },
  {
    topic: 'Hardware',
    q: 'Can I swim or shower with it?',
    a: `Yes — it’s rated ${specs.water}. Wear it everywhere.`,
  },
  {
    topic: 'Hardware',
    q: 'What is it made of?',
    a: `A ${specs.shell.toLowerCase()} shell over a ${specs.liner.toLowerCase()} liner. ${specs.widthMm} mm wide, ${specs.thicknessMm} mm thin, about ${specs.weightG} g.`,
  },
  {
    topic: 'Orders',
    q: 'When will my order ship?',
    a: `${commerce.shipping}. With a sizing kit, your ring ships once you confirm your size.`,
  },
  {
    topic: 'Orders',
    q: 'Can I return it? Is there a warranty?',
    a: `Unworn rings can be returned within ${commerce.returnsDays} days. Every Reeng has a ${specs.warrantyYears}-year warranty.`,
  },
]
