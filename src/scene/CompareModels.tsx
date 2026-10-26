import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { LatheGeometry, Vector2, type Group } from 'three'
import { Ring } from './Ring'
import { anchors } from './scrollState'

// rough bounding radius of each model at scale 1, so they all fill their slot alike
const RADIUS = [1.2, 0.5, 0.56, 1.15]

/**
 * Small rotating models behind the compare table's header cells: Reeng, a bank card,
 * a phone and a generic titanium smart ring. Each frame they're placed at their cell's
 * on-screen position (projected onto the z = 0 plane), so they scroll with the table.
 */
export function CompareModels() {
  const models = useRef<(Group | null)[]>([])

  useFrame((state) => {
    const { width: vw, height: vh } = state.viewport
    const pxToWorld = vh / window.innerHeight
    const t = state.clock.elapsedTime

    models.current.forEach((g, i) => {
      const el = anchors.compareSlots[i]
      if (!g) return
      const r = el?.getBoundingClientRect()
      g.visible = !!r && r.bottom > 0 && r.top < window.innerHeight && r.width > 0
      if (!r || !g.visible) return
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      g.position.set((cx / window.innerWidth - 0.5) * vw, (0.5 - cy / window.innerHeight) * vh, 0)
      const fit = (Math.min(r.width, r.height) * 0.42 * pxToWorld) / RADIUS[i]
      g.scale.setScalar(fit)
      // rings spin; flat things (card, phone) sway so their face stays readable
      const flat = i === 1 || i === 2
      g.rotation.set(flat ? 0.15 : 0.35, flat ? Math.sin(t * 0.8 + i) * 0.6 : t * 0.6 + i * 1.3, flat ? 0 : 0.1)
    })
  })

  const set = (i: number) => (g: Group | null) => void (models.current[i] = g)

  return (
    <>
      {/* Reeng: the real model */}
      <group ref={set(0)} visible={false}>
        <group rotation={[0.9, 0, 0]}>
          <Ring />
        </group>
      </group>

      {/* bank card with chip */}
      <group ref={set(1)} visible={false}>
        <RoundedBox args={[0.856, 0.54, 0.012]} radius={0.004} smoothness={2}>
          <meshPhysicalMaterial color="#A9A9B6" metalness={0.7} roughness={0.3} clearcoat={0.6} />
        </RoundedBox>
        <mesh position={[-0.25, 0.05, 0.008]}>
          <boxGeometry args={[0.12, 0.09, 0.006]} />
          <meshStandardMaterial color="#D4B25A" metalness={1} roughness={0.3} />
        </mesh>
      </group>

      {/* phone */}
      <group ref={set(2)} visible={false}>
        <RoundedBox args={[0.5, 1.02, 0.05]} radius={0.06} smoothness={4}>
          <meshPhysicalMaterial color="#16161c" metalness={0.6} roughness={0.25} clearcoat={1} />
        </RoundedBox>
        <mesh position={[0, 0, 0.026]}>
          <planeGeometry args={[0.45, 0.96]} />
          <meshBasicMaterial color="#3B1270" toneMapped={false} />
        </mesh>
        {/* a "pay" button on the screen so it reads as a wallet */}
        <mesh position={[0, -0.34, 0.027]}>
          <planeGeometry args={[0.32, 0.08]} />
          <meshBasicMaterial color="#B57BFF" toneMapped={false} />
        </mesh>
      </group>

      {/* generic smart ring: wider, brushed titanium */}
      <group ref={set(3)} visible={false}>
        <OtherRing />
      </group>
    </>
  )
}

function OtherRing() {
  const geometry = useMemo(() => {
    // rounded rectangle profile, revolved: inner r 0.92, outer r 1.1, 1.0 wide
    const pts = [
      [0.92, -0.5],
      [1.04, -0.5],
      [1.1, -0.42],
      [1.1, 0.42],
      [1.04, 0.5],
      [0.92, 0.5],
      [0.92, -0.5],
    ].map(([x, y]) => new Vector2(x, y))
    return new LatheGeometry(pts, 96)
  }, [])
  return (
    <mesh geometry={geometry} rotation={[0.9, 0, 0]}>
      <meshStandardMaterial color="#B8B8C2" metalness={1} roughness={0.38} />
    </mesh>
  )
}
