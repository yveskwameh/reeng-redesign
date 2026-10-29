import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { Link } from 'react-router'
import { reveal } from '../lib/reveal'
import { modes } from '../content/ecosystem'
import { product } from '../content/product'

export const year = new Date().getFullYear()

export const DISCLAIMER =
  'Reeng is a wearable, non-custodial stablecoin wallet built on the Base blockchain. Third-party terms and conditions apply wherever third-party services are used. Reeng does not provide investment or financial advice, and we do not offer any exchange services.'

type Item = { label: string; href: string; route?: boolean; external?: boolean }
export const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: 'Ring',
    items: [
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Security', href: '/#security' },
      { label: 'Specs', href: '/#specs' },
      { label: 'Order', href: '/#order' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
  {
    title: 'One ring, more taps',
    items: modes.map((m) => ({ label: m.product, href: m.href ?? '/', external: !!m.href })),
  },
  {
    title: 'Legal',
    items: [
      { label: 'Privacy', href: '/privacy-policy', route: true },
      { label: 'Terms', href: '/terms-of-service', route: true },
    ],
  },
]

const SOCIAL = [
  { label: 'X', href: product.social.x, icon: '/images/x.svg' },
  { label: 'Instagram', href: product.social.instagram, icon: '/images/instagram.svg' },
  { label: 'LinkedIn', href: product.social.linkedin, icon: '/images/linkedin.svg' },
]

/** The link columns. */
export function Columns({ dark = false, className = '' }: { dark?: boolean; className?: string }) {
  const head = dark ? 'text-white/45' : 'text-ash'
  const link = dark ? 'text-white/85 hover:text-white' : 'text-ink hover:text-violet'
  return (
    <nav aria-label="Footer" className={`grid grid-cols-2 gap-8 sm:grid-cols-3 ${className}`}>
      {GROUPS.map((g) => (
        <div key={g.title}>
          <p className={`label-mono ${head}`}>{g.title}</p>
          <ul className="mt-4 space-y-2.5">
            {g.items.map((it) => (
              <li key={it.label}>
                {it.route ? (
                  <Link to={it.href} className={`transition ${link}`}>
                    {it.label}
                  </Link>
                ) : (
                  <a href={it.href} {...(it.external && { target: '_blank', rel: 'noreferrer' })} className={`transition ${link}`}>
                    {it.label}
                    {it.external && ' ↗'}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

/** Round social buttons. */
export function Social({ dark = false, className = '' }: { dark?: boolean; className?: string }) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {SOCIAL.map((s) => (
        <a
          key={s.label}
          href={s.href}
          aria-label={s.label}
          target="_blank"
          rel="noreferrer"
          className={`grid size-10 place-items-center rounded-full transition ${dark ? 'bg-white/10 hover:bg-white/20' : 'bg-mist hover:bg-line'}`}
        >
          <img src={s.icon} alt="" className={`size-4 ${dark ? 'invert' : ''}`} />
        </a>
      ))}
    </div>
  )
}

export function Logo({ dark = false, className = 'h-8' }: { dark?: boolean; className?: string }) {
  return <img src={dark ? '/images/reeng_logo_full_white.webp' : '/images/reeng_logo_full.png'} alt="Reeng" className={`w-auto ${className}`} />
}

/**
 * The site footer: the one dark block on the page, a rounded ink card inset from the edges
 * like the other cards (after Ploy's and Loom's inset footers). Logo and order button on
 * top, the link columns and socials, then the disclaimer and copyright along the foot.
 */
export function Footer() {
  const footer = useRef<HTMLElement>(null)
  useGSAP(() => reveal(footer.current!), { scope: footer })

  return (
    <footer ref={footer} className="relative z-10 bg-white p-3 md:p-5">
      <div className="mx-auto max-w-[90rem] rounded-[2rem] bg-ink px-6 py-12 text-white md:rounded-[2.5rem] md:px-14 md:py-16">
        <div data-reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Logo dark className="h-9" />
            <p className="display mt-8 max-w-md text-3xl md:text-5xl">Your wallet, on your finger.</p>
          </div>
          <a href="/#order" className="self-start rounded-full bg-violet px-7 py-3.5 font-medium text-white transition hover:bg-violet-glow hover:text-ink md:self-auto">
            Order your Reeng
          </a>
        </div>
        <div data-reveal className="mt-12 flex flex-col gap-10 border-t border-white/10 pt-10 md:flex-row md:justify-between">
          <Columns dark className="md:min-w-[32rem]" />
          <Social dark />
        </div>
        <div className="mt-12 flex flex-col gap-4 text-sm text-white/45 md:flex-row md:justify-between">
          <p className="max-w-3xl">{DISCLAIMER}</p>
          <p className="label-mono shrink-0">Reeng © {year}</p>
        </div>
      </div>
    </footer>
  )
}
