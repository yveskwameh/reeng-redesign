import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { MathUtils, Vector3 } from 'three'
import { Stage } from '../../hero-options/stage'
import { useSectionProgress } from '../tap-to-pay/shared'
import { ExplodedRing, SECURITY, secFeature, type PartName, type Spots } from './shared'

/**
 * B — Scan (after Garden's security section: a technical part with a scan line and a
 * numbered list). The ring comes apart on the right; a violet scan line glides down to the
 * part behind each feature as you scroll, while the numbered list on the left opens it.
 */
export function OptionScan() {
  const section = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const spots = useRef<Spots>({})
  const scan = useRef<HTMLDivElement>(null)
  const scanY = useRef(0)
  const [active, setActive] = useState(-1)
  const [sub, setSub] = useState(0)

  useSectionProgress(section, (p) => {
    progress.current = p
    const f = secFeature(p)
    setActive(f)
    const per = (1 - 0.15) / SECURITY.length
    setSub(f < 0 ? 0 : Math.min(1, (p - 0.15 - f * per) / per))
  })

  // the scan line eases toward the active part (the whole ring's middle for revoke)
  const moveScan = (dt: number) => {
    const el = scan.current
    if (!el) return
    const f = SECURITY[Math.max(0, active)]
    const s = f.part ? spots.current[f.part as PartName] : null
    const target = s ? s.y : window.innerHeight * 0.55
    scanY.current = MathUtils.damp(scanY.current || target, target, 6, dt)
    el.style.transform = `translateY(${scanY.current}px)`
    el.style.opacity = active >= 0 ? '1' : '0'
  }

  const revoke = SECURITY[active]?.id === 'revoke'

  return (
    <section ref={section} className="relative h-[420svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <Stage>
          <Rig progress={progress} spots={spots} onFrame={moveScan} />
        </Stage>
        {/* the scan line, across the ring's half of the screen */}
        <div ref={scan} className="pointer-events-none absolute left-0 right-0 top-0 transition-opacity duration-500 md:left-1/2">
          <div className={`h-px ${revoke ? 'bg-coral' : 'bg-violet'} shadow-[0_0_12px_2px] ${revoke ? 'shadow-coral/40' : 'shadow-violet/40'}`} />
          <p className={`label-mono absolute right-5 top-2 md:right-8 ${revoke ? 'text-coral' : 'text-violet'}`}>
            {active >= 0 ? `Scan · ${SECURITY[active].title}` : ''}
          </p>
        </div>
        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-7xl flex-col px-5 pb-10 pt-24 md:justify-center md:px-8 md:pt-0">
          <div className="md:max-w-md">
            <h2 className="display text-5xl text-ink md:text-7xl">Locked down.</h2>
            <p className="label-mono mt-4 text-ash">Non-custodial · Export your keys anytime</p>
            {/* phones: only the active feature, at the bottom, so the ring keeps the middle */}
            <ol className="mt-8 space-y-1 max-md:absolute max-md:inset-x-5 max-md:bottom-20 md:mt-10">
              {SECURITY.map((f, i) => {
                const on = i === active
                return (
                  <li key={f.id} className={`relative border-l-2 border-line py-2.5 pl-5 ${on ? '' : 'max-md:hidden'}`}>
                    {/* the rule fills as you scroll through the feature */}
                    <span
                      className={`absolute -left-0.5 top-0 w-0.5 ${f.id === 'revoke' ? 'bg-coral' : 'bg-violet'}`}
                      style={{ height: `${i < active ? 100 : on ? sub * 100 : 0}%` }}
                    />
                    <p className={`label-mono transition-colors ${on ? (f.id === 'revoke' ? 'text-coral' : 'text-violet') : 'text-ash'}`}>
                      {String(i + 1).padStart(2, '0')} · {f.title}
                    </p>
                    <div className={`grid transition-all duration-300 ${on ? 'mt-1 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <p className="overflow-hidden text-lg text-ink">{f.body}</p>
                    </div>
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

function Rig({ progress, spots, onFrame }: { progress: React.RefObject<number>; spots: React.RefObject<Spots>; onFrame: (dt: number) => void }) {
  const { viewport } = useThree()
  const wide = viewport.aspect > 1
  const at = useRef(new Vector3(wide ? viewport.width * 0.2 : 0, wide ? -0.1 : 0.05, 0))
  at.current.set(wide ? viewport.width * 0.2 : 0, wide ? -0.1 : 0.05, 0)
  useFrame((_, dt) => onFrame(dt))
  return <ExplodedRing progress={progress} at={at} spots={spots} scale={wide ? 0.45 : 0.32} tilt={0.4} />
}
