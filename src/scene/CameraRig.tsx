import { useFrame } from '@react-three/fiber'
import { MathUtils, Quaternion, Vector3 } from 'three'
import { layout } from './layout'
import { anchors, scrollState, smoothstep, tapPlace, tapZoom } from './scrollState'

const HOME = new Vector3(0, 0, 7)
const center = new Vector3()
const normal = new Vector3()
const target = new Vector3()
const look = new Vector3()
const q = new Quaternion()
let zoom = 0

/**
 * Tap to pay: the camera eases in toward the terminal around each tap and back out after,
 * framed so the whole terminal stays on screen. Everywhere else it rests at HOME looking at
 * the origin, which the rest of the scene assumes.
 */
export function CameraRig() {
  useFrame(({ camera, viewport }, dt) => {
    const L = layout(viewport.width, viewport.height)
    const on = smoothstep(0.6, 1, scrollState.tapEnter) * (1 - smoothstep(0, 0.3, scrollState.tapExit))
    zoom = MathUtils.damp(zoom, tapZoom(tapPlace(scrollState.tap).sub) * on, 6, dt)
    const reader = anchors.contactless
    if (zoom < 0.001 || !reader?.parent) {
      camera.position.copy(HOME)
      camera.lookAt(0, 0, 0)
      return
    }
    // terminal centre and facing direction; stop at a distance where it fills ~3/4 of the height
    reader.parent.getWorldPosition(center)
    normal.set(0, 0, 1).applyQuaternion(reader.parent.getWorldQuaternion(q))
    target.copy(center).addScaledVector(normal, 6.2 * L.terminal.scale)
    // phones: the terminal already fills the width, so the push-in stays small
    camera.position.copy(HOME).lerp(target, zoom * (viewport.aspect < 0.9 ? 0.3 : 0.55))
    camera.lookAt(look.set(0, 0, 0).lerp(center, zoom * (viewport.aspect < 0.9 ? 0.5 : 1)))
  })
  return null
}
