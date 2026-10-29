import { useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { MathUtils, Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { useSectionProgress } from '../tap-to-pay/shared'
import { PhoneRig, STEPS, stepAt } from './shared'

/**
 * A — Stack (after ToDesktop's step cards and the sticky-scroll shots on Pinterest). Each
 * step is a card that slides up and stacks on the one before as you scroll; the phone and
 * ring on the right act out the step on top.
 */
export function OptionStack() {
  const section = useRef<HTMLElement>(null)
  const cards = useRef<(HTMLDivElement | null)[]>([])
  const progress = useRef(0)
  const at = useRef(new Vector3())
  const [step, setStep] = useState(0)

  useSectionProgress(section, (p) => {
    progress.current = p
    setStep(stepAt(p))
    cards.current.forEach((c, i) => {
      if (!c) return
      // card i arrives over the first part of its third of the scroll, then gets covered
      const arrive = i === 0 ? 1 : MathUtils.smoothstep(p, i / 3 - 0.12, i / 3 + 0.04)
      const covered = MathUtils.smoothstep(p, (i + 1) / 3 - 0.12, (i + 1) / 3 + 0.04)
      c.style.transform = `translateY(${(1 - arrive) * 110}%) scale(${1 - covered * 0.05})`
      c.style.opacity = `${arrive * (1 - covered * 0.5)}`
    })
  })

  return (
    <section ref={section} className="relative h-[300svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <Stage>
          <Rig progress={progress} at={at} />
        </Stage>
        <div className="pointer-events-none absolute inset-0 mx-auto grid max-w-7xl content-start gap-8 px-5 pt-28 md:grid-cols-2 md:content-center md:px-8 md:pt-0">
          <div>
            <h2 className="display text-5xl text-ink md:text-7xl">Pair. Fund. Tap.</h2>
            <div className="relative mt-8 h-48 md:mt-10 md:h-64">
              {STEPS.map((s, i) => (
                <div
                  key={s.n}
                  ref={(el) => void (cards.current[i] = el)}
                  className="absolute inset-0 flex flex-col justify-between rounded-3xl bg-white p-6 shadow-lg shadow-ink/5 ring-1 ring-line will-change-transform md:p-8"
                  style={{ zIndex: i, transform: i ? 'translateY(110%)' : undefined }}
                >
                  <span className={`label-mono w-fit rounded-full px-3 py-1 ${i === step ? 'bg-violet text-white' : 'bg-mist text-ash'}`}>Step {s.n}</span>
                  <div>
                    <p className="display text-3xl text-ink md:text-4xl">{s.title}</p>
                    <p className="mt-2 text-lg text-ash">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Phone on the right on wide screens, smaller and lower-centre on phones. */
function Rig({ progress, at }: { progress: React.RefObject<number>; at: React.RefObject<Vector3> }) {
  const { viewport } = useThree()
  const wide = viewport.aspect > 1
  at.current.set(wide ? viewport.width * 0.22 : 0.4, wide ? 0 : -1.15, 0)
  return <PhoneRig progress={progress} at={at} scale={wide ? 1 : 0.55} />
}
