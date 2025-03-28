import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {NumericColumnFormatColumnOption} from './numeric-column-format-column-option.model';

describe('Numeric column format column options', () => {
    let numericColFormatColOption: NumericColumnFormatColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(NumericColumnFormatColumnOption.CONFIG_TYPE, NumericColumnFormatColumnOption);
    });

    beforeEach(() => {
        numericColFormatColOption = new NumericColumnFormatColumnOption();
        numericColFormatColOption.decimalPlaces = 2;
        numericColFormatColOption.scaling = 10;
        numericColFormatColOption.useThousandsSeparator = true;
    });

    it('Test model initialization', () => {
        expect(numericColFormatColOption).not.toBeUndefined();
        expect(numericColFormatColOption).not.toBeNull();
        expect(numericColFormatColOption.decimalPlaces).toBe(2);
        expect(numericColFormatColOption.scaling).toBe(10);
        expect(numericColFormatColOption.useThousandsSeparator).toBeTruthy();
    });

    it('test CreateRequest Params', () => {
        const optionValues: any = {};
        numericColFormatColOption.addRequestParams(optionValues);
        expect(optionValues.decimalPlaces).toBe(2);
        expect(optionValues.scaling).toBe(10);
        expect(optionValues.useThousandsSeparator).toBeTruthy();
    });

    it('Test serialize/deserialize', () => {
        const data: any = numericColFormatColOption.serialize(false);
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.configType).toBe(numericColFormatColOption.configType);
        expect(data.decimalPlaces).toBe(numericColFormatColOption.decimalPlaces);
        expect(data.scaling).toBe(numericColFormatColOption.scaling);
        expect(data.useThousandsSeparator).toBe(numericColFormatColOption.useThousandsSeparator);

        const newNumericColFormalColOption = new NumericColumnFormatColumnOption();
        newNumericColFormalColOption.deserialize(data);
        expect(newNumericColFormalColOption.decimalPlaces).toBe(numericColFormatColOption.decimalPlaces);
        expect(newNumericColFormalColOption.scaling).toBe(numericColFormatColOption.scaling);
        expect(newNumericColFormalColOption.useThousandsSeparator).toBe(numericColFormatColOption.useThousandsSeparator);
    });


    it('Test create from factory', () => {
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(NumericColumnFormatColumnOption.CONFIG_TYPE);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof NumericColumnFormatColumnOption).toBeTruthy();
    });

    it('Test create legacy model', () => {
        // Try without the required params.
        const data: any = {
            options: ''
        };
        let model: NumericColumnFormatColumnOption = NumericColumnFormatColumnOption.createModelLegacy(data);
        expect(model).not.toBeDefined();

        // Try with valid options.
        data.decimalPlaces = 4;
        data.useThousandsSeparator = true;
        data.scaling = 100;

        model = NumericColumnFormatColumnOption.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.decimalPlaces).toBe(4);
        expect(model.scaling).toBe(100);
        expect(model.useThousandsSeparator).toBe(true);
        expect(data.decimalPlaces).not.toBeDefined();
        expect(data.scaling).not.toBeDefined();
        expect(data.useThousandsSeparator).not.toBeDefined();
    });

    it('Test equals', () => {
        const model1: NumericColumnFormatColumnOption = new NumericColumnFormatColumnOption();
        const model2: NumericColumnFormatColumnOption = new NumericColumnFormatColumnOption();
        expect(model1.equals(model2)).toBeTruthy();

        // Different number of decimal places
        model1.decimalPlaces = 2;
        model1.scaling = 100;
        model1.useThousandsSeparator = false;
        model2.decimalPlaces = 4;
        model2.scaling = 100;
        model2.useThousandsSeparator = false;
        expect(model1.equals(model2)).toBeFalsy();

        // Different scaling
        model2.decimalPlaces = 2;
        model2.scaling = 10;
        expect(model1.equals(model2)).toBeFalsy();

        // Different value of flag useThousandsSeparator
        model2.scaling = 100;
        model2.useThousandsSeparator = true;
        expect(model1.equals(model2)).toBeFalsy();
        // Everything same
        model2.useThousandsSeparator = false;
        expect(model1.equals(model2)).toBeTruthy();
    });

    it('Test isValid', () => {
        numericColFormatColOption = new NumericColumnFormatColumnOption();
        numericColFormatColOption.decimalPlaces = 2;
        numericColFormatColOption.scaling = 10;
        numericColFormatColOption.useThousandsSeparator = true;
        expect(numericColFormatColOption.isValid()).toBeTruthy();
        numericColFormatColOption.scaling = null;
        expect(numericColFormatColOption.isValid()).toBeFalsy();
    });

})
;

