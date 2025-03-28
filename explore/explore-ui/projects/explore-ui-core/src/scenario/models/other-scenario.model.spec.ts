import {OtherScenario} from './other-scenario.model';

describe('Other Scenario test cases', () => {
    it('serialize/deserialize', () => {
        const scenario = new OtherScenario();
        scenario.name = 'ScenarioName';
        scenario.purpose = 'P100';

        // Ensure that an id was generated.
        expect(scenario.id).toBeDefined();

        // Now serialise the item.
        const serializedData: any = scenario.serialize();

        // Deserialize into a new instance.
        const newScenario = new OtherScenario(serializedData);

        // Validate.
        expect(newScenario.id).toBe(scenario.id);
        expect(newScenario.name).toBe(scenario.name);
        expect(newScenario.purpose).toBe(scenario.purpose);
    });
});
