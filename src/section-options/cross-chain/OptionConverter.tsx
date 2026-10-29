import { useEffect, useMemo, useRef, useState } from 'react'
import { Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { CHAINS } from '../../content/chains'
import { createFlights, FlightCoins } from './Flights'
import { ChainDot } from '../../components/ChainDot'
import { GateRing, Headline, Sub } from './shared'

const AMOUNTS = [10, 50, 250]
const RING = new Vector3(0, 0, 0)

/**
 * B — Converter (after Wise / Altitude's send-receive cards). A card you can play with:
 * pick what you're sent — coin, chain, amount — and the coin drops through the ring lying
 * flat in the middle of the card, landing below as USDC on Base. Fee and time underneath.
 */
export function OptionConverter() {
  const [chain, setChain] = useState(2)
  const [amount, setAmount] = useState(50)
  const [out, setOut] = useState(50)
  const [busy, setBusy] = useState(false)
  const strip = useRef<HTMLDivElement>(null)
  const store = useMemo(() => createFlights(), [])
  const first = useRef(true)

  // every change sends a coin; the "you hold" figure updates when it lands
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const h = strip.current?.clientHeight ?? 200
    const w = strip.current?.clientWidth ?? 400
    store.send(CHAINS[chain], { px: w / 2, py: -h * 0.15 })
    setBusy(true)
  }, [chain, amount, store])

  const c = CHAINS[chain]

  return (
    <section className="mx-auto grid min-h-svh max-w-7xl items-center gap-10 px-5 pb-16 pt-28 md:grid-cols-2 md:px-8">
      <div>
        <Headline />
        <Sub />
        <p className="label-mono mt-8 text-ash">Try it: change the coin, the chain or the amount →</p>
      </div>

      <div className="mx-auto w-full max-w-md rounded-[2rem] bg-white p-3 shadow-xl shadow-ink/5 ring-1 ring-line">
        {/* you receive */}
        <div className="rounded-3xl bg-mist p-5">
          <p className="label-mono text-ash">Someone sends you</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <input
              aria-label="Amount"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value.replace(/[^0-9.]/g, '')) || 0))}
              className="w-32 bg-transparent font-mono text-4xl tabular-nums text-ink outline-none"
            />
            <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-sm">
              <span className="size-4 rounded-full" style={{ background: c.bg }} />
              {c.ticker}
            </span>
          </div>
          <div className="mt-3 flex gap-1.5">
            {AMOUNTS.map((a) => (
              <button key={a} onClick={() => setAmount(a)} className={`label-mono rounded-full px-2.5 py-1 transition ${a === amount ? 'bg-ink text-white' : 'bg-white text-ash hover:text-ink'}`}>
                ${a}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {CHAINS.map((ch, i) => (
              <button
                key={ch.chain}
                onClick={() => setChain(i)}
                aria-pressed={i === chain}
                className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-xs transition ${
                  i === chain ? 'bg-ink text-white' : 'bg-white text-ash hover:text-ink'
                }`}
              >
                <ChainDot chain={ch} className="size-5 text-[10px]" />
                {ch.name}
              </button>
            ))}
          </div>
        </div>

        {/* the ring, lying flat: coins drop through it */}
        <div ref={strip} className="relative h-44">
          {/* camera pulled in: this strip is short, the coins should still read */}
          <Stage cameraZ={3}>
            <GateRing pos={RING} scale={0.58} flat />
            <FlightCoins store={store} ring={RING} axis="y" duration={1.3} onLand={() => (setOut(amount), setBusy(false))} />
          </Stage>
          <span className="label-mono absolute left-5 top-1/2 -translate-y-1/2 text-ash">Reeng</span>
          <span className="label-mono absolute right-5 top-1/2 -translate-y-1/2 text-ash">1 : 1</span>
        </div>

        {/* you hold */}
        <div className="rounded-3xl bg-ink p-5 text-white">
          <p className="label-mono text-white/50">You hold</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className={`font-mono text-4xl tabular-nums transition-opacity ${busy ? 'opacity-40' : ''}`}>{out.toFixed(2)}</p>
            <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium">
              <span className="size-4 rounded-full bg-[#2775CA]" />
              USDC · Base
            </span>
          </div>
          <p className="label-mono mt-4 flex justify-between text-white/50">
            <span>Fee $0.00</span>
            <span>≈ 2 s</span>
            <span className={busy ? 'text-violet-glow' : 'text-lime'}>{busy ? 'Bridging…' : 'Settled'}</span>
          </p>
        </div>
      </div>
    </section>
  )
}
