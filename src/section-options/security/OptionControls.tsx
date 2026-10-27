import { useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { useSectionProgress } from '../tap-to-pay/shared'
import { SecurityControls } from '../../components/SecurityControls'
import { ExplodedRing, SECURITY, secFeature } from './shared'

/**
 * D — App controls (after Gemini's and Slash's security sections, which show the real
 * settings). Each feature is a row in the Reeng app's security screen; as you scroll to it,
 * its control sets itself — PIN switches on, the limit slides up, hours pick, revoke fires,
 * the chip seals — while the matching part of the ring lights up beside it.
 */
export function OptionControls() {
  const section = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [p, setP] = useState(0)
  const active = secFeature(p)

  useSectionProgress(section, (v) => {
    progress.current = v
    setP(v)
  })

  return (
    <section ref={section} className="relative h-[420svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <Stage>
          <Rig progress={progress} />
        </Stage>
        <div className="pointer-events-none absolute inset-0 mx-auto grid max-w-7xl content-start gap-6 px-5 pt-24 md:grid-cols-2 md:content-center md:px-8 md:pt-0">
          <div>
            <h2 className="display text-5xl text-ink md:text-7xl">Locked down.</h2>
            <p className="label-mono mt-4 text-ash">Non-custodial · Export your keys anytime</p>

            <SecurityControls p={p} className="mt-6 max-md:absolute max-md:inset-x-5 max-md:bottom-20 max-md:w-auto md:mt-10">
              {/* the active feature's line, under the screen */}
              <p key={active} className="min-h-12 px-3 pb-2 pt-3 text-sm text-ash" style={{ animation: 'fade-up .35s' }}>
                {active >= 0 ? SECURITY[active].body : 'Scroll to set it up.'}
              </p>
            </SecurityControls>
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
  at.current.set(wide ? viewport.width * 0.22 : 0, wide ? -0.05 : 0.1, 0)
  return <ExplodedRing progress={progress} at={at} scale={wide ? 0.45 : 0.28} tilt={0.5} />
}
