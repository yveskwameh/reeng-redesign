import { ContactShadows } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { Euler, MathUtils, Quaternion, Vector3, type Group } from 'three'
import { product } from '../content/product'
import { Ring } from '../scene/Ring'
import { pointer, useDragSpin } from './interaction'
import { PillNav } from './PillNav'
import { Stage } from './stage'

const MERCHANTS = [
  ['Blue Bottle', 4.2],
  ['Metro', 2.75],
  ['Corner Market', 12.4],
  ['Cinema', 9.0],
  ['Bakery', 3.6],
] as const

// B's turntable pose: upright, tipped back a touch, turning about the vertical
const STAND = new Quaternion().setFromEuler(new Euler(Math.PI / 2 - 0.12, 0, 0))
const FACE = new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0)) // hole facing us
const Y = new Vector3(0, 1, 0)
const RING_RADIUS = 1.19 // outer radius in model units
const q = new Quaternion()
const turn = new Quaternion()
const lean = new Quaternion()
const leanE = new Euler()
const screen = new Vector3()

/** Shared between the DOM and the ring: last tap time, and where the ring is on screen. */
const tap = { at: -10 }
const ringOnScreen = { x: 0, y: 0 }

/** 0 → 1 over the first 80% of a viewport of scroll. */
const scrollP = () => MathUtils.clamp(window.scrollY / (window.innerHeight * 0.8), 0, 1)

type Receipt = { id: number; name: string; amount: number; total: number }
type Ripple = { id: number; x: number; y: number }

/**
 * E — the mix. A's layout (giant wordmark, headline and CTAs along the bottom, scroll
 * turns the ring face-on around the tagline) with B's nav, floating turntable, degree
 * dial and finishes, and D's tap to pay. The ring drifts a little toward the cursor;
 * a drag spins it, a click pays: the ring dips to its shadow, a ripple leaves it and a
 * single receipt shows. Each piece has one job and one place on screen.
 */
