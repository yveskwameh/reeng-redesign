import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { product } from '../content/product'

function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    // practical pages (checkout, legal) sit on paper — calmer than the ink showcase
    <main className="relative z-10 min-h-svh bg-paper px-6 pt-36 pb-24 text-ink">
      <div className="mx-auto max-w-3xl">
        <h1 className="display text-4xl">{title}</h1>
        <div className="mt-6 space-y-4 text-ink/70">{children}</div>
      </div>
    </main>
  )
}

// Stripe Embedded Checkout mounts here once the client's Stripe account
// and the session endpoint exist (research/PRODUCT_FACTS.md → Checkout plan).
export function Checkout() {
  const [params] = useSearchParams()
  const finish = product.finishes.find((f) => f.id === params.get('finish')) ?? product.finishes[0]
  const size = Number(params.get('size')) || null
  const kit = params.get('kit') === '1'
  return (
    <Page title="Checkout">
      <div className="rounded-2xl border border-ink/10 bg-white p-5">
        <p className="label-mono text-ink/50">Your Reeng</p>
        <p className="mt-2 flex items-center gap-3 text-lg text-ink">
          <span className="size-5 rounded-full border border-ink/10" style={{ background: finish.color }} />
          {finish.name} · {size ? `US ${size}` : 'Size after sizing kit'}
          <span className="ml-auto font-display font-bold">${product.price.earlyBird}</span>
        </p>
        {kit && <p className="label-mono mt-2 text-violet">+ Free sizing kit first</p>}
      </div>
      <p>Stripe checkout will mount here (research/PRODUCT_FACTS.md → Checkout plan).</p>
      <Link to="/#order" className="text-violet underline">Change selection</Link>
    </Page>
  )
}

export const OrderSuccess = () => (
  <Page title="Order confirmed">
    <p>Thanks — your Reeng is on its way.</p>
  </Page>
)

export const Privacy = () => (
  <Page title="Privacy Policy">
    <p>Content to be migrated from reeng.xyz/privacy-policy.</p>
  </Page>
)

export const Terms = () => (
  <Page title="Terms of Service">
    <p>Content to be migrated from reeng.xyz/terms-of-service.</p>
  </Page>
)

export const NotFound = () => (
  <Page title="Page not found">
    <Link to="/" className="text-violet underline">Back home</Link>
  </Page>
)
