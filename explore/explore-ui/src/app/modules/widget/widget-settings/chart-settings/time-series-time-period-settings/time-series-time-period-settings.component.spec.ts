import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TimeSeriesTimePeriodSettingsComponent} from './time-series-time-period-settings.component';
import {ChartWidgetInputConfigType, WidgetConfigType} from '@blk/explore-ui-core';
import {TestUtils} from '@utils/test.utils';
import {Widget} from '@models/widget/widget.model';
import {WidgetConfigFactory} from '../../../../../factories';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';

describe('TimeSeriesChartSettingsComponent', () => {
    let component: TimeSeriesTimePeriodSettingsComponent;
    let fixture: ComponentFixture<TimeSeriesTimePeriodSettingsComponent>;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    /**
     * Performs required initialisation before each test is run
     */
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TimeSeriesTimePeriodSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(TimeSeriesTimePeriodSettingsComponent);
        component = fixture.componentInstance;
        const widget = new Widget(WidgetConfigType.TIME_SERIES);
        component.inputs = widget.getCombinedInputs();
        component.widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.BAR, ChartWidgetInputConfigType.PRIMARY_AXIS_SETTINGS);
    });

    describe('Test initializeComponent method', () => {
        it('initializeComponent should initialize default values', () => {
            component.widgetInput = new TimeSeriesSettings({frequency: 'DAILY', periods: 10, chartType: 'line', dateFormat: 'Aladdin date format', includeTotalValues: false, appendReportDate: true});
            component.initializeComponent();

            // Validate if Multi Override Date Settings are initialized
            expect(component.multiOverrideDateSettings).not.toBe(undefined);
            expect(component.multiOverrideDateSettings.multiOverrideDateTypeFrequency).toBe('DAILY');
            expect(component.multiOverrideDateSettings.numberOfObservations).toBe(10);
            expect(component.multiOverrideDateSettings.startDate).toBe(undefined);
            expect(component.multiOverrideDateSettings.endDate).toBe(undefined);
            expect(component.multiOverrideDateSettings.appendReportDate).toBe(true);
        });
    });
    it('check report append field true', () => {
        fixture.detectChanges();
        expect(fixture.debugElement.nativeElement.querySelector('explore-core-multi-override-date').showAppendReportDate).toBeTruthy();
    });
});
