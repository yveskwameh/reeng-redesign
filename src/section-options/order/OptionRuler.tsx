import { useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { Drawer, FindSize, innerDiameter, OrderButton, OrderRing, Price, Shipping, sizes, Swatches, useEnter, useOrder, type Order } from './shared'

/**
 * C — Size ruler (after the slider rulers on fitness and sizing apps). Size is the hard
 * choice, so it gets the stage: a ruler of sizes under the ring, and the ring grows true to
 * scale as you pick, with its inner diameter read out. Finish and price sit above, order below.
 */
export function OptionRuler() {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const enter = useEnter(section)
  const o = useOrder()
  const at = o.size ? sizes.indexOf(o.size) : -1

  return (
    <section ref={section} className="relative h-[150svh]">
      <div ref={stage} className="sticky top-0 h-svh cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing">
        <Stage>
          <Rig o={o} enter={enter} area={stage} />
        </Stage>
        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-5xl flex-col px-5 pb-6 pt-24 md:px-8 md:pb-8 md:pt-28">
          <div className="pointer-events-auto flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="display text-4xl text-ink md:text-6xl">Make it yours.</h2>
              <Price className="mt-3" />
            </div>
            <div className="md:text-right">
              <p className="label-mono mb-2 text-ash">{o.finish.name}</p>
              <Swatches o={o} />
            </div>
          </div>

          {/* diameter readout, under the ring */}
          <p className="mt-auto text-center font-display text-3xl font-bold text-ink md:text-5xl">
            {o.size ? `Ø ${innerDiameter(o.size).toFixed(1)} mm` : 'Pick your size'}
          </p>

          {/* the ruler */}
          <div className="pointer-events-auto relative mt-5">
            <div className="flex items-end justify-between border-b border-ink/20">
              {sizes.map((s, i) => (
                <button key={s} type="button" onClick={() => o.setSize(s)} aria-pressed={s === o.size} className="group flex w-8 cursor-pointer flex-col items-center gap-1.5 pb-0">
                  <span className={`font-mono text-sm transition ${s === o.size ? 'text-violet' : 'text-ash group-hover:text-ink'}`}>{s}</span>
                  <span className={`w-px transition-all ${s === o.size ? 'h-6 bg-violet' : i === at - 1 || i === at + 1 ? 'h-4 bg-ink/40' : 'h-3 bg-ink/25'}`} />
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="label-mono text-ash">US size</span>
              <FindSize o={o} />
            </div>
          </div>

          <div className="pointer-events-auto mx-auto mt-5 w-full max-w-sm">
            <OrderButton o={o} />
            <Shipping className="mt-3 text-center" />
          </div>
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
  at.current.set(0, wide ? 0.12 : 0.02, 0)
  return <OrderRing finish={o.finish.color} size={o.size ?? 9} at={at} scale={wide ? 0.4 : 0.3} enter={enter} area={area} />
}
