import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ClimateScenario} from '../../../models/climate/climate-scenario.model';
import {
    TempAlignmentScenariosColumnOption
} from '../../../models/column-option/temp-alignment-scenarios-column-option.model';
import {BaseColumnOptionComponent} from '../base-column-option.component';
import {AuxSelectSelectionChangedDetailInterface, AuxSelectType} from '@blk/aladdin-angular-components';
import {
    ClimateScenarioAvailableOptions,
    ClimateScenarioOptionType,
    CoreDefinitionStore,
    ExploreSelectOption,
    ExploreSelectOptionGroup
} from '@blk/explore-ui-core';
import {isEmpty} from 'lodash';

@Component({
    selector: 'explore-temp-alignment-scenario-column-option',
    templateUrl: './temp-alignment-scenario-column-option.component.html',
    styleUrls: ['./temp-alignment-scenario-column-option.component.scss']
})
export class TempAlignmentScenarioColumnOptionComponent extends BaseColumnOptionComponent<TempAlignmentScenariosColumnOption> {

    public static OPTION_KEY = 'taClimateScenarioSettings';
    /** selectionMode value for single dropdown year selection */
    private static readonly SIMPLE_SELECT: AuxSelectType = 'simple';
    private static readonly MULTI_SELECT: AuxSelectType = 'multiple';

    climateScenariosColumnOption: TempAlignmentScenariosColumnOption;
    @Input()
    isSingleSelect = false;

    @Output() optionValueUpdated = new EventEmitter<TempAlignmentScenariosColumnOption>();

    /** Climate Scenario Object from the API response */
    scenarioAvailableOptions: ClimateScenarioAvailableOptions;
    targetTypeOptions: ExploreSelectOptionGroup[] = [
        {values: TempAlignmentScenariosColumnOption.TARGET_TYPE_OPTIONS.map(option => ({...option}))}
    ];
    /** Array of scenario type options group */
    scenarioTypeOptions: ExploreSelectOptionGroup[] = [
        {values: TempAlignmentScenariosColumnOption.SCENARIO_TYPE_OPTIONS.map(option => ({...option}))}
    ];
    /** Array of scenario timeframe options group */
    public scenarioTimeframeOptions: ExploreSelectOptionGroup[] = [];
    /** Available year values to convert to options */
    availableYears: string[] = [];
    /** Selected year values */
    selectedYears: string[] = [];
    /** Available type values to convert to options */
    availableTypes: string[] = [];
    /** Selected type options */
    selectedTypes: ExploreSelectOption[];
    /** Selected target types */
    selectedTargetTypes: string[] = [];
    /** Timeframe override state */
    timeframeOverrideEnabled = false;
    /** Flag to hide the targets selection */
    hideTargets = false;

    selectionMode: AuxSelectType;

    /**
     * Initialize the climate column option.
     * Gets data formatter and valid comparison types based on column type
     */
    protected initializeComponent(): void {
        super.initializeComponent();

        this.selectionMode = (this.isSingleSelect || this.option.columnOptionAttributes[0]?.isRestricted) ? TempAlignmentScenarioColumnOptionComponent.SIMPLE_SELECT : TempAlignmentScenarioColumnOptionComponent.MULTI_SELECT;

        this.scenarioAvailableOptions = CoreDefinitionStore.climateScenarioAssumptions;
        this.hideTargets = this.option?.columnOptionAttributes?.find(attr => attr.key === TempAlignmentScenariosColumnOption.HIDE_TARGETS)?.defaultValue?.value;
        const timeframeOverrideKey = this.option?.columnOptionAttributes?.find(attr => attr.key === ClimateScenarioAvailableOptions.TIMEFRAME_OVERRIDE)?.defaultValue?.value;
        this.timeframeOverrideEnabled = this.scenarioAvailableOptions.isTimeframeOverrideKeyValid(timeframeOverrideKey);
        this.availableYears = this.timeframeOverrideEnabled ?
            this.scenarioAvailableOptions.getTimeframeOverrideOptions(timeframeOverrideKey) :
            this.scenarioAvailableOptions.getTimeframeValuesForTempAlignment();
        const defaultYear = this.availableYears[0]; // first value as default
        this.availableYears.sort();
        this.climateScenariosColumnOption = this.optionValue instanceof TempAlignmentScenariosColumnOption ? this.optionValue : new TempAlignmentScenariosColumnOption(this.optionValue);
        if (!this.climateScenariosColumnOption.isValid()) {
            const climateScenario = new ClimateScenario({
                scenarioType: this.scenarioTypeOptions[0].values[0].value,
                scenarioYear: defaultYear,
                scenarioPercentile: this.scenarioAvailableOptions.getPercentileValuesForType(this.availableTypes[0], ClimateScenarioOptionType.TEMP_ALIGNMENT)[0]
            });
            this.climateScenariosColumnOption.climateScenario = [climateScenario];
        }
        this.selectedTargetTypes = this.optionValue.targetTypes ?? [];
        this.initScenarioTypeOptions();
        this.initTimeframeOptions();
        this.initTargetTypeOptions();
        this.updateScenarios();
    }
    /**
     * Get the config type that this object is configuring.
     */
    protected getOptionValueConfigType(): string {
        return TempAlignmentScenarioColumnOptionComponent.OPTION_KEY;
    }

