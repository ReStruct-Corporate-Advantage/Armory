import {ConsarScenarioType, ConsarScenarioTypeUtils} from './consar-scenario-type.enum';

describe('Consar scenario type test', () => {
    it('should get display name by consar scenario type', () => {
        expect(ConsarScenarioTypeUtils.displayName(ConsarScenarioType.REGULAR)).toBe('Regular');
        expect(ConsarScenarioTypeUtils.displayName(ConsarScenarioType.STRESS)).toBe('Stress');
    });

    it('should get all consar scenario types', () => {
       const consarScenarioTypes: ConsarScenarioType[] = ConsarScenarioTypeUtils.values();
       expect(consarScenarioTypes.length).toBe(2);
    });

    it('should get name of consar scenario type', () => {
       expect(ConsarScenarioTypeUtils.typeName(ConsarScenarioType.STRESS)).toBe('STRESS');
    });

    it('should get value of consar scenario type', () => {
       expect(ConsarScenarioTypeUtils.valueOf('REGULAR')).toBe(ConsarScenarioType.REGULAR);
    });
});
