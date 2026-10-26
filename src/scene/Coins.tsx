import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Euler, MathUtils, MeshStandardMaterial, Quaternion, Vector3, type Group, type PointLight } from 'three'
import { COIN_OUT, coinEdge as edge, coinGeometry as geometry, COINS_IN, coinTexture } from './coinTexture'
import { layout } from './layout'
import { coinTravel, CROSS, scrollState, smoothstep } from './scrollState'

const FACE_CAMERA = new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0))
const CAP_UPRIGHT = Math.PI / 2 // roll that makes the cap texture read upright toward the camera
// face up, tipped toward camera, ticker upright
const LIE_FLAT = new Quaternion()
  .setFromEuler(new Euler(0.35, 0, 0))
  .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), CAP_UPRIGHT))

const p0 = new Vector3()
const back = new Vector3()
const front = new Vector3()
const slot = new Vector3()
const target = new Vector3()
const q = new Quaternion()
const spin = new Quaternion()
const AXIS = new Vector3(0, 1, 0) // coin's own axis (it faces the camera after FACE_CAMERA)

/**
 * Coins orbit the portal ring, then pass through it one at a time: they enter
 * from behind as their own token/chain and come out the front as USDC on Base,
 * landing on a stack.
 */
export function Coins() {
  const root = useRef<Group>(null)
  const coins = useRef<(Group | null)[]>([])
  const baseGlow = useRef<PointLight>(null)

  // one cap material per coin so each face can swap to USDC on its own
  const faces = useMemo(
    () =>
      COINS_IN.map((face) => {
        const cap = new MeshStandardMaterial({ map: coinTexture(face), metalness: 0.35, roughness: 0.35 })
        return { cap, inTex: coinTexture(face), outTex: coinTexture(COIN_OUT) }
      }),
    [],
  )

  useFrame((state, dt) => {
    const r = root.current
    if (!r) return
    const L = layout(state.viewport.width, state.viewport.height)
    const C = L.cross
    const enter = smoothstep(0.4, 1, scrollState.crossEnter)
    const p = scrollState.cross
    const t = state.clock.elapsedTime

    r.visible = enter > 0.001 && scrollState.crossExit < 0.999
    r.position.y = scrollState.crossExit * state.viewport.height

    coins.current.forEach((g, i) => {
      if (!g) return
      // orbit: tilted ellipse around the ring, flown in from far away
      const a = (i / CROSS.coins) * Math.PI * 2 + t * 0.6
      const radius = C.orbit * MathUtils.lerp(3, 1, enter)
      p0.set(C.ring.x + Math.cos(a) * radius, C.ring.y + Math.sin(a) * radius * 0.42, Math.sin(a) * radius * 0.6)

      // pass-through path: orbit → behind the ring → out the front → stack slot
      back.set(C.ring.x, C.ring.y, -0.9)
      front.set(C.ring.x, C.ring.y, 0.9)
      slot.set(C.stack.x, C.stack.y + i * 0.045, C.stack.z)
      const u = coinTravel(i, p)
      if (u < 0.35) target.lerpVectors(p0, back, smoothstep(0, 0.35, u))
      else if (u < 0.65) target.lerpVectors(back, front, smoothstep(0.35, 0.65, u))
      else target.lerpVectors(front, slot, smoothstep(0.65, 1, u))

      // face the camera while travelling (wobbling, ticker kept readable), lie flat on the stack
      const wobble = Math.sin(t * 1.3 + i * 1.7) * 0.35 * (1 - smoothstep(0.65, 1, u))
      spin.setFromAxisAngle(AXIS, CAP_UPRIGHT + wobble)
      q.copy(FACE_CAMERA).multiply(spin).slerp(LIE_FLAT, smoothstep(0.7, 1, u))

      const k = 1 - Math.exp(-dt * 10)
      g.position.lerp(target, k)
      g.quaternion.slerp(q, k)
      g.scale.setScalar(C.coinScale)

      // swap the face once it has crossed the ring plane
      const f = faces[i]
      const tex = u >= 0.5 ? f.outTex : f.inTex
      if (f.cap.map !== tex) f.cap.map = tex
    })

    // settled stack glows Base blue
    const settled = smoothstep(0.85, 0.95, p)
    if (baseGlow.current) {
      baseGlow.current.position.set(C.stack.x, C.stack.y + 0.4, C.stack.z + 0.4)
      baseGlow.current.intensity = MathUtils.damp(baseGlow.current.intensity, settled * 4, 5, dt)
    }
  })

  return (
    <group ref={root}>
      {faces.map((f, i) => (
        <group key={i} ref={(g) => void (coins.current[i] = g)}>
          <mesh geometry={geometry} material={[edge, f.cap, f.cap]} />
        </group>
      ))}
      <pointLight ref={baseGlow} color="#0052FF" intensity={0} distance={3} />
    </group>
  )
}
