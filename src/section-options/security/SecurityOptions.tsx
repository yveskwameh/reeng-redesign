import { OptionsPage } from '../OptionsPage'
import { OptionCallouts } from './OptionCallouts'
import { OptionControls } from './OptionControls'
import { OptionMix } from './OptionMix'
import { OptionScan } from './OptionScan'
import { OptionSplit } from './OptionSplit'

/** /options/security — scroll-driven layout options for the security section. */
export function SecurityOptions() {
  return (
    <OptionsPage
      title="Security"
      before="How it works"
      after="Pay by email"
      options={[
        { id: 'a', name: 'Callouts', note: 'Exploded ring with leader lines to each feature', Section: OptionCallouts },
        { id: 'b', name: 'Scan', note: 'A scan line glides to each part; numbered list opens it', Section: OptionScan },
        { id: 'c', name: 'Split title', note: '"Locked" and "down." either side of the ring', Section: OptionSplit },
        { id: 'd', name: 'App controls', note: 'The app security screen sets itself as you scroll', Section: OptionControls },
        { id: 'e', name: 'Mix', note: 'Split title + callouts + app controls card', Section: OptionMix },
      ]}
    />
  )
}
