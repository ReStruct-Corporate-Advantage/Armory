import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TimeSeriesFormatSettingsComponent} from './time-series-format-settings.component';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {Breakdown, ColumnSector} from '@blk/explore-ui-breakdown';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {TestUtils} from '@utils/test.utils';
import {Widget} from '@models/widget/widget.model';

describe('TimeSeriesChartSettingsComponent', () => {
    let component: TimeSeriesFormatSettingsComponent;
    let fixture: ComponentFixture<TimeSeriesFormatSettingsComponent>;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    /**
     * Performs required initialisation before each test is run
     */
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TimeSeriesFormatSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(TimeSeriesFormatSettingsComponent);
        component = fixture.componentInstance;
        const widget = new Widget(WidgetConfigType.TIME_SERIES);
        component.inputs = widget.getCombinedInputs();
        component.widgetInput = new TimeSeriesSettings({frequency: 'DAILY', periods: 10, chartType: 'line', dateFormat: 'Aladdin date format', includeTotalValues: false, appendReportDate: true});
    });

    describe('Test initializeComponent method', () => {
        it('initializeComponent should initialize default values', () => {

            component.initializeComponent();

            // Validate if showTotalLine and dateFormat are initialized
            expect(component.showTotalLine).toEqual(false);
        });
    });

    describe('Test onShowTotalValueChanged method', () => {
        it('onShowTotalValueChanged should change the value properly', () => {
            expect(component.widgetInput.includeTotalValues).toEqual(false);

            // check show total line option
            const event = {detail: { value: {checked: true}}};
            component.onShowTotalValueChanged(event as CustomEvent);
            expect(component.widgetInput.includeTotalValues).toEqual(true);
        });
    });

    describe('Test onShowDataMarkerChanged method', () => {
        it('onShowDataMarkerChanged should change the value properly', () => {
            expect(component.widgetInput.showDataMarker).toBeTruthy();

            // check show total line option
            const event = {detail: { value: {checked: false}}};
            component.onShowDataMarkerChanged(event as CustomEvent);
            expect(component.widgetInput.showDataMarker).toBeFalsy();
        });
    });

    describe('Test isTotalSelectionEnabled Method', () => {
        it('isTotalSelection should change the value accordingly', () => {
            component.inputs = new Map();
            component.initializeComponent();
            expect(component.totalSelectionEnabled).toBeFalsy();

            const breakdown: Breakdown = new Breakdown();
            component.inputs.set('breakdownTree', breakdown);
            component.initializeComponent();
            expect(component.totalSelectionEnabled).toBeFalsy();

            breakdown.children = [ new ColumnSector()];
            component.initializeComponent();
            expect(component.totalSelectionEnabled).toBeTruthy();
        });
    });
});
