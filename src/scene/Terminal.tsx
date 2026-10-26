import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MathUtils, type Group, type Mesh, type MeshBasicMaterial, type PointLight } from 'three'
import { layout } from './layout'
import { createScreen, type ScreenPhase } from './screenTexture'
import { anchors, scrollState, smoothstep, TAP } from './scrollState'

const RIPPLES = 3

/**
 * A generic contactless card terminal, tilted back like it sits on a counter.
 * Rises in with `tapEnter`; ripples and the screen react to `tap`.
 */
export function Terminal() {
  const group = useRef<Group>(null)
  const ripples = useRef<(Mesh | null)[]>([])
  const glow = useRef<PointLight>(null)
  const screen = useMemo(() => createScreen(), [])
  const shown = useRef<ScreenPhase>('ready')

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const L = layout(state.viewport.width, state.viewport.height)
    const enter = smoothstep(0.35, 1, scrollState.tapEnter)
    const p = scrollState.tap
    const paid = smoothstep(TAP.paid - 0.03, TAP.paid + 0.03, p)

    const exit = scrollState.tapExit * state.viewport.height
    g.visible = enter > 0.001 && scrollState.tapExit < 0.999
    g.position.set(L.terminal.pos.x, L.terminal.pos.y - (1 - enter) * 2.2 + exit, L.terminal.pos.z)
    g.scale.setScalar(L.terminal.scale)

    // NFC ripples spread from the contactless mark while the ring is close
    const active = smoothstep(TAP.touch - 0.12, TAP.touch, p) * (1 - smoothstep(TAP.paid, TAP.paid + 0.15, p))
    ripples.current.forEach((m, i) => {
      if (!m) return
      const w = (state.clock.elapsedTime * 0.9 + i / RIPPLES) % 1
      m.scale.setScalar(0.25 + w * 1.1)
      ;(m.material as MeshBasicMaterial).opacity = (1 - w) * 0.8 * active
    })

    // payment confirmed: screen flips to lime, light pulses
    const phase: ScreenPhase = paid > 0.5 ? 'paid' : 'ready'
    if (phase !== shown.current) {
      shown.current = phase
      screen.draw(phase)
    }
    if (glow.current) {
      glow.current.color.set(paid > 0.5 ? '#C8FF4D' : '#B57BFF')
      const target = active * 5 + paid * (1 - smoothstep(0.75, 1, p)) * 2.5
      glow.current.intensity = MathUtils.damp(glow.current.intensity, target, 6, dt)
    }
  })

  return (
    // tilted back like it sits on a counter, so the ring comes down onto it
    <group ref={group} rotation={[-0.85, -0.25, 0]}>
      {/* body */}
      <RoundedBox args={[1.25, 1.9, 0.16]} radius={0.07} smoothness={6}>
        <meshPhysicalMaterial color="#1A1A22" roughness={0.35} clearcoat={0.6} clearcoatRoughness={0.2} />
      </RoundedBox>

      {/* screen: unlit so the readout stays legible at any angle */}
      <mesh position={[0, 0.38, 0.081]}>
        <planeGeometry args={[1.02, 0.88]} />
        <meshBasicMaterial map={screen.texture} toneMapped={false} />
      </mesh>

      {/* contactless mark + ripples, on the lower face */}
      <group position={[0, -0.5, 0.082]} ref={(o) => void (anchors.contactless = o)}>
        {[0.1, 0.17, 0.24].map((r) => (
          <mesh key={r} rotation={[0, 0, -Math.PI / 4]} position={[-0.08, 0, 0]}>
            <ringGeometry args={[r, r + 0.022, 32, 1, 0, Math.PI / 2]} />
            <meshBasicMaterial color="#8A8A99" />
          </mesh>
        ))}
        {Array.from({ length: RIPPLES }, (_, i) => (
          <mesh key={i} ref={(m) => void (ripples.current[i] = m)} position={[0, 0, 0.002]}>
            <ringGeometry args={[0.38, 0.4, 64]} />
            <meshBasicMaterial color="#B57BFF" transparent opacity={0} toneMapped={false} depthWrite={false} />
          </mesh>
        ))}
        <pointLight ref={glow} position={[0, 0, 0.4]} intensity={0} distance={3} color="#B57BFF" />
      </group>
    </group>
  )
}
