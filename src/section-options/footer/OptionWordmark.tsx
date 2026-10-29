import { Columns, DISCLAIMER, Logo, Social, year } from './shared'

/**
 * A — Giant wordmark (after Zellerfeld's and Ploy's sign-off, and our own hero's REENG). Light
 * like the rest of the page: logo, socials and the link columns on top, the disclaimer, then
 * REENG filling the full width along the bottom edge, so the page ends where it started.
 */
export function OptionWordmark() {
  return (
    <footer className="overflow-hidden border-t border-line bg-white text-ink">
      <div className="mx-auto max-w-7xl px-5 pt-16 md:px-8 md:pt-20">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-ash">Stablecoins on your finger. Tap anywhere contactless works.</p>
            <Social className="mt-6" />
          </div>
          <Columns className="md:min-w-[32rem]" />
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 text-sm text-ash md:flex-row md:justify-between">
          <p className="max-w-3xl">{DISCLAIMER}</p>
          <p className="label-mono shrink-0">Reeng © {year}</p>
        </div>
      </div>
      <p
        aria-hidden
        className="mt-6 select-none whitespace-nowrap text-center font-display font-bold leading-[0.78] text-mist"
        style={{ fontSize: '26vw', letterSpacing: '-0.06em', marginBottom: '-0.12em' }}
      >
        REENG
      </p>
    </footer>
  )
}
