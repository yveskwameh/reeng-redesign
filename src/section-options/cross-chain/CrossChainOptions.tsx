import { OptionsPage } from '../OptionsPage'
import { OptionConverter } from './OptionConverter'
import { OptionDropIn } from './OptionDropIn'
import { OptionTunnel } from './OptionTunnel'
import { OptionWheel } from './OptionWheel'

/** /options/cross-chain — layout + interaction options for the cross-chain section. */
export function CrossChainOptions() {
  return (
    <OptionsPage
      title="Cross-chain"
      before="Tap to pay"
      after="How it works"
      options={[
        { id: 'a', name: 'Chain wheel', note: 'Auto-turning list of chains; tap one to send its coin', Section: OptionWheel },
        { id: 'b', name: 'Converter', note: 'Pick coin, chain and amount; it drops through the ring', Section: OptionConverter },
        { id: 'c', name: 'Drop it in', note: 'Drag floating coins into the ring', Section: OptionDropIn },
        { id: 'd', name: 'Tunnel', note: 'Scroll: coins rush through the ring into a ledger', Section: OptionTunnel },
      ]}
    />
  )
}
