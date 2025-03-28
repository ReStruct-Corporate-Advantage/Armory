import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {TimeToMaturityColumnOption} from './time-to-maturity-column-option.model';

describe('Time to Maturity column options', () => {

    let timeToMaturityColumnOption: TimeToMaturityColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(TimeToMaturityColumnOption.CONFIG_TYPE, TimeToMaturityColumnOption);
    });

    beforeEach(() => {
        timeToMaturityColumnOption = new TimeToMaturityColumnOption();
    });

    it('Test model initialization', () => {
        const defaultSettings = {
            columnOptionAttributes: [{
                defaultValue: {
                    value: 'DAYS'
                }
            }]
        };
        timeToMaturityColumnOption.initialize(defaultSettings);
        expect(timeToMaturityColumnOption).not.toBeUndefined();
        expect(timeToMaturityColumnOption).not.toBeNull();
        expect(timeToMaturityColumnOption.decimalPlaces).toBe(0);
        expect(timeToMaturityColumnOption.timeUnit).toBe('DAYS');
        expect(timeToMaturityColumnOption.customScalingBandsDays).toBeUndefined();
        expect(timeToMaturityColumnOption.customScalingBandsMonths).toBeUndefined();

        defaultSettings.columnOptionAttributes[0].defaultValue.value = 'Custom';
        timeToMaturityColumnOption.initialize(defaultSettings);
        expect(timeToMaturityColumnOption).not.toBeUndefined();
        expect(timeToMaturityColumnOption).not.toBeNull();
        expect(timeToMaturityColumnOption.decimalPlaces).toBe(0);
        expect(timeToMaturityColumnOption.timeUnit).toBe('Custom');
        expect(timeToMaturityColumnOption.customScalingBandsDays).toBe(90);
        expect(timeToMaturityColumnOption.customScalingBandsMonths).toBe(24);
    });

    it('test CreateRequest Params', () => {
        let optionValues: any = {};
        timeToMaturityColumnOption.timeUnit = 'Custom';
        timeToMaturityColumnOption.decimalPlaces = 2;
        timeToMaturityColumnOption.customScalingBandsDays = 90;
        timeToMaturityColumnOption.customScalingBandsMonths = 24;
        timeToMaturityColumnOption.addRequestParams(optionValues);
        expect(optionValues.decimalPlaces).toBe(2);
        expect(optionValues.timeUnit).toBe('Custom');
        expect(optionValues.customScalingBandsDays).toBe(90);
        expect(optionValues.customScalingBandsMonths).toBe(24);

        optionValues = {};
        timeToMaturityColumnOption = new TimeToMaturityColumnOption();
        timeToMaturityColumnOption.timeUnit = 'DAYS';
        timeToMaturityColumnOption.decimalPlaces = 2;
        timeToMaturityColumnOption.addRequestParams(optionValues);
        expect(optionValues.decimalPlaces).toBe(2);
        expect(optionValues.timeUnit).toBe('DAYS');
        expect(optionValues.customScalingBandsDays).toBeUndefined();
        expect(optionValues.customScalingBandsMonths).toBeUndefined();
    });

    it('Test serialize/deserialize', () => {
        timeToMaturityColumnOption.timeUnit = 'Custom';
        timeToMaturityColumnOption.decimalPlaces = 2;
        timeToMaturityColumnOption.customScalingBandsDays = 90;
        timeToMaturityColumnOption.customScalingBandsMonths = 24;
        const data: any = timeToMaturityColumnOption.serialize(false);
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.configType).toBe(timeToMaturityColumnOption.configType);
        expect(data.decimalPlaces).toBe(timeToMaturityColumnOption.decimalPlaces);
        expect(data.timeUnit).toBe(timeToMaturityColumnOption.timeUnit);
        expect(data.customScalingBandsMonths).toBe(timeToMaturityColumnOption.customScalingBandsMonths);
        expect(data.customScalingBandsDays).toBe(timeToMaturityColumnOption.customScalingBandsDays);


        const newTimeToMaturityColumnOption = new TimeToMaturityColumnOption();
        newTimeToMaturityColumnOption.deserialize(data);
        expect(newTimeToMaturityColumnOption.decimalPlaces).toBe(timeToMaturityColumnOption.decimalPlaces);
        expect(newTimeToMaturityColumnOption.timeUnit).toBe(timeToMaturityColumnOption.timeUnit);
        expect(newTimeToMaturityColumnOption.customScalingBandsMonths).toBe(timeToMaturityColumnOption.customScalingBandsMonths);
        expect(newTimeToMaturityColumnOption.customScalingBandsDays).toBe(timeToMaturityColumnOption.customScalingBandsDays);
    });


    it('Test create from factory', () => {
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(TimeToMaturityColumnOption.CONFIG_TYPE);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof TimeToMaturityColumnOption).toBeTruthy();
    });

    it('Test create legacy model', () => {
        // Try without the required params.
        const data: any = {
            options: ''
        };
        let model: TimeToMaturityColumnOption = TimeToMaturityColumnOption.createModelLegacy(data);
        expect(model).not.toBeDefined();

        // Try with valid options.
        data.decimalPlaces = 4;
        data.timeUnit = 'Custom';
        data.scaling = 100;
        data.customScalingBandsDays = 90;
        data.customScalingBandsMonths = 24;

        model = TimeToMaturityColumnOption.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.decimalPlaces).toBe(4);
        expect(model.timeUnit).toBe('Custom');
        expect(model.customScalingBandsDays).toBe(90);
        expect(model.customScalingBandsMonths).toBe(24);
        expect(data.decimalPlaces).not.toBeDefined();
        expect(data.customScalingBandsDays).not.toBeDefined();
        expect(data.timeUnit).not.toBeDefined();
        expect(data.customScalingBandsMonths).not.toBeDefined();
    });

    it('Test equals', () => {
        const model1: TimeToMaturityColumnOption = new TimeToMaturityColumnOption();
        const model2: TimeToMaturityColumnOption = new TimeToMaturityColumnOption();
        expect(model1.equals(model2)).toBeTruthy();

        // Different number of decimal places
        model1.decimalPlaces = 2;
        model1.timeUnit = 'Custom';
        model1.customScalingBandsDays = 90;
        model1.customScalingBandsMonths = 24;
        model2.decimalPlaces = 4;
        model2.timeUnit = 'Custom';
        model2.customScalingBandsDays = 90;
        model2.customScalingBandsMonths = 24;
        expect(model1.equals(model2)).toBeFalsy();

        // Different timeUnit
        model2.decimalPlaces = 2;
        model2.timeUnit = 'DAYS';
        expect(model1.equals(model2)).toBeFalsy();

        // Different customScalingBandsDays
        model2.timeUnit = 'Custom';
        model2.customScalingBandsDays = 80;
        expect(model1.equals(model2)).toBeFalsy();

        // Different customScalingBandsMonths
        model2.customScalingBandsDays = 90;
        model2.customScalingBandsMonths = 12;
        expect(model1.equals(model2)).toBeFalsy();
        // Everything same
        model2.customScalingBandsMonths = 24;
        expect(model1.equals(model2)).toBeTruthy();
    });

    it('Test isValid', () => {
        timeToMaturityColumnOption = new TimeToMaturityColumnOption();
        expect(timeToMaturityColumnOption.isValid()).toBeFalsy();
        timeToMaturityColumnOption.timeUnit = 'DAYS';
        expect(timeToMaturityColumnOption.isValid()).toBeTruthy();
    });

});

