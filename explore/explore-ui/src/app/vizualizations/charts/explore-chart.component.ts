import {Directive, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FormatConstants, WidgetDisplayInputConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {CommonConstants} from '@constants/common.constants';
import {ExploreConstants} from '@constants/explore.constants';
import {UserPreference} from '@constants/user-preference.constants';
import {DefaultCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {VizualizationColumnConfig} from '@interfaces/request.interface';
import {TimeSpanDataFormatter} from '@models/data-formatters/time-span-data.formatter';
import {ChartSettings} from '@models/widget/inputs/chart-settings/chart-settings.model';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {Widget} from '@models/widget/widget.model';
import {
    AggregationKey,
    createQK,
    DEFAULT_QUERY_KEY,
    FilterIncludeKey,
    FilterKey,
    GroupByKey,
    QueryKey,
    QueryKeyEntry
} from '@qbstr/data-cube';
import {isLeafNode, SimpleCube} from '@qbstr/data-cube-reactive';
import {
    AuxColorsQualitative,
    BarChartConfig,
    ChartMeasure,
    ChartToggles,
    HasColorMeasure,
    LineChartConfig,
    QbstrHighchartsOptions,
    QbstrPoint,
    UnionChartConfig,
    UnionChartOptions
} from '@qbstr/highcharts-api';
import {generateOptions, renderFn, setupHighcharts} from '@qbstr/highcharts-core';
import {addExploreButtons} from '@qbstr/highcharts-utils';
import {ChartUtils} from '@utils/chart.utils';
import {DOUBLE_COLUMN_TYPE, INTEGER_COLUMN_TYPE, ROOT_LEVEL, SUB_TOTAL_AGG, TIME_SPAN_COLUMN_TYPE} from '@utils/qbstr';
import {WidgetUtils} from '@utils/widget.utils';
import {Chart, ChartOptions, default as Highcharts, Options} from 'highcharts';
import {cloneDeep, isNil, isUndefined} from 'lodash';
import {takeUntil} from 'rxjs/operators';
import {DefinitionsStore, UserMetaDataStore} from '../../stores';
import {Vizualization} from '../vizualization';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {BehaviorSubject} from 'rxjs';
import {ExploreHighchartsBreadcrumbsUtils} from './explore-highcharts-breadcrumbs.utils';
import {LibColumnUtils} from '@blk/explore-ui-column-option';
import {ComboChartColumn} from '@models/widget/inputs/chart-settings/combo-chart-column.model';
import {LineChartStyle} from '@enums/line-chart-style.enum';
import {ColumnSeriesChartType} from '@enums/column-series-chart-type.enum';

@Directive()
export abstract class ExploreChartComponent<CHARTCONFIG extends UnionChartConfig<any> & HasColorMeasure<any>,
    CUSTOMVIZCONFIG extends DefaultCustomVizConfig>
    extends Vizualization
    implements OnChanges {

    protected initialized: boolean;

    @Input() public chartConfig: CHARTCONFIG;

    @Input() widget: Widget;

    @Input() set widgetPayload(widgetPayload: WidgetPayload) {
        if (this.initialized) {
            this.setInternalState(widgetPayload);
        }
    }

    // Reference to the highcharts chart component
    public chart: Chart;
    public qbstrChartConfig: UnionChartOptions<any>[];
    public qbstrOptions: QbstrHighchartsOptions;
    public qbstrOptions2: QbstrHighchartsOptions;

    protected firstCol: VizualizationColumnConfig;
    protected cols: VizualizationColumnConfig[];
    protected colsMap: { [colName: string]: VizualizationColumnConfig } = {};

    // NOTE: | any required to workaround Highcharts typings errors
    public chartOptions: Options | any = {};

    public customVizConfig: CUSTOMVIZCONFIG;

    protected leafEnrichingRequired = false;

    public defaultQueryKey: QueryKeyEntry[];

    public chartToggles: ChartToggles;

    protected _widgetPayload: WidgetPayload;

    public hc = Highcharts;

    readonly LABEL = 'label';
    readonly LEGEND = 'legend';

    protected breakdown: Breakdown;

    chartMeasures: ChartMeasure<any>[];

    protected breadcrumbsMeasures: VizualizationColumnConfig[];
    showExploreDefaultBreadcrumbs$ = new BehaviorSubject(false);

    cube: SimpleCube<any>;

    /**
     * this method is invoked when any of the property changes
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (
            !this.initialized &&
            changes.widget.currentValue &&
            isUndefined(changes.widget.previousValue) &&
            changes.widgetPayload.currentValue
        ) {
            this.widget = changes.widget.currentValue;
            this._widgetPayload = changes.widgetPayload.currentValue;
            this.setInternalState(changes.widgetPayload.currentValue);
            // set the initialized flag to true, this means all properties have initialized
            this.initialized = true;
        }
    }

    protected setInternalState(widgetPayload: WidgetPayload) {
        this.responseConfig = widgetPayload.responseConfig;
        this.requestConfig = widgetPayload.requestConfig;
        this.breakdownLevels = widgetPayload.breakdownLevels;
        this.customVizConfig = widgetPayload.customVizConfig;
        this.cube = widgetPayload.cube as SimpleCube<any>;
        this.clear();
        this.defaultQueryKey = [new FilterIncludeKey(ROOT_LEVEL, [this.requestConfig.portfolio])];
        this.setCustomVizConfigs();
        this.colsMap = {};
        const widgetInput = this.widget.displayInputs.get(WidgetDisplayInputConfigType.CHART_SETTINGS);
        this.chartToggles = {
            legendToggleBtnDisplay: !this.isBatchExport,
            labelToggleBtnDisplay: this.showLabelInputToChartLib() && !this.isBatchExport,
            selectAllNoneBtnDisplay: this.showSelectAllNoneToChartLib(),
            legend: widgetInput instanceof ChartSettings && widgetInput.legendShow,
            label: widgetInput instanceof ChartSettings && widgetInput.labelShow && this.showLabelInputToChartLib()
        };
        this.qbstrChartConfig = this.createQbstrChartConfig();

        this.generateQbstrOptions();
    }

    protected generateQbstrOptions(): void {
        //TODO: This is a workaround for AUX data-viz bug ->  https://dev.azure.com/1A4D/AUX%20Aladdin%20User%20Experience/_workitems/edit/878225
        if (!this.qbstrOptions) {
            this.qbstrOptions = this.qbstrOptionGenerator(this.qbstrChartConfig, this.chartToggles);
            this.qbstrOptions2 = undefined;
        } else {
            this.qbstrOptions2 = this.qbstrOptionGenerator(this.qbstrChartConfig, this.chartToggles);
            this.qbstrOptions = undefined;
        }
    }

    /**
     * Method to reset properties when the inputs are set.. Overridden in child components
     */
    clear() {
    }

    /**
     * Sets widget-specific overrides
     *
     * Example use case: chart is a child widget that depends on a parent for data
     */
    protected setCustomVizConfigs(): void {
        if (!this.customVizConfig) {
            return;
        }

        if (this.customVizConfig.leafLevels) {
            this.breakdownLevels = [...this.breakdownLevels, ...this.customVizConfig.leafLevels];
            this.leafEnrichingRequired = true;
        }
        if (this.customVizConfig.columns) {
            // must clone requestConfig before modifying in case there are other charts using same one
            this.requestConfig = cloneDeep(this.requestConfig);
            this.requestConfig.splitColumns = this.customVizConfig.columns;
        }
        if (this.customVizConfig.queryKeys) {
            this.defaultQueryKey = this.customVizConfig.queryKeys;
        }
    }

    abstract createChartSpecificQbstrChartConfig(cube, chartConfig, chartOptions, defaultQueryKey, chartType?): UnionChartOptions<any>;

    public createQbstrChartConfig(): UnionChartOptions<any>[] {
        this.breakdown = this.widget.dataStore.metaData.inputs.get(WidgetInputType.BREAKDOWN_TREE) as Breakdown;
        this.createVisualCols();
        if (this.breakdownLevels.length > 0) {
            this.firstCol = this.cols.find(
                (col) =>
                    col.dataType === DOUBLE_COLUMN_TYPE || col.dataType === INTEGER_COLUMN_TYPE || col.dataType === TIME_SPAN_COLUMN_TYPE
            );
            this.initChartMeasures(this.cols);
            this.chartConfig = this.createChartConfig(this.chartMeasures);
            this.chartOptions = this.createChartOptions(this.chartConfig);
            this.formatTimeSpanColumns();
        }
        if (this.leafEnrichingRequired) {
            this.enrichLeafLevel(this.cube, this.chartConfig, this.defaultQueryKey);
        }

        if (this.isDefaultBreadcrumbsSupported()) {
            this.setBreadcrumbsMeasures();
            this.showExploreDefaultBreadcrumbs$.next(true);
        }
        return this.getQbstrChartConfigs();
    }

    private createVisualCols() {
        this.cols = this.requestConfig.splitColumns ? this.requestConfig.splitColumns : this.requestConfig.columns;

        if (this.customVizConfig && this.customVizConfig.header) {
            this.cols = this.cols.filter(
                (col: VizualizationColumnConfig) =>
                    col.columnKey.split(CommonConstants.COLUMN_KEY_SPLITTER)[1] === this.customVizConfig.header ||
                    col.columnTitle === this.customVizConfig.header ||
                    col.columnKey.indexOf(CommonConstants.COLUMN_KEY_SPLITTER) === -1
            );
        }
        this.cols.forEach((col) => (this.colsMap[col.columnKey] = col));
    }

    protected getQbstrChartConfigs() {
        return [
            this.createChartSpecificQbstrChartConfig(this.cube, this.chartConfig, this.chartOptions, this.defaultQueryKey),
        ].filter((c) => !!c);
    }

    protected isDefaultBreadcrumbsSupported(): boolean {
        return false;
    }

    protected setBreadcrumbsMeasures(): void {
        if (ChartUtils.isPGSGraphingSpritelet(this.widget.configType)) {
            this.breadcrumbsMeasures = this.customVizConfig?.['breadcrumbsMeasures'];
        } else {
            this.breadcrumbsMeasures = this.requestConfig.columns;
        }
    }

    /**
     * Method to format TIME_SPAN data type columns values to convert them in numeric values
     */
    protected formatTimeSpanColumns() {
        const chartMeasures = [...this.chartConfig.measures];
        if (this.chartConfig.colorMeasure) {
            chartMeasures.push(this.chartConfig.colorMeasure);
        }
        const timeSpanColumns = chartMeasures
            .filter((measure) => this.colsMap[measure.name].dataType === TIME_SPAN_COLUMN_TYPE)
            .map((measure) => this.colsMap[measure.name]);
        if (timeSpanColumns.length > 0) {
            timeSpanColumns
                .map((timeSpanColumn) => timeSpanColumn.formatter)
                .filter((formatter) => (formatter as TimeSpanDataFormatter).optionValue.timeUnit === FormatConstants.CUSTOM)
                .forEach((formatter) => {
                    (formatter as TimeSpanDataFormatter).optionValue.timeUnit = FormatConstants.DAYS;
                });
            this.cube
                .keys()
                .filter((key) => key.hashId !== DEFAULT_QUERY_KEY.hashId)
                .forEach((key) => {
                    this.cube.get(key).subscribe((data) => {
                        data.forEach((row) => {
                            timeSpanColumns
                                .filter((column) => !isNil(row[column.columnKey]))
                                .forEach((column) => {
                                    row[column.columnKey] = parseFloat(
                                        column.formatter.format(row[column.columnKey]).split(/[dmyDMY]$/g)[0]
                                    );
                                });
                        });
                    });
                });
        }
    }

    /**
     * create chart measures
     */
    protected initChartMeasures(cols: VizualizationColumnConfig[]): void {
        this.chartMeasures = cols
            .filter((col) => col.isSubtotalable)
            .map((col) => ({
                name: col.columnKey,
                title: col.columnTitle,
                aggMethod: SUB_TOTAL_AGG
            }));
    }

    protected abstract createChartConfig(measures: ChartMeasure<any>[]): CHARTCONFIG;

    protected getBreadcrumbsOptions(measureName = this.firstCol.columnTitle): { topNames: string[], separator: string } {
        const topNames = [measureName];
        if (this.breakdown?.children.length) {
            topNames.push(this.breakdown.children[0].getTitle());
        }
        return {
            topNames,
            separator: ExploreHighchartsBreadcrumbsUtils.breadcrumbsSeparator
        };
    }

    /**
     * Generates the highcharts options via the qbstr charts utility
     *
     */
    qbstrOptionGenerator(config: UnionChartOptions<any>[], chartToggles: ChartToggles): QbstrHighchartsOptions {
        return addExploreButtons(
            setupHighcharts(this.hc, ['exporting', 'sunburst', 'treemap', 'heatmap']),
            generateOptions<any>(config as any),
            chartToggles,
            this.storeChangedChartState
        );
    }

    protected createFormatter = (isSecondary?: boolean): any => {
        const context = this;
        return function () {
            return context.formatYAxisValue(this, isSecondary);
        };
    };

    protected formatYAxisValue(yAxisPoint: any, isSecondary?: boolean): any {
        const columnsInYAxis = isUndefined(isSecondary) ? this.chartMeasures : this.chartMeasures.filter((measure) => {
            return isSecondary ? measure.axis === 1 : measure.axis !== 1;
        });

        if (!columnsInYAxis.length) {
            return yAxisPoint.value;
        }

        const firstColumn = this.colsMap[columnsInYAxis[0].name];
        const formattedValue = this.formatValue(yAxisPoint.value, firstColumn.formatter, false);
        if (columnsInYAxis.length === 1 || columnsInYAxis.every(column => this.colsMap[column.name].scale === firstColumn.scale)) {
            return formattedValue;
        }
        return Number(String(formattedValue).replace(/,/g, '').replace(/%/g, ''));
    }

    /**
     * Format provided value depending on column formatter
     */
    protected formatValue(value: any, formatter: any, applyTimeSpanPostFix = true) {
        if (formatter instanceof TimeSpanDataFormatter) {
            return applyTimeSpanPostFix ? formatter.applyPostfix(value) : value;
        } else {
            return formatter?.format(WidgetUtils.getInputValueToFormat(value, formatter), {locale: UserMetaDataStore.getPreferenceValue(UserPreference.LOCALE)});
        }
    }

    protected createPointFormatter(): any {
        const context = this;
        return function (): string {
            const qbstr = (this as QbstrPoint)?.qbstr;
            const formatter = context.colsMap[qbstr?.measureName].formatter;
            const formattedValue = context.formatValue(qbstr?.negative && this.y > 0 ? this.y * -1 : this.y, formatter);
            return `<b>${this.name}</b>: ${formattedValue}<br/>`;
        };
    }

    /**
     * Store the chart state changes in display inputs
     * We do-not need to add markForCheck here, as it would cause the chart to keep rendering in a never ending loop
     */
    public storeChangedChartState = ($event: ChartToggles) => {
        const widgetInput = this.widget.displayInputs.get(WidgetDisplayInputConfigType.CHART_SETTINGS);
        if (widgetInput instanceof ChartSettings && $event.hasOwnProperty(this.LEGEND)) {
            widgetInput.legendShow = $event.legend;
        }
        if (widgetInput instanceof ChartSettings && $event.hasOwnProperty(this.LABEL)) {
            widgetInput.labelShow = $event.label;
            if (this.isDefaultBreadcrumbsSupported()) {
                this.showExploreDefaultBreadcrumbs$.next($event.label);
            }
        }
    };

    /**
     * returns the default label input to chartLib
     */
    protected showLabelInputToChartLib(): boolean {
        // true by default
        return true;
    }

    /**
     * returns whether to show select all and none label
     */
    protected showSelectAllNoneToChartLib(): boolean {
        // true by default
        return true;
    }

    /**
     * format the points on time series chart
     */
    tooltipPointFormatter(point): any {
        const qbstr = (point as QbstrPoint)?.qbstr;
        const formattedValue = this.formatValue(qbstr?.negative && point.y > 0 ? point.y * -1 : point.y, this.firstCol.formatter);
        return point.series.name === point.name
            ? `<b>${point.name}</b>: ${formattedValue}<br/>`
            : `${point.series.name}<br><b>${point.name}</b>: ${formattedValue}<br/>`;
    }

    protected createChartOptions(chartConfig?: CHARTCONFIG): Options {
        const [showLegend, showLabel] = this.getShowLegendAndLabel();
        const options: any = {
            legend: {enabled: showLegend, maxHeight: 100, itemMarginTop: 3.5, align: 'center'},
            hideLegendToggle: this.isBatchExport
        };
        const context = this;

        // Add special legend configs to the highcharts config for export related rendering
        // This will adjust the legend to show more sectors for the purposes of printing on a PDF
        if (this.isBatchExport) {
            options.legend.maxHeight = 120;
            options.legend.width = '100%';
            options.legend.itemDistance = 8;

            options.legend.labelFormatter = this.createLegendLabelFormatter();
        }

        return {
            ...options,
            title: {
                text: null
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: showLabel,
                        formatter() {
                            const qbstr = (this.point as QbstrPoint)?.qbstr;
                            const formatter = context.colsMap[qbstr?.measureName]?.formatter;
                            return context.formatValue(this.y, formatter);
                        }
                    },
                    tooltip: {
                        pointFormatter: this.createPointFormatter()
                    }
                }
            },
            chart: this.createChartConfigOptions(),
            colors: DefinitionsStore.customColors.length ? DefinitionsStore.customColors : undefined,
            credits: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            xAxis: {
                gridLineWidth: this.customVizConfig?.showGridLines ? 1 : 0
            },
            yAxis: {
                title: {
                    text: ''
                },
                labels: {
                    formatter: this.createFormatter()
                }
            }
        };
    }

    protected createChartConfigOptions(): ChartOptions {
        return {
            animation: false,
            zoomType: 'xy',
            events: {
                render: (event) =>
                    renderFn(event, UserMetaDataStore.getPreferenceValue(UserPreference.THEME) === ExploreConstants.THEME_LIGHT_MODE)
            }
        };
    }

    protected toggleShowExploreDefaultBreadcrumbsState(event: any): void {
        if (event.target?.drilldownLevels?.length > 0) {
            this.showExploreDefaultBreadcrumbs$.next(false);
        } else if (!event.breadcrumbs) {
            this.showExploreDefaultBreadcrumbs$.next(true);
        }
    }

    /**
     * returs showLegend and showLabel
     */
    getShowLegendAndLabel(): boolean[] {
        const widgetInput = this.widget.displayInputs.get(WidgetDisplayInputConfigType.CHART_SETTINGS) as ChartSettings;
        const showLegend = !isUndefined(widgetInput) ? widgetInput.legendShow : true; // some charts do not have chartSettings like Expost Time Series Chart
        const showLabel = !isUndefined(widgetInput) ? widgetInput.labelShow : true;
        return [showLegend, showLabel];
    }

    createLegendLabelFormatter() {
        const context = this;
        return function() {
            return context.truncateNameForBatchExport(this);
        };
    }

    truncateNameForBatchExport(legendItem: any): string {
        // If the sector is more than 21 characters, truncate it and no of legend items are more than 10
        if (legendItem.chart?.legend?.allItems?.length > 10 && legendItem.name?.length > 21) {
            return legendItem.name.slice(0, 18) + CommonConstants.TRUNCATION_KEY;
        } else {
            return legendItem.name;
        }
    }

    /**
     * Adds additional enriching to the cube for showing leaf level data
     */
    protected enrichLeafLevel(cube: SimpleCube<any>, chartConfig: CHARTCONFIG, defaultQueryKeyEntries: QueryKeyEntry[]): void {
        const measureAggKeys = chartConfig.measures.map((measure) => new AggregationKey(measure.name, measure.aggMethod));

        const leafLevelGroupByKey = new GroupByKey(chartConfig.groupBy[chartConfig.groupBy.length - 1]);

        // get composite keys whose filterKeys length is equal to defaultQueryKeyEntries length
        // and the last QueryKeyEntry match in this.defaultQueryKey
        const cksForSet = cube.keys().filter((qk) => {
            return (
                qk.filterKeys().length === defaultQueryKeyEntries.length &&
                qk.filterKeys().find((fk) => fk.isEqual(defaultQueryKeyEntries[defaultQueryKeyEntries.length - 1] as FilterKey<any>))
            );
        });

        // 916657: To fix the bar/pie chart drilldown data miss-match issue,
        // need to pass in the correct keys to qbstr following the qbstr drilldown key generation pattern.
        const flattenedRow = this.breakdownLevels[this.breakdownLevels.length - 1];
        if (ChartUtils.isFactorGraphingSpritelet(this.widget.configType) || ChartUtils.isPGSGraphingSpritelet(this.widget.configType) && flattenedRow) {
            const measureKeys = chartConfig.measures.map(measure => new AggregationKey(measure.name, measure.aggMethod));
            cube.keys()
                .filter(qk => isLeafNode(qk))
                .forEach(qk => {
                    const newLeafQueryKey = new QueryKey([...qk.queryKeyEntries, ...measureKeys, new GroupByKey(flattenedRow)]);
                    cube.set(newLeafQueryKey, cube.getData(qk));
                });
        }

        // map each key to the leaf groupBy
        // we need to iterate through all the values in the cube to find all leaf level nodes/data
        // since not all leaf level nodes/data have a breakdown path equal to chartConfig.breakdowns
        cksForSet.forEach((filterKeysCK) => {
            cube.getSimilarIfPresent(filterKeysCK)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((data) => {
                    // filter data on the condition that leafLevelGroupByKey.field exists and 'title' is undefined
                    const leafLevelNodes = data.filter((node) => node[leafLevelGroupByKey.field] && !node['title']);

                    // leafLevelNodes contains leaf level data
                    // if true, we iterate over the elements in the leafLevelNodes array. Assigning the elements value in leafLevelGroupByKey.field to 'title'
                    // for Pie Charts, the value in 'title' is used to fill in the text in the legend and pop-up box when we hover over a slice
                    if (leafLevelNodes?.length > 0) {
                        leafLevelNodes.forEach((leafNode) => {
                            leafNode['title'] = leafNode[leafLevelGroupByKey.field];
                        });
                        cube.set(createQK([...filterKeysCK.queryKeyEntries, leafLevelGroupByKey, ...measureAggKeys]), data);
                    }
                });
        });
    }

    /**
     * Sets the highcharts chart object onto the chart component
     */
    public setChartObject = (chartInstance: Chart) => {
        this.chart = chartInstance;
    }

    /**
     * Overrides colors applied to bars if style columns are present
     * Constituents of style columns have the same color as the top
     * level column
     * @param chartConfig
     */
    public overrideStyleColumnColorScheme (chartConfig: LineChartConfig<any> | BarChartConfig<any>) {
        // No need to change anything if there are no style columns or if stacked breakdown is applied
        if (!isNil(chartConfig['stacked']) || !chartConfig.measures.some(measure => LibColumnUtils.isStyleColumn(this.colsMap[measure.name]?.columnTag))) {
            return;
        }

        let index = 0;
        const colorMap: Map<string, any> = new Map<string, any>();
        const colorList = Object.values(AuxColorsQualitative);
        for (const col of new Set(chartConfig.measures
            .map(column => column.name.split(CommonConstants.COLUMN_KEY_SPLITTER)[0]))
            .keys()) {
            colorMap.set(col, colorList[index++ % colorList.length]);
        }

        chartConfig.knownColors = {
            series: {}
        };
        chartConfig.measures.forEach(measure => {
            chartConfig.knownColors.series[measure.title] = colorMap.get(measure.name.split(CommonConstants.COLUMN_KEY_SPLITTER)[0]);
            chartConfig.knownColors.series[this.colsMap[measure.name].splitColumnHeaderName || measure.title] = colorMap.get(measure.name.split(CommonConstants.COLUMN_KEY_SPLITTER)[0]);
        });
    }

    /**
     * For line measures, apply the lineStyle CSS class to the measure if specified in the comboChartColumn
     */
    protected getComboChartLineStyleCss(comboChartColumn: ComboChartColumn): string {
        if (comboChartColumn?.chartType !== ColumnSeriesChartType.LINE) {
            return undefined;
        }
        // if lineStyle is specified in comboChartColumn, apply proper CSS to measure
        // NOTE: if no css class is added it will default to SOLID line
        if (comboChartColumn?.lineStyle === LineChartStyle.DASHED) {
            return 'custom-stroke-dashed';
        } else if (comboChartColumn?.lineStyle === LineChartStyle.DOTTED) {
            return 'custom-stroke-dotted';
        }
        return undefined;
    }

}
