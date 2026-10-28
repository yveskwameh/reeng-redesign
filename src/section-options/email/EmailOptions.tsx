import { OptionsPage } from '../OptionsPage'
import { OptionAlias } from './OptionAlias'
import { OptionChips } from './OptionChips'
import { OptionCompose } from './OptionCompose'
import { OptionTimeline } from './OptionTimeline'

/** /options/pay-by-email — scroll-driven layout options for the pay-by-email section. */
export function EmailOptions() {
  return (
    <OptionsPage
      title="Pay by email"
      before="Security"
      after="Specs"
      options={[
        { id: 'a', name: 'Alias field', note: 'The one-time alias types in, burns, and a new one appears', Section: OptionAlias },
        { id: 'b', name: 'Chips', note: 'Each step floats in as a chip around the envelope', Section: OptionChips },
        { id: 'c', name: 'Centre stage', note: 'Big centred title; a timeline fills along the bottom', Section: OptionTimeline },
        { id: 'd', name: 'Sender + you', note: 'The sender’s email on the left, your ring on the right', Section: OptionCompose },
      ]}
    />
  )
}
