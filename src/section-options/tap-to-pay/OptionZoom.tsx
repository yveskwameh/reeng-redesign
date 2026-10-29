import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState, type ReactNode, type RefObject } from 'react'
import { Euler, MathUtils, Quaternion, Vector3, type Group } from 'three'
import { Stage } from '../../hero-options/stage'
import { PaidReceipt, TAP_BEATS, tapFx, TapScene, useSectionProgress, type TapFx } from './shared'

const TERMINAL: [number, number, number] = [0, -0.3, 0]
const TILT = new Quaternion().setFromEuler(new Euler(-0.85, -0.25, 0))
const screenPos = new Vector3()
const screenNormal = new Vector3()
const camTarget = new Vector3()
const look = new Vector3()

/**
 * D — Zoom (after Square's oversized "Tap and go."). It opens on a giant "Tap. Paid."; as you
 * scroll the headline lifts away and the camera pushes in on the terminal until its screen
 * fills the view as the ring taps and it flips to PAID, then eases back out with the receipt.
 */
export function OptionZoom() {
  const section = useRef<HTMLElement>(null)
  const head = useRef<HTMLDivElement>(null)
  const fx = useRef<TapFx>({ dip: 0, paid: 0 })
  const zoom = useRef(0)
  const rise = useRef(0)
  const [paid, setPaid] = useState(false)

  useSectionProgress(section, (p) => {
    // 0–0.25 headline; 0.25–0.75 push in while the ring taps; 0.75–1 ease back out
    const tap = MathUtils.clamp((p - 0.25) / 0.5, 0, 1)
    fx.current = tapFx(tap)
    zoom.current = MathUtils.smoothstep(p, 0.12, 0.45) * (1 - MathUtils.smoothstep(p, 0.78, 0.95) * 0.6)
    setPaid(tap >= TAP_BEATS.paid)
    rise.current = MathUtils.smoothstep(p, 0.08, 0.3) // terminal comes up as the headline lifts away
    if (head.current) {
      const h = MathUtils.smoothstep(p, 0.05, 0.3)
      head.current.style.transform = `translateY(${-h * 35}vh) scale(${1 - h * 0.55})`
      head.current.style.opacity = `${1 - MathUtils.smoothstep(p, 0.2, 0.32)}`
    }
  })

  return (
    <section ref={section} className="relative h-[350svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <Stage>
          <ZoomCamera zoom={zoom} />
          <Rise rise={rise}>
            <TapScene fx={fx} position={TERMINAL} scale={0.85} />
          </Rise>
        </Stage>
        <div ref={head} className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center will-change-transform">
          <h2 className="display text-[22vw] leading-[0.85] text-ink md:text-[15vw]">
            Tap.
            <br />
            Paid.
          </h2>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto flex max-w-7xl flex-col gap-4 px-5 pb-8 md:flex-row md:items-end md:justify-between md:px-8">
          <p className="max-w-sm text-lg text-ash">Works at any contactless card terminal. No phone, no card.</p>
          <PaidReceipt show={paid} />
        </div>
      </div>
    </section>
  )
}

/** Pushes the camera in toward the terminal screen as `zoom` goes 0 → 1. */
function ZoomCamera({ zoom }: { zoom: RefObject<number> }) {
  const { camera } = useThree()
  useFrame(() => {
    const z = zoom.current
    // screen centre and facing direction in world space (screen sits at local y 0.38 on the tilted body)
    screenPos.set(0, 0.38 * 0.85, 0.09).applyQuaternion(TILT).add(new Vector3(...TERMINAL))
    screenNormal.set(0, 0, 1).applyQuaternion(TILT)
    camTarget.copy(screenPos).addScaledVector(screenNormal, 2.4)
    camera.position.set(0, 0, 7).lerp(camTarget, z)
    look.set(0, 0, 0).lerp(screenPos, z)
    camera.lookAt(look)
  })
  return null
}

/** Slides its children up from below the frame as `rise` goes 0 → 1. */
function Rise({ rise, children }: { rise: RefObject<number>; children: ReactNode }) {
  const ref = useRef<Group>(null)
  useFrame(() => {
    if (ref.current) ref.current.position.y = -(1 - MathUtils.smootherstep(rise.current, 0, 1)) * 4
  })
  return <group ref={ref}>{children}</group>
}
