import { useRef } from 'react'
import { Stage } from '../../hero-options/stage'
import { Buttons, CtaRing, EARLY, FOOT, product, ss, SUB, useEnter } from './shared'

// the facts that close the sale, pinned around the ring
const PILLS = [
  { label: 'Never charges', at: 'left-[8%] top-[18%]' },
  { label: product.specs.water, at: 'right-[6%] top-[30%]' },
  { label: 'Non-custodial', at: 'left-[12%] bottom-[18%]' },
  { label: `${product.specs.warrantyYears}-year warranty`, at: 'right-[10%] bottom-[12%]' },
]

/**
 * B — Product card (after Norma's closing card and Square's split banner). One big soft
 * grey card: the copy and order button on the left, the ring on the right with the facts
 * that close the sale pinned around it, popping in one by one as the card scrolls in.
 */
export function OptionCard() {
  const section = useRef<HTMLElement>(null)
  const slot = useRef<HTMLDivElement>(null)
  const { e, live } = useEnter(section)

  return (
    <section ref={section} className="relative px-3 py-10 md:px-6 md:py-16">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2.5rem] bg-mist md:min-h-[78svh] md:grid-cols-2">
        <div className="flex flex-col justify-center px-6 pb-4 pt-12 md:px-14 md:py-16">
          <p className="label-mono text-violet">{EARLY}</p>
          <h2 className="display mt-4 text-5xl text-ink md:text-7xl">Wear your wallet.</h2>
          <p className="mt-5 max-w-sm text-lg text-ash">{SUB}</p>
          <Buttons className="mt-8 [&>a:last-child]:bg-white" />
          <p className="label-mono mt-6 text-ash/70">{FOOT}</p>
        </div>
        <div className="relative h-[46svh] md:h-auto">
          <div ref={slot} aria-hidden className="absolute inset-[28%] md:inset-[18%]" />
          {PILLS.map((p, i) => {
            const on = ss(0.6 + i * 0.08, 0.75 + i * 0.08, e)
            return (
              <span
                key={p.label}
                className={`label-mono absolute rounded-full bg-white px-3 py-1.5 text-ink shadow-lg shadow-ink/5 ${p.at}`}
                style={{ opacity: on, transform: `scale(${0.8 + on * 0.2})` }}
              >
                {p.label}
              </span>
            )
          })}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0">
        <Stage passive>
          <CtaRing slot={slot} enter={live} fill={0.65} from={[0.3, 0.5]} />
        </Stage>
      </div>
    </section>
  )
}
