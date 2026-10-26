import { useGSAP } from '@gsap/react'
import { useRef, useState } from 'react'
import { trackSection } from '../lib/trackSection'
import { coinTravel, CROSS } from '../scene/scrollState'

const tokensIn = ['USDT', 'cUSD', 'USDC']

/**
 * Pinned for three screens. The 3D scene (RingRig portal, Coins) reads the progress;
 * the copy shows the balance building up as each coin lands on Base.
 */
export function CrossChain() {
  const section = useRef<HTMLElement>(null)
  const [landed, setLanded] = useState(0)

  useGSAP(
    () => {
      trackSection(section.current!, { enter: 'crossEnter', progress: 'cross', exit: 'crossExit' }, (p) => {
        let n = 0
        for (let i = 0; i < CROSS.coins; i++) if (coinTravel(i, p) >= 1) n++
        setLanded(n)
      })
    },
    { scope: section },
  )

  const settled = landed === CROSS.coins
  const status = settled ? 'Settled on Base' : landed > 0 ? 'Bridging' : 'Receiving'

  return (
    <section ref={section} id="cross-chain" className="relative h-[300svh]">
      <div className="sticky top-0 flex h-svh items-start px-6 pt-32 md:items-center md:pt-0">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-md">
            <p className="label-mono text-violet-glow">02 / Cross-chain</p>
            <h2 className="display mt-4 text-5xl md:text-7xl">
              Any coin in. <span className="text-[#2775CA]">USDC</span> out.
            </h2>
            <p className="mt-5 text-lg text-steel">Receive on any chain. Reeng bridges it all to USDC on Base.</p>

            {/* in → out, as chips rather than prose */}
            <div className="mt-8 hidden items-center gap-3 md:flex">
              {tokensIn.map((t) => (
                <span key={t} className="label-mono rounded-full border border-white/15 px-3 py-1.5 text-paper">
                  {t}
                </span>
              ))}
              <span aria-hidden className="text-steel">→</span>
              <span className="label-mono rounded-full bg-[#0052FF] px-3 py-1.5 text-white">USDC · Base</span>
            </div>

            <div className="mt-10 border-t border-white/10 pt-5">
              <p className={`label-mono transition-colors ${settled ? 'text-lime' : 'text-steel'}`}>{status}</p>
              <p className="mt-2 font-mono text-4xl tabular-nums md:text-5xl">
                {(landed * CROSS.coinValue).toFixed(2)}
                <span className="ml-3 text-lg text-steel">USDC</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
