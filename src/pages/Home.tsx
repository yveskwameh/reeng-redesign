import { product } from '../content/product'
import { Compare } from '../sections/Compare'
import { CrossChain } from '../sections/CrossChain'
import { Ecosystem } from '../sections/Ecosystem'
import { Faq } from '../sections/Faq'
import { FinalCta } from '../sections/FinalCta'
import { HowItWorks } from '../sections/HowItWorks'
import { Order } from '../sections/Order'
import { PayByEmail } from '../sections/PayByEmail'
import { Security } from '../sections/Security'
import { Specs } from '../sections/Specs'
import { TapToPay } from '../sections/TapToPay'

const specChips = [
  `${product.specs.widthMm} mm`,
  `${product.specs.weightG} g`,
  'IP68',
  '0 charging',
  `${product.specs.warrantyYears}-yr warranty`,
]

// Section order follows research/RESEARCH.md §4. One shared 3D ring is choreographed
// through every section via scroll progress (see scene/scrollState.ts).
export function Home() {
  return (
    <main className="relative z-10">
      <section className="flex min-h-svh flex-col items-center justify-end px-6 pb-14 text-center">
        <p className="label-mono text-violet-glow">Stablecoin wallet · NFC ring</p>
        <h1 className="display mt-5 max-w-5xl text-5xl md:text-8xl">{product.tagline}</h1>
        <p className="mt-5 max-w-md text-lg text-steel">{product.summary}</p>
        <div className="mt-8 flex gap-3">
          <a href="/#order" className="rounded-full bg-violet px-7 py-3 font-medium text-white transition hover:bg-violet-glow hover:text-ink">
            Order — ${product.price.earlyBird}
          </a>
          <a href="#how-it-works" className="rounded-full border border-white/15 px-7 py-3 font-medium text-paper transition hover:border-white/40">
            How it works
          </a>
        </div>
        <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {specChips.map((c) => (
            <li key={c} className="label-mono text-steel">{c}</li>
          ))}
        </ul>
      </section>

      <TapToPay />
      <CrossChain />
      <HowItWorks />
      <Security />
      <PayByEmail />
      <Specs />
      <Order />
      <Compare />
      <Ecosystem />

      <Faq />
      <FinalCta />
    </main>
  )
}
