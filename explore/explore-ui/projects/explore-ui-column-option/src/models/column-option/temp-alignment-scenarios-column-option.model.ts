import {ClimateScenariosColumnOption} from './climate-scenarios-column-option.model';
import {ClimateScenario} from '../climate/climate-scenario.model';
import {
    AbstractColumnOption,
    ClimateScenarioAvailableOptions,
    CoreDefinitionStore, ExploreSelectOption,
    SerializeFavoriteType
} from '@blk/explore-ui-core';
import {isEmpty} from 'lodash';

/**
 * Model for transition climate scenario column option
 */
export class TempAlignmentScenariosColumnOption extends ClimateScenariosColumnOption {

    public static CONFIG_TYPE = 'taClimateScenarioSettings';
    static readonly HIDE_TARGETS = 'hideTargets';

    public static TARGET_TYPE_OPTIONS = [
        new ExploreSelectOption('Targets Applied', 'TA_METRIC_CODE_PRIORITY', true),
        new ExploreSelectOption('Targets Only', 'WITH_TARGETS', false),
        new ExploreSelectOption('Targets Not Applied', 'WITHOUT_TARGETS', false),
        new ExploreSelectOption('Credibility Weighted Targets Only', 'WITH_CREDIBILITY', false),
        new ExploreSelectOption('Credibility Weighted Targets Applied', 'CW_METRIC_CODE_PRIORITY', false)
    ];

    public static SCENARIO_TYPE_OPTIONS = [
        new ExploreSelectOption('Hot House World - Nationally Determined Contributions', 'Nationally Determined Contributions', true),
        new ExploreSelectOption('Hot House World - Current Policies', 'Current Policies', false),
        new ExploreSelectOption('Blended Scenario', 'Blended Scenario', false),
    ];

    targetTypes: string[];
    hideTargets: boolean;
    decarbonizationReductionTarget: number;

    get configType(): string {
        return TempAlignmentScenariosColumnOption.CONFIG_TYPE;
    }

    /**
     * Initializes the column with the default settings.
     */
    initialize(defaultSettings: any): void {
        super.initialize(defaultSettings);
        // default settings for climate scenarios column option is an empty rule set
        const climateScenarioAvailableOptions = CoreDefinitionStore.climateScenarioAssumptions;
        const initScenario = new ClimateScenario();
        this.hideTargets = defaultSettings?.columnOptionAttributes?.find(attr => attr.key === TempAlignmentScenariosColumnOption.HIDE_TARGETS)?.defaultValue?.value;
        const timeframeOverrideKey = defaultSettings?.columnOptionAttributes?.find(attr => attr.key === ClimateScenarioAvailableOptions.TIMEFRAME_OVERRIDE)?.defaultValue?.value;
        const timeframeOverrideKeyValid = climateScenarioAvailableOptions.isTimeframeOverrideKeyValid(timeframeOverrideKey);
        initScenario.scenarioYear = timeframeOverrideKeyValid ?
            climateScenarioAvailableOptions.getTimeframeOverrideOptions(timeframeOverrideKey)[0] :
            climateScenarioAvailableOptions.getTimeframeValuesForTempAlignment()[0];
        initScenario.scenarioYearDisplayName = timeframeOverrideKeyValid ?
            initScenario.scenarioYear :
            climateScenarioAvailableOptions.findDisplayName(initScenario.scenarioYear);
        initScenario.scenarioType = TempAlignmentScenariosColumnOption.SCENARIO_TYPE_OPTIONS[0].value;
        initScenario.scenarioTypeDisplayName = TempAlignmentScenariosColumnOption.SCENARIO_TYPE_OPTIONS[0].displayValue;
        this.climateScenario = [initScenario];
        this.targetTypes = [TempAlignmentScenariosColumnOption.TARGET_TYPE_OPTIONS[0].value];
    }

    protected doAddRequestParams(requestParams: any) {
        const serializedData = this.doSerialize(false);
        requestParams['scenarioOptions'] = serializedData.climateScenarios;
        requestParams['targetTypes'] = serializedData.targetTypes;
        if(serializedData.decarbonizationReductionTarget){
            requestParams['decarbonizationReductionTarget'] = serializedData.decarbonizationReductionTarget;
        }
    }

    deserialize(data: any): void {
        // no climate scenario or target types to deserialize
        if (!data.climateScenarios || data.climateScenarios.length === 0 || !data.targetTypes || data.targetTypes.length === 0) {
            return;
        }
        this.climateScenario = data.climateScenarios.map(climateScenariosData => {
            const climateScenarios = new ClimateScenario();
            climateScenarios.deserialize(climateScenariosData);
            return climateScenarios;
        });
        this.targetTypes = data.targetTypes;
        this.decarbonizationReductionTarget = data.decarbonizationReductionTarget;
    }

    /**
     * Serialize object into JSON format for saving
     */
    doSerialize(isNested?: boolean | SerializeFavoriteType): any {
        // only serialize if the climate scenario settings are valid
        if (!this.isValid()) {
            return undefined;
        }

        // serialize each climate scenario rule if it's valid
        const serializedClimateScenarios = this.climateScenario
            .filter(setting => setting.isValid())
            .map(validSetting => validSetting.serialize(isNested));

        return {
            climateScenarios: serializedClimateScenarios,
            targetTypes: this.targetTypes,
            decarbonizationReductionTarget: this.decarbonizationReductionTarget
        };
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof TempAlignmentScenariosColumnOption)) {
            return false;
        }

        const scenariosEqual = this.climateScenario?.length === otherColOption.climateScenario?.length
            && this.climateScenario?.every((setting, index) => setting.equals(otherColOption.climateScenario[index]));

        const targetTypesEqual = this.targetTypes?.length === otherColOption.targetTypes?.length
            && this.targetTypes?.every((setting, index) => setting === otherColOption.targetTypes[index]);

        const decarbonizationReductionTargetEquals = this.decarbonizationReductionTarget === otherColOption.decarbonizationReductionTarget;

        return scenariosEqual && targetTypesEqual && decarbonizationReductionTargetEquals;
    }

    /**
     * Checks if the Climate Scenario column option is valid (not empty)
     */
    isValid(): boolean {
        return !isEmpty(this.climateScenario) && (this.hideTargets || !isEmpty(this.targetTypes));
    }
}
