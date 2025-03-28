import {FactorBlockInput} from './factor-block-input.model';
import {ConfigInitializer} from '../../../initializers/config.initializer';
import {ReturnSpriteletInput} from '@models/widget/inputs/return-spritelet-input.model';
import {ConfigTypeFactory} from '@blk/explore-ui-core';

describe('FactorBlockInput Tests', () => {
    beforeAll(() => {
        ConfigInitializer.registerWidgetInputTypes();
    });

    it('should test configType', () => {
        expect(new FactorBlockInput().getConfigType()).toBe('factorBlock');
    });

    it('should serialize/deserialize', () => {
        const factorBlockInput: FactorBlockInput = new FactorBlockInput();
        factorBlockInput.isBlock = true;
        factorBlockInput.blockPath = '779a5f4bf8c5985c3a1eb2f5fea47764816fe89f_EQ_COUNTRY';

        // Convert the object to string and then back to json again.
        const serializedData: any = factorBlockInput.serialize();

        const deserializedFactorBlockInput: FactorBlockInput = ConfigTypeFactory.createConfig(serializedData, FactorBlockInput.configType, false);
        // Validate that the before and after are the same.
        expect(deserializedFactorBlockInput.isBlock).toBe(true);
        expect(deserializedFactorBlockInput.blockPath).toBe('779a5f4bf8c5985c3a1eb2f5fea47764816fe89f_EQ_COUNTRY');
    });

    it('should test equals', () => {
        const input1 = new FactorBlockInput();
        const input2 = new ReturnSpriteletInput();
        expect(input1.equals(input2)).toBeFalsy();

        const input3 = new FactorBlockInput();
        input1.isBlock = true;
        input3.isBlock = false;
        expect(input1.equals(input3)).toBe(false);

        input1.blockPath = '779a5f4bf8c5985c3a1eb2f5fea47764816fe89f_EQ_COUNTRY';
        input3.isBlock = true;
        input3.blockPath = 'bad_path';
        expect(input1.equals(input3)).toBe(false);

        input1.isBlock = true;
        input1.blockPath = '779a5f4bf8c5985c3a1eb2f5fea47764816fe89f_EQ_COUNTRY';
        input3.isBlock = true;
        input3.blockPath = '779a5f4bf8c5985c3a1eb2f5fea47764816fe89f_EQ_COUNTRY';
        expect(input1.equals(input3)).toBe(true);
    });

    it('Test shouldSkipSerialize', () => {
        const model = new FactorBlockInput();
        expect(model.shouldSkipSerialize()).toBeFalsy();
    });
});
