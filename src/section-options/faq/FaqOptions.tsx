import { OptionsPage } from '../OptionsPage'
import { OptionCards } from './OptionCards'
import { OptionGrouped } from './OptionGrouped'
import { OptionScroll } from './OptionScroll'
import { OptionSplit } from './OptionSplit'

/** /options/faq — layout options for the FAQ section. */
export function FaqOptions() {
  return (
    <OptionsPage
      title="FAQ"
      before="Ecosystem"
      after="Final CTA"
      options={[
        { id: 'a', name: 'Split with ring', note: 'Title, topics and the ring stay left; the ring turns to each topic', Section: OptionSplit },
        { id: 'b', name: 'Grouped', note: 'Every topic gets its own row, its name sticking on the left', Section: OptionGrouped },
        { id: 'c', name: 'Cards', note: 'A grey band of white question cards in two columns', Section: OptionCards },
        { id: 'd', name: 'Scroll through', note: 'The section holds; scrolling steps through the topics', Section: OptionScroll },
      ]}
    />
  )
}
