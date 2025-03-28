import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {CustomTitleColumnOption} from './custom-title-column-option.model';

/**
 * Test case for custom-title-column-option model
 */
describe('Custom Title Column Option model test', () => {
    let customTitleColumnOption: CustomTitleColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(CustomTitleColumnOption.CONFIG_TYPE, CustomTitleColumnOption);
    });

    beforeEach(() => {
        customTitleColumnOption = new CustomTitleColumnOption();
        customTitleColumnOption.customTitle = 'Custom Column';
    });

    it('Test model initialization', () => {
        expect(customTitleColumnOption).not.toBeUndefined();
        expect(customTitleColumnOption).not.toBeNull();
        expect(customTitleColumnOption.customTitle).toBe('Custom Column');
    });

    it('test CreateRequest Params', () => {
        let optionValues: any = {};
        customTitleColumnOption.addRequestParams(optionValues);
        expect(optionValues.title).not.toBeUndefined();
        expect(optionValues.title).not.toBeNull();
        expect(optionValues.title).toBe('Custom Column');

        customTitleColumnOption.customTitle = '';
        optionValues = {};
        customTitleColumnOption.addRequestParams(optionValues);
        expect(optionValues.title).toBeUndefined();
    });


    it('Test serialize', () => {
        let data = customTitleColumnOption.serialize(false);
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.customTitle).toBe('Custom Column');

        customTitleColumnOption.customTitle = '';
        data = customTitleColumnOption.serialize(false);
        expect(data).toBeUndefined();
    });

    it('Test deserialize', () => {
        const data: any = {
            customTitle: 'Custom Column'
        };
        const model: CustomTitleColumnOption = new CustomTitleColumnOption(data);

        expect(model).not.toBeUndefined();
        expect(model).not.toBeNull();
        expect(model.customTitle).toBe('Custom Column');
    });

    it('Test create from factory', () => {
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(CustomTitleColumnOption.CONFIG_TYPE);

        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof CustomTitleColumnOption).toBeTruthy();
    });

    it('Test equals', () => {
        const model1: CustomTitleColumnOption = new CustomTitleColumnOption();
        const model2: CustomTitleColumnOption = new CustomTitleColumnOption();
        expect(model1.equals(model2)).toBeTruthy();
        model1.customTitle = 'Column 1';
        model2.customTitle = 'Column 2';
        expect(model1.equals(model2)).toBeFalsy();

        model1.customTitle = 'Column 2';
        expect(model1.equals(model2)).toBeTruthy();
    });

    it('Test creteModelLegacy', () => {
        let data: any = {
            column: 'Column1'
        };
        expect(CustomTitleColumnOption.createModelLegacy(data)).toBeUndefined();

        data = {
            title: 'Column1'
        };

        const customTitleColOption = CustomTitleColumnOption.createModelLegacy(data);
        expect(customTitleColOption).toBeDefined();
        expect(customTitleColOption.customTitle).toBe('Column1');
        expect(data.title).toBeUndefined();

    });

    it('Test isValid', () => {
        const model1: CustomTitleColumnOption = new CustomTitleColumnOption();
        expect(model1.isValid()).toBeFalsy();

        model1.customTitle = null;
        expect(model1.isValid()).toBeFalsy();

        model1.customTitle = '';
        expect(model1.isValid()).toBeFalsy();

        model1.customTitle = 'Column1';
        expect(model1.isValid()).toBeTruthy();
    });

    it('test getModifiedColumnTitle Params', () => {
        const modifiedTitle = customTitleColumnOption.getModifiedColumnTitle('Market Value');
        expect(modifiedTitle).toBe('Custom Column');
    });
});
