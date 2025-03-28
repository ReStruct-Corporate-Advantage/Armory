import {ColumnOptionFactory} from '@blk/explore-ui-core';
import {ActiveCalculationColumnOption} from './active-calculation-column-option.model';
import {SecurityDescriptionColumnOption} from './security-description-column-option.model';

describe('Security description column options model test', () => {
    let columnOption: SecurityDescriptionColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(SecurityDescriptionColumnOption.CONFIG_TYPE, SecurityDescriptionColumnOption);
    });

    beforeEach(() => {
        columnOption = new SecurityDescriptionColumnOption();
        columnOption.value = 'TICKER';
    });

    it('Test model initialization', () => {
        expect(columnOption).not.toBeUndefined();
        expect(columnOption).not.toBeNull();
        expect(columnOption.value).toBe('TICKER');
    });

    it('test CreateRequest Params', () => {
        const optionValues: any = {};
        columnOption.addRequestParams(optionValues);
        expect(optionValues.secDescDisplay).not.toBeUndefined();
        expect(optionValues.secDescDisplay).not.toBeNull();
        expect(optionValues.secDescDisplay).toBe('TICKER');
    });

    it('Test serialize', () => {
        const data = columnOption.serialize(false);
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.secDescDisplay).toBe('TICKER');
    });

    it('Test deserialize', () => {
        const data: any = {
            secDescDisplay: 'ASSET_ID'
        };
        const model = new SecurityDescriptionColumnOption(data);

        expect(model).not.toBeUndefined();
        expect(model).not.toBeNull();
        expect(model.value).toBe('ASSET_ID');
    });

    it('Test create from factory', () => {
        const defaultValue = {columnOptionAttributes: [{'defaultValue': {value: 'NAME', label: 'Name'}}]};
        const model = ColumnOptionFactory.createNewModel(SecurityDescriptionColumnOption.CONFIG_TYPE, defaultValue);

        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof SecurityDescriptionColumnOption).toBeTruthy();

        const secDescModel = model as SecurityDescriptionColumnOption;
        expect(secDescModel.value).toBe('NAME');
    });

    it('Test create legacy model', () => {
        // Try without the required params.
        const data: any = {};
        let model = SecurityDescriptionColumnOption.createModelLegacy(data);
        expect(model).not.toBeDefined();

        // Try with valid options.
        data.secDescDisplay = 'TICKER';
        model = SecurityDescriptionColumnOption.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.value).toBe('TICKER');
    });

    it('Test equals', () => {
        expect(columnOption.equals(columnOption)).toBeTruthy();

        // Create another one the same and ensure it is still equal.
        const other = new SecurityDescriptionColumnOption(columnOption.serialize());
        expect(columnOption.equals(other)).toBeTruthy();

        // Change the value and ensure no longer equal.
        other.value = '123';
        expect(columnOption.equals(other)).toBeFalsy();

        // Try with a random other option.
        expect(columnOption.equals(new ActiveCalculationColumnOption())).toBeFalsy();
    });
});

