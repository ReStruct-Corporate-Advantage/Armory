import {ColumnOptionMetaDataInterface} from '@blk/explore-ui-core';
import {ColumnOptionTestBed} from '../../../test-utils';
import {EquityColumnOptionComponent} from './equity-column-option.component';
import {EquityColumnOption} from '../../../models/column-option/equity-column-option.model';
import {CustomCalculationMeasureNodeColumnOption} from '../../../models/column-option/custom-calculation-measure-node-column-option.model';

describe('EquityColumnOptionsComponent', () => {

    let testBed: ColumnOptionTestBed<EquityColumnOptionComponent, EquityColumnOption>;

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption: ColumnOptionMetaDataInterface = {
            columnOptionKey: 'equity_column_options',
            columnOptionTitle: 'Equity Settings',
            columnOptionConfigType: 'equity_column_options',
            columnOptionAttributes: [{
                title: 'Last',
                key: 'noOfYears',
                dataType: 'N',
                values: [{
                    value: 10,
                    label: 'ANNUAL'
                }, {
                    value: 20,
                    label: 'SEMI-ANNUAL'
                }]
            }, {
                title: 'Frequency',
                key: 'frequency',
                dataType: 'S',
                values: [{
                    value: 'ANNUAL',
                    label: 'Annual'
                }, {
                    value: 'SEMI-ANNUAL',
                    label: 'Semi-Annual'
                }]
            }, {
                title: 'Estimates Statistic',
                key: 'measureType',
                dataType: 'S',
                values: [{
                    value: 'MEAN',
                    label: 'Mean'
                }, {
                    value: 'MEDIAN',
                    label: 'Median'
                }]
            }]
        };

        const equityColumnOption = new EquityColumnOption();
        equityColumnOption.noOfPeriods = 1;
        equityColumnOption.frequency = 'ANNUAL';
        equityColumnOption.measureType = 'MEAN';

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<EquityColumnOptionComponent, EquityColumnOption>(EquityColumnOptionComponent, equityColumnOption, mockedOption);
    });

    it('check if component is initialized correctly', () => {
        expect(testBed.component.periodsAttribute).toBeDefined();
        expect(testBed.component.periodsAttribute.maximumPeriod).toBe(10);
        expect(testBed.component.frequencyAttribute).toBeDefined();
        expect(testBed.component.displayDataForFrequencyAttribute[0].values.length).toBe(2);
        expect(testBed.component.measureTypeAttribute).toBeDefined();
        expect(testBed.component.displayDataForMeasureTypeAttribute[0].values.length).toBe(2);
    });

    it('test setupDisplayDataForFrequencyAttribute', () => {
        testBed.component.setupDisplayDataForFrequencyAttribute();

        expect(testBed.component.displayDataForFrequencyAttribute[0].values.length).toBe(2);

        const data1 = testBed.component.displayDataForFrequencyAttribute[0].values[0];
        expect(data1.displayValue).toBe('Annual');
        expect(data1.value).toBe('ANNUAL');
        expect(data1.isSelected).toBe(true);

        const data2 = testBed.component.displayDataForFrequencyAttribute[0].values[1];
        expect(data2.displayValue).toBe('Semi-Annual');
        expect(data2.value).toBe('SEMI-ANNUAL');
        expect(data2.isSelected).toBe(false);
    });

    it('test setupDisplayDataForMeasureTypeAttribute', () => {
        testBed.component.setupDisplayDataForMeasureTypeAttribute();

        expect(testBed.component.displayDataForMeasureTypeAttribute[0].values.length).toBe(2);

        const data1 = testBed.component.displayDataForMeasureTypeAttribute[0].values[0];
        expect(data1.displayValue).toBe('Mean');
        expect(data1.value).toBe('MEAN');
        expect(data1.isSelected).toBe(true);

        const data2 = testBed.component.displayDataForMeasureTypeAttribute[0].values[1];
        expect(data2.displayValue).toBe('Median');
        expect(data2.value).toBe('MEDIAN');
        expect(data2.isSelected).toBe(false);
    });

    it('test setMaxPeriodValue', () => {
        testBed.component.optionValue.frequency = 'SEMI-ANNUAL';
        testBed.component.setMaxPeriodValue();
        expect(testBed.component.periodsAttribute.maximumPeriod).toBe(20);
        expect(testBed.component.optionValue.noOfPeriods).toBe(1);

        testBed.component.optionValue.noOfPeriods = 20;
        testBed.component.optionValue.frequency = 'ANNUAL';
        testBed.component.setMaxPeriodValue();
        expect(testBed.component.periodsAttribute.maximumPeriod).toBe(10);
        expect(testBed.component.optionValue.noOfPeriods).toBe(10);
    });

    it('test onNumberOfPeriodsChanged', () => {
        // @ts-ignore
        testBed.component.onNumberOfPeriodsChanged({detail: {value: '8'}});
        expect(testBed.component.optionValue.noOfPeriods).toBe(8);
    });

    it('test setFrequencyAttribute', () => {
        jest.spyOn(testBed.component, 'setMaxPeriodValue');
        // @ts-ignore
        testBed.component.setFrequencyAttribute({detail: {value: {value: 'SEMI-ANNUAL'}}});
        expect(testBed.component.periodsAttribute.maximumPeriod).toBe(20);
        expect(testBed.component.optionValue.frequency).toBe('SEMI-ANNUAL');
        expect(testBed.component.setMaxPeriodValue).toHaveBeenCalled();
    });

    it('test getSelectedMeasureType', () => {
        // @ts-ignore
        testBed.component.setMeasureTypeAttribute({detail: {value: {value: 'MEDIAN'}}});
        expect(testBed.component.optionValue.measureType).toBe('MEDIAN');
    });

    it('should update the labels for periodAttribute and frequencyAttribute for custom calc', () => {
        expect(testBed.component.periodsAttributeLabel).toBe('Last');
        expect(testBed.component.frequencyAttributeLabel).toBe('Frequency');

        testBed.component.column.optionValues.push(new CustomCalculationMeasureNodeColumnOption({nodeTypeValue: 'security'}));
        testBed.component['initializeComponent']();

        expect(testBed.component.periodsAttributeLabel).toBe('Look back');
        expect(testBed.component.frequencyAttributeLabel).toBe('Period type');
    });
});
