import { cloneDeep } from 'lodash';
import {ClimateScenarioOptionType} from '../../../core/enums';
import {ExploreSelectOptionGroup} from '../../../ui/models/explore-select-option-group.model';
import {ExploreSelectOption} from '../../../ui/models/explore-select-option.model';
import {ClimateScenarioInterface} from './climate-scenario.model';

interface ClimateOptionsGroup {
    options: any[];
    groupName: string;
    metadata: {};
}

interface ClimateScenarioOption {
    value: string;
    displayValue: string;
    childOptions: ClimateScenarioOption[];
    metadata?: { source?: string };
}
/**
 * Represents the available climate scenario options for each climate scenario property.
 * Provides convenience methods to access the underlying data.
 */
export class ClimateScenarioAvailableOptions {
    /**
     * Nested map representing the hierarchical structure of the available physical climate scenario options.
     * This is a hierarchical structure because the selected scenario type determines the available scenario percentiles and the selected scenario type and percentile determines the available scenario timeframes.
     */
    private availableOptionsMap: Map<string, Map<string, string[]>>;
    private availablePhysicalOptions: ClimateOptionsGroup[];

    /**
     * Nested map representing the hierarchical structure of the available transition climate scenario options.
     * This is a hierarchical structure because the selected scenario type determines the available scenario percentiles and the selected scenario type and percentile determines the available scenario timeframes.
     * Transition risk has the same structure as physical risk but the meanings of the map keys are distinct from physical.
     * For transition risk, the outer map keys are actually the framework type and inner map keys are the scenario type.
     * This means the percentile in this case corresponds to type and the only two fields that comprise a scenario are type and timeframe.
     */
    private availableTransitionOptionsMap: Map<string, Map<string, string[]>>;
    private availableTransitionOptions: ClimateOptionsGroup[];

    private availableCombinedOptionsMap: Map<string, Map<string, string[]>>;
    private availableCombinedOptions: ClimateOptionsGroup[];

    /**
     * Scenario options for temperature alignment in a nested map.
     * Currently, only timeframe options are being used but the data is being kept in a similar format as assumptions in case this changes.
     * {4 Degree: {mean: [climateScenarioYears]}}
     */
    private availableTempAlignmentOptionsMap: Map<string, Map<string, string[]>>;

    /**
     * Map containing the sort orders for scenario type and percentile for physical, transition and combined climate.
     */
    private optionsSortOrderMap: Map<string, Map<string, string[]>>;

    /**
     * A simple mapping of scenario option values to their corresponding display name.
     */
    private displayValueMap: Map<string, string>;

    /**
     * Map containing timeframe override options. Used to get different timeframe options if a column specifies a timeframe override key.
     */
    private timeframeOverridesMap: Map<string, string[]>;

    /**
     * Timeframe override key value found in column option attribute.
     */
    static readonly TIMEFRAME_OVERRIDE = 'timeframeOverride';

    constructor(availableOptionsMapObj: Object) {
        this.availablePhysicalOptions = availableOptionsMapObj['physicalClimateOptions'];
        this.availableTransitionOptions = availableOptionsMapObj['transitionClimateOptions'];
        this.availableCombinedOptions = availableOptionsMapObj['combinedClimateOptions'];
        this.availableOptionsMap = this.objectToMap(availableOptionsMapObj['assumptions']);
        this.availableTransitionOptionsMap = this.objectToMap(availableOptionsMapObj['transitionAssumptions']);
        this.availableCombinedOptionsMap = this.objectToMap(availableOptionsMapObj['combinedAssumptions']);
        this.availableTempAlignmentOptionsMap = this.objectToMap(availableOptionsMapObj['tempAlignmentOptions']);
        this.optionsSortOrderMap = this.objectToMap(availableOptionsMapObj['optionsSortOrder']);
        this.timeframeOverridesMap = this.optionsSortOrderMap.has('_timeframeOverrides')
            ? this.optionsSortOrderMap.get('_timeframeOverrides')
            : new Map();
        this.displayValueMap = this.objectToMap(availableOptionsMapObj['decodeMap']);
    }

    physicalClimateOptions(climateScenario?): ExploreSelectOptionGroup[] {
        return this.optionsToAuxSelectGroup(this.availablePhysicalOptions, climateScenario);
    }

