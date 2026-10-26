import { Vector3 } from 'three'

/**
 * Where things sit, in world units, for the current viewport.
 * Wide screens put copy on the left and the terminal on the right;
 * narrow screens stack the terminal under the copy.
 */
export function layout(vw: number, vh: number) {
  const wide = vw / vh > 1.1
  const s = wide ? 1 : 0.72

  return {
    // portrait views are narrow in world units (vertical FOV is fixed), so the hero ring shrinks
    hero: { pos: new Vector3(0, 1.05, 0), scale: wide ? 0.6 : 0.3 },
    terminal: { pos: new Vector3(wide ? vw * 0.2 : 0, wide ? -0.45 : -1.1, 0), scale: s },
    // ring scale while over the terminal; hover/touch positions come from the contactless anchor
    // ring's outer edge just clears the contactless mark
    tapScale: 0.3 * s,
    // hover off the terminal's left edge, clear of the screen readout
    hoverLift: 0.6 * s,
    hoverOffset: new Vector3(-0.85 * s, 0.05 * s, 0),

    // cross-chain: ring stands upright as a portal; coins orbit it and stack beside it
    cross: wide
      ? {
          ring: new Vector3(vw * 0.17, 0.25, 0),
          ringScale: 0.5,
          orbit: 1.35,
          stack: new Vector3(vw * 0.17 + 1.15, -1.15, 0.6),
          coinScale: 1,
        }
      : {
          ring: new Vector3(0, -0.85, 0),
          ringScale: 0.3,
          orbit: 0.62,
          stack: new Vector3(0.5, -1.6, 0.6),
          coinScale: 0.7,
        },

    // how it works: phone on the right (below the copy on narrow screens), ring beside it
    how: wide
      ? {
          phone: new Vector3(vw * 0.18, -0.05, 0),
          phoneScale: 1,
          // ring keyframes: pair (held to the phone's edge), fund (floating), tap (out front, ready)
          ring: [new Vector3(vw * 0.18 - 0.62, 0.45, 0.25), new Vector3(vw * 0.18 - 0.95, -0.55, 0.3), new Vector3(vw * 0.18 - 1.4, -0.1, 0.5)],
          ringScale: [0.3, 0.32, 0.36],
        }
      : {
          phone: new Vector3(0.12, -1.0, 0),
          phoneScale: 0.62,
          ring: [new Vector3(-0.3, -0.5, 0.25), new Vector3(-0.55, -1.45, 0.3), new Vector3(-0.52, -1.5, 0.3)],
          ringScale: [0.2, 0.2, 0.2],
        },

    // security: exploded ring on the right (below the copy on narrow screens)
    sec: wide
      ? { ring: new Vector3(vw * 0.18, -0.05, 0), ringScale: 0.55 }
      : { ring: new Vector3(0, -1.2, 0), ringScale: 0.3 },

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
