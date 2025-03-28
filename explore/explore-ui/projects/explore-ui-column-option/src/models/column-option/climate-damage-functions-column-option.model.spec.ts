import {ClimateDamageFunction} from '@blk/explore-ui-core';
import {ClimateDamageFunctionsColumnOption} from './climate-damage-functions-column-option.model';

describe('ClimateDamageFunctionsColumnOption', () => {

    it('should initialize a model with null', () => {
        const climateDamageFunctionsColumnOption = new ClimateDamageFunctionsColumnOption();
        climateDamageFunctionsColumnOption.initialize(null);
        expect(climateDamageFunctionsColumnOption.climateDamageFunctionOptions).toEqual([]);
    });

    it('should serialize and deserialize the model', () => {
        const climateDamageFunctionOption = new ClimateDamageFunction();
        climateDamageFunctionOption.damageFunctionDisplayName = 'Hurricane Cost';
        climateDamageFunctionOption.damageFunctionField = 'pct_change_damage_hurricane';

        const climateDamageFunctionsColumnOption = new ClimateDamageFunctionsColumnOption();
        climateDamageFunctionsColumnOption.climateDamageFunctionOptions = [climateDamageFunctionOption];

        jest.spyOn(climateDamageFunctionsColumnOption, 'doSerialize');
        const serializedData = climateDamageFunctionsColumnOption.serialize();
        expect(climateDamageFunctionsColumnOption.doSerialize).toHaveBeenCalled();

        const newClimateDamageFunctionsColumnOption = new ClimateDamageFunctionsColumnOption();
        jest.spyOn(newClimateDamageFunctionsColumnOption, 'deserialize');
        newClimateDamageFunctionsColumnOption.deserialize(serializedData);
        expect(newClimateDamageFunctionsColumnOption.deserialize).toHaveBeenCalled();
        expect(newClimateDamageFunctionsColumnOption.equals(climateDamageFunctionsColumnOption)).toBe(true);
    });

    it('doAddRequestParams : should add serialized data to request param', () => {
        // properties required for a damage function option to be saved
        const climateDamageFunctionOption = new ClimateDamageFunction();
        climateDamageFunctionOption.damageFunctionDisplayName = 'Hurricane Cost';
        climateDamageFunctionOption.damageFunctionField = 'pct_change_damage_hurricane';

        // damage function option to serialize
        const climateDamageFunctionsColumnOption = new ClimateDamageFunctionsColumnOption();
        climateDamageFunctionsColumnOption.climateDamageFunctionOptions = [climateDamageFunctionOption];

        jest.spyOn(climateDamageFunctionsColumnOption, 'doSerialize');
        const serializedData = climateDamageFunctionsColumnOption.serialize();
        expect(climateDamageFunctionsColumnOption.doSerialize).toHaveBeenCalled();

        const requestParams: any = {};
        climateDamageFunctionsColumnOption.addRequestParams(requestParams);
        expect(requestParams['climateDamageFunctionOptions']).toBeDefined();

        // Set damage function option and check it gets reflected in the request params
        requestParams['climateDamageFunctionOptions'] = serializedData.climateDamageFunctionOptions;
        climateDamageFunctionsColumnOption.addRequestParams(requestParams);

        const newClimateDamageFunctionOption = new ClimateDamageFunction();
        newClimateDamageFunctionOption.damageFunctionDisplayName = requestParams['climateDamageFunctionOptions'][0].damageFunctionDisplayName;
        newClimateDamageFunctionOption.damageFunctionField = requestParams['climateDamageFunctionOptions'][0].damageFunctionField;
        expect(newClimateDamageFunctionOption).toStrictEqual(climateDamageFunctionOption);
    });

    it('should check if equal', function () {
        const climateDamageFunctionOption = new ClimateDamageFunction();
        climateDamageFunctionOption.damageFunctionDisplayName = 'Hurricane Cost';
        climateDamageFunctionOption.damageFunctionField = 'pct_change_damage_hurricane';

        const climateDamageFunctionsColumnOption = new ClimateDamageFunctionsColumnOption();
        climateDamageFunctionsColumnOption.climateDamageFunctionOptions = [climateDamageFunctionOption];
        const otherClimateDamageFunctionsColumnOption = new ClimateDamageFunctionsColumnOption();
        otherClimateDamageFunctionsColumnOption.initialize(null);

        // Not equal
        expect(climateDamageFunctionsColumnOption.equals(otherClimateDamageFunctionsColumnOption)).toStrictEqual(false);

        // Not equals null
        expect(climateDamageFunctionsColumnOption.equals(null)).toStrictEqual(false);

        // Not equals undefined
        expect(climateDamageFunctionsColumnOption.equals(undefined)).toStrictEqual(false);

        // Equal
        otherClimateDamageFunctionsColumnOption.climateDamageFunctionOptions = climateDamageFunctionsColumnOption.climateDamageFunctionOptions;
        expect(climateDamageFunctionsColumnOption.equals(otherClimateDamageFunctionsColumnOption)).toStrictEqual(true);
    });

    it('should check if valid', function () {
        const climateDamageFunctionsColumnOption = new ClimateDamageFunctionsColumnOption();
        climateDamageFunctionsColumnOption.climateDamageFunctionOptions = [new ClimateDamageFunction()];
        // Valid
        expect(climateDamageFunctionsColumnOption.isValid()).toStrictEqual(true);

        // Invalid
        climateDamageFunctionsColumnOption.climateDamageFunctionOptions = undefined;
        expect(climateDamageFunctionsColumnOption.isValid()).toStrictEqual(false);

        climateDamageFunctionsColumnOption.climateDamageFunctionOptions = [];
        expect(climateDamageFunctionsColumnOption.isValid()).toStrictEqual(true);
    });
});
