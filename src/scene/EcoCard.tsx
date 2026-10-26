import { Billboard } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MathUtils, type Group, type Mesh, type MeshBasicMaterial } from 'three'
import { modes } from '../content/ecosystem'
import { layout } from './layout'
import { createModeCards, MODE_CARD_ASPECT } from './modeCards'
import { anchors, ecoMode, scrollState, smoothstep } from './scrollState'

const CARD_H = 1.5
const PULSES = 3
const FLIP = 0.55 // seconds

/**
 * Ecosystem: the card beside the ring showing what a tap opens. On each mode change
 * it flips (swapping its face edge-on) and the ring sends out pulses in the mode's colour.
 */
export function EcoCard() {
  const root = useRef<Group>(null)
  const card = useRef<Group>(null)
  const face = useRef<MeshBasicMaterial>(null)
  const pulseGroup = useRef<Group>(null)
  const pulses = useRef<(Mesh | null)[]>([])
  const textures = useMemo(() => createModeCards(), [])
  const shown = useRef({ mode: -1, changedAt: -10 })

  useFrame((state) => {
    const r = root.current
    if (!r || !card.current) return
    const L = layout(state.viewport.width, state.viewport.height).eco
    const t = state.clock.elapsedTime
    const enter = smoothstep(0.4, 1, scrollState.ecoEnter)
    r.visible = enter > 0.01 && scrollState.ecoExit < 0.999
    if (!r.visible) return
    const exitY = scrollState.ecoExit * state.viewport.height

    // mode change → restart the flip and the pulses
    const mode = ecoMode(scrollState.eco)
    const s = shown.current
    if (mode !== s.mode) {
      s.mode = mode
      s.changedAt = t
    }
    const since = t - s.changedAt
    const flip = MathUtils.clamp(since / FLIP, 0, 1)
    // swing out to edge-on, swap the face, swing back in
    if (face.current && flip >= 0.5 && face.current.map !== textures[mode]) face.current.map = textures[mode]
    const swing = flip < 0.5 ? flip * 2 : (1 - flip) * 2

    card.current.position.set(L.card.x, L.card.y - (1 - enter) * 1.5 + exitY + Math.sin(t * 0.9) * 0.03, L.card.z)
    card.current.rotation.set(0.04, -0.22 + swing * (Math.PI / 2), 0)
    card.current.scale.setScalar(L.cardScale * enter)

    // pulses ride on the ring
    const ring = anchors.ring
    if (pulseGroup.current && ring) pulseGroup.current.position.copy(ring.position)
    pulses.current.forEach((m, i) => {
      if (!m) return
      const w = (since - i * 0.15) / 1.1
      m.visible = w > 0 && w < 1
      m.scale.setScalar((0.5 + w * 1.6) * L.ringScale * 2)
      const mat = m.material as MeshBasicMaterial
      mat.color.set(modes[mode].glow)
      mat.opacity = (1 - w) * 0.8
    })
  })

  return (
    <group ref={root}>
      <group ref={card}>
        <mesh>
          <planeGeometry args={[CARD_H * MODE_CARD_ASPECT, CARD_H]} />
          <meshBasicMaterial ref={face} map={textures[0]} transparent toneMapped={false} />
        </mesh>
      </group>
      <Billboard ref={pulseGroup}>
        {Array.from({ length: PULSES }, (_, i) => (
          <mesh key={i} ref={(m) => void (pulses.current[i] = m)}>
            <ringGeometry args={[0.98, 1, 96]} />
            <meshBasicMaterial transparent opacity={0} toneMapped={false} depthWrite={false} />
          </mesh>
        ))}
      </Billboard>
    </group>
  )
}
