import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  Euler,
  MathUtils,
  MeshStandardMaterial,
  Quaternion,
  Shape,
  Vector3,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type Points,
  type PointsMaterial,
} from 'three'
import { COIN_OUT, coinEdge, coinGeometry, coinTexture } from './coinTexture'
import { createEnvelopeFace, ENVELOPE_ASPECT } from './envelopeFace'
import { layout } from './layout'
import { MAIL, scrollState, smoothstep } from './scrollState'

const EW = 1.6 // envelope width (world units at scale 1)
const EH = EW / ENVELOPE_ASPECT
const COINS = 3

// flap: triangle hanging down from the top edge, on the back; swings back and up to open
const flapShape = new Shape()
flapShape.moveTo(-EW / 2, 0)
flapShape.lineTo(EW / 2, 0)
flapShape.lineTo(0, -EH * 0.58)
flapShape.closePath()

// coins face the camera with the ticker upright (see Coins.tsx)
const COIN_FACING = new Quaternion()
  .setFromEuler(new Euler(Math.PI / 2, 0, 0))
  .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2))

const from = new Vector3()
const top = new Vector3()
const to = new Vector3()
const p1 = new Vector3()
const p2 = new Vector3()

const phase = (p: number, [a, b]: readonly [number, number]) => smoothstep(a, b, p)

/**
 * An envelope addressed to a one-time alias: it arrives, opens, its coins fly into
 * the ring, then the alias lettering dissolves into particles and the envelope leaves.
 */
