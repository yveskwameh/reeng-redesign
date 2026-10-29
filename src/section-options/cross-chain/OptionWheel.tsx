import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { CHAINS, COIN_VALUE } from '../../content/chains'
import { createFlights, FlightCoins, type Flights } from './Flights'
import { ChainDot } from '../../components/ChainDot'
import { BalanceCard, GateRing, Headline, Sub } from './shared'

const ITEM = 64 // px per wheel row

/**
 * A — Chain wheel (after CTRL's "2,300+ chains" list). A vertical wheel of chains turns on
 * its own; the one in the middle sends its coin through the ring, out as USDC, onto the
 * stack. Click any chain to send from it. Copy and balance on the left.
 */
export function OptionWheel() {
  const [active, setActive] = useState(0)
  const [landed, setLanded] = useState(0)
  const [hover, setHover] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  const dots = useRef<(HTMLSpanElement | null)[]>([])
  const store = useMemo(() => createFlights(), [])

  const activeRef = useRef(0)
  const send = (i: number) => {
    activeRef.current = i
    setActive(i)
    const dot = dots.current[i]
    const box = stage.current?.getBoundingClientRect()
    if (!dot || !box) return
    // the wheel slides the item to the middle; send from where it will be
    const r = dot.getBoundingClientRect()
    store.send(CHAINS[i], { px: r.left + r.width / 2 - box.left, py: box.height / 2 })
  }

  useEffect(() => {
    if (hover) return
    const id = setInterval(() => send((activeRef.current + 1) % CHAINS.length), 2200)
    return () => clearInterval(id)
  }, [hover]) // eslint-disable-line react-hooks/exhaustive-deps

  const status = landed === 0 ? 'Receiving' : 'Settled on Base'

  return (
    <section className="mx-auto grid min-h-svh max-w-7xl items-center gap-10 px-5 pb-16 pt-28 md:grid-cols-[5fr_7fr] md:px-8">
      <div>
        <Headline />
        <Sub />
        <BalanceCard amount={landed * COIN_VALUE} status={status} className="mt-10" />
      </div>

      <div ref={stage} className="relative h-[62svh] min-h-[420px] overflow-hidden" onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
        <Stage>
          <WheelScene store={store} onLand={() => setLanded((n) => n + 1)} />
        </Stage>

        {/* the wheel: active chain centred, the rest fading away above and below */}
        <ul
          className="absolute left-0 top-1/2 w-[46%] transition-transform duration-500 ease-out"
          style={{ transform: `translateY(${-(active + 0.5) * ITEM}px)` }}
        >
          {CHAINS.map((c, i) => {
            const d = Math.abs(i - active)
            return (
              <li key={c.chain} style={{ height: ITEM, opacity: Math.max(0.12, 1 - d * 0.3) }} className="transition-opacity duration-500">
                <button onClick={() => send(i)} className="flex h-full w-full items-center gap-3 text-left">
                  <span ref={(el) => void (dots.current[i] = el)}>
                    <ChainDot chain={c} className={`text-sm transition-all duration-500 ${i === active ? 'size-11' : 'size-9'}`} />
                  </span>
                  <span className={`font-display font-bold tracking-tight transition-all duration-500 ${i === active ? 'text-3xl text-ink' : 'text-2xl text-ash'}`}>
                    {c.name}
                  </span>
                  {i === active && <span className="label-mono ml-auto rounded-full bg-mist px-2 py-1 text-ash max-md:hidden">{c.ticker}</span>}
                </button>
              </li>
            )
          })}
        </ul>
        <p className="label-mono absolute bottom-2 left-0 text-ash">Tap a chain to send from it</p>
      </div>
    </section>
  )
}

function WheelScene({ store, onLand }: { store: Flights; onLand: () => void }) {
  const { viewport } = useThree()
  const hw = viewport.width / 2
  const narrow = viewport.aspect < 0.9 // phones: the wheel takes more of the width
  const ring = useMemo(() => new Vector3(hw * (narrow ? 0.5 : 0.25), 0.15, 0), [hw, narrow])
  const stack = useMemo(() => new Vector3(hw * (narrow ? 0.62 : 0.78), -1.3, 0.4), [hw, narrow])
  return (
    <>
      <GateRing pos={ring} scale={narrow ? 0.34 : 0.5} />
      <FlightCoins store={store} ring={ring} stack={stack} onLand={onLand} />
    </>
  )
}
