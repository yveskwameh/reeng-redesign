import type { CoinFace } from '../scene/coinTexture'

/** Coins arriving from other chains (cross-chain section): ticker colours per issuer, `dot` per chain. */
export const CHAINS: (CoinFace & { name: string; dot: string; dotFg: string })[] = [
  { ticker: 'USDT', chain: 'ETHEREUM', name: 'Ethereum', bg: '#26A17B', fg: '#FFFFFF', dot: '#627EEA', dotFg: '#FFFFFF' },
  { ticker: 'USDC', chain: 'POLYGON', name: 'Polygon', bg: '#2775CA', fg: '#FFFFFF', dot: '#8247E5', dotFg: '#FFFFFF' },
  { ticker: 'USDT', chain: 'TRON', name: 'Tron', bg: '#26A17B', fg: '#FFFFFF', dot: '#EB0029', dotFg: '#FFFFFF' },
  { ticker: 'cUSD', chain: 'CELO', name: 'Celo', bg: '#FCFF52', fg: '#0A0A0F', dot: '#FCFF52', dotFg: '#0A0A0F' },
  { ticker: 'USDC', chain: 'ARBITRUM', name: 'Arbitrum', bg: '#2775CA', fg: '#FFFFFF', dot: '#28A0F0', dotFg: '#FFFFFF' },
  { ticker: 'USDC', chain: 'SOLANA', name: 'Solana', bg: '#2775CA', fg: '#FFFFFF', dot: '#9945FF', dotFg: '#FFFFFF' },
  { ticker: 'USDT', chain: 'BNB CHAIN', name: 'BNB Chain', bg: '#26A17B', fg: '#FFFFFF', dot: '#F0B90B', dotFg: '#0A0A0F' },
]

export const COIN_VALUE = 50
