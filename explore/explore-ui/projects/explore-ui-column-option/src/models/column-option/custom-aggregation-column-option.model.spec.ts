import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {CustomAggregationColumnOption} from './custom-aggregation-column-option.model';

describe('CustomAggregationColumnOptionModel', () => {
    let customAggregationColumnOption: CustomAggregationColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(CustomAggregationColumnOption.CONFIG_TYPE, CustomAggregationColumnOption);
    });

    beforeEach(() => {
        customAggregationColumnOption = new CustomAggregationColumnOption();
    });

    it('Test model initialization', () => {
        expect(customAggregationColumnOption).not.toBeUndefined();
        expect(customAggregationColumnOption).not.toBeNull();
        expect(customAggregationColumnOption.excludeNullValues).toBe(true);
    });

    it('test CreateRequest Params', () => {
        const optionValues: any = {};
        customAggregationColumnOption.addRequestParams(optionValues);
        expect(Object.keys(optionValues).length).toBe(0);

        customAggregationColumnOption.excludeOrCap = true;
        customAggregationColumnOption.maxAggValue = 10;
        customAggregationColumnOption.minAggValue = 2;
        customAggregationColumnOption.weightType = 'PORT';
        customAggregationColumnOption.colWeightType = 'NOTIONAL';
        customAggregationColumnOption.addRequestParams(optionValues);
        expect(Object.keys(optionValues).length).toBe(0);

        customAggregationColumnOption.subtotalType = 2300;
        customAggregationColumnOption.addRequestParams(optionValues);
        expect(Object.keys(optionValues).length).toBe(7);
        expect(optionValues[CustomAggregationColumnOption.EXCLUDE_OR_CAP]).toBe(true);
        expect(optionValues[CustomAggregationColumnOption.MAX_AGG_VALUE]).toBe(10);
        expect(optionValues[CustomAggregationColumnOption.MIN_AGG_VALUE]).toBe(2);
        expect(optionValues[CustomAggregationColumnOption.WEIGHT_TYPE]).toBe('PORT');
        expect(optionValues[CustomAggregationColumnOption.COL_WEIGHT_TYPE]).toBe('NOTIONAL');
        expect(optionValues[CustomAggregationColumnOption.SUBTOTAL_TYPE]).toBe(2300);
        expect(optionValues[CustomAggregationColumnOption.EXCLUDE_NULL_VALUES]).toBe(true);
    });

    it('Test serialize', () => {
        let data = customAggregationColumnOption.serialize();
        expect(data).toBeUndefined();

        customAggregationColumnOption.excludeOrCap = true;
        customAggregationColumnOption.maxAggValue = 10;
        customAggregationColumnOption.minAggValue = 2;
        customAggregationColumnOption.weightType = 'PORT';
        customAggregationColumnOption.colWeightType = 'NOTIONAL';
        customAggregationColumnOption.subtotalType = 2300;
        customAggregationColumnOption.excludeNullValues = false;
        data = customAggregationColumnOption.serialize();
        expect(Object.keys(data).length).toBe(8);
        expect(data.excludeOrCap).toBe(true);
        expect(data.maxAggValue).toBe(10);
        expect(data.minAggValue).toBe(2);
        expect(data.weightType).toBe('PORT');
        expect(data.colWeightType).toBe('NOTIONAL');
        expect(data.subtotalType).toBe(2300);
        expect(data.excludeNullValues).toBe(false);
    });

    it('Test deserialize', () => {
        const data: any = {
            subtotalType: 2300,
            excludeOrCap: false,
            maxAggValue: 100,
            minAggValue: -4,
            weightType: 'ALL',
            colWeightType: 'NOTIONAL',
            excludeNullValues: false
        };
        const model = new CustomAggregationColumnOption(data);
        expect(model).not.toBeUndefined();
        expect(model).not.toBeNull();
        expect(model.excludeOrCap).toBe(false);
        expect(model.maxAggValue).toBe(100);
        expect(model.minAggValue).toBe(-4);
        expect(model.weightType).toBe('ALL');
        expect(model.colWeightType).toBe('NOTIONAL');
        expect(model.subtotalType).toBe(2300);
        expect(model.excludeNullValues).toBe(false);
    });

    it('Test create from factory', () => {
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(CustomAggregationColumnOption.CONFIG_TYPE);

        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof CustomAggregationColumnOption).toBeTruthy();
    });

    it('Test create legacy model', () => {
        // Try without the required params.
        const data: any = {
            excludeOrCap: false,
            maxAggValue: 100,
            minAggValue: -4,
            colWeightType: 'NOTIONAL'
        };
        let model = CustomAggregationColumnOption.createModelLegacy(data);
        expect(model).not.toBeDefined();

        // Try with valid options.
        data.subtotalType = 2300;
        data.weightType = 'PORT';
        model = CustomAggregationColumnOption.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.excludeOrCap).toBe(false);
        expect(model.maxAggValue).toBe(100);
        expect(model.minAggValue).toBe(-4);
        expect(model.weightType).toBe('PORT');
        expect(model.colWeightType).toBe('NOTIONAL');
        expect(model.subtotalType).toBe(2300);
        expect(data.excludeOrCap).not.toBeDefined();
        expect(data.maxAggValue).not.toBeDefined();
        expect(data.minAggValue).not.toBeDefined();
        expect(data.weightType).not.toBeDefined();
        expect(data.colWeightType).not.toBeDefined();
        expect(data.subtotalType).not.toBeDefined();
    });


    it('Test initialize', () => {
        const defaultSettings: any = {
            columnOptionAttributes: [
                {key: 'subtotalType', defaultValue: {value: 2300}},
                {key: 'minAggValue', defaultValue: {value: 0}},
                {key: 'maxAggValue', defaultValue: {value: 100}},
                {key: 'excludeOrCap', defaultValue: {value: false}},
                {key: 'weightType', defaultValue: {value: 'ALL'}},
                {key: 'colWeightType', defaultValue: {value: 'NOTIONAL'}}
            ]
        };
        const model = new CustomAggregationColumnOption();
        model.initialize(defaultSettings);
        expect(model.excludeOrCap).toBe(false);
        expect(model.maxAggValue).toBe(100);
        expect(model.minAggValue).toBe(0);
        expect(model.weightType).toBe('ALL');
        expect(model.colWeightType).toBe('NOTIONAL');
        expect(model.subtotalType).toBe(2300);
    });

    it('Test equals', () => {
        const model1: CustomAggregationColumnOption = new CustomAggregationColumnOption();
        const model2: CustomAggregationColumnOption = new CustomAggregationColumnOption();
        expect(model1.equals(model2)).toBeTruthy();

        model1.subtotalType = 2300;
        model1.excludeOrCap = true;
        model1.maxAggValue = 10;
        model1.minAggValue = 2;
        model1.weightType = 'PORT';
        model1.colWeightType = 'NOTIONAL';
        model2.subtotalType = 2301;
        model2.excludeOrCap = true;
        model2.maxAggValue = 10;
        model2.minAggValue = 2;
        model2.weightType = 'PORT';
        model2.colWeightType = 'NOTIONAL';
        expect(model1.equals(model2)).toBeFalsy();

        model2.subtotalType = 2300;
        model2.excludeOrCap = false;
        expect(model1.equals(model2)).toBeFalsy();

        model2.excludeOrCap = true;
        model2.maxAggValue = 100;
        expect(model1.equals(model2)).toBeFalsy();

        model2.maxAggValue = 10;
        model2.minAggValue = 1;
        expect(model1.equals(model2)).toBeFalsy();

        model2.minAggValue = 2;
        model2.weightType = 'ALL';
        expect(model1.equals(model2)).toBeFalsy();

        model2.weightType = 'PORT';
        model2.colWeightType = 'MARKET';
        expect(model1.equals(model2)).toBeFalsy();

        model2.colWeightType = 'NOTIONAL';
        expect(model1.equals(model2)).toBeTruthy();

        model2.excludeNullValues = false;
        expect(model1.equals(model2)).toBeFalsy();
    });

    it('Test isValid', () => {
        const model1: CustomAggregationColumnOption = new CustomAggregationColumnOption();
        expect(model1.isValid()).toBeFalsy();

        model1.subtotalType = 1;
        expect(model1.isValid()).toBeTruthy();
    });
});
