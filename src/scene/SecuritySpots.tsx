import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { anchors, scrollState, secFx, type PartName } from './scrollState'

// where each callout points on its part, in the part's local (model) space; front = -Z
const SPOTS: Record<PartName, Vector3> = {
  Antenna: new Vector3(0.45, 0, -0.95),
  Shell: new Vector3(-0.55, 0.15, -1.08),
  Liner: new Vector3(0.5, -0.2, -0.86),
  SecureChip: new Vector3(0, 0, -0.03),
}
const v = new Vector3()

/**
 * Projects the exploded ring's centre and its parts' callout points to viewport px each
 * frame (into secFx) while the security section is on screen; Security draws the callout
 * lines and labels from them.
 */
export function SecuritySpots() {
  useFrame(({ camera, size }) => {
    if (scrollState.secEnter < 0.01 || scrollState.secExit > 0.99) return
    const toPx = (out: { x: number; y: number }) => {
      v.project(camera)
      out.x = ((v.x + 1) / 2) * size.width
      out.y = ((1 - v.y) / 2) * size.height
    }
    if (anchors.ring) {
      v.setFromMatrixPosition(anchors.ring.matrixWorld)
      toPx(secFx.Center)
    }
    for (const [name, spot] of Object.entries(SPOTS)) {
      const part = anchors.ringParts[name]
      if (!part) continue
      v.copy(spot)
      part.localToWorld(v)
      toPx(secFx[name as PartName])
    }
  })
  return null
}
