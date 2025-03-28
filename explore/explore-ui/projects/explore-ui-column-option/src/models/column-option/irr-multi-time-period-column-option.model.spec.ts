import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {IrrMultiTimePeriodColumnOption} from './irr-multi-time-period-column-option.model';

describe('Irr Multi-Time Period Column Option', () => {

    let irrMultiTimePeriodColumnOptionModel: IrrMultiTimePeriodColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(IrrMultiTimePeriodColumnOption.CONFIG_TYPE, IrrMultiTimePeriodColumnOption);
    });

    beforeEach(() => {
        irrMultiTimePeriodColumnOptionModel = new IrrMultiTimePeriodColumnOption();
        irrMultiTimePeriodColumnOptionModel.selectedTimePeriods = ['ONE_YEAR', 'THREE_YEARS'];
    });

    it('Test model initialization', () => {
        expect(irrMultiTimePeriodColumnOptionModel).not.toBeUndefined();
        expect(irrMultiTimePeriodColumnOptionModel).not.toBeNull();
        expect(irrMultiTimePeriodColumnOptionModel.selectedTimePeriods).toStrictEqual(['ONE_YEAR', 'THREE_YEARS']);
    });

    it('test CreateRequest Params', () => {
        const optionKey = 'selectedIRR';
        let optionValues: any = {};
        irrMultiTimePeriodColumnOptionModel.addRequestParams(optionValues);
        expect(optionValues[optionKey]).not.toBeUndefined();
        expect(optionValues[optionKey]).not.toBeNull();
        expect(optionValues[optionKey]).toStrictEqual(['ONE_YEAR', 'THREE_YEARS']);

        irrMultiTimePeriodColumnOptionModel.selectedTimePeriods = [];
        optionValues = {};
        irrMultiTimePeriodColumnOptionModel.addRequestParams(optionValues);
        expect(optionValues[optionKey]).toBeUndefined();
    });

    it('Test serialize', () => {
        let data: any = irrMultiTimePeriodColumnOptionModel.serialize(false);
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.configType).toBe(irrMultiTimePeriodColumnOptionModel.configType);
        expect(data.selectedIRR).toBe(irrMultiTimePeriodColumnOptionModel.selectedTimePeriods);

        irrMultiTimePeriodColumnOptionModel.selectedTimePeriods = null;
        data = irrMultiTimePeriodColumnOptionModel.serialize(false);
        expect(data).toBeUndefined();
    });

    it('Test deserialize', () => {
        const data: any = {
            selectedIRR: ['ONE_YEAR', 'THREE_YEARS']
        };
        const model: IrrMultiTimePeriodColumnOption = new IrrMultiTimePeriodColumnOption(data);
        expect(model).not.toBeUndefined();
        expect(model).not.toBeNull();
        expect(model.selectedTimePeriods).toStrictEqual(['ONE_YEAR', 'THREE_YEARS']);
    });

    it('Test create from factory', () => {
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(IrrMultiTimePeriodColumnOption.CONFIG_TYPE);

        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof IrrMultiTimePeriodColumnOption).toBeTruthy();
    });

    it('Test equals', () => {
        const model1: IrrMultiTimePeriodColumnOption = new IrrMultiTimePeriodColumnOption();
        const model2: IrrMultiTimePeriodColumnOption = new IrrMultiTimePeriodColumnOption();
        expect(model1.equals(model2)).toBeTruthy();
        model1.selectedTimePeriods = ['ONE_YEAR'];
        model2.selectedTimePeriods = ['THREE_YEARS'];
        expect(model1.equals(model2)).toBeFalsy();

        model1.selectedTimePeriods = ['THREE_YEARS'];
        expect(model1.equals(model2)).toBeTruthy();
    });

    it('Test isValid', () => {
        const model1: IrrMultiTimePeriodColumnOption = new IrrMultiTimePeriodColumnOption();
        expect(model1.isValid()).toBeFalsy();

        model1.selectedTimePeriods = null;
        expect(model1.isValid()).toBeFalsy();

        model1.selectedTimePeriods = undefined;
        expect(model1.isValid()).toBeFalsy();

        model1.selectedTimePeriods = [];
        expect(model1.isValid()).toBeFalsy();

        model1.selectedTimePeriods = ['THREE_YEARS'];
        expect(model1.isValid()).toBeTruthy();
    });

});

