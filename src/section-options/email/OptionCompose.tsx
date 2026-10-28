import { useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { useSectionProgress } from '../tap-to-pay/shared'
import { ALIAS, MAIL, mailPhase, MailRig, reached, STEPS, type MailPlace } from './shared'

/**
 * D — Sender and you (after PayPal's "You sent $30 to Grace" phone cards). Two sides:
 * on the left, whoever pays you writes an ordinary email to your alias and hits send; on
 * the right, your ring catches the coins. The envelope crosses between them, then the
 * alias burns on the sender's card.
 */
export function OptionCompose() {
  const section = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [p, setP] = useState(0)
  useSectionProgress(section, (v) => {
    progress.current = v
    setP(v)
  })
  const phase = mailPhase(p)
  const sent = p > 0.06
  const burned = reached(phase, 'burned')
  const step = [...STEPS].reverse().find((s) => reached(phase, s.phase))

  return (
    <section ref={section} className="relative h-[300svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <Stage>
          <Rig progress={progress} />
        </Stage>
        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-7xl flex-col px-5 pt-24 md:px-8 md:pt-28">
          <h2 className="display text-5xl text-ink md:text-7xl">Pay by email.</h2>
          <p className="mt-4 max-w-md text-lg text-ash">Send stablecoins to any inbox. Receive on a one-time alias that disappears after use.</p>

          <div className="mt-8 grid flex-1 grid-cols-2 gap-4 pb-24 md:mt-10 md:pb-10">
            {/* sender */}
            <div>
              <p className="label-mono text-ash">Anyone · any inbox</p>
              <div className="mt-3 w-full max-w-xs rounded-3xl bg-white p-4 shadow-xl shadow-ink/10 ring-1 ring-line">
                <Field k="To" v={<span className={burned ? 'text-coral line-through' : ''}>{ALIAS}</span>} />
                <Field k="Amount" v={`${MAIL.amount.toFixed(2)} USDC`} />
                <div className={`mt-3 rounded-full py-2 text-center text-sm font-medium transition ${sent ? 'bg-mist text-ash' : 'bg-violet text-white'}`}>{sent ? 'Sent ✓' : 'Send'}</div>
              </div>
            </div>
            {/* you */}
            <div className="flex flex-col items-end text-right">
              <p className="label-mono text-ash">You · your Reeng</p>
              <p className="label-mono mt-auto text-ink" key={step?.phase} style={{ animation: 'fade-up .35s' }}>
                {step ? step.label : 'Waiting…'}
              </p>
              <p className="label-mono mt-2 text-ash">Your real address never leaves Reeng</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const Field = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="flex flex-col gap-0.5 border-b border-line py-2 text-sm md:flex-row md:items-baseline md:justify-between md:gap-3">
    <span className="label-mono text-ash">{k}</span>
    <span className="truncate font-medium text-ink">{v}</span>
  </div>
)

function Rig({ progress }: { progress: React.RefObject<number> }) {
  const { viewport } = useThree()
  const wide = viewport.aspect > 1
  const vw = viewport.width
  const place = useRef<MailPlace>({ envelope: new Vector3(), envScale: 1, ring: new Vector3() })
  // the envelope sits in the gap between the two sides; the ring on the right
  place.current.envelope.set(wide ? 0 : -0.5, wide ? -0.45 : -1.3, 0)
  place.current.envScale = wide ? 0.8 : 0.5
  place.current.ring.set(wide ? vw * 0.3 : 0.5, wide ? -0.1 : -0.55, 0)
  return <MailRig progress={progress} place={place} ringScale={wide ? 0.32 : 0.17} />
}
