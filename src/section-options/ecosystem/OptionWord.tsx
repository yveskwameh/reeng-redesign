import { useRef } from 'react'
import { MathUtils } from 'three'
import { Stage } from '../../hero-options/stage'
import { ModeCopy, ModeRing, modes, Pulse, ResultCard, useEco, wash } from './shared'

/**
 * C — Giant word (after Zipline's huge mark behind the product, and the hero's REENG). The
 * mode's name fills the screen behind the ring, sliding over to the next as you scroll while
 * a tint wipes across in the new mode's colour. The ring taps toward the card it opens.
 */
export function OptionWord() {
  const section = useRef<HTMLElement>(null)
  const slot = useRef<HTMLDivElement>(null)
  const { live, mode: i, local } = useEco(section)
  const mode = modes[i]
  // the words and the wipe move on to the next mode at the end of each one
  const at = i + (i < modes.length - 1 ? MathUtils.smoothstep(local, 0.8, 1) : 0)

  return (
    <section ref={section} className="relative h-[300svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* the tint: each mode's wash, wiped in from the right */}
        {modes.map((m, k) => (
          <div
            key={m.id}
            aria-hidden
            className="absolute inset-0"
            style={{ background: wash(m, 0.1), clipPath: `inset(0 0 0 ${MathUtils.clamp(k - at, 0, 1) * 100}%)` }}
          />
        ))}
        {/* the giant words, one screen each */}
        <div aria-hidden className="absolute inset-y-0 left-0 flex items-center" style={{ transform: `translateX(${-at * 100}vw)` }}>
          {modes.map((m) => (
            <span
              key={m.id}
              className="w-screen select-none text-center font-display font-bold leading-none"
              style={{ fontSize: `min(30rem, ${(80 / (m.name.length * 0.9)).toFixed(1)}vw)`, letterSpacing: '-0.05em', color: wash(m, 0.16) }}
            >
              {m.name.toUpperCase()}
            </span>
          ))}
        </div>

        <div className="absolute inset-0 mx-auto flex max-w-7xl flex-col px-5 pb-6 pt-24 md:px-8 md:pb-10 md:pt-28">
          <h2 className="display text-4xl text-ink md:text-6xl">
            One ring.
            <br />
            More taps.
          </h2>
          <div ref={slot} className="absolute left-1/2 top-1/2 h-[32svh] w-[32svh] -translate-x-1/2 -translate-y-1/2 max-md:top-[44%]" />
          <Pulse id={mode.id} color={mode.text} className="left-1/2 top-1/2 max-md:top-[44%]" />
          <div className="mt-auto flex items-end justify-between gap-6">
            <ModeCopy mode={mode} className="max-w-xs" />
            <ResultCard key={mode.id} mode={mode} className="w-72 shrink-0 animate-[fade-up_0.4s_ease-out] max-md:hidden" />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0">
          <Stage>
            <ModeRing slot={slot} progress={live} fill={0.65} toward={[40, 30]} />
          </Stage>
        </div>
      </div>
    </section>
  )
}
