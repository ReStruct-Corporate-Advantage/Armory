import {
    AbstractColumnOption,
    ColumnOptionFactory,
    DateScenario,
    DateValue,
    NamedScenario,
    OtherScenario
} from '@blk/explore-ui-core';
import {CoreRiskConstants} from '@blk/explore-ui-risk';
import {ScenarioColumnOption} from './scenario-column-option.model';

describe('Scenario Column Options', () => {
    let scenarioColumnOption: ScenarioColumnOption;

    /**
     * Ensure that the configurations are all initialised.
     */
    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(ScenarioColumnOption.CONFIG_TYPE, ScenarioColumnOption);
    });

    beforeEach(() => {
        scenarioColumnOption = new ScenarioColumnOption();
        const dateScenario = new DateScenario();
        dateScenario.fromDate = DateValue.newRelativeDate('T-2');
        dateScenario.toDate = DateValue.newRelativeDate('T-1');
        scenarioColumnOption.dateScenarios.push(dateScenario);
        scenarioColumnOption.nameScenarios.push(new NamedScenario());
        scenarioColumnOption.otherScenarios.push(new OtherScenario());
        scenarioColumnOption.lookBackDate = DateValue.newRelativeDate('T-' + 180);
        scenarioColumnOption.fetchedScenarios = new Map();
    });

    it('Test model initialization', () => {
        expect(scenarioColumnOption).not.toBeUndefined();
        expect(scenarioColumnOption).not.toBeNull();
        expect(scenarioColumnOption.dateScenarios.length).toBe(1);
        expect(scenarioColumnOption.nameScenarios.length).toBe(1);
        expect(scenarioColumnOption.otherScenarios.length).toBe(1);

        const date = DateValue.newRelativeDate('T-' + 180);
        expect(scenarioColumnOption.lookBackDate.equals(date)).toBe(true);
        expect(scenarioColumnOption.fetchedScenarios).not.toBe(null);
    });

    it('test CreateRequest Params', () => {
        const optionValues: any = {};
        scenarioColumnOption.addRequestParams(optionValues);
        expect(optionValues.scenarioSettings).not.toBeDefined();
        expect(optionValues.scenarioList).toBeDefined();
        expect(optionValues.scenarioList.length).toBe(3);
    });

    it('Test serialize/deserialize', () => {
        const data = scenarioColumnOption.serialize();
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();

        // Now deserialize into a new instance.
        const newColumnOption = new ScenarioColumnOption(data);

        // Validate.
        expect(newColumnOption.dateScenarios).toBeDefined();
        expect(newColumnOption.dateScenarios.length).toBe(1);
        expect(newColumnOption.nameScenarios).toBeDefined();
        expect(newColumnOption.nameScenarios.length).toBe(1);
        expect(newColumnOption.otherScenarios).toBeDefined();
        expect(newColumnOption.otherScenarios.length).toBe(1);
        expect(newColumnOption.lookBackDate).toBe(null);
        expect(newColumnOption.fetchedScenarios).toBe(null);
    });

    it('Test create from factory', () => {
        const defaultScenario = new NamedScenario();
        defaultScenario.name = 'Default';
        defaultScenario.description = 'Default Scenario';
        defaultScenario.code = '123';
        const scenarios = new Map<string, any>();
        scenarios.set(CoreRiskConstants.SCENARIO_TYPE.MACROECONOMIC, [defaultScenario]);
        const definitions = new Map<string, any>();
        definitions.set('namedScenarios', scenarios);

        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(ScenarioColumnOption.CONFIG_TYPE, undefined, definitions);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof ScenarioColumnOption).toBeTruthy();
        expect((model as ScenarioColumnOption).getAltConfigType()).toBe(ScenarioColumnOption.ALT_CONFIG_TYPE);

        const scenarioModel = model as ScenarioColumnOption;
        expect(scenarioModel.nameScenarios.length).toBe(1);
        expect(scenarioModel.nameScenarios[0].name).toBe(defaultScenario.name);
    });

    it('Test equals', () => {
        // For this column option they are only equal if they are the same instance.
        const model = new ScenarioColumnOption();
        expect(model.equals(model)).toBeTruthy();
        expect(model.equals(new ScenarioColumnOption())).toBeFalsy();
    });

    it('Test create legacy model', () => {
        // Try without the required params.
        const data: any = {
            options: ''
        };
        let model: ScenarioColumnOption = ScenarioColumnOption.createModelLegacy(data);
        expect(model).not.toBeDefined();

        // Try with valid options.
        data.scenarioSettings = {
            nameScenarios: [{
                type: 'NamedScenario',
                scenName: 'Stock Market Drop Global',
                scenCode: 'MS_WORLD',
                cenDescription: '1% probability movement of MSCI World Market Down'
            }]
        };
        model = ScenarioColumnOption.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.nameScenarios.length).toBe(1);
        expect(model.nameScenarios[0].code).toBe('MS_WORLD');
    });
});
