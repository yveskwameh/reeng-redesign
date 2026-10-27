import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Euler, MathUtils, MeshStandardMaterial, Quaternion, type Group } from 'three'
import { CHAINS } from '../content/chains'
import { COIN_OUT, coinEdge as edge, coinGeometry as geometry, coinTexture } from './coinTexture'
import { layout } from './layout'
import { coinTravel, CROSS, scrollState, smoothstep } from './scrollState'

// face the camera with the ticker upright
const FACE_CAMERA = new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0)).multiply(new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0)))
const TUNNEL = [3, 6, 9, 12] // depth of the faint rings behind the gate
const q = new Quaternion()
const e = new Euler()

/**
 * Cross-chain tunnel: coins from each chain spiral out of the depth, pass through the
 * ring hanging face-on (turning into USDC on Base as they cross it) and sweep off toward
 * the section's ledger. Faint receding rings behind the gate suggest the tunnel.
 */
export function Coins() {
  const root = useRef<Group>(null)
  const tunnel = useRef<Group>(null)
  const coins = useRef<(Group | null)[]>([])
  const mats = useMemo(
    () =>
      Array.from({ length: CROSS.coins }, (_, i) => new MeshStandardMaterial({ map: coinTexture(CHAINS[i]), metalness: 0.35, roughness: 0.35 })),
    [],
  )

  useFrame((state) => {
    const r = root.current
    if (!r) return
    const L = layout(state.viewport.width, state.viewport.height)
    const C = L.cross
    const enter = smoothstep(0.4, 1, scrollState.crossEnter)
    const p = scrollState.cross
    const t = state.clock.elapsedTime

    r.visible = enter > 0.001 && scrollState.crossExit < 0.999
    r.position.y = scrollState.crossExit * state.viewport.height
    // depth behind the ring is laid along the line of sight, so deeper things stay centred
    // on the ring on screen instead of sliding toward the middle of the screen
    const cam = state.camera.position.z
    const behind = (z: number) => (cam - z) / cam
    if (tunnel.current) {
      tunnel.current.children.forEach((m, i) => {
        const z = -TUNNEL[i] * C.ringScale * enter // the tunnel opens up as the section arrives
        m.position.set(C.ring.x * behind(z), C.ring.y * behind(z), z)
        m.scale.setScalar(C.ringScale)
      })
    }

    coins.current.forEach((g, i) => {
      if (!g) return
      const u = coinTravel(i, p)
      g.visible = u > 0 && u < 1
      if (!g.visible) return
      // spiral in from far behind, cross the ring at u = 0.5, then sweep off toward the ledger
      const a = i * 2.1 + u * 3
      const rad = (1 - smoothstep(0, 0.5, u)) * 2.2 * C.ringScale
      const off = smoothstep(0.55, 1, u)
      const z = MathUtils.lerp(-16, 0, smoothstep(0, 0.5, u))
      g.position.set(
        (C.ring.x + Math.cos(a) * rad) * behind(z) + off * C.exit.x,
        (C.ring.y + Math.sin(a) * rad * 0.7) * behind(z) + off * C.exit.y,
        z + off * C.exit.z,
      )
      e.set(Math.sin(t + i) * 0.25, Math.sin(t * 0.7 + i) * 0.3, 0)
      g.quaternion.copy(q.setFromEuler(e).multiply(FACE_CAMERA))
      g.scale.setScalar(1.6 * C.ringScale)
      const tex = coinTexture(u >= 0.5 ? COIN_OUT : CHAINS[i])
      if (mats[i].map !== tex) {
        mats[i].map = tex
        mats[i].needsUpdate = true
      }
    })
  })

  return (
    <group ref={root}>
      <group ref={tunnel}>
        {TUNNEL.map((d) => (
          <mesh key={d}>
            <ringGeometry args={[2, 2.06, 96]} />
            <meshBasicMaterial color="#d9d7e2" transparent opacity={0.9 - d * 0.05} />
          </mesh>
        ))}
      </group>
      {mats.map((m, i) => (
        <group key={i} ref={(g) => void (coins.current[i] = g)} visible={false}>
          <mesh geometry={geometry} material={[edge, m, m]} />
        </group>
      ))}
    </group>
  )
}