export function OptionCombined() {
  const section = useRef<HTMLElement>(null)
  const word = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLParagraphElement>(null)
  const chrome = useRef<HTMLDivElement>(null)
  const dial = useRef<HTMLSpanElement>(null)
  const drag = useDragSpin(section)
  const [finish, setFinish] = useState(product.finishes[0])
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [ripples, setRipples] = useState<Ripple[]>([])
  const taps = useRef({ count: 0, total: 0 })

  // scroll: letters drift apart, the bottom chrome fades, the tagline appears in the hole
  useEffect(() => {
    const onScroll = () => {
      const p = scrollP()
      if (word.current) {
        word.current.style.letterSpacing = `${-0.06 + p * 0.12}em`
        word.current.style.opacity = `${1 - p * 0.6}`
      }
      if (inner.current) inner.current.style.opacity = `${MathUtils.smoothstep(p, 0.6, 1)}`
      if (chrome.current) chrome.current.style.opacity = `${1 - MathUtils.smoothstep(p, 0, 0.35)}`
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // a short press that barely moves is a tap (a payment); anything longer is a drag (a spin)
  useEffect(() => {
    const el = section.current
    if (!el) return
    let start = { x: 0, y: 0, t: 0, ok: false }
    let hide: ReturnType<typeof setTimeout>
    const down = (e: PointerEvent) => {
      const ignore = (e.target as HTMLElement).closest('a,button,input,label,[data-switcher]')
      start = { x: e.clientX, y: e.clientY, t: performance.now(), ok: !ignore && scrollP() < 0.3 }
    }
    const up = (e: PointerEvent) => {
      if (!start.ok) return
      start.ok = false
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6 || performance.now() - start.t > 350) return
      const t = taps.current
      const [name, amount] = MERCHANTS[t.count % MERCHANTS.length]
      t.count++
      t.total += amount
      const id = t.count
      tap.at = performance.now() / 1000
      // the payment leaves from the ring, wherever the click was
      setRipples((r) => [...r, { id, x: ringOnScreen.x, y: ringOnScreen.y }])
      setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 1200)
      setReceipt({ id, name, amount, total: t.total })
      clearTimeout(hide)
      hide = setTimeout(() => setReceipt(null), 2800)
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      clearTimeout(hide)
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  return (
    <>
      <PillNav />

      <section ref={section} className="relative h-[190svh] touch-pan-y">
        <div className="sticky top-0 h-svh cursor-grab overflow-hidden active:cursor-grabbing">
          <div
            ref={word}
            aria-hidden
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-center font-display font-bold leading-none text-mist"
            style={{ fontSize: 'clamp(6rem, 26vw, 28rem)', letterSpacing: '-0.06em' }}
          >
            REENG
          </div>

          <Stage>
            <FloatingRing drag={drag} finish={finish.color} dial={dial} />
          </Stage>

          {ripples.map((r) => (
            <span key={r.id} className="pointer-events-none absolute" style={{ left: r.x, top: r.y }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="absolute size-28 rounded-full border-2 border-violet"
                  style={{ animation: `ripple 1.1s ${i * 0.14}s cubic-bezier(.2,.7,.3,1) both` }}
                />
              ))}
            </span>
          ))}

          <p
            ref={inner}
            className="display pointer-events-none absolute inset-0 m-auto h-fit max-w-[11ch] text-center text-2xl text-ink opacity-0 md:text-4xl"
          >
            Tap anywhere contactless works.
          </p>

          <div ref={chrome}>
            <p className="label-mono pointer-events-none absolute left-5 top-24 text-ash md:left-8 md:top-28">
              Stablecoin wallet
              <br />
              NFC ring
            </p>

            {/* top right: the dial, then the receipt in the same spot when a tap lands */}
            <div className="pointer-events-none absolute right-5 top-24 flex w-64 flex-col items-end md:right-8 md:top-28">
              <p className="label-mono text-right text-ash">
                <span ref={dial} className="font-mono text-sm tabular-nums tracking-normal text-ink">000°</span>
                <br />
                Drag to spin · Tap to pay
              </p>
              {receipt && (
                <div key={receipt.id} className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-line" style={{ animation: 'fade-up .35s' }}>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-violet text-sm text-white">✓</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{receipt.name}</p>
                    <p className="label-mono text-ash">USDC · Base</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-ink">${receipt.amount.toFixed(2)}</p>
                    <p className="font-mono text-[10px] text-ash">Σ ${receipt.total.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="absolute inset-x-0 bottom-0 grid gap-6 px-5 pb-8 md:grid-cols-[1fr_auto_1fr] md:items-end md:px-8 md:pb-10">
              <div className="pointer-events-none">
                <h1 className="display max-w-[14ch] text-4xl text-ink md:text-6xl">{product.tagline}</h1>
                <p className="mt-3 max-w-sm text-ash">{product.summary}</p>
              </div>

              {/* finishes, under the ring */}
              <div className="flex items-center gap-3 md:flex-col md:gap-2">
                <div className="flex gap-2">
                  {product.finishes.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFinish(f)}
                      aria-label={f.name}
                      aria-pressed={f.id === finish.id}
                      className={`size-8 rounded-full border-2 shadow-sm transition ${f.id === finish.id ? 'border-violet' : 'border-white'}`}
                      style={{ background: f.color }}
                    />
                  ))}
                </div>
                <p className="label-mono text-ash">
                  {finish.name}
                  {!finish.available && ' · soon'}
                </p>
              </div>

              <div className="flex gap-3 md:justify-end">
                <a href="#" className="rounded-full bg-ink px-7 py-3.5 font-medium text-white transition hover:bg-violet">
                  Order — ${product.price.earlyBird}
                </a>
                <a href="#" className="rounded-full border border-line px-7 py-3.5 font-medium text-ink transition hover:border-ink">
                  How it works
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function FloatingRing({
  drag,
  finish,
  dial,
}: {
  drag: ReturnType<typeof useDragSpin>
  finish: string
  dial: RefObject<HTMLSpanElement | null>
}) {
  const ring = useRef<Group>(null)
  const shadow = useRef<Group>(null)
  const { viewport, camera, size } = useThree()

  useFrame((state, dt) => {
    const g = ring.current
    if (!g) return
    const d = drag.current
    const p = MathUtils.smootherstep(scrollP(), 0, 1)
    const fit = Math.min(1, viewport.aspect / 1.2) // narrow screens have less width to work with
    // portrait: the ring belongs in the open space above the headline. Moving it up in the
    // world would put its floor at eye level (shadow seen edge-on), so shift the view instead
    const portrait = fit < 1
    const baseY = portrait ? -0.3 : 0.15
    const shift = portrait ? 0.17 * size.height * (1 - p) : 0
    if (portrait) camera.setViewOffset(size.width, size.height, 0, shift, size.width, size.height)
    else if (camera.view) camera.clearViewOffset()

    // B: slow turntable, faster when flung; the dial reads the angle
    d.step(dt)
    if (!d.active && Math.abs(d.vel) < 0.002) d.angle += dt * 0.25 * (1 - p)
    if (dial.current) {
      const deg = ((((d.angle * 180) / Math.PI) % 360) + 360) % 360
      dial.current.textContent = `${String(Math.round(deg)).padStart(3, '0')}°`
    }

    // D: a tap dips the ring down toward its shadow, fast in and slower out
    const since = performance.now() / 1000 - tap.at
    const dip = MathUtils.smoothstep(since < 0.12 ? since / 0.12 : Math.max(0, 1 - (since - 0.12) / 0.5), 0, 1)

    // drift a little toward the cursor — enough to feel alive, not enough to leave its shadow
    const follow = 1 - p
    const x = pointer.x * 0.45 * fit * follow
    const bob = Math.sin(state.clock.elapsedTime * 1.2) * 0.05 * follow
    g.position.x = MathUtils.damp(g.position.x, x, 4, dt)
    g.position.y = MathUtils.lerp(baseY, 0, p) + bob - 0.22 * dip

    leanE.set(-pointer.y * 0.1 * follow + 0.25 * dip, 0, -(x - g.position.x) * 0.4)
    lean.setFromEuler(leanE)
    turn.setFromAxisAngle(Y, d.angle * (1 - p))
    q.copy(turn).multiply(STAND).slerp(FACE, p).premultiply(lean)
    g.quaternion.slerp(q, 1 - Math.exp(-dt * 10))

    const s = MathUtils.lerp(0.6 * fit, 1.55 * Math.max(fit, 0.55), p)
    g.scale.setScalar(MathUtils.damp(g.scale.x, s, 8, dt))

    // the shadow follows the ring sideways and fades out as the ring turns face-on
    if (shadow.current) {
      shadow.current.position.x = g.position.x
      shadow.current.position.y = baseY - RING_RADIUS * g.scale.x - 0.4 * g.scale.x
      shadow.current.scale.setScalar(g.scale.x / 0.6) // sized for the desktop ring; small rings get a small, crisp shadow
      shadow.current.visible = p < 0.5
    }

    // where the ring is on screen, for the payment ripple
    screen.setFromMatrixPosition(g.matrixWorld).project(camera)
    ringOnScreen.x = ((screen.x + 1) / 2) * size.width
    ringOnScreen.y = ((1 - screen.y) / 2) * size.height
  })

  return (
    <>
      <group ref={ring}>
        <Ring finish={finish} />
      </group>
      <group ref={shadow}>
        <ContactShadows opacity={0.5} scale={5} blur={2.4} far={2.5} resolution={512} />
      </group>
    </>
  )
}