    transitionClimateOptions(climateScenario?): ExploreSelectOptionGroup[] {
        return this.optionsToAuxSelectGroup(this.availableTransitionOptions, climateScenario);
    }

    combinedClimateOptions(climateScenario?: ClimateScenarioInterface): ExploreSelectOptionGroup[] {
        return this.optionsToAuxSelectGroup(this.availableCombinedOptions, climateScenario);
    }

    getCombinedClimateDefaultOption(): ClimateScenarioOption{
        if (this.availableCombinedOptions) {
            return this.availableCombinedOptions.values().next().value.options[0];
        }
    }

    private optionsToAuxSelectGroup(climateOptions: ClimateOptionsGroup[], climateScenario?: ClimateScenarioInterface) {
        if (climateOptions) {
            const options = cloneDeep(climateOptions);
            const auxSelectOptions = [];
            Object.keys(options).forEach((group) => {
                auxSelectOptions.push({
                    label: options[group].groupName,
                    values: options[group].options,
                    metadata: options[group].metadata
                });
            });

            if (Object.keys(climateScenario).length > 0) this.setSelectedValues(auxSelectOptions, climateScenario);
            else this.selectDefaultOptions(auxSelectOptions[0].values[0]);

            return auxSelectOptions;
        } else return [];
    }

    private setSelectedValues(options: ExploreSelectOptionGroup[], climateScenario: ClimateScenarioInterface): void {
        options.forEach((group) => {
            const scenarioTypeIndex = group.values.findIndex((scenario) => scenario.value === climateScenario.scenarioType);
            if (scenarioTypeIndex > -1) {
                group.values[scenarioTypeIndex].isSelected = true;
                let scenarioPercentileIndex = group.values[scenarioTypeIndex].childOptions.findIndex(
                    (scenario) => scenario.value === climateScenario.scenarioPercentile
                );
                if (scenarioPercentileIndex === -1) {
                    scenarioPercentileIndex = 0;
                    climateScenario.scenarioPercentile = group.values[scenarioTypeIndex].childOptions[scenarioPercentileIndex].value;
                    climateScenario.scenarioPercentileDisplayName = group.values[scenarioTypeIndex].childOptions[scenarioPercentileIndex].displayValue;
                }
                group.values[scenarioTypeIndex].childOptions[scenarioPercentileIndex].isSelected = true;
                let scenarioYearIndex = group.values[scenarioTypeIndex].childOptions[scenarioPercentileIndex].childOptions.findIndex(
                    (scenario) => scenario.value === climateScenario.scenarioYear
                );
                if (scenarioYearIndex === -1) {
                    scenarioYearIndex = 0;
                    climateScenario.scenarioYear = group.values[scenarioTypeIndex].childOptions[scenarioPercentileIndex].childOptions[scenarioYearIndex].value;
                    climateScenario.scenarioYearDisplayName = group.values[scenarioTypeIndex].childOptions[scenarioPercentileIndex].childOptions[scenarioYearIndex].displayValue;
                }
                group.values[scenarioTypeIndex].childOptions[scenarioPercentileIndex].childOptions[scenarioYearIndex].isSelected = true;
            }
        });
    }

    private selectDefaultOptions(options: ExploreSelectOption): void {
        options.isSelected = true;
        options.childOptions[0]['isSelected'] = true;
        options.childOptions[0].childOptions[0]['isSelected'] = true;
    }

    /**
     * Convert object to Map structure
     * @param o
     */
    objectToMap(o: Object): Map<any, any> {
        const m = new Map();
        if (!o) {
            return m;
        }
        for (const k of Object.keys(o)) {
            if (o[k] instanceof Object && !(o[k] instanceof Array)) {
                m.set(k, this.objectToMap(o[k]));
            } else {
                m.set(k, o[k]);
            }
        }
        return m;
    }

    /**
     * Find associated display name from displayValueMap.
     * @param type
     */
    findDisplayName(type: string): string {
        return this.displayValueMap.has(type) ? this.displayValueMap.get(type) : type;
    }

