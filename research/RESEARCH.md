# Reeng redesign: research brief

Source: https://reeng.xyz (inspected 2026-10-26). Assets downloaded to `research/assets/`.

## 1. Product

**Reeng is a smart ring that works as a non-custodial stablecoin wallet on Base.**

- **Receive:** USDC, USDT or cUSD on any chain. It auto-bridges everything to USDC on Base.
- **Spend:** tap the ring to pay ("anywhere Reeng is accepted"). You don't need a phone or card.
- **Send by email:** send and receive stablecoins by email, using one-time, disposable email aliases.
- **Security:** optional PIN, spending limits, time locks (active days and hours), instant revoke from the app if the ring is lost, end-to-end encrypted payment requests, and exportable private keys.
- **Hardware:** water-resistant, no charging (passive NFC), 5-year warranty. The finish is glossy black. The renders show a small orange or copper inlay.
- **Companion app:** pairing, PIN and security settings, and management of multiple rings ("My work ring").
- **Purchase:** "Order Now" goes to `buy.reeng.xyz/I20VCQCZ4Z92Y2MFNA1H6I`. That is a separate page with a ring image and an **"I'm interested"** button, so it is a waitlist and not a real checkout. No price is shown anywhere.
- **Brand ecosystem:** the same brand (@wearreeng) also runs **reeng.id**, an NFC networking ring with digital business cards, team workspaces and CRM sync. It also runs **reeng.events**, ring-based event check-in.
- **Socials:** x.com/wearreeng, instagram.com/wearreeng, linkedin.com/company/wearreeng

## 2. Stack (to match)

| Layer | Detected |
|---|---|
| Framework | **React 19.2.0** single-page app |
| Build | **Vite**: hashed `/assets/index-*.js` ES module, empty `<div id="root">` |
| Routing | **React Router**, with three routes: `/`, `/privacy-policy`, `/terms-of-service` |
| Styling | **Tailwind CSS v4.1.16** |
| Animation | **GSAP + ScrollTrigger** |
| "3D" today | **None.** There is no Three.js or GLB file. The hero is a **71-frame WebP image sequence** (1920×1080, `static.reeng.xyz/sequence/sequence/Reeng0001-0071.webp`), drawn on a canvas and scrubbed by ScrollTrigger, with a loading provider |
| Fonts | Bricolage Grotesque, self-hosted TTFs: ExtraLight, Condensed Light/Medium/Bold, ExtraBold |
| Colors | Primary `#9730F6` (purple), `#000`, `#F8F8F8`, `#505050`, `#6B6B6B`, lavender tints `#F8F7FF` / `#F4F1FF` / `#FAF9FF` |
| Hosting | **Render** static site (`rndr-id` header) behind **Cloudflare**. Media CDN is `static.reeng.xyz` |
| Checkout | `buy.reeng.xyz` is a separate React/Vite app, also on Render |
| Analytics | None detected |
| SEO | Title and description meta, Open Graph and Twitter tags, JSON-LD `WebSite`, canonical URL |

**Redesign stack:** the same React 19, Vite, Tailwind v4, GSAP/ScrollTrigger and React Router, with these additions for real 3D:
- `three`, `@react-three/fiber` v9 (React 19 compatible) and `@react-three/drei`
- `@react-three/postprocessing` for bloom on the purple light and for reflections
- Optional: `lenis` for smooth scroll, synced to ScrollTrigger

## 3. Current sections (in order)

1. **Hero:** a scroll-scrubbed ring spin with only the word "SCROLL". It has no headline, no navigation and no call to action.
2. **Reeng Features:** three cards:
   - Cross-Chain Stablecoin Support, with a coin render and "Order Now"
   - Advanced Security, with an app screenshot
   - Tap to Spend, with phone and ring mockups
3. **Security Features:** three icon cards: PIN & Access Control, Smart Time Locks, Hardware-Level Encryption.
4. **Private Email Transactions:** a lifestyle photo next to a "Receive Crypto with Email" phone mockup.
5. **Built to Last. Designed for Life.:** the ring splashing in water, with "Order Now".
6. **Lifestyle banner:** the ring on wooden blocks with three badges: Premium First Impression, Minimal & Space-Friendly, Secure & Protective.
7. **FAQ:** six questions.
8. **Footer:** large logo, legal disclaimer, socials, © 2026, and a ring image in the corner.

### Problems
- The hero tells you nothing about the product, has no call to action, and the image sequence is a fixed video, so you can't interact with it.
- The site has no navigation or header menu, and no sticky "Order" button.
- **Price, sizes, finishes and release date are missing.** These are the biggest conversion gaps.
- There is no "How it works" flow (receive, auto-bridge, tap, done).
- "Where can I use it?" is vague: "anywhere Reeng is accepted". We need to know whether it works on Visa or Mastercard POS terminals.
- There are no app download links or app walkthrough, no specs, no sizing guide, no social proof or press, and no comparison with cards or other rings.
- The ecosystem (Reeng ID, Events) isn't mentioned.
- "Order Now" leads to a bare waitlist page that has no explanation and no email field visible up front.
- The images are heavy: `hero_image.svg` is 5 MB because it embeds a 4K raster, and the footer PNG is 5016px wide.