export function Envelope() {
  const root = useRef<Group>(null)
  const env = useRef<Group>(null)
  const flap = useRef<Group>(null)
  const face = useRef<Mesh>(null)
  const points = useRef<Points>(null)
  const coins = useRef<(Group | null)[]>([])
  const faces = useMemo(() => createEnvelopeFace(), [])
  const coinCap = useMemo(() => new MeshStandardMaterial({ map: coinTexture(COIN_OUT), metalness: 0.35, roughness: 0.35 }), [])

  // particle state, rebuilt if the alias sampling changes (it re-samples once web fonts load)
  const burn = useRef<{ count: number; base: Float32Array; vel: Float32Array; delay: Float32Array } | null>(null)

  const updateParticles = (b: number) => {
    const pts = points.current
    if (!pts) return
    const src = faces.aliasPoints
    const n = src.length / 2
    if (!burn.current || burn.current.count !== n) {
      const base = new Float32Array(n * 3)
      const vel = new Float32Array(n * 3)
      const delay = new Float32Array(n)
      for (let i = 0; i < n; i++) {
        base.set([src[i * 2] * EW, src[i * 2 + 1] * EH, 0.03], i * 3)
        vel.set([(Math.random() - 0.3) * 0.9, 0.5 + Math.random() * 1.1, Math.random() * 0.7], i * 3)
        // letters dissolve left to right
        delay[i] = (src[i * 2] + 0.5) * 0.45 + Math.random() * 0.1
      }
      const geo = new BufferGeometry()
      geo.setAttribute('position', new BufferAttribute(base.slice(), 3))
      pts.geometry.dispose()
      pts.geometry = geo
      burn.current = { count: n, base, vel, delay }
    }
    const { base, vel, delay } = burn.current
    pts.visible = b > 0.02 && b < 0.999
    if (!pts.visible) return
    const pos = pts.geometry.getAttribute('position') as BufferAttribute
    const arr = pos.array as Float32Array
    for (let i = 0; i < n; i++) {
      const t = MathUtils.clamp((b - delay[i]) / 0.5, 0, 1)
      const ease = t * t
      arr[i * 3] = base[i * 3] + vel[i * 3] * ease
      arr[i * 3 + 1] = base[i * 3 + 1] + vel[i * 3 + 1] * ease
      arr[i * 3 + 2] = base[i * 3 + 2] + vel[i * 3 + 2] * ease
    }
    pos.needsUpdate = true
    ;(pts.material as PointsMaterial).opacity = 1 - smoothstep(0.7, 1, b)
  }

  useFrame((state) => {
    const r = root.current
    const e = env.current
    if (!r || !e) return
    const L = layout(state.viewport.width, state.viewport.height).mail
    const p = scrollState.mail
    const on = scrollState.mailEnter > 0.9 && scrollState.mailExit < 0.999
    r.visible = on
    if (!on) return
    r.position.y = scrollState.mailExit * state.viewport.height

    // arrive from the upper right, tumbling slightly; leave by sinking away
    const arrive = phase(p, MAIL.arrive)
    const leave = phase(p, MAIL.leave)
    e.position.set(
      L.envelope.x + (1 - arrive) * 2.2,
      L.envelope.y + (1 - arrive) * 2.6 - leave * 1.4,
      (1 - arrive) * -1.5,
    )
    e.rotation.set(0.12, -0.18 + (1 - arrive) * 0.6, (1 - arrive) * 0.5 + Math.sin(state.clock.elapsedTime * 0.8) * 0.02)
    e.scale.setScalar(L.envScale * (1 - leave * 0.6))

    if (flap.current) flap.current.rotation.x = Math.PI * 0.95 * phase(p, MAIL.open)

    // coins: rise out of the envelope, then curve into the ring and shrink away
    const [c0, c1] = MAIL.coins
    const span = (c1 - c0) / (COINS + 1)
    coins.current.forEach((c, i) => {
      if (!c) return
      const u = smoothstep(0, 1, (p - c0 - i * span) / (span * 2))
      c.visible = u > 0 && u < 1
      from.set(0, 0, -0.03).applyMatrix4(e.matrixWorld)
      top.set(0.1 * (i - 1), EH * 0.95, 0.1).applyMatrix4(e.matrixWorld)
      to.copy(L.ring)
      // quadratic bezier: inside → above the envelope → into the ring
      const k = Math.min(1, u * 1.15)
      p1.lerpVectors(from, top, k)
      p2.lerpVectors(top, to, k)
      c.position.lerpVectors(p1, p2, k)
      c.quaternion.copy(COIN_FACING)
      c.scale.setScalar(L.envScale * 0.8 * smoothstep(0, 0.15, u) * (1 - smoothstep(0.8, 1, u)))
    })

    // burn: swap the face to "alias burned" and let the lettering fly off as particles
    const b = phase(p, MAIL.burn)
    if (face.current) {
      const mat = face.current.material as MeshBasicMaterial
      const want = b > 0.02 ? faces.burned : faces.withAlias
      if (mat.map !== want) mat.map = want
    }
    updateParticles(b)
  })

  return (
    <group ref={root}>
      <group ref={env}>
        {/* body */}
        <RoundedBox args={[EW, EH, 0.04]} radius={0.015} smoothness={3}>
          <meshStandardMaterial color="#E9E7E0" roughness={0.85} />
        </RoundedBox>
        {/* printed front */}
        <mesh ref={face} position={[0, 0, 0.0205]}>
          <planeGeometry args={[EW * 0.985, EH * 0.975]} />
          <meshBasicMaterial map={faces.withAlias} toneMapped={false} />
        </mesh>
        {/* flap, hinged on the top edge at the back */}
        <group ref={flap} position={[0, EH / 2, -0.021]}>
          <mesh>
            <shapeGeometry args={[flapShape]} />
            <meshStandardMaterial color="#DEDCD4" roughness={0.85} side={2} />
          </mesh>
        </group>
        {/* the alias lettering as particles, on the front face */}
        <points ref={points}>
          <bufferGeometry />
          <pointsMaterial color="#B57BFF" size={0.018} sizeAttenuation transparent depthWrite={false} toneMapped={false} />
        </points>
      </group>

      {Array.from({ length: COINS }, (_, i) => (
        <group key={i} ref={(g) => void (coins.current[i] = g)} visible={false}>
          <mesh geometry={coinGeometry} material={[coinEdge, coinCap, coinCap]} />
        </group>
      ))}
    </group>
  )
}
