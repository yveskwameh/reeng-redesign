import { useGSAP } from '@gsap/react'
import { useRef, useState } from 'react'
import { trackSection } from '../lib/trackSection'
import { MAIL, mailPhase, type MailPhase } from '../scene/scrollState'

const steps: { phase: MailPhase; label: string }[] = [
  { phase: 'incoming', label: 'Sent to your alias' },
  { phase: 'received', label: `+${MAIL.amount.toFixed(2)} USDC on your ring` },
  { phase: 'burned', label: 'Alias burned' },
]
const order: MailPhase[] = ['incoming', 'opened', 'received', 'burned']

/**
 * Pinned for three screens. The 3D Envelope arrives addressed to a one-time alias,
 * its coins fly into the ring, then the alias dissolves; the copy tracks the phase.
 */
export function PayByEmail() {
  const section = useRef<HTMLElement>(null)
  const [phase, setPhase] = useState<MailPhase>('incoming')

  useGSAP(
    () => {
      trackSection(section.current!, { enter: 'mailEnter', progress: 'mail', exit: 'mailExit' }, (p) => setPhase(mailPhase(p)))
    },
    { scope: section },
  )

  const at = order.indexOf(phase)
  const reached = (s: MailPhase) => at >= order.indexOf(s)

  return (
    <section ref={section} id="email" className="relative h-[300svh]">
      <div className="sticky top-0 flex h-svh items-start px-6 pt-32 md:items-center md:pt-0">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-md">
            <h2 className="display mt-4 text-5xl md:text-7xl">Pay by email.</h2>
            <p className="mt-5 text-lg text-steel">
              Send stablecoins to any inbox. Receive on a one-time alias that disappears after use.
            </p>

            <ol className="mt-8 space-y-3 md:mt-10">
              {steps.map((s) => {
                const done = reached(s.phase)
                const burned = s.phase === 'burned'
                return (
                  <li key={s.phase} className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className={`size-2.5 rounded-full transition-colors duration-300 ${
                        done ? (burned ? 'bg-coral' : s.phase === 'received' ? 'bg-lime' : 'bg-violet-glow') : 'bg-white/15'
                      }`}
                    />
                    <span className={`label-mono transition-colors duration-300 ${done ? 'text-paper' : 'text-steel/50'}`}>
                      {s.label}
                    </span>
                  </li>
                )
              })}
            </ol>

            <p className="label-mono mt-8 text-steel/60">Your real address never leaves Reeng</p>
          </div>
        </div>
      </div>
    </section>
  )
}
