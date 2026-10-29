const W = 600
const H = 1280

const C = {
  ink: '#0A0A0F',
  graphite: '#1A1A22',
  line: '#2A2A34',
  steel: '#8A8A99',
  paper: '#F5F4F0',
  violet: '#9730F6',
  glow: '#B57BFF',
  lime: '#C8FF4D',
  coral: '#FF5A4E',
  base: '#0052FF',
}
const DISPLAY = '"Unbounded Variable", sans-serif'
const MONO = '"Geist Mono Variable", monospace'
const SANS = '"Geist Variable", sans-serif'

export type PhoneView =
  | { step: 'pair'; paired: boolean }
  | { step: 'fund'; balance: number }
  | { step: 'tap' }

/** Stable key so the canvas only redraws when what's on screen actually changes. */
export const viewKey = (v: PhoneView) =>
  v.step === 'pair' ? `pair-${v.paired}` : v.step === 'fund' ? `fund-${v.balance}` : 'tap'

/**
 * The (coming-soon) Reeng app, drawn to a canvas: a mock of each setup step.
 * Kept deliberately simple — it illustrates the flow, not a real app UI.
 */
export function createPhoneScreen() {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  let last: PhoneView = { step: 'pair', paired: false }

  const text = (s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'left') => {
    ctx.font = font
    ctx.fillStyle = color
    ctx.textAlign = align
    ctx.fillText(s, x, y)
  }
  const pill = (x: number, y: number, w: number, h: number, fill: string) => {
    ctx.fillStyle = fill
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, h / 2)
    ctx.fill()
  }
  const card = (y: number, h: number) => {
    ctx.fillStyle = C.graphite
    ctx.beginPath()
    ctx.roundRect(40, y, W - 80, h, 28)
    ctx.fill()
  }

  function chrome(title: string, step: number) {
    ctx.fillStyle = C.ink
    ctx.fillRect(0, 0, W, H)
    pill(W / 2 - 70, 28, 140, 36, '#000') // camera island
    text('9:41', 52, 58, `500 26px ${SANS}`, C.paper)
    text('reeng', 52, 150, `700 34px ${DISPLAY}`, C.paper)
    text(`STEP ${step} / 3`, W - 52, 148, `500 22px ${MONO}`, C.steel, 'right')
    text(title, 52, 250, `700 54px ${DISPLAY}`, C.paper)
  }

  function ringIcon(cx: number, cy: number, r: number, color: string) {
    ctx.strokeStyle = color
    ctx.lineWidth = r * 0.28
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  function draw(v: PhoneView) {
    last = v
    if (v.step === 'pair') {
      chrome('Pair', 1)
      const cy = 610
      // pulsing pairing rings
      for (let i = 3; i >= 1; i--) {
        ctx.globalAlpha = v.paired ? 0.12 : 0.08 * i
        ctx.fillStyle = v.paired ? C.lime : C.violet
        ctx.beginPath()
        ctx.arc(W / 2, cy, 90 + i * 55, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      ringIcon(W / 2, cy, 78, v.paired ? C.lime : C.glow)
      text(v.paired ? 'Paired' : 'Hold your ring', W / 2, 930, `700 44px ${DISPLAY}`, v.paired ? C.lime : C.paper, 'center')
      text(v.paired ? 'MY REENG · US 9' : 'NEAR THE TOP OF YOUR PHONE', W / 2, 985, `500 22px ${MONO}`, C.steel, 'center')
      pill(52, H - 170, W - 104, 96, v.paired ? C.violet : C.graphite)
      text(v.paired ? 'Continue' : 'Searching…', W / 2, H - 108, `500 30px ${SANS}`, v.paired ? '#fff' : C.steel, 'center')
    } else if (v.step === 'fund') {
      chrome('Fund', 2)
      card(300, 260)
      text('BALANCE', 84, 360, `500 22px ${MONO}`, C.steel)
      text(v.balance.toFixed(2), 84, 470, `700 76px ${DISPLAY}`, v.balance > 0 ? C.paper : C.steel)
      text('USDC', 84, 520, `500 24px ${MONO}`, C.steel)
      pill(W - 220, 470, 140, 50, C.base)
      text('BASE', W - 150, 504, `500 22px ${MONO}`, '#fff', 'center')

      text('YOUR ADDRESS', 52, 640, `500 22px ${MONO}`, C.steel)
      card(660, 90)
      text('0x7a3c…9f2c', 84, 718, `500 30px ${MONO}`, C.paper)
      text('COPY', W - 84, 718, `500 22px ${MONO}`, C.glow, 'right')

      text('INCOMING', 52, 830, `500 22px ${MONO}`, C.steel)
      const txs = [
        ['+50 USDT', 'Tron'],
        ['+50 cUSD', 'Celo'],
        ['+50 USDC', 'Polygon'],
      ] as const
      const shown = Math.min(txs.length, Math.round(v.balance / 50))
      txs.slice(0, shown).forEach(([amt, chain], i) => {
        const y = 880 + i * 100
        text(amt, 52, y, `500 30px ${SANS}`, C.paper)
        text(`${chain.toUpperCase()} → USDC`, 52, y + 38, `500 20px ${MONO}`, C.steel)
        text('✓', W - 52, y + 12, `500 32px ${SANS}`, C.lime, 'right')
      })
    } else {
      chrome('Tap', 3)
      const rows: [string, string, string][] = [
        ['PIN', 'On', C.lime],
        ['Daily limit', '$500', C.paper],
        ['Active hours', '08–22', C.paper],
        ['Lost ring', 'Revoke', C.coral],
      ]
      rows.forEach(([label, value, color], i) => {
        const y = 310 + i * 130
        card(y, 108)
        text(label, 84, y + 66, `500 30px ${SANS}`, C.paper)
        text(value, W - 84, y + 66, `500 28px ${MONO}`, color, 'right')
      })
      ringIcon(W / 2, 960, 56, C.glow)
      pill(52, H - 170, W - 104, 96, C.lime)
      text('Ready to tap', W / 2, H - 108, `500 30px ${SANS}`, C.ink, 'center')
    }
  }

  draw(last)
  document.fonts.ready.then(() => draw(last))

  return { canvas, draw }
}
