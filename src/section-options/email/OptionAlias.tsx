import { useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { smoothstep } from '../../scene/scrollState'
import { useSectionProgress } from '../tap-to-pay/shared'
import { ALIAS, MAIL, mailPhase, MailRig, reached, STEPS, type MailPlace } from './shared'

const NEXT = 'm3p8v1@reeng.xyz'

/**
 * A — Alias field (after Apple's Hide My Email pill and Mailchimp's typed address). A big
 * address field types the one-time alias as the envelope arrives; when the coins have
 * landed it burns (struck through, coral), and a fresh alias types itself in for next time.
 */
export function OptionAlias() {
  const section = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [p, setP] = useState(0)
  useSectionProgress(section, (v) => {
    progress.current = v
    setP(v)
  })
  const phase = mailPhase(p)
  const burned = reached(phase, 'burned')
  // type the alias in while the envelope arrives, and the next one once it has burned
  const typed = ALIAS.slice(0, Math.round(smoothstep(0, MAIL.arrive[1], p) * ALIAS.length))
  const next = NEXT.slice(0, Math.round(smoothstep(MAIL.burn[1], 1, p) * NEXT.length))

  return (
    <section ref={section} className="relative h-[300svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <Stage>
          <Rig progress={progress} />
        </Stage>
        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-7xl flex-col px-5 pt-24 md:justify-center md:px-8 md:pt-0">
          <div className="md:max-w-lg">
            <h2 className="display text-5xl text-ink md:text-7xl">Pay by email.</h2>
            <p className="mt-4 max-w-md text-lg text-ash">Send stablecoins to any inbox. Receive on a one-time alias that disappears after use.</p>

            {/* the address field */}
            <div className="mt-8 flex items-center gap-3 rounded-full bg-white py-3 pl-5 pr-3 shadow-lg shadow-ink/5 ring-1 ring-line md:mt-10 md:py-4">
              <span className="label-mono shrink-0 text-ash">To</span>
              <span className="relative min-w-0 flex-1 truncate font-display text-lg text-ink md:text-2xl">
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
            <p className="label-mono mt-3 text-ash">{next ? 'New alias for next time' : burned ? 'Alias burned · it can never be used again' : 'One-time alias · your real address stays hidden'}</p>

            <ol className="mt-8 flex flex-wrap gap-2">
              {STEPS.map((s) => {
                const on = reached(phase, s.phase)
                return (
                  <li
                    key={s.phase}
                    className={`label-mono rounded-full px-3 py-1.5 transition ${on ? (s.phase === 'burned' ? 'bg-coral text-white' : 'bg-ink text-white') : 'bg-mist text-ash'}`}
                  >
                    {s.label}
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

const Caret = () => <span className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-[0.15em] animate-pulse bg-violet" />

function Rig({ progress }: { progress: React.RefObject<number> }) {
  const { viewport } = useThree()
  const wide = viewport.aspect > 1
  const vw = viewport.width
  const place = useRef<MailPlace>({ envelope: new Vector3(), envScale: 1, ring: new Vector3() })
  place.current.envelope.set(wide ? vw * 0.12 : -0.3, wide ? -0.2 : -1.6, 0)
  place.current.envScale = wide ? 0.95 : 0.55
  place.current.ring.set(wide ? vw * 0.12 + 1.4 : 0.62, wide ? 0.4 : -1.45, 0)
  return <MailRig progress={progress} place={place} ringScale={wide ? 0.3 : 0.16} />
}
