import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { product } from '../content/product'

const icon = (d: string) => (
  <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const links: { href: string; label: string; icon: ReactNode }[] = [
  { href: '/#how-it-works', label: 'How it works', icon: icon('M3 8h10M9 4l4 4-4 4') },
  { href: '/#security', label: 'Security', icon: icon('M8 2l5 2v4c0 3-2.2 5-5 6-2.8-1-5-3-5-6V4l5-2z') },
  { href: '/#specs', label: 'Specs', icon: icon('M2 8h12M8 2v12M4 4l8 8') },
  { href: '/#faq', label: 'FAQ', icon: icon('M6 6a2 2 0 114 0c0 1.5-2 1.5-2 3M8 12v.5') },
]

/** Logo, a dark floating pill of icon links in the middle, order on the right. */
export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
        {/* soft white backing keeps the dark wordmark readable over dark sections too */}
        <Link to="/" aria-label="Reeng home" className="-ml-3 rounded-full bg-white/80 px-3 py-2 backdrop-blur-md">
          <img src="/images/reeng_header_logo.svg" alt="Reeng" className="h-7" />
        </Link>
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full bg-ink p-1.5 shadow-lg shadow-ink/10 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white">
                {l.icon}
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <Link to="/#order" className="rounded-full bg-violet px-5 py-2.5 text-sm font-medium text-white transition hover:bg-ink">
          Order — ${product.price.earlyBird}
        </Link>
      </nav>
    </header>
  )
}
