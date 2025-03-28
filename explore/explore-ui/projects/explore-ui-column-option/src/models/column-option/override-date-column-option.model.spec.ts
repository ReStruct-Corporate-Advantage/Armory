import {AbstractColumnOption, ColumnOptionFactory, DateValue} from '@blk/explore-ui-core';
import {OverrideDateColumnOption} from './override-date-column-option.model';

/**
 * Test cases for Override date column option model
 */
describe('Override Date', () => {
    let optionModel: OverrideDateColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(OverrideDateColumnOption.CONFIG_TYPE, OverrideDateColumnOption);
    });

    beforeEach(() => {
        optionModel = new OverrideDateColumnOption();
        optionModel.overrideDateTypes = ['PRIOR_DAY', 'MONTH_END'];
        optionModel.customOverrideDateLabel = 'Custom Label';
        optionModel.multiOverrideDateTypeFrequency = 'WEEKLY';
        optionModel.numberOfObservations = 2;
        optionModel.startDate = DateValue.newDate('Start Date');
        optionModel.endDate = DateValue.newDate('End Date');
        optionModel.compareToCurrentType = 'COMPARE_TO_CURRENT';
        optionModel.appendReportDate = false;
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

    it('test CreateRequest Params', () => {
        const optionValues: any = {};
        optionModel.addRequestParams(optionValues);

        expect(optionValues.overrideDate).not.toBeUndefined();
        expect(optionValues.overrideDate).not.toBeNull();
        expect(optionValues.overrideDate.overrideDateTypes.length).toBe(2);
        expect(optionValues.overrideDate.overrideDateTypes[0]).toBe('PRIOR_DAY');
        expect(optionValues.overrideDate.overrideDateTypes[1]).toBe('MONTH_END');
        expect(optionValues.overrideDate.customOverrideDateLabel).toBe('Custom Label');
        expect(optionValues.overrideDate.multiOverrideDateTypeFrequency).toBe('WEEKLY');
        expect(optionValues.overrideDate.numberOfObservations).toBe(2);
        expect(optionValues.overrideDate.startDate).toBe('Start Date');
        expect(optionValues.overrideDate.endDate).toBe('End Date');
        expect(optionValues.overrideDate.appendReportDate).toBeFalsy();

        expect(optionValues.compareToCurrent).not.toBeUndefined();
        expect(optionValues.compareToCurrent).not.toBeNull();
        expect(optionValues.compareToCurrent.compareToCurrentType).toBe('COMPARE_TO_CURRENT');
    });

    it('test CreateRequest Params with empty start and end date', () => {
        // set empty string for start date and end date.
        optionModel.startDate = DateValue.newDate('');
        optionModel.endDate = DateValue.newDate('');
        const optionValues: any = {};
        optionModel.addRequestParams(optionValues);

        expect(optionValues.overrideDate).not.toBeUndefined();
        expect(optionValues.overrideDate).not.toBeNull();
        expect(optionValues.overrideDate.overrideDateTypes.length).toBe(2);
        expect(optionValues.overrideDate.overrideDateTypes[0]).toBe('PRIOR_DAY');
        expect(optionValues.overrideDate.overrideDateTypes[1]).toBe('MONTH_END');
        expect(optionValues.overrideDate.customOverrideDateLabel).toBe('Custom Label');
        expect(optionValues.overrideDate.multiOverrideDateTypeFrequency).toBe('WEEKLY');
        expect(optionValues.overrideDate.numberOfObservations).toBe(2);
        expect(optionValues.overrideDate.startDate).toBeUndefined();
        expect(optionValues.overrideDate.endDate).toBeUndefined();
        expect(optionValues.overrideDate.appendReportDate).toBeFalsy();

        expect(optionValues.compareToCurrent).not.toBeUndefined();
        expect(optionValues.compareToCurrent).not.toBeNull();
        expect(optionValues.compareToCurrent.compareToCurrentType).toBe('COMPARE_TO_CURRENT');
    });

    it('test CreateRequest Params with multiOverrideDateTypeFrequency = monthly AND appendReportDate = true', () => {
        optionModel.multiOverrideDateTypeFrequency = 'MONTHLY';
        optionModel.appendReportDate = true;
        const optionValues: any = {};
        optionModel.addRequestParams(optionValues);

        expect(optionValues.overrideDate).not.toBeUndefined();
        expect(optionValues.overrideDate).not.toBeNull();
        expect(optionValues.overrideDate.overrideDateTypes.length).toBe(2);
        expect(optionValues.overrideDate.overrideDateTypes[0]).toBe('PRIOR_DAY');
        expect(optionValues.overrideDate.overrideDateTypes[1]).toBe('MONTH_END');
        expect(optionValues.overrideDate.customOverrideDateLabel).toBe('Custom Label');
        expect(optionValues.overrideDate.multiOverrideDateTypeFrequency).toBe('MONTHLY');
        expect(optionValues.overrideDate.numberOfObservations).toBe(2);
        expect(optionValues.overrideDate.startDate).toBe('Start Date');
        expect(optionValues.overrideDate.endDate).toBe('End Date');
        expect(optionValues.overrideDate.appendReportDate).toBeTruthy();

        expect(optionValues.compareToCurrent).not.toBeUndefined();
        expect(optionValues.compareToCurrent).not.toBeNull();
        expect(optionValues.compareToCurrent.compareToCurrentType).toBe('COMPARE_TO_CURRENT');
    });

    it('test CreateRequest Params with empty object', () => {
        const emptyModel: OverrideDateColumnOption = new OverrideDateColumnOption();
        const optionValues: any = {};
        emptyModel.addRequestParams(optionValues);
        expect(optionValues.overrideDate).toBeUndefined();
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

        optionModel = new OverrideDateColumnOption();
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
        const model: OverrideDateColumnOption = new OverrideDateColumnOption(data);

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
        const model2: OverrideDateColumnOption = new OverrideDateColumnOption(data2);
        expect(model2.startDate.date).toBeUndefined();
        expect(model2.endDate.date).toBeUndefined();
    });

    it('Test create from factory', () => {
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(OverrideDateColumnOption.CONFIG_TYPE);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof OverrideDateColumnOption).toBeTruthy();
    });

    it('Test create legacy model', () => {
        // Try without the required params.
        const data: any = {};
        let model: OverrideDateColumnOption = OverrideDateColumnOption.createModelLegacy(data);
        expect(model).not.toBeDefined();

        // Try with valid options.
        data.overrideDate = {
            overrideDateTypes: ['PRIOR_DAY', 'MONTH_END']
        };
        model = OverrideDateColumnOption.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.overrideDateTypes.length).toBe(2);
        expect(model.overrideDateTypes[0]).toBe('PRIOR_DAY');
        expect(model.overrideDateTypes[1]).toBe('MONTH_END');
        expect(data.overrideDateTypes).not.toBeDefined();
    });

    it('Test create legacy model', () => {
        const startDate = DateValue.newDate('12/01/2023').serialize();
        const endDate = DateValue.newDate('12/10/2023').serialize();
        const data: any = {
            overrideDate: {
                overrideDateTypes: [],
                customOverrideDateLabel: '',
                multiOverrideDateTypeFrequency: '',
                numberOfObservations: 2,
                startDate,
                endDate
            }
        };
        const model: OverrideDateColumnOption = OverrideDateColumnOption.createModelLegacy(data);
        expect(model.overrideDateTypes.length).toEqual(0);
        expect(model.multiOverrideDateTypeFrequency).toEqual('');
        expect(model.numberOfObservations).toEqual(2);
        expect(model.startDate).toEqual(DateValue.newDate('12/01/2023'));
        expect(model.endDate).toEqual(DateValue.newDate('12/10/2023'));
    });

    it('Test create empty legacy model', () => {
        const data: any = {
            overrideDate: {
                overrideDateTypes: [],
                customOverrideDateLabel: '',
                multiOverrideDateTypeFrequency: '',
                numberOfObservations: 2,
                startDate: '',
                endDate: ''
            }
        };
        const model: OverrideDateColumnOption = OverrideDateColumnOption.createModelLegacy(data);
        expect(model.overrideDateTypes.length).toEqual(0);
        expect(model.multiOverrideDateTypeFrequency).toEqual('');
        expect(model.numberOfObservations).toEqual(2);
        expect(model.startDate).toEqual(DateValue.newDate(''));
        expect(model.endDate).toEqual(DateValue.newDate(''));
    });

    it('Test equals', () => {
        const model1: OverrideDateColumnOption = new OverrideDateColumnOption();
        const model2: OverrideDateColumnOption = new OverrideDateColumnOption();
        expect(model1.equals(model2)).toBeTruthy();

        // Different number of overrideDateTypes
        model1.overrideDateTypes = ['PRIOR_DAY', 'MONTH_END'];
        model1.customOverrideDateLabel = 'Custom Label';
        model1.multiOverrideDateTypeFrequency = 'WEEKLY';
        model1.numberOfObservations = 2;
        model1.startDate = DateValue.newDate('Start Date');
        model1.endDate = DateValue.newDate('End Date');
        model1.compareToCurrentType = 'COMPARE_TO_CURRENT';
        model1.appendReportDate = false;

        model2.overrideDateTypes = ['MONTH_END'];
        model2.customOverrideDateLabel = 'Custom Label';
        model2.multiOverrideDateTypeFrequency = 'WEEKLY';
        model2.numberOfObservations = 2;
        model2.startDate = DateValue.newDate('Start Date');
        model2.endDate = DateValue.newDate('End Date');
        model2.compareToCurrentType = 'COMPARE_TO_CURRENT';
        model2.appendReportDate = false;

        expect(model1.equals(model2)).toBeFalsy();

        // Different overrideDateTypes
        model2.overrideDateTypes = ['MONTH_END', 'QUARTER_END'];
        expect(model1.equals(model2)).toBeFalsy();

        // Different customOverrideDateLabel
        model2.overrideDateTypes = model1.overrideDateTypes;
        model2.customOverrideDateLabel = 'Label';
        expect(model1.equals(model2)).toBeFalsy();

        // Different multiOverrideDateTypeFrequency
        model2.customOverrideDateLabel = model1.customOverrideDateLabel;
        model2.multiOverrideDateTypeFrequency = 'DAILY';
        expect(model1.equals(model2)).toBeFalsy();

        // Different numberOfObservations
        model2.multiOverrideDateTypeFrequency = model1.multiOverrideDateTypeFrequency;
        model2.numberOfObservations = 4;
        expect(model1.equals(model2)).toBeFalsy();

        // Different startDate
        model2.numberOfObservations = model1.numberOfObservations;
        model2.startDate = DateValue.newDate('');
        expect(model1.equals(model2)).toBeFalsy();

        // Different endDate
        model2.startDate = model1.startDate;
        model2.endDate = DateValue.newDate('');
        expect(model1.equals(model2)).toBeFalsy();

        // Different compare to current type
        model2.endDate = model1.endDate;
        model2.compareToCurrentType = 'COMPARE_TO_CURRENT_PERCENTAGE';
        expect(model1.equals(model2)).toBeFalsy();

        // Different type of start date
        model2.compareToCurrentType = model1.compareToCurrentType;
        model2.startDate = DateValue.newDate('01/01/2020');
        expect(model1.equals(model2)).toBeFalsy();

        // Different type of end date
        model2.endDate = DateValue.newDate('01/01/2020');
        model2.startDate = model1.startDate;
        expect(model1.equals(model2)).toBeFalsy();

        // different start date
        model2.endDate = model1.endDate;
        model1.startDate = DateValue.newDate('02/01/2020');
        model2.startDate = DateValue.newDate('01/01/2020');
        expect(model1.equals(model2)).toBeFalsy();

        // different end date
        model2.startDate = model1.startDate;
        model1.endDate = DateValue.newDate('02/01/2020');
        model2.endDate = DateValue.newDate('01/01/2020');
        expect(model1.equals(model2)).toBeFalsy();

        // Everything same
        model2.endDate = model1.endDate;
        expect(model1.equals(model2)).toBeTruthy();
    });

    it('Test isValid', () => {
        const model1: OverrideDateColumnOption = new OverrideDateColumnOption();
        expect(model1.isValid()).toBeFalsy();

        model1.overrideDateTypes = null;
        model1.multiOverrideDateTypeFrequency = '';
        expect(model1.isValid()).toBeFalsy();

        model1.overrideDateTypes = null;
        model1.multiOverrideDateTypeFrequency = 'WEEKLY';
        expect(model1.isValid()).toBeTruthy();

        model1.multiOverrideDateTypeFrequency = '';
        model1.overrideDateTypes = ['PRIOR_DAY'];
        expect(model1.isValid()).toBeTruthy();
    });

    it('Should update date given relative dateStringValue', () => {
        const overrideDateColumnOption: OverrideDateColumnOption = new OverrideDateColumnOption();
        const startDate = new DateValue();
        startDate.dateString = true;
        startDate.dateStringValue = 'T-1';
        startDate.date = '02/01/2023';
        overrideDateColumnOption.startDate = startDate;
        const endDate = new DateValue();
        endDate.dateString = true;
        endDate.dateStringValue = 'T-1';
        endDate.date = '02/05/2023';
        overrideDateColumnOption.endDate = endDate;

        const serializedStartDate = startDate.sanitizeAndSerialize();
        expect(overrideDateColumnOption.startDate.date).toBe('02/01/2023');
        expect(serializedStartDate.date).toBeUndefined();

        const serializedEndDate = endDate.sanitizeAndSerialize();
        expect(overrideDateColumnOption.endDate.date).toBe('02/05/2023');
        expect(serializedEndDate.date).toBeUndefined();
    });
});
