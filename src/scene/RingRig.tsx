import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Euler, MathUtils, Quaternion, Vector3, type Group } from 'three'
import { layout } from './layout'
import { Ring } from './Ring'
import { innerDiameter } from '../content/sizing'
import { anchors, config, ECO_MODES, ecoMode, scrollState, smoothstep, SPEC, TAP } from './scrollState'

const RING_HALF_WIDTH = 0.4 // half the band width, in model units

const HERO_ROT = new Quaternion().setFromEuler(new Euler(1.15, 0, -0.35))
// at the terminal the ring lies flat on the face, circling the contactless mark
const tapRot = new Quaternion()
// cross-chain portal: ring axis (model Y) pointing at the camera, hole facing us
const PORTAL_ROT = new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0))
const portalPos = new Vector3()
const portalRot = new Quaternion()
const portalSway = new Quaternion()
const swayE = new Euler()
// how it works: band against the phone's edge while pairing, then a relaxed float
const PAIR_ROT = new Quaternion().setFromEuler(new Euler(0.2, 0.3, Math.PI / 2))
const FUND_ROT = new Quaternion().setFromEuler(new Euler(1.0, 0.2, -0.5))
const howPos = new Vector3()
const howRot = new Quaternion()
const secPos = new Vector3()
const secRot = new Quaternion()
const secE = new Euler()
const mailPos = new Vector3()
const mailRot = new Quaternion()
// specs: side profile = ring axis along screen X (slight turn so it still reads as a ring)
const SIDE_ROT = new Quaternion().setFromEuler(new Euler(0, 0.18, Math.PI / 2))
const specPos = new Vector3()
const specRot = new Quaternion()
const dropPos = new Vector3()
const tumble = new Quaternion()
const orderPos = new Vector3()
const orderRot = new Quaternion()
const ecoPos = new Vector3()
const ecoRot = new Quaternion()
const ctaPos = new Vector3()
const ctaRot = new Quaternion()

const pos = new Vector3()
const hover = new Vector3()
const touch = new Vector3()
const normal = new Vector3()
const anchorQ = new Quaternion()
const rot = new Quaternion()
const spinQ = new Quaternion()
const Y = new Vector3(0, 1, 0)