## 4. Proposed sections (3D throughout)

One persistent R3F `<Canvas>`, fixed behind the page, holds a single ring model. GSAP ScrollTrigger moves the camera, ring pose and material for each section, so the ring "travels" through the story instead of each section loading its own model.

| # | Section | 3D use |
|---|---|---|
| 0 | **Nav + sticky Order button:** logo, How it works, Security, Specs, FAQ, Order | – |
| 1 | **Hero:** headline ("Your wallet, on your finger."), sub-line, Order and Watch buttons | Real-time ring, slowly rotating, that you can drag. Light sweeps over it, there's a soft purple rim light, and it follows the cursor (parallax) |
| 2 | **Tap to Pay:** the core moment | Scroll-driven: the ring moves to a 3D POS terminal, an NFC pulse ripples out, and a "✓ 50 USDC" particle burst plays |
| 3 | **Any coin in, USDC out:** cross-chain | 3D USDT, cUSD and USDC coins orbit the ring, get pulled in and come out as USDC on a Base-blue ring path |
| 4 | **How it works:** 3 steps (Pair, Fund, Tap) | The ring docks beside a 3D phone with the app UI on screen as a texture; each step changes the screen |
| 5 | **Security vault:** PIN, limits, time locks, revoke, encryption, non-custodial keys | Exploded view: the ring splits into layers (shell, antenna, secure chip). Hotspots open each feature, and a lock or shield glows on the chip |
| 6 | **Email payments:** privacy | 3D envelope with coins; the alias "burns" into particles |
| 7 | **Built to last / Specs:** water-resistant, no charging, 5-year warranty, material, weight, sizes | Ring underwater with a refraction shader, plus a 360° spec viewer with dimension callouts |
| 8 | **Configurator / Order:** finish, size, price | Live material swap (black, silver, gold, ceramic), a size picker that scales the ring, and an engraving preview |
| 9 | **Compare:** Reeng vs card vs phone wallet vs other rings | Small rotating models in the column headers |
| 10 | **Ecosystem:** Reeng ID (networking), Reeng Events (check-in) | The ring switches "modes" and the glow color changes |
| 11 | **Social proof / press / community** | – |
| 12 | **FAQ:** expanded to cover shipping, sizing, chains, compatibility and returns | Small idle ring |
| 13 | **Final call to action + footer** | The ring settles into a closing pose |

**Custom imagery:** all new visuals (coins, POS terminal, phone, envelope, lifestyle hero stills) are rendered from the same 3D scene, so lighting and style match. We keep the real photos (`lifestyle_DSC2554`, `reeng_water`) as backgrounds or for authenticity.

**Performance and accessibility:**
- Compress the GLB with Draco and KTX2.
- Use `<Suspense>` with a poster image.
- Lower the device pixel ratio and post-processing on mobile.
- Honor `prefers-reduced-motion`.
- Keep the existing 71-frame sequence as the fallback when WebGL isn't available.

## 5. Assets

**Available, in `research/assets/`:**
- Logos: header SVG, full PNG 3487×1124, white WebP, and favicon
- Product and feature images, the lifestyle photo, the water splash, the OG image, and sample sequence frames 0001, 0036 and 0071
- Social icons

**What we still need:**
1. **A 3D ring model (the main blocker).** No GLB or CAD file is on the site. Options, best first:
   - (a) Ask Reeng for the manufacturing CAD (STEP or OBJ).
   - (b) Model it in Blender from the photos and sequence frames: a beveled band, a glossy black ceramic material and the copper inlay.
   - (c) Commission it.
2. Product facts: price, finishes, size range (US 6–13?), material, weight and width, chip and NFC standard, water rating (IP68?), and which POS terminals or merchants accept it.
3. App Store and Play Store links, and real app screenshots, for the phone textures.
4. Launch or shipping date, regions, shipping and returns.
5. A decision on checkout: keep the `buy.reeng.xyz` waitlist, or build a real checkout (Shopify Buy SDK, Stripe, or crypto checkout).
6. Testimonials, press, partners and waitlist count.
7. Brand guidelines, or confirmation that we keep purple `#9730F6` and Bricolage Grotesque.

## 6. Market context

- **Tangem Ring:** a self-custody hardware wallet ring made of ceramic, with no battery. It's priced around $128–160 and launched without payments.
- **HyperRing:** a Visa and Mastercard tap-to-pay ring with crypto "on the roadmap".
- **Orukka:** a card-linked payment ring with Binance and Coinbase top-ups.
- **Arculus (CompoSecure):** an on-chain tap-to-pay card, not a ring.

**Reeng's angle:** it is the stablecoin-native, non-custodial ring that combines spending, email payments and a deep security model. The site should say that explicitly and show it in a comparison table.
