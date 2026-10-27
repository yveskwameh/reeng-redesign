import { useFrame, useThree } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Euler, MathUtils, Quaternion, type Group } from 'three'
import { Stage } from '../../hero-options/stage'
import { Ring } from '../../scene/Ring'
import { useSectionProgress } from '../tap-to-pay/shared'
import { phoneShot, STEPS, stepAt } from './shared'

// stations along the path, as fractions of its length
const STOPS = [0.12, 0.5, 0.88]
const RING_ROT = new Quaternion().setFromEuler(new Euler(1.15, 0, -0.35))
const spin = new Quaternion()
const e = new Euler()

/**
 * D — Path (after the connected-steps flows on Pinterest). A dotted line draws itself across
 * the section as you scroll; the 3D ring rides its tip and stops at each step, where a phone
 * mockup and the step's copy light up.
 */
export function OptionPath() {
  const section = useRef<HTMLElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const path = useRef<SVGPathElement>(null)
  const tip = useRef({ x: 0, y: 0 })
  const [step, setStep] = useState(0)
  const [drawn, setDrawn] = useState(0)
  // where each stop sits on the path, in % of the box (the viewBox stretches to fit)
  const [stations, setStations] = useState<{ x: number; y: number }[]>([])
  useLayoutEffect(() => {
    const el = path.current
    if (!el) return
    const L = el.getTotalLength()
    setStations(STOPS.map((s) => el.getPointAtLength(s * L)).map((pt) => ({ x: pt.x / 10, y: pt.y / 6 })))
  }, [])
  const shots = useMemo(() => [phoneShot({ step: 'pair', paired: true }), phoneShot({ step: 'fund', balance: 150 }), phoneShot({ step: 'tap' })], [])

  useSectionProgress(section, (p) => {
    // dwell at each stop: travel between stops over the middle of each third
    const f = p * 3
    const i = Math.min(2, Math.floor(f))
    const k = MathUtils.smootherstep(f - i, 0.55, 1)
    const at = i === 2 ? STOPS[2] : MathUtils.lerp(STOPS[i], STOPS[i + 1], k)
    const first = MathUtils.smootherstep(p * 3, 0, 0.35) // draw in to the first stop
    const len = i === 0 && k === 0 ? STOPS[0] * first : at
    setStep(stepAt(p))
    setDrawn(len)
    const el = path.current
    const box = svg.current?.getBoundingClientRect()
    if (!el || !box) return
    const pt = el.getPointAtLength(len * el.getTotalLength())
    // viewBox is 1000×600 and scales to the box
    tip.current = { x: (pt.x / 1000) * box.width, y: (pt.y / 600) * box.height }
  })

  return (
    <section ref={section} className="relative h-[320svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="mx-auto flex h-full max-w-7xl flex-col px-5 pb-8 pt-24 md:px-8">
          <h2 className="display text-5xl text-ink md:text-6xl">Pair. Fund. Tap.</h2>
          <div className="relative mt-4 flex-1">
            <svg ref={svg} viewBox="0 0 1000 600" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              <path d="M 60 420 C 220 420, 260 160, 500 200 S 780 460, 940 300" fill="none" stroke="#E3E2E8" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <path
                ref={path}
                d="M 60 420 C 220 420, 260 160, 500 200 S 780 460, 940 300"
                fill="none"
                stroke="#9730F6"
                strokeWidth="3"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1 - drawn}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {/* stations: phone mockup + copy, placed at the stops */}
            {stations.map((pos, i) => {
              const s = STEPS[i]
              const on = i <= step
              const above = i !== 1 // alternate around the line so nothing runs off the edge
              return (
                <div
                  key={s.n}
                  className={`absolute flex w-36 -translate-x-1/2 flex-col items-center text-center transition duration-500 md:w-56 ${on ? 'opacity-100' : 'opacity-35'}`}
                  style={{ left: `clamp(4.5rem, ${pos.x}%, calc(100% - 4.5rem))`, top: `${pos.y}%`, transform: `translate(-50%, ${above ? 'calc(-100% - 28px)' : '28px'})` }}
                >
                  <img src={shots[i]} alt="" className={`w-16 rounded-xl ring-4 transition md:w-24 ${i === step ? 'ring-ink' : 'ring-ink/20'}`} />
                  <p className="display mt-3 text-xl text-ink md:text-2xl">{s.title}</p>
                  <p className="mt-1 hidden text-sm text-ash md:block">{s.body}</p>
                </div>
              )
            })}
            <div className="pointer-events-none absolute inset-0">
              <Stage>
                <Rider tip={tip} />
              </Stage>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** The ring riding the tip of the drawn path. */
function Rider({ tip }: { tip: React.RefObject<{ x: number; y: number }> }) {
  const ref = useRef<Group>(null)
  const { viewport, size } = useThree()
  useFrame((state, dt) => {
    const g = ref.current
    if (!g) return
    const t = tip.current
    g.position.x = MathUtils.damp(g.position.x, (t.x / size.width - 0.5) * viewport.width, 10, dt)
    g.position.y = MathUtils.damp(g.position.y, -(t.y / size.height - 0.5) * viewport.height, 10, dt)
    spin.setFromEuler(e.set(0, state.clock.elapsedTime * 0.8, 0))
    g.quaternion.copy(RING_ROT).multiply(spin)
    g.scale.setScalar(viewport.aspect < 1 ? 0.18 : 0.26)
  })
  return (
    <group ref={ref}>
      <Ring />
    </group>
  )
}
