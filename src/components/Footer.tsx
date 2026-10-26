import { Link } from 'react-router'
import { product } from '../content/product'

const year = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-ink px-6 py-20 text-paper">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
        <img src="/images/reeng_logo_full_white.webp" alt="Reeng" className="h-14" />
        <p className="max-w-2xl text-sm text-steel">
          Reeng is a wearable, non-custodial stablecoin wallet built on the Base blockchain. Third-party
          terms and conditions apply wherever third-party services are used. Reeng does not provide
          investment or financial advice, and we do not offer any exchange services.
        </p>
        <div className="flex gap-6">
          <a href={product.social.x} aria-label="X"><img src="/images/x.svg" alt="" className="h-5 invert" /></a>
          <a href={product.social.instagram} aria-label="Instagram"><img src="/images/instagram.svg" alt="" className="h-5 invert" /></a>
          <a href={product.social.linkedin} aria-label="LinkedIn"><img src="/images/linkedin.svg" alt="" className="h-5 invert" /></a>
        </div>
        <div className="label-mono flex gap-6 text-steel">
          <Link to="/privacy-policy" className="hover:text-paper">Privacy</Link>
          <Link to="/terms-of-service" className="hover:text-paper">Terms</Link>
          <span>Reeng © {year}</span>
        </div>
      </div>
    </footer>
  )
}
