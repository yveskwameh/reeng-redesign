import { useRef } from 'react'
import { Stage } from '../../hero-options/stage'
import { ModeCopy, ModeRing, modes, Pulse, ResultCard, useEco, wash } from './shared'

/**
 * A — Tabbed stage (after Affinity's and Monologue's mode tabs over one big stage). The tabs
 * fill as you scroll through each mode; the stage takes the mode's tint, the ring taps across
 * to the card beside it, and the card shows what that tap opens.
 */
export function OptionTabs() {
  const section = useRef<HTMLElement>(null)
  const slot = useRef<HTMLDivElement>(null)
  const { live, mode: i, local } = useEco(section)
  const mode = modes[i]

  return (
    <section ref={section} className="relative h-[300svh]">
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden px-5 pb-6 pt-24 md:px-8 md:pb-8 md:pt-28">
        <div className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col">
          <div className="text-center">
            <h2 className="display text-4xl text-ink md:text-6xl">One ring. More taps.</h2>
            {/* tabs, each filling as its mode is scrolled through */}
            <div role="tablist" aria-label="Ring modes" className="mx-auto mt-5 inline-flex gap-1 rounded-full bg-mist p-1 md:mt-6">
              {modes.map((m, k) => (
                <span key={m.id} role="tab" aria-selected={k === i} className="relative overflow-hidden rounded-full px-5 py-2 text-sm font-medium">
                  {k === i && <span className="absolute inset-0 rounded-full bg-white shadow-sm" />}
                  {k === i && <span className="absolute inset-y-0 left-0 opacity-15" style={{ width: `${local * 100}%`, background: m.text }} />}
                  <span className="relative" style={{ color: k === i ? m.text : undefined }}>
                    {m.name}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* the stage */}
          <div className="relative mt-5 grid min-h-0 flex-1 grid-rows-[1fr_auto] rounded-[2rem] transition-colors duration-500 md:mt-8 md:grid-cols-[1.1fr_1fr] md:grid-rows-1" style={{ background: wash(mode) }}>
            <div className="relative min-h-0">
              <div ref={slot} className="absolute inset-x-6 bottom-6 top-6 md:inset-x-10 md:bottom-36 md:top-10" />
              <Pulse id={mode.id} color={mode.text} className="left-1/2 top-1/2 md:top-[42%]" />
              <ModeCopy mode={mode} className="absolute bottom-5 left-5 max-w-xs max-md:hidden md:bottom-7 md:left-7" />
            </div>
            <div className="flex items-center justify-center p-4 md:p-8">
              <ResultCard key={mode.id} mode={mode} className="w-full max-w-[17rem] animate-[fade-up_0.4s_ease-out] max-md:max-w-[13rem] max-md:text-[0.85em]" />
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0">
          <Stage>
            <ModeRing slot={slot} progress={live} fill={0.6} toward={[50, 0]} />
          </Stage>
        </div>
      </div>
    </section>
  )
}
