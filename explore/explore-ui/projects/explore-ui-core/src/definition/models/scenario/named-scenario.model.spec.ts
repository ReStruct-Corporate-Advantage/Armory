import {NamedScenario} from './named-scenario.model';

describe('Named Scenario test cases', () => {
    it('serialize/deserialize', () => {
        const scenario = new NamedScenario();
        scenario.code = 'GR_RES::P100';
        scenario.description = 'Syriza and the Troika';
        scenario.name = 'Greece Debt Crisis - Near-Term Resolution';

        // Now serialise the item.
        const serializedData: any = scenario.serialize();

        // Deserialize into a new instance.
        const newScenario = new NamedScenario(serializedData);

        // Validate.
        expect(newScenario.code).toBe(scenario.code);
        expect(newScenario.description).toBe(scenario.description);
        expect(newScenario.name).toBe(scenario.name);
    });

    it('serialize/deserialize 2', () => {
        const scenario = new NamedScenario();
        scenario.code = 'GR_RES::P100';
        scenario.description = 'Syriza and the Troika';
        scenario.name = 'Greece Debt Crisis - Near-Term Resolution';
        scenario.category = 'Aladdin Scenarios';

        // Now serialise the item.
        const serializedData: any = scenario.serialize();

        // Deserialize into a new instance.
        const newScenario = new NamedScenario(serializedData);

        // Validate.
        expect(newScenario.code).toBe('GR_RES');
        expect(newScenario.description).toBe(scenario.description);
        expect(newScenario.name).toBe(scenario.name);
    });
});
