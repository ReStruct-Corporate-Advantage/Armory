import {Directive} from '@angular/core';
import {
    BarCustomVizConfig,
    FactorBarCustomVizConfig
} from '@interfaces/custom-viz-config.interface';
import {ExploreEnrichingChartDirective} from './explore-enriching-chart.directive';
import {
    BarChartConfig,
    BarChartOptions,
    ChartMeasure,
    ChartType,
    HasSeriesNameOverride,
    HasXAxisOverride,
    LineChartConfig,
    QbstrHighchartsOptions,
    QbstrPoint
} from '@qbstr/highcharts-api';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {AggregationKey, createQK, FilterIncludeKey, GroupByKey, QueryKeyEntry} from '@qbstr/data-cube';
import {ColumnConstants, CoreCommonConstants} from '@blk/explore-ui-core';
import {cloneDeep, flatten, isNil, join, merge, reverse} from 'lodash';
import {hookVisibilityUtils} from '@qbstr/highcharts-core';
import {VizualizationColumnConfig} from '@interfaces/request.interface';
import {CommonConstants} from '@constants/common.constants';
import {ExploreHighchartsBreadcrumbsUtils} from './explore-highcharts-breadcrumbs.utils';
import {Options, YAxisOptions} from 'highcharts';
import {combineLatest, Observable} from 'rxjs';
import {filter, map, takeUntil} from 'rxjs/operators';
import {ROOT_LEVEL, SUB_TOTAL_AGG} from '@utils/qbstr';
import {ColumnSeriesChartType} from '@enums/column-series-chart-type.enum';
import {ChartUtils} from '@utils/chart.utils';
import {CompositionConstants} from '@constants/composition.constants';
import {ComboChartColumn} from '@models/widget/inputs/chart-settings/combo-chart-column.model';

