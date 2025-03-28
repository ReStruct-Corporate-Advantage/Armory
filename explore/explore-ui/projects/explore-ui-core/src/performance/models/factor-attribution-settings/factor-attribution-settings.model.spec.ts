import {FactorAttributionSettings} from './factor-attribution-settings.model';
import {AssetType} from '../../asset-type.enum';
import {CoreDefinitionStore} from '../../../definition/core-definition.store';

describe('Factor Attribution Settings test case', () => {
    const defaultFactorAttributionTypeForTest = AssetType.MULTI_ASSET;

    beforeAll(() => {
        CoreDefinitionStore.tokens = { exploreEnableAdvancedAttributionSettings: 'Y' };
    });

    it('Deserialize test case', () => {
        const data: any = {};
        data.factorAttributionType = defaultFactorAttributionTypeForTest;
        const factorAttributionSettings = getFactorAttributionSettings();
        factorAttributionSettings.deserialize(data);
        expect(factorAttributionSettings.factorAttributionType).toEqual(data.factorAttributionType);
    });

    it('Serialize test case', () => {
        const factorAttributionSettings = getFactorAttributionSettings();
        factorAttributionSettings.factorAttributionType = defaultFactorAttributionTypeForTest;
        const expected = factorAttributionSettings.serialize();
        expect(expected.factorAttributionType).toEqual(defaultFactorAttributionTypeForTest);
    });

    it('AddRequest Param test case', () => {
        const requestParams: any = {};
        const factorAttributionSettings = getFactorAttributionSettings();
        factorAttributionSettings.factorAttributionType = defaultFactorAttributionTypeForTest;
        factorAttributionSettings.addRequestParams(requestParams);
        expect(requestParams.factorAttributionType).toBe(defaultFactorAttributionTypeForTest);
    });

    /**
     *  Create FactorAttributionSettings for testing.
     */
    function getFactorAttributionSettings(): FactorAttributionSettings {
        return new FactorAttributionSettings();
    }
});
