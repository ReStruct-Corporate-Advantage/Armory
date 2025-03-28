import {ReturnSpriteletInput} from '@models/widget/inputs/return-spritelet-input.model';
import {FactorPathInput} from '@models/widget/inputs/factor-path-input.model';
import {ConfigTypeFactory} from '@blk/explore-ui-core';
import {TestUtils} from '@utils/test.utils';

describe('FactorPathInput Tests', () => {
    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    it('should test configType', () => {
        expect(new FactorPathInput().getConfigType()).toBe('factorPath');
    });

    it('should serialize/deserialize', () => {
        const factorPathInput: FactorPathInput = new FactorPathInput();
        factorPathInput.path.push({level: '_ROOT_', value: 'PEP'});
        factorPathInput.path.push({level: 'level-1', value: 'STYLE'});
        // Convert the object to string and then back to json again.
        let serializedData: any = factorPathInput.serialize();

        let deserializedFactorPathInput: FactorPathInput = ConfigTypeFactory.createConfig(serializedData, FactorPathInput.configType, false);
        // Validate that the before and after are the same.
        expect(deserializedFactorPathInput.path.length).toBe(2);
        expect(deserializedFactorPathInput.path[0].level).toBe('_ROOT_');
        expect(deserializedFactorPathInput.path[0].value).toBe('PEP');
        expect(deserializedFactorPathInput.path[1].level).toBe('level-1');
        expect(deserializedFactorPathInput.path[1].value).toBe('STYLE');

        serializedData = ['PEP', 'STYLE'];

        deserializedFactorPathInput = ConfigTypeFactory.createConfig(serializedData, FactorPathInput.configType, false);
        // Validate that the before and after are the same.
        expect(deserializedFactorPathInput.path.length).toBe(2);
        expect(deserializedFactorPathInput.path[0].level).toBe('_ROOT_');
        expect(deserializedFactorPathInput.path[0].value).toBe('PEP');
        expect(deserializedFactorPathInput.path[1].level).toBe('level-1');
        expect(deserializedFactorPathInput.path[1].value).toBe('STYLE');
    });

    it('should test equals', () => {
        const input1 = new FactorPathInput();
        input1.path.push({level: '_ROOT_', value: 'PEP'});
        input1.path.push({level: 'level-1', value: 'STYLE'});
        const input2 = new ReturnSpriteletInput();
        expect(input1.equals(input2)).toBeFalsy();

        const input3 = new FactorPathInput();
        input3.path.push({level: '_ROOT_', value: 'PEP'});

        // unequal number of paths
        expect(input1.equals(input3)).toBe(false);

        // unequal path value
        input3.path.push({level: 'level-1', value: 'FX'});
        expect(input1.equals(input3)).toBe(false);

        // unequal path level
        input3.path[1].level = 'level-2';
        input3.path[1].value = 'STYLE';
        expect(input1.equals(input3)).toBe(false);

        // everything equal
        input3.path[1].level = 'level-1';
        expect(input1.equals(input3)).toBe(true);
    });

    it('should determine if a path is down to the leaf level', () => {
        const factorPathInput = new FactorPathInput();

        factorPathInput.path = [];
        expect(factorPathInput.isFactorTimeSeriesLeafLevelPath()).toEqual(false);

        factorPathInput.path = [
            {level: '_ROOT_', value: 'PEP'},
            {level: 'level-1', value: 'STYLE'}
        ];
        expect(factorPathInput.isFactorTimeSeriesLeafLevelPath()).toEqual(false);

        factorPathInput.path.push({level: 'rfv_block_path', value: '15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_STYLE:FMI_WRLD_MARKET'});
        expect(factorPathInput.isFactorTimeSeriesLeafLevelPath()).toEqual(true);
    });

    it('should consider rfv_ftitle to be a leaf level path to maintain backward compatibility of favorites', () => {
        const factorPathInput = new FactorPathInput();

        factorPathInput.path = [];
        expect(factorPathInput.isFactorTimeSeriesLeafLevelPath()).toEqual(false);

        factorPathInput.path = [
            {level: '_ROOT_', value: 'PEP'},
            {level: 'level-1', value: 'STYLE'}
        ];
        expect(factorPathInput.isFactorTimeSeriesLeafLevelPath()).toEqual(false);

        factorPathInput.path.push({level: 'rfv_ftitle', value: 'Market'});
        expect(factorPathInput.isFactorTimeSeriesLeafLevelPath()).toEqual(true);
    });

    it('Test shouldSkipSerialize', () => {
        const model = new FactorPathInput();
        expect(model.shouldSkipSerialize()).toBeFalsy();
    });
});
