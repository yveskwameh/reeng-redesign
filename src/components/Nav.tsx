import { Link } from 'react-router'

const links = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#security', label: 'Security' },
  { href: '/#specs', label: 'Specs' },
  { href: '/#faq', label: 'FAQ' },
]

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4">
      <nav className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-graphite/90 px-5 py-3 backdrop-blur-md">
        <Link to="/" aria-label="Reeng home">
          <img src="/images/reeng_header_logo_light.svg" alt="Reeng" className="h-7" />
        </Link>
        <ul className="hidden gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="label-mono text-steel transition hover:text-paper">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <Link
          to="/#order"
          className="rounded-full bg-violet px-5 py-2 text-sm font-medium text-white transition hover:bg-violet-glow hover:text-ink"
        >
          Order now
        </Link>
      </nav>
    </header>
  )
}
