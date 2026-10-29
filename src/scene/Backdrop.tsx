import { useFrame } from '@react-three/fiber'
import { anchors, ecoAt, lift, SPEC, SPEC_WATER, scrollState, smoothstep, specRise, specWaterline, TAP, tapPlace } from './scrollState'

/**
 * Moves the DOM layers that sit under the canvas (an opaque section background would hide
 * the ring), keeping each one with its section.
 */
export function Backdrop() {
  useFrame(() => {
    // hero wordmark: letters drift apart as the ring turns face-on, then it leaves with the hero
    const word = anchors.heroWord
    if (word) {
      const p = scrollState.hero
      word.style.letterSpacing = `${-0.06 + p * 0.12}em`
      word.style.opacity = `${1 - p * 0.6}`
      word.style.transform = `translateY(${-scrollState.tapEnter * window.innerHeight}px)`
      word.style.visibility = scrollState.tapEnter > 0.999 ? 'hidden' : ''
    }
    // specs water: rises to the waterline in the water act, leaves upward with the section
    const water = anchors.specWater
    if (water) {
      const on = scrollState.specEnter > 0.99 && scrollState.specExit < 0.999
      const top = 1 - specRise(scrollState.spec) * (1 - specWaterline())
      const up = lift(scrollState.spec, scrollState.specExit)
      water.style.top = `${(top - up) * window.innerHeight - SPEC_WATER.band}px`
      // down to the section's bottom edge (below the risen frame), so it leaves with it
      water.style.height = `${(1 - top + up - scrollState.specExit) * window.innerHeight + SPEC_WATER.band}px`
      water.style.visibility = on && scrollState.spec > SPEC.water - 0.07 ? '' : 'hidden'
    }
    // tap to pay place names: one viewport per place, easing over at the end of each tap
    const words = anchors.tapWords
    if (words) {
      const { i, sub } = tapPlace(scrollState.tap)
      const x = (i + smoothstep(0.88, 1, sub) * (i < TAP.places - 1 ? 1 : 0)) * window.innerWidth
      // rises in with the section, leaves upward with it
      const y = (1 - smoothstep(0.4, 1, scrollState.tapEnter)) * window.innerHeight * 0.5 - lift(scrollState.tap, scrollState.tapExit) * window.innerHeight
      words.style.transform = `translate(${-x}px, ${y}px)`
      words.style.opacity = `${smoothstep(0.4, 1, scrollState.tapEnter)}`
      words.style.visibility = scrollState.tapEnter > 0.01 && scrollState.tapExit < 0.999 ? '' : 'hidden'
    }
    // order: the stage card's fill follows its DOM card
    const card = anchors.orderCard
    const stage = anchors.orderStage
    if (card && stage) {
      const on = scrollState.orderEnter > 0.001 && scrollState.orderExit < 0.999
      if (on) {
        const r = stage.getBoundingClientRect()
        Object.assign(card.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` })
      }
      card.style.visibility = on ? '' : 'hidden'
    }
    // ecosystem: the tints and words come in with the section and leave upward with it; inside,
    // the next mode's tint wipes in from the right as its word slides over
    const back = anchors.ecoBack
    if (back) {
      const on = scrollState.ecoEnter > 0.001 && scrollState.ecoExit < 0.999
      if (on) {
        const H = window.innerHeight
        const at = ecoAt(scrollState.eco)
        back.style.transform = `translateY(${((1 - scrollState.ecoEnter) - scrollState.ecoExit) * H}px)`
        const layers = Array.from(back.children) as HTMLElement[]
        const words = layers.pop()!
        layers.forEach((tint, k) => (tint.style.clipPath = `inset(0 0 0 ${Math.min(1, Math.max(0, k - at)) * 100}%)`))
        words.style.transform = `translateX(${-at * window.innerWidth}px)`
      }
      back.style.visibility = on ? '' : 'hidden'
    }
  })
  return null
}
