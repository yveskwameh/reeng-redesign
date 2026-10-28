import { useGSAP } from '@gsap/react'
import { useRef, useState } from 'react'
import { trackSection } from '../lib/trackSection'
import { ALIAS } from '../scene/envelopeFace'
import { MAIL, mailPhase, smoothstep, type MailPhase } from '../scene/scrollState'

// the alias that replaces the burned one, typed in at the end
const NEXT_ALIAS = 'm3p8v1@reeng.xyz'

const steps: { phase: MailPhase; label: string }[] = [
  { phase: 'incoming', label: 'Sent to your alias' },
  { phase: 'received', label: `+${MAIL.amount.toFixed(2)} USDC on your ring` },
  { phase: 'burned', label: 'Alias burned' },
]
const order: MailPhase[] = ['incoming', 'opened', 'received', 'burned']

/**
 * Pinned for three screens. The 3D Envelope arrives addressed to a one-time alias, its
 * coins fly into the ring, then the alias dissolves. Beside it, an address field types the
 * alias as the envelope arrives, strikes it through in coral once it burns, then types a
 * fresh one for next time.
 */
export function PayByEmail() {
  const section = useRef<HTMLElement>(null)
  const [p, setP] = useState(0)

  useGSAP(
    () => {
      trackSection(section.current!, { enter: 'mailEnter', progress: 'mail', exit: 'mailExit' }, setP)
    },
    { scope: section },
  )

  const phase = mailPhase(p)
  const reached = (s: MailPhase) => order.indexOf(phase) >= order.indexOf(s)
  const burned = reached('burned')
  // type the alias in while the envelope arrives, and the next one once it has burned
  const typed = ALIAS.slice(0, Math.round(smoothstep(0, MAIL.arrive[1], p) * ALIAS.length))
  const next = NEXT_ALIAS.slice(0, Math.round(smoothstep(MAIL.burn[1], 1, p) * NEXT_ALIAS.length))

  return (
    <section ref={section} id="email" className="relative h-[300svh] text-ink">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-7xl flex-col px-5 pt-24 md:justify-center md:px-8 md:pt-0">
          <div className="md:max-w-lg">
            <h2 className="display text-5xl md:text-7xl">Pay by email.</h2>
            <p className="mt-4 max-w-md text-lg text-ash">Send stablecoins to any inbox. Receive on a one-time alias that disappears after use.</p>

            {/* the address field */}
            <div className="mt-8 flex items-center gap-3 rounded-full bg-white py-3 pl-5 pr-3 shadow-lg shadow-ink/5 ring-1 ring-line md:mt-10 md:py-4">
              <span className="label-mono shrink-0 text-ash">To</span>
              <span className="min-w-0 flex-1 truncate font-display text-lg md:text-2xl">
                {next ? (
                  <span>
                    {next}
                    <Caret />
                  </span>
                ) : (
                  <span className={`transition-colors duration-500 ${burned ? 'text-coral line-through decoration-2' : ''}`}>
                    {typed}
                    {!burned && <Caret />}
                  </span>
                )}
              </span>
              <span className={`grid size-9 shrink-0 place-items-center rounded-full transition ${next ? 'bg-violet text-white' : 'bg-mist text-ash'}`} aria-hidden>
                ↻
              </span>
            </div>
            <p className="label-mono mt-3 text-ash">
              {next ? 'New alias for next time' : burned ? 'Alias burned · it can never be used again' : 'One-time alias · your real address stays hidden'}
            </p>

            <ol className="mt-8 flex flex-wrap gap-2">
              {steps.map((s) => (
                <li
                  key={s.phase}
                  className={`label-mono rounded-full px-3 py-1.5 transition ${
                    reached(s.phase) ? (s.phase === 'burned' ? 'bg-coral text-white' : 'bg-ink text-white') : 'bg-mist text-ash'
                  }`}
                >
                  {s.label}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

const Caret = () => <span className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-[0.15em] animate-pulse bg-violet" />
