import { useGSAP } from '@gsap/react'
import { useEffect, useRef, useState } from 'react'
import { product } from '../content/product'
import { trackSection } from '../lib/trackSection'
import { anchors, config, heroFx, scrollState, smoothstep } from '../scene/scrollState'

const MERCHANTS = [
  ['Blue Bottle', 4.2],
  ['Metro', 2.75],
  ['Corner Market', 12.4],
  ['Cinema', 9.0],
  ['Bakery', 3.6],
] as const

type Receipt = { id: number; name: string; amount: number; total: number }
type Ripple = { id: number; x: number; y: number }

/**
 * Hero. A giant pale wordmark (Scene) behind the floating ring
 * (RingRig `hero`), headline and actions along the bottom. The ring turns on its own;
 * a drag spins it, a click pays: it dips to its shadow, a ripple leaves it and one
 * receipt shows under the dial. Scrolling turns it face-on around the tagline.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null)
  const inner = useRef<HTMLParagraphElement>(null)
  const chrome = useRef<HTMLDivElement>(null)
  const [finish, setFinish] = useState(product.finishes[0])
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [ripples, setRipples] = useState<Ripple[]>([])
  const taps = useRef({ count: 0, total: 0 })

  useEffect(() => {
    config.heroFinish = finish.color
  }, [finish])

  // scroll: the bottom chrome fades and the tagline appears in the hole (the wordmark
  // behind the ring lives under the canvas, see Scene)
  useGSAP(
    () => {
      const onProgress = (p: number) => {
        if (inner.current) inner.current.style.opacity = `${smoothstep(0.6, 1, p)}`
        if (chrome.current) {
          chrome.current.style.opacity = `${1 - smoothstep(0, 0.35, p)}`
          chrome.current.style.visibility = p > 0.4 ? 'hidden' : ''
        }
      }
      onProgress(0)
      trackSection(section.current!, { progress: 'hero' }, onProgress)
    },
    { scope: section },
  )

  // a short press that barely moves is a tap (a payment); anything longer is a drag (a spin)
  useEffect(() => {
    const el = section.current
    if (!el) return
    let start = { x: 0, y: 0, t: 0, ok: false }
    let hide: ReturnType<typeof setTimeout>
    const down = (e: PointerEvent) => {
      const ignore = (e.target as HTMLElement).closest('a,button,input,label')
      start = { x: e.clientX, y: e.clientY, t: performance.now(), ok: !ignore && scrollState.hero < 0.3 }
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
      heroFx.tapAt = performance.now() / 1000
      // the payment leaves from the ring, wherever the click was
      setRipples((r) => [...r, { id, x: heroFx.x, y: heroFx.y }])
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
    <section ref={section} id="top" className="relative h-[190svh] touch-pan-y">
      <div className="sticky top-0 h-svh cursor-grab overflow-hidden active:cursor-grabbing">
        {ripples.map((r) => (
          <span key={r.id} className="pointer-events-none fixed" style={{ left: r.x, top: r.y }}>
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
              <span ref={(el) => void (anchors.heroDial = el)} className="font-mono text-sm tabular-nums tracking-normal text-ink">
                000°
              </span>
              <br />
              Drag to spin · Tap to pay
            </p>
            {receipt && (
              <div
                key={receipt.id}
                className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-line"
                style={{ animation: 'fade-up .35s' }}
              >
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

          <div className="absolute inset-x-0 bottom-0 grid gap-6 px-5 pb-8 md:grid-cols-[1fr_auto] md:items-end md:px-8 md:pb-10">
            <div className="pointer-events-none">
              <h1 className="display max-w-[14ch] text-4xl text-ink md:text-6xl">{product.tagline}</h1>
              <p className="mt-3 max-w-sm text-ash">{product.summary}</p>
            </div>

            {/* right column: finishes, then the actions */}
            <div className="flex flex-col gap-5 md:items-end">
              <div className="flex items-center gap-3">
                <p className="label-mono text-ash max-md:order-last">
                  {finish.name}
                  {!finish.available && ' · soon'}
                </p>
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
              </div>

              <div className="flex gap-3">
                <a href="/#order" className="rounded-full bg-ink px-7 py-3.5 font-medium text-white transition hover:bg-violet">
                  Order — ${product.price.earlyBird}
                </a>
                <a
                  href="#how-it-works"
                  className="rounded-full border border-line bg-white/70 px-7 py-3.5 font-medium text-ink transition hover:border-ink"
                >
                  How it works
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
