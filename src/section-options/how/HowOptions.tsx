import { OptionsPage } from '../OptionsPage'
import { OptionCards } from './OptionCards'
import { OptionMix } from './OptionMix'
import { OptionNumbers } from './OptionNumbers'
import { OptionPath } from './OptionPath'
import { OptionStack } from './OptionStack'

/** /options/how-it-works — scroll-driven layout options for the how-it-works section. */
export function HowOptions() {
  return (
    <OptionsPage
      title="How it works"
      before="Cross-chain"
      after="Security"
      options={[
        { id: 'a', name: 'Stack', note: 'Step cards slide up and stack; phone acts out the top one', Section: OptionStack },
        { id: 'b', name: 'Three cards', note: 'Phone glides across three step cards', Section: OptionCards },
        { id: 'c', name: 'Big numbers', note: 'Outlined 01/02/03 roll behind the phone', Section: OptionNumbers },
        { id: 'd', name: 'Path', note: 'A dotted path draws itself; the ring rides it through the steps', Section: OptionPath },
        { id: 'e', name: 'Mix', note: 'D with bigger screens and A-size title', Section: OptionMix },
      ]}
    />
  )
}
