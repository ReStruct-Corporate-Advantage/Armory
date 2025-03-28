import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {ChartTypeColumnOption} from './chart-type-column-option.model';

describe('ChartTypeColumnOption', () => {
    let chartTypeModel: ChartTypeColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(ChartTypeColumnOption.CONFIG_TYPE, ChartTypeColumnOption);
    });

    beforeEach(() => {
        chartTypeModel = new ChartTypeColumnOption();
        chartTypeModel.value = 'column';
    });

    it('Test model initialization', () => {
        expect(chartTypeModel).not.toBeUndefined();
        expect(chartTypeModel).not.toBeNull();
        expect(chartTypeModel.value).toBe('column');
    });

    it('Test serialize', () => {
        // the model is deprecated and no longer in use.
        expect(chartTypeModel.serialize()).toBeUndefined();
    });

    it('Test deserialize', () => {
        const data: any = {
            chartType: 'column'
        };
        const model: ChartTypeColumnOption = new ChartTypeColumnOption(data);
        expect(model).not.toBeUndefined();
        expect(model).not.toBeNull();
        expect(model.value).toBe('column');
    });

    it('Test create from factory', () => {
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(ChartTypeColumnOption.CONFIG_TYPE);

        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof ChartTypeColumnOption).toBeTruthy();
    });

    it('Test create legacy model', () => {
        // Try without the required params.
        const data: any = {
            options: ''
        };
        let model: ChartTypeColumnOption = ChartTypeColumnOption.createModelLegacy(data);
        expect(model).not.toBeDefined();

        // Try with valid options.
        data.chartType = 'column';
        model = ChartTypeColumnOption.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.value).toBe('column');
        expect(data.chartType).not.toBeDefined();
    });

    it('Test isValid', () => {
        const model1: ChartTypeColumnOption = new ChartTypeColumnOption();
        expect(model1.isValid()).toBeFalsy();

        model1.value = null;
        expect(model1.isValid()).toBeFalsy();

        model1.value = '';
        expect(model1.isValid()).toBeFalsy();

        model1.value = 'column';
        expect(model1.isValid()).toBeTruthy();
    });
});
