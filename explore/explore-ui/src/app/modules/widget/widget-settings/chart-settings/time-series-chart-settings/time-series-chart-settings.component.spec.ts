import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TimeSeriesChartSettingsComponent} from './time-series-chart-settings.component';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {Breakdown, ColumnSector} from '@blk/explore-ui-breakdown';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {FactorPathInput} from '@models/widget/inputs/factor-path-input.model';
import {TestUtils} from '@utils/test.utils';
import {COMPARE_MODE_PERCENT, COMPARE_MODE_VALUE} from '../../factor-data-settings/factor-data.constants';
import {Widget} from '@models/widget/widget.model';

describe('TimeSeriesChartSettingsComponent', () => {
    let component: TimeSeriesChartSettingsComponent;
    let fixture: ComponentFixture<TimeSeriesChartSettingsComponent>;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    /**
     * Performs required initialisation before each test is run
     */
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TimeSeriesChartSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(TimeSeriesChartSettingsComponent);
        component = fixture.componentInstance;
        const widget = new Widget(WidgetConfigType.TIME_SERIES);
        component.inputs = widget.getCombinedInputs();
        component.widgetInput = new TimeSeriesSettings({frequency: 'DAILY', periods: 10, chartType: 'line', dateFormat: 'Aladdin date format', includeTotalValues: false, appendReportDate: true});
    });

    describe('Test initializeComponent method', () => {
        it('initializeComponent should initialize default values', () => {

            component.initializeComponent();

            // Validate if Multi Override Date Settings are initialized
            expect(component.multiOverrideDateSettings).not.toBe(undefined);
            expect(component.multiOverrideDateSettings.multiOverrideDateTypeFrequency).toBe('DAILY');
            expect(component.multiOverrideDateSettings.numberOfObservations).toBe(10);
            expect(component.multiOverrideDateSettings.startDate).toBe(undefined);
            expect(component.multiOverrideDateSettings.endDate).toBe(undefined);
            expect(component.multiOverrideDateSettings.appendReportDate).toBe(true);

            // Validate if showTotalLine and dateFormat are initialized
            expect(component.showTotalLine).toEqual(false);
            expect(component.dateFormat).toEqual('Aladdin date format');

            // Validate if chart type options are initialized
            // First option
            expect(component.chartTypeOptions[0].label).toBe('Line');
            expect(component.chartTypeOptions[0].eventData).toBe('line');
            // The line chart type option should be checked
            expect(component.chartTypeOptions[0].checked).toBe(true);

            // Second option
            expect(component.chartTypeOptions[1].label).toBe('Bar');
            expect(component.chartTypeOptions[1].eventData).toBe('bar');
            expect(component.chartTypeOptions[1].checked).toBe(false);

            // Validate comparison mode
            expect(component.widgetInput.compareModeToggle).toBeFalsy();
            expect(component.compareModeOptions[0].checked).toBeTruthy();
            expect(component.compareModeOptions[1].checked).toBeFalsy();
        });
    });

    describe('Test onChartTypeChanged method', () => {
        it('onChartTypeChanged should change the chartType', () => {

            const event = {detail: { value: {eventData: 'bar'}}};
            // Change to bar chart
            component.onChartTypeChanged(event as CustomEvent);
            expect(component.widgetInput.chartType).toEqual('bar');

            event.detail.value.eventData = 'line';
            // Change to line chart
            component.onChartTypeChanged(event as CustomEvent);
            expect(component.widgetInput.chartType).toEqual('line');
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
            expect(component.isTotalSelectionEnabled()).toBeFalsy();

            const breakdown: Breakdown = new Breakdown();
            component.inputs.set('breakdownTree', breakdown);
            expect(component.isTotalSelectionEnabled()).toBeFalsy();

            breakdown.children = [ new ColumnSector()];
            expect(component.isTotalSelectionEnabled()).toBeTruthy();
        });

        it('should be disabled for factor time series at leaf level', () => {
            component.widgetType = WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES;
            const factorPathInput = new FactorPathInput();
            factorPathInput.path = [
                {level: '_ROOT_', value: 'PEP'},
                {level: 'level-1', value: 'STYLE'}
            ];
            component.inputs = new Map();
            component.inputs.set(FactorPathInput.configType, factorPathInput);
            expect(component.isTotalSelectionEnabled()).toEqual(true);

            factorPathInput.path.push({level: 'rfv_block_path', value: '15529fbdfce961abb73f1dab56566eaa1fdc6269__1:15529fbdfce961abb73f1dab56566eaa1fdc6269_EQ_COUNTRY:FMI_WRLD_GBR'});
            expect(component.isTotalSelectionEnabled()).toEqual(false);
        });
    });

    it('test initializeCompareModeOptions', () => {
        component.widgetInput.compareMode = COMPARE_MODE_PERCENT;
        component['initializeCompareModeOptions']();
        expect(component.compareModeOptions).toBeDefined();
        expect(component.compareModeOptions).not.toBeNull();
        expect(component.compareModeOptions.length).toBe(2);
        expect(component.compareModeOptions[0].checked).toBeTruthy();
    });

    it('test onCompareModeChanged', () => {
        component.widgetInput.compareMode = 'percentage';
        const event = {detail: { value: { eventData: 'value'}}};
        // Change to Value
        component.onCompareModeChanged(event as CustomEvent);
        expect(component.widgetInput.compareMode).toEqual('value');
    });

    describe('tess for onToggleChanged', () => {
        it('test onToggleChanged when compareModeToggle = false', () => {
            component.widgetInput.compareModeToggle = false;
            component.widgetInput.compareMode = 'value';

            component.onToggleChanged();
            expect(component.widgetInput.compareModeToggle).toBeTruthy();
            expect(component.widgetInput.compareMode).toEqual('value');
        });

        it('test onToggleChanged when compareModeToggle = true', () => {
            component.widgetInput.compareModeToggle = true;
            component.widgetInput.compareMode = COMPARE_MODE_VALUE;

            component.onToggleChanged();
            expect(component.widgetInput.compareModeToggle).toBeFalsy();
            expect(component.widgetInput.compareMode).toBe(COMPARE_MODE_VALUE);
        });
    });

    describe('Tests for Factor Data widget', () => {
        it('test initializeFactorDataDependentVariables for FACTOR_GRAPHING_TIME_SERIES Widget', () => {
            component.widgetType = WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES;
            component['initializeFactorDataDependentVariables']();
            expect(component.isFactorDataWidget).toBeFalsy();
            expect(component.showAppendReportDate).toBeTruthy();
            expect(component.maxNumberOfPeriodsOverride).toEqual(12);
            expect(component.classNameForMultiOverrideDate).toEqual('ts-settings-outer-div ts-settings-mod-div');
            expect(component.classNameForDateFormatDropdown).toEqual('ts-settings-outer-div ts-settings-main-div');
            expect(component.classNameForChartTypeDiv).toEqual('');
            expect(component.classNameForChartTypeLabel).toEqual('ts-settings-main-div');
        });

        it('test initializeFactorDataDependentVariables for FACTOR_DATA Widget', () => {
            component.widgetType = WidgetConfigType.FACTOR_DATA;
            component['initializeFactorDataDependentVariables']();
            expect(component.isFactorDataWidget).toBeTruthy();
            expect(component.showAppendReportDate).toBeFalsy();
            expect(component.classNameForMultiOverrideDate).toEqual('align-elements');
            expect(component.classNameForDateFormatDropdown).toEqual('align-elements');
            expect(component.classNameForChartTypeDiv).toEqual('align-elements');
            expect(component.classNameForChartTypeLabel).toEqual('chart-type-style');
        });
    });

});
