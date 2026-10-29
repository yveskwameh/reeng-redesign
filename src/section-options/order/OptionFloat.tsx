import { useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { Drawer, FindSize, OrderButton, OrderRing, Price, Shipping, SizeGrid, sizeLabel, Swatches, useEnter, useOrder, type Order } from './shared'

/**
 * B — Floating card (after Rains: the product fills the page, a compact buy card floats over
 * one corner). The ring turns in big in the middle of a white stage with "Make it yours."
 * behind it; finish, size and order live in one card on the right.
 */
export function OptionFloat() {
  const section = useRef<HTMLElement>(null)
  const area = useRef<HTMLDivElement>(null)
  const enter = useEnter(section)
  const o = useOrder()

  return (
    <section ref={section} className="relative h-[150svh]">
      <div ref={area} className="sticky top-0 h-svh cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing">
        <p
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[18%] select-none text-center font-display font-bold leading-none text-mist md:top-1/2 md:-translate-y-1/2"
          style={{ fontSize: 'clamp(4rem, 15vw, 15rem)', letterSpacing: '-0.05em' }}
        >
          Make it yours.
        </p>
        <Stage>
          <Rig o={o} enter={enter} area={area} />
        </Stage>
        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-7xl flex-col justify-end px-5 pb-6 pt-24 md:flex-row md:items-center md:justify-end md:px-8 md:pb-8">
          <div className="pointer-events-auto w-full rounded-3xl bg-white/90 p-5 shadow-xl shadow-ink/10 ring-1 ring-line backdrop-blur md:w-96 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="display text-2xl text-ink md:text-3xl">Reeng</h2>
                <p className="text-sm text-ash">{o.finish.name}</p>
              </div>
              <Swatches o={o} size="sm" />
            </div>
            <Price className="mt-4" />
            <p className="label-mono mt-5 text-ash">
              Size · <span className="text-ink">{sizeLabel(o)}</span>
            </p>
            <div className="mt-2">
              <SizeGrid o={o} />
            </div>
            <div className="mt-3">
              <FindSize o={o} />
            </div>
            <OrderButton o={o} className="mt-5" />
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
  at.current.set(wide ? -viewport.width * 0.12 : 0, wide ? -0.05 : 0.75, 0)
  return <OrderRing finish={o.finish.color} size={o.size ?? 9} at={at} scale={wide ? 0.62 : 0.36} enter={enter} area={area} />
}
