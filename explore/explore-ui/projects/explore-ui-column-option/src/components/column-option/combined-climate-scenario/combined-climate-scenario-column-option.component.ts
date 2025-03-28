import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ClimateScenario} from '../../../models/climate/climate-scenario.model';
import {BaseColumnOptionComponent} from '../base-column-option.component';
import {ClimateScenarioAvailableOptions, ClimateScenarioOptionType} from '@blk/explore-ui-core';
import {CombinedClimateScenariosColumnOption} from '../../../models/column-option/combined-climate-scenarios-column-option.model';
import {
    BaseClimateScenarioColumnOptionDirective
} from '../climate-scenario/base-climate-scenario-column-option.directive';


@Component({
    selector: 'explore-combined-climate-scenario-column-option',
    templateUrl: './combined-climate-scenario-column-option.component.html',
    styleUrls: ['./combined-climate-scenario-column-option.component.scss']
})
export class CombinedClimateScenarioColumnOptionComponent extends BaseClimateScenarioColumnOptionDirective<CombinedClimateScenariosColumnOption> {

    public static OPTION_KEY = 'cdClimateScenarioSettings';

    @Input() hideAddButton: boolean;

    @Output() optionValueUpdated = new EventEmitter<CombinedClimateScenariosColumnOption>();
    climateScenariosColumnOption: CombinedClimateScenariosColumnOption;

    scenarioOptionType = ClimateScenarioOptionType.COMBINED_CLIMATE;

    /** Timeframe override key value used to retrieve the set of timeframe options to use instead of the default */
    timeframeOverrideKey: string;

    /**
     * Initialize the climate column option.
     * Gets data formatter and valid comparison types based on column type
     */
    protected initializeComponent(): void {
        super.initializeComponent();
        this.timeframeOverrideKey = this.option?.columnOptionAttributes?.find(attr => attr.key === ClimateScenarioAvailableOptions.TIMEFRAME_OVERRIDE)?.defaultValue?.value;
        this.climateScenariosColumnOption = this.optionValue;
        if (this.climateScenariosColumnOption.climateScenario !== undefined && this.climateScenariosColumnOption.climateScenario.length < 1 ) {
            this.addNewScenarioRule();
        }
    }
    /**
     * Get the config type that this object is configuring.
     */
    protected getOptionValueConfigType(): string {
        return CombinedClimateScenarioColumnOptionComponent.OPTION_KEY;
    }

    /**
     * Adds new Scenario rule
     */
    addNewScenarioRule(): void {
        this.climateScenariosColumnOption.climateScenario.push(new ClimateScenario());
    }

    /**
     * Deletes existing Scenario rule
     * @param index Index of rule to delete
     */
    deleteRule(index: number): void {
        this.climateScenariosColumnOption.climateScenario.splice(index, 1);
    }

    /**
     * Emit the updated constraint option value
     */
    updateOptionValueAndEmit(): void {
        this.optionValueUpdated.emit(this.climateScenariosColumnOption);
    }
}
