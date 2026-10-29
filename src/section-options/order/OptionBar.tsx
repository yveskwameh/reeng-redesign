import { useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { product } from '../../content/product'
import { Drawer, innerDiameter, OrderButton, OrderRing, price, Shipping, sizes, Swatches, useEnter, useOrder, type Order } from './shared'

/**
 * D — Buy bar (after United Carriers' product page: a big product stage, everything to buy
 * in one bar along the bottom). The ring turns in on a wide stage with the promise beside it;
 * the bar holds finish, size, price and order in one line (two rows on phones).
 */
export function OptionBar() {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const enter = useEnter(section)
  const o = useOrder()

  return (
    <section ref={section} className="relative h-[150svh]">
      <div ref={stage} className="sticky top-0 h-svh cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing">
        <Stage>
          <Rig o={o} enter={enter} area={stage} />
        </Stage>
        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-7xl flex-col px-5 pb-5 pt-24 md:px-8 md:pb-8 md:pt-28">
          <div className="md:max-w-sm">
            <h2 className="display text-4xl text-ink md:text-6xl">Make it yours.</h2>
            <p className="mt-3 text-ash">{product.summary}</p>
            <ul className="label-mono mt-5 space-y-1.5 text-ash max-md:hidden">
              <li>· Zirconia ceramic</li>
              <li>· Never needs charging</li>
              <li>· Non-custodial</li>
            </ul>
          </div>

          {/* the bar */}
          <div className="pointer-events-auto mt-auto rounded-3xl bg-white p-4 shadow-xl shadow-ink/10 ring-1 ring-line md:rounded-full md:p-2 md:pl-6">
            <div className="grid grid-cols-2 items-center gap-4 md:flex md:gap-6">
              <div className="col-span-2 flex items-center justify-between gap-4 md:col-span-1 md:justify-start">
                <span className="display text-lg text-ink">Reeng</span>
                <Swatches o={o} size="sm" />
              </div>
              <label className="flex items-center gap-2 md:border-l md:border-line md:pl-6">
                <span className="label-mono text-ash">Size</span>
                <select
                  value={o.size ?? ''}
                  onChange={(e) => o.setSize(Number(e.target.value))}
                  className="cursor-pointer rounded-full bg-mist px-3 py-2 font-mono text-sm text-ink outline-none"
                >
                  <option value="" disabled>
                    US —
                  </option>
                  {sizes.map((s) => (
                    <option key={s} value={s}>
                      US {s} · Ø {innerDiameter(s).toFixed(1)}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" onClick={() => o.setDrawer(true)} className="cursor-pointer justify-self-end text-sm text-violet underline underline-offset-4 md:justify-self-auto">
                Find your size
              </button>
              <span className="flex items-baseline gap-2 md:ml-auto">
                <span className="font-display text-2xl font-bold text-ink">${price.earlyBird}</span>
                <span className="text-sm text-ash line-through">${price.regular}</span>
              </span>
              <OrderButton o={o} className="px-6 md:min-w-56" />
            </div>
          </div>
          <Shipping className="mt-3 text-center" />
        </div>
      </div>
      <Drawer o={o} />
    </section>
  )
}

function Rig({ o, enter, area }: { o: Order; enter: React.RefObject<number>; area: React.RefObject<HTMLElement | null> }) {
  const { viewport } = useThree()
  const wide = viewport.aspect > 1
  const at = useRef(new Vector3())
  at.current.set(wide ? viewport.width * 0.15 : 0, wide ? 0.15 : -0.05, 0)
  return <OrderRing finish={o.finish.color} size={o.size ?? 9} at={at} scale={wide ? 0.6 : 0.36} enter={enter} area={area} />
}
