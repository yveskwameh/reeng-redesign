import { OptionsPage } from '../OptionsPage'
import { OptionHeadToHead } from './OptionHeadToHead'
import { OptionOldNew } from './OptionOldNew'
import { OptionScoreboard } from './OptionScoreboard'
import { OptionSpotlight } from './OptionSpotlight'

/** /options/compare — scroll-driven layout options for the compare section. */
export function CompareOptions() {
  return (
    <OptionsPage
      title="Compare"
      before="Order"
      after="Ecosystem"
      options={[
        { id: 'a', name: 'Spotlight', note: 'Reeng’s column is a raised card; rows fill in as you scroll', Section: OptionSpotlight },
        { id: 'b', name: 'Head to head', note: 'Reeng against one rival at a time, with a score', Section: OptionHeadToHead },
        { id: 'c', name: 'Scoreboard', note: 'A bar race, one feature at a time; models ride the bars', Section: OptionScoreboard },
        { id: 'd', name: 'Old way, new way', note: 'The usual ways in one panel, struck through; Reeng in violet', Section: OptionOldNew },
      ]}
    />
  )
}
