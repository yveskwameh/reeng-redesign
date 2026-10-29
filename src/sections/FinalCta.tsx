import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef, useState } from 'react'
import { MathUtils } from 'three'
import { product } from '../content/product'
import { trackSection } from '../lib/trackSection'
import { anchors } from '../scene/scrollState'

// the facts that close the sale, balancing the headline on the right
const FACTS = ['Never charges', product.specs.water, 'Non-custodial', `${product.specs.warrantyYears}-year warranty`]
// how far each one sits in from the right, so the column reads as scattered, not listed
const OFFSETS = ['md:mr-[18%]', 'md:mr-0', 'md:mr-[30%]', 'md:mr-[8%]']

/**
 * Closing call to action (the ring is the O, after the hero's REENG wordmark). A giant
 * "Wear your wallet." with a gap for the O of "your": as the section scrolls in, the ring
 * (RingRig `cta`) flies in from the right, turns face-on and drops into the gap. The facts
 * that close the sale pop in on the right, one by one; the copy and buttons follow.
 */
export function FinalCta() {
  const section = useRef<HTMLElement>(null)
  const [e, setE] = useState(0)

  useGSAP(
    () => {
      trackSection(section.current!, { enter: 'ctaEnter', exit: 'ctaExit' })
      // the enter progress drives the facts and copy (trackSection only reports progress while pinned)
      ScrollTrigger.create({ trigger: section.current, start: 'top bottom', end: 'top top', onUpdate: (st) => setE(st.progress) })
    },
    { scope: section },
  )
  const ss = (a: number, b: number) => MathUtils.smoothstep(e, a, b)
  const text = ss(0.65, 1)

  return (
    <section ref={section} id="get-reeng" className="relative flex min-h-svh flex-col justify-center px-5 py-24 md:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <p className="label-mono text-violet">Early bird · ${product.price.earlyBird}</p>
        <div className="mt-4 grid gap-8 md:grid-cols-[auto_1fr] md:items-center md:gap-10">
          <h2 className="display text-[17vw] leading-[0.9] text-ink md:text-[11vw] xl:text-[10rem]">
            Wear
            <br />
            y
            <span ref={(el) => void (anchors.ctaSlot = el)} aria-hidden className="inline-block h-[0.72em] w-[0.72em] align-[-0.02em]" />
            <span className="sr-only">o</span>
            ur
            <br />
            wallet.
          </h2>
          <ul aria-label="Why Reeng" className="flex flex-wrap gap-2 md:flex-col md:items-end md:gap-7">
            {FACTS.map((f, i) => {
              const on = ss(0.55 + i * 0.08, 0.7 + i * 0.08)
              return (
                <li
                  key={f}
                  className={`label-mono flex items-center gap-2.5 rounded-full bg-mist px-3.5 py-2 text-ink md:px-6 md:py-4 md:text-base ${OFFSETS[i]}`}
                  style={{ opacity: on, transform: `translateY(${(1 - on) * 16}px) scale(${0.9 + on * 0.1})` }}
                >
                  <span aria-hidden className="size-1.5 rounded-full bg-violet md:size-2" />
                  {f}
                </li>
              )
            })}
          </ul>
        </div>
        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between" style={{ opacity: text, transform: `translateY(${(1 - text) * 24}px)` }}>
          <p className="max-w-sm text-lg text-ash">Stablecoins on your finger. Tap anywhere contactless works.</p>
          <div className="flex flex-col gap-4 md:items-end">
            <div className="flex flex-wrap gap-3">
              <a href="/#order" className="rounded-full bg-violet px-7 py-3.5 font-medium text-white transition hover:bg-ink">
                Order — ${product.price.earlyBird}
              </a>
              <a href="/#faq" className="rounded-full bg-mist px-7 py-3.5 font-medium text-ink transition hover:bg-line">
                Questions
              </a>
            </div>
            <p className="label-mono text-ash/70">
              {product.commerce.shipping} · {product.specs.warrantyYears}-year warranty
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
