import { useRef } from 'react'
import { MathUtils } from 'three'
import { Stage } from '../../hero-options/stage'
import { ModeRing, modes, Pulse, ResultCard, useEco, wash } from './shared'

/**
 * B — Three panels (after Daylight's and Notion's side-by-side use cases). Pay, ID and
 * Events stand as three tall panels; the ring travels along the top from one to the next as
 * you scroll, tapping into each, and the panel it's over lights up. On phones the panels
 * slide past under the ring, one at a time.
 */
export function OptionPanels() {
  const section = useRef<HTMLElement>(null)
  const slot = useRef<HTMLDivElement>(null)
  const { live, mode: i, local } = useEco(section)
  // where the ring is, continuous: it moves on to the next panel at the end of each mode
  const at = i + (i < modes.length - 1 ? MathUtils.smoothstep(local, 0.75, 1) : 0)

  return (
    <section ref={section} className="relative h-[300svh]">
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden px-5 pb-6 pt-24 md:px-8 md:pb-8 md:pt-28">
        <div className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col">
          <h2 className="display text-4xl text-ink md:text-6xl">One ring. More taps.</h2>

          <div className="relative mt-4 min-h-0 flex-1 md:mt-6">
            {/* the ring's spot, riding along the top of the panels */}
            <div
              ref={slot}
              className="absolute left-0 top-0 z-10 h-24 w-full md:left-[calc(var(--at)*(100%+1rem)/3)] md:h-28 md:w-[calc((100%-2rem)/3)]"
              style={{ '--at': at } as React.CSSProperties}
            />
            <div className="h-full overflow-hidden md:overflow-visible">
              <div
                className="flex h-full gap-4 max-md:translate-x-[calc(var(--at)*-1*(100%+1rem))] md:grid md:grid-cols-3"
                style={{ '--at': at } as React.CSSProperties}
              >
                {modes.map((m, k) => {
                  const on = 1 - Math.min(1, Math.abs(at - k))
                  return (
                    <div
                      key={m.id}
                      className="relative flex w-full shrink-0 flex-col items-center rounded-[2rem] px-5 pb-5 pt-28 transition-colors md:w-auto md:pt-32"
                      style={{ background: on > 0.5 ? wash(m, 0.1) : 'var(--color-mist)', opacity: 0.55 + on * 0.45 }}
                    >
                      {k === i && <Pulse id={m.id} color={m.text} className="left-1/2 top-12 md:top-14" />}
                      <p className="label-mono" style={{ color: m.text }}>
                        {m.name}
                      </p>
                      <p className="mt-2 max-w-[16rem] text-center text-sm text-ink/70">{m.body}</p>
                      <ResultCard mode={m} className="mt-4 w-full max-w-[14rem] origin-top text-[0.85em] transition-transform duration-300" />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0">
          <Stage>
            <ModeRing slot={slot} progress={live} fill={1.1} toward={[0, 22]} />
          </Stage>
        </div>
      </div>
    </section>
  )
}
