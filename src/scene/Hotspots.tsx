import { Billboard } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { MathUtils, Vector3, type Group, type MeshBasicMaterial } from 'three'
import { layout } from './layout'
import { anchors, SECURITY, secFeature, scrollState, smoothstep } from './scrollState'

// where each hotspot sits on its part, in the part's local (model) space; front = -Z
const SPOTS: Record<string, Vector3> = {
  Antenna: new Vector3(0.45, 0, -0.95),
  Shell: new Vector3(-0.55, 0.15, -1.08),
  Liner: new Vector3(0.5, -0.2, -0.86),
  SecureChip: new Vector3(0, 0, -0.03),
}

const world = new Vector3()

/**
 * Glowing hotspots pinned to the exploded ring's parts. The one for the active
 * feature grows and lights up; during revoke they all turn coral.
 */
export function Hotspots() {
  const spots = useRef<Record<string, Group | null>>({})
  // dot + halo materials per spot (Billboard nests its children, so keep direct refs)
  const mats = useRef<Record<string, (MeshBasicMaterial | null)[]>>({})
  const setMat = (name: string, i: number) => (m: MeshBasicMaterial | null) => {
    ;(mats.current[name] ??= [])[i] = m
  }

  useFrame((state, dt) => {
    const on = smoothstep(0.6, 1, scrollState.secEnter) * (1 - smoothstep(0, 0.3, scrollState.secExit))
    const f = secFeature(scrollState.sec)
    const feature = f >= 0 ? SECURITY[f] : null
    const revoke = feature?.id === 'revoke'

    for (const [name, g] of Object.entries(spots.current)) {
      const part = anchors.ringParts[name]
      if (!g) continue
      if (!part) {
        g.visible = false
        continue
      }
      world.copy(SPOTS[name])
      part.localToWorld(world)
      g.position.copy(world)
      g.visible = on > 0.01 && f >= 0

      const active = feature?.part === name
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15
      // dots keep their size relative to the ring (smaller ring on narrow screens)
      const fit = layout(state.viewport.width, state.viewport.height).sec.ringScale / 0.55
      const target = (active ? 1.6 * pulse : 1) * on * fit
      g.scale.setScalar(MathUtils.damp(g.scale.x, target, 8, dt))
      for (const mat of mats.current[name] ?? []) mat?.color.set(revoke ? '#FF5A4E' : active ? '#B57BFF' : '#8A8A99')
    }
  })

  return (
    <>
      {Object.keys(SPOTS).map((name) => (
        <Billboard key={name} ref={(g) => void (spots.current[name] = g)}>
          <mesh>
            <circleGeometry args={[0.035, 24]} />
            <meshBasicMaterial ref={setMat(name, 0)} toneMapped={false} depthTest={false} transparent />
          </mesh>
          <mesh>
            <ringGeometry args={[0.055, 0.065, 32]} />
            <meshBasicMaterial ref={setMat(name, 1)} toneMapped={false} depthTest={false} transparent opacity={0.8} />
          </mesh>
        </Billboard>
      ))}
    </>
  )
}
