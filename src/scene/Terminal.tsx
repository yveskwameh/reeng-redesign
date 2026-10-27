import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MathUtils, type Group, type Mesh, type MeshBasicMaterial, type PointLight } from 'three'
import { PLACES } from '../content/places'
import { layout } from './layout'
import { receiptTexture } from './receiptTexture'
import { createScreen, type ScreenPhase } from './screenTexture'
import { anchors, scrollState, smoothstep, TAP, tapPlace, tapPrint } from './scrollState'

const RIPPLES = 3
const BODY = '#2B2C33'
// screen: centre and size on the front face; the contactless zone is its lower half
const SCREEN = { y: -0.06, w: 0.98, h: 1.59 }
const READER_Y = SCREEN.y - SCREEN.h * 0.22
const SLOT_Y = 1.13 // top of the printer housing, where the paper comes out

/**
 * A modern handheld card terminal (after the PAX A920 family): graphite body, a large
 * glass touchscreen with the contactless zone in its lower half, and a receipt printer
 * housing on top. Tilted back like it sits on a counter. Rises in with `tapEnter`; for each
 * place the screen shows the amount, ripples while the ring touches, flips to approved,
 * and a paper receipt prints out of the top and tears off.
 */
export function Terminal() {
  const group = useRef<Group>(null)
  const ripples = useRef<(Mesh | null)[]>([])
  const receipt = useRef<Mesh>(null)
  const glow = useRef<PointLight>(null)
  const screen = useMemo(() => createScreen(), [])
  const shown = useRef('')

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const L = layout(state.viewport.width, state.viewport.height)
    const enter = smoothstep(0.35, 1, scrollState.tapEnter)
    const { i, sub } = tapPlace(scrollState.tap)
    const place = PLACES[i]
    const paid = smoothstep(TAP.paid - 0.03, TAP.paid + 0.03, sub)

    const exit = scrollState.tapExit * state.viewport.height
    g.visible = enter > 0.001 && scrollState.tapExit < 0.999
    g.position.set(L.terminal.pos.x, L.terminal.pos.y - (1 - enter) * 2.4 + exit, L.terminal.pos.z)
    g.scale.setScalar(L.terminal.scale)

    // NFC ripples spread from the reader while the ring is close
    const active = smoothstep(TAP.touch - 0.12, TAP.touch, sub) * (1 - smoothstep(TAP.paid, TAP.paid + 0.15, sub))
    ripples.current.forEach((m, k) => {
      if (!m) return
      const w = (state.clock.elapsedTime * 0.9 + k / RIPPLES) % 1
      m.scale.setScalar(0.25 + w * 1.1)
      ;(m.material as MeshBasicMaterial).opacity = (1 - w) * 0.8 * active
    })

    // screen: this place's amount, then approved
    const phase: ScreenPhase = paid > 0.5 ? 'paid' : 'ready'
    const key = `${i}/${phase}`
    if (key !== shown.current) {
      shown.current = key
      screen.draw(phase, place)
    }
    if (glow.current) {
      glow.current.color.set(paid > 0.5 ? '#C8FF4D' : '#9730F6')
      const target = active * 4 + paid * (1 - smoothstep(0.75, 1, sub)) * 2
      glow.current.intensity = MathUtils.damp(glow.current.intensity, target, 6, dt)
    }

    // receipt: slides up out of the printer slot, then tears off and lifts away
    const r = receipt.current
    if (r) {
      const { out, tear } = tapPrint(sub)
      const mat = r.material as MeshBasicMaterial
      if (mat.map !== receiptTexture(place)) {
        mat.map = receiptTexture(place)
        mat.needsUpdate = true
      }
      // starts tucked inside the housing (its top edge at the slot), ends fully out
      r.position.y = SLOT_Y - 0.82 + out * 1.62 + tear * 1.2
      r.position.z = -0.12 - tear * 0.4
      r.rotation.z = tear * 0.25
      mat.opacity = 1 - tear
      r.visible = out > 0.001 && tear < 0.999
    }
  })

  return (
    // tilted back like it sits on a counter, so the ring comes down onto it
    <group ref={group} rotation={[-0.85, -0.25, 0]}>
      {/* body */}
      <RoundedBox args={[1.18, 2.12, 0.16]} radius={0.075} smoothness={5}>
        <meshPhysicalMaterial color={BODY} roughness={0.45} clearcoat={0.4} clearcoatRoughness={0.3} />
      </RoundedBox>
      {/* printer housing: a thicker hump on the top back holding the paper roll */}
      <RoundedBox args={[1.18, 0.5, 0.34]} radius={0.12} smoothness={5} position={[0, 0.88, -0.09]}>
        <meshPhysicalMaterial color={BODY} roughness={0.45} clearcoat={0.4} clearcoatRoughness={0.3} />
      </RoundedBox>
      {/* paper slot across the top */}
      <mesh position={[0, SLOT_Y, -0.12]}>
        <boxGeometry args={[0.92, 0.012, 0.05]} />
        <meshBasicMaterial color="#0B0B10" />
      </mesh>
      {/* glass: black bezel, then the screen */}
      <RoundedBox args={[1.06, 1.7, 0.012]} radius={0.05} smoothness={3} position={[0, SCREEN.y, 0.081]}>
        <meshPhysicalMaterial color="#060609" roughness={0.08} clearcoat={1} />
      </RoundedBox>
      <mesh position={[0, SCREEN.y, 0.0885]}>
        <planeGeometry args={[SCREEN.w, SCREEN.h]} />
        <meshBasicMaterial map={screen.texture} toneMapped={false} />
      </mesh>
      {/* chip-card slot on the bottom edge */}
      <mesh position={[0, -1.06, 0.02]}>
        <boxGeometry args={[0.66, 0.012, 0.04]} />
        <meshBasicMaterial color="#0B0B10" />
      </mesh>

      {/* receipt paper (hidden inside the housing until it prints) */}
      <mesh ref={receipt} position={[0, SLOT_Y - 0.82, -0.12]} visible={false}>
        <planeGeometry args={[0.86, 1.62]} />
        <meshBasicMaterial transparent toneMapped={false} side={2} />
      </mesh>

      {/* contactless zone: the ring touches down here; ripples spread from it */}
      <group position={[0, READER_Y, 0.09]} ref={(o) => void (anchors.contactless = o)}>
        {Array.from({ length: RIPPLES }, (_, k) => (
          <mesh key={k} ref={(m) => void (ripples.current[k] = m)} position={[0, 0, 0.002]}>
            <ringGeometry args={[0.38, 0.4, 64]} />
            <meshBasicMaterial color="#9730F6" transparent opacity={0} toneMapped={false} depthWrite={false} />
          </mesh>
        ))}
        <pointLight ref={glow} position={[0, 0, 0.4]} intensity={0} distance={3} color="#9730F6" />
      </group>
    </group>
  )
}
