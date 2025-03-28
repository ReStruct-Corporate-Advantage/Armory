import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ComboChartColumnSettingsComponent} from './combo-chart-column-settings.component';
import {Widget} from '@models/widget/widget.model';
import {TestUtils} from '@utils/test.utils';
import {WorkspaceStore} from '@stores/workspace.store';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ChartWidgetInputConfigType, ColumnConfig, WidgetConfigType} from '@blk/explore-ui-core';
import {WidgetConfigFactory} from '../../../../../factories';
import {ComboChartColumn} from '@models/widget/inputs/chart-settings/combo-chart-column.model';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {ColumnSeriesChartType} from '@enums/column-series-chart-type.enum';
import {ComboChartColumnSettings} from '@models/widget/inputs/chart-settings/combo-chart-column-settings.model';
import { LineChartStyle } from '@enums/line-chart-style.enum';

describe('ComboChartColumnSettingsComponent Tests', () => {
    let component: ComboChartColumnSettingsComponent;
    let fixture: ComponentFixture<ComboChartColumnSettingsComponent>;
    let widget: Widget;

    beforeAll((done) => {
        TestUtils.initialize(done);
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentPortfolio(new Portfolio('PEP'));
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ComboChartColumnSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ComboChartColumnSettingsComponent);
        component = fixture.componentInstance;
        widget = new Widget(WidgetConfigType.BAR);

        component.widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.BAR, 'comboChartColumnSettings');
        component.inputs = widget.getCombinedInputs();
        component.widgetType = WidgetConfigType.BAR;
        component.ngOnInit();
    });

    it('check if component is initialized correctly', () => {
        expect(component.widgetInput.columns?.length).toEqual(1);
        expect(component.widgetInput.columns[0].secondaryAxis).toBeFalsy();
        expect(component.defaultChartType).toEqual(ColumnSeriesChartType.BAR);
    });

    it('Test getComboChartColumns', () => {
        const colConfigs = [ColumnConfig.createColumn('pct_mkt', 'PORT', 'pct_mkt_1234'),
                                ColumnConfig.createColumn('pct_mkt', 'PORT', 'pct_mkt_12345')];
        const existingComboColumns = [new ComboChartColumn({colKey: 'pct_mkt_1234', secondaryAxis: true, chartType: ColumnSeriesChartType.BAR})];
        const comboColumns = component['initializeComboChartColumns'](colConfigs, existingComboColumns);
        expect(comboColumns[0].chartType).toEqual(ColumnSeriesChartType.BAR);
        expect(comboColumns[0].secondaryAxis).toBeTruthy();
        expect(comboColumns[1].chartType).toEqual(ColumnSeriesChartType.BAR);
        expect(comboColumns[1].secondaryAxis).toBeFalsy();

        expect(component.chartTypeSelectOptions.get(comboColumns[0])).toEqual([{
            values: [
                {
                    displayValue: 'Bar',
                    value: ColumnSeriesChartType.BAR,
                    isSelected: true
                },
                {
                    displayValue: 'Marker',
                    value: ColumnSeriesChartType.MARKER,
                    isSelected: false
                },
                {
                    displayValue: 'Line',
                    value: ColumnSeriesChartType.LINE,
                    isSelected: false
                }
            ]
        }]);

        expect(component.chartTypeSelectOptions.get(comboColumns[1])).toEqual([{
            values: [
                {
                    displayValue: 'Bar',
                    value: ColumnSeriesChartType.BAR,
                    isSelected: true
                },
                {
                    displayValue: 'Marker',
                    value: ColumnSeriesChartType.MARKER,
                    isSelected: false
                },
                {
                    displayValue: 'Line',
                    value: ColumnSeriesChartType.LINE,
                    isSelected: false
                }
            ]
        }]);

        component.widgetType = WidgetConfigType.FACTOR_GRAPHING_BAR_CHART;
        component['initializeComboChartColumns'](colConfigs, existingComboColumns);

        expect(component.chartTypeSelectOptions.get(comboColumns[0])).toEqual([{
            values: [
                {
                    displayValue: 'Bar',
                    value: ColumnSeriesChartType.BAR,
                    isSelected: true
                },
                {
                    displayValue: 'Marker',
                    value: ColumnSeriesChartType.LINE,
                    isSelected: false
                }
            ]
        }]);

        component.widgetType = WidgetConfigType.FACTOR_GRAPHING_STACK_BAR_CHART;
        component.disableChartTypeSelection = true;
        existingComboColumns[0].chartType = ColumnSeriesChartType.LINE;
        const comboChartColumns = component['initializeComboChartColumns'](colConfigs, existingComboColumns);

        expect(comboChartColumns[0].chartType).toEqual('bar');
        expect(comboChartColumns[1].chartType).toEqual('bar');
    });

    it('Test resetColumns', () => {
        component.widgetInput.columns[0].secondaryAxis = true;
        component.widgetInput.columns[0].chartType = ColumnSeriesChartType.LINE;
        component.resetChanges();
        expect(component.widgetInput.columns[0].secondaryAxis).toBeFalsy();
        expect(component.widgetInput.columns[0].chartType).toEqual(ColumnSeriesChartType.BAR);
        expect(component.chartTypeSelectOptions.get(component.widgetInput.columns[0])[0].values[0].value).toEqual(ColumnSeriesChartType.BAR);
        expect(component.chartTypeSelectOptions.get(component.widgetInput.columns[0])[0].values[0].isSelected).toBeTruthy();
    });

    it('Test resetChanges calls resetLineStyle', () => {
        // Arrange
        const column = new ComboChartColumn({ colKey: 'test_col', chartType: ColumnSeriesChartType.LINE, lineStyle: LineChartStyle.DASHED });
        component.widgetInput.columns = [column];
        component.defaultChartType = ColumnSeriesChartType.LINE;
        component.disableLineStyleSelection = false;
        component['setChartTypeSelectOption'](column);
        component['setLineStyleSelectOption'](column);

        // Act
        component.resetChanges();

        // Assert
        expect(component.widgetInput.columns[0].chartType).toEqual(ColumnSeriesChartType.LINE);
        expect(component.widgetInput.columns[0].lineStyle).toEqual(LineChartStyle.SOLID);
        expect(component.isChartSettingChanged).toBeFalsy();
    });


    it('Test initializeChartTypeFromTimeSeriesSettings', () => {
        component.defaultChartType = ColumnSeriesChartType.LINE;
        const timeSeriesChartSettings = {
            chartType: 'bar'
        };
        component.inputs.set(ChartWidgetInputConfigType.TIME_SERIES_CHART_SETTINGS, timeSeriesChartSettings as TimeSeriesSettings);
        component.initializeChartTypeFromTimeSeriesSettings();
        expect(component.widgetInput.columns[0].chartType).toBe(ColumnSeriesChartType.BAR);
        expect(timeSeriesChartSettings.chartType).toBeUndefined();
    });

    // test initializeChartTypeFromTimeSeriesSettings with undefined timeSeriesChartSettings
    it('Test initializeChartTypeFromTimeSeriesSettings', () => {
        component.inputs.set(ChartWidgetInputConfigType.TIME_SERIES_CHART_SETTINGS, undefined);
        component.initializeChartTypeFromTimeSeriesSettings();
        expect(component.widgetInput.columns[0].chartType).toEqual(ColumnSeriesChartType.BAR);
    });

    // test initializeChartTypeFromTimeSeriesSettings with timeSeriesChartSettings.chartType = 'line'
    it('Test initializeChartTypeFromTimeSeriesSettings', () => {
        const timeSeriesChartSettings = {
            chartType: 'line'
        };
        component.inputs.set(ChartWidgetInputConfigType.TIME_SERIES_CHART_SETTINGS, timeSeriesChartSettings as TimeSeriesSettings);
        component.initializeChartTypeFromTimeSeriesSettings();
        expect(component.widgetInput.columns[0].chartType).toEqual(ColumnSeriesChartType.LINE);
        expect(timeSeriesChartSettings.chartType).toBeUndefined();
    });

    it('initializeComboChartColumns - legacy secondaryAxisColumn', () => {
        const columns: ColumnConfig[] = [ColumnConfig.createColumn('pct_mv', 'PORT', 'pct_mv_1234', 'Market Value %'),
            ColumnConfig.createColumn('pct_notional_val', 'PORT', 'pct_notional_val_4321', 'Notional Market Value %'),
        ];

        const serializedSecondaryAxisColumn = { secondaryAxisColumn: 'pct_mv_1234' };
        const comboChartColumnSettings = new ComboChartColumnSettings(serializedSecondaryAxisColumn);
        comboChartColumnSettings.columns.push(new ComboChartColumn({colKey: 'pct_notional_val_4321', chartType: 'bar'}));

        component['initializeComboChartColumns'](columns, comboChartColumnSettings.columns);

        expect(comboChartColumnSettings.columns[0]).toEqual({
            colKey: 'pct_mv_1234',
            secondaryAxis: true,
            chartType: ColumnSeriesChartType.BAR,
            colTitle: 'Market Value %',
            colScale: 'Percent (%)',
            lineStyle: LineChartStyle.SOLID
        });
        expect(comboChartColumnSettings.columns[1]).toEqual({
            colKey: 'pct_notional_val_4321',
            secondaryAxis: undefined,
            chartType: ColumnSeriesChartType.BAR,
            colTitle: 'Notional Market Value %',
            colScale: 'Percent (%)',
            lineStyle: LineChartStyle.SOLID
        });
    });

    it('should test disableChartTypeSelection', () => {
        component.widgetType = WidgetConfigType.FACTOR_GRAPHING_STACK_BAR_CHART;
        expect(component['isChartTypeSelectionDisabled']()).toBeTruthy();
        component.widgetType = WidgetConfigType.BAR;
        expect(component['isChartTypeSelectionDisabled']()).toBeFalsy();
    });

    it('Test initializeComponentForUndoChangesButtonDisabled', () => {
        component.widgetInput.columns[0].chartType = ColumnSeriesChartType.BAR;
        component.widgetInput.columns[0].secondaryAxis = false;
        component.initializeComponent();
        expect(component.widgetInput.columns[0].secondaryAxis).toBeFalsy();
        expect(component.widgetInput.columns[0].chartType).toEqual(ColumnSeriesChartType.BAR);
        expect(component.isChartSettingChanged).toBeFalsy();
    });

    it('Test initializeComponentForUndoChangesButtonEnabled_1', () => {
        component.widgetInput.columns[0].chartType = ColumnSeriesChartType.LINE;
        component.widgetInput.columns[0].secondaryAxis = true;
        component.initializeComponent();
        expect(component.widgetInput.columns[0].secondaryAxis).toBeTruthy();
        expect(component.widgetInput.columns[0].chartType).toEqual(ColumnSeriesChartType.LINE);
        expect(component.isChartSettingChanged).toBeTruthy();
    });

    it('Test initializeComponentForUndoChangesButtonEnabled_2', () => {
        component.widgetInput.columns[0].chartType = ColumnSeriesChartType.LINE;
        component.widgetInput.columns[0].secondaryAxis = false;
        component.initializeComponent();
        expect(component.widgetInput.columns[0].secondaryAxis).toBeFalsy();
        expect(component.widgetInput.columns[0].chartType).toEqual(ColumnSeriesChartType.LINE);
        expect(component.isChartSettingChanged).toBeTruthy();
    });

    it('Test initializeComponentForUndoChangesButtonEnabled_3', () => {
        component.widgetInput.columns[0].chartType = ColumnSeriesChartType.BAR;
        component.widgetInput.columns[0].secondaryAxis = true;
        component.initializeComponent();
        expect(component.widgetInput.columns[0].secondaryAxis).toBeTruthy();
        expect(component.widgetInput.columns[0].chartType).toEqual(ColumnSeriesChartType.BAR);
        expect(component.isChartSettingChanged).toBeTruthy();
    });

    it('Test onSecondaryAxisChangedForTrueValue', () => {
        component.widgetInput.columns[0].chartType = ColumnSeriesChartType.BAR;
        component.onSecondaryAxisChanged(component.widgetInput.columns[0], true);
        expect(component.widgetInput.columns[0].secondaryAxis).toBeTruthy();
        expect(component.widgetInput.columns[0].chartType).toEqual(ColumnSeriesChartType.BAR);
        expect(component.isChartSettingChanged).toBeTruthy();
    });

    it('Test onSecondaryAxisChangedForFalseValue', () => {
        component.widgetInput.columns[0].chartType = ColumnSeriesChartType.BAR;
        component.onSecondaryAxisChanged(component.widgetInput.columns[0], false);
        expect(component.widgetInput.columns[0].secondaryAxis).toBeFalsy();
        expect(component.widgetInput.columns[0].chartType).toEqual(ColumnSeriesChartType.BAR);
        expect(component.isChartSettingChanged).toBeFalsy();
    });

    it('Test onChartTypeChangedForBarChart', () => {
        component.widgetInput.columns[0].secondaryAxis = false;
        component.onChartTypeChanged(component.widgetInput.columns[0], ColumnSeriesChartType.BAR);
        expect(component.widgetInput.columns[0].secondaryAxis).toBeFalsy();
        expect(component.widgetInput.columns[0].chartType).toEqual(ColumnSeriesChartType.BAR);
        expect(component.isChartSettingChanged).toBeFalsy();
    });

    it('Test onChartTypeChangedForLineChart', () => {
        component.widgetInput.columns[0].secondaryAxis = false;
        component.onChartTypeChanged(component.widgetInput.columns[0], ColumnSeriesChartType.LINE);
        expect(component.widgetInput.columns[0].secondaryAxis).toBeFalsy();
        expect(component.widgetInput.columns[0].chartType).toEqual(ColumnSeriesChartType.LINE);
        expect(component.isChartSettingChanged).toBeTruthy();
    });

    it('Test onLineStyleChanged', () => {
        const column = new ComboChartColumn({ colKey: 'test_col', chartType: ColumnSeriesChartType.BAR, lineStyle: LineChartStyle.SOLID });
        component.onLineStyleChanged(column, LineChartStyle.DASHED);
        expect(column.lineStyle).toEqual(LineChartStyle.DASHED);
        expect(component.isChartSettingChanged).toBeTruthy();

        component.onLineStyleChanged(column, LineChartStyle.SOLID);
        expect(column.lineStyle).toEqual(LineChartStyle.SOLID);
        expect(component.isChartSettingChanged).toBeFalsy();
    });
});
