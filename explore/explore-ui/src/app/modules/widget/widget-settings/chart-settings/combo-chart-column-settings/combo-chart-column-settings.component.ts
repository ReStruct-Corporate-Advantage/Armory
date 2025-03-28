import {Component} from '@angular/core';
import {BaseWidgetSettingComponent, ColumnSet} from '@blk/explore-ui-column-option';
import {ComboChartColumnSettings} from '@models/widget/inputs/chart-settings/combo-chart-column-settings.model';
import {
    ChartWidgetInputConfigType,
    ColumnConfig,
    ExploreSelectOptionGroup,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {ComboChartColumn} from '@models/widget/inputs/chart-settings/combo-chart-column.model';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {ColumnUtils} from '@utils/column.utils';
import {ColumnSeriesChartType, ColumnSeriesChartTypeDisplayValue} from '@enums/column-series-chart-type.enum';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {
    PgsStackedBarChartSettingsModel
} from '@models/widget/inputs/chart-settings/pgs-stacked-bar-chart-settings.model';
import {LineChartStyle} from '@enums/line-chart-style.enum';

/**
 * Component to display the settings for the combo chart column
 */
@Component({
    selector: 'app-combo-chart-column-settings',
    templateUrl: './combo-chart-column-settings.component.html',
    styleUrls: ['./combo-chart-column-settings.component.scss']
})
export class ComboChartColumnSettingsComponent extends BaseWidgetSettingComponent<ComboChartColumnSettings> {

    readonly ColumnSeriesChartType = ColumnSeriesChartType;

    defaultChartType: ColumnSeriesChartType;
    isChartSettingChanged: boolean;

    // disable chart type selection when there is stacked bar chart
    disableChartTypeSelection: boolean;

    disableLineStyleSelection: boolean;

    chartTypeSelectOptions = new Map<ComboChartColumn, ExploreSelectOptionGroup[]>();

    lineStyleSelectOptions = new Map<ComboChartColumn, ExploreSelectOptionGroup[]>();
    /**
     * method to initialize the component
     */
    initializeComponent(): void {
        this.defaultChartType = ComboChartColumn.getDefaultColumnChartType(this.widgetType);
        this.disableChartTypeSelection = this.isChartTypeSelectionDisabled();
        this.disableLineStyleSelection = !(this.widgetType === WidgetConfigType.TIME_SERIES || this.widgetType === WidgetConfigType.BAR);
        this.widgetInput.columns = this.initializeComboChartColumns((this.inputs.get(WidgetInputType.COLUMNS) as ColumnSet)?.columns, this.widgetInput.columns);
        this.isChartSettingChanged = this.setChartSettingChanged();
        this.initializeChartTypeFromTimeSeriesSettings();
    }

    private isChartTypeSelectionDisabled(): boolean {
        if (this.widgetType === WidgetConfigType.FACTOR_GRAPHING_STACK_BAR_CHART) {
            return true;
        }
        const stackBreakdown: WidgetInput = this.inputs.get(WidgetInputType.STACKED_BREAKDOWN_TREE);
        const isPgsStacked: boolean = (this.inputs.get(ChartWidgetInputConfigType.PGS_STACKED_BAR_CHART_SETTINGS) as PgsStackedBarChartSettingsModel)?.isStackedBarChart;
        return (stackBreakdown instanceof Breakdown && !stackBreakdown.isEmpty()) || isPgsStacked;
    }

    /**
     * method to set the chart type for all the combo chart columns if the time series chart type is bar
     */
    initializeChartTypeFromTimeSeriesSettings() {
        const timeSeriesChartSettings = this.inputs.get(ChartWidgetInputConfigType.TIME_SERIES_CHART_SETTINGS) as TimeSeriesSettings;
        const chartTypeFromSettings: ColumnSeriesChartType = timeSeriesChartSettings?.chartType as ColumnSeriesChartType;
        if (!chartTypeFromSettings) {
            return;
        }
        // set the chart type for all the combo chart columns if there was a previously existing time series chart settings
        this.widgetInput.columns.forEach(column => {
            column.chartType = chartTypeFromSettings;
        });
        // now that this is migrated over to ComboChartColumnSettings, clear this out so that timeSeriesChartSettings.chartType setting is not used anymore
        timeSeriesChartSettings.chartType = undefined;
    }

    private initializeComboChartColumns(columns: ColumnConfig[], existingComboColumns: ComboChartColumn[]): ComboChartColumn[] {
        const columnIdMapping = new Map(
            existingComboColumns
                .filter(obj => columns.some(col => col.columnKey === obj.colKey))
                .map(obj => [obj.colKey, obj])
        );
        // initialize all columns to have a comboChartColumn, either from the existing or a new default one
        const comboChartColumns = [];
        for (const column of columns) {
            const comboColumn = columnIdMapping.get(column.columnKey) || new ComboChartColumn({
                colKey: column.columnKey,
                chartType: this.defaultChartType,
                secondaryAxis: false
            });
            comboColumn.colTitle = column.columnTitle;
            comboColumn.colScale = this.getScalingLabel(column);
            // Directly assign the defaultChartType if chart type selection is disabled or if comboColumn lacks a chartType.
            comboColumn.chartType = this.disableChartTypeSelection || !comboColumn.chartType ? this.defaultChartType : comboColumn.chartType;
            comboColumn.lineStyle = comboColumn.lineStyle || (this.disableLineStyleSelection ? undefined : LineChartStyle.SOLID);
            this.setChartTypeSelectOption(comboColumn);
            this.setLineStyleSelectOption(comboColumn);

            comboChartColumns.push(comboColumn);
        }
        return comboChartColumns;
    }

    /**
     * method to set the chart type options for the each combo chart column
     */
    private setChartTypeSelectOption(comboColumn: ComboChartColumn): void {
        const chartTypeSelectOption: ExploreSelectOptionGroup[] = [{
            values: [
                {
                    displayValue: ColumnSeriesChartTypeDisplayValue.BAR,
                    value: ColumnSeriesChartType.BAR,
                    isSelected: comboColumn.chartType === ColumnSeriesChartType.BAR
                }
            ]
        }];

        if (this.widgetType === WidgetConfigType.BAR || this.widgetType === WidgetConfigType.TIME_SERIES) {
            chartTypeSelectOption[0].values.push({
                displayValue: ColumnSeriesChartTypeDisplayValue.MARKER,
                // "MARKER" is available option for Bar Chart and Time Series along with Bar and Line.
                value: ColumnSeriesChartType.MARKER,
                isSelected: comboColumn.chartType === ColumnSeriesChartType.MARKER
            });
        }
        if (this.widgetType === WidgetConfigType.FACTOR_GRAPHING_BAR_CHART) {
            chartTypeSelectOption[0].values.push({
                displayValue: ColumnSeriesChartTypeDisplayValue.MARKER,
                // "MARKER" is only available option for FBA Bar Chart.
                // We have been using {chartType: 'line', cssStyleClass: 'lineChart'} to display the marker in black color for the FBA Bar chart "Dot" option.
                // (check initChartMeasures in ExploreBaseBarChartDirective for details).
                // If we change this to ColumnSeriesChartType.MARKER, the color of the marker now reflects the user-configured color instead of being black.
                // To keep the same behavior as is, we are still using this "LINE" for "MARKER".
                value: ColumnSeriesChartType.LINE,
                isSelected: comboColumn.chartType === ColumnSeriesChartType.LINE
            });
        } else if (this.widgetType !== WidgetConfigType.FACTOR_GRAPHING_STACK_BAR_CHART) {
            chartTypeSelectOption[0].values.push({
                displayValue: ColumnSeriesChartTypeDisplayValue.LINE,
                value: ColumnSeriesChartType.LINE,
                isSelected: comboColumn.chartType === ColumnSeriesChartType.LINE
            });
        }

        this.chartTypeSelectOptions.set(comboColumn, chartTypeSelectOption);
    }

    private setLineStyleSelectOption(comboColumn: ComboChartColumn): void {
        const lineStyleSelectOption: ExploreSelectOptionGroup[] = [{
            values: [
                {
                    displayValue: 'Solid',
                    value: LineChartStyle.SOLID,
                    isSelected: comboColumn.lineStyle === LineChartStyle.SOLID
                },
                {
                    displayValue: 'Dashed',
                    value: LineChartStyle.DASHED,
                    isSelected: comboColumn.lineStyle === LineChartStyle.DASHED
                },
                {
                    displayValue: 'Dotted',
                    value: LineChartStyle.DOTTED,
                    isSelected: comboColumn.lineStyle === LineChartStyle.DOTTED
                }
            ]
        }];
        this.lineStyleSelectOptions.set(comboColumn, lineStyleSelectOption);
    }

    /**
     * method to get scaling label for the column
     */
    getScalingLabel(column: ColumnConfig): string {
        return ColumnUtils.getScalingLabel(column) || 'None';
    }

    /**
     * method to reset the changes made to the combo chart columns
     */
    resetChanges(): void {
        this.widgetInput.columns.forEach(column => {
            column.chartType = this.defaultChartType;
            column.secondaryAxis = false;
            column.lineStyle = this.disableLineStyleSelection ? undefined : LineChartStyle.SOLID;

            this.resetChartType(column);
            this.resetLineStyle(column);
        });
        this.isChartSettingChanged = false;
    }

    /**
     * Reset chart type to default
     */
    private resetChartType(column: ComboChartColumn): void {
        const chartTypeSelectOption = this.chartTypeSelectOptions.get(column);
        for (const selectOption of chartTypeSelectOption[0].values) {
            selectOption.isSelected = selectOption.value === this.defaultChartType;
        }
        this.chartTypeSelectOptions.set(column, [...chartTypeSelectOption]);
    }

    /**
     * Reset line style to default
     */
    private resetLineStyle(column: ComboChartColumn): void {
        if (this.disableLineStyleSelection) {
            return;
        }
        const lineStyleSelectOption = this.lineStyleSelectOptions.get(column);
        for (const selectOption of lineStyleSelectOption[0].values) {
            selectOption.isSelected = selectOption.value === LineChartStyle.SOLID;
        }
        this.lineStyleSelectOptions.set(column, [...lineStyleSelectOption]);
    }

    /**
     * Checks whether we should disable the secondary axis checkbox based on widget type
     */
    disableSecondaryAxisCheckbox(): boolean {
        return this.widgetType === WidgetConfigType.FACTOR_GRAPHING_TIME_SERIES;
    }

    /**
     * Enable undo changes button if the chart type is not a bar chart or the secondary axis is checked.
     */
    private setChartSettingChanged(): boolean {
       return this.widgetInput.columns.some(column => column.chartType !== ColumnSeriesChartType.BAR || column.secondaryAxis);
    }

    /**
     * method to set the value to the secondary axis checkbox.
     */
    onSecondaryAxisChanged(column: ComboChartColumn, value: boolean): void {
        column.secondaryAxis = value;
        this.isChartSettingChanged = column.secondaryAxis ?  true : this.setChartSettingChanged();
    }

    /**
     * method to set the value to the chart type from the drop down menu.
     */
    onChartTypeChanged(column: ComboChartColumn, value: ColumnSeriesChartType): void {
        column.chartType = value;
        this.isChartSettingChanged = column.chartType !== ColumnSeriesChartType.BAR ? true : this.setChartSettingChanged();
    }

    onLineStyleChanged(column: ComboChartColumn, value: LineChartStyle): void {
        column.lineStyle = value;
        this.isChartSettingChanged = (value !== LineChartStyle.SOLID);
    }
}
