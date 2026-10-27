import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { MathUtils, Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { useSectionProgress } from '../tap-to-pay/shared'
import { PhoneRig, STEPS, stepAt } from './shared'

/**
 * B — Three cards (after Norma's "How it works", the closest product to Reeng). Three step
 * cards side by side; as you scroll, the 3D phone and ring glide from card to card and act
 * out each step over it. The active card lifts; the others step back.
 */
export function OptionCards() {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const cards = useRef<(HTMLLIElement | null)[]>([])
  const progress = useRef(0)
  // the phone's target, in px relative to the stage (converted to world units in the scene)
  const target = useRef({ x: 0, y: 0 })
  const [step, setStep] = useState(0)

  useSectionProgress(section, (p) => {
    progress.current = p
    setStep(stepAt(p))
    const box = stage.current?.getBoundingClientRect()
    if (!box) return
    // glide between card centres, settling on each for most of its third
    const f = p * 3 - 0.5
    const i = MathUtils.clamp(Math.floor(f), 0, 1)
    const k = MathUtils.smootherstep(MathUtils.clamp(f - i, 0, 1), 0.3, 0.7)
    const c = (n: number) => cards.current[n]?.getBoundingClientRect()
    const a = c(f < 0 ? 0 : i)
    const b = c(f < 0 ? 0 : i + 1)
    if (!a || !b) return
    const ax = a.left + a.width / 2
    const bx = b.left + b.width / 2
    target.current = { x: MathUtils.lerp(ax, bx, f < 0 ? 0 : k) - box.left, y: a.top + a.height * 0.38 - box.top }
  })

  return (
    <section ref={section} className="relative h-[300svh]">
      <div ref={stage} className="sticky top-0 h-svh overflow-hidden">
        <div className="mx-auto flex h-full max-w-7xl flex-col px-5 pb-8 pt-24 md:px-8">
          <div className="flex items-end justify-between gap-6">
            <h2 className="display text-5xl text-ink md:text-6xl">Pair. Fund. Tap.</h2>
            <p className="hidden max-w-xs text-ash md:block">Set up once in the app. After that, the ring is all you carry.</p>
          </div>
          <ul className="mt-8 grid flex-1 grid-cols-3 gap-3 md:gap-5">
            {STEPS.map((s, i) => (
              <li
                key={s.n}
                ref={(el) => void (cards.current[i] = el)}
                className={`flex flex-col justify-end rounded-3xl p-4 ring-1 transition duration-500 md:p-6 ${
                  i === step ? 'bg-mist ring-line' : 'bg-white ring-line/70 opacity-50'
                }`}
              >
                <span className={`grid size-8 place-items-center rounded-full font-mono text-sm ${i === step ? 'bg-ink text-white' : 'border border-line text-ash'}`}>
                  {i + 1}
                </span>
                <p className="display mt-3 text-xl text-ink md:text-3xl">{s.title}</p>
                <p className="mt-1 hidden text-ash md:block">{s.body}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="pointer-events-none absolute inset-0">
          <Stage>
            <Glide target={target} progress={progress} />
          </Stage>
        </div>
      </div>
    </section>
  )
}

/** Converts the DOM target to world units every frame and drives the phone rig. */
function Glide({ target, progress }: { target: React.RefObject<{ x: number; y: number }>; progress: React.RefObject<number> }) {
  const { viewport, size } = useThree()
  const at = useRef(new Vector3())
  const narrow = viewport.aspect < 1
  useFrame(() => {
    const t = target.current
    at.current.set((t.x / size.width - 0.5) * viewport.width + 0.25 * (narrow ? 0.4 : 1), -(t.y / size.height - 0.5) * viewport.height, 0)
  })
  return <PhoneRig progress={progress} at={at} scale={narrow ? 0.38 : 0.62} />
}
