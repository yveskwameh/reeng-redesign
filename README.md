# Reeng — website redesign

The reeng.xyz site rebuilt on a light, white-dominant theme. One real-time 3D ring is carried through every section of the home page by scroll: it taps a terminal, becomes a portal for coins, comes apart to show its security layers, drops into water, and lands as the "o" in the closing headline.

**Stack:** React 19, Vite, TypeScript, Tailwind v4, GSAP ScrollTrigger with Lenis smooth scroll, React Router, and three.js through React Three Fiber and drei.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check, then production build into dist/
npm run preview    # serve the production build
npm run lint       # oxlint
```

To review on a phone on the same network, start the dev server with `--host` and open the network address it prints:

```bash
npm run dev -- --port 5174 --host
```

`vite.config.ts` also allows ngrok tunnels, for reviewing away from the local network.

## Pages

| Route | Page |
|---|---|
| `/` | Home: the scroll-driven story (`src/pages/Home.tsx`) |
| `/checkout` | Order summary; Stripe Embedded Checkout mounts here once the client's account exists |
| `/order/success` | Order confirmation |
| `/privacy-policy`, `/terms-of-service` | Legal text, migrated from reeng.xyz |
| anything else | 404 |

## Project layout

| Path | What |
|---|---|
| `src/sections/` | One file per home page section, in page order: Hero, TapToPay, CrossChain, HowItWorks, Security, PayByEmail, Specs, Order, Compare, Ecosystem, Faq, FinalCta |
| `src/scene/` | The single 3D canvas fixed behind the page (`Scene.tsx`) and everything in it: the ring and its poses (`RingRig.tsx`), terminal, coins, envelope, water, comparison models |
| `src/scene/scrollState.ts` | Shared scroll progress, section timings and DOM anchors that the page and the 3D both read |
| `src/scene/quality.ts` | How hard the 3D works on this device (resolution, anti-aliasing, shadow size) |
| `src/components/` | Nav, footer, scrollbar, and pieces shared by several sections |
| `src/content/` | All copy and product data (see below) |
| `src/lib/` | Scroll tracking, reveal animations, smooth scroll |
| `public/models/reeng_ring.glb` | The ring model (Draco-compressed, 80 KB); decoder self-hosted in `public/draco/` |
| `3d/` | Blender source and build script for the ring |
| `research/` | Site audit, design direction, product facts, performance research |

## Editing content

Everything a client might change lives in `src/content/`, not in the components:

| File | Holds |
|---|---|
| `product.ts` | Prices, finishes, sizes, specs, shipping, social links. Values marked `// assumed` are placeholders awaiting the client |
| `faq.ts` | FAQ topics, questions and answers (several answers are built from `product.ts`) |
| `legal.ts` | Privacy Policy, Terms of Service and the support email |
| `places.ts` | The places Tap to pay walks through; the section grows with each one added |
| `chains.ts` | The coins and chains in the cross-chain section; the first three fly through the tunnel |
| `compare.ts`, `ecosystem.ts`, `sizing.ts` | The comparison table, the ring's modes, ring sizes |

## How the scroll choreography works

- **Pinned sections.** Each scroll-driven section is a tall `<section>` with a `.sticky` frame inside. `trackSection()` (`src/lib/trackSection.ts`) writes its enter, progress and exit (each 0 to 1) into `scrollState`. Pass `{ drift: true }` and the frame also rises very slightly (2.5% of the screen) while it's held, so scrolling always looks like forward motion.
- **One 3D scene.** Sections don't mount their own canvases. The 3D reads `scrollState` every frame and poses itself. Objects placed in world space for a section rise with it through `lift(progress, exit)`; objects placed over DOM elements read the element's position from `anchors` instead.
- **Layers behind the 3D.** Some DOM sits under the transparent canvas (the hero's REENG wordmark, Tap to pay's place names, the Ecosystem tints, the Specs water). Those live in `Scene.tsx` and are moved by `Backdrop.tsx`.
- **Reveals.** `reveal()` (`src/lib/reveal.ts`) fades and lifts each component (headings, text, lists, anything marked `data-reveal`) in as it crosses the bottom of the screen, eased so it never pops.
- **Keep pinned sections short.** One clear demonstration per section, roughly 200–250svh, unless each stop adds new information.

## Performance rules

- **Page code must not import `three` at runtime.** The 3D is lazy-loaded after the page appears; a single `import { MathUtils } from 'three'` in a section pulls all of three.js (about 600 KB) into the main bundle. Use the helpers in `scrollState.ts` (`smoothstep`, `clamp01`), and `import type` for types.
- **The canvas adapts.** Resolution is capped at 1.75×, starts at 1× on weak devices and is tuned live by drei's `PerformanceMonitor` (`Scene.tsx`, `quality.ts`).
- **Avoid materials that render the scene twice.** Transmission (glass) materials and extra shadow passes are the most expensive things on low-end GPUs.
- More detail and measurements in `research/PERFORMANCE.md`.

## Rebuilding the ring model

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b -P 3d/build_ring.py
```

Then copy `3d/reeng_ring.glb` to `public/models/`. Its parts are named (Shell, Liner, Antenna, SecureChip) so the security section can move them separately.
