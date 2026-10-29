import { useRef } from 'react'
import { Stage } from '../../hero-options/stage'
import { Buttons, CtaRing, EARLY, FOOT, ss, SUB, useEnter } from './shared'

/**
 * C — Violet panel (after The Leap's bold closing band). The one place the page goes
 * full brand colour: a big violet panel with white type, the ring rising onto it on the
 * right. The panel grows from a card to nearly full width as it scrolls in.
 */
export function OptionPanel() {
  const section = useRef<HTMLElement>(null)
  const slot = useRef<HTMLDivElement>(null)
  const { e, live } = useEnter(section)
  const grow = ss(0.2, 0.9, e)

  return (
    <section ref={section} className="relative py-10 md:py-16">
      <div
        className="mx-auto grid overflow-hidden bg-violet text-white md:min-h-[80svh] md:grid-cols-[1.1fr_1fr]"
        // from an inset card to nearly the full width
        style={{ width: `calc(100% - ${1.5 + (1 - grow) * 10}rem)`, borderRadius: `${2.5 - grow}rem`, maxWidth: '90rem' }}
      >
        <div className="flex flex-col justify-center px-6 pb-4 pt-12 md:px-14 md:py-16">
          <p className="label-mono text-white/70">{EARLY}</p>
          <h2 className="display mt-4 text-5xl md:text-8xl">Wear your wallet.</h2>
          <p className="mt-5 max-w-sm text-lg text-white/75">{SUB}</p>
          <Buttons light className="mt-8" />
          <p className="label-mono mt-6 text-white/60">{FOOT}</p>
        </div>
        <div className="relative h-[44svh] md:h-auto">
          <div ref={slot} aria-hidden className="absolute inset-[12%]" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0">
        <Stage passive>
          <CtaRing slot={slot} enter={live} fill={0.85} from={[0, 0.6]} />
        </Stage>
      </div>
    </section>
  )
}
