import { OptionsPage } from '../OptionsPage'
import { OptionPanels } from './OptionPanels'
import { OptionRail } from './OptionRail'
import { OptionTabs } from './OptionTabs'
import { OptionWord } from './OptionWord'

/** /options/ecosystem — scroll-driven layout options for the ecosystem section. */
export function EcosystemOptions() {
  return (
    <OptionsPage
      title="Ecosystem"
      before="Compare"
      after="FAQ"
      options={[
        { id: 'a', name: 'Tabbed stage', note: 'Tabs fill as you scroll; the ring taps a card on a tinted stage', Section: OptionTabs },
        { id: 'b', name: 'Three panels', note: 'Pay, ID and Events side by side; the ring travels across', Section: OptionPanels },
        { id: 'c', name: 'Giant word', note: 'PAY / ID / EVENTS fills the screen behind the ring', Section: OptionWord },
        { id: 'd', name: 'Rail and phone', note: 'A numbered rail; the ring taps a phone that shows what opens', Section: OptionRail },
      ]}
    />
  )
}
