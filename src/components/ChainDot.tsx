import type { CHAINS } from '../content/chains'

/** Small round chain badge: chain colour with its initial. */
export function ChainDot({ chain, className = 'size-8 text-xs' }: { chain: (typeof CHAINS)[number]; className?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full font-mono font-semibold ${className}`} style={{ background: chain.dot, color: chain.dotFg }}>
      {chain.name[0]}
    </span>
  )
}
