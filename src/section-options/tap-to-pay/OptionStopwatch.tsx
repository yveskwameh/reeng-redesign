import { useRef, useState } from 'react'
import { MathUtils } from 'three'
import { Stage } from '../../hero-options/stage'
import { TAP_BEATS, tapFx, TapScene, useSectionProgress, type TapFx } from './shared'

// typical checkout times, in seconds (approximate; Reeng's from product facts)
const RACE = [
  { name: 'Reeng ring', time: 0.8, note: 'Tap' },
  { name: 'Phone wallet', time: 1.9, note: 'Unlock, open, tap' },
  { name: 'Card + PIN', time: 4.2, note: 'Find, insert, PIN, wait' },
]
const CLOCK_END = 4.5 // seconds of simulated time across the race

/**
 * B — Stopwatch (after Giga / Speakeasy's big speed figures and Altitude's old-way vs
 * new-way). Scroll runs a race clock: the ring taps and stops at 0.8 s while the phone
 * wallet and card + PIN bars are still filling.
 */
export function OptionStopwatch() {
  const section = useRef<HTMLElement>(null)
  const fx = useRef<TapFx>({ dip: 0, paid: 0 })
  const [clock, setClock] = useState(0)

  useSectionProgress(section, (p) => {
    // the race starts as the ring touches down; the tap itself plays out in the first third
    fx.current = tapFx(MathUtils.clamp(p * 1.6, 0, 1))
    const start = TAP_BEATS.touch / 1.6
    setClock(MathUtils.clamp((p - start) / (0.9 - start), 0, 1) * CLOCK_END)
  })

  const reeng = Math.min(clock, RACE[0].time)

  return (
    <section ref={section} className="relative h-[300svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <Stage>
          <TapScene fx={fx} position={[1.6, -0.2, 0]} scale={0.9} narrow={{ position: [0.35, -1.45, 0], scale: 0.42 }} />
        </Stage>
        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-7xl flex-col justify-center px-5 md:px-8">
          <h2 className="display text-4xl text-ink md:text-6xl">
            Tap. <span className={reeng >= RACE[0].time ? 'text-violet' : ''}>Paid.</span>
          </h2>
          {/* the clock: Reeng's time, frozen once it's paid */}
          <p className="mt-6 font-mono text-7xl tabular-nums tracking-tight text-ink md:text-[9rem] md:leading-none">
            {reeng.toFixed(2)}
            <span className="ml-2 text-2xl text-ash md:text-4xl">s</span>
          </p>

          <ul className="mt-8 w-full max-w-lg space-y-4">
            {RACE.map((r, i) => {
              const t = Math.min(clock, r.time)
              const done = clock >= r.time
              return (
                <li key={r.name}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className={i === 0 ? 'font-medium text-ink' : 'text-ash'}>
                      {r.name} <span className="label-mono ml-2 text-ash/70">{r.note}</span>
                    </span>
                    <span className="font-mono tabular-nums text-ink">{done ? `${r.time.toFixed(1)} s` : `${t.toFixed(1)} s`}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-mist">
                    <div
                      className={`h-2 rounded-full ${i === 0 ? (done ? 'bg-lime' : 'bg-violet') : 'bg-ink/25'}`}
                      style={{ width: `${(t / CLOCK_END) * 100}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
          <p className="label-mono mt-4 text-ash/70">Typical checkout times, approximate</p>
        </div>
      </div>
    </section>
  )
}
