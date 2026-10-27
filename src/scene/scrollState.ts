import type { Object3D } from 'three'

// Shared, mutable scroll progress (0–1). Sections write it from ScrollTrigger;
// the 3D scene reads it every frame. Plain object on purpose: no React re-renders.
export const scrollState = {
  /** inside the pinned hero: 0 floating turntable → 1 face-on around the tagline */
  hero: 0,
  /** hero → tap section: ring leaves the hero and the terminal rises in */
  tapEnter: 0,
  /** inside the pinned tap section: hover → tap → paid */
  tap: 0,
  /** tap section unpinning: terminal scrolls away with the page */
  tapExit: 0,
  /** tap → cross-chain: ring lifts off the terminal and becomes the gate of the tunnel */
  crossEnter: 0,
  /** inside the pinned cross-chain section: coins come through one by one → settled */
  cross: 0,
  /** cross-chain section unpinning: ring and coins scroll away */
  crossExit: 0,
  /** cross-chain → how it works: page turns to paper, phone rises in */
  howEnter: 0,
  /** inside the pinned how-it-works section: pair → fund → tap */
  how: 0,
  /** how-it-works unpinning */
  howExit: 0,
  /** how it works → security: ring tilts toward us and comes apart */
  secEnter: 0,
  /** inside the pinned security section: explode, then one feature at a time */
  sec: 0,
  /** security unpinning */
  secExit: 0,
  /** security → pay by email: ring reassembles and stands up as the receiver */
  mailEnter: 0,
  /** inside the pinned email section: arrive → open → coins to ring → alias burns */
  mail: 0,
  /** email section unpinning */
  mailExit: 0,
  /** pay by email → specs: page turns to paper, ring goes face-on */
  specEnter: 0,
  /** inside the pinned specs section: front view → side view → water */
  spec: 0,
  /** specs unpinning */
  specExit: 0,
  /** specs → order: ring settles into the configurator */
  orderEnter: 0,
  /** order section unpinning */
  orderExit: 0,
  /** compare → ecosystem: page turns to paper, ring centres for the mode switch */
  ecoEnter: 0,
  /** inside the pinned ecosystem section: pay → id → events */
  eco: 0,
  /** ecosystem unpinning */
  ecoExit: 0,
  /** faq → final call to action: the ring flies back in for its closing pose */
  ctaEnter: 0,
  /** final call to action scrolling off (into the footer) */
  ctaExit: 0,
}

/** Ecosystem: three equal mode segments. */
export const ECO_MODES = 3
export const ecoMode = (p: number) => Math.min(ECO_MODES - 1, Math.floor(p * ECO_MODES))
export const ecoModeMid = (i: number) => (i + 0.5) / ECO_MODES

/** The configurator's current choice, mirrored here so the 3D ring can follow it. */
export const config = { finish: '#050506', size: 9, heroFinish: '#050506' }

/**
 * Hero tap-to-pay, shared between the DOM and the ring: when the last tap landed (s, on the
 * performance clock), where the ring is on screen (for the ripple), and the floor height
 * under it (for the shadow).
 */
export const heroFx = { tapAt: -10, x: 0, y: 0, floorY: -1 }
/** How it works: the tip of the drawn path the ring rides, in px from the pinned frame's top-left. */
export const howFx = { x: 0, y: 0 }
export type PartName = 'Shell' | 'Liner' | 'Antenna' | 'SecureChip'
/** Security: where the ring's centre and each part's callout point are on screen, in viewport px. */
export const secFx: Record<'Center' | PartName, { x: number; y: number }> = {
  Center: { x: 0, y: 0 },
  Shell: { x: 0, y: 0 },
  Liner: { x: 0, y: 0 },
  Antenna: { x: 0, y: 0 },
  SecureChip: { x: 0, y: 0 },
}

export type ScrollKey = keyof typeof scrollState

/** Scene objects other parts of the scene aim at (set by the owning component). */
export const anchors: {
  contactless: Object3D | null
  backdrop: HTMLDivElement | null
  ringParts: Record<string, Object3D>
  ring: Object3D | null
  compareSlots: (HTMLElement | null)[]
  heroDial: HTMLElement | null
  heroWord: HTMLElement | null
  tapWords: HTMLElement | null
} = {
  tapWords: null, // tap to pay's sliding place names under the canvas, moved by Backdrop
  heroWord: null, // the giant REENG under the canvas, moved by Backdrop
  heroDial: null, // the hero's degree readout, written by RingRig
  compareSlots: [], // compare table header cells the small 3D models sit behind
  ring: null, // the main ring's rig group (actual, damped pose)
  contactless: null,
  backdrop: null, // the canvas wrapper, recoloured for paper sections
  ringParts: {}, // Shell, Liner, Antenna, SecureChip of the main ring
}

