import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import { Color, Euler, MathUtils, Mesh, Quaternion, Vector3, type Group, type MeshStandardMaterial, type Object3D } from 'three'
import { Ring } from '../../scene/Ring'
import { SEC, SECURITY, secFeature, smoothstep } from '../../scene/scrollState'

export { SECURITY, secFeature }
export type Feature = (typeof SECURITY)[number]
export type PartName = 'Shell' | 'Liner' | 'Antenna' | 'SecureChip'
/** Screen px of each part's hotspot, relative to the canvas; filled every frame. */
export type Spots = Partial<Record<PartName | 'Center', { x: number; y: number }>>

const GLOW = new Color('#9730F6')
const CORAL = new Color('#FF5A4E')
const COPPER = new Color('#F28C55')

// how far each part travels when exploded (same as the home page's RingFx), model units
const OFFSETS: Record<string, [number, number, number]> = {
  Shell: [0, 1.25, 0],
  Liner: [0, -1.25, 0],
  Antenna: [0, 0, 0],
  SecureChip: [0, 0, -0.75],
}
// where each hotspot sits on its part, in model space (same as Hotspots); front = -Z
const SPOT: Record<PartName, Vector3> = {
  Antenna: new Vector3(0.45, 0, -0.95),
  Shell: new Vector3(-0.55, 0.15, -1.08),
  Liner: new Vector3(0.5, -0.2, -0.86),
  SecureChip: new Vector3(0, 0, -0.03),
}

const rot = new Quaternion()
const e = new Euler()
const v = new Vector3()

/**
 * The ring coming apart for the security features: parts separate along its axis over the
 * first stretch of `progress`, then the part behind the active feature glows violet (the
 * whole ring coral for revoke). Optionally reports each part's hotspot in screen px.
 */
export function ExplodedRing({
  progress,
  at,
  scale = 0.6,
  tilt = 0.45,
  spots,
}: {
  progress: RefObject<number>
  at: RefObject<Vector3>
  scale?: number
  /** how far the axis leans toward us (0 = side-on stack) */
  tilt?: number
  spots?: RefObject<Spots>
}) {
  const g = useRef<Group>(null)
  const rest = useRef(new Map<Object3D, Vector3>())

  useFrame((state, dt) => {
    const grp = g.current
    if (!grp) return
    const p = progress.current
    const t = state.clock.elapsedTime
    grp.position.lerp(at.current, 1 - Math.exp(-dt * 8))
    grp.scale.setScalar(MathUtils.damp(grp.scale.x || scale, scale, 8, dt))
    rot.setFromEuler(e.set(tilt, Math.PI + Math.sin(t * 0.5) * 0.2, 0))
    grp.quaternion.slerp(rot, 1 - Math.exp(-dt * 6))

    const explode = smoothstep(0.02, SEC.explode, p)
    const f = secFeature(p)
    const feature = f >= 0 ? SECURITY[f] : null
    const revoke = feature?.id === 'revoke'
    const root = grp.getObjectByName('ReengRing')
    if (!root) return
    for (const part of root.children) {
      let r = rest.current.get(part)
      if (!r) rest.current.set(part, (r = part.position.clone()))
      const o = OFFSETS[part.name]
      if (o) part.position.set(r.x + o[0] * explode, r.y + o[1] * explode, r.z + o[2] * explode)
      const lit = revoke || feature?.part === part.name
      // the copper antenna is lost against the dark band, so it keeps a faint warm glow while apart
      const base = part.name === 'Antenna' ? 0.35 * explode : 0
      part.traverse((m) => {
        if (!(m instanceof Mesh)) return
        const mat = m.material as MeshStandardMaterial
        mat.emissive.copy(lit ? (revoke ? CORAL : GLOW) : COPPER)
        mat.emissiveIntensity = MathUtils.damp(mat.emissiveIntensity, lit ? (revoke ? 0.25 : 0.55) : base, 8, dt)
      })
      const name = part.name as PartName
      if (spots && SPOT[name]) {
        v.copy(SPOT[name])
        part.localToWorld(v)
        v.project(state.camera)
        spots.current[name] = { x: ((v.x + 1) / 2) * state.size.width, y: ((1 - v.y) / 2) * state.size.height }
      }
    }
    if (spots) {
      v.setFromMatrixPosition(grp.matrixWorld).project(state.camera)
      spots.current.Center = { x: ((v.x + 1) / 2) * state.size.width, y: ((1 - v.y) / 2) * state.size.height }
    }
  })

  return (
    <group ref={g} scale={scale}>
      <Ring exposeParts />
    </group>
  )
}
