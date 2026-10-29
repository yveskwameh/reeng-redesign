import { OptionsPage } from '../OptionsPage'
import { OptionCard } from './OptionCard'
import { OptionCentred } from './OptionCentred'
import { OptionLetter } from './OptionLetter'
import { OptionPanel } from './OptionPanel'

/** /options/cta — layout options for the closing call to action. */
export function CtaOptions() {
  return (
    <OptionsPage
      title="Final CTA"
      before="FAQ"
      after="Footer"
      options={[
        { id: 'a', name: 'Centred', note: 'Like the hero: the ring rises in above the headline', Section: OptionCentred },
        { id: 'b', name: 'Product card', note: 'Grey card: copy left, ring right with the key facts pinned around it', Section: OptionCard },
        { id: 'c', name: 'Violet panel', note: 'A full brand-colour panel with white type and the ring', Section: OptionPanel },
        { id: 'd', name: 'Ring is the O', note: 'The ring flies in to finish the word "your"', Section: OptionLetter },
      ]}
    />
  )
}
