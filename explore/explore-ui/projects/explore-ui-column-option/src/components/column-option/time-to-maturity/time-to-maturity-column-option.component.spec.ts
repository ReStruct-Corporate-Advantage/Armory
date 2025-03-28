import {TimeToMaturityColumnOption} from '../../../models/column-option/time-to-maturity-column-option.model';
import {ColumnOptionTestBed} from '../../../test-utils';
import {TimeToMaturityColumnOptionComponent} from './time-to-maturity-column-option.component';
import {CoreWidgetConstants, FormatConstants} from '@blk/explore-ui-core';
import {WidgetType, CoreWidgetConfigStore} from '@blk/explore-ui-core';

describe('Time to maturity column options component test case', () => {
    let testBed: ColumnOptionTestBed<TimeToMaturityColumnOptionComponent, TimeToMaturityColumnOption>;

    beforeAll(() => {
        // mock chart config
        CoreWidgetConfigStore.chartConfig = new Map();
        (CoreWidgetConfigStore.chartConfig as any).set(WidgetType.RISK_EXPOSURE, {chartingLib: CoreWidgetConstants.CHARTING_LIB.AG_GRID});
        (CoreWidgetConfigStore.chartConfig as any).set(WidgetType.BAR, {chartingLib: CoreWidgetConstants.CHARTING_LIB.HIGHCHART});
    });

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockData = {
            columnOptionAttributes: [{
                key: 'timeUnit',
                values: [{value: 'Days'}, {value: 'Months'}, {value: 'Years'}, {value: 'Custom'}]
            }]
        };

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<TimeToMaturityColumnOptionComponent, TimeToMaturityColumnOption>(TimeToMaturityColumnOptionComponent, new TimeToMaturityColumnOption(), mockData);
        testBed.component.optionValue = new TimeToMaturityColumnOption();
        testBed.component.widgetType = WidgetType.RISK_EXPOSURE;
    });

    it('Test scaling options with chart', () => {
        testBed.component.widgetType = WidgetType.BAR;
        testBed.component['initializeComponent']();
        const customOption = testBed.component.scalingDropDownData[0].values.find(option => option.displayValue === FormatConstants.CUSTOM);
        if (customOption) {
            expect(customOption.isDisabled).toBeTruthy();
        }
    });

    it('should have aux-numeric-stepper component', () => {
        const compiled = testBed.fixture.debugElement.nativeElement;
        expect(compiled.querySelector('aux-numeric-stepper')).not.toBe(null);
        expect(compiled.querySelector('aux-select')).not.toBe(null);
    });

    it('Check initialization of scaling drop down data', () => {
        expect(testBed.component.scalingDropDownData[0].values.length).toBe(4);
    });

    it('When scaling options get changed value will change in the model', () => {
        testBed.component.setScalingOptions('Days');
        expect(testBed.component.optionValue.customScalingBandsMonths).toBeUndefined();
        expect(testBed.component.optionValue.customScalingBandsDays).toBeUndefined();
        testBed.component.setScalingOptions('Custom');
        expect(testBed.component.optionValue.customScalingBandsMonths).toBe(24);
        expect(testBed.component.optionValue.customScalingBandsDays).toBe(90);
    });

    it('update decimal place if its gets changed', () => {
        testBed.component.onDecimalPlaceValueChange('1');
        expect(testBed.component.optionValue.decimalPlaces).toBe(1);
    });

    it('update custom days if its gets changed', () => {
        testBed.component.onCustomDaysValueChange('100');
        expect(testBed.component.optionValue.customScalingBandsDays).toBe(100);
    });

    it('update custom months if its gets changed', () => {
        testBed.component.onCustomMonthsValueChange('10');
        expect(testBed.component.optionValue.customScalingBandsMonths).toBe(10);
    });
});
