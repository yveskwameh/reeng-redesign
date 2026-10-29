import { OptionsPage } from '../OptionsPage'
import { OptionCard } from './OptionCard'
import { OptionHorizon } from './OptionHorizon'
import { OptionWordmark } from './OptionWordmark'

/** /options/footer — layout options for the footer. */
export function FooterOptions() {
  return (
    <OptionsPage
      title="Footer"
      before="Final CTA"
      after="End of page"
      options={[
        { id: 'a', name: 'Giant wordmark', note: 'Light; REENG fills the bottom edge, like the hero', Section: OptionWordmark },
        { id: 'b', name: 'Dark card', note: 'A rounded ink card with an order button and the links', Section: OptionCard },
        { id: 'c', name: 'Ring on the horizon', note: 'Clean columns; a huge pale ring rises from the bottom', Section: OptionHorizon },
      ]}
    />
  )
}
