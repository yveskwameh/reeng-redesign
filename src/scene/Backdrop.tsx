import { useFrame } from '@react-three/fiber'
import { Color } from 'three'
import { anchors, SPEC, scrollState, smoothstep } from './scrollState'

const INK = new Color('#0A0A0F')
const PAPER = new Color('#F5F4F0')
const mixed = new Color()

/**
 * Fades the canvas backdrop from ink to paper for the light sections, so the
 * 3D stays visible there (an opaque paper section would hide the canvas).
 * Paper starts early in each enter, before the section's dark headline scrolls into view.
 */
export function Backdrop() {
  useFrame(() => {
    const el = anchors.backdrop
    if (!el) return
    const how = smoothstep(0.05, 0.5, scrollState.howEnter) * (1 - smoothstep(0.1, 0.6, scrollState.howExit))
    // specs: paper for the precision act, back to ink for the water act
    const spec = smoothstep(0.05, 0.5, scrollState.specEnter) * (1 - smoothstep(SPEC.water - 0.08, SPEC.water, scrollState.spec))
    const eco = smoothstep(0.05, 0.5, scrollState.ecoEnter) * (1 - smoothstep(0.1, 0.6, scrollState.ecoExit))
    const paper = Math.max(how, spec, eco)
    el.style.backgroundColor = `#${mixed.copy(INK).lerp(PAPER, paper).getHexString()}`
  })
  return null
}
