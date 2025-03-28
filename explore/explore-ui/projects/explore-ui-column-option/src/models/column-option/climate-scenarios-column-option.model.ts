import {ClimateScenario} from '../climate/climate-scenario.model';
import {isEmpty, isNil, isObject} from 'lodash';
import {AbstractColumnOption, CoreDefinitionStore, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Model for Climate scenario column option
 */
export class ClimateScenariosColumnOption extends AbstractColumnOption {

    public static CONFIG_TYPE = 'pClimateScenarioSettings';

    /** All climate scenario rules */
    climateScenario: ClimateScenario[] = [];
    /**
     * Constructor to create a new empty climate scenario or initialize an existing one
     * @param data Optional data to construct existing climate scenario from
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return ClimateScenariosColumnOption.CONFIG_TYPE;
    }

    /**
     * Initializes the column with the default settings.
     */
    initialize(defaultSettings: any): void {
        super.initialize(defaultSettings);

        // default settings for climate scenarios column option is an empty rule set
        const climateScenarioAvailableOptions = CoreDefinitionStore.climateScenarioAssumptions;
        const defaultScenario = climateScenarioAvailableOptions.physicalClimateOptions({})[0]?.values[0];
        if (defaultScenario){
            const climateScenarioData = {
                scenarioType: defaultScenario.value,
                scenarioTypeDisplayName: defaultScenario.displayValue,
                scenarioPercentile: defaultScenario.childOptions[0].value,
                scenarioPercentileDisplayName: defaultScenario.childOptions[0].displayValue,
                scenarioYear: defaultScenario.childOptions[0].childOptions[0].value,
                scenarioYearDisplayName: defaultScenario.childOptions[0].childOptions[0].displayValue
            };
            const initScenario = new ClimateScenario(climateScenarioData);
            this.climateScenario = [initScenario];
        } else this.climateScenario = [];
    }
    /**
     * See {@link AbstractColumnOption.doAddRequestParams}
     */
    protected doAddRequestParams(requestParams: any) {
        requestParams['scenarioOptions'] = this.doSerialize(false).climateScenarios;
    }

    /**
     * Deserialize saved climate scenario  from data to object
     * @param data ClimateScenarios in JSON form
     */
    deserialize(data: any): void {
        // no climate scenario rules to deserialize
        if (!data.climateScenarios || data.climateScenarios.length === 0) {
            return;
        }

        this.climateScenario = data.climateScenarios.map(climateScenarioData => {
            return new ClimateScenario(climateScenarioData);
        });
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
        };
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof ClimateScenariosColumnOption)) {
            return false;
        }

        if (!(isNil(otherColOption.climateScenario))) {
            if (this.climateScenario.length !== otherColOption.climateScenario.length) {
                return false;
            }
        } else {
            return false;
        }

        this.climateScenario.forEach((setting, index) => {
            if (!setting.equals(otherColOption.climateScenario[index])) {
                return false;
            }
        });
        return true;
    }

    /**
     * Checks if the Climate Scenario column option is valid (not empty)
     */
    isValid(): boolean {
        return !isEmpty(this.climateScenario);
    }
}
