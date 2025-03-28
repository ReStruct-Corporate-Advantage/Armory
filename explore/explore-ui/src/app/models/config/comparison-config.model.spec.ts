import {ComparisonConfig} from './comparison-config.model';

describe('ComparisonConfig', () => {
    it('should be created', () => {
        const comparisonConfig = new ComparisonConfig();
        expect(comparisonConfig instanceof ComparisonConfig).toBe(true);
    });

    /**
     * Test case for serialize/deserialize
     */
    it('Test serialize/deserialize', () => {
        const configMock = {
            'portComparisonList': ['PEP012345', 'CORE-HQ543210'],
            'portAnchorId': 'PEP012345'
        };
        const comparisonConfig: ComparisonConfig = new ComparisonConfig();
        comparisonConfig.deserialize(configMock);
        expect(comparisonConfig.portComparisonList.length).toBe(2);
        expect(comparisonConfig.portAnchorId).toEqual('PEP012345');

        let saved = comparisonConfig.serialize(true);
        let newComparisonConfig = new ComparisonConfig();
        newComparisonConfig.deserialize(saved);
        expect(newComparisonConfig.portComparisonList.length).toBe(2);
        expect(newComparisonConfig.portAnchorId).toEqual('PEP012345');
    });
});
