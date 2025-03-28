import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ClimateScenario} from '../../../models/climate/climate-scenario.model';
import {
    ClimateScenarioAvailableOptions,
    ClimateScenarioOptionType,
    CoreDefinitionStore,
    ExploreSelectOption,
    ExploreSelectOptionGroup
} from '@blk/explore-ui-core';

/**
 * Component to add climate scenarios for climate columns.
 *
 * @example
 *  <app-climate-column [climateScenarios]="rule" [scenarioOptionType]="scenarioOptionType" [isFirstScenario]="i === 0"
 *       (deleteClimateScenario)="deleteRule(i)">
 *  </app-climate-column>
 */
@Component({
    selector: 'explore-column-option-climate-column',
    templateUrl: './climate-scenario.component.html',
    styleUrls: ['./climate-scenario.component.scss']
})
export class ClimateScenarioComponent implements OnInit {
    /** The current selected climate scenario */
    @Input()
    climateScenario: ClimateScenario;
    /** Indicates whether this component is handling transition climate scenario options */
    @Input()
    scenarioOptionType = ClimateScenarioOptionType.PHYSICAL;
    /** Indicates if this component is the first climate scenario. Controls whether the delete icon is available. */
    @Input()
    isFirstScenario = false;
    /** Key value provided if the timeframe options should be overridden */
    @Input()
    timeframeOverrideKey: string;
    /** Emits event to parent to delete the rule */
    @Output()
    deleteClimateScenario = new EventEmitter();

    @Output() optionValueUpdated = new EventEmitter();

    /** Scenario type options group */
    public scenarioTypes: ExploreSelectOptionGroup[];
    /** Scenario percentile distribution options group */
    public scenarioPercentiles: ExploreSelectOptionGroup[];
    /** Scenario timeframe options group */
    public scenarioTimeframes: ExploreSelectOptionGroup[];

    /** Type options */
    typeOptions: ExploreSelectOption[];
    /** Percentile distribution options */
    percentileOptions: ExploreSelectOption[];
    /** Timeframe options */
    timeFrameOptions: ExploreSelectOption[];

    /** Climate Scenario Object from the API response */
    scenarioAvailableOptions: ClimateScenarioAvailableOptions;

    /** Selected dropdown values */
    selectedScenario: ExploreSelectOption;
    selectedPercentile: ExploreSelectOption;
    selectedTimeframe: ExploreSelectOption;

    timeframeOverrideValue: string;
    overrideTimeframes: string[];

    emissionsIndex = 0;
    percentileIndex = 1;
    timeframeIndex = 2;
    indices = [this.emissionsIndex, this.percentileIndex, this.timeframeIndex];
    labels: string[];
    hide: boolean[];
    currentSelectOptions: Array<ExploreSelectOptionGroup[]>;
    loadedData = false;
    dropdownClass = ['climate-scenario--left', 'climate-scenario--center', 'climate-scenario--right'];

    ngOnInit() {
        this.scenarioAvailableOptions = CoreDefinitionStore.climateScenarioAssumptions;
        // set timeframeOverrideValue in case the scenarioYear value is not part of the default options.
        this.timeframeOverrideValue = this.climateScenario.scenarioYear;
        if (this.isTransitionRisk) {
            this.scenarioTypes = this.scenarioAvailableOptions.transitionClimateOptions(this.climateScenario);
        } else if(this.scenarioOptionType === ClimateScenarioOptionType.COMBINED_CLIMATE){
            this.scenarioTypes = this.scenarioAvailableOptions.combinedClimateOptions(this.climateScenario);
        } else this.scenarioTypes = this.scenarioAvailableOptions.physicalClimateOptions(this.climateScenario);
        this.populateAssumptions();
    }

    get isTransitionRisk(): boolean {
        return this.scenarioOptionType === ClimateScenarioOptionType.TRANSITION;
    }

