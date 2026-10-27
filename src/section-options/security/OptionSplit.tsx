import { useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { useSectionProgress } from '../tap-to-pay/shared'
import { ExplodedRing, SECURITY, secFeature } from './shared'

/**
 * C — Split headline (after Legend's "Secure … by design." either side of the product).
 * "Locked" sits top-left and "down." bottom-right at full size, pulling apart as the ring
 * comes apart between them; the active feature swaps in a small card, with five pips.
 */
export function OptionSplit() {
  const section = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [p, setP] = useState(0)
  const active = secFeature(p)

  useSectionProgress(section, (v) => {
    progress.current = v
    setP(v)
  })

  // the two words drift apart while the ring explodes
  const apart = Math.min(1, p / 0.15)
  const f = active >= 0 ? SECURITY[active] : null
  const revoke = f?.id === 'revoke'

  return (
    <section ref={section} className="relative h-[420svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="pointer-events-none absolute inset-0 mx-auto max-w-7xl px-5 pb-24 pt-28 md:px-8 md:pb-8">
          <h2 className="display relative h-full text-[clamp(4rem,13vw,13rem)] leading-[0.85] text-ink">
            <span className="absolute left-0 top-0 block" style={{ transform: `translate(${-apart * 2}vw, ${-apart * 1}vh)` }}>
              Locked
            </span>
            <span className={`absolute bottom-0 right-0 block transition-colors duration-500 ${revoke ? 'text-coral' : ''}`} style={{ transform: `translate(${apart * 2}vw, ${apart * 1}vh)` }}>
              down.
            </span>
          </h2>
        </div>
        <Stage>
          <Rig progress={progress} />
        </Stage>
        {/* active feature card: bottom-left on wide screens, above "down." on phones */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-48 md:px-8 md:pb-10">
          <div className="w-full max-w-sm">
            <p className="label-mono text-ash">Non-custodial · Export your keys anytime</p>
            <div className="mt-3 rounded-2xl bg-white/90 p-5 shadow-lg shadow-ink/5 ring-1 ring-line backdrop-blur">
              <div className="flex gap-1.5">
                {SECURITY.map((x, i) => (
                  <span key={x.id} className={`h-1 flex-1 rounded-full transition-colors ${i <= active ? (x.id === 'revoke' && i === active ? 'bg-coral' : 'bg-violet') : 'bg-mist'}`} />
                ))}
              </div>
              <div key={f?.id ?? 'intro'} className="mt-4" style={{ animation: 'fade-up .35s' }}>
                <p className={`label-mono ${revoke ? 'text-coral' : 'text-violet'}`}>{f ? `${String(active + 1).padStart(2, '0')} · ${f.title}` : 'Five ways it stays yours'}</p>
                <p className="mt-1 text-lg text-ink">{f ? f.body : 'Scroll to take it apart.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Rig({ progress }: { progress: React.RefObject<number> }) {
  const { viewport } = useThree()
  const wide = viewport.aspect > 1
  const at = useRef(new Vector3())
  at.current.set(wide ? viewport.width * 0.2 : 0, wide ? 0 : 0.55, 0)
  return <ExplodedRing progress={progress} at={at} scale={wide ? 0.36 : 0.26} tilt={0.55} />
}
