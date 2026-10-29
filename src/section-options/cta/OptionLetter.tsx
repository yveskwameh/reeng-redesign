import { useRef } from 'react'
import { Stage } from '../../hero-options/stage'
import { Buttons, CtaRing, EARLY, FOOT, ss, SUB, useEnter } from './shared'

/**
 * D — The ring is the O (after the hero's REENG wordmark). A giant "Wear your wallet."
 * with a gap where the O of "your" should be; as the section scrolls in, the ring flies
 * in from the right, turns face-on and drops into the gap to finish the word.
 */
export function OptionLetter() {
  const section = useRef<HTMLElement>(null)
  const slot = useRef<HTMLSpanElement>(null)
  const { e, live } = useEnter(section)
  const text = ss(0.65, 1, e)

  return (
    <section ref={section} className="relative flex min-h-svh flex-col justify-center px-5 py-24 md:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <p className="label-mono text-violet">{EARLY}</p>
        <h2 className="display mt-4 text-[17vw] leading-[0.9] text-ink md:text-[11vw] xl:text-[10rem]">
          Wear
          <br />
          y
          <span ref={slot} aria-hidden className="inline-block h-[0.72em] w-[0.72em] align-[-0.02em]" />
          <span className="sr-only">o</span>
          ur
          <br />
          wallet.
        </h2>
        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between" style={{ opacity: text, transform: `translateY(${(1 - text) * 24}px)` }}>
          <p className="max-w-sm text-lg text-ash">{SUB}</p>
          <div className="flex flex-col gap-4 md:items-end">
            <Buttons />
            <p className="label-mono text-ash/70">{FOOT}</p>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0">
        <Stage passive>
          <CtaRing slot={slot} enter={live} pose="face" fill={1.05} from={[0.6, 0.3]} />
        </Stage>
      </div>
    </section>
  )
}
