import { useFrame, useThree } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Euler, MathUtils, Quaternion, type Group } from 'three'
import { Stage } from '../../hero-options/stage'
import { Ring } from '../../scene/Ring'
import { useSectionProgress } from '../tap-to-pay/shared'
import { phoneShot, STEPS, stepAt } from './shared'

// stations along the path, as fractions of its length (same as D)
const STOPS = [0.12, 0.5, 0.88]
// eases 0 → 1 as p goes from a to b
const ss = (a: number, b: number, p: number) => MathUtils.smootherstep(p, a, b)
const RING_ROT = new Quaternion().setFromEuler(new Euler(1.15, 0, -0.35))
const spin = new Quaternion()
const e = new Euler()

/** D's path, scaled from its 1000×600 design box to the real box in px. */
function pathFor(w: number, h: number) {
  const x = (v: number) => ((v / 1000) * w).toFixed(1)
  const y = (v: number) => ((v / 600) * h).toFixed(1)
  return `M ${x(60)} ${y(420)} C ${x(220)} ${y(420)}, ${x(260)} ${y(160)}, ${x(500)} ${y(200)} S ${x(800)} ${y(470)}, ${x(985)} ${y(380)}`
}

// phones: the line runs top to bottom through these points (fractions of the box); the
// middle three are the stations
const DOWN: [number, number][] = [
  [0.5, 0],
  [0.46, 0.16],
  [0.54, 0.48],
  [0.46, 0.8],
  [0.5, 0.9],
]

/** Catmull-Rom through DOWN, as cubic Béziers in px. */
function downPathFor(w: number, h: number) {
  const p = DOWN.map(([x, y]) => [x * w, y * h])
  let d = `M ${p[0][0]} ${p[0][1]}`
  for (let i = 0; i < p.length - 1; i++) {
    const [a, b, c, n] = [p[Math.max(0, i - 1)], p[i], p[i + 1], p[Math.min(p.length - 1, i + 2)]]
    d += ` C ${b[0] + (c[0] - a[0]) / 6} ${b[1] + (c[1] - a[1]) / 6}, ${c[0] - (n[0] - b[0]) / 6} ${c[1] - (n[1] - b[1]) / 6}, ${c[0]} ${c[1]}`
  }
  return d
}

/**
 * E — D's path with A's title size and bigger screens. The line draws itself as you scroll
 * and the ring rides its tip through three app screens, all the way to the end. On phones
 * the line runs top to bottom, with each screen on one side and its copy on the other.
 */
