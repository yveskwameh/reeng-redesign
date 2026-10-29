import { Compare } from '../sections/Compare'
import { CrossChain } from '../sections/CrossChain'
import { Ecosystem } from '../sections/Ecosystem'
import { Faq } from '../sections/Faq'
import { FinalCta } from '../sections/FinalCta'
import { Hero } from '../sections/Hero'
import { HowItWorks } from '../sections/HowItWorks'
import { Order } from '../sections/Order'
import { PayByEmail } from '../sections/PayByEmail'
import { Security } from '../sections/Security'
import { Specs } from '../sections/Specs'
import { TapToPay } from '../sections/TapToPay'

// Section order follows research/RESEARCH.md §4. One shared 3D ring is choreographed
// through every section via scroll progress (see scene/scrollState.ts).
export function Home() {
  return (
    <main className="relative z-10">
      <Hero />
      <TapToPay />
      <CrossChain />
      <HowItWorks />
      <Security />
      <PayByEmail />
      <Specs />
      <Order />
      <Compare />
      <Ecosystem />

      {/* still on the old dark theme; these move to the light theme one section at a time */}
      <div className="text-paper">
        <Faq />
        <FinalCta />
      </div>
    </main>
  )
}
