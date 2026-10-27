import { ContactShadows } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { Group } from 'three'
import { anchors, heroFx, scrollState } from './scrollState'

/**
 * Soft contact shadow under the floating hero ring. It follows the ring sideways and scales
 * with it (it is sized for the desktop ring). Mounted only while the hero is on screen:
 * ContactShadows re-renders the scene from below every frame, visible or not.
 */
export function HeroShadow() {
  const ref = useRef<Group>(null)
  const [on, setOn] = useState(true)

  useFrame(() => {
    const live = scrollState.hero < 0.5 && scrollState.tapEnter < 0.2
    if (live !== on) setOn(live)
    const g = ref.current
    const ring = anchors.ring
    if (!g || !ring) return
    g.position.set(ring.position.x, heroFx.floorY, 0)
    g.scale.setScalar(ring.scale.x / 0.6)
  })

  return <group ref={ref}>{on && <ContactShadows opacity={0.5} scale={5} blur={2.4} far={2.5} resolution={512} />}</group>
}
