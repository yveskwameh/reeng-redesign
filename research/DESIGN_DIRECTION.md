# Design direction and ring sizing

## 1. The client's sizing document

`research/ring-sizing-A4.pdf` (preview: `ring-sizing-A4-preview.png`) is a one-page **printable ring sizer**, branded **reeng.id** (the sister networking-ring product). It contains:

1. **Calibration bar:** "Print at 100%, turn off Fit to page." A bar 85.6 mm wide must match the width of any bank card. That proves the printout is to scale.
2. **Cut-out strip:** a paper strip with an arrow tab and a scale marked **US 4–13**.
3. **Wrap:** wrap the strip snug around the base of the finger, numbers facing out, arrow end on top.
4. **Read:** your size is the number at the arrow's edge. *Between two sizes, pick the larger one.*

Each step is shown with a photoreal render: a card on the printout, scissors, the strip on a hand. It uses a warm paper and coral-red look.

**What this tells us:**
- The real size range is **US 4–13**. I updated `product.ts` and `PRODUCT_FACTS.md`, which previously assumed 6–13.
- The sizing tie-break rule: if you're between two sizes, pick the larger one.
- The brand already sizes by printable strip, so the site doesn't need to invent a process.

### US size reference (standard formula: inner diameter mm = 11.63 + 0.8128 × size)

| US | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 |
|---|---|---|---|---|---|---|---|---|---|---|
| Inner Ø (mm) | 14.9 | 15.7 | 16.5 | 17.3 | 18.1 | 18.9 | 19.8 | 20.6 | 21.4 | 22.2 |
| Circumference (mm) | 46.8 | 49.3 | 51.9 | 54.4 | 57.0 | 59.5 | 62.1 | 64.6 | 67.2 | 69.7 |

### How it goes on the site: "Find your size", visual first

**A. Inside the Order configurator (main entry point).** The size picker has a "Not sure? Find your size" link. When you pick a size, the 3D ring **resizes live** and shows its inner diameter in millimetres.

**B. A `/sizing` page, also opened as a drawer from the configurator, offering three ways to get your size:**

| Method | How it works | Visual |
|---|---|---|
| **1. Measure on screen** (no printer) | Hold a bank card against the screen and drag a slider until the outline matches it. That calibrates the screen to real millimetres. Then lay a ring you already own on the screen and resize a circle to fit its inside edge. The page shows "You're a US 9" | A live 3D ring sits inside the circle and scales with it |
| **2. Print the sizer** | Download a **reeng.xyz-branded** copy of the A4 sizer. The 4 steps are shown as short looping 3D clips instead of paragraphs | The 3D strip wraps a finger and the arrow lands on "9" |
| **3. Get a free sizing kit** | A checkbox at checkout. We ship the sizer first and the ring once you confirm | A 3D kit box |

**C. Smaller touches:**
- An FAQ entry: "How do I find my size?"
- The sizing rule as a hint under the picker: "Between two? Pick the larger one."
- A size chart (the table above), folded away behind "See all sizes".

**Needed from the client:** the source file of the A4 sizer (Figma, Illustrator, etc.) so we can rebrand it from reeng.id to Reeng. Otherwise we rebuild it ourselves as a print-accurate PDF or SVG.

---

## 2. Research summary (Pinterest and Dribbble, Oct 2026)

| Pattern seen | Examples | Use for Reeng? |
|---|---|---|
| Warm sand and beige "wellness" palette, nature photos | Oura and its many clones, "Pulse Ring", "Solstice Ring" | **No.** Every health ring looks like this, and Reeng is a fintech product |
| Dark crypto: neon purple, coins, rockets | Most "crypto landing page" shots | **No.** It reads as generic, even "scammy" |
| Dark premium hardware: near-black, one accent, monospaced technical labels, product as hero | Nothing-style pages, "neebo", "One ring — Any you" (Wimble) | **Yes, as the base** |
| Violet paired with an acid lime | "HYPE-X", "Black / Violet / Lime / White" boards | **Yes, as the accent system** |
| Huge editorial headlines | "NEURA", "HORIZON AI" | **Yes, for the 2–3 word headlines** |

**Takeaway:** stay out of both the wellness-ring look and the crypto look. **Position Reeng as precision hardware**: dark, ceramic, technical. Keep the existing violet so the brand stays recognisable.

---

## 3. Recommended style: "Precision Noir"

