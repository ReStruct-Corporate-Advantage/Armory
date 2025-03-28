import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {AggregationColumnOption} from './aggregation-column-option.model';

describe('AggregationColumnOption', () => {
    let aggregationColumnModel: AggregationColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(AggregationColumnOption.CONFIG_TYPE, AggregationColumnOption);
    });

    beforeEach(() => {
        aggregationColumnModel = new AggregationColumnOption();
        aggregationColumnModel.value = 2;
    });

    it('Test model initialization', () => {
        expect(aggregationColumnModel).not.toBeUndefined();
        expect(aggregationColumnModel).not.toBeNull();
        expect(aggregationColumnModel.value).toBe(2);
    });

    it('test CreateRequest Params', () => {
        let optionValues: any = {};
        const optionKey = 'aggregationType';
        aggregationColumnModel.addRequestParams(optionValues);
        expect(optionValues[optionKey]).not.toBeUndefined();
        expect(optionValues[optionKey]).not.toBeNull();
        expect(optionValues[optionKey]).toBe(2);

        aggregationColumnModel.value = null;
        optionValues = {};
        aggregationColumnModel.addRequestParams(optionValues);
        expect(optionValues[optionKey]).toBeUndefined();
    });

    it('Test serialize', () => {
        let data = aggregationColumnModel.serialize();
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.configType).toBe(AggregationColumnOption.CONFIG_TYPE);
        expect(data.aggregationType).toBe(2);

        aggregationColumnModel.value = null;
        data = aggregationColumnModel.serialize();
        expect(data).toBeUndefined();
    });

    it('Test deserialize', () => {
        const data: any = {
            aggregationType: 5
        };
        const model: AggregationColumnOption = new AggregationColumnOption(data);
        expect(model).not.toBeUndefined();
        expect(model).not.toBeNull();
        expect(model.value).toBe(5);
    });

    it('Test create from factory', () => {
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(AggregationColumnOption.CONFIG_TYPE);

        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof AggregationColumnOption).toBeTruthy();
    });

    it('Test create legacy model', () => {
        // Try without the required params.
        const data: any = {
            options: ''
        };
        let model: AggregationColumnOption = AggregationColumnOption.createModelLegacy(data);
        expect(model).not.toBeDefined();

        // Try with valid options.
        data.aggregationType = 5;
        model = AggregationColumnOption.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.value).toBe(5);
        expect(data.aggregationType).not.toBeDefined();
    });

    it('Test equals', () => {
        const model1: AggregationColumnOption = new AggregationColumnOption();
        const model2: AggregationColumnOption = new AggregationColumnOption();
        expect(model1.equals(model2)).toBeTruthy();
        model1.value = 1;
        model2.value = 2;
        expect(model1.equals(model2)).toBeFalsy();

        model1.value = 2;
        expect(model1.equals(model2)).toBeTruthy();
    });

    it('Test isValid', () => {
        const model1: AggregationColumnOption = new AggregationColumnOption();
        expect(model1.isValid()).toBeFalsy();

        model1.value = null;
        expect(model1.isValid()).toBeFalsy();

        model1.value = -1;
        expect(model1.isValid()).toBeFalsy();

        model1.value = 2;
        expect(model1.isValid()).toBeTruthy();
    });
});
