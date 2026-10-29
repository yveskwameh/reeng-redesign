import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import { Euler, MathUtils, Quaternion, Vector3, type Group } from 'three'
import { product } from '../../content/product'
import { innerDiameter } from '../../content/sizing'
import { Ring } from '../../scene/Ring'
import { SPEC, specAct, smoothstep } from '../../scene/scrollState'
import { SpecCallouts } from '../../scene/SpecCallouts'
import { Water } from '../../scene/Water'

export { SPEC, specAct }
const { specs } = product

/** The precision facts, each tagged with the view that shows it on the ring. */
export const PRECISION = [
  { id: 'dia', value: `${innerDiameter(9).toFixed(1)} mm`, label: 'Inner Ø · US 9', view: 'front' },
  { id: 'thick', value: `${specs.thicknessMm} mm`, label: 'Thin', view: 'front' },
  { id: 'width', value: `${specs.widthMm} mm`, label: 'Wide', view: 'side' },
  { id: 'weight', value: `${specs.weightG} g`, label: 'Light', view: 'side' },
  { id: 'shell', value: 'Zirconia', label: 'Ceramic shell', view: 'side' },
] as const
export const WATER = [
  { id: 'ip', value: 'IP68', label: 'Swim-safe' },
  { id: 'charge', value: '0', label: 'Times to charge' },
  { id: 'warranty', value: `${specs.warrantyYears} yr`, label: 'Warranty' },
] as const

/** Which view the ring is in at progress `p`. */
export const specView = (p: number): 'front' | 'side' | 'water' =>
  specAct(p) === 'water' ? 'water' : p >= (SPEC.front[1] + SPEC.side[0]) / 2 ? 'side' : 'front'

export type SpecPlace = { ring: Vector3; ringScale: number; surface: number; dropScale: number; waterX: number; lift: number; sink: number; leader: boolean }

const FACE = new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0))
const SIDE = new Quaternion().setFromEuler(new Euler(0, 0.18, Math.PI / 2))
const rot = new Quaternion()
const tumble = new Quaternion()
const e = new Euler()
const pos = new Vector3()
const drop = new Vector3()

/**
 * The ring for the specs section, as on the page: face-on with diameter and thickness
 * callouts, turned to profile for the width, then dropped through a water surface.
 */
export function SpecRig({ progress, place, light = true, bare, flat }: { progress: RefObject<number>; place: RefObject<SpecPlace>; light?: boolean; bare?: boolean; flat?: boolean }) {
  const ring = useRef<Group>(null)
  useFrame((state, dt) => {
    const g = ring.current
    if (!g) return
    const S = place.current
    const p = progress.current
    const t = state.clock.elapsedTime
    const side = smoothstep(SPEC.front[1], SPEC.side[0], p)
    const water = smoothstep(SPEC.water - 0.04, SPEC.drop[0], p)
    const d = smoothstep(SPEC.drop[0], SPEC.drop[1], p)
    // held still for measuring; tumbling gently once it's in the water
    rot.copy(FACE).slerp(SIDE, side)
    tumble.setFromEuler(e.set(t * 0.4, t * 0.6, 0.3))
    rot.slerp(tumble, water * 0.85)
    pos.copy(S.ring)
    if (water > 0) {
      drop.set(S.waterX, S.surface + S.lift - d * (S.lift + S.sink) + Math.sin(t * 1.3) * 0.04 * d, flat ? 0 : 0.2)
      pos.lerp(drop, water)
    }
    g.position.lerp(pos, 1 - Math.exp(-dt * 10))
    g.quaternion.slerp(rot, 1 - Math.exp(-dt * 10))
    g.scale.setScalar(MathUtils.damp(g.scale.x || S.ringScale, MathUtils.lerp(S.ringScale, S.dropScale, water), 10, dt))
  })
  return (
    <>
      <group ref={ring}>
        <Ring />
      </group>
      <SpecCallouts progress={progress} ring={ring} leader={place.current.leader} />
      <Water progress={progress} place={place} ring={ring} light={light} bare={bare} flat={flat} />
    </>
  )
}