export function OptionMix() {
  const section = useRef<HTMLElement>(null)
  const sticky = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const path = useRef<SVGPathElement>(null)
  const tip = useRef({ x: 0, y: 0 })
  const drawnRef = useRef(0)
  const stops = useRef(STOPS)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [step, setStep] = useState(0)
  const [drawn, setDrawn] = useState(0)
  // narrow boxes (phones) run the line top to bottom
  const down = size.w > 0 && size.w < 640
  const [stations, setStations] = useState<{ x: number; y: number }[]>([])
  const shots = useMemo(() => [phoneShot({ step: 'pair', paired: true }), phoneShot({ step: 'fund', balance: 150 }), phoneShot({ step: 'tap' })], [])

  // box px → frame px (the ring's canvas fills the sticky frame)
  function toFrame(pt: { x: number; y: number }) {
    const a = box.current?.getBoundingClientRect()
    const b = sticky.current?.getBoundingClientRect()
    return a && b ? { x: pt.x + a.left - b.left, y: pt.y + a.top - b.top } : { x: pt.x, y: pt.y }
  }

  // the path is drawn in px, so the drawn line and the ring stay exact at any size
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useLayoutEffect(() => {
    const el = path.current
    if (!el || !size.w) return
    const L = el.getTotalLength()
    // on phones, find where along the line each station point sits
    stops.current = !down
      ? STOPS
      : DOWN.slice(1, 4).map(([x, y]) => {
          let best = 0
          let dist = Infinity
          for (let i = 0; i <= 400; i++) {
            const pt = el.getPointAtLength((i / 400) * L)
            const dd = (pt.x - x * size.w) ** 2 + (pt.y - y * size.h) ** 2
            if (dd < dist) [dist, best] = [dd, i / 400]
          }
          return best
        })
    // put the ring where the line currently ends, before any scroll moves it
    const at = el.getPointAtLength(drawnRef.current * L)
    tip.current = toFrame(at)
    setStations(stops.current.map((s) => el.getPointAtLength(s * L)).map((pt) => ({ x: (pt.x / size.w) * 100, y: (pt.y / size.h) * 100 })))
  }, [size, down])

  useSectionProgress(section, (p) => {
    setStep(stepAt(p))
    // draw in to the first stop, travel on at each step change, then run out to the end
    const [a, b, c] = stops.current
    const len = a * ss(0, 0.1, p) + (b - a) * ss(0.28, 0.38, p) + (c - b) * ss(0.61, 0.71, p) + (1 - c) * ss(0.86, 0.98, p)
    setDrawn(len)
    drawnRef.current = len

    const el = path.current
    if (!el || !el.getAttribute('d')) return
    const pt = el.getPointAtLength(len * el.getTotalLength())
    tip.current = toFrame(pt)
  })

  const d = !size.w ? '' : down ? downPathFor(size.w, size.h) : pathFor(size.w, size.h)

  return (
    <section ref={section} className="relative h-[320svh]">
      <div ref={sticky} className="sticky top-0 h-svh overflow-hidden">
        <div className="relative mx-auto flex h-full max-w-7xl flex-col px-5 pb-8 pt-24 md:px-8">
          {/* A's title size */}
          <h2 className="display text-5xl text-ink md:text-7xl">Pair. Fund. Tap.</h2>
          <div ref={box} className="relative mt-4 flex-1">
            <svg className="absolute inset-0 h-full w-full overflow-visible">
              <path d={d} fill="none" stroke="#E3E2E8" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />
              <path
                ref={path}
                d={d}
                fill="none"
                stroke="#9730F6"
                strokeWidth="3"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={`${drawn} 1`}
                // a round cap draws a dot even for an empty dash, so hide the line until it starts
                opacity={drawn > 0.002 ? 1 : 0}
              />
            </svg>
            {/* stations: phone screen + copy, placed at the stops (as in D, with bigger screens) */}
            {stations.map((pos, i) =>
              down ? (
                <DownStation key={STEPS[i].n} i={i} pos={pos} step={step} shot={shots[i]} />
              ) : (
                <div
                  key={STEPS[i].n}
                  className={`absolute flex w-36 flex-col items-center text-center transition duration-500 [--gap:60px] md:w-56 md:[--gap:80px] ${i <= step ? 'opacity-100' : 'opacity-35'}`}
                  style={{ left: `clamp(4.5rem, ${pos.x}%, calc(100% - 4.5rem))`, top: `${pos.y}%`, transform: `translate(-50%, ${i !== 1 ? 'calc(-100% - var(--gap))' : 'var(--gap)'})` }}
                >
                  <img
                    src={shots[i]}
                    alt={`Reeng app: ${STEPS[i].title}`}
                    className={`w-[clamp(4.5rem,10svh,5.5rem)] rounded-xl ring-4 transition md:w-[clamp(6rem,13svh,8rem)] md:rounded-2xl ${i === step ? 'ring-ink' : 'ring-ink/20'}`}
                  />
                  <p className="display mt-3 text-xl text-ink md:text-2xl">{STEPS[i].title}</p>
                  <p className="mt-1 hidden text-sm text-ash md:block">{STEPS[i].body}</p>
                </div>
              ),
            )}
          </div>
        </div>
        {/* the ring's canvas covers the whole frame so it never clips at the path's ends */}
        <div className="pointer-events-none absolute inset-0">
          <Stage>
            <Rider tip={tip} />
          </Stage>
        </div>
      </div>
    </section>
  )
}

/** A station on the top-to-bottom line: the screen on one side, its copy on the other, swapping each step. */
function DownStation({ i, pos, step, shot }: { i: number; pos: { x: number; y: number }; step: number; shot: string }) {
  const s = STEPS[i]
  const flip = i === 1
  const gap = 40
  // one side of the line ends `gap` px before it, the other starts `gap` px after it
  const before = { left: `calc(${pos.x}% - ${gap}px)`, width: `calc(${pos.x}% - ${gap}px)`, transform: 'translate(-100%, -50%)' }
  const after = { left: `calc(${pos.x}% + ${gap}px)`, width: `calc(${100 - pos.x}% - ${gap}px)`, transform: 'translateY(-50%)' }
  const fade = `absolute transition duration-500 ${i <= step ? 'opacity-100' : 'opacity-35'}`
  return (
    <>
      <div className={`${fade} flex ${flip ? 'justify-start' : 'justify-end'}`} style={{ top: `${pos.y}%`, ...(flip ? after : before) }}>
        <img
          src={shot}
          alt={`Reeng app: ${s.title}`}
          className={`w-[clamp(4.5rem,10svh,5.5rem)] rounded-xl ring-4 transition ${i === step ? 'ring-ink' : 'ring-ink/20'}`}
        />
      </div>
      <div className={`${fade} ${flip ? 'text-right' : ''}`} style={{ top: `${pos.y}%`, ...(flip ? before : after) }}>
        <p className="display text-2xl text-ink">{s.title}</p>
        <p className="mt-1 text-sm text-ash">{s.body}</p>
      </div>
    </>
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
    g.scale.setScalar(viewport.aspect < 1 ? 0.12 : 0.26)
  })
  return (
    <group ref={ref}>
      <Ring />
    </group>
  )
}
