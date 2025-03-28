import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestUtils} from '@utils/test.utils';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Widget} from '@models/widget/widget.model';
import {
    ChartWidgetInputConfigType,
    PerformanceSettings,
    PerformanceTimePeriod,
    TimePeriodShortName,
    WidgetConfigType,
    WidgetInput
} from '@blk/explore-ui-core';
import {WidgetConfigFactory} from '../../../../../factories';
import {TimePeriodIntervalSettingsComponent} from './time-period-interval-settings.component';
import {
    TimePeriodInterval,
    TimePeriodIntervalSettings
} from '@models/widget/inputs/chart-settings/time-period-interval-settings.model';

describe('TimePeriodIntervalSettingsComponent', () => {
    let component: TimePeriodIntervalSettingsComponent;
    let fixture: ComponentFixture<TimePeriodIntervalSettingsComponent>;
    let widget;

    /**
     * Performs required initialisation before any test is run
     */
    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    /**
     * Performs required initialisation before each test is run
     */
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TimePeriodIntervalSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(TimePeriodIntervalSettingsComponent);
        component = fixture.componentInstance;
        widget = new Widget(WidgetConfigType.RETURN_ANALYSIS_CHART);

        component.widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.RETURN_ANALYSIS_CHART, ChartWidgetInputConfigType.TIME_PERIOD_INTERVAL_SETTINGS);
        component.widgetInput = new TimePeriodIntervalSettings();
        component.inputs = new Map<string, WidgetInput>();
        component.inputs.set(PerformanceSettings.CONFIG_TYPE, new PerformanceSettings(null, new PerformanceTimePeriod()));
    });

    it('should test initializeComponent', () => {
        component.initializeComponent();

        expect(component.widgetInput.timePeriodInterval).toEqual(TimePeriodInterval.DAILY);
        expect(component.timePeriodIntervalOptions[0].values.length).toEqual(5);
        expect(component.timePeriodIntervalOptions[0].values[0].value).toBe(TimePeriodInterval.DAILY);
        expect(component.timePeriodIntervalOptions[0].values[0].isSelected).toBeTruthy();
    });

    it('should test createTimePeriodIntervalOptions', () => {
        const timePeriod: PerformanceTimePeriod = (component.inputs.get(PerformanceSettings.CONFIG_TYPE) as PerformanceSettings).timePeriod;
        timePeriod.shortName = TimePeriodShortName.MTD;
        timePeriod.numberOfPeriods = 13;
        let timePeriodIntervalOptions = component['createTimePeriodIntervalOptions']();
        expect(timePeriodIntervalOptions[0].values.length).toBe(5);
        expect(timePeriodIntervalOptions[0].values[4].value).toEqual(TimePeriodInterval.YEARLY);

        timePeriod.shortName = TimePeriodShortName.MTD;
        timePeriod.numberOfPeriods = 4;
        timePeriodIntervalOptions = component['createTimePeriodIntervalOptions']();
        expect(timePeriodIntervalOptions[0].values.length).toBe(4);
        expect(timePeriodIntervalOptions[0].values[3].value).toEqual(TimePeriodInterval.QUARTERLY);

        timePeriod.shortName = TimePeriodShortName.FYTD;
        timePeriod.numberOfPeriods = null;
        timePeriodIntervalOptions = component['createTimePeriodIntervalOptions']();
        expect(timePeriodIntervalOptions[0].values.length).toBe(4);

        timePeriod.shortName = TimePeriodShortName.WTD;
        timePeriod.numberOfPeriods = 5;
        timePeriodIntervalOptions = component['createTimePeriodIntervalOptions']();
        expect(timePeriodIntervalOptions[0].values.length).toBe(3);
        expect(timePeriodIntervalOptions[0].values[2].value).toEqual(TimePeriodInterval.MONTHLY);

        timePeriod.shortName = TimePeriodShortName.PREV_QTR;
        timePeriod.numberOfPeriods = null;
        timePeriodIntervalOptions = component['createTimePeriodIntervalOptions']();
        expect(timePeriodIntervalOptions[0].values.length).toBe(3);

        timePeriod.shortName = TimePeriodShortName.DTD;
        timePeriod.numberOfPeriods = 8;
        timePeriodIntervalOptions = component['createTimePeriodIntervalOptions']();
        expect(timePeriodIntervalOptions[0].values.length).toBe(2);
        expect(timePeriodIntervalOptions[0].values[1].value).toEqual(TimePeriodInterval.WEEKLY);

        timePeriod.shortName = TimePeriodShortName.PREV_MTH;
        timePeriod.numberOfPeriods = null;
        timePeriodIntervalOptions = component['createTimePeriodIntervalOptions']();
        expect(timePeriodIntervalOptions[0].values.length).toBe(2);

        timePeriod.shortName = TimePeriodShortName.DTD;
        timePeriod.numberOfPeriods = 7;
        timePeriodIntervalOptions = component['createTimePeriodIntervalOptions']();
        expect(timePeriodIntervalOptions[0].values.length).toBe(1);
        expect(timePeriodIntervalOptions[0].values[0].value).toEqual(TimePeriodInterval.DAILY);

        timePeriod.shortName = TimePeriodShortName.BDAY;
        timePeriod.numberOfPeriods = null;
        timePeriodIntervalOptions = component['createTimePeriodIntervalOptions']();
        expect(timePeriodIntervalOptions[0].values.length).toBe(1);
    });

    it('should test createTimePeriodIntervalOptions with custom shortName', () => {
        const timePeriod: PerformanceTimePeriod = (component.inputs.get(PerformanceSettings.CONFIG_TYPE) as PerformanceSettings).timePeriod;
        timePeriod.shortName = TimePeriodShortName.CUSTOM;
        timePeriod.fromDateValue = '01-JAN-2023';
        timePeriod.toDateValue = '02-JAN-2024';
        let timePeriodIntervalOptions = component['createTimePeriodIntervalOptions']();
        expect(timePeriodIntervalOptions[0].values.length).toBe(5);
        expect(timePeriodIntervalOptions[0].values[4].value).toEqual(TimePeriodInterval.YEARLY);

        timePeriod.toDateValue = '01-MAY-2023';
        timePeriodIntervalOptions = component['createTimePeriodIntervalOptions']();
        expect(timePeriodIntervalOptions[0].values.length).toBe(4);
        expect(timePeriodIntervalOptions[0].values[3].value).toEqual(TimePeriodInterval.QUARTERLY);

        timePeriod.toDateValue = '02-FEB-2023';
        timePeriodIntervalOptions = component['createTimePeriodIntervalOptions']();
        expect(timePeriodIntervalOptions[0].values.length).toBe(3);
        expect(timePeriodIntervalOptions[0].values[2].value).toEqual(TimePeriodInterval.MONTHLY);

        timePeriod.toDateValue = '09-JAN-2023';
        timePeriodIntervalOptions = component['createTimePeriodIntervalOptions']();
        expect(timePeriodIntervalOptions[0].values.length).toBe(2);
        expect(timePeriodIntervalOptions[0].values[1].value).toEqual(TimePeriodInterval.WEEKLY);

        timePeriod.toDateValue = '03-JAN-2023';
        timePeriodIntervalOptions = component['createTimePeriodIntervalOptions']();
        expect(timePeriodIntervalOptions[0].values.length).toBe(1);
        expect(timePeriodIntervalOptions[0].values[0].value).toEqual(TimePeriodInterval.DAILY);
    });

    it('should test timePeriodInterval changes', () => {
        const event: any = {detail: {value: {value: 'Monthly'}}};
        component.onTimePeriodIntervalChanged(event);
        expect(component.widgetInput.timePeriodInterval).toEqual(TimePeriodInterval.MONTHLY);
    });
});