    populateAssumptions(): void {
        this.selectedScenario = this.getAllScenarioValues.find((x) => x.isSelected);
        this.climateScenario.scenarioType = this.selectedScenario.value;
        this.climateScenario.scenarioTypeDisplayName = this.selectedScenario.displayValue;

        this.selectedPercentile = this.selectedScenario.childOptions.find((x) => x.isSelected);
        this.scenarioPercentiles = [{values: this.selectedScenario.childOptions}];
        this.climateScenario.scenarioPercentile = this.selectedPercentile.value;
        this.climateScenario.scenarioPercentileDisplayName = this.selectedPercentile.displayValue;

        this.overrideTimeframes = this.scenarioAvailableOptions.getTimeframeOverrideOptions(this.timeframeOverrideKey);
        if (this.overrideTimeframes.length > 0) {
            this.climateScenario.scenarioYear = this.overrideTimeframes.includes(this.timeframeOverrideValue) ? this.timeframeOverrideValue : this.overrideTimeframes[0];
            // if using override timeframes, don't find display name
            this.climateScenario.scenarioYearDisplayName = this.climateScenario.scenarioYear;
            this.setTimeframeOverrideOptions(false);
        } else {
            this.selectedTimeframe = this.selectedPercentile.childOptions.find((x: ExploreSelectOption) => x.isSelected);
            this.scenarioTimeframes = [{values: this.selectedPercentile.childOptions}];
            this.climateScenario.scenarioYear = this.selectedTimeframe.value;
            this.climateScenario.scenarioYearDisplayName = this.selectedTimeframe.displayValue;
        }
        this.currentSelectOptions = [this.scenarioTypes, this.scenarioPercentiles, this.scenarioTimeframes];
        this.parseMetadata();
        this.loadedData = true;
    }

    private setTimeframeOverrideOptions(selectFirstOption: boolean): void {
        this.climateScenario.scenarioYear = selectFirstOption ? this.overrideTimeframes[0] : this.climateScenario.scenarioYear;
        this.climateScenario.scenarioYearDisplayName = this.climateScenario.scenarioYear;
        const selectOptionGroup = new ExploreSelectOptionGroup();
        this.overrideTimeframes.forEach(year => selectOptionGroup.values.push(new ExploreSelectOption(year, year, year === this.climateScenario.scenarioYear)));
        this.selectedTimeframe = selectOptionGroup.values.find(option => option.isSelected) ?? selectOptionGroup.values[0];
        this.selectedTimeframe.isSelected = true;
        this.scenarioTimeframes = [selectOptionGroup];
    }

    get getAllScenarioValues(): ExploreSelectOption[] {
        const values = [];
        this.scenarioTypes.forEach((group) => {
            values.push(...group.values);
        });
        return values;
    }

    /**
     * Sends event to parent to delete the rule
     */
    deleteRule(): void {
        this.deleteClimateScenario.emit();
    }

    /**
     * Update the Scenarios type when select box is changed
     */
    updateScenariosType(event): void {
        const selectedValue = event.detail.value as ExploreSelectOption;
        this.climateScenario.scenarioTypeDisplayName = selectedValue.displayValue;
        this.climateScenario.scenarioType = selectedValue.value;
        selectedValue.childOptions[0].isSelected = true;
        this.scenarioPercentiles = [{values: selectedValue.childOptions}];
        this.updatePercentileType(selectedValue.childOptions[0]);
        this.optionValueUpdated.emit();
    }

    /**
     * Update the Percentile type when select box is changed or the scenarioType select box is changed
     */
    updatePercentileType(event): void {
        const selectedValue: ExploreSelectOption = event.detail ? event.detail.value : event;
        this.climateScenario.scenarioPercentileDisplayName = selectedValue.displayValue;
        this.climateScenario.scenarioPercentile = selectedValue.value;
        let resetTimeframeOption: ExploreSelectOption;
        // if there are override timeframe options, reset to the first override option rather than use the default
        if (this.overrideTimeframes.length > 0) {
            this.setTimeframeOverrideOptions(true);
            resetTimeframeOption = this.scenarioTimeframes[0].values[0];
        } else {
            selectedValue.childOptions[0].isSelected = true;
            this.scenarioTimeframes = [{values: selectedValue.childOptions}];
            resetTimeframeOption = selectedValue.childOptions[0];
        }
        this.currentSelectOptions = [this.scenarioTypes, this.scenarioPercentiles, this.scenarioTimeframes];
        this.updateTimeFrame(resetTimeframeOption);
        if (!this.isTransitionRisk) this.optionValueUpdated.emit();
    }

    /**
     * Update the TimeFrame when select box is changed or the percentileType select box is changed
     */
    updateTimeFrame(event): void {
        const selectedValue: ExploreSelectOption = event.detail ? event.detail.value : event;
        this.climateScenario.scenarioYearDisplayName = selectedValue.displayValue;
        this.climateScenario.scenarioYear = selectedValue.value;
        this.optionValueUpdated.emit();
    }

    onSelectionChanged(index: number, $event) {
        if (index === this.emissionsIndex) {
            this.updateScenariosType($event);
        } else if (index === this.percentileIndex) {
            this.updatePercentileType($event);
        } else if (index === this.timeframeIndex) {
            this.updateTimeFrame($event);
        }
    }

    private parseMetadata() {
        const hideAry = this.scenarioTypes[0].metadata['hide'];
        this.hide = JSON.parse('[' + hideAry + ']');

        const labelsAry = this.scenarioTypes[0].metadata['selectPrompts'];
        this.labels = labelsAry.split(',');
    }
}
