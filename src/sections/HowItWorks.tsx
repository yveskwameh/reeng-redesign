import { useGSAP } from '@gsap/react'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { trackSection } from '../lib/trackSection'
import { createPhoneScreen, type PhoneView } from '../scene/phoneScreen'
import { howFx, howStep, smoothstep } from '../scene/scrollState'

const steps = [
  { n: '01', title: 'Pair', body: 'Hold your Reeng to your phone. Done in a tap.' },
  { n: '02', title: 'Fund', body: 'Send stablecoins from any chain to your Reeng address.' },
  { n: '03', title: 'Tap', body: 'Set your PIN and limits. Then pay anywhere.' },
]
const views: PhoneView[] = [{ step: 'pair', paired: true }, { step: 'fund', balance: 150 }, { step: 'tap' }]

// wide screens: stations along the left → right path, as fractions of its length
const STOPS = [0.12, 0.5, 0.88]
// phones: the line runs top to bottom through these points (fractions of the box); the middle
// three are the stations
const DOWN: [number, number][] = [
  [0.5, 0],
  [0.46, 0.16],
  [0.54, 0.48],
  [0.46, 0.8],
  [0.5, 0.9],
]

/** The left → right path, scaled from its 1000×600 design box to the real box in px. */
function acrossPath(w: number, h: number) {
  const x = (v: number) => ((v / 1000) * w).toFixed(1)
  const y = (v: number) => ((v / 600) * h).toFixed(1)
  return `M ${x(60)} ${y(420)} C ${x(220)} ${y(420)}, ${x(260)} ${y(160)}, ${x(500)} ${y(200)} S ${x(800)} ${y(470)}, ${x(985)} ${y(380)}`
}

/** Catmull-Rom through DOWN, as cubic Béziers in px. */
function downPath(w: number, h: number) {
  const p = DOWN.map(([x, y]) => [x * w, y * h])
  let d = `M ${p[0][0]} ${p[0][1]}`
  for (let i = 0; i < p.length - 1; i++) {
    const [a, b, c, n] = [p[Math.max(0, i - 1)], p[i], p[i + 1], p[Math.min(p.length - 1, i + 2)]]
    d += ` C ${b[0] + (c[0] - a[0]) / 6} ${b[1] + (c[1] - a[1]) / 6}, ${c[0] - (n[0] - b[0]) / 6} ${c[1] - (n[1] - b[1]) / 6}, ${c[0]} ${c[1]}`
  }
  return d
}

/** Screenshot of the app at a given view, for the phone screens along the path. */
function phoneShot(v: PhoneView) {
  const s = createPhoneScreen()
  s.draw(v)
  return (s.texture.image as HTMLCanvasElement).toDataURL()
}

/**
 * Pinned for three screens. A line draws itself as you scroll and the ring (RingRig, via
 * howFx) rides its tip through three app screens to the end. Wide screens run the line left
 * to right; phones run it top to bottom with each screen on one side and its copy on the other.
 */
export function HowItWorks() {
  const section = useRef<HTMLElement>(null)
  const sticky = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const path = useRef<SVGPathElement>(null)
  const drawnRef = useRef(0)
  const stops = useRef(STOPS)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [step, setStep] = useState(0)
  const [drawn, setDrawn] = useState(0)
  const [stations, setStations] = useState<{ x: number; y: number }[]>([])
  const shots = useMemo(() => views.map(phoneShot), [])
  const down = size.w > 0 && size.w < 640

  // where the line ends, in px from the pinned frame's top-left (the ring's target)
  function placeTip() {
    const el = path.current
    const a = box.current?.getBoundingClientRect()
    const b = sticky.current?.getBoundingClientRect()
    if (!el || !a || !b || !el.getAttribute('d')) return
    const pt = el.getPointAtLength(drawnRef.current * el.getTotalLength())
    howFx.x = pt.x + a.left - b.left
    howFx.y = pt.y + a.top - b.top
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
    setStations(stops.current.map((s) => el.getPointAtLength(s * L)).map((pt) => ({ x: (pt.x / size.w) * 100, y: (pt.y / size.h) * 100 })))
    placeTip()
  }, [size, down])

  useGSAP(
    () => {
      trackSection(section.current!, { enter: 'howEnter', progress: 'how', exit: 'howExit' }, (p) => {
        setStep(howStep(p))
        // draw in to the first stop, travel on at each step change, then run out to the end
        const [a, b, c] = stops.current
        const len = a * smoothstep(0, 0.1, p) + (b - a) * smoothstep(0.28, 0.38, p) + (c - b) * smoothstep(0.61, 0.71, p) + (1 - c) * smoothstep(0.86, 0.98, p)
        drawnRef.current = len
        setDrawn(len)
        placeTip()
      })
    },
    { scope: section },
  )

  const d = !size.w ? '' : down ? downPath(size.w, size.h) : acrossPath(size.w, size.h)

  return (
    <section ref={section} id="how-it-works" className="relative h-[320svh] text-ink">
      <div ref={sticky} className="sticky top-0 h-svh overflow-hidden">
        <div className="relative mx-auto flex h-full max-w-7xl flex-col px-5 pb-8 pt-24 md:px-8">
          <h2 className="display text-5xl md:text-7xl">Pair. Fund. Tap.</h2>
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
            {stations.map((pos, i) =>
              down ? (
                <DownStation key={steps[i].n} i={i} pos={pos} step={step} shot={shots[i]} />
              ) : (
                <div
                  key={steps[i].n}
                  className={`absolute flex w-36 flex-col items-center text-center transition duration-500 [--gap:60px] md:w-56 md:[--gap:80px] ${i <= step ? 'opacity-100' : 'opacity-35'}`}
                  // alternate around the line so nothing runs off the edge
                  style={{ left: `clamp(4.5rem, ${pos.x}%, calc(100% - 4.5rem))`, top: `${pos.y}%`, transform: `translate(-50%, ${i !== 1 ? 'calc(-100% - var(--gap))' : 'var(--gap)'})` }}
                >
                  <img
                    src={shots[i]}
                    alt={`Reeng app: ${steps[i].title}`}
                    className={`w-[clamp(4.5rem,10svh,5.5rem)] rounded-xl ring-4 transition md:w-[clamp(6rem,13svh,8rem)] md:rounded-2xl ${i === step ? 'ring-ink' : 'ring-ink/20'}`}
                  />
                  <p className="display mt-3 text-xl md:text-2xl">{steps[i].title}</p>
                  <p className="mt-1 hidden text-sm text-ash md:block">{steps[i].body}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/** A station on the top-to-bottom line: the screen on one side, its copy on the other, swapping each step. */
function DownStation({ i, pos, step, shot }: { i: number; pos: { x: number; y: number }; step: number; shot: string }) {
  const s = steps[i]
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
        <p className="display text-2xl">{s.title}</p>
        <p className="mt-1 text-sm text-ash">{s.body}</p>
      </div>
    </>
  )
}
