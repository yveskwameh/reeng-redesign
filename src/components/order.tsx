import { useState } from 'react'
import { Link } from 'react-router'
import { product, type Finish } from '../content/product'
import { innerDiameter } from '../content/sizing'
import { SizeDrawer } from './SizeDrawer'

export const { price, finishes, sizes, commerce } = product
export { innerDiameter, type Finish }

/** Finish, size and sizing-kit state, with whether the order can go through and the checkout link. */
export function useOrder() {
  const [finish, setFinish] = useState<Finish>(finishes[0])
  const [size, setSize] = useState<number | null>(null)
  const [kit, setKit] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const ready = finish.available && (size !== null || kit)
  const params = new URLSearchParams({ finish: finish.id, ...(size ? { size: String(size) } : {}), ...(kit ? { kit: '1' } : {}) })
  return { finish, setFinish, size, setSize, kit, setKit, drawer, setDrawer, ready, href: `/checkout?${params}` }
}
export type Order = ReturnType<typeof useOrder>

export function Price({ className = '' }: { className?: string }) {
  return (
    <p className={`flex items-baseline gap-3 ${className}`}>
      <span className="font-display text-3xl font-bold text-ink md:text-4xl">${price.earlyBird}</span>
      <span className="text-ash line-through">${price.regular}</span>
      <span className="label-mono rounded-full bg-lime px-2 py-0.5 text-ink">Early bird</span>
    </p>
  )
}

export function Swatches({ o, size = 'md' }: { o: Order; size?: 'sm' | 'md' }) {
  return (
    <div className="flex gap-2.5">
      {finishes.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => o.setFinish(f)}
          aria-pressed={f.id === o.finish.id}
          aria-label={`${f.name}${f.available ? '' : ' (coming soon)'}`}
          className={`relative cursor-pointer rounded-full border-2 transition ${size === 'sm' ? 'size-8' : 'size-11'} ${
            f.id === o.finish.id ? 'border-violet' : 'border-line hover:border-ink/30'
          }`}
        >
          <span className="absolute inset-1 rounded-full ring-1 ring-ink/10" style={{ background: f.color }} />
        </button>
      ))}
    </div>
  )
}

export function SizeGrid({ o, cols = 5 }: { o: Order; cols?: number }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {sizes.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => o.setSize(s)}
          aria-pressed={s === o.size}
          className={`cursor-pointer rounded-xl border py-2 font-mono text-sm transition ${
            s === o.size ? 'border-violet bg-violet text-white' : 'border-line text-ash hover:border-ink/30 hover:text-ink'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  )
}

export const sizeLabel = (o: Order) => (o.size ? `US ${o.size} · Ø ${innerDiameter(o.size).toFixed(1)} mm` : o.kit ? 'Sizing kit first' : 'Pick one')

export function FindSize({ o }: { o: Order }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button type="button" onClick={() => o.setDrawer(true)} className="cursor-pointer text-sm text-violet underline underline-offset-4">
        Not sure? Find your size
      </button>
      {o.kit && <span className="label-mono rounded-full bg-lime px-2 py-0.5 text-ink">+ Free sizing kit</span>}
    </div>
  )
}

export function OrderButton({ o, className = '' }: { o: Order; className?: string }) {
  if (!o.finish.available)
    return (
      <a href="https://buy.reeng.xyz/I20VCQCZ4Z92Y2MFNA1H6I" className={`block rounded-full border border-line py-3.5 text-center font-medium text-ink hover:border-ink/40 ${className}`}>
        Join the {o.finish.name} waitlist
      </a>
    )
  return (
    <Link
      to={o.href}
      aria-disabled={!o.ready}
      onClick={(e) => !o.ready && e.preventDefault()}
      className={`block rounded-full py-3.5 text-center font-medium transition ${o.ready ? 'bg-violet text-white hover:bg-ink' : 'cursor-not-allowed bg-mist text-ash'} ${className}`}
    >
      {o.ready ? `Order — $${price.earlyBird}` : 'Pick a size to order'}
    </Link>
  )
}

export const Shipping = ({ className = '' }: { className?: string }) => (
  <p className={`label-mono text-ash ${className}`}>
    {commerce.shipping} · {commerce.returnsDays}-day returns
  </p>
)

/** The size-finder drawer, wired to the order. */
export const Drawer = ({ o }: { o: Order }) => (
  <SizeDrawer
    open={o.drawer}
    onClose={() => o.setDrawer(false)}
    onPick={(s) => {
      o.setSize(s)
      o.setDrawer(false)
    }}
    kit={o.kit}
    onKit={o.setKit}
  />
)