    /**
     * Initializes the target type options.
     */
    private initTargetTypeOptions(): void {
        const targetTypeOptionValues = this.targetTypeOptions[0].values.map(option => ({...option, isSelected: this.selectedTargetTypes.includes(option.value)}));
        if (!targetTypeOptionValues.some(option => option.isSelected)) {
            targetTypeOptionValues[0].isSelected = true;
        }
        this.targetTypeOptions = [{values: targetTypeOptionValues}];
    }

    /**
     * Initializes the scenario type options and selects the correct type option for the loaded scenarios.
     */
    private initScenarioTypeOptions(): void {
        const scenarioTypeOptionValues = this.scenarioTypeOptions[0].values.map(option =>
            ({...option, isSelected: !!this.climateScenariosColumnOption.climateScenario.find(scenario => scenario.scenarioType === option.value)})
        );
        if (!scenarioTypeOptionValues.some(option => option.isSelected)) {
            scenarioTypeOptionValues[0].isSelected = true;
        }
        this.selectedTypes = scenarioTypeOptionValues.filter(option => option.isSelected);
        this.scenarioTypeOptions = [{values: scenarioTypeOptionValues}];
    }

    /**
     * Initializes the timeframe scenario options and selects the timeframe options for loaded scenarios.
     */
    private initTimeframeOptions(): void {
        const selectOptionGroup = new ExploreSelectOptionGroup();
        if (!isEmpty(this.availableYears)) {
            for (const year of this.availableYears) {
                selectOptionGroup.values.push(
                    new ExploreSelectOption(
                        year,
                        year,
                        year === this.climateScenariosColumnOption.climateScenario.find(scenario => scenario.scenarioYear === year)?.scenarioYear
                    )
                );
            }
        }
        this.selectedYears = selectOptionGroup.values.filter(option => option.isSelected).map(option => option.value);
        this.scenarioTimeframeOptions = [selectOptionGroup];
    }

    /**
     * Update the target types when selection is changed and emit the updated TempAlignmentScenariosColumnOption.
     */
    updateTargetsTypes(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        if (this.selectionMode === TempAlignmentScenarioColumnOptionComponent.SIMPLE_SELECT) {
            this.selectedTargetTypes = [(event.detail.value as ExploreSelectOption).value];
        } else {
            this.selectedTargetTypes = (event.detail.value as ExploreSelectOption[]).map(option => option.value);
        }
        this.climateScenariosColumnOption.targetTypes = this.selectedTargetTypes;
        this.optionValueUpdated.emit(this.climateScenariosColumnOption);
    }

    /**
     * Update the timeframes when selection is changed
     */
    updateTimeframe(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        if (this.selectionMode === TempAlignmentScenarioColumnOptionComponent.SIMPLE_SELECT) {
            this.selectedYears = [(event.detail.value as ExploreSelectOption).value];
        } else {
            this.selectedYears = (event.detail.value as ExploreSelectOption[]).map(option => option.value);
        }
        this.updateScenarios();
    }

    /**
     * Update the type when selection is changed
     */
    updateScenarioType(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.selectedTypes = (this.selectionMode === TempAlignmentScenarioColumnOptionComponent.SIMPLE_SELECT) ?
            [(event.detail.value as ExploreSelectOption)] : (event.detail.value as ExploreSelectOption[]);
        this.updateScenarios();
    }

    /**
     * Updates scenarios with new scenarios generated from the selected type and timeframes.
     */
    private updateScenarios(): void {
        const updatedScenarios = [];
        this.selectedYears.forEach(year =>
            this.selectedTypes.forEach(type => {
                updatedScenarios.push(new ClimateScenario({
                    scenarioType: type.value,
                    scenarioTypeDisplayName: type.displayValue,
                    scenarioYear: year,
                    scenarioYearDisplayName: year,
                    scenarioPercentile: this.scenarioAvailableOptions.getPercentileValuesForType(type.value, ClimateScenarioOptionType.TEMP_ALIGNMENT)[0]
                }));
            })
        );
        this.climateScenariosColumnOption.climateScenario = updatedScenarios;
        this.optionValueUpdated.emit(this.climateScenariosColumnOption);
    }

}
