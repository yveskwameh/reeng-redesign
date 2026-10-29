import { Columns, DISCLAIMER, Logo, Social, year } from './shared'

/**
 * C — Ring on the horizon (after Grain's clean columns and Visitors' and Dub's big mark rising
 * from the bottom edge). Logo, socials and columns in a tidy light grid; under them, the top
 * of a huge ring rises from the bottom of the page in pale violet, a last look at the product.
 */
export function OptionHorizon() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-white text-ink">
      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 pt-16 md:grid-cols-[1fr_auto] md:px-8 md:pt-20">
        <div>
          <Logo />
          <Social className="mt-6" />
          <p className="label-mono mt-6 text-ash">Reeng © {year}</p>
        </div>
        <Columns className="md:min-w-[32rem]" />
      </div>
      <p className="relative z-10 mx-auto mt-14 max-w-3xl px-5 text-center text-sm text-ash md:px-8">{DISCLAIMER}</p>
      {/* the ring: a thick band and its liner, only the top showing */}
      <div aria-hidden className="relative mx-auto mt-10 h-[22vw] max-h-72 min-h-36 w-full overflow-hidden">
        <div className="absolute left-1/2 top-0 aspect-square w-[70vw] max-w-[56rem] min-w-[22rem] -translate-x-1/2 rounded-full border-[5vw] border-violet/15 md:border-[3rem]">
          <div className="absolute inset-[6%] rounded-full border-[1.5vw] border-violet/30 md:border-[1rem]" />
        </div>
      </div>
    </footer>
  )
}
