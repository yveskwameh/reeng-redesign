import { useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { useSectionProgress } from '../tap-to-pay/shared'
import { ALIAS, MAIL, mailPhase, MailRig, reached, type MailPhase, type MailPlace } from './shared'

// chips that float in around the envelope as the story reaches them (after Proton's
// floating "Tracker blocked" / "Zero-access encryption" chips round the inbox)
const CHIPS: { at: MailPhase; text: string; tone: 'ink' | 'violet' | 'coral'; pos: string }[] = [
  // phones: stacked down the left/right under the envelope; wide: around it
  { at: 'incoming', text: `To ${ALIAS}`, tone: 'ink', pos: 'left-5 top-[59%] md:left-[36%] md:top-[30%]' },
  { at: 'opened', text: 'Your real address stays hidden', tone: 'violet', pos: 'right-5 top-[65.5%] md:right-auto md:left-[44%] md:top-auto md:bottom-[20%]' },
  { at: 'received', text: `+${MAIL.amount.toFixed(2)} USDC on your ring`, tone: 'ink', pos: 'left-5 top-[72%] md:left-auto md:right-[5%] md:top-[26%]' },
  { at: 'burned', text: 'Alias burned', tone: 'coral', pos: 'right-5 top-[78.5%] md:top-auto md:right-[12%] md:bottom-[26%]' },
]

/**
 * B — Floating chips (after Proton's inbox with privacy chips floating around it). The
 * envelope and ring take the middle of the stage; each step of the story pops in as a
 * chip around them, so the copy is the illustration.
 */
export function OptionChips() {
  const section = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [p, setP] = useState(0)
  useSectionProgress(section, (v) => {
    progress.current = v
    setP(v)
  })
  const phase = mailPhase(p)

  return (
    <section ref={section} className="relative h-[300svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <Stage>
          <Rig progress={progress} />
        </Stage>
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto max-w-7xl px-5 pt-24 md:px-8 md:pt-28">
          <h2 className="display text-5xl text-ink md:text-7xl">Pay by email.</h2>
          <p className="mt-4 max-w-sm text-lg text-ash">Send stablecoins to any inbox. Receive on a one-time alias that disappears after use.</p>
        </div>
        {CHIPS.map((c) => {
          const on = reached(phase, c.at) && p > 0.02
          const tone = c.tone === 'coral' ? 'bg-coral text-white' : c.tone === 'violet' ? 'bg-violet text-white' : 'bg-white text-ink ring-1 ring-line'
          return (
            <span
              key={c.text}
              className={`label-mono pointer-events-none absolute rounded-full px-4 py-2 shadow-lg shadow-ink/10 transition duration-500 ${tone} ${c.pos} ${
                on ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-95 opacity-0'
              }`}
            >
              {c.text}
            </span>
          )
        })}
      </div>
    </section>
  )
}

function Rig({ progress }: { progress: React.RefObject<number> }) {
  const { viewport } = useThree()
  const wide = viewport.aspect > 1
  const vw = viewport.width
  const place = useRef<MailPlace>({ envelope: new Vector3(), envScale: 1, ring: new Vector3() })
  place.current.envelope.set(wide ? vw * 0.06 : -0.25, wide ? -0.35 : -0.25, 0)
  place.current.envScale = wide ? 1.05 : 0.6
  place.current.ring.set(wide ? vw * 0.06 + 1.7 : 0.65, wide ? 0.25 : -0.15, 0)
  return <MailRig progress={progress} place={place} ringScale={wide ? 0.32 : 0.17} />
}
