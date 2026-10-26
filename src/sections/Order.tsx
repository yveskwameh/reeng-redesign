import { useGSAP } from '@gsap/react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { SizeDrawer } from '../components/SizeDrawer'
import { product, type Finish } from '../content/product'
import { innerDiameter } from '../content/sizing'
import { trackSection } from '../lib/trackSection'
import { config } from '../scene/scrollState'

const { price, finishes, sizes, commerce } = product

/**
 * The configurator. Finish and size are mirrored into `config` so the 3D ring
 * recolours and resizes live (RingFx, RingRig); the ring can be dragged to spin.
 */
export function Order() {
  const section = useRef<HTMLElement>(null)
  const [finish, setFinish] = useState<Finish>(finishes[0])
  const [size, setSize] = useState<number | null>(null)
  const [kit, setKit] = useState(false)
  const [drawer, setDrawer] = useState(false)

  useGSAP(
    () => {
      trackSection(section.current!, { enter: 'orderEnter', exit: 'orderExit' })
    },
    { scope: section },
  )

  // keep the 3D ring in sync (preview at US 9 until a size is picked)
  useEffect(() => {
    config.finish = finish.color
    config.size = size ?? 9
  }, [finish, size])

  const ready = finish.available && (size !== null || kit)
  const params = new URLSearchParams({ finish: finish.id, ...(size ? { size: String(size) } : {}), ...(kit ? { kit: '1' } : {}) })

  return (
    <section ref={section} id="order" className="relative h-[150svh]">
      <div className="sticky top-0 flex h-svh items-start px-6 pt-28 md:items-center md:pt-0">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-md">
            <p className="label-mono text-violet-glow">07 / Order</p>
            <h2 className="display mt-3 text-4xl md:mt-4 md:text-6xl">Make it yours.</h2>
            <p className="mt-3 flex items-baseline gap-3 md:mt-5">
              <span className="font-display text-3xl font-bold md:text-4xl">${price.earlyBird}</span>
              <span className="text-steel line-through">${price.regular}</span>
              <span className="label-mono text-lime">Early bird</span>
            </p>

            {/* the ring shows through this gap on small screens */}
            <div aria-hidden className="h-[24svh] md:hidden" />

            <fieldset className="mt-2 md:mt-8">
              <legend className="label-mono text-steel">
                Finish · <span className="text-paper">{finish.name}</span>
              </legend>
              <div className="mt-3 flex gap-3">
                {finishes.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFinish(f)}
                    aria-pressed={f.id === finish.id}
                    aria-label={`${f.name}${f.available ? '' : ' (coming soon)'}`}
                    className={`relative size-11 cursor-pointer rounded-full border-2 transition ${
                      f.id === finish.id ? 'border-violet-glow' : 'border-white/15 hover:border-white/40'
                    }`}
                  >
                    <span className="absolute inset-1 rounded-full" style={{ background: f.color }} />
                  </button>
                ))}
              </div>
              {!finish.available && <p className="label-mono mt-2 text-steel">Coming soon · join the waitlist</p>}
            </fieldset>

            <fieldset className="mt-6">
              <legend className="label-mono flex w-full justify-between text-steel">
                <span>
                  Size ·{' '}
                  <span className="text-paper">{size ? `US ${size} · Ø ${innerDiameter(size).toFixed(1)} mm` : 'Pick one'}</span>
                </span>
              </legend>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    aria-pressed={s === size}
                    className={`cursor-pointer rounded-lg border py-2 font-mono text-sm transition ${
                      s === size ? 'border-violet-glow bg-violet/20 text-paper' : 'border-white/10 text-steel hover:border-white/30'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <button type="button" onClick={() => setDrawer(true)} className="cursor-pointer text-sm text-violet-glow underline underline-offset-4">
                  Not sure? Find your size
                </button>
                {kit && <span className="label-mono text-lime">+ Free sizing kit</span>}
              </div>
            </fieldset>

            <div className="mt-6 md:mt-8">
              {finish.available ? (
                <Link
                  to={`/checkout?${params}`}
                  aria-disabled={!ready}
                  onClick={(e) => !ready && e.preventDefault()}
                  className={`block rounded-full py-3.5 text-center font-medium transition ${
                    ready ? 'bg-violet text-white hover:bg-violet-glow hover:text-ink' : 'cursor-not-allowed bg-white/10 text-steel'
                  }`}
                >
                  {ready ? `Order — $${price.earlyBird}` : 'Pick a size to order'}
                </Link>
              ) : (
                <a
                  href="https://buy.reeng.xyz/I20VCQCZ4Z92Y2MFNA1H6I"
                  className="block rounded-full border border-white/20 py-3.5 text-center font-medium text-paper hover:border-white/50"
                >
                  Join the {finish.name} waitlist
                </a>
              )}
              <p className="label-mono mt-3 text-center text-steel">
                {commerce.shipping} · {commerce.returnsDays}-day returns
              </p>
            </div>
          </div>
        </div>
      </div>

      <SizeDrawer
        open={drawer}
        onClose={() => setDrawer(false)}
        onPick={(s) => {
          setSize(s)
          setDrawer(false)
        }}
        kit={kit}
        onKit={setKit}
      />
    </section>
  )
}
