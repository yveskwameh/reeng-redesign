import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Euler, MathUtils, Quaternion, type Group } from 'three'
import { product } from '../content/product'
import { Ring } from '../scene/Ring'
import { pointer } from './interaction'
import { Logo, Stage } from './stage'

const MERCHANTS = [
  ['Blue Bottle', 4.2],
  ['Metro', 2.75],
  ['Corner Market', 12.4],
  ['Cinema', 9.0],
  ['Bakery', 3.6],
] as const

const HOVER = new Quaternion().setFromEuler(new Euler(1.25, 0, -0.3))
const DIP = new Quaternion().setFromEuler(new Euler(1.55, 0, -0.1)) // flatter, as if pressed to a reader
const q = new Quaternion()
const leanE = new Euler()
const lean = new Quaternion()

/** Last tap, read by the ring every frame. */
const tap = { at: -10 }

type Receipt = { id: number; name: string; amount: number }
type Ripple = { id: number; x: number; y: number }

/**
 * D — Tap anywhere. The ring follows the cursor; clicking anywhere is a tap to pay:
 * the ring dips, a contactless ripple spreads from the click, and a receipt lands.
 */
export function OptionTap() {
  const [menu, setMenu] = useState(false)
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [ripples, setRipples] = useState<Ripple[]>([])
  const count = useRef(0)
  const [taps, setTaps] = useState(0)
  const total = receipts.reduce((s, r) => s + r.amount, 0)

  useEffect(() => {
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('a,button,[data-switcher],[role=dialog]')) return
      const id = ++count.current
      const [name, amount] = MERCHANTS[(id - 1) % MERCHANTS.length]
      tap.at = performance.now() / 1000
      setTaps(id)
      setRipples((r) => [...r, { id, x: e.clientX, y: e.clientY }])
      setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 1200)
      setTimeout(() => setReceipts((r) => [{ id, name, amount }, ...r].slice(0, 3)), 280)
    }
    window.addEventListener('pointerdown', down)
    return () => window.removeEventListener('pointerdown', down)
  }, [])

  return (
    <>
      {/* nav: logo, order pill and a round menu button that opens a full-screen menu */}
      <header className="fixed inset-x-0 top-0 z-40">
        <nav className="flex h-20 items-center justify-between px-5 md:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            <a href="#" className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-violet">
              Order — ${product.price.earlyBird}
            </a>
            <button
              onClick={() => setMenu(true)}
              aria-label="Menu"
              className="grid size-11 place-items-center rounded-full border border-line bg-white transition hover:border-ink"
            >
              <span className="flex w-4 flex-col gap-1.5">
                <span className="h-px bg-ink" />
                <span className="h-px bg-ink" />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {menu && (
        <div role="dialog" className="fixed inset-0 z-50 flex flex-col bg-white px-5 md:px-8" style={{ animation: 'fade-up .3s' }}>
          <div className="flex h-20 items-center justify-between">
            <Logo />
            <button onClick={() => setMenu(false)} aria-label="Close menu" className="grid size-11 place-items-center rounded-full bg-ink text-white">
              ✕
            </button>
          </div>
          <ul className="mt-10 space-y-2">
            {['How it works', 'Security', 'Specs', 'Order', 'FAQ'].map((l, i) => (
              <li key={l} className="flex items-baseline gap-4 border-b border-line pb-2">
                <span className="label-mono text-ash">{String(i + 1).padStart(2, '0')}</span>
                <a href="#" onClick={() => setMenu(false)} className="display text-5xl text-ink transition hover:text-violet md:text-7xl">{l}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="relative h-svh cursor-pointer overflow-hidden bg-[radial-gradient(ellipse_at_50%_45%,#ffffff_0%,#f1f0f4_75%)]">
        <div className="pointer-events-none absolute inset-x-0 top-24 text-center md:top-28">
          <h1 className="display text-6xl text-ink md:text-[9rem]">Tap. Paid.</h1>
          <p className="label-mono mt-4 text-ash">Click or tap anywhere to pay</p>
        </div>

        <Stage>
          <FollowRing />
        </Stage>

        {ripples.map((r) => (
          <span key={r.id} className="pointer-events-none absolute" style={{ left: r.x, top: r.y }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="absolute size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-violet"
                style={{ animation: `ripple 1.1s ${i * 0.14}s cubic-bezier(.2,.7,.3,1) both` }}
              />
            ))}
          </span>
        ))}

        {/* receipts */}
        <div className="pointer-events-none absolute right-5 top-24 w-64 space-y-2 md:right-8 md:top-28">
          {receipts.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-line" style={{ animation: 'fade-up .35s' }}>
              <span className="grid size-8 place-items-center rounded-full bg-violet text-sm text-white">✓</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{r.name}</p>
                <p className="label-mono text-ash">USDC · Base</p>
              </div>
              <p className="font-mono text-sm text-ink">${r.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-5 px-5 pb-8 md:flex-row md:items-end md:justify-between md:px-8 md:pb-10">
          <div>
            <p className="display max-w-[16ch] text-2xl text-ink md:text-3xl">{product.tagline}</p>
            <p className="mt-2 max-w-sm text-ash">{product.summary}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="label-mono text-ash">{taps} {taps === 1 ? 'tap' : 'taps'} this visit</p>
            <p className="font-display text-4xl font-bold tabular-nums text-ink">${total.toFixed(2)}</p>
          </div>
        </div>
      </section>
    </>
  )
}

function FollowRing() {
  const ref = useRef<Group>(null)
  const { viewport } = useThree()

  useFrame((state, dt) => {
    const g = ref.current
    if (!g) return
    const t = state.clock.elapsedTime
    // dip: fast in, slower back out
    const since = performance.now() / 1000 - tap.at
    const dip = since < 0.12 ? since / 0.12 : Math.max(0, 1 - (since - 0.12) / 0.45)
    const k = MathUtils.smoothstep(dip, 0, 1)

    const hw = viewport.width / 2
    const hh = viewport.height / 2
    const x = MathUtils.clamp(pointer.x * hw, -hw * 0.85, hw * 0.85)
    const y = MathUtils.clamp(pointer.y * hh, -hh * 0.8, hh * 0.6) - 0.2
    g.position.x = MathUtils.damp(g.position.x, x, 6, dt)
    g.position.y = MathUtils.damp(g.position.y, y, 6, dt)
    g.position.z = -0.6 * k

    leanE.set(0, (x - g.position.x) * 0.4 + Math.sin(t * 0.6) * 0.3, -(x - g.position.x) * 0.3)
    lean.setFromEuler(leanE)
    q.copy(HOVER).slerp(DIP, k).premultiply(lean)
    g.quaternion.slerp(q, 1 - Math.exp(-dt * 10))
    g.scale.setScalar(0.5 * Math.min(1, viewport.aspect / 1.1))
  })

  return (
    <group ref={ref}>
      <Ring />
    </group>
  )
}
