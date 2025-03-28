import { Component } from '@angular/core';
import {BaseColumnOptionComponent} from '../base-column-option.component';
import {ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {CreditVarSettingsColumnOption} from '../../../models/column-option/credit-var/credit-var-settings-column-option.model';

@Component({
  selector: 'explore-credit-var-settings-column-option',
  templateUrl: './credit-var-settings-column-option.component.html',
  styleUrls: ['./credit-var-settings-column-option.component.scss']
})
export class CreditVarSettingsColumnOptionComponent extends BaseColumnOptionComponent<CreditVarSettingsColumnOption> {

    public static readonly OPTION_KEY = 'creditVarSettings';

    confidenceLevelsData: ExploreSelectOptionGroup[];

    /**
     * Get the type of option value this component should create.
     */
    protected getOptionValueConfigType(): string {
        return CreditVarSettingsColumnOption.CONFIG_TYPE;
    }

    /**
     * Performs the required initialization.
     */
    protected initializeComponent(): void {
        this.initializeConfidenceLevelsData();
    }

    private initializeConfidenceLevelsData(): void {
        this.confidenceLevelsData = [new ExploreSelectOptionGroup()];
        const creditVarSettingsAttribute = this.option['columnOptionAttributes'][0];
        if (creditVarSettingsAttribute?.values.length > 0) {
            this.confidenceLevelsData[0].values = creditVarSettingsAttribute.values.map(columnOptionAttribute => new ExploreSelectOption(columnOptionAttribute.label, columnOptionAttribute.value, columnOptionAttribute.value === this.optionValue.confidenceLevelPercentage));
        }
    }

    onConfidenceLevelChanged(confidenceLevel: number): void {
        this.optionValue.confidenceLevelPercentage = confidenceLevel;
    }
}