/**
 * Security features, in scroll order. `part` is the ring part that lights up
 * (null = the whole ring, used for revoke).
 */
export const SECURITY = [
  { id: 'pin', title: 'PIN & access', body: 'Ask for a PIN on every tap, or never. Your call.', part: 'Antenna' },
  { id: 'limits', title: 'Spend limits', body: 'Cap what it can spend per tap and per day.', part: 'Shell' },
  { id: 'hours', title: 'Time locks', body: 'Only active on the days and hours you choose.', part: 'Liner' },
  { id: 'revoke', title: 'Instant revoke', body: 'Lost it? Switch the ring off from the app in a second.', part: null },
  { id: 'chip', title: 'Hardware encryption', body: 'Keys live in a secure chip. Payments are end-to-end encrypted.', part: 'SecureChip' },
] as const

/** Security timing: the ring explodes over the first `explode` of the section, then features share the rest. */
export const SEC = { explode: 0.15 } as const
/** Active feature index at progress `p` (-1 while the ring is still coming apart). */
export const secFeature = (p: number) =>
  p < SEC.explode ? -1 : Math.min(SECURITY.length - 1, Math.floor(((p - SEC.explode) / (1 - SEC.explode)) * SECURITY.length))

/**
 * Tap to pay walks through PLACES (content/places.ts), one tap per place. Within each place's
 * stretch of scroll (`sub`, 0–1): hover → touch at `touch` → paid at `paid` → the receipt
 * prints, then tears off before the next place.
 */
export const TAP = { touch: 0.35, paid: 0.55, places: 4 } as const
/** Which place (index) and how far through its tap (0–1) at section progress `p`. */
export const tapPlace = (p: number) => {
  const seg = Math.min(p, 0.9999) * TAP.places
  const i = Math.floor(seg)
  return { i, sub: seg - i }
}
/** Ring dip onto the reader: 0 → 1 approaching the touch, back to 0 as it lifts after paid. */
export const tapDip = (sub: number) => smoothstep(0.1, TAP.touch, sub) * (1 - smoothstep(TAP.paid + 0.1, 0.95, sub))
/** Receipt: prints out after paid, then tears off and flies away at the end of the place. */
export const tapPrint = (sub: number) => ({ out: smoothstep(TAP.paid, 0.85, sub), tear: smoothstep(0.88, 1, sub) })
/** Camera push toward the terminal around each tap (kept gentle so it still fits on screen). */
export const tapZoom = (sub: number) => smoothstep(0.12, 0.35, sub) * (1 - smoothstep(0.62, 0.9, sub))

/**
 * Cross-chain timing: coins rush out of the depth one after another, through the ring
 * (at travel 0.5) and off toward the ledger. `passed` = how far a coin must travel to count.
 */
export const CROSS = { coins: 6, start: 0.08, stagger: 0.13, travel: 0.22, passed: 0.55 } as const

/** 0 → 1 as coin `i` travels depth → through the ring → off toward the ledger. */
export const coinTravel = (i: number, p: number) =>
  Math.min(1, Math.max(0, (p - CROSS.start - i * CROSS.stagger) / CROSS.travel))

/** How it works: three equal steps. `howStep` is 0 pair, 1 fund, 2 tap. */
export const HOW = { steps: 3 } as const
export const howStep = (p: number) => Math.min(HOW.steps - 1, Math.floor(p * HOW.steps))

/** Pay-by-email timeline (fractions of the pinned section). */
export const MAIL = {
  arrive: [0, 0.2],
  open: [0.22, 0.32],
  coins: [0.34, 0.62], // three coins, staggered inside this window
  burn: [0.68, 0.9],
  leave: [0.9, 1],
  amount: 25,
} as const
export type MailPhase = 'incoming' | 'opened' | 'received' | 'burned'
export const mailPhase = (p: number): MailPhase =>
  p >= MAIL.burn[0] ? 'burned' : p >= MAIL.coins[1] - 0.04 ? 'received' : p >= MAIL.open[0] ? 'opened' : 'incoming'

/** Specs timeline: two acts — precision (paper) then water (ink). */
export const SPEC = {
  front: [0.03, 0.22], // face-on: inner diameter + thickness callouts
  side: [0.28, 0.44], // profile: width callout
  water: 0.5, // act two starts: backdrop back to ink, water fades in
  drop: [0.56, 0.7], // ring falls through the surface
  impact: 0.645, // when it breaks the surface (inside `drop`)
} as const
export const specAct = (p: number): 'precision' | 'water' => (p >= SPEC.water - 0.02 ? 'water' : 'precision')

// dev-only handle for inspecting scene state from the browser console
if (import.meta.env.DEV) Object.assign(window, { __reeng: { scrollState, anchors } })

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
