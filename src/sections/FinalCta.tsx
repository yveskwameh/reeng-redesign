import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { product } from '../content/product'
import { trackSection } from '../lib/trackSection'

/**
 * Closing call to action. The ring flies back in above the headline (RingRig `cta`),
 * wearing the finish chosen in the configurator, and can be dragged to spin once more.
 */
export function FinalCta() {
  const section = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      trackSection(section.current!, { enter: 'ctaEnter', exit: 'ctaExit' })
    },
    { scope: section },
  )

  return (
    <section ref={section} id="get-reeng" className="relative flex min-h-svh flex-col items-center justify-end px-6 pb-20 text-center">
      <p className="label-mono text-violet-glow">Early bird · ${product.price.earlyBird}</p>
      <h2 className="display mt-5 max-w-4xl text-5xl md:text-8xl">Wear your wallet.</h2>
      <p className="mt-5 max-w-md text-lg text-steel">Stablecoins on your finger. Tap anywhere contactless works.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href="/#order" className="rounded-full bg-violet px-8 py-3.5 font-medium text-white transition hover:bg-violet-glow hover:text-ink">
          Order — ${product.price.earlyBird}
        </a>
        <a href="/#faq" className="rounded-full border border-white/15 px-8 py-3.5 font-medium text-paper transition hover:border-white/40">
          Questions
        </a>
      </div>
      <p className="label-mono mt-6 text-steel/70">
        {product.commerce.shipping} · {product.specs.warrantyYears}-year warranty
      </p>
    </section>
  )
}
