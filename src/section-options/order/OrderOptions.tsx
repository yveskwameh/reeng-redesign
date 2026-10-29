import { OptionsPage } from '../OptionsPage'
import { OptionBar } from './OptionBar'
import { OptionFloat } from './OptionFloat'
import { OptionRuler } from './OptionRuler'
import { OptionSteps } from './OptionSteps'

/** /options/order — layout options for the order (configurator) section. */
export function OrderOptions() {
  return (
    <OptionsPage
      title="Order"
      before="Specs"
      after="Compare"
      options={[
        { id: 'a', name: 'Two steps', note: 'Ring on a stage card; Finish then Size in a panel', Section: OptionSteps },
        { id: 'b', name: 'Floating card', note: 'Big ring on white; one buy card floats beside it', Section: OptionFloat },
        { id: 'c', name: 'Size ruler', note: 'A ruler of sizes under the ring, which grows true to scale', Section: OptionRuler },
        { id: 'd', name: 'Buy bar', note: 'Big ring stage; finish, size, price and order in one bar', Section: OptionBar },
      ]}
    />
  )
}
