import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {EquityColumnOption} from './equity-column-option.model';

describe('EquityColumnOptionModel', () => {
    let equityColumnOption: EquityColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(EquityColumnOption.CONFIG_TYPE, EquityColumnOption);
    });

    beforeEach(() => {
        equityColumnOption = new EquityColumnOption();
    });

    it('Test model initialization', () => {
        expect(equityColumnOption).not.toBeUndefined();
        expect(equityColumnOption).not.toBeNull();
    });

    it('test CreateRequest Params', () => {
        let optionValues: any = {};
        equityColumnOption.addRequestParams(optionValues);
        expect(Object.keys(optionValues).length).toBe(0);

        equityColumnOption.noOfPeriods = 2;
        equityColumnOption.addRequestParams(optionValues);
        expect(Object.keys(optionValues).length).toBe(1);
        expect(optionValues['noOfYears']).toBe(2);


        equityColumnOption.noOfPeriods = 3;
        equityColumnOption.frequency = 'ANNUAL';
        optionValues = {};
        equityColumnOption.addRequestParams(optionValues);
        expect(Object.keys(optionValues).length).toBe(2);
        expect(optionValues['noOfYears']).toBe(3);
        expect(optionValues['frequency']).toBe('ANNUAL');

        equityColumnOption.noOfPeriods = 5;
        equityColumnOption.frequency = 'SEMI-ANNUAL';
        equityColumnOption.measureType = 'MEAN';
        optionValues = {};
        equityColumnOption.addRequestParams(optionValues);
        expect(Object.keys(optionValues).length).toBe(3);
        expect(optionValues['noOfYears']).toBe(5);
        expect(optionValues['frequency']).toBe('SEMI-ANNUAL');
        expect(optionValues['measureType']).toBe('MEAN');
    });

    it('Test serialize', () => {
        let data = equityColumnOption.serialize();
        expect(data).toBeUndefined();

        equityColumnOption.noOfPeriods = 2;
        data = equityColumnOption.serialize();
        expect(Object.keys(data).length).toBe(2);
        expect(data.noOfPeriods).toBe(2);

        equityColumnOption.noOfPeriods = 3;
        equityColumnOption.frequency = 'ANNUAL';
        data = equityColumnOption.serialize();
        expect(Object.keys(data).length).toBe(3);
        expect(data.noOfPeriods).toBe(3);
        expect(data.frequency).toBe('ANNUAL');

        equityColumnOption.noOfPeriods = 5;
        equityColumnOption.frequency = 'SEMI-ANNUAL';
        equityColumnOption.measureType = 'MEAN';
        data = equityColumnOption.serialize();
        expect(Object.keys(data).length).toBe(4);
        expect(data.noOfPeriods).toBe(5);
        expect(data.frequency).toBe('SEMI-ANNUAL');
        expect(data.measureType).toBe('MEAN');
    });

    it('Test deserialize', () => {
        let data: any = {
            noOfPeriods: 5,
            frequency: 'ANNUAL',
            measureType: 'MEAN'
        };
        let model = new EquityColumnOption(data);
        expect(model).not.toBeUndefined();
        expect(model).not.toBeNull();
        expect(model.noOfPeriods).toBe(5);
        expect(model.frequency).toBe('ANNUAL');
        expect(model.measureType).toBe('MEAN');

        data = {
            noOfYears: 5,
            frequency: 'ANNUAL'
        };
        model = new EquityColumnOption(data);
        expect(model).not.toBeUndefined();
        expect(model).not.toBeNull();
        expect(model.noOfPeriods).toBe(5);
        expect(model.frequency).toBe('ANNUAL');
        expect(model.measureType).toBeUndefined();
    });

    it('Test create from factory', () => {
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(EquityColumnOption.CONFIG_TYPE);

        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof EquityColumnOption).toBeTruthy();
    });

    it('Test create legacy model', () => {
        // Try without the required params.
        const data: any = {
            options: ''
        };
        let model = EquityColumnOption.createModelLegacy(data);
        expect(model).not.toBeDefined();

        // Try with valid options.
        data.noOfYears = 5;
        data.frequency = 'ANNUAL';
        data.measureType = 'MEAN';
        model = EquityColumnOption.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.noOfPeriods).toBe(5);
        expect(model.frequency).toBe('ANNUAL');
        expect(model.measureType).toBe('MEAN');
        expect(data.noOfYears).not.toBeDefined();
        expect(data.frequency).not.toBeDefined();
        expect(data.measureType).not.toBeDefined();
    });


    it('Test initialize', () => {
        const defaultSettings: any = {
            columnOptionAttributes: [
                {key: 'noOfYears', defaultValue: {value: 10}},
                {key: 'frequency', defaultValue: {value: 'ANNUAL'}},
                {key: 'measureType', defaultValue: {value: 'MEAN'}}
            ]
        };
        const model = new EquityColumnOption();
        model.initialize(defaultSettings);
        expect(model.noOfPeriods).toBe(10);
        expect(model.frequency).toBe('ANNUAL');
        expect(model.measureType).toBe('MEAN');
    });


    it('Test equals', () => {
        const model1: EquityColumnOption = new EquityColumnOption();
        const model2: EquityColumnOption = new EquityColumnOption();
        expect(model1.equals(model2)).toBeTruthy();

        model1.noOfPeriods = 1;
        model1.frequency = 'ANNUAL';
        model1.measureType = 'MEAN';
        model2.noOfPeriods = 2;
        model2.frequency = 'ANNUAL';
        model2.measureType = 'MEAN';
        expect(model1.equals(model2)).toBeFalsy();

        model1.noOfPeriods = 2;
        model1.frequency = 'SEMI-ANNUAL';
        expect(model1.equals(model2)).toBeFalsy();

        model1.frequency = 'ANNUAL';
        model1.measureType = 'MEDIAN';
        expect(model1.equals(model2)).toBeFalsy();

        model1.measureType = 'MEAN';
        expect(model1.equals(model2)).toBeTruthy();
    });

    it('Test isValid', () => {
        const model1: EquityColumnOption = new EquityColumnOption();
        expect(model1.isValid()).toBeFalsy();

        model1.noOfPeriods = 1;
        expect(model1.isValid()).toBeTruthy();

        model1.frequency = 'ANNUAL';
        expect(model1.isValid()).toBeTruthy();

        model1.measureType = 'MEAN';
        expect(model1.isValid()).toBeTruthy();
    });
});
