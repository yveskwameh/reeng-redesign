import { CanvasTexture, SRGBColorSpace } from 'three'
import { modes } from '../content/ecosystem'

const W = 480
const H = 600
export const MODE_CARD_ASPECT = W / H

const DISPLAY = '"Unbounded Variable", sans-serif'
const MONO = '"Geist Mono Variable", monospace'
const SANS = '"Geist Variable", sans-serif'

/**
 * What the other side sees after a tap, one card per mode: a payment receipt (Pay),
 * a contact profile (Reeng ID) and an event pass (Reeng Events). Sample data is fictional.
 */
export function createModeCards() {
  return modes.map((mode) => {
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    tex.anisotropy = 4

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

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      ctx.save()
      // clip everything (incl. the accent strip) to the card's rounded shape
      ctx.beginPath()
      ctx.roundRect(0, 0, W, H, 36)
      ctx.clip()
      ctx.fillStyle = '#0A0A0F'
      ctx.fillRect(0, 0, W, H)
      // accent strip
      ctx.fillStyle = mode.glow
      ctx.fillRect(0, 0, W, 10)
      text(mode.product.toUpperCase(), 40, 72, `500 20px ${MONO}`, mode.glow)

      if (mode.id === 'pay') {
        text('Paid', 40, 170, `700 64px ${DISPLAY}`, '#C8FF4D')
        text('50.00', 40, 300, `700 84px ${DISPLAY}`, '#F5F4F0')
        text('USDC · BASE', 40, 350, `500 22px ${MONO}`, '#8A8A99')
        ctx.fillStyle = '#2A2A34'
        ctx.fillRect(40, 400, W - 80, 2)
        text('Corner Café', 40, 450, `500 28px ${SANS}`, '#F5F4F0')
        text('09:41 · 0.8 s', 40, 490, `500 20px ${MONO}`, '#8A8A99')
      } else if (mode.id === 'id') {
        // avatar
        ctx.fillStyle = mode.glow
        ctx.beginPath()
        ctx.arc(96, 170, 56, 0, Math.PI * 2)
        ctx.fill()
        text('AM', 96, 186, `700 36px ${DISPLAY}`, '#0A0A0F', 'center')
        text('Ada Mensah', 40, 290, `700 40px ${DISPLAY}`, '#F5F4F0')
        text('Product Lead · Accra', 40, 332, `500 24px ${SANS}`, '#8A8A99')
        ;['LinkedIn', 'Portfolio', 'Book a call'].forEach((l, i) => {
          pill(40, 372 + i * 58, W - 80, 46, '#1A1A22')
          text(l, 64, 403 + i * 58, `500 22px ${SANS}`, '#F5F4F0')
        })
        pill(40, H - 70, W - 80, 48, mode.glow)
        text('Save contact', W / 2, H - 38, `500 22px ${SANS}`, '#0A0A0F', 'center')
      } else {
        text('Checked in', 40, 170, `700 52px ${DISPLAY}`, mode.glow)
        text('Base Builders', 40, 250, `700 38px ${DISPLAY}`, '#F5F4F0')
        text('Summit · Day 2', 40, 292, `500 24px ${SANS}`, '#8A8A99')
        // perforation
        ctx.setLineDash([8, 10])
        ctx.strokeStyle = '#2A2A34'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(40, 340)
        ctx.lineTo(W - 40, 340)
        ctx.stroke()
        ctx.setLineDash([])
        ;[
          ['DOOR', 'B · 09:41'],
          ['GUEST', 'Ada Mensah'],
          ['PASS', 'Speaker'],
        ].forEach(([k, v], i) => {
          text(k, 40, 400 + i * 56, `500 18px ${MONO}`, '#8A8A99')
          text(v, W - 40, 400 + i * 56, `500 24px ${SANS}`, '#F5F4F0', 'right')
        })
      }
      ctx.restore()
      tex.needsUpdate = true
    }
    draw()
    document.fonts.ready.then(draw)
    return tex
  })
}
