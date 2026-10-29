import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
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
import { anchors, lift, SPEC, scrollState, smoothstep } from './scrollState'

const RIPPLES = 4
const DROPS = 140
/** How far the flat-water ripples open toward the camera (radians): just enough to read as rings. */
const RIPPLE_OPEN = 0.05
const BUBBLES = 36
const dummy = new Object3D()

// on ink: deep violet water, glowing violet edges; on white: a pale violet tint, brand violet edges
const INK = { surface: '#2A2370', depth: '#120F33', accent: '#B57BFF', drop: '#D9CCFF', surfaceOpacity: 0.55, depthOpacity: 0.55 }
const LIGHT = { surface: '#B9AEF5', depth: '#CFC7FA', accent: '#9730F6', drop: '#B57BFF', surfaceOpacity: 0.35, depthOpacity: 0.45 }

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
 * Everything is in world space around the layout's water point. On the page it follows
 * scrollState.spec; review pages pass `progress`, the surface `place` and their own `ring`.
 * `light` tints it for a white page instead of ink; `bare` leaves out the surface and depth
 * planes for a page that draws its own water. `flat` is for water seen almost side-on (a
 * page-drawn waterline): everything sits in the screen plane so it lines up with the page,
 * ripples are flattened to the thin surface band, and they keep spreading gently while the
 * ring rests below.
 */
export function Water({
  progress,
  place,
  ring: ringRef,
  light,
  bare,
  flat,
}: {
  progress?: RefObject<number>
  place?: RefObject<{ surface: number; waterX: number }>
  ring?: RefObject<Object3D | null>
  light?: boolean
  bare?: boolean
  flat?: boolean
} = {}) {
  const tone = light ? LIGHT : INK
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
    const S = place?.current ?? layout(state.viewport.width, state.viewport.height).spec
    const p = progress ? progress.current : scrollState.spec
    const t = state.clock.elapsedTime
    const water = smoothstep(SPEC.water - 0.02, SPEC.water + 0.06, p) * (progress || scrollState.specEnter > 0.95 ? 1 : 0)
    r.visible = water > 0.01 && (progress ? true : scrollState.specExit < 0.999)
    if (!r.visible) return
    r.position.set(S.waterX, S.surface + (progress ? 0 : lift(scrollState.spec, scrollState.specExit) * state.viewport.height), 0)
    if (surface.current) surface.current.opacity = tone.surfaceOpacity * water
    if (depth.current) depth.current.opacity = tone.depthOpacity * water
    if (line.current) line.current.opacity = 0.6 * water

    // ripples spread from the impact point and fade; flat water keeps a slow, faint swell
    // going from the ring while it rests below (bubbles breaking the surface)
    const since = Math.max(0, (p - SPEC.impact) / 0.2)
    const settled = smoothstep(1.2, 1.8, since)
    // flat water: cancel the camera's angle onto the surface, so the rings always open by the
    // same sliver (RIPPLE_OPEN) and lie dead flat on the thin surface band
    const view = Math.atan2(state.camera.position.y - r.position.y, state.camera.position.z - r.position.z)
    ripples.current.forEach((m, i) => {
      if (!m) return
      if (flat) m.rotation.x = -Math.PI / 2 + RIPPLE_OPEN - view
      const splashW = since - i * 0.18
      const idleW = (t * 0.3 + i / RIPPLES) % 1
      const w = flat && settled > 0 && splashW >= 1 ? idleW : splashW
      const strength = flat && splashW >= 1 ? 0.55 * settled : flat ? 0.85 : 0.7
      m.visible = w > 0 && w < 1
      m.scale.setScalar(0.2 + w * (flat ? 2.6 : 2.4))
      ;(m.material as MeshBasicMaterial).opacity = (1 - w) * strength * water
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
      const ring = ringRef ? ringRef.current : anchors.ring
      const ringY = Math.min(-0.1, (ring?.position.y ?? r.position.y - 0.75) - r.position.y)
      const ringX = (ring?.position.x ?? r.position.x) - r.position.x
      BUBBLE_SEED.forEach(([x, z, speed, phase], i) => {
        const life = (t * speed * 0.5 + phase) % 1
        const y = MathUtils.lerp(ringY, flat ? 0 : -0.02, life)
        dummy.position.set(ringX + x * 0.7 + Math.sin(t * 2 + i) * 0.03, y, flat ? z * 0.08 : 0.2 + z * 0.4)
        // bubbles keep their size relative to the ring (smaller ring on phones)
        const fit = flat && ring ? ring.scale.x / 0.38 : 1
        dummy.scale.setScalar((0.015 + phase * 0.025) * fit * under * (y < (flat ? -0.01 : -0.03) ? 1 : 0))
        dummy.updateMatrix()
        b.setMatrixAt(i, dummy.matrix)
      })
      b.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group ref={root}>
      {/* surface, tilted toward the camera so it reads as a plane of water */}
      <mesh visible={!bare} rotation={[-Math.PI / 2 + 0.22, 0, 0]}>
        <planeGeometry args={[24, 5]} />
        <meshPhysicalMaterial ref={surface} color={tone.surface} roughness={0.08} clearcoat={1} transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* waterline: a faint glowing edge so the surface reads as water, not a floor */}
      <mesh visible={!bare} position={[0, 0, 1.0]}>
        <planeGeometry args={[24, 0.012]} />
        <meshBasicMaterial ref={line} color={tone.accent} transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
      {/* the water below the surface tints the ring once it's under */}
      <mesh visible={!bare} position={[0, -2.5, 0.9]}>
        <planeGeometry args={[24, 5]} />
        <meshBasicMaterial ref={depth} color={tone.depth} transparent opacity={0} depthWrite={false} />
      </mesh>

      {Array.from({ length: RIPPLES }, (_, i) => (
        <mesh key={i} ref={(m) => void (ripples.current[i] = m)} rotation={[-Math.PI / 2 + (flat ? RIPPLE_OPEN : 0.22), 0, 0]} position={[0, 0.005, flat ? 0 : 0.2]}>
          <ringGeometry args={flat ? [0.27, 0.3, 96] : [0.28, 0.3, 64]} />
          <meshBasicMaterial color={tone.accent} transparent opacity={0} toneMapped={false} depthWrite={false} />
        </mesh>
      ))}

      <points ref={splash} geometry={dropGeo} position={[0, 0, flat ? 0 : 0.2]}>
        <pointsMaterial color={tone.drop} size={0.035} sizeAttenuation transparent depthWrite={false} toneMapped={false} />
      </points>

      <instancedMesh ref={bubbles} args={[undefined, undefined, BUBBLES]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshPhysicalMaterial color={tone.drop} roughness={0} transmission={0.6} transparent opacity={0.7} />
      </instancedMesh>
    </group>
  )
}
