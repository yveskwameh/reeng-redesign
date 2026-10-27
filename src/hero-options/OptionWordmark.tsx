import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Euler, MathUtils, Quaternion, Vector3, type Group } from 'three'
import { product } from '../content/product'
import { Ring } from '../scene/Ring'
import { pointer, useDragSpin } from './interaction'
import { Logo, Stage } from './stage'

const links = ['How it works', 'Security', 'Specs', 'FAQ']

const TILT = new Quaternion().setFromEuler(new Euler(1.15, 0, -0.35))
const FACE = new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0)) // hole facing us
const Y = new Vector3(0, 1, 0)
const q = new Quaternion()
const spin = new Quaternion()
const lean = new Quaternion()
const leanE = new Euler()

/** 0 → 1 over the first 80% of a viewport of scroll. */
const scrollP = () => MathUtils.clamp(window.scrollY / (window.innerHeight * 0.8), 0, 1)

/**
 * A — Wordmark. A giant pale REENG fills the screen; the black ring floats in front,
 * leaning toward the cursor. Scrolling turns it face-on and grows it until the
 * tagline sits inside the hole while the letters drift apart.
 */
export function OptionWordmark() {
  const section = useRef<HTMLElement>(null)
  const word = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLParagraphElement>(null)
  const chrome = useRef<HTMLDivElement>(null)
  const drag = useDragSpin(section)

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

  return (
    <>
      {/* nav: no container — logo, plain links, a text CTA, one hairline */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <Logo />
          <ul className="hidden gap-9 text-sm text-ash md:flex">
            {links.map((l) => (
              <li key={l}>
                <a href="#" className="transition hover:text-ink">{l}</a>
              </li>
            ))}
          </ul>
          <a href="#" className="group flex items-center gap-2 text-sm font-medium text-ink">
            Order — ${product.price.earlyBird}
            <span className="grid size-7 place-items-center rounded-full bg-ink text-white transition group-hover:bg-violet">→</span>
          </a>
        </nav>
      </header>

      <section ref={section} className="relative h-[190svh] touch-pan-y">
        <div className="sticky top-0 h-svh overflow-hidden">
          <div
            ref={word}
            aria-hidden
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-center font-display font-bold leading-none text-mist"
            style={{ fontSize: 'clamp(6rem, 26vw, 28rem)', letterSpacing: '-0.06em' }}
          >
            REENG
          </div>

          <Stage>
            <WordmarkRing drag={drag} />
          </Stage>

          <p
            ref={inner}
            className="display pointer-events-none absolute inset-0 m-auto h-fit max-w-[11ch] text-center text-2xl text-ink opacity-0 md:text-4xl"
          >
            Tap anywhere contactless works.
          </p>

          <div ref={chrome}>
            <p className="label-mono absolute left-5 top-24 text-ash md:left-8">Stablecoin wallet<br />NFC ring</p>
            <p className="label-mono absolute right-5 top-24 text-right text-ash md:right-8">Drag to spin<br />Scroll to look inside</p>

            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 px-5 pb-8 md:flex-row md:items-end md:justify-between md:px-8 md:pb-10">
              <div>
                <h1 className="display max-w-[14ch] text-4xl text-ink md:text-6xl">{product.tagline}</h1>
                <p className="mt-3 max-w-sm text-ash">{product.summary}</p>
              </div>
              <div className="flex gap-3">
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

function WordmarkRing({ drag }: { drag: ReturnType<typeof useDragSpin> }) {
  const ref = useRef<Group>(null)
  const aspect = useThree((s) => s.viewport.aspect)

  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    const d = drag.current
    const p = MathUtils.smootherstep(scrollP(), 0, 1)
    const fit = Math.min(1, aspect / 1.2) // narrow screens: the ring has less width to work with
    d.step(dt)
    if (!d.active) d.angle += dt * 0.3 * (1 - p)

    // lean toward the cursor, less once it is face-on
    leanE.set(-pointer.y * 0.3 * (1 - p * 0.6), pointer.x * 0.45 * (1 - p * 0.6), 0)
    lean.setFromEuler(leanE)
    spin.setFromAxisAngle(Y, d.angle * (1 - p))
    q.copy(TILT).multiply(spin).slerp(FACE, p).premultiply(lean)
    g.quaternion.slerp(q, 1 - Math.exp(-dt * 8))

    const s = MathUtils.lerp(0.62 * fit, 1.55 * Math.max(fit, 0.55), p)
    g.scale.setScalar(MathUtils.damp(g.scale.x, s, 8, dt))
    g.position.y = MathUtils.damp(g.position.y, MathUtils.lerp(0.25, 0, p), 8, dt)
  })

  return (
    <group ref={ref}>
      <Ring />
    </group>
  )
}
