import { useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { smoothstep } from '../../scene/scrollState'
import { useSectionProgress } from '../tap-to-pay/shared'
import { MAIL, mailPhase, MailRig, reached, STEPS, type MailPlace } from './shared'

/**
 * C — Centre stage (after Apple's big centred privacy statements). The headline sits large
 * and centred over the envelope; along the bottom, a timeline line fills through the three
 * steps as the envelope opens, pays the ring and burns its alias.
 */
export function OptionTimeline() {
  const section = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [p, setP] = useState(0)
  useSectionProgress(section, (v) => {
    progress.current = v
    setP(v)
  })
  const phase = mailPhase(p)
  // the line reaches each dot as its step happens
  const fill = smoothstep(0, MAIL.coins[1], p) * 0.5 + smoothstep(MAIL.coins[1], MAIL.burn[0] + 0.05, p) * 0.5

  return (
    <section ref={section} className="relative h-[300svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <Stage>
          <Rig progress={progress} />
        </Stage>
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto max-w-4xl px-5 pt-24 text-center md:pt-28">
          <h2 className="display text-5xl text-ink md:text-8xl">Pay by email.</h2>
          <p className="mx-auto mt-4 max-w-md text-lg text-ash">Send stablecoins to any inbox. Receive on a one-time alias that disappears after use.</p>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto max-w-3xl px-16 pb-24 md:px-8 md:pb-12">
          <div className="relative h-0.5 rounded-full bg-mist">
            <div className={`absolute inset-y-0 left-0 rounded-full ${reached(phase, 'burned') ? 'bg-coral' : 'bg-violet'}`} style={{ width: `${fill * 100}%` }} />
          </div>
          <ol className="relative -mt-[7px] flex justify-between">
            {STEPS.map((s) => {
              const on = reached(phase, s.phase) && p > 0.02
              return (
                <li key={s.phase} className="flex w-0 flex-col items-center">
                  <span className={`size-3 rounded-full ring-4 ring-white transition-colors ${on ? (s.phase === 'burned' ? 'bg-coral' : 'bg-violet') : 'bg-line'}`} />
                  <span className={`label-mono mt-3 w-28 text-center transition-colors md:w-44 ${on ? 'text-ink' : 'text-ash/60'}`}>{s.label}</span>
                </li>
              )
            })}
          </ol>
          <p className="label-mono mt-6 text-center text-ash">Your real address never leaves Reeng</p>
        </div>
      </div>
    </section>
  )
}

function Rig({ progress }: { progress: React.RefObject<number> }) {
  const { viewport } = useThree()
  const wide = viewport.aspect > 1
  const place = useRef<MailPlace>({ envelope: new Vector3(), envScale: 1, ring: new Vector3() })
  place.current.envelope.set(wide ? -0.55 : -0.3, wide ? -0.25 : -0.2, 0)
  place.current.envScale = wide ? 0.85 : 0.6
  place.current.ring.set(wide ? 1.05 : 0.6, wide ? -0.05 : -0.1, 0)
  return <MailRig progress={progress} place={place} ringScale={wide ? 0.26 : 0.17} />
}
