import {ColumnOptionFactory, DateValue} from '@blk/explore-ui-core';
import {EconomyExposureDateVaryColumnOptionModel} from './economy-exposure-date-vary-column-option.model';

/**
 * Test cases for Override date column option model
 */
describe('Economy Exposure Date Vary', () => {
    let optionModel: EconomyExposureDateVaryColumnOptionModel;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(EconomyExposureDateVaryColumnOptionModel.CONFIG_TYPE, EconomyExposureDateVaryColumnOptionModel);
    });

    beforeEach(() => {
        optionModel = new EconomyExposureDateVaryColumnOptionModel();
        optionModel.overrideDateTypes = ['PRIOR_DAY', 'MONTH_END'];
        optionModel.customOverrideDateLabel = 'Custom Label';
        optionModel.multiOverrideDateTypeFrequency = 'WEEKLY';
        optionModel.numberOfObservations = 2;
        optionModel.startDate = DateValue.newDate('Start Date');
        optionModel.endDate = DateValue.newDate('End Date');
        optionModel.compareToCurrentType = 'COMPARE_TO_CURRENT';
        optionModel.appendReportDate = false;
        optionModel.dateType = 'test';
    });

    it('Test model initialization', () => {
        expect(optionModel).not.toBeUndefined();
        expect(optionModel).not.toBeNull();
        expect(optionModel.overrideDateTypes.length).toBe(2);
        expect(optionModel.overrideDateTypes[0]).toBe('PRIOR_DAY');
        expect(optionModel.overrideDateTypes[1]).toBe('MONTH_END');
        expect(optionModel.customOverrideDateLabel).toBe('Custom Label');
        expect(optionModel.multiOverrideDateTypeFrequency).toBe('WEEKLY');
        expect(optionModel.numberOfObservations).toBe(2);
        expect(optionModel.startDate).toStrictEqual(DateValue.newDate('Start Date'));
        expect(optionModel.endDate).toStrictEqual(DateValue.newDate('End Date'));
        expect(optionModel.compareToCurrentType).toBe('COMPARE_TO_CURRENT');
        expect(optionModel.appendReportDate).toBeFalsy();
    });


    it('Test serialize', () => {
        let data = optionModel.serialize(false);
        expect(data.overrideDateTypes.length).toBe(2);
        expect(data.overrideDateTypes[0]).toBe('PRIOR_DAY');
        expect(data.overrideDateTypes[1]).toBe('MONTH_END');
        expect(data.customOverrideDateLabel).toBe('Custom Label');
        expect(data.multiOverrideDateTypeFrequency).toBe('WEEKLY');
        expect(data.numberOfObservations).toBe(2);
        expect(data.startDate).toStrictEqual({
            'date': 'Start Date',
            'dateString': false
        });
        expect(data.endDate).toStrictEqual({
            'date': 'End Date',
            'dateString': false
        });
        expect(data.compareToCurrentType).toBe('COMPARE_TO_CURRENT');
        expect(data.appendReportDate).toBe(false);

        optionModel = new EconomyExposureDateVaryColumnOptionModel();
        data = optionModel.serialize(false);
        expect(data).toBeUndefined();
    });

    it('Test deserialize', () => {
        const data: any = {
            overrideDateTypes: ['PRIOR_DAY', 'MONTH_END'],
            customOverrideDateLabel: 'Custom Label',
            multiOverrideDateTypeFrequency: 'WEEKLY',
            numberOfObservations: 2,
            startDate: 'Start Date',
            endDate: 'End Date',
            compareToCurrentType: 'COMPARE_TO_CURRENT'
        };
        const model: EconomyExposureDateVaryColumnOptionModel = new EconomyExposureDateVaryColumnOptionModel(data);

        expect(model.overrideDateTypes.length).toBe(2);
        expect(model.overrideDateTypes[0]).toBe('PRIOR_DAY');
        expect(model.overrideDateTypes[1]).toBe('MONTH_END');
        expect(model.customOverrideDateLabel).toBe('Custom Label');
        expect(model.multiOverrideDateTypeFrequency).toBe('WEEKLY');
        expect(model.numberOfObservations).toBe(2);
        expect(model.startDate).toStrictEqual(DateValue.newDate('Start Date'));
        expect(model.endDate).toStrictEqual(DateValue.newDate('End Date'));
        expect(model.compareToCurrentType).toBe('COMPARE_TO_CURRENT');
        expect(model.appendReportDate).toBeUndefined();

        const data2: any = {
            startDate: {
                dateString: true,
                dateStringValue: 'T-1',
                date: '02/01/2023'
            },
            endDate: {
                dateString: true,
                dateStringValue: 'T-1',
                date: '02/05/2023'
            }
        };
        const model2: EconomyExposureDateVaryColumnOptionModel = new EconomyExposureDateVaryColumnOptionModel(data2);
        expect(model2.startDate.date).toBeUndefined();
        expect(model2.endDate.date).toBeUndefined();
    });

    it('Test isValid', () => {
        const model1: EconomyExposureDateVaryColumnOptionModel = new EconomyExposureDateVaryColumnOptionModel();
        expect(model1.isValid()).toBeFalsy();

        model1.dateType = 'test';
        expect(model1.isValid()).toBeTruthy();
    });
});