@Directive()
export abstract class ExploreBaseBarChartDirective<T extends (BarCustomVizConfig | FactorBarCustomVizConfig)>
    extends ExploreEnrichingChartDirective<BarChartConfig<any> & HasSeriesNameOverride & HasXAxisOverride, T> {

    /**
     * create chart measures
     */
    protected initChartMeasures(cols: VizualizationColumnConfig[]): void {
        this.chartMeasures = cols
            .filter((col) => col.isSubtotalable)
            .map((col) => {
                const comboChartColumn = this.customVizConfig.comboChartColumns?.find(column => column.colKey === col.columnKey.split(CommonConstants.COLUMN_KEY_SPLITTER)[0]);
                return {
                    name: col.columnKey,
                    title: col.columnTitle,
                    aggMethod: SUB_TOTAL_AGG,
                    chartType: ColumnSeriesChartType.getHighchartChartType(comboChartColumn?.chartType || ColumnSeriesChartType.BAR),
                    cssStyleClass: this.getChartMeasureCssStyleClass(comboChartColumn),
                    axis: comboChartColumn?.secondaryAxis ? 1 : undefined
                };
            });
    }

    /**
     * Adds parent class to measures allowing us to override any inner highcharts styling for the measure
     */
    protected getChartMeasureCssStyleClass(_comboChartColumn: ComboChartColumn): string {
        return undefined;
    }

    /**
     * createChartConfig
     */
    protected createChartConfig(measures: ChartMeasure<any>[]): BarChartConfig<any> {
        const selectedLevel = this.defaultQueryKey.length;
        const isSplitColumn = this.isSplitColumnKey(measures);

        const breakdownLevels = this.enrichBreakdownLevels();
        const groupBys = this.getGroupBys(breakdownLevels);
        if (groupBys.length === 0) {
            this.defaultQueryKey = [new GroupByKey(ROOT_LEVEL)];
        }
        const splitColumnAndSingleBreakdown = isSplitColumn && breakdownLevels.length === 1;
        const measuresToUse = this.enrichMeasureTitle(measures);
        const measureName = measuresToUse.length > 1 ? ExploreHighchartsBreadcrumbsUtils.multiColumnMeasuresName : this.firstCol.columnTitle;

        let stackedLevel = breakdownLevels.slice(-1)[0];
        if (!isNil(this.customVizConfig.queryKeys) && this.customVizConfig.isStacked) { // for PGS stacked bar chart, cube will not have anything corresponding to 'portfolio' field
            stackedLevel = breakdownLevels.includes(ColumnConstants.PORTFOLIO) ? breakdownLevels.slice(-2)[0] : stackedLevel;
        }
        return {
            groupBy: groupBys,
            drillDown: this.customVizConfig.isStacked ? undefined : breakdownLevels.slice(selectedLevel + 1, breakdownLevels.length),
            stacked: this.customVizConfig.isStacked ? stackedLevel : undefined,
            seriesNameOverride: isSplitColumn ? this.seriesNameOverride as any : undefined,
            measures: measuresToUse,
            sortOrder: splitColumnAndSingleBreakdown ? undefined : this.customVizConfig.sortOrder,
            sortBy: splitColumnAndSingleBreakdown ? undefined : this.getSortBy(this.getMeasuresAsCols(measures)),
            topBottomFilterParams: this.customVizConfig.topBottomFilterParams,
            xAxisOverride: isSplitColumn && !this.isSingleSplitKeyColumn(this.getMeasuresAsCols(measures)) && this.customVizConfig.isStacked && groupBys.length === 1 ? this.xAxisOverride as any : undefined,
            breadcrumbs: this.getBreadcrumbsOptions(measureName)
        };
    }

    /**
     * During createChartConfig process getGroupBys with given breakdownLevels
     */
    protected getGroupBys(breakdownLevels: string[]): string[] {
        return breakdownLevels.slice(this.defaultQueryKey.length, breakdownLevels.length);
    }

    /**
     * During createChartConfig process getMeasuresAsCols for given measures
     */
    protected getMeasuresAsCols(measures: ChartMeasure<any>[]): ChartMeasure<any>[] {
        return this.enrichMeasureTitle(measures);
    }

    /**
     * Overriding the method here and not passing chartConfig to super makes sure that bar chart doesn't derive its config based on first measure
     * For example the Y axis title should be Values and not the title of the first measure
     */
    protected createChartOptions(chartConfig: BarChartConfig<any>): Options {

        const context = this;

        const secondaryAxis = chartConfig.measures.find(measure => measure.axis === 1);

        const chartOptions = merge({},
            super.createChartOptions(),
            {
                chart: {
                    alignThresholds: !!secondaryAxis && !this.customVizConfig.isStacked,
                    events: {
                        drilldown: event => {
                            context.toggleShowExploreDefaultBreadcrumbsState(event);
                            // For horizontal bar chart with secondary y axis, highcharts actually adds the breadcrumbs without drilldown (normally highcharts add breadcrumbs only on drilldown state),
                            // but it overlaps with the secondary x axis (in the horizontal mode, the secondary y axis gets added at the top of the chart as the secondary x axis).
                            //  check the screenshot in the ticket: https://dev.azure.com/1A4D/Explore/_workitems/edit/1608385
                            // In this case, hide the breadcrumbs with hidden position and bring it back on drilldown.
                            this.showHiddenBreadcrumbs();
                        },
                        drillup: (event) => {
                            context.showYAxisTitle(event);
                            context.toggleShowExploreDefaultBreadcrumbsState(event);
                        },
                    }
                },
                plotOptions: {
                    column: {
                        stacking: this.customVizConfig.isStacked ? 'normal' : undefined,
                        dataLabels: {
                            enabled: true
                        },
                    },
                    bar: {
                        stacking: this.customVizConfig.isStacked ? 'normal' : undefined,
                        dataLabels: {
                            enabled: true
                        },
                    },
                    line: {
                        dataLabels: {
                            formatter() {
                                const qbstr = (this.point as QbstrPoint)?.qbstr;
                                const formatter = context.colsMap[qbstr.measureName].formatter;
                                return context.formatValue(this.y, formatter);
                            }
                        },
                        zIndex: 1 // ensure that line/marker series are on top of bar/column series
                    },
                    series: {
                        dataLabels: {
                            crop: false,
                            allowOverlap: false,
                            overflow: 'none',
                            padding: 1
                        },
                        grouping: this.isGroupingEnabled(),
                        tooltip: {
                            headerFormat: '',
                            pointFormatter() {
                                return context.tooltipPointFormatter(this);
                            }
                        }
                    }
                },
                yAxis: this.createYAxisOptionsList(chartConfig),
                xAxis: {
                    labels: {
                        autoRotationLimit: 100,
                        startOnTick: true,
                        endOnTick: true,
                        showLastLabel: true
                    }
                }
            });

        return chartOptions;
    }

    /**
     * Creates a qbstr chart config of either BAR or COLUMN.
     * LINE measures are also in this config and controlled by the chart type on the individual measures.
     */
    createChartSpecificQbstrChartConfig(cube: SimpleCube<any>,
                                        chartConfig: BarChartConfig<any>,
                                        chartOptions: QbstrHighchartsOptions,
                                        defaultQueryKey: QueryKeyEntry[]
    ): BarChartOptions<any> {
        // use the chart orientation if one has been set, otherwise default to COLUMN
        const chartConfigType: ChartType = this.customVizConfig.chartOrientation || ChartType.COLUMN;

        if (this.customVizConfig.showBaseline) {
            // Fixed to column, axis orientation handled by QbstrCharts Explore-specific code downstream.
            chartOptions = this.applyBaseline(ChartType.COLUMN, chartOptions);
        }

        if (chartConfigType === ChartType.COLUMN
            && !chartConfig.stacked
            && (!this.isGroupingEnabled())) {
            chartOptions = this.updateChartOptionsWithVisibilityUtils(chartOptions, chartConfigType);
        }

        this.overrideStyleColumnColorScheme(chartConfig);

        return {
            data: cube,
            type: chartConfigType,
            chartConfig,
            chartOptions,
            defaultQueryKeyEntries: defaultQueryKey,
            autoResizeDelay: -1
        };
    }

    updateChartOptionsWithVisibilityUtils(chartOptions: QbstrHighchartsOptions, chartType: ChartType): QbstrHighchartsOptions {
        return merge({},
            chartOptions,
            hookVisibilityUtils(chartType, 'xAxis')
        );
    }

    /**
     * set the grouping flag to avoid skinny bars
     */
    isGroupingEnabled(): boolean {
        return this.chartConfig.stacked ? this.chartConfig.groupBy.length > 1 || (this.isSplitColumnKey(this.chartConfig.measures) && !this.isSingleSplitKeyColumn(this.chartConfig.measures)) : this.chartConfig.groupBy.length > 0 || this.isSplitColumnKey(this.chartConfig.measures);
    }

    /**
     * Check if Single Split Key column present like Market Value|Prior Day
     * we do not want to enrich split column keys if present
     */
    isSingleSplitKeyColumn(measures: ChartMeasure<any>[]): boolean {
        let isColPresent = false;
        const colMapNew = new Map<string, ChartMeasure<any>[]>();
        measures.forEach(measure => {
            const key = measure.name.split('|')[0];
            let values = colMapNew.get(key);
            if (isNil(values)) {
                values = [];
                colMapNew.set(key, values);
            }
            values.push(measure);
        });
        colMapNew.forEach(value => {
            if (value.length === 1) {
                isColPresent = true;
            }
        });
        return isColPresent;
    }

    protected isDefaultBreadcrumbsSupported(): boolean {
        return true;
    }

    /**
     * should enrich breakdown levels
     */
    enrichBreakdownLevels(): string[] {
        const breakdownLevels = [...this.breakdownLevels];

        if (this.customVizConfig.stackByImmediateChild) {
            breakdownLevels.splice(this.defaultQueryKey.length + 1);
        }

        return breakdownLevels;
    }

    /**
     * Get sortBy to be used for sorting BarChart
     *  eg>
     *      pct_notional_val_389bc97177124f8 => pct_notional_val_389bc97177124f8|03/11/2016
     *      pct_notional_val_0 => pct_notional_val_0| Δ Prior Day
     */
    protected getSortBy(measures: ChartMeasure<any>[]): string {
        for (const measure of measures) {
            if (this.customVizConfig.sortOrder && this.customVizConfig.sortBy && measure.name.includes(this.customVizConfig.sortBy + '|')) {
                return measure.name;
            }
        }
        return this.customVizConfig.sortBy;
    }

    /**
     * should enrich the measure title if multiple split keys are present
     */
    enrichMeasureTitle(measures: ChartMeasure<any>[]): ChartMeasure<any>[] {
        measures.forEach(measure => {
            const splitKeys = measure.name.split(CommonConstants.COLUMN_KEY_SPLITTER).slice(1);
            if (ChartUtils.isPGSGraphingSpritelet(this.widget.configType) && splitKeys.length > 0) {
                measure.title = measure.title.split(CompositionConstants.OPENING_SMALL_BRACKET)[0] + CompositionConstants.OPENING_SMALL_BRACKET + join(splitKeys, CommonConstants.SINGLE_SPACE) + CompositionConstants.CLOSING_SMALL_BRACKET;
            } else if (splitKeys.length > 1) {
                splitKeys.unshift(this.colsMap[measure.name].splitColumnHeaderName);
                measure.title = join(reverse(splitKeys), ' ');
            }
        });
        return measures;
    }

    protected seriesNameOverride = (measure: ChartMeasure<any>, column: any): string => {
        return this.colsMap[measure.name]?.splitColumnHeaderName || measure.title || column.title;
    }

    protected xAxisOverride = (chartConfig: BarChartConfig<any>): string[] => {
        const cols: { [colName: string]: VizualizationColumnConfig } = cloneDeep(this.colsMap);
        chartConfig.measures.forEach(measure => delete cols[measure.name]);

        // In case of Comparison mode and only stacked breakdown, xAxis categories should be column Title
        if (this.requestConfig.portfolio === CommonConstants.COMPARE && this.chartConfig.stacked && this.breakdownLevels.length === 2) {
            return Array.from(new Set(Object.keys(cols).map(key => {
                const splitKeys = key.split(CommonConstants.COLUMN_KEY_SPLITTER);
                // Extract the category from splitKeys if length is > 2 else use Column title
                // e.g. market_123|Prior Day|PEP will return Prior Day as Category and market_123|PEP will return Market Value
                return splitKeys.length > 2 ? splitKeys[splitKeys.length - 2] : cols[key].splitColumnHeaderName;
            })));
        }
        return Array.from(new Set(Object.keys(cols).map(col => {
            const splitKeys = col.split(CommonConstants.COLUMN_KEY_SPLITTER);
            return splitKeys[splitKeys.length - 1];
        })));
    };

    showHiddenBreadcrumbs = () => {
        if (this.chart['breadcrumbs'].options.position.y === ExploreHighchartsBreadcrumbsUtils.BREADCRUMB_HIDDEN_POSITION_Y) {
            this.chart['breadcrumbs'].options.position.y = -50;
            this.chart['breadcrumbs'].update();
        }
    }

    protected createYAxisOptionsList(chartConfig: LineChartConfig<any>): YAxisOptions[] {
        const primaryAxisCols = chartConfig.measures.filter(measure => measure.axis !== 1);
        const secondaryAxisCols = chartConfig.measures.filter(measure => measure.axis === 1);
        return super.createYAxisOptionsList(chartConfig, this.getDefaultAxisTitle(primaryAxisCols), this.getDefaultAxisTitle(secondaryAxisCols));
    }

    protected getMeasureTitle(chartMeasure: ChartMeasure<any>): string {
        return chartMeasure.title;
    }

    /**
     * format the tooltip points on bar chart
     */
    tooltipPointFormatter(point): any {
        const qbstr = (point as QbstrPoint).qbstr;
        const vizConfig = this.colsMap[qbstr.measureName];
        const y = this.formatValue(point.y, vizConfig.formatter);

        let columnTitle;

        if (this.requestConfig.portfolio === CommonConstants.COMPARE && this.breakdownLevels.length === 1 && qbstr.measureName.split(CommonConstants.COLUMN_KEY_SPLITTER).length > 1) {
            columnTitle = vizConfig.columnTitle;
        } else {
            const measureToUse = this.chartConfig.measures.find(measure => measure.name === qbstr.measureName);
            columnTitle = measureToUse.title || measureToUse.name;
        }

        if (this.chartConfig.stacked && this.chartConfig.groupBy.length > 1) {
            return `<b>${qbstr.stackName || columnTitle || ''}</b><br><b>&nbsp;${qbstr.stack}</b><br><b>&nbsp;${point.category}</b>: ${y}<br>`;
        } else if (this.chartConfig.stacked) {
            return `<b>${point.category}</b><br><b>&nbsp;${point.name}</b>: ${y}<br>`;
        } else {
            return `<b>${columnTitle}</b><br><b>&nbsp;${point.name}</b>: ${y}<br>`;
        }
    }

    /**
     * formatter for show total labels
     */
    totalLabelFormatter(point: any, isDotEnabled: boolean): any {
        if (point.total <= 0) {
            return CoreCommonConstants.EMPTY_STRING;
        }

        const totalCK = [
            ...this.defaultQueryKey,
            ...this.chartConfig.measures.map(measure => new AggregationKey(measure.name, measure.aggMethod)),
            new FilterIncludeKey(this.chartConfig.groupBy[0], ['Total']),
            new GroupByKey(this.chartConfig.groupBy[0])
        ];
        const category = this.chartConfig.groupBy.length > 1 ? point.axis.chart.xAxis[0].categories[point.x] : 'Total';

        // get current measure for data
        const currentMeasure = this.chartConfig.measures.find(measure => measure.title === point.stack);

        const totalQK = createQK(totalCK);
        const data = this.cube.getData(totalQK)?.find(row => {
            return row[this.chartConfig.groupBy[0]] === category
                && row.hasOwnProperty(currentMeasure.name);
        });

        const measureCol = this.cols.find(col => col.columnKey === currentMeasure.name);
        const totalValue = data ? this.formatValue(data[measureCol.columnKey], measureCol.formatter) : CoreCommonConstants.EMPTY_STRING;

        return isDotEnabled && !!totalValue ? `&#9679; ${totalValue}` : totalValue;
    }

    /**
     * format the x-axis labels accordingly
     */
    formatXaxisLabel(point: any): string {
        return `<span class="txt">${point.value}</span>`;
    }

    enrichCube(cube: SimpleCube<any>, chartConfig: BarChartConfig<any>, defaultQueryKeyEntries: QueryKeyEntry[]) {
        const measures: ChartMeasure<any>[] = chartConfig.measures;
        const measureKeys = measures.map(measure => new AggregationKey(measure.name, measure.aggMethod));
        const columnNames: Map<string, string> = new Map();
        measures.forEach(measure => columnNames.set(measure.name.split('|')[0], measure.name));

        this.enrichCubeForPgsStackedBarChart(chartConfig, cube, defaultQueryKeyEntries, measureKeys, columnNames);

        this.enrichCubeForStackedBarChart(cube, chartConfig, defaultQueryKeyEntries);

        if ((!this.isSplitColumnKey(measures) || (this.isSplitColumnKey(measures) && this.isSingleSplitKeyColumn(measures))) && chartConfig.stacked && this.customVizConfig.showTotal && chartConfig.groupBy.length === 1) {
            const totalCKNew = [
                new GroupByKey(ROOT_LEVEL),
                ...measureKeys
            ];
            cube.get(createQK(totalCKNew)).pipe(
                filter(v => !!v),
                map((totalRows: any[]) => totalRows.map(row => ({
                    ...row,
                    [chartConfig.stacked]: 'Total'
                })))).subscribe(data => {
                cube.set(createQK([new FilterIncludeKey('level-1', ['Total']), new GroupByKey(chartConfig.groupBy[0]),
                    ...defaultQueryKeyEntries, ...measureKeys]), data);
            });
        }

        if (this.isSplitColumnKey(measures) && !this.isSingleSplitKeyColumn(measures) && (chartConfig.stacked && chartConfig.groupBy.length === 1 || !chartConfig.stacked && chartConfig.groupBy.length === 0) && !(ChartUtils.isPGSGraphingSpritelet(chartConfig.widgetType) && chartConfig.stacked)) {
            super.enrichSplitColumnKeys(cube, chartConfig, defaultQueryKeyEntries);
        }
    }

    private enrichCubeForStackedBarChart(cube: SimpleCube<any>, chartConfig: BarChartConfig<any>, defaultQueryKeyEntries: QueryKeyEntry[]): void {
        if (!chartConfig.stacked) {
            return;
        }

        const measures: ChartMeasure<any>[] = chartConfig.measures;
        const measureKeys = measures.map(measure => new AggregationKey(measure.name, measure.aggMethod));

        if (chartConfig.groupBy.length > 1) {
            const groupKeys = [new GroupByKey(chartConfig.stacked), new GroupByKey(chartConfig.groupBy[0])];

            const cksForSet = cube.keys().filter(ck => ck.groupKeys().find(gk => gk.isEqual(groupKeys[0])));
            const keysToJoin: Observable<any>[] = cksForSet.map(ck => cube.getSimilarIfPresent(ck));
            combineLatest(keysToJoin).pipe(takeUntil(this.ngUnsubscribe)).subscribe(dataSets => {
                if (!ChartUtils.isPGSGraphingSpritelet(this.chartConfig.widgetType)) {
                    const sunburstCK = createQK([...defaultQueryKeyEntries, ...groupKeys, ...measureKeys]);
                    cube.set(sunburstCK, flatten(dataSets));
                }
            });
        }

        if (this.customVizConfig.showTotal && chartConfig.groupBy.length > 1) {
            const totalCK = [
                ...defaultQueryKeyEntries,
                ...measureKeys,
                new GroupByKey(chartConfig.groupBy[0])
            ];
            cube.get(createQK(totalCK)).pipe(
                filter(v => !!v),
                map((totalRows: any[]) => totalRows.map(row => ({
                    ...row,
                    [chartConfig.stacked]: 'Total'
                })))).subscribe(data => {
                cube.set(createQK([new FilterIncludeKey('level-1', ['Total']), ...totalCK]), data);
            });
        }

        if (this.customVizConfig.stackByImmediateChild) {
            this.enrichCubeForStackByImmediateChild(cube, chartConfig, defaultQueryKeyEntries, measureKeys);
        }

        if (this.customVizConfig.showSelected) {
            const selectedCK = [
                ...defaultQueryKeyEntries,
                ...measureKeys,
                new GroupByKey(this.breakdownLevels[defaultQueryKeyEntries.length])
            ];
            const dataSetsToJoin = [this.getCubeSelectedEnrichDataSet(cube, chartConfig, defaultQueryKeyEntries, measureKeys), cube.getSimilarIfPresent(createQK(selectedCK))];

            const filterIncludeKey = new FilterIncludeKey(chartConfig.stacked, ['Selected']);
            defaultQueryKeyEntries.push(filterIncludeKey);

            combineLatest(dataSetsToJoin).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
                cube.set(createQK([filterIncludeKey, ...selectedCK]), flatten(data).filter(dataItem => !isNil(dataItem)));
            });
        }
    }

    private enrichCubeForStackByImmediateChild(cube: SimpleCube<any>, chartConfig: BarChartConfig<any>, defaultQueryKeyEntries: QueryKeyEntry[], measureKeys: QueryKeyEntry[]) {
        const groupByKey = new GroupByKey(this.breakdownLevels[defaultQueryKeyEntries.length]);

        cube.getSimilarIfPresent(createQK([...defaultQueryKeyEntries, ...measureKeys, groupByKey])).pipe(
            filter(data => !isNil(data)),
            map((data: any[]) => data.map(dataItem => {
                let stackedIndex: number = this.breakdownLevels.indexOf(chartConfig.stacked);
                while (isNil(dataItem[this.breakdownLevels[stackedIndex]]) && stackedIndex < this.breakdownLevels.length) {
                    stackedIndex++;
                }
                dataItem[chartConfig.stacked] = dataItem[this.breakdownLevels[stackedIndex]];
                return dataItem;
            }))
        ).subscribe(data => cube.set(createQK([...defaultQueryKeyEntries, ...measureKeys, groupByKey]), data));
    }

    protected abstract getCubeSelectedEnrichDataSet(cube: SimpleCube<any>, chartConfig: BarChartConfig<any>, defaultQueryKeyEntries: QueryKeyEntry[], measureKeys: QueryKeyEntry[]): Observable<any[]>;

    /**
     * Update the y-axis title in drill up event, only when the drilldown level is zero.
     * This condition will have to be re-worked when Qbstr have a hook to handle the drillUp event.
     */
    showYAxisTitle(event: any): void {
        if (event.target.drilldownLevels?.length === 0) {
            // When the refresh button clicked at the chart level, this.qbstrOptions will be reset.
            // get the qbstrOptions object from this.qbstrOptions2
            const qbstrOptions: QbstrHighchartsOptions = this.qbstrOptions || this.qbstrOptions2;
            // get the primary y-axis title from qbstr and update the chart
            this.chart.yAxis[0].update({
                title: {
                    text: qbstrOptions.yAxis[0]?.title.text
                }
            });
            // get the secondary y-axis title from qbstr and update the chart
            this.chart.yAxis[1].update({
                title: {
                    text: qbstrOptions.yAxis[1]?.title.text
                }
            });
        }
    }

    /**
     * Enrich cube for PGS stacked bar chart
     * @param chartConfig
     * @param cube
     * @param defaultQueryKeyEntries
     * @param measureKeys
     * @param columnNames
     * @private
     */
    protected enrichCubeForPgsStackedBarChart(_chartConfig: BarChartConfig<any>, _cube: SimpleCube<any>, _defaultQueryKeyEntries: QueryKeyEntry[], _measureKeys: QueryKeyEntry[], _columnNames: Map<string, string>) {
        // Will be overridden by classes requiring this
        return;
    }

    /**
     * Assigns total value formatter if needed
     * @param context
     * @param chartOptions
     * @param widgetType
     * @protected
     */
    protected assignTotalFormatter(chartOptions: Options, widgetType: string, isDotEnabled?: boolean): void {
        const context = this;
        if (this.chartConfig.stacked && this.customVizConfig.showTotal && this._widgetPayload.widgetConfigType === widgetType) {
            chartOptions.yAxis[0]['stackLabels'] = {
                enabled: true,
                style: {
                    fontWeight: 'bold'
                },
                formatter() {
                    return context.totalLabelFormatter(this, isDotEnabled);
                }
            };
        }
    }
}