    /**
     * Gets all available scenario types.
     * Values are sorted based on the order found in optionsSortOrderMap.
     * @param scenarioType
     */
    getTypeValues(scenarioType: ClimateScenarioOptionType): string[] {
        const optionsMap = this.getOptionsMap(scenarioType);
        const orderArr = this.getSortOrderArr(scenarioType, 'type');
        return Array.from(optionsMap.keys()).sort(this.getSortPredicate(orderArr));
    }

    /**
     * Gets all available scenario percentiles for a given type.
     * Returns empty array if matching value is not found.
     * Values are sorted based on the order found in optionsSortOrderMap.
     * @param typeValue
     * @param scenarioType
     */
    getPercentileValuesForType(typeValue: string, scenarioType: ClimateScenarioOptionType): string[] {
        const optionsMap = this.getOptionsMap(scenarioType);
        if (optionsMap.has(typeValue)) {
            const orderArr = this.getSortOrderArr(scenarioType, 'percentile');
            return Array.from(optionsMap.get(typeValue).keys()).sort(this.getSortPredicate(orderArr));
        }
        return [];
    }

    /**
     * Retrieve timeframe values for populating temp alignment scenario options.
     * Defaults to the first type and first percentile found in the options map.
     */
    getTimeframeValuesForTempAlignment(): string[] {
        const firstTypeVal = this.getTypeValues(ClimateScenarioOptionType.TEMP_ALIGNMENT)[0];
        const firstPercentileVal = this.getPercentileValuesForType(firstTypeVal, ClimateScenarioOptionType.TEMP_ALIGNMENT)[0];
        if (this.availableTempAlignmentOptionsMap && this.availableTempAlignmentOptionsMap.get(firstTypeVal)) {
            return this.availableTempAlignmentOptionsMap.get(firstTypeVal).get(firstPercentileVal);
        }
        return [];
    }

    /**
     * Gets the appropriate options map that corresponds to the climate type.
     * @param scenarioType ClimateScenarioOptionType
     */
    getOptionsMap(scenarioType: ClimateScenarioOptionType): Map<string, Map<string, string[]>> {
        if (ClimateScenarioOptionType.PHYSICAL === scenarioType) {
            return this.availableOptionsMap;
        } else if (ClimateScenarioOptionType.TRANSITION === scenarioType) {
            return this.availableTransitionOptionsMap;
        } else if (ClimateScenarioOptionType.COMBINED_CLIMATE === scenarioType) {
            return this.availableCombinedOptionsMap;
        } else {
            return this.availableTempAlignmentOptionsMap;
        }
    }

    /**
     * Returns function used as the sort predicate. Uses the order imposed by the given String array.
     * @param orderArr
     */
    getSortPredicate(orderArr: String[]): (a: string, b: string) => number {
        return (a, b) => orderArr.indexOf(a) - orderArr.indexOf(b);
    }

    /**
     * Gets the correct sort order array from optionsSortOrderMap.
     * @param scenarioType
     * @param scenarioField
     */
    getSortOrderArr(scenarioType: ClimateScenarioOptionType, scenarioField: string): String[] {
        let climateType = '';
        if (ClimateScenarioOptionType.PHYSICAL === scenarioType) {
            climateType = 'Physical';
        } else if (ClimateScenarioOptionType.TRANSITION === scenarioType) {
            climateType = 'Transition';
        } else if (ClimateScenarioOptionType.COMBINED_CLIMATE === scenarioType) {
            climateType = 'Combined';
        } else {
            climateType = 'TempAlignment';
        }
        return this.optionsSortOrderMap.has(climateType) ? this.optionsSortOrderMap.get(climateType).get(scenarioField) : [];
    }

    /**
     * Gets the timeframe override options for the given timeframe override key.
     * @param timeframeOverrideKey
     */
    getTimeframeOverrideOptions(timeframeOverrideKey): string[] {
        return this.isTimeframeOverrideKeyValid(timeframeOverrideKey) ? [...this.timeframeOverridesMap.get(timeframeOverrideKey)] : [];
    }

    /**
     * Checks if timeframe override key is in timeframeOverridesMap.
     * @param timeframeOverrideKey
     */
    isTimeframeOverrideKeyValid(timeframeOverrideKey: string): boolean {
        return this.timeframeOverridesMap.has(timeframeOverrideKey);
    }
}
