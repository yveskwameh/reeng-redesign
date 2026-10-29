import { useRef } from 'react'
import { Stage } from '../../hero-options/stage'
import { Buttons, CtaRing, EARLY, FOOT, ss, SUB, useEnter } from './shared'

/**
 * A — Centred, like the hero (a bookend: the page ends where it started). The ring rises
 * in above the headline and settles in the hero's 3/4 pose; everything else is centred
 * under it, as in the current section.
 */
export function OptionCentred() {
  const section = useRef<HTMLElement>(null)
  const slot = useRef<HTMLDivElement>(null)
  const { e, live } = useEnter(section)
  const text = ss(0.55, 1, e)

  return (
    <section ref={section} className="relative flex min-h-svh flex-col items-center justify-end px-5 pb-20 pt-24 text-center">
      <div ref={slot} aria-hidden className="h-[34svh] w-full max-w-md" />
      <div style={{ opacity: text, transform: `translateY(${(1 - text) * 30}px)` }} className="flex flex-col items-center">
        <p className="label-mono mt-6 text-violet">{EARLY}</p>
        <h2 className="display mt-4 max-w-4xl text-5xl text-ink md:text-8xl">Wear your wallet.</h2>
        <p className="mt-5 max-w-md text-lg text-ash">{SUB}</p>
        <Buttons className="mt-8 justify-center" />
        <p className="label-mono mt-6 text-ash/70">{FOOT}</p>
      </div>
      <div className="pointer-events-none absolute inset-0">
        <Stage passive>
          <CtaRing slot={slot} enter={live} fill={0.75} />
        </Stage>
      </div>
    </section>
  )
}
