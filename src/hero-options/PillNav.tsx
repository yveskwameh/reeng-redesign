import type { ReactNode } from 'react'
import { product } from '../content/product'
import { Logo } from './stage'

const icon = (d: string) => (
  <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const links: { label: string; icon: ReactNode }[] = [
  { label: 'How it works', icon: icon('M3 8h10M9 4l4 4-4 4') },
  {
    label: 'Security',
    icon: icon('M8 2l5 2v4c0 3-2.2 5-5 6-2.8-1-5-3-5-6V4l5-2z'),
  },
  { label: 'Specs', icon: icon('M2 8h12M8 2v12M4 4l8 8') },
  { label: 'FAQ', icon: icon('M6 6a2 2 0 114 0c0 1.5-2 1.5-2 3M8 12v.5') },
]

/** Logo, a dark floating pill of icon links in the middle, order on the right (from option B). */
export function PillNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
        <Logo />
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full bg-ink p-1.5 shadow-lg shadow-ink/10 md:flex">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href="#"
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                {l.icon}
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a href="#" className="rounded-full bg-violet px-5 py-2.5 text-sm font-medium text-white transition hover:bg-ink">
          Order — ${product.price.earlyBird}
        </a>
      </nav>
    </header>
  )
}
