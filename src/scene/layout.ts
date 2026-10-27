import { Vector3 } from 'three'

/**
 * Where things sit, in world units, for the current viewport.
 * (The hero ring is posed in RingRig.) Wide screens put copy on the left and the terminal on the right;
 * narrow screens stack the terminal under the copy.
 */
export function layout(vw: number, vh: number) {
  const wide = vw / vh > 1.1
  const s = wide ? 1 : 0.72

  return {
    terminal: { pos: new Vector3(wide ? vw * 0.2 : 0, wide ? -0.75 : -1.1, 0), scale: s * 0.9 },
    // ring scale while over the terminal; hover/touch positions come from the contactless anchor
    // ring's outer edge just clears the contactless mark
    tapScale: 0.3 * s,
    // hover off the terminal's left edge, clear of the screen readout
    hoverLift: 0.6 * s,
    hoverOffset: new Vector3(-0.85 * s, 0.05 * s, 0),

    cross: wide ? crossBeside(vw) : { ring: new Vector3(0, 0.12, 0), ringScale: 0.34, exit: new Vector3(vw * 0.1, -vh * 0.3, 1.2) },

    // pay by email: envelope in the middle-right, ring (the receiver) to its right
    mail: wide
      ? { envelope: new Vector3(vw * 0.13, -0.15, 0), envScale: 1, ring: new Vector3(vw * 0.13 + 1.55, 0.35, 0), ringScale: 0.3 }
      : { envelope: new Vector3(-0.25, -1.25, 0), envScale: 0.55, ring: new Vector3(0.62, -1.2, 0), ringScale: 0.16 },

    // specs: big ring for the dimension callouts, then a water surface it drops through
    spec: wide
      ? { ring: new Vector3(vw * 0.17, 0.1, 0), ringScale: 0.72, surface: -0.35, dropScale: 0.45, waterX: vw * 0.17, lift: 1.3, sink: 0.8, leader: true }
      : // narrow: smaller ring below the chips; no thickness leader (it would run off-screen; the chip says it)
        { ring: new Vector3(0, -1.28, 0), ringScale: 0.32, surface: -1.05, dropScale: 0.28, waterX: 0, lift: 0.8, sink: 0.5, leader: false },

    // order: configurator ring on the right; on narrow screens it sits in a gap under the heading
    order: wide ? { ring: new Vector3(vw * 0.18, 0.05, 0), ringScale: 0.62 } : { ring: new Vector3(0, 0.25, 0), ringScale: 0.3 },

    // ecosystem: ring + the card showing what a tap opens, side by side
    eco: wide
      ? { ring: new Vector3(vw * 0.1, 0.05, 0), ringScale: 0.45, card: new Vector3(vw * 0.1 + 1.45, 0, 0.2), cardScale: 1 }
      : { ring: new Vector3(-0.45, -1.15, 0), ringScale: 0.24, card: new Vector3(0.38, -1.15, 0.2), cardScale: 0.55 },

    // final call to action: the ring back centre stage, above the closing headline
    cta: { ring: new Vector3(0, wide ? 1.05 : 1.0, 0), ringScale: wide ? 0.58 : 0.34 },
  }
}

export type Layout = ReturnType<typeof layout>

// Cross-chain copy and card, in px (they're laid out by CSS; see sections/CrossChain.tsx)
const CONTAINER = 1280 // max-w-7xl
const PAD = 32 // md:px-8
const HEAD_W = 384 + 24 // max-w-sm headline column + gap
const HEAD_BOTTOM = 400 // where the subline ends, from the top of the screen
const CARD_W = 384 + 40 // w-96 + gap
/** How far the faint tunnel reaches from the ring centre, per unit of ring scale. */
const TUNNEL_REACH = 1.6

/**
 * Cross-chain on wide screens: the ring hangs face-on in a tunnel that never runs under the
 * copy or the converter card. It goes in the gap between headline and card when that gap
 * is roomy, otherwise in the space under the headline. Coins leave toward the card's
 * "You hold" panel.
 */
function crossBeside(vw: number) {
  const W = window.innerWidth
  const H = window.innerHeight
  const k = W / vw // px per world unit
  const inset = PAD + Math.max(0, (W - CONTAINER) / 2)
  const headR = inset + HEAD_W
  const cardL = W - inset - CARD_W
  const besideR = Math.min((cardL - headR) / 2, H * 0.38)
  const below = { w: cardL - inset, h: H - HEAD_BOTTOM - 24 }
  const useBeside = besideR >= 150
  const reach = useBeside ? besideR : Math.min(below.w / 2, below.h * 0.45)
  const ringScale = Math.min(0.62, reach / (TUNNEL_REACH * k))
  const px = useBeside ? (headR + cardL) / 2 : inset + below.w / 2
  const py = useBeside ? H / 2 : HEAD_BOTTOM + 12 + below.h / 2
  const ring = new Vector3((px / W - 0.5) * vw, -(py / H - 0.5) * (H / k), 0)
  // toward the "You hold" panel: card centre, a little below the middle
  const tx = ((W - inset - CARD_W / 2) / W - 0.5) * vw
  const ty = -(H * 0.62 / H - 0.5) * (H / k)
  return { ring, ringScale, exit: new Vector3(tx - ring.x, ty - ring.y, 1.2) }
}
