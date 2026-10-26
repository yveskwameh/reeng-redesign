import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  MathUtils,
  Object3D,
  type Group,
  type InstancedMesh,
  type Mesh,
  type MeshBasicMaterial,
  type MeshPhysicalMaterial,
  type Points,
  type PointsMaterial,
} from 'three'
import { layout } from './layout'
import { anchors, SPEC, scrollState, smoothstep } from './scrollState'

const RIPPLES = 4
const DROPS = 140
const BUBBLES = 36
const dummy = new Object3D()

// splash droplets: random launch velocities, generated once and reused
const DROP_VEL = new Float32Array(DROPS * 3)
for (let i = 0; i < DROPS; i++) {
  const a = Math.random() * Math.PI * 2
  const r = 0.3 + Math.random() * 0.9
  DROP_VEL.set([Math.cos(a) * r, 1.4 + Math.random() * 1.8, Math.sin(a) * r * 0.6], i * 3)
}
// bubbles: x/z offset, rise speed, phase
const BUBBLE_SEED = Array.from({ length: BUBBLES }, () => [Math.random() - 0.5, Math.random() - 0.5, 0.3 + Math.random() * 0.6, Math.random()])

/**
 * The water-resistance moment: a surface the ring drops through, with ripples and a
 * splash at impact, and bubbles rising off the ring once it's under.
 * Everything is in world space around the layout's water point.
 */
export function Water() {
  const root = useRef<Group>(null)
  const surface = useRef<MeshPhysicalMaterial>(null)
  const depth = useRef<MeshBasicMaterial>(null)
  const line = useRef<MeshBasicMaterial>(null)
  const ripples = useRef<(Mesh | null)[]>([])
  const splash = useRef<Points>(null)
  const bubbles = useRef<InstancedMesh>(null)
  const dropGeo = useMemo(() => {
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(new Float32Array(DROPS * 3), 3))
    return geo
  }, [])

  useFrame((state) => {
    const r = root.current
    if (!r) return
    const S = layout(state.viewport.width, state.viewport.height).spec
    const p = scrollState.spec
    const t = state.clock.elapsedTime
    const water = smoothstep(SPEC.water - 0.02, SPEC.water + 0.06, p) * (scrollState.specEnter > 0.95 ? 1 : 0)
    r.visible = water > 0.01 && scrollState.specExit < 0.999
    if (!r.visible) return
    r.position.set(S.waterX, S.surface + scrollState.specExit * state.viewport.height, 0)
    if (surface.current) surface.current.opacity = 0.55 * water
    if (depth.current) depth.current.opacity = 0.55 * water
    if (line.current) line.current.opacity = 0.6 * water

    // ripples spread from the impact point and fade
    const since = Math.max(0, (p - SPEC.impact) / 0.2)
    ripples.current.forEach((m, i) => {
      if (!m) return
      const w = since - i * 0.18
      m.visible = w > 0 && w < 1
      m.scale.setScalar(0.2 + w * 2.4)
      ;(m.material as MeshBasicMaterial).opacity = (1 - w) * 0.7 * water
    })

    // splash: ballistic droplets for a short window after impact
    const sp = splash.current
    if (sp) {
      const k = MathUtils.clamp((p - SPEC.impact) / 0.08, 0, 1)
      sp.visible = k > 0 && k < 1
      const pos = dropGeo.getAttribute('position') as BufferAttribute
      const arr = pos.array as Float32Array
      for (let i = 0; i < DROPS; i++) {
        const v = DROP_VEL
        arr[i * 3] = v[i * 3] * k * 0.6
        arr[i * 3 + 1] = Math.max(-0.05, v[i * 3 + 1] * k * 0.6 - 2.6 * k * k)
        arr[i * 3 + 2] = v[i * 3 + 2] * k * 0.6
      }
      pos.needsUpdate = true
      ;(sp.material as PointsMaterial).opacity = 1 - k
    }

    // bubbles rise from the ring (below the surface) and pop at the surface
    const b = bubbles.current
    if (b) {
      const under = smoothstep(SPEC.impact, SPEC.drop[1], p)
      b.visible = under > 0.01
      // start at the ring's actual depth below the surface
      const ringY = Math.min(-0.1, (anchors.ring?.position.y ?? r.position.y - 0.75) - r.position.y)
      const ringX = (anchors.ring?.position.x ?? r.position.x) - r.position.x
      BUBBLE_SEED.forEach(([x, z, speed, phase], i) => {
        const life = (t * speed * 0.5 + phase) % 1
        const y = MathUtils.lerp(ringY, -0.02, life)
        dummy.position.set(ringX + x * 0.7 + Math.sin(t * 2 + i) * 0.03, y, 0.2 + z * 0.4)
        dummy.scale.setScalar((0.015 + phase * 0.025) * under * (y < -0.03 ? 1 : 0))
        dummy.updateMatrix()
        b.setMatrixAt(i, dummy.matrix)
      })
      b.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group ref={root}>
      {/* surface, tilted toward the camera so it reads as a plane of water */}
      <mesh rotation={[-Math.PI / 2 + 0.22, 0, 0]}>
        <planeGeometry args={[9, 5]} />
        <meshPhysicalMaterial ref={surface} color="#2A2370" roughness={0.08} clearcoat={1} transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* waterline: a faint glowing edge so the surface reads as water, not a floor */}
      <mesh position={[0, 0, 1.0]}>
        <planeGeometry args={[9, 0.012]} />
        <meshBasicMaterial ref={line} color="#B57BFF" transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
      {/* the water below the surface tints the ring once it's under */}
      <mesh position={[0, -2.5, 0.9]}>
        <planeGeometry args={[9, 5]} />
        <meshBasicMaterial ref={depth} color="#120F33" transparent opacity={0} depthWrite={false} />
      </mesh>

      {Array.from({ length: RIPPLES }, (_, i) => (
        <mesh key={i} ref={(m) => void (ripples.current[i] = m)} rotation={[-Math.PI / 2 + 0.22, 0, 0]} position={[0, 0.005, 0.2]}>
          <ringGeometry args={[0.28, 0.3, 64]} />
          <meshBasicMaterial color="#B57BFF" transparent opacity={0} toneMapped={false} depthWrite={false} />
        </mesh>
      ))}

      <points ref={splash} geometry={dropGeo} position={[0, 0, 0.2]}>
        <pointsMaterial color="#D9CCFF" size={0.035} sizeAttenuation transparent depthWrite={false} toneMapped={false} />
      </points>

      <instancedMesh ref={bubbles} args={[undefined, undefined, BUBBLES]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshPhysicalMaterial color="#D9CCFF" roughness={0} transmission={0.6} transparent opacity={0.7} />
      </instancedMesh>
    </group>
  )
}
