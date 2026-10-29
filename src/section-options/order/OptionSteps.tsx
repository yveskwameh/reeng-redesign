import { useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { Drawer, finishes, FindSize, OrderButton, OrderRing, price, Shipping, SizeGrid, sizeLabel, useEnter, useOrder, type Order } from './shared'

/**
 * A — Two steps (after Oura's buy page: a product stage on the left, "1. Finish · 2. Size"
 * on the right). The ring sits on a soft stage card with the finish swatches floating at its
 * foot; the panel walks through finish (as rows, with what's coming soon) then size, with
 * the price and the order button pinned at the bottom.
 */
export function OptionSteps() {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const enter = useEnter(section)
  const o = useOrder()

  return (
    <section ref={section} className="relative h-[150svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="mx-auto grid h-full max-w-7xl gap-4 px-5 pb-6 pt-20 md:grid-cols-[1.4fr_1fr] md:gap-6 md:px-8 md:pb-8 md:pt-24">
          {/* the stage: the ring shows through here */}
          <div ref={stage} className="relative min-h-56 cursor-grab touch-pan-y rounded-3xl bg-mist active:cursor-grabbing">
            <div className="absolute left-5 top-5 md:left-7 md:top-7">
              <h2 className="display text-4xl text-ink md:text-6xl">Make it yours.</h2>
              <p className="label-mono mt-2 text-ash">Drag to turn it</p>
            </div>
            <div className="absolute inset-x-0 bottom-5 flex justify-center">
              <div className="flex items-center gap-3 rounded-full bg-white py-1.5 pl-1.5 pr-4 shadow-lg shadow-ink/5 ring-1 ring-line">
                <span className="size-6 rounded-full ring-1 ring-ink/10" style={{ background: o.finish.color }} />
                <span className="text-sm font-medium text-ink">{o.finish.name}</span>
                <span className="label-mono text-ash">{o.size ? `US ${o.size}` : 'Size —'}</span>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0">
              <Stage>
                <Rig o={o} enter={enter} area={stage} />
              </Stage>
            </div>
          </div>

          {/* the panel */}
          <div className="flex min-h-0 flex-col rounded-3xl bg-white ring-1 ring-line">
            <div className="min-h-0 flex-1 overflow-y-auto p-5 md:p-6">
              <Step n={1} title="Finish" value={o.finish.name}>
                <div className="space-y-2">
                  {finishes.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => o.setFinish(f)}
                      aria-pressed={f.id === o.finish.id}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl p-2.5 text-left ring-1 transition ${
                        f.id === o.finish.id ? 'bg-white ring-violet' : 'bg-mist ring-transparent hover:ring-line'
                      }`}
                    >
                      <span className="size-8 rounded-full ring-1 ring-ink/10" style={{ background: f.color }} />
                      <span className="flex-1 text-sm font-medium text-ink">{f.name}</span>
                      <span className="label-mono text-ash">{f.available ? `$${price.earlyBird}` : 'Coming soon'}</span>
                    </button>
                  ))}
                </div>
              </Step>
              <Step n={2} title="Size" value={sizeLabel(o)}>
                <SizeGrid o={o} />
                <div className="mt-3">
                  <FindSize o={o} />
                </div>
              </Step>
            </div>
            <div className="border-t border-line p-5 md:p-6">
              <div className="mb-3 flex items-baseline justify-between">
                <span className="font-display text-2xl font-bold text-ink">${price.earlyBird}</span>
                <span className="text-sm text-ash line-through">${price.regular}</span>
              </div>
              <OrderButton o={o} />
              <Shipping className="mt-3 text-center" />
            </div>
          </div>
        </div>
      </div>
      <Drawer o={o} />
    </section>
  )
}

function Step({ n, title, value, children }: { n: number; title: string; value: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 last:mb-0">
      <p className="label-mono flex justify-between text-ash">
        <span>
          {n}. {title}
        </span>
        <span className="text-ink">{value}</span>
      </p>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function Rig({ o, enter, area }: { o: Order; enter: React.RefObject<number>; area: React.RefObject<HTMLElement | null> }) {
  const { viewport } = useThree()
  const at = useRef(new Vector3(0, -0.05, 0))
  at.current.set(0, viewport.aspect > 1 ? -0.1 : -0.15, 0)
  return <OrderRing finish={o.finish.color} size={o.size ?? 9} at={at} scale={viewport.aspect > 1 ? 0.5 : 0.42} enter={enter} area={area} />
}
