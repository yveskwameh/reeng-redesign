import { useGSAP } from '@gsap/react'
import { useEffect, useRef } from 'react'
import { Drawer, FindSize, finishes, OrderButton, price, Shipping, SizeGrid, sizeLabel, useOrder } from '../components/order'
import { trackSection } from '../lib/trackSection'
import { anchors, config } from '../scene/scrollState'

/**
 * The configurator, in two steps (after Oura's buy page): the ring turns on a soft stage
 * card on the left, and a panel walks through finish then size, with the price and the
 * order button pinned at its foot. Finish and size are mirrored into `config` so the 3D
 * ring recolours and resizes live; RingRig poses it over the stage, Backdrop draws the
 * card's fill under the canvas, and the ring can be dragged to spin there.
 */
export function Order() {
  const section = useRef<HTMLElement>(null)
  const o = useOrder()

  useGSAP(
    () => {
      trackSection(section.current!, { enter: 'orderEnter', exit: 'orderExit' })
    },
    { scope: section },
  )

  // keep the 3D ring in sync (preview at US 9 until a size is picked)
  useEffect(() => {
    config.finish = o.finish.color
    config.size = o.size ?? 9
  }, [o.finish, o.size])

  return (
    <section ref={section} id="order" className="relative h-[150svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="mx-auto grid h-full max-w-7xl grid-rows-[minmax(14rem,1fr)_auto] gap-4 px-5 pb-6 pt-20 md:grid-cols-[1.4fr_1fr] md:grid-rows-1 md:gap-6 md:px-8 md:pb-8 md:pt-24">
          {/* the stage: its fill is drawn under the canvas, so the ring shows through */}
          <div ref={(el) => void (anchors.orderStage = el)} className="relative cursor-grab touch-pan-y rounded-3xl active:cursor-grabbing">
            <div className="absolute left-5 top-5 md:left-7 md:top-7">
              <h2 className="display text-3xl text-ink md:text-6xl">Make it yours.</h2>
              <p className="label-mono mt-2 text-ash">Drag to turn it</p>
            </div>
            <div className="absolute inset-x-0 bottom-3 flex justify-center md:bottom-5">
              <div className="flex items-center gap-3 rounded-full bg-white py-1.5 pl-1.5 pr-4 shadow-lg shadow-ink/5 ring-1 ring-line">
                <span className="size-6 rounded-full ring-1 ring-ink/10" style={{ background: o.finish.color }} />
                <span className="text-sm font-medium text-ink">{o.finish.name}</span>
                <span className="label-mono text-ash">{o.size ? `US ${o.size}` : 'Size —'}</span>
              </div>
            </div>
          </div>

          {/* the panel */}
          <div className="flex min-h-0 flex-col rounded-3xl bg-white ring-1 ring-line max-md:max-h-[64svh]">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 md:p-6">
              <Step n={1} title="Finish" value={o.finish.name}>
                {/* rows on wide screens; three compact tiles on phones */}
                <div className="grid grid-cols-3 gap-2 md:grid-cols-1">
                  {finishes.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => o.setFinish(f)}
                      aria-pressed={f.id === o.finish.id}
                      className={`flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-2xl p-2.5 text-center ring-1 transition md:flex-row md:gap-3 md:text-left ${
                        f.id === o.finish.id ? 'bg-white ring-violet' : 'bg-mist ring-transparent hover:ring-line'
                      }`}
                    >
                      <span className="size-7 shrink-0 rounded-full ring-1 ring-ink/10 md:size-8" style={{ background: f.color }} />
                      <span className="text-xs font-medium text-ink md:flex-1 md:text-sm">{f.name}</span>
                      <span className="label-mono text-ash max-md:text-[0.6rem]">{f.available ? `$${price.earlyBird}` : <>Coming<span className="max-md:hidden"> soon</span></>}</span>
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
            <div className="border-t border-line p-4 md:p-6">
              <div className="mb-2.5 flex items-baseline justify-between md:mb-3">
                <span className="flex items-baseline gap-3">
                  <span className="font-display text-2xl font-bold text-ink">${price.earlyBird}</span>
                  <span className="label-mono rounded-full bg-lime px-2 py-0.5 text-ink">Early bird</span>
                </span>
                <span className="text-sm text-ash line-through">${price.regular}</span>
              </div>
              <OrderButton o={o} />
              <Shipping className="mt-2.5 text-center max-md:text-[0.6rem] md:mt-3" />
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
    <div className="mb-5 last:mb-0 md:mb-6">
      <p className="label-mono flex justify-between text-ash">
        <span>
          {n}. {title}
        </span>
        <span className="text-ink">{value}</span>
      </p>
      <div className="mt-2.5 md:mt-3">{children}</div>
    </div>
  )
}
