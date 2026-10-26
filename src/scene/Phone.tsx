import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MathUtils, type Group } from 'three'
import { layout } from './layout'
import { createPhoneScreen, viewKey, type PhoneView } from './phoneScreen'
import { howStep, howSub, scrollState, smoothstep } from './scrollState'

/** What the app shows at progress `p` through the how-it-works section. */
function viewAt(p: number): PhoneView {
  const step = howStep(p)
  const sub = howSub(p)
  if (step === 0) return { step: 'pair', paired: sub > 0.55 }
  if (step === 1) return { step: 'fund', balance: Math.min(3, Math.floor(sub * 4)) * 50 }
  return { step: 'tap' }
}

/** A phone running the Reeng app; rises in with the section and turns slightly per step. */
export function Phone() {
  const group = useRef<Group>(null)
  const screen = useMemo(() => createPhoneScreen(), [])
  const shown = useRef('')

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const L = layout(state.viewport.width, state.viewport.height).how
    const enter = smoothstep(0.3, 1, scrollState.howEnter)
    const p = scrollState.how
    const vh = state.viewport.height

    g.visible = enter > 0.001 && scrollState.howExit < 0.999
    g.position.set(L.phone.x, L.phone.y - (1 - enter) * vh + scrollState.howExit * vh, L.phone.z)
    g.scale.setScalar(L.phoneScale)
    // a quarter-turn toward the ring while pairing, square-on for the rest
    const yaw = MathUtils.lerp(-0.45, -0.18, smoothstep(0.2, 0.4, p))
    g.rotation.y = MathUtils.damp(g.rotation.y, yaw + Math.sin(state.clock.elapsedTime * 0.6) * 0.04, 6, dt)
    g.rotation.x = 0.06

    const v = viewAt(p)
    const key = viewKey(v)
    if (key !== shown.current) {
      shown.current = key
      screen.draw(v)
    }
  })

  return (
    <group ref={group} rotation={[0.06, -0.45, 0]}>
      <RoundedBox args={[1.0, 2.05, 0.1]} radius={0.12} smoothness={6}>
        <meshPhysicalMaterial color="#16161c" metalness={0.6} roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} />
      </RoundedBox>
      {/* screen: unlit so the UI reads at any angle; 600×1280 texture matches the plane's aspect */}
      <mesh position={[0, 0, 0.051]}>
        <planeGeometry args={[0.9, 1.92]} />
        <meshBasicMaterial map={screen.texture} toneMapped={false} />
      </mesh>
    </group>
  )
}
