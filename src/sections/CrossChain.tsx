import { useGSAP } from '@gsap/react'
import { useRef, useState } from 'react'
import { ChainDot } from '../components/ChainDot'
import { CHAINS } from '../content/chains'
import { trackSection } from '../lib/trackSection'
import { coinTravel, CROSS } from '../scene/scrollState'

/** What each coin in the tunnel is worth, in order. */
const AMOUNTS = [50, 120, 25]

type Card = { current: number; travel: number; passed: number }

/**
 * Pinned for just over a screen. The 3D scene (RingRig gate, Coins tunnel) reads the progress:
 * coins from each chain rush out of the depth through the ring. The converter card follows
 * the same progress — the coin in flight on top, its trip through Reeng in the middle,
 * and what you hold in USDC on Base filling up underneath.
 */
export function CrossChain() {
  const section = useRef<HTMLElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const [card, setCard] = useState<Card>({ current: 0, travel: 0, passed: 0 })

  useGSAP(
    () => {
      trackSection(section.current!, { enter: 'crossEnter', progress: 'cross', exit: 'crossExit' }, (p) => {
        let current = 0
        let passed = 0
        for (let i = 0; i < CROSS.coins; i++) {
          const u = coinTravel(i, p)
          if (u > 0) current = i
          if (u >= CROSS.passed) passed++
        }
        const travel = coinTravel(current, p)
        if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, travel / CROSS.passed)})`
        setCard((c) => (c.current === current && c.passed === passed && (c.travel > 0) === (travel > 0) ? c : { current, travel, passed }))
      }, { drift: true })
    },
    { scope: section },
  )

  const coin = CHAINS[card.current]
  const held = AMOUNTS.slice(0, card.passed).reduce((s, a) => s + a, 0)
  const settled = card.passed === CROSS.coins
  const inFlight = card.travel > 0 && card.passed <= card.current
  const status = settled ? 'Settled' : inFlight ? 'Bridging…' : 'Waiting'

  return (
    <section ref={section} id="cross-chain" className="relative h-[220svh] text-ink">
      <div className="sticky top-0 h-svh">
        {/* headline top-left, tunnel in the middle, card bottom-right: a diagonal across the screen */}
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-between gap-6 px-5 pb-16 pt-28 md:block md:px-8 md:pb-0">
          <div className="max-w-sm">
            <h2 className="display text-5xl md:text-6xl">
              Any coin in. <span className="text-[#2775CA]">USDC</span> out.
            </h2>
            <p className="mt-5 text-lg text-ash">Receive on any chain. Reeng bridges it all to USDC on Base.</p>
          </div>

          {/* converter: follows the coin currently coming through the tunnel */}
          <div data-reveal className="w-full rounded-[2rem] bg-white p-2.5 shadow-xl shadow-ink/5 ring-1 ring-line md:absolute md:bottom-10 md:right-8 md:w-96 md:p-3">
            <div className="rounded-3xl bg-mist p-4 md:p-5">
              <p className="label-mono text-ash">Someone sends you</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p key={card.current} className="font-mono text-3xl tabular-nums md:text-4xl" style={{ animation: 'fade-up .3s' }}>
                  {AMOUNTS[card.current].toFixed(2)}
                </p>
                <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium shadow-sm">
                  <span className="size-4 rounded-full" style={{ background: coin.bg }} />
                  {coin.ticker} · {coin.name}
                </span>
              </div>
              <div className="mt-4 hidden flex-wrap gap-1.5 md:flex">
                {CHAINS.slice(0, CROSS.coins).map((ch, i) => (
                  <span
                    key={ch.chain}
                    className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-xs transition-colors duration-300 ${
                      i === card.current ? 'bg-ink text-white' : i < card.passed ? 'bg-white text-ink' : 'bg-white text-ash/60'
                    }`}
                  >
                    <ChainDot chain={ch} className="size-5 text-[10px]" />
                    {ch.name}
                  </span>
                ))}
              </div>
            </div>

            {/* the trip through the ring */}
            <div className="flex items-center gap-3 px-4 py-3 md:px-5 md:py-4">
              <span className="label-mono text-ash">Reeng</span>
              <div className="h-px flex-1 bg-line">
                <div ref={bar} className="h-px origin-left scale-x-0 bg-violet" />
              </div>
              <span className="label-mono text-ash">1 : 1</span>
            </div>

            <div className="rounded-3xl bg-ink p-4 text-white md:p-5">
              <p className="label-mono text-white/50">You hold</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="font-mono text-3xl tabular-nums md:text-4xl">{held.toFixed(2)}</p>
                <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium">
                  <span className="size-4 rounded-full bg-[#2775CA]" />
                  USDC · Base
                </span>
              </div>
              <p className="label-mono mt-4 flex justify-between text-white/50">
                <span>Fee $0.00</span>
                <span>≈ 2 s</span>
                <span className={settled ? 'text-lime' : inFlight ? 'text-violet-glow' : ''}>{status}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
