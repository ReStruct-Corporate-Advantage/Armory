import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {EuroBondColumnOption} from './euro-bond-column-option.model';

describe('EuroBondColumnOption', () => {
    let euroBondColumnOption: EuroBondColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(EuroBondColumnOption.CONFIG_TYPE, EuroBondColumnOption);
    });

    beforeEach(() => {
        euroBondColumnOption = new EuroBondColumnOption();
    });

    it('Test model initialization', () => {
        const defaultSettings = {
            columnOptionAttributes: [{
                key: 'useDurationForEuroGovtBonds',
                title: 'Use duration for EUR denominated government bonds'
            }]
        };
        euroBondColumnOption.initialize(defaultSettings);
        expect(euroBondColumnOption.useDurationForEuroGovtBonds).not.toBeUndefined();
        expect(euroBondColumnOption.useDurationForEuroGovtBonds).toBeFalsy();
    });

    it('test CreateRequest Params', () => {
        let optionValues: any = {};
        euroBondColumnOption.addRequestParams(optionValues);
        expect(optionValues.useDurationForEuroGovtBonds).toBeUndefined();

        euroBondColumnOption.useDurationForEuroGovtBonds = true;
        optionValues = {};
        euroBondColumnOption.addRequestParams(optionValues);
        expect(optionValues.useDurationForEuroGovtBonds).toBeTruthy();
    });

    it('Test serialize', () => {
        let data: any = euroBondColumnOption.serialize(false);
        expect(data).toBeUndefined();
        euroBondColumnOption.useDurationForEuroGovtBonds = false;
        data = euroBondColumnOption.serialize(false);
        expect(data.useDurationForEuroGovtBonds).toBeFalsy();
    });

    it('Test deserialize', () => {
        const data: any = {
            useDurationForEuroGovtBonds: true
        };
        const newEuroBondColumnOption = new EuroBondColumnOption();
        newEuroBondColumnOption.deserialize(data);
        expect(newEuroBondColumnOption).not.toBeUndefined();
        expect(newEuroBondColumnOption).not.toBeNull();
        expect(newEuroBondColumnOption.useDurationForEuroGovtBonds).toBeTruthy();
    });

    it('Test create from factory', () => {
        const defaultSettings = {
            columnOptionAttributes: [{
                key: 'useDurationForEuroGovtBonds',
                title: 'Use duration for EUR denominated government bonds'
            }]
        };
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(EuroBondColumnOption.CONFIG_TYPE, defaultSettings);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof EuroBondColumnOption).toBeTruthy();
    });

    it('Test create legacy model', () => {
        // Try without the required params.
        const data: any = {
            options: ''
        };
        let model: EuroBondColumnOption = EuroBondColumnOption.createModelLegacy(data);
        expect(model).not.toBeDefined();

        // Try with valid options.
        data.useDurationForEuroGovtBonds = false;
        model = EuroBondColumnOption.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.useDurationForEuroGovtBonds).toBeFalsy();
    });

    it('Test equals', () => {
        const model1: EuroBondColumnOption = new EuroBondColumnOption();
        const model2: EuroBondColumnOption = new EuroBondColumnOption();
        expect(model1.equals(model2)).toBeTruthy();
        model1.useDurationForEuroGovtBonds = false;
        model2.useDurationForEuroGovtBonds = true;
        expect(model1.equals(model2)).toBeFalsy();
    });

    it('Test isValid', () => {
        const model1: EuroBondColumnOption = new EuroBondColumnOption();
        expect(model1.isValid()).toBeFalsy();
        model1.useDurationForEuroGovtBonds = false;
        expect(model1.isValid()).toBeTruthy();
    });
});
