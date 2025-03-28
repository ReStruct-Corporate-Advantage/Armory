import {Component} from '@angular/core';
import {ClimateScenario} from '../../../models/climate/climate-scenario.model';
import {ClimateScenarioAvailableOptions, CommonUtils, CoreUrlConstants} from '@blk/explore-ui-core';
import {BaseColumnOptionComponent} from '../base-column-option.component';
import {ClimateScenariosColumnOption} from '../../../models/column-option/climate-scenarios-column-option.model';
import {BaseClimateScenarioColumnOptionDirective} from './base-climate-scenario-column-option.directive';

@Component({
    selector: 'explore-climate-scenario-column-option',
    templateUrl: './climate-scenario-column-option.component.html',
    styleUrls: ['./climate-scenario-column-option.component.scss']
})
export class ClimateScenarioColumnOptionComponent extends BaseClimateScenarioColumnOptionDirective<ClimateScenariosColumnOption> {

    public static OPTION_KEY = 'pClimateScenarioSettings';

    climateScenariosColumnOption: ClimateScenariosColumnOption;
    /** Timeframe override key value used to retrieve the set of timeframe options to use instead of the default */
    timeframeOverrideKey: string;

    /**
     * Initialize the climate column option.
     * Gets data formatter and valid comparison types based on column type
     */
    protected initializeComponent(): void {
        super.initializeComponent();
        this.timeframeOverrideKey = this.option.columnOptionAttributes?.find(attr => attr.key === ClimateScenarioAvailableOptions.TIMEFRAME_OVERRIDE)?.defaultValue?.value;
        this.climateScenariosColumnOption = this.optionValue;
        if (this.climateScenariosColumnOption.climateScenario !== undefined && this.climateScenariosColumnOption.climateScenario.length < 1 ) {
            this.addNewScenarioRule();
        }
    }
    /**
     * Get the config type that this object is configuring.
     */
    protected getOptionValueConfigType(): string {
        return ClimateScenarioColumnOptionComponent.OPTION_KEY;
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
     * Launch Aladdin Climate Physical Risk Scenario Narrator
     */
    launchClimatePhysicalRiskScenarios() {
        const aladdinClimateURL = CommonUtils.getModeSensitiveApplicationUrl(CoreUrlConstants.ALADDIN_CLIMATE_PATH, CoreUrlConstants.ALADDIN_CLIMATE_BETA_PATH);
        window.open(aladdinClimateURL + '/home/physical-risk-scenarios');
    }
}
