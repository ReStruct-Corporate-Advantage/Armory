import { DecisionLevelConfig } from './decision-level-config.model';

describe('DecisionLevelConfig', () => {
    let decisionLevelConfig: DecisionLevelConfig;

    beforeEach(() => {
        decisionLevelConfig = new DecisionLevelConfig();
    });

    it('should initialize with default values', () => {
        expect(decisionLevelConfig.arrangeByOption).toBe('Portfolio tree');
        expect(decisionLevelConfig.portTreeDecisionLevelOption).toBe(0);
        expect(decisionLevelConfig.topDownCols).toEqual([]);
        expect(decisionLevelConfig.decisionBenchMap.size).toBe(0);
    });

    it('should deserialize data correctly', () => {
        const data = {
            portTreeDecisionLevel: 1,
            topDownCols: ['col1', 'col2'],
            decisionBenchMap: JSON.stringify({ key1: 'value1', key2: 'value2' })
        };
        decisionLevelConfig.deserialize(data);

        expect(decisionLevelConfig.portTreeDecisionLevelOption).toBe(1);
        expect(decisionLevelConfig.topDownCols).toEqual(['col1', 'col2']);
        expect(decisionLevelConfig.arrangeByOption).toBe('Portfolio attributes');
        expect(decisionLevelConfig.decisionBenchMap.size).toBe(2);
        expect(decisionLevelConfig.decisionBenchMap.get('key1')).toBe('value1');
        expect(decisionLevelConfig.decisionBenchMap.get('key2')).toBe('value2');
    });

    it('should serialize data correctly', () => {
        decisionLevelConfig.portTreeDecisionLevelOption = 1;
        decisionLevelConfig.topDownCols = ['col1', 'col2'];
        decisionLevelConfig.decisionBenchMap.set('key1', 'value1');

        const serializedData = decisionLevelConfig.serialize();

        expect(serializedData.portTreeDecisionLevel).toBe(1);

        expect(serializedData.decisionBenchMap).toBe(JSON.stringify({ key1: 'value1' }));

        decisionLevelConfig.portTreeDecisionLevelOption = null;
        decisionLevelConfig.arrangeByOption = 'Portfolio attributes';
        const serializedDat2 = decisionLevelConfig.serialize();
        expect(serializedDat2.topDownCols).toEqual(['col1', 'col2']);
    });

    it('should add request params correctly when isDecisionLevelData is false', () => {
        const requestParams: any = {};
        decisionLevelConfig.arrangeByOption = 'Portfolio attributes';
        decisionLevelConfig.topDownCols = ['col1', 'col2'];
        decisionLevelConfig.addRequestParams(requestParams);
        expect(requestParams.topDownColsForReporting).toEqual(['col1', 'col2']);

    });

    it('should add request params correctly when isDecisionLevelData is true', () => {
        const requestParams: any = { isDecisionLevelData: true, portTreeDecisionLevel: 1 };

        decisionLevelConfig.addRequestParams(requestParams);

        expect(requestParams.isLookthroughEnabled).toBe(undefined);
        expect(requestParams.ltSecurityTypes).toBe(undefined);
        expect(requestParams.isSectorView).toBe(undefined);
    });

    it('should handle empty decisionBenchMap correctly', () => {
        const requestParams: any = {};
        decisionLevelConfig.decisionBenchMap = new Map<string, string>();

        decisionLevelConfig.addRequestParams(requestParams);

        expect(requestParams.decisionBenchMap).toBeUndefined();
    });

    it('should handle non-empty decisionBenchMap correctly', () => {
        const requestParams: any = {};
        decisionLevelConfig.decisionBenchMap.set('key1', 'value1');

        decisionLevelConfig.addRequestParams(requestParams);

        expect(requestParams.decisionBenchMap).toBe(JSON.stringify({ key1: 'value1' }));
    });

    it('should correctly identify if arranged by Portfolio Attributes', () => {
        decisionLevelConfig.arrangeByOption = DecisionLevelConfig.PORT_ATTRIBUTES_CAPTION;
        decisionLevelConfig.topDownCols = ['col1'];

        expect(decisionLevelConfig.isEffectivelyArrangedByPortAttributes()).toBe(true);
    });

    it('should correctly identify if arranged by Portfolio Tree', () => {
        decisionLevelConfig.arrangeByOption = DecisionLevelConfig.PORT_TREE_CAPTION;
        decisionLevelConfig.portTreeDecisionLevelOption = 1;

        expect(decisionLevelConfig.isEffectivelyArrangedByPortTree()).toBe(true);
    });
});
