import { OptionsPage } from '../OptionsPage'
import { OptionPlaces } from './OptionPlaces'
import { OptionReceipt } from './OptionReceipt'
import { OptionStopwatch } from './OptionStopwatch'
import { OptionZoom } from './OptionZoom'

/** /options/tap-to-pay — scroll-driven layout options for the tap-to-pay section. */
export function TapOptions() {
  return (
    <OptionsPage
      title="Tap to pay"
      before="Hero"
      after="Cross-chain"
      options={[
        { id: 'a', name: 'Receipt', note: 'Ring taps; a paper receipt prints out as you scroll', Section: OptionReceipt },
        { id: 'b', name: 'Stopwatch', note: 'Scroll runs a race clock: ring vs phone vs card', Section: OptionStopwatch },
        { id: 'c', name: 'Everywhere', note: 'Scroll through four places; one tap and receipt each', Section: OptionPlaces },
        { id: 'd', name: 'Zoom', note: 'Giant headline, then the camera pushes into the terminal screen', Section: OptionZoom },
      ]}
    />
  )
}
