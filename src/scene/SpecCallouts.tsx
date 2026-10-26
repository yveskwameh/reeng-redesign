import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group, Mesh, MeshBasicMaterial } from 'three'
import { product } from '../content/product'
import { innerDiameter } from '../content/sizing'
import { labelTexture } from './labelTexture'
import { layout } from './layout'
import { anchors, SPEC, scrollState, smoothstep } from './scrollState'

// ring dimensions in model units (see 3d/build_ring.py): 1 unit = 1 cm
const R_IN = 0.945
const R_OUT = 1.185
const HALF_W = 0.4

const INK = '#0A0A0F'
const VIOLET = '#9730F6'

type Pt = [number, number, number]
type LineMat = { opacity: number }

/**
 * Technical-drawing callouts around the ring for the precision act. They live in a
 * group that follows the ring's position and scale but not its rotation, so the
 * lines stay square to the screen while the ring turns from face-on to profile.
 */
export function SpecCallouts() {
  const group = useRef<Group>(null)
  const front = useRef<Group>(null)
  const leader = useRef<Group>(null)
  const side = useRef<Group>(null)

  const labels = useMemo(
    () => ({
      dia: labelTexture(`Ø ${innerDiameter(9).toFixed(1)} MM · US 9`, INK),
      thick: labelTexture(`${product.specs.thicknessMm} MM`, INK),
      width: labelTexture(`${product.specs.widthMm} MM`, INK),
    }),
    [],
  )

  useFrame((state) => {
    const g = group.current
    const ring = anchors.ring
    if (!g || !ring) return
    if (leader.current) leader.current.visible = layout(state.viewport.width, state.viewport.height).spec.leader
    g.position.copy(ring.position)
    g.scale.copy(ring.scale)
    const p = scrollState.spec
    const on = scrollState.specEnter > 0.95 && scrollState.specExit < 0.01
    const f = on ? smoothstep(SPEC.front[0], SPEC.front[0] + 0.04, p) * (1 - smoothstep(SPEC.front[1] - 0.04, SPEC.front[1], p)) : 0
    const s = on ? smoothstep(SPEC.side[0], SPEC.side[0] + 0.04, p) * (1 - smoothstep(SPEC.side[1] - 0.03, SPEC.side[1] + 0.01, p)) : 0
    fade(front.current, f)
    fade(side.current, s)
  })

  return (
    <group ref={group}>
      {/* face-on: inner diameter across the hole, thickness as a leader on the band */}
      <group ref={front}>
        <Dim from={[-R_IN, 0, 0.5]} to={[R_IN, 0, 0.5]} />
        <Label tex={labels.dia} at={[0, 0.18, 0.5]} />
        <group ref={leader}>
          <Line points={[[0.72, 0.78, 0.5], [1.1, 1.3, 0.5], [1.4, 1.3, 0.5]]} color={VIOLET} lineWidth={1.5} transparent />
          <mesh position={[0.72, 0.78, 0.5]}>
            <circleGeometry args={[0.035, 16]} />
            <meshBasicMaterial color={VIOLET} transparent />
          </mesh>
          <Label tex={labels.thick} at={[1.72, 1.3, 0.5]} />
        </group>
      </group>

      {/* profile: band width, with extension lines down from the band edges */}
      <group ref={side}>
        <Line points={[[-HALF_W, -R_OUT - 0.08, 0.5], [-HALF_W, -R_OUT - 0.42, 0.5]]} color={VIOLET} lineWidth={1} transparent />
        <Line points={[[HALF_W, -R_OUT - 0.08, 0.5], [HALF_W, -R_OUT - 0.42, 0.5]]} color={VIOLET} lineWidth={1} transparent />
        <Dim from={[-HALF_W, -R_OUT - 0.32, 0.5]} to={[HALF_W, -R_OUT - 0.32, 0.5]} />
        <Label tex={labels.width} at={[0, -R_OUT - 0.6, 0.5]} />
      </group>
    </group>
  )
}

/** Dimension line with end ticks. */
function Dim({ from, to }: { from: Pt; to: Pt }) {
  const t = 0.09
  return (
    <>
      <Line points={[from, to]} color={VIOLET} lineWidth={1.5} transparent />
      <Line points={[[from[0], from[1] - t, from[2]], [from[0], from[1] + t, from[2]]]} color={VIOLET} lineWidth={1.5} transparent />
      <Line points={[[to[0], to[1] - t, to[2]], [to[0], to[1] + t, to[2]]]} color={VIOLET} lineWidth={1.5} transparent />
    </>
  )
}

function Label({ tex, at }: { tex: ReturnType<typeof labelTexture>; at: Pt }) {
  const h = 0.2
  return (
    <mesh position={at} scale={[h * tex.aspect(), h, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={tex.texture} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  )
}

/** Fade every line and label in a callout group; hide it entirely when invisible. */
function fade(g: Group | null, o: number) {
  if (!g) return
  g.visible = o > 0.01
  g.traverse((c) => {
    const mat = (c as Mesh).material as (MeshBasicMaterial & LineMat) | undefined
    if (mat && 'opacity' in mat) mat.opacity = o
  })
}