- **Mostly dark, with light "paper" breaks.** Near-black sections let the glossy ceramic ring catch light (it disappears on white). Every second or third section switches to warm paper `#F5F4F0` for rhythm. Paper also suits sizing and checkout, which should feel calm and practical.
- **The 3D ring is the main visual everywhere.** Copy stays short: a 2–4 word headline plus one sentence, about 12 words. Facts appear as **numbers and labels**, not paragraphs, for example `8 MM · 5 G · IP68 · 0 CHARGING`.
- **Technical details:** thin hairline dividers, small monospaced labels (`01 / TAP`), mm dimension callouts on the ring, and live-looking transaction readouts like `50.00 USDC · BASE · 0.8s`.
- **Motion with meaning:** an NFC pulse when the ring taps, a lime flash when a payment completes, and the ring splitting into layers in the security section. Everything respects the "reduce motion" setting.

### Colour palette

| Role | Name | Hex | Use |
|---|---|---|---|
| Base | Ink | `#0A0A0F` | Dark section backgrounds |
| Surface | Graphite | `#1A1A22` | Cards on dark |
| Secondary text | Steel | `#8A8A99` | Muted text on dark (5.8:1 contrast ✓) |
| Light base | Paper | `#F5F4F0` | Light sections, sizing, checkout |
| **Primary** | Reeng violet | `#9730F6` | Buttons and fills (white text on it: 5.2:1 ✓). **Not for small text on dark** (3.8:1 ✗) |
| Primary on dark | Violet glow | `#B57BFF` | Links, icons and highlights on dark (6.8:1 ✓) |
| Depth | Deep violet | `#3B1270` | Gradients and the 3D rim-light colour |
| **Accent** | Paid lime | `#C8FF4D` | **Only** for success: payment complete, "you're a US 9", checkmarks. Used on dark only (16.8:1) |
| Signal | Coral | `#FF5A4E` | Lock and revoke states and errors. It also echoes the coral of the sizing strip |

**Rule of thumb:** about 85% ink, graphite and paper, 12% violet, and at most 3% lime and coral.

### Typography

| Option | Display (headlines) | Body | Data and labels | Notes |
|---|---|---|---|---|
| **A, recommended** | **Unbounded** (wide, geometric; its round shapes echo the ring) | **Geist** | **Geist Mono** | All free and open-licensed (OFL) on Google Fonts, so we can host them ourselves. Clearly tech, and clearly a step up |
| B, continuity | Bricolage Grotesque (the current site font) | Geist | Geist Mono | Smallest change. The current font becomes headline-only |
| C, premium | Clash Display | Satoshi | Geist Mono | Free from Fontshare. A sleeker, more "luxury hardware" feel |

**Type scale (option A):**
- Display: 64–120 px, 700 weight, tight letter-spacing (−0.03em).
- Headings: 32–48 px.
- Body: 16–18 px Geist 400.
- Labels: 11–13 px Geist Mono, uppercase, +0.12em letter-spacing.

---

## 4. Sections stay the same, but show instead of tell

The section list in `RESEARCH.md` §4 stays as it is. The change is that each section leads with a visual:

| Section | Visual | Copy budget |
|---|---|---|
| Hero | Ring you can drag on ink, with violet rim light | "Your wallet, on your finger." plus a button |
| Tap to pay | Ring taps a 3D card terminal, an NFC ripple, then a **lime** "50.00 USDC ✓" | "Tap. Paid." |
| Cross-chain | 3D coins (USDT, cUSD) orbit the ring and come out as USDC | Coin logos plus one line |
| How it works | 3 numbered 3D clips | 3 × 3 words |
| Security | Exploded ring view with clickable hotspots | One label per hotspot |
| Email pay | 3D envelope that dissolves into particles | One line |
| Specs | Ring with mm dimension callouts plus mono stat chips | Numbers only |
| Order and **sizing** | Configurator where the ring resizes live, plus the "Find your size" drawer | Prices and sizes |
| Compare | Small rotating rings in a check-mark table | Check marks |
| FAQ | Plain list (the one text-heavy section) | — |

---

## 5. Decisions needed

1. **Typography:** A (Unbounded / Geist), B (keep Bricolage for headlines), or C (Clash / Satoshi)?
2. **Palette:** approve "Precision Noir" (dark base, violet primary, lime used only for success)?
3. **Sizer:** can the client send the source file, or should we rebuild it from scratch?
