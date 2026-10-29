import { useFrame } from '@react-three/fiber'
import { Color, MathUtils, Mesh, type MeshStandardMaterial, type Object3D, type Vector3 } from 'three'
import { modes } from '../content/ecosystem'
import { anchors, config, ecoMode, MAIL, SEC, SECURITY, secFeature, scrollState, smoothstep } from './scrollState'

const GLOW = new Color('#9730F6')
const CORAL = new Color('#FF5A4E')
const COPPER = new Color('#F28C55')
const LIME = new Color('#C8FF4D')
const restPose = new WeakMap<Object3D, Vector3>()
const baseColor = new WeakMap<Object3D, Color>()
const finish = new Color()
const heroFinish = new Color()
const target = new Color()
const modeGlow = new Color()

// how far each part travels when exploded, in model units (ring axis is model Y)
const OFFSETS: Record<string, [number, number, number]> = {
  Shell: [0, 1.25, 0],
  Liner: [0, -1.25, 0],
  Antenna: [0, 0, 0],
  SecureChip: [0, 0, -0.75], // pulled out of the band, toward the front
}

/**
 * Effects on the main ring's parts:
 * - security: parts separate along the ring's axis, and the part behind the active
 *   feature glows (all coral for revoke)
 * - pay by email: a lime flash as the coins land
 * - hero: the shell takes the finish picked from the hero swatches
 * - order + final call to action: the shell takes the configurator's finish
 * - ecosystem: a faint glow in the active mode's colour
 */
export function RingFx() {
  useFrame((_, dt) => {
    const [, coinsEnd] = MAIL.coins
    const received =
      smoothstep(coinsEnd - 0.14, coinsEnd - 0.04, scrollState.mail) *
      (1 - smoothstep(coinsEnd + 0.02, coinsEnd + 0.12, scrollState.mail)) *
      (scrollState.mailEnter > 0.9 ? 1 : 0)
    const parts = anchors.ringParts
    // explode only while the security section is on screen
    const on = smoothstep(0.6, 1, scrollState.secEnter) * (1 - smoothstep(0, 0.4, scrollState.secExit))
    const explode = smoothstep(0.02, SEC.explode, scrollState.sec) * on
    const f = secFeature(scrollState.sec)
    const feature = f >= 0 && on > 0.5 ? SECURITY[f] : null

    // configurator finish, while the order section or the closing call to action is on screen
    const finishOn = Math.max(
      smoothstep(0.5, 1, scrollState.orderEnter) * (1 - smoothstep(0, 0.5, scrollState.orderExit)),
      smoothstep(0.3, 1, scrollState.ctaEnter), // the closing ring keeps your chosen finish
    )
    finish.set(config.finish)
    heroFinish.set(config.heroFinish)
    const heroOn = 1 - smoothstep(0, 0.6, scrollState.tapEnter)

    const ecoOn = smoothstep(0.5, 1, scrollState.ecoEnter) * (1 - smoothstep(0, 0.4, scrollState.ecoExit))
    modeGlow.set(modes[ecoMode(scrollState.eco)].glow)

    for (const [name, part] of Object.entries(parts)) {
      if (name === 'Shell' && part instanceof Mesh) {
        const mat = part.material as MeshStandardMaterial
        let base = baseColor.get(part)
        if (!base) baseColor.set(part, (base = mat.color.clone()))
        target.copy(base).lerp(heroFinish, heroOn).lerp(finish, finishOn)
        mat.color.lerp(target, 1 - Math.exp(-dt * 10))
      }
      // remember each part's assembled position the first time we see it
      let rest = restPose.get(part)
      if (!rest) restPose.set(part, (rest = part.position.clone()))
      const o = OFFSETS[name]
      if (o) part.position.set(rest.x + o[0] * explode, rest.y + o[1] * explode, rest.z + o[2] * explode)

      const revoke = feature?.id === 'revoke'
      const lit = revoke || feature?.part === name
      // the copper antenna is lost against the dark band, so it keeps a faint warm glow while exploded
      const base = name === 'Antenna' ? 0.35 * explode : 0
      part.traverse((m) => {
        if (!(m instanceof Mesh)) return
        const mat = m.material as MeshStandardMaterial
        if (ecoOn > 0.01 && name === 'Shell') {
          mat.emissive.copy(modeGlow)
          mat.emissiveIntensity = MathUtils.damp(mat.emissiveIntensity, 0.07 * ecoOn, 6, dt)
          return
        }
        if (received > 0.01) {
          mat.emissive.copy(LIME)
          mat.emissiveIntensity = 0.5 * received
          return
        }
        mat.emissive.copy(lit ? (revoke ? CORAL : GLOW) : COPPER)
        mat.emissiveIntensity = MathUtils.damp(mat.emissiveIntensity, lit ? (revoke ? 0.25 : 0.55) : base, 8, dt)
      })
    }
  })
  return null
}
