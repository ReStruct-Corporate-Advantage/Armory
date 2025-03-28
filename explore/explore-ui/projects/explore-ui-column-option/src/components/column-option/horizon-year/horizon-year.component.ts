import {Component} from '@angular/core';
import {BaseColumnOptionComponent} from '../base-column-option.component';
import {HorizonYearColumnOption} from '../../../models/column-option/horizon-year-column-option.model';
import {AuxCheckboxGroupChangedDetailInterface, AuxCheckboxInterface} from '@blk/aladdin-angular-components';

@Component({
    selector: 'app-horizon-year',
    templateUrl: './horizon-year.component.html'
})
export class HorizonYearComponent extends BaseColumnOptionComponent<HorizonYearColumnOption> {

    public static OPTION_KEY = 'horizonOptions';
    readonly ERROR_MESSAGE = 'At least one selection is required';

    horizonYearColumnOption: HorizonYearColumnOption;
    horizonYearSelection: AuxCheckboxInterface[] = [];
    isValid: boolean;

    protected getOptionValueConfigType(): string {
        return HorizonYearColumnOption.CONFIG_TYPE;
    }

    /**
     * On checkbox group changed
     */
    onCheckboxGroupChanged(event: CustomEvent<AuxCheckboxGroupChangedDetailInterface>): void {
        const horizonList = event.detail.value.filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.eventData);
        this.horizonYearColumnOption.horizonList = horizonList;
        // if nothing is checked
        this.isValid = (horizonList.length !== 0);
    }

    protected initializeComponent(): void {
        super.initializeComponent();
        this.horizonYearColumnOption = this.optionValue;

        this.setHorizonYearCheckboxData();
    }

    /**
     * Set horizonYearSelection with checkboxEnabledState control
     */
    private setHorizonYearCheckboxData(): void {
        for (const year of this.horizonYearColumnOption.yearOptions) {
            const label = year === 1 ? year + ' Year' : year + ' Years';
            this.horizonYearSelection.push({
                label,
                eventData: year,
                checked: this.horizonYearColumnOption.horizonList.includes(year)
            });
        }
        this.isValid = this.horizonYearSelection.some(i => i.checked);
    }

}
