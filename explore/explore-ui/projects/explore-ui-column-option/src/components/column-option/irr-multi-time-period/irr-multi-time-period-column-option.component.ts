import {AuxSelectSelectionChangedDetailInterface, AuxSelectOption} from '@blk/aladdin-angular-components';
import {Component} from '@angular/core';
import {IrrMultiTimePeriodColumnOption} from '../../../models/column-option/irr-multi-time-period-column-option.model';
import {IRRTimePeriodUtil} from '../../../enums';
import {ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {BaseColumnOptionComponent} from '../base-column-option.component';

/**
 * Column option component for the security description selection.
 */
@Component({
    selector: 'explore-irr-multi-time-period-column-option',
    templateUrl: './irr-multi-time-period-column-option.component.html'
})
export class IrrMultiTimePeriodColumnOptionComponent extends BaseColumnOptionComponent<IrrMultiTimePeriodColumnOption> {

    public static OPTION_KEY = IrrMultiTimePeriodColumnOption.CONFIG_TYPE;

    // Collection of options that the drop down can have
    availableTimePeriods: ExploreSelectOptionGroup[];

    // Option title that we show for Drop Down column
    displayTitle: string;

    protected getOptionValueConfigType(): string {
        return IrrMultiTimePeriodColumnOption.CONFIG_TYPE;
    }

    protected initializeComponent() {
        super.initializeComponent();
        if (!this.option) {
            return;
        }
        this.availableTimePeriods = [new ExploreSelectOptionGroup()];

        this.availableTimePeriods[0].values.push(...IRRTimePeriodUtil.getAllIRRTimePeriods(this.optionValue.selectedTimePeriods));
        this.displayTitle = this.option.columnOptionAttributes[0].title;
    }

    /**
     * Method called when statistic period is changed
     */
    chooseIrrTimePeriods(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        this.optionValue.selectedTimePeriods = [];
        (event.detail.value as AuxSelectOption[]).forEach((selectedTimePeriod: ExploreSelectOption) => {
            this.optionValue.selectedTimePeriods.push(selectedTimePeriod.value);
        });
    }

}
