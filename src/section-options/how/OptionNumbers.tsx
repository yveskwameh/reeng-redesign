import { useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { useSectionProgress } from '../tap-to-pay/shared'
import { PhoneRig, STEPS, stepAt, subAt } from './shared'

/**
 * C — Big numbers (after OpenPhone's outlined 01 / 02 / 03). A giant outlined step number
 * rolls past behind the phone like an odometer as you scroll; the step's title and line sit
 * bottom-left, and three dots along the bottom fill in.
 */
export function OptionNumbers() {
  const section = useRef<HTMLElement>(null)
  const roll = useRef<HTMLDivElement>(null)
  const progress = useRef(0)
  const at = useRef(new Vector3())
  const [step, setStep] = useState(0)
  const [sub, setSub] = useState(0)

  useSectionProgress(section, (p) => {
    progress.current = p
    setStep(stepAt(p))
    setSub(subAt(p))
    // odometer: one number-height per step, snapping through the middle of each third
    const f = p * 3 - 0.5
    const k = Math.max(0, Math.min(2, Math.floor(f) + Math.min(1, Math.max(0, (f - Math.floor(f) - 0.35) / 0.3))))
    if (roll.current) roll.current.style.transform = `translateY(${-k * 100}%)`
  })

  const s = STEPS[step]

  return (
    <section ref={section} className="relative h-[300svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* the number column, one viewport-tall slot per step, behind the canvas */}
        <div className="absolute inset-0 overflow-hidden">
          <div ref={roll} className="h-full transition-transform duration-150 will-change-transform">
            {STEPS.map((st) => (
              <div key={st.n} className="flex h-full items-center justify-center md:justify-end md:pr-[4vw]">
                <span
                  className="select-none font-display font-bold leading-none text-transparent"
                  style={{ fontSize: 'min(40vh, 24vw)', WebkitTextStroke: '3px #CFCDD9', letterSpacing: '-0.06em' }}
                >
                  {st.n}
                </span>
              </div>
            ))}
          </div>
        </div>
        <Stage>
          <Rig progress={progress} at={at} />
        </Stage>
        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-7xl flex-col justify-between px-5 pb-10 pt-28 md:px-8">
          <h2 className="display text-5xl text-ink md:text-7xl">Pair. Fund. Tap.</h2>
          <div>
            <div key={s.n} className="max-w-sm" style={{ animation: 'fade-up .35s' }}>
              <p className="display text-3xl text-ink md:text-4xl">{s.title}</p>
              <p className="mt-2 text-lg text-ash">{s.body}</p>
            </div>
            <div className="mt-6 flex max-w-sm gap-2">
              {STEPS.map((st, i) => (
                <div key={st.n} className="h-1 flex-1 overflow-hidden rounded-full bg-mist">
                  <div className="h-1 rounded-full bg-violet" style={{ width: `${i < step ? 100 : i === step ? sub * 100 : 0}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Rig({ progress, at }: { progress: React.RefObject<number>; at: React.RefObject<Vector3> }) {
  const { viewport } = useThree()
  const wide = viewport.aspect > 1
  at.current.set(wide ? viewport.width * 0.08 : 0.35, wide ? 0 : -0.1, 0)
  return <PhoneRig progress={progress} at={at} scale={wide ? 1 : 0.6} />
}
