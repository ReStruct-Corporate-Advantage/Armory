import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {DateColumnFormatColumnOption} from './date-column-format-column-option.model';

describe('Date column format column options', () => {

    let dateColumnFormatColumnOption: DateColumnFormatColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(DateColumnFormatColumnOption.CONFIG_TYPE, DateColumnFormatColumnOption);
    });

    beforeEach(() => {
        dateColumnFormatColumnOption = new DateColumnFormatColumnOption();
        dateColumnFormatColumnOption.value = 'dd-mm-yyyy';
        dateColumnFormatColumnOption.label = 3;
    });

    it('Test model initialization', () => {
        expect(dateColumnFormatColumnOption).not.toBeUndefined();
        expect(dateColumnFormatColumnOption).not.toBeNull();
        expect(dateColumnFormatColumnOption.value).toBe('dd-mm-yyyy');
        expect(dateColumnFormatColumnOption.label).toBe(3);
    });

    it('test CreateRequest Params', () => {
        const optionValues: any = {};
        dateColumnFormatColumnOption.addRequestParams(optionValues);
        expect(optionValues.dateFormat.value).toBe('dd-mm-yyyy');
        expect(optionValues.dateFormat.label).toBe(3);
    });

    it('Test serialize/deserialize', () => {
        const data: any = dateColumnFormatColumnOption.serialize(false);
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.configType).toBe(dateColumnFormatColumnOption.configType);
        expect(data.value).toBe(dateColumnFormatColumnOption.value);
        expect(data.label).toBe(dateColumnFormatColumnOption.label);


        const newDateColumnFormatColumnOption = new DateColumnFormatColumnOption();
        newDateColumnFormatColumnOption.deserialize(data);
        expect(newDateColumnFormatColumnOption.value).toBe(dateColumnFormatColumnOption.value);
        expect(newDateColumnFormatColumnOption.label).toBe(dateColumnFormatColumnOption.label);
    });


    it('Test create from factory', () => {
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(DateColumnFormatColumnOption.CONFIG_TYPE);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof DateColumnFormatColumnOption).toBeTruthy();
    });

    it('Test create legacy model', () => {
        // Try without the required params.
        const data: any = {
            options: ''
        };
        let model: DateColumnFormatColumnOption = DateColumnFormatColumnOption.createModelLegacy(data);
        expect(model).not.toBeDefined();

        // Try with valid options.
        data.dateFormat = {
            value: 'dd-mm-yyyy',
            label: 3
        };

        model = DateColumnFormatColumnOption.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.value).toBe('dd-mm-yyyy');
        expect(model.label).toBe(3);
        expect(data.dateFormat).not.toBeDefined();
    });

    it('Test equals', () => {
        const model1: DateColumnFormatColumnOption = new DateColumnFormatColumnOption();
        const model2: DateColumnFormatColumnOption = new DateColumnFormatColumnOption();
        expect(model1.equals(model2)).toBeTruthy();

        // Different value
        model1.value = 'mm-dd-yyyy';
        model1.label = 4;
        model2.value = 'dd-mm-yyyy';
        model2.label = 4;
        expect(model1.equals(model2)).toBeFalsy();

        // Different label
        model2.value = 'mm-dd-yyyy';
        model2.label = 3;
        expect(model1.equals(model2)).toBeFalsy();

        // Everything same
        model2.label = 4;
        expect(model1.equals(model2)).toBeTruthy();
    });

    it('Test isValid', () => {
        expect(dateColumnFormatColumnOption.isValid()).toBeTruthy();
        dateColumnFormatColumnOption.label = null;
        dateColumnFormatColumnOption.value = '';
        expect(dateColumnFormatColumnOption.isValid()).toBeFalsy();
    });

});

