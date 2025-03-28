import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {CustomDxsColumnOption} from './custom-dxs-column-option.model';

describe('Custom Dxs Column Option', () => {
    let customDxsColumnOption: CustomDxsColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(CustomDxsColumnOption.CONFIG_TYPE, CustomDxsColumnOption);
    });

    beforeEach(() => {
        customDxsColumnOption = new CustomDxsColumnOption();
    });

    it('test getModifiedColumnTitle Params', () => {
        const modifiedTitle = customDxsColumnOption.getModifiedColumnTitle('Custom Dxs');
        expect(modifiedTitle).toBe('Custom Dxs (A)');
    });

    it('test CreateRequest Params', () => {
        let optionValues: any = {};
        customDxsColumnOption.addRequestParams(optionValues);
        expect(optionValues.isOasBased).toBeUndefined();

        customDxsColumnOption.isOasBased = false;
        optionValues = {};
        customDxsColumnOption.addRequestParams(optionValues);
        expect(optionValues['isOasBased']).toBeFalsy();

        customDxsColumnOption.floor = 5;
        customDxsColumnOption.cap = 1;
        customDxsColumnOption.useDurationForEuroGovtBonds = false;
        customDxsColumnOption.addRequestParams(optionValues);
        expect(optionValues['floor']).toEqual(5);
        expect(optionValues['cap']).toEqual(1);
        expect(optionValues['isOasBased']).toBeFalsy();
        expect(optionValues['useDurationForEuroGovtBonds']).toBeFalsy();
    });

    it('Test serialize', () => {
        let data: any = customDxsColumnOption.serialize(false);
        expect(data.cap).toBeUndefined();
        expect(data.isOasBased).toBeUndefined();

        customDxsColumnOption.cap = 2;
        customDxsColumnOption.floor = 5;
        customDxsColumnOption.isOasBased = false;
        customDxsColumnOption.useDurationForEuroGovtBonds = true;
        data = customDxsColumnOption.serialize(false);
        expect(data.isOasBased).toBeFalsy();
        expect(data.cap).toEqual(2);
        expect(data.floor).toEqual(5);
        expect(data.useDurationForEuroGovtBonds).toBeTruthy();
    });

    it('Test deserialize', () => {
        const data: any = {
            isOasBased: true,
            floor: 5,
            cap: 2,
            useDurationForEuroGovtBonds: false
        };
        const newCustomDxsColumnOption = new CustomDxsColumnOption();
        newCustomDxsColumnOption.deserialize(data);
        expect(newCustomDxsColumnOption).not.toBeUndefined();
        expect(newCustomDxsColumnOption).not.toBeNull();
        expect(newCustomDxsColumnOption.isOasBased).toBeTruthy();
        expect(newCustomDxsColumnOption.floor).toEqual(5);
        expect(newCustomDxsColumnOption.cap).toEqual(2);
        expect(newCustomDxsColumnOption.useDurationForEuroGovtBonds).toBeFalsy();
    });

    it('Test create from factory', () => {
        const defaultSettings = {
            columnOptionAttributes: [
                {
                    title: 'Spread Type',
                    defaultValue: {
                        value: false,
                        label: 'Alternative OAS (LIBOR)'
                    },
                    values: [
                        {value: true, label: 'OAS (Government)'},
                        {value: false, label: 'Alternative OAS (LIBOR)'}
                    ]
                },
                {title: 'Floor (bp)'},
                {title: 'Cap (bp)'},
                {title: 'Use duration for EUR denominated government bonds'}
            ],
            columnOptionConfigType: 'dxsColumnOptions',
            columnOptionTitle: 'Additional Settings'
        };
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(CustomDxsColumnOption.CONFIG_TYPE, defaultSettings);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof CustomDxsColumnOption).toBeTruthy();
    });

    it('Test create legacy model', () => {
        // Try without the required params.
        const data: any = {
            options: ''
        };
        let model: CustomDxsColumnOption = CustomDxsColumnOption.createModelLegacy(data);
        expect(model).not.toBeDefined();

        // Try with valid options.
        data.isOasBased = false;
        data.cap = 2;
        data.floor = 5;
        data.useDurationForEuroGovtBonds = false;
        model = CustomDxsColumnOption.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.isOasBased).toBeFalsy();
        expect(model.useDurationForEuroGovtBonds).toBeFalsy();
        expect(model.cap).toEqual(2);
        expect(model.floor).toEqual(5);
    });

    it('Test equals', () => {
        const model1: CustomDxsColumnOption = new CustomDxsColumnOption();
        const model2: CustomDxsColumnOption = new CustomDxsColumnOption();
        expect(model1.equals(model2)).toBeTruthy();
        model1.isOasBased = false;
        model2.isOasBased = true;
        expect(model1.equals(model2)).toBeFalsy();

        model2.isOasBased = false;
        model1.cap = 2;
        model2.cap = 2;
        model1.floor = 5;
        model2.floor = 5;
        expect(model1.equals(model2)).toBeTruthy();
    });

    it('Test isValid', () => {
        const model1: CustomDxsColumnOption = new CustomDxsColumnOption();
        expect(model1.isValid()).toBeFalsy();
        model1.isOasBased = false;
        expect(model1.isValid()).toBeTruthy();
        model1.cap = 2;
        expect(model1.isValid()).toBeTruthy();
    });
});