/** The one ring on the page, posed from scroll progress every frame. */
export function RingRig() {
  const ref = useRef<Group>(null)
  const drag = useRef({ active: false, lastX: 0, vel: 0, spin: 0 })

  // drag to spin in the hero and the configurator; inertia carries it after release
  useEffect(() => {
    const d = drag.current
    const down = (e: PointerEvent) => {
      const inOrder = scrollState.orderEnter > 0.95 && scrollState.orderExit < 0.05
      const inCta = scrollState.ctaEnter > 0.95 && scrollState.ctaExit < 0.3
      if (scrollState.tapEnter > 0.05 && !inOrder && !inCta) return
      if ((e.target as HTMLElement).closest('a,button,input,label,[role=dialog]')) return
      d.active = true
      d.lastX = e.clientX
    }
    const move = (e: PointerEvent) => {
      if (!d.active) return
      d.vel = (e.clientX - d.lastX) * 0.01
      d.lastX = e.clientX
    }
    const up = () => (d.active = false)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  useFrame((state, dt) => {
    const g = ref.current
    if (!g) return
    const L = layout(state.viewport.width, state.viewport.height)
    const t = state.clock.elapsedTime
    const enter = smoothstep(0, 1, scrollState.tapEnter)
    const p = scrollState.tap
    // 0 → 1 while approaching the touch, back to 0 as it lifts after "paid"
    const dip = smoothstep(0.1, TAP.touch, p) * (1 - smoothstep(TAP.paid + 0.1, 0.95, p))

    // touch = lying flat on the face around the contactless mark; hover = lifted off it
    const a = anchors.contactless
    if (a) {
      a.getWorldPosition(touch)
      normal.set(0, 0, 1).applyQuaternion(a.getWorldQuaternion(anchorQ))
      tapRot.setFromUnitVectors(Y, normal) // ring axis (model Y) along the face normal
      touch.addScaledVector(normal, RING_HALF_WIDTH * L.tapScale + 0.01)
      hover.copy(touch).addScaledVector(normal, L.hoverLift).add(L.hoverOffset)
    }

    // position: hero → hover → touch
    pos.copy(L.hero.pos).lerp(hover, enter).lerp(touch, dip)
    pos.y += Math.sin(t * 1.2) * 0.04 * (1 - dip) // idle float
    let scale = MathUtils.lerp(L.hero.scale, L.tapScale, enter)

    // rotation: idle spin + drag in the hero, settling into the tap pose
    const d = drag.current
    if (!d.active) d.vel *= Math.pow(0.04, dt)
    const orderOn = smoothstep(0.2, 1, scrollState.orderEnter)
    const ctaOn = smoothstep(0.15, 1, scrollState.ctaEnter)
    d.spin += d.vel + dt * 0.35 * Math.max(1 - enter, orderOn, ctaOn)
    spinQ.setFromAxisAngle(Y, d.spin * (1 - enter))
    rot.copy(HERO_ROT).multiply(spinQ).slerp(tapRot, enter)

    // cross-chain: lift off the terminal and stand upright as the portal, swaying slightly
    const cross = smoothstep(0, 1, scrollState.crossEnter)
    if (cross > 0) {
      portalPos.copy(L.cross.ring)
      portalPos.y += Math.sin(t * 1.2) * 0.03
      portalSway.setFromEuler(swayE.set(0, Math.sin(t * 0.7) * 0.18, 0))
      portalRot.copy(portalSway).multiply(PORTAL_ROT)
      pos.lerp(portalPos, cross)
      rot.slerp(portalRot, cross)
      scale = MathUtils.lerp(scale, L.cross.ringScale, cross)
    }
    pos.y += scrollState.crossExit * state.viewport.height // leave with the section

    // how it works: pair (held to the phone) → fund (floating) → tap (out front, ready)
    const how = smoothstep(0.2, 1, scrollState.howEnter)
    if (how > 0) {
      const H = L.how
      const hp = scrollState.how
      const k1 = smoothstep(0.28, 0.4, hp)
      const k2 = smoothstep(0.61, 0.73, hp)
      howPos.copy(H.ring[0]).lerp(H.ring[1], k1).lerp(H.ring[2], k2)
      howPos.y += Math.sin(t * 1.2) * 0.03
      const howScale = MathUtils.lerp(MathUtils.lerp(H.ringScale[0], H.ringScale[1], k1), H.ringScale[2], k2)
      howRot.copy(PAIR_ROT).slerp(FUND_ROT, k1).slerp(HERO_ROT, k2)
      spinQ.setFromAxisAngle(Y, t * 0.5 * k1) // slow turn once paired
      howRot.multiply(spinQ)
      pos.lerp(howPos, how)
      rot.slerp(howRot, how)
      scale = MathUtils.lerp(scale, howScale, how)
    }
    pos.y += scrollState.howExit * state.viewport.height

    // security: axis tilted toward us so the exploded layers stack visibly, chip facing front
    const sec = smoothstep(0.2, 1, scrollState.secEnter)
    if (sec > 0) {
      secPos.copy(L.sec.ring)
      secPos.y += Math.sin(t * 1.1) * 0.03
      secRot.setFromEuler(secE.set(0.62, Math.PI + Math.sin(t * 0.5) * 0.2, 0))
      pos.lerp(secPos, sec)
      rot.slerp(secRot, sec)
      scale = MathUtils.lerp(scale, L.sec.ringScale, sec)
    }
    pos.y += scrollState.secExit * state.viewport.height

    // pay by email: reassembled, standing upright beside the envelope to receive the coins
    const mail = smoothstep(0.2, 1, scrollState.mailEnter)
    if (mail > 0) {
      mailPos.copy(L.mail.ring)
      mailPos.y += Math.sin(t * 1.2) * 0.03
      mailRot.setFromEuler(secE.set(0, Math.sin(t * 0.7) * 0.2, 0)).multiply(PORTAL_ROT)
      pos.lerp(mailPos, mail)
      rot.slerp(mailRot, mail)
      scale = MathUtils.lerp(scale, L.mail.ringScale, mail)
    }
    pos.y += scrollState.mailExit * state.viewport.height

    // specs: face-on (diameter, thickness) → side profile (width) → dropped through the water
    const spec = smoothstep(0.2, 1, scrollState.specEnter)
    if (spec > 0) {
      const S = L.spec
      const sp = scrollState.spec
      const side = smoothstep(SPEC.front[1], SPEC.side[0], sp)
      const water = smoothstep(SPEC.water - 0.04, SPEC.drop[0], sp)
      const drop = smoothstep(SPEC.drop[0], SPEC.drop[1], sp)
      // held still for measuring; tumbling gently once it's in the water
      specRot.copy(PORTAL_ROT).slerp(SIDE_ROT, side)
      tumble.setFromEuler(secE.set(t * 0.4, t * 0.6, 0.3))
      specRot.slerp(tumble, water * 0.85)
      specPos.copy(S.ring)
      if (water > 0) {
        // above the surface, then falling through it and settling below
        dropPos.set(S.waterX, S.surface + S.lift - drop * (S.lift + S.sink) + Math.sin(t * 1.3) * 0.04 * drop, 0.2)
        specPos.lerp(dropPos, water)
      }
      pos.lerp(specPos, spec)
      rot.slerp(specRot, spec)
      scale = MathUtils.lerp(scale, MathUtils.lerp(S.ringScale, S.dropScale, water), spec)
    }
    pos.y += scrollState.specExit * state.viewport.height

    // order: the configurator ring — hero-style 3/4 pose you can spin, scaled to the chosen size
    if (orderOn > 0) {
      orderPos.copy(L.order.ring)
      orderPos.y += Math.sin(t * 1.2) * 0.03
      spinQ.setFromAxisAngle(Y, d.spin)
      orderRot.copy(HERO_ROT).multiply(spinQ)
      pos.lerp(orderPos, orderOn)
      rot.slerp(orderRot, orderOn)
      // true-to-scale between sizes, relative to the US 9 the scene is modelled at
      const sizeFit = innerDiameter(config.size) / innerDiameter(9)
      scale = MathUtils.lerp(scale, L.order.ringScale * sizeFit, orderOn)
    }
    pos.y += scrollState.orderExit * state.viewport.height

    // ecosystem: centred beside the mode card, a quick full turn on each mode change
    const eco = smoothstep(0.2, 1, scrollState.ecoEnter)
    if (eco > 0) {
      ecoPos.copy(L.eco.ring)
      ecoPos.y += Math.sin(t * 1.2) * 0.03
      // the turn follows scroll progress through each mode boundary
      const turn = smoothstep(0.42, 0.58, (scrollState.eco * ECO_MODES) % 1) + ecoMode(scrollState.eco)
      spinQ.setFromAxisAngle(Y, turn * Math.PI * 2 + t * 0.3)
      ecoRot.copy(HERO_ROT).multiply(spinQ)
      pos.lerp(ecoPos, eco)
      rot.slerp(ecoRot, eco)
      scale = MathUtils.lerp(scale, L.eco.ringScale, eco)
    }
    pos.y += scrollState.ecoExit * state.viewport.height

    // final call to action: flies up from below into a hero-style closing pose (draggable again)
    const cta = smoothstep(0.15, 1, scrollState.ctaEnter)
    if (cta > 0) {
      ctaPos.copy(L.cta.ring)
      ctaPos.y += Math.sin(t * 1.2) * 0.04 - (1 - cta) * state.viewport.height * 0.6
      spinQ.setFromAxisAngle(Y, d.spin)
      ctaRot.copy(HERO_ROT).multiply(spinQ)
      pos.lerp(ctaPos, cta)
      rot.slerp(ctaRot, cta)
      scale = MathUtils.lerp(scale, L.cta.ringScale, cta)
    }
    pos.y += scrollState.ctaExit * state.viewport.height

    // damp toward the target so scroll jumps never snap
    const k = 1 - Math.exp(-dt * 7)
    g.position.lerp(pos, k)
    g.quaternion.slerp(rot, k)
    g.scale.setScalar(MathUtils.lerp(g.scale.x, scale, k))
  })

  return (
    <group
      ref={(g) => {
        ref.current = g
        anchors.ring = g // spec callouts follow the ring's actual (damped) pose
      }}
      scale={0.6}
    >
      <Ring exposeParts />
    </group>
  )
}
