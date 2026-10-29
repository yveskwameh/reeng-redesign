import { OptionsPage } from '../OptionsPage'
import { OptionBento } from './OptionBento'
import { OptionSheet } from './OptionSheet'
import { OptionTable } from './OptionTable'
import { OptionWaterline } from './OptionWaterline'

/** /options/specs — scroll-driven layout options for the specs section. */
export function SpecsOptions() {
  return (
    <OptionsPage
      title="Specs"
      before="Pay by email"
      after="Order"
      options={[
        { id: 'a', name: 'Spec sheet', note: 'A technical drawing with a title block that lights up', Section: OptionSheet },
        { id: 'b', name: 'Bento', note: 'Spec tiles round the ring; the centre tile floods', Section: OptionBento },
        { id: 'c', name: 'Waterline', note: 'Pale water rises up the screen and the ring drops in', Section: OptionWaterline },
        { id: 'd', name: 'Spec table', note: 'Precision / Water tabs with a clean table beside the ring', Section: OptionTable },
      ]}
    />
  )
}
