import { CanvasTexture, SRGBColorSpace } from 'three'
import { ALIAS, MAIL } from './scrollState'

const W = 800
const H = 500
export const ENVELOPE_ASPECT = W / H

const ALIAS_FONT = '700 46px "Unbounded Variable", sans-serif'
const ALIAS_Y = 300

/**
 * Envelope front, drawn twice: with the one-time alias, and with it burned off.
 * `aliasPoints` samples the alias lettering so particles can replace it exactly.
 */
export function createEnvelopeFace() {
  const make = () => {
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    t.anisotropy = 4
    return { c, ctx: c.getContext('2d')!, t }
  }
  const withAlias = make()
  const burned = make()

  const base = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#F5F4F0'
    ctx.fillRect(0, 0, W, H)
    // stamp
    ctx.fillStyle = '#9730F6'
    ctx.beginPath()
    ctx.roundRect(W - 250, 50, 190, 120, 14)
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.font = '700 40px "Unbounded Variable", sans-serif'
    ctx.fillText(MAIL.amount.toFixed(2), W - 155, 118)
    ctx.font = '500 20px "Geist Mono Variable", monospace'
    ctx.fillText('USDC', W - 155, 150)
    // label + address lines
    ctx.textAlign = 'left'
    ctx.fillStyle = '#8A8A99'
    ctx.font = '500 22px "Geist Mono Variable", monospace'
    ctx.fillText('TO · ONE-TIME ALIAS', 70, 240)
    ctx.fillStyle = '#D9D8D2'
    ctx.fillRect(70, 340, 520, 4)
    ctx.fillRect(70, 390, 360, 4)
  }

  const aliasPoints: number[] = []
  const draw = () => {
    base(withAlias.ctx)
    withAlias.ctx.fillStyle = '#0A0A0F'
    withAlias.ctx.font = ALIAS_FONT
    withAlias.ctx.fillText(ALIAS, 70, ALIAS_Y)
    withAlias.t.needsUpdate = true

    base(burned.ctx)
    burned.ctx.fillStyle = '#FF5A4E'
    burned.ctx.font = '500 22px "Geist Mono Variable", monospace'
    burned.ctx.fillText('ALIAS BURNED', 70, ALIAS_Y - 10)
    burned.t.needsUpdate = true

    // sample the alias lettering on its own canvas → normalised face coords (-0.5..0.5)
    const s = document.createElement('canvas')
    s.width = W
    s.height = H
    const sctx = s.getContext('2d')!
    sctx.font = ALIAS_FONT
    sctx.fillText(ALIAS, 70, ALIAS_Y)
    const px = sctx.getImageData(0, 0, W, H).data
    aliasPoints.length = 0
    for (let y = 0; y < H; y += 3) {
      for (let x = 0; x < W; x += 3) {
        if (px[(y * W + x) * 4 + 3] > 128) aliasPoints.push(x / W - 0.5, 0.5 - y / H)
      }
    }
  }
  draw()
  document.fonts.ready.then(draw)

  return { withAlias: withAlias.t, burned: burned.t, aliasPoints }
}
