# Reeng: working product facts

Each row is tagged **Confirmed** (stated on reeng.xyz) or **Assumed** (a placeholder chosen to be realistic for this kind of ring).
When we set up the project, this table becomes one file (`src/content/product.ts`), so changing a fact later is a one-line edit.

## Ring

| Fact | Value | Status |
|---|---|---|
| Name | Reeng | Confirmed |
| What it is | Wearable, non-custodial stablecoin wallet on Base | Confirmed |
| Price | **$20** | Confirmed by the client |
| Launch / early-bird price | **$15** for the first batch | Confirmed by the client |
| Finishes | **Onyx Black** (launch). Graphite and Pearl White are listed as "coming soon" | Assumed (black is the only finish shown) |
| Shell material | Zirconia ceramic, high-gloss | Assumed (matches the photos) |
| Inner liner | Medical-grade resin with "reeng" engraved inside | Assumed (the liner and engraving are visible in the renders) |
| Width / thickness | 8 mm / 2.4 mm | Assumed (measured from the photos) |
| Weight | about 5 g | Assumed |
| Sizes | US 4–13, whole sizes. Between two sizes, pick the larger one | Confirmed (from the client's printable sizer) |
| Chip | Passive NFC, 13.56 MHz (ISO 14443), secure element | Assumed (the site says "hardware-level encryption" and "no charging") |
| Battery | None, so it never needs charging | Confirmed |
| Water resistance | IP68, swim-safe | Assumed (the site says "water-resistant") |
| Warranty | 5 years | Confirmed |

## Wallet and app

| Fact | Value | Status |
|---|---|---|
| Coins accepted | USDC, USDT and cUSD on any chain | Confirmed |
| Settlement | Auto-bridged to USDC on Base | Confirmed |
| Custody | Non-custodial; private keys can be exported | Confirmed |
| Security controls | PIN on/off, spend limits, time locks, instant revoke | Confirmed |
| Email payments | Send and receive by email, with disposable aliases | Confirmed |
| Fees | No Reeng fees; network and third-party fees may apply | Confirmed |
| App | "Reeng app: coming soon to iOS & Android". There are **no store links**, because the app isn't published yet | Confirmed (it isn't in the stores) |
| Where it pays | Any ordinary contactless card terminal | Confirmed by the client (2026-10-26) |

## Commerce

| Fact | Value | Status |
|---|---|---|
| Shipping | Ships worldwide within 2–4 weeks. Free shipping on orders over $150 | Assumed |
| Returns | 30-day returns, unworn | Assumed |
| Payment methods | Card, Apple Pay, Google Pay, and USDC | Assumed (see the checkout plan) |

## Checkout plan (replacing the "I'm interested" waitlist)

**Use Stripe, with checkout embedded on our own `/checkout` page.** It fits the existing stack. The site is a static React/Vite app on Render, so the only new piece is one small server endpoint. That can be a Render web service or a single serverless function that creates the Checkout Session.

The flow:
1. The 3D configurator in the Order section collects the finish and size.
2. "Buy" sends the shopper to `/checkout` with the finish and size; the endpoint creates a Stripe Checkout Session from them.
3. Stripe Embedded Checkout handles payment: cards, Apple Pay, Google Pay, and **stablecoin (USDC) payments**. Paying in USDC suits the brand. *We need to verify Stripe's crypto-payment eligibility for the client's country and account when we set it up.*
4. The shopper lands on `/order/success`, which shows the 3D ring "unboxing" with order details.
5. A Stripe webhook records the order and sends the email receipt.
6. Ring size can't be known for sure up front, so the "Not sure of my size?" option adds a free sizing kit, and the ring ships once the size is confirmed.

What the client must provide: a Stripe account with products and prices set up, the shipping regions, and their tax settings.
The alternative, if they'd rather manage inventory and fulfilment in an admin panel, is Shopify headless (Storefront API) with the same React front end.
