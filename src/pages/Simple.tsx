import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { privacy, terms, type LegalSection } from '../content/legal'
import { product } from '../content/product'

/** The practical pages (checkout, legal, 404), on the home page's white with its type and pills. */
function Page({ eyebrow, title, children, wide = false }: { eyebrow?: string; title: string; children: ReactNode; wide?: boolean }) {
  return (
    <main className="relative z-10 min-h-svh bg-white px-5 pb-24 pt-32 text-ink md:px-8 md:pt-40">
      <div className={`mx-auto ${wide ? 'max-w-5xl' : 'max-w-3xl'}`}>
        {eyebrow && <p className="label-mono text-violet">{eyebrow}</p>}
        <h1 className="display mt-3 text-5xl md:text-7xl">{title}</h1>
        <div className="mt-8 space-y-5 text-lg text-ash">{children}</div>
      </div>
    </main>
  )
}

const pill = 'inline-flex items-center justify-center rounded-full px-7 py-3.5 font-medium transition'
const primary = `${pill} bg-violet text-white hover:bg-ink`
const secondary = `${pill} bg-mist text-ink hover:bg-line`

// Stripe Embedded Checkout mounts here once the client's Stripe account
// and the session endpoint exist (research/PRODUCT_FACTS.md → Checkout plan).
export function Checkout() {
  const [params] = useSearchParams()
  const finish = product.finishes.find((f) => f.id === params.get('finish')) ?? product.finishes[0]
  const size = Number(params.get('size')) || null
  const kit = params.get('kit') === '1'
  return (
    <Page eyebrow="Early bird" title="Checkout" wide>
      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        {/* your order, as configured */}
        <div className="rounded-3xl bg-mist p-6 md:p-8">
          <p className="label-mono text-ash">Your Reeng</p>
          <div className="mt-6 flex items-center gap-4">
            <span className="size-12 shrink-0 rounded-full ring-4 ring-white" style={{ background: finish.color }} />
            <div className="min-w-0">
              <p className="font-display text-xl font-bold text-ink md:text-2xl">{finish.name}</p>
              <p className="text-base text-ash">{size ? `US ${size}` : 'Size after your sizing kit'}</p>
            </div>
          </div>
          {kit && <p className="label-mono mt-5 inline-block rounded-full bg-white px-3 py-1.5 text-violet">+ Free sizing kit first</p>}
          <div className="mt-8 flex items-end justify-between border-t border-line pt-5">
            <span className="label-mono text-ash">Total</span>
            <span className="text-right">
              <span className="mr-2 text-base text-ash line-through">${product.price.regular}</span>
              <span className="font-display text-4xl font-bold text-ink">${product.price.earlyBird}</span>
            </span>
          </div>
        </div>
        {/* payment: Stripe goes here */}
        <div className="flex flex-col justify-between gap-6 rounded-3xl p-6 ring-1 ring-line md:p-8">
          <div>
            <p className="label-mono text-ash">Payment</p>
            <p className="mt-4 text-base">Secure checkout is coming soon.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/#order" className={secondary}>
              Change selection
            </Link>
            <p className="label-mono text-center text-ash/70">
              {product.commerce.shipping} · {product.commerce.returnsDays}-day returns
            </p>
          </div>
        </div>
      </div>
    </Page>
  )
}

export const OrderSuccess = () => (
  <Page eyebrow="Order confirmed" title="Thank you.">
    <div className="grid size-16 place-items-center rounded-full bg-lime text-2xl text-ink">✓</div>
    <p>Your Reeng is on its way.</p>
    <Link to="/" className={primary}>
      Back home
    </Link>
  </Page>
)

/** A legal document: numbered sections with paragraphs, lists and sub-headings. */
function Legal({ sections }: { sections: LegalSection[] }) {
  return (
    <ol className="mt-4 space-y-12 text-base text-ash md:text-lg">
      {sections.map((sec, i) => (
        <li key={sec.title} className="border-t border-line pt-8">
          <h2 className="flex gap-4 font-display text-xl font-bold text-ink md:text-2xl">
            <span className="label-mono pt-1.5 text-violet">{String(i + 1).padStart(2, '0')}</span>
            {sec.title}
          </h2>
          <div className="mt-4 space-y-4 md:pl-10">
            {sec.blocks.map((b, k) =>
              typeof b === 'string' ? (
                <p key={k}>{b}</p>
              ) : 'list' in b ? (
                <ul key={k} className="list-disc space-y-1.5 pl-5 marker:text-violet">
                  {b.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : 'sub' in b ? (
                <h3 key={k} className="pt-2 font-medium text-ink">
                  {b.sub}
                </h3>
              ) : (
                <p key={k}>
                  Email:{' '}
                  <a href={`mailto:${b.email}`} className="text-violet underline underline-offset-4">
                    {b.email}
                  </a>
                </p>
              ),
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

export const Privacy = () => (
  <Page eyebrow="Legal" title="Privacy Policy">
    <Legal sections={privacy} />
  </Page>
)

export const Terms = () => (
  <Page eyebrow="Legal" title="Terms of Service">
    <Legal sections={terms} />
  </Page>
)

export const NotFound = () => (
  <main className="relative z-10 grid min-h-svh place-items-center overflow-hidden bg-white px-5 text-center text-ink">
    {/* the hero's giant pale wordmark, as a 404 */}
    <p aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none font-display font-bold leading-none text-mist" style={{ fontSize: '40vw', letterSpacing: '-0.06em' }}>
      404
    </p>
    <div className="relative">
      <h1 className="display text-5xl md:text-7xl">Page not found.</h1>
      <p className="mt-4 text-lg text-ash">This page doesn’t exist, or it moved.</p>
      <Link to="/" className={`${primary} mt-8`}>
        Back home
      </Link>
    </div>
  </main>
)
