import {ClimateScenariosColumnOption} from './climate-scenarios-column-option.model';
import {ClimateScenario} from '../climate/climate-scenario.model';
import {CoreDefinitionStore} from '@blk/explore-ui-core';

/**
 * Model for transition climate scenario column option
 */
export class TransitionClimateScenariosColumnOption extends ClimateScenariosColumnOption {

    public static CONFIG_TYPE = 'tClimateScenarioSettings';

    get configType(): string {
        return TransitionClimateScenariosColumnOption.CONFIG_TYPE;
    }
    /**
     * Initializes the column with the default settings.
     */
    initialize(defaultSettings: any): void {
        super.initialize(defaultSettings);

        // default settings for climate scenarios column option is an empty rule set
        const climateScenarioAvailableOptions = CoreDefinitionStore.climateScenarioAssumptions;
        const defaultScenario = climateScenarioAvailableOptions.transitionClimateOptions({})[0]?.values[0];
        if(defaultScenario){
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
}
