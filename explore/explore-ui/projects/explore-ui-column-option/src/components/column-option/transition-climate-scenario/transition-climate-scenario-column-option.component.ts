import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ClimateScenario} from '../../../models/climate/climate-scenario.model';
import {BaseColumnOptionComponent} from '../base-column-option.component';
import {ClimateScenarioAvailableOptions, ClimateScenarioOptionType, CommonUtils, CoreUrlConstants} from '@blk/explore-ui-core';
import {TransitionClimateScenariosColumnOption} from '../../../models/column-option/transition-climate-scenarios-column-option.model';
import {
    BaseClimateScenarioColumnOptionDirective
} from '../climate-scenario/base-climate-scenario-column-option.directive';


@Component({
    selector: 'explore-transition-climate-scenario-column-option',
    templateUrl: './transition-climate-scenario-column-option.component.html',
    styleUrls: ['./transition-climate-scenario-column-option.component.scss']
})
export class TransitionClimateScenarioColumnOptionComponent extends BaseClimateScenarioColumnOptionDirective<TransitionClimateScenariosColumnOption> {

    public static OPTION_KEY = 'tClimateScenarioSettings';

    @Input() hideAddButton: boolean;

    @Output() optionValueUpdated = new EventEmitter<TransitionClimateScenariosColumnOption>();
    climateScenariosColumnOption: TransitionClimateScenariosColumnOption;

    scenarioOptionType = ClimateScenarioOptionType.TRANSITION;

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
        return TransitionClimateScenarioColumnOptionComponent.OPTION_KEY;
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

    /**
     * Launch Aladdin Climate Transition Risk Scenario Narrator
     */
    launchClimateTransitionRiskScenarios() {
        const aladdinClimateURL = CommonUtils.getModeSensitiveApplicationUrl(CoreUrlConstants.ALADDIN_CLIMATE_PATH, CoreUrlConstants.ALADDIN_CLIMATE_BETA_PATH);
        window.open(aladdinClimateURL + '/home/transition-risk-scenarios');
    }
}
