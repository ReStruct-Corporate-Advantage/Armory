import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {BookColumnOption} from './book-column-option.model';
import {ValueXXColumnOption} from './value-x-x-column-option.model';

describe('ValueXXColumnOptions', () => {
    let valueXXColumnModel: ValueXXColumnOption;

    /**
     * Ensure that the configurations are all initialised.
     */
    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(ValueXXColumnOption.CONFIG_TYPE, ValueXXColumnOption);
    });

    beforeEach(() => {
        valueXXColumnModel = new ValueXXColumnOption();
        valueXXColumnModel.value = 1;
    });

    it('Test model initialization', () => {
        expect(valueXXColumnModel).not.toBeUndefined();
        expect(valueXXColumnModel).not.toBeNull();
        expect(valueXXColumnModel.value).toBe(1);
    });

    it('test CreateRequest Params', () => {
        const optionValues: any = {};
        valueXXColumnModel.addRequestParams(optionValues);
        expect(optionValues.shockValue).not.toBeUndefined();
        expect(optionValues.shockValue).not.toBeNull();
        expect(optionValues.shockValue).toBe(1);
    });

    it('test getModifiedColumnTitle Params', () => {
        const modifiedTitle = valueXXColumnModel.getModifiedColumnTitle('DVxx');
        expect(modifiedTitle).toBe('DV1');
    });

    it('Test serialize', () => {
        const data = valueXXColumnModel.serialize();
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.shockValue).toBe(1);
    });

    it('Test deserialize', () => {
        const data: any = {
            shockValue: 20
        };
        const model: ValueXXColumnOption = new ValueXXColumnOption(data);
        expect(model).not.toBeUndefined();
        expect(model).not.toBeNull();
        expect(model.value).toBe(20);
    });

    it('Test create from factory', () => {
        const defaultValue = {columnOptionAttributes: [{'defaultValue': {'value': 10}}]};
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(ValueXXColumnOption.CONFIG_TYPE, defaultValue);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof ValueXXColumnOption).toBeTruthy();

        const xxModel = model as ValueXXColumnOption;
        expect(xxModel.value).toBe(10);
    });

    it('Test equals', () => {
        // Test that they are equal.
        const model = new ValueXXColumnOption();
        model.value = valueXXColumnModel.value;
        expect(model.equals(valueXXColumnModel)).toBeTruthy();

        // Test that they are not equal.
        model.value = valueXXColumnModel.value + 1;
        expect(model.equals(valueXXColumnModel)).toBeFalsy();

        // Check with a random other column option.
        expect(model.equals(new BookColumnOption())).toBeFalsy();
    });

    it('Test create legacy model', () => {
        // Try without the required params.
        const data: any = {
            options: ''
        };
        let model: ValueXXColumnOption = ValueXXColumnOption.createModelLegacy(data);
        expect(model).not.toBeDefined();

        // Try with valid options.
        data.shockValue = 2;
        model = ValueXXColumnOption.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.value).toBe(2);
        expect(data.shockValue).not.toBeDefined();
    });
});
