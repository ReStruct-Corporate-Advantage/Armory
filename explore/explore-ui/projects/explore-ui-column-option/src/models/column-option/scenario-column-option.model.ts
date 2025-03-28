import {
    AbstractColumnOption,
    AbstractScenario,
    DateScenario,
    NamedScenario,
    OtherScenario,
    SupportAlternateConfigType,
    CoreDefinitionStore,
    DateValue
} from '@blk/explore-ui-core';
import {CoreRiskConstants} from '@blk/explore-ui-risk';
import {isEmpty, isNil} from 'lodash';

/**
 * Model class for the scenario column option
 */
export class ScenarioColumnOption extends AbstractColumnOption implements SupportAlternateConfigType {

    // NOTE:  For some reason we have the scenario settings saved with one name and the column options returned with another.
    //        So for the moment we need to register this with both of these names to ensure that we are loading correctly.
    //        Once old Explore no longer exists we should be able to change the column option name from the server and simplify this.
    static CONFIG_TYPE = 'scenarioSettings';
    static ALT_CONFIG_TYPE = 'scenarioRiskFactorViewColumnSettings';

    /**
     * The list of date scenarios that have been selected.
     */
    dateScenarios: DateScenario[] = new Array<DateScenario>();

    /**
     * The list of named scenarios that have been selected.
     */
    nameScenarios: NamedScenario[] = new Array<NamedScenario>();

    /**
     * The list of other scenarios that have been selected.
     */
    otherScenarios: OtherScenario[] = new Array<OtherScenario>();

    lookBackDate: DateValue = null;

    fetchedScenarios: Map<string, NamedScenario[]> = null;

    refreshRequired = false;

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    public static createModelLegacy(optionValues: any): ScenarioColumnOption {
        // If there is none of the required parameters then get out of here.
        if (isNil(optionValues.scenarioSettings)) {
            return undefined;
        }

        // Create the model.
        const columnOption: ScenarioColumnOption = new ScenarioColumnOption(optionValues.scenarioSettings);

        // Remove the used settings.
        delete optionValues.scenarioSettings;

        return columnOption;
    }

    /**
     * Utility function to serialise the scenarios in a consistent way.
     */
    static serializeScenarios(scenarioList: AbstractScenario[]): any[] {
        // If there is nothing then serialize it as undefined so nothing is sent.
        if (isEmpty(scenarioList)) {
            return undefined;
        }

        return scenarioList.map((item) => item.serialize());
    }

    /**
     * For the scenario column option we need to initialise the column with the default scenario option.
     */
    initialize(defaultSettings: any, definitions?: Map<string, any>): void {
        super.initialize(defaultSettings, definitions);

        if (definitions && (!this.nameScenarios || this.nameScenarios.length === 0)) {
            const namedScenarios: Map<string, any> = definitions.get('namedScenarios');
            const macroGroup: NamedScenario[] = namedScenarios.get(CoreRiskConstants.SCENARIO_TYPE.MACROECONOMIC);
            if (macroGroup && macroGroup.length > 0) {
                this.nameScenarios.push(macroGroup[0]);
            }
        }

        this.lookBackDate = DateValue.newRelativeDate('T-' + CoreDefinitionStore.scenarioLookBackDays);
        this.fetchedScenarios = new Map(CoreDefinitionStore.namedScenarios);
    }

    /**
     * Constructs the column option.
     */
    constructor(data?: any) {
        super();
        if (!isNil(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return ScenarioColumnOption.CONFIG_TYPE;
    }

    getAltConfigType(): string {
        return ScenarioColumnOption.ALT_CONFIG_TYPE;
    }

    /**
     * Serialise the content for the favorite.
     */
    doSerialize(): any {
        return {
            dateScenarios: ScenarioColumnOption.serializeScenarios(this.dateScenarios),
            nameScenarios: ScenarioColumnOption.serializeScenarios(this.nameScenarios),
            otherScenarios: ScenarioColumnOption.serializeScenarios(this.otherScenarios),
        };
    }

    /**
     * Deserialize the cond=tent from the favorite.
     */
    deserialize(data: any): void {
        // Deserialize the date scenarios if there are any.
        this.dateScenarios = new Array<DateScenario>();
        if (!isEmpty(data.dateScenarios)) {
            data.dateScenarios.forEach((item: any) => {
                this.dateScenarios.push(new DateScenario(item));
            });
        }

        // Deserialize the named scenarios if there are any.
        this.nameScenarios = new Array<NamedScenario>();
        if (!isEmpty(data.nameScenarios)) {
            data.nameScenarios.forEach((item: any) => {
                this.nameScenarios.push(new NamedScenario(item));
            });
        }

        // Deserialize the other scenarios if there are any.
        this.otherScenarios = new Array<OtherScenario>();
        if (!isEmpty(data.otherScenarios)) {
            data.otherScenarios.forEach((item: any) => {
                this.otherScenarios.push(new OtherScenario(item));
            });
        }
    }

    /**
     * Add the request params for this column option.
     */
    protected doAddRequestParams(optionValues: any) {
        const allScenarios = [...this.nameScenarios, ...this.dateScenarios, ...this.otherScenarios];
        optionValues.scenarioList = ScenarioColumnOption.serializeScenarios(allScenarios);
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one.
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        // For this option unless they are the same object then we do not treat as equal.
        return this === otherColOption;
    }

    /**
     * Checks if the settings in this option are valid.
     * For the scenario options this is if any of the scenarios are populated.
     */
    isValid(): boolean {
        return !isEmpty(this.dateScenarios) || !isEmpty(this.nameScenarios) || !isEmpty(this.otherScenarios);
    }
}
