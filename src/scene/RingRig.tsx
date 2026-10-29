import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Euler, MathUtils, Quaternion, Vector3, type Group } from 'three'
import { layout } from './layout'
import { Ring } from './Ring'
import { innerDiameter } from '../content/sizing'
import { pointer } from '../lib/pointer'
import { anchors, config, ecoLocal, ecoMode, ecoTap, heroFx, howFx, scrollState, smoothstep, SPEC, tapDip as placeDip, tapPlace } from './scrollState'

const RING_HALF_WIDTH = 0.4 // half the band width, in model units

const HERO_ROT = new Quaternion().setFromEuler(new Euler(1.15, 0, -0.35))
// hero: upright on a turntable, tipped back a touch; face-on (hole facing us) once scrolled
const STAND = new Quaternion().setFromEuler(new Euler(Math.PI / 2 - 0.12, 0, 0))
const FACE = new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0))
const RING_RADIUS = 1.19 // outer radius in model units
const heroPos = new Vector3()
const heroRot = new Quaternion()
const leanQ = new Quaternion()
const leanE = new Euler()
const onScreen = new Vector3()
// at the terminal the ring lies flat on the face, circling the contactless mark
const tapRot = new Quaternion()
// cross-chain portal: ring axis (model Y) pointing at the camera, hole facing us
const PORTAL_ROT = new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0))
const portalPos = new Vector3()
const portalRot = new Quaternion()
const portalSway = new Quaternion()
const swayE = new Euler()
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
      // in the configurator, only over the stage card
      if (inOrder && !anchors.orderStage?.contains(e.target as Node)) return
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
    // one tap per place: down onto the reader, paid, lift, next place
    const dip = placeDip(tapPlace(scrollState.tap).sub)

    // touch = lying flat on the face around the contactless mark; hover = lifted off it
    const a = anchors.contactless
    if (a) {
      a.getWorldPosition(touch)
      normal.set(0, 0, 1).applyQuaternion(a.getWorldQuaternion(anchorQ))
      tapRot.setFromUnitVectors(Y, normal) // ring axis (model Y) along the face normal
      touch.addScaledVector(normal, RING_HALF_WIDTH * L.tapScale + 0.01)
      hover.copy(touch).addScaledVector(normal, L.hoverLift).add(L.hoverOffset)
    }

    // hero: floats above its shadow on a slow turntable (drag to fling it); drifts a little
    // toward the cursor; a tap dips it to the floor. Scrolling turns it face-on and grows it
    // around the tagline, and switches all of that off.
    const d = drag.current
    if (!d.active) d.vel *= Math.pow(0.04, dt)
    const orderOn = smoothstep(0.2, 1, scrollState.orderEnter)
    const ctaOn = smoothstep(0.15, 1, scrollState.ctaEnter)
    const hp = MathUtils.smootherstep(scrollState.hero, 0, 1)
    const live = (1 - hp) * (1 - enter)
    d.spin += d.vel + dt * Math.max(0.25 * live, 0.35 * Math.max(orderOn, ctaOn))
    const fit = Math.min(1, state.viewport.aspect / 1.2) // narrow screens have less width to work with
    // portrait: the ring belongs in the open space above the headline. Raising it in the world
    // would put its floor at eye level (shadow seen edge-on), so the view shifts instead
    const portrait = fit < 1
    const baseY = portrait ? -0.3 : 0.15
    const shift = portrait ? 0.17 * state.size.height * live : 0
    if (shift > 0.5) state.camera.setViewOffset(state.size.width, state.size.height, 0, shift, state.size.width, state.size.height)
    else if (state.camera.view?.enabled) state.camera.clearViewOffset()

    const since = performance.now() / 1000 - heroFx.tapAt
    const tapDip = MathUtils.smoothstep(since < 0.12 ? since / 0.12 : Math.max(0, 1 - (since - 0.12) / 0.5), 0, 1) * live
    heroPos.set(pointer.x * 0.45 * fit * live, MathUtils.lerp(baseY, 0, hp) + Math.sin(t * 1.2) * 0.05 * live - 0.22 * tapDip, 0)
    spinQ.setFromAxisAngle(Y, d.spin * (1 - hp))
    leanQ.setFromEuler(leanE.set(-pointer.y * 0.1 * live + 0.25 * tapDip, 0, -pointer.x * 0.12 * live))
    heroRot.copy(spinQ).multiply(STAND).slerp(FACE, hp).premultiply(leanQ)
    const heroScale = MathUtils.lerp(0.6 * fit, 1.55 * Math.max(fit, 0.55), hp)
    heroFx.floorY = baseY - (RING_RADIUS + 0.4) * heroScale

    if (anchors.heroDial && live > 0.01) {
      const deg = ((((d.spin * 180) / Math.PI) % 360) + 360) % 360
      anchors.heroDial.textContent = `${String(Math.round(deg)).padStart(3, '0')}°`
    }

    // hero → hover over the terminal → touch its contactless mark
    pos.copy(heroPos).lerp(hover, enter).lerp(touch, dip)
    pos.y += Math.sin(t * 1.2) * 0.04 * enter * (1 - dip) // idle float while hovering
    let scale = MathUtils.lerp(heroScale, L.tapScale, enter)
    rot.copy(heroRot).slerp(tapRot, enter)

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

    // how it works: ride the tip of the path the section draws, turning slowly
    const how = smoothstep(0.2, 1, scrollState.howEnter)
    if (how > 0) {
      const { width: vw, height: vh } = state.viewport
      howPos.set((howFx.x / state.size.width - 0.5) * vw, -(howFx.y / state.size.height - 0.5) * vh, 0)
      howPos.y -= (1 - scrollState.howEnter) * vh // rises in with the section
      spinQ.setFromAxisAngle(Y, t * 0.8)
      howRot.copy(HERO_ROT).multiply(spinQ)
      pos.lerp(howPos, how)
      rot.slerp(howRot, how)
      scale = MathUtils.lerp(scale, state.viewport.aspect < 1 ? 0.12 : 0.26, how)
    }
    pos.y += scrollState.howExit * state.viewport.height

    // security: axis tilted toward us so the exploded layers stack visibly, chip facing front.
    // Wide screens: right of centre between the split title's words; below lg (the section's
    // own breakpoint): left, leaving room for the callout, growing a little on tablets
    const sec = smoothstep(0.2, 1, scrollState.secEnter)
    if (sec > 0) {
      const wideSec = state.size.width >= 1024
      const { width: vw, height: vh } = state.viewport
      secPos.set(wideSec ? vw * 0.1 : -vw * 0.2, wideSec ? -0.05 : vh * 0.11, 0)
      secPos.y += Math.sin(t * 1.1) * 0.03
      secRot.setFromEuler(secE.set(0.4, Math.PI + Math.sin(t * 0.5) * 0.2, 0))
      pos.lerp(secPos, sec)
      rot.slerp(secRot, sec)
      scale = MathUtils.lerp(scale, wideSec ? 0.32 : Math.min(0.3, 0.22 * (state.size.width / 375)), sec)
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
        dropPos.set(S.waterX, S.surface + S.lift - drop * (S.lift + S.sink) + Math.sin(t * 1.3) * 0.04 * drop, 0)
        specPos.lerp(dropPos, water)
      }
      pos.lerp(specPos, spec)
      rot.slerp(specRot, spec)
      scale = MathUtils.lerp(scale, MathUtils.lerp(S.ringScale, S.dropScale, water), spec)
    }
    pos.y += scrollState.specExit * state.viewport.height

    // order: the configurator ring — hero-style 3/4 pose you can spin, scaled to the chosen
    // size, posed over the stage card (it follows the card in and out, so no exit shift)
    const stage = anchors.orderStage
    if (orderOn > 0 && stage) {
      const r = stage.getBoundingClientRect()
      const { width: W, height: H } = state.size
      const k = r.height / H // the card's share of the screen: sizes below are card-relative
      const wideCard = r.width > r.height
      const phone = state.viewport.aspect < 1 // a short card between the title and the pill
      orderPos.set(((r.left + r.width / 2) / W - 0.5) * state.viewport.width, (0.5 - (r.top + r.height / 2) / H) * state.viewport.height, 0)
      orderPos.y += ((phone ? -0.04 : wideCard ? -0.1 : -0.15) + Math.sin(t * 1.2) * 0.03) * k
      spinQ.setFromAxisAngle(Y, d.spin)
      orderRot.copy(HERO_ROT).multiply(spinQ)
      pos.lerp(orderPos, orderOn)
      rot.slerp(orderRot, orderOn)
      // true-to-scale between sizes, relative to the US 9 the scene is modelled at
      const sizeFit = innerDiameter(config.size) / innerDiameter(9)
      scale = MathUtils.lerp(scale, (phone ? 0.36 : wideCard ? 0.5 : 0.42) * k * sizeFit, orderOn)
    }

    // ecosystem: in the slot over the giant word, a full turn as each mode comes in, dipping
    // toward the card on the tap (it follows the slot in and out, so no exit shift)
    const eco = smoothstep(0.2, 1, scrollState.ecoEnter)
    const slot = anchors.ecoSlot
    if (eco > 0 && slot) {
      const r = slot.getBoundingClientRect()
      const { width: W, height: H } = state.size
      const tap = ecoTap(scrollState.eco)
      const cx = r.left + r.width / 2 + 40 * tap
      const cy = r.top + r.height / 2 + 30 * tap
      ecoPos.set((cx / W - 0.5) * state.viewport.width, (0.5 - cy / H) * state.viewport.height + Math.sin(t * 1.2) * 0.02, 0)
      const mode = ecoMode(scrollState.eco)
      const turn = smoothstep(0, 0.25, ecoLocal(scrollState.eco)) + mode
      spinQ.setFromAxisAngle(Y, turn * Math.PI * 2 + t * 0.3)
      ecoRot.copy(HERO_ROT).multiply(spinQ)
      pos.lerp(ecoPos, eco)
      rot.slerp(ecoRot, eco)
      // the ring spans 65% of the slot
      scale = MathUtils.lerp(scale, (Math.min(r.width, r.height) * 0.65 * state.viewport.height) / H / (2 * RING_RADIUS), eco)
    }

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

    // where the ring is on screen, so the hero's payment ripple leaves from it
    onScreen.setFromMatrixPosition(g.matrixWorld).project(state.camera)
    heroFx.x = ((onScreen.x + 1) / 2) * state.size.width
    heroFx.y = ((1 - onScreen.y) / 2) * state.size.height
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
