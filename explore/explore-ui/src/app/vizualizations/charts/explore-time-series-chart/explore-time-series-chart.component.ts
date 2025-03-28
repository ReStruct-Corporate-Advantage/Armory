import {Component, OnChanges, SimpleChanges} from '@angular/core';
import {ChartWidgetInputConfigType, ColumnConstants, WidgetConfigType} from '@blk/explore-ui-core';
import {WidgetConstants} from '@constants/widget.constants';
import {TimeSeriesCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {
    AggregationKey,
    createQK,
    FilterIncludeKey,
    FilterKey,
    GroupByKey,
    QueryKeyEntry,
    QueryKeyEntryType
} from '@qbstr/data-cube';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {
    BarChartConfig,
    BarChartOptions,
    ChartMeasure,
    ChartType,
    EnrichingChartConfigType,
    LineChartConfig,
    LineChartOptions,
    QbstrHighchartsOptions,
    QbstrPoint,
    UnionChartConfig
} from '@qbstr/highcharts-api';
import {default as Highcharts, XAxisOptions, YAxisOptions} from 'highcharts';
import {cloneDeep, compact, filter as _filter, flatten, includes, isNil, merge, uniq} from 'lodash';
import {combineLatest, Observable} from 'rxjs';
import {filter, map, mergeAll, takeUntil} from 'rxjs/operators';
import {ExploreEnrichingChartDirective} from '../explore-enriching-chart.directive';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {CommonConstants} from '@constants/common.constants';
import {ChartUtils} from '@utils/chart.utils';
import {VizualizationColumnConfig} from '@interfaces/request.interface';
import {ColumnSeriesChartType} from '@enums/column-series-chart-type.enum';

/**
 * Explore time series chart handles explore specific parts of the initialization.
 * Handles types specific chart configuration
 */
@Component({
    selector: 'app-explore-time-series-chart',
    templateUrl: '../explore-chart.component.html',
    styleUrls: ['./explore-time-series-chart.component.scss', '../explore-chart.component.scss']
})
export class ExploreTimeSeriesChartComponent extends ExploreEnrichingChartDirective<LineChartConfig<any>, TimeSeriesCustomVizConfig> implements OnChanges {
    private leafNodeFilterKey: FilterIncludeKey<string>;

    // maps leaf level key of cube -> customVizConfig.seriesNameFieldOverride
    // (in the case of factor time series will map rfv_block_path -> rfv_ftitle/rfv_ftitle_long)
    nameOverrideMapping = new Map<string, string>();

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
        if (changes.widgetPayload.currentValue?.widgetSpecificData) {
            this._widgetPayload.widgetSpecificData = changes.widgetPayload.currentValue.widgetSpecificData;
        }
        if (changes.widgetPayload.currentValue?.customVizConfig) {
            this._widgetPayload.customVizConfig = changes.widgetPayload.currentValue.customVizConfig;
        }
    }

    protected initChartMeasures(cols: VizualizationColumnConfig[]): void {
        super.initChartMeasures(cols);

        // apply combo chart settings to measures if they exist, otherwise set chartType to widget default
        this.chartMeasures.forEach(measure => {
            const comboChartColumn = ChartUtils.getComboChartMeasureFromChartMeasure(measure, this.customVizConfig.comboChartColumns);
            ChartUtils.applyComboChartSettingsOrDefault(comboChartColumn, measure, this.widget.configType);

            // get the css class for line style, if N/A then it will be undefined
            measure.cssStyleClass = this.getComboChartLineStyleCss(comboChartColumn);
        });

        // old time series charts can have a custom chartType set in TimeSeriesSettings.chartType
        // when a user opens "Format" in widget settings, we clear timeSeriesSettings.chartType so it's no longer used
        const timeSeriesSettings = this.widget.getCombinedInputs().get(ChartWidgetInputConfigType.TIME_SERIES_CHART_SETTINGS) as TimeSeriesSettings;
        if (timeSeriesSettings?.chartType) {
            const chartType = timeSeriesSettings.chartType as ColumnSeriesChartType;
            this.chartMeasures.forEach(measure => measure.chartType = ColumnSeriesChartType.getHighchartChartType(chartType));
        }
    }

    createChartConfig(measures: ChartMeasure<any>[]): LineChartConfig<any> | BarChartConfig<any> {
        const dateMeasure = this.cols.find((col) => col.columnKey === ColumnConstants.DATE);
        const allMeasures: ChartMeasure<any>[] = cloneDeep(measures);

        if (this.breakdownLevels[this.breakdownLevels.length - 1] === this.defaultQueryKey[this.defaultQueryKey.length - 1].field && !ChartUtils.isPGSGraphingSpritelet(this.widget.configType)) {
            // when displaying time series chart at lowest level
            this.leafNodeFilterKey = this.defaultQueryKey.pop() as FilterIncludeKey<any>;
        }

        // ensure that one instance of date GroupBy is included
        const multiLevelBreakdown = uniq([WidgetConstants.DATE_GROUP_BY_LEVEL, ...this.breakdownLevels.slice(this.defaultQueryKey.length)]);
        // breakdowns will consist of all levels present, anything >2 is only used for enriching purposes
        // const breakdowns = dateMeasure ? [ColumnConstants.DATE] : multiLevelBreakdown; --> no longer used after qbstr upgrade
        // groupBy will only ever have a max of 2 values, where the first value is date and the second value is how the chart is broken down into each series
        let groupBy = [];
        if (!isNil(this.customVizConfig?.groupBys)) {
            groupBy = this.customVizConfig?.groupBys;
        } else {
            groupBy = dateMeasure ? [ColumnConstants.DATE] : multiLevelBreakdown.slice(0, 2);
        }
        // remove date GroupBy from default keys as it has already been used in groupBy
        if (this.widget.configType !== WidgetConfigType.PGS_TS) {
            this.defaultQueryKey = this.defaultQueryKey.filter(
                (key) => !(key.type === QueryKeyEntryType.GROUP_BY && key.field === WidgetConstants.DATE_GROUP_BY_LEVEL)
            );
        }
        const config: BarChartConfig<any> = {
            groupBy,
            drillDown: undefined,
            measures: this.enrichMeasureTitle(allMeasures),
            stacked: (this.includesBarMeasures(allMeasures) && groupBy.length > 1) ? groupBy[1] : undefined
        };

        return config;
    }

    createChartConfigForTotalLines(measures: ChartMeasure<any>[]): LineChartOptions<any> {
        return measures.length &&
        this.chartConfig?.groupBy?.length > 1 &&
        this.customVizConfig.showTotal
            ? {
                data: this.cube,
                defaultQueryKeyEntries: [...this.defaultQueryKey, new FilterIncludeKey(this.chartConfig.groupBy[1], ['Total'])],
                type: ChartType.LINE,
                chartConfig: {
                    seriesNameOverride: ((chartConfig: UnionChartConfig<any>, measure: ChartMeasure<any>) =>
                        measures.length > 1 ? `Total ${measure.title}` : 'Total') as any,
                    measures,
                    groupBy: ['level-1']
                }
            }
            : undefined;
    }

    /**
     * We need to create multiple chart configs for combo chart and another config for Total lines
     * @protected
     */
    protected getQbstrChartConfigs() {
        const configs = [];
        // create a config for all bar chart measures
        configs.push(this.createChartSpecificQbstrChartConfig(this.cube, this.chartConfig, this.chartOptions, this.defaultQueryKey, ChartType.COLUMN));
        // create a config for all line chart measures (not including total lines)
        configs.push(this.createChartSpecificQbstrChartConfig(this.cube, this.chartConfig, this.chartOptions, this.defaultQueryKey, ChartType.LINE));
        // create a config specifically for the total lines
        configs.push(this.createChartConfigForTotalLines(this.chartMeasures));
        // create a config specifically for the scatter chart measures
        configs.push(this.createChartSpecificQbstrChartConfig(this.cube, this.chartConfig, this.chartOptions, this.defaultQueryKey, ChartType.SCATTER));
        return configs.filter((c) => !!c);
    }

    createChartSpecificQbstrChartConfig(
        cube: SimpleCube<any>,
        chartConfig: LineChartConfig<any> | BarChartConfig<any>,
        chartOptions: QbstrHighchartsOptions,
        defaultQueryKey: QueryKeyEntry[],
        chartType?: ChartType.COLUMN | ChartType.LINE | ChartType.SCATTER
    ): LineChartOptions<any> | BarChartOptions<any> {
        const measures = chartConfig.measures.filter(measure => measure.chartType === chartType);

        // do not include the config if no measures of the specific chart type exist
        if (!measures.length) {
            return undefined;
        }

        const stacked = (chartType === ChartType.COLUMN && chartConfig.groupBy.length > 1) ? chartConfig.groupBy[1] : undefined;

        const widgetInputs = this.widget.dataStore.metaData.inputs;
        const settings = widgetInputs.get(TimeSeriesSettings.INPUT_CONFIG_NAME) as TimeSeriesSettings
            || this.customVizConfig;

        if (settings.showBaseline) {
            chartOptions = this.applyBaseline(chartType, chartOptions);
        }

        this.overrideStyleColumnColorScheme(chartConfig);

        const chartConfigForChartType = {
            ...chartConfig,
            stacked,
            measures
        };

        return {
            data: cube,
            type: chartType === ChartType.SCATTER ? ChartType.LINE : chartType,
            chartConfig: chartConfigForChartType,
            chartOptions,
            updateSeriesBeforeChartingFn: chartType === ChartType.SCATTER ? this.updateSeriesBeforeChartingForScatter : this.updateSeriesBeforeCharting,
            defaultQueryKeyEntries: defaultQueryKey,
            autoResizeDelay: -1
        };
    }
    public updateSeriesBeforeChartingForScatter = ({data}): any => {
        // set the chart type in chartMeasures to line for scatter chart
        this.chartMeasures.forEach(measure => measure.chartType === ChartType.SCATTER ? measure.chartType = ChartType.LINE : measure.chartType);

        data = this.updateSeriesBeforeCharting({data});
        // For marker chart we will have to apply the style to line chart so that it will show only marker
        // draw line chart with only markers
        return data.map(ds => ({
            ...ds,
            className: compact(['hidden-line-graph', 'hidden-line']).join(' ')
        }));
    }
    /**
     * Callback to pre-process chart series data before sending to highcharts to render
     */
    public updateSeriesBeforeCharting = ({data}): any => {
        ChartUtils.setZIndexForComboChart(data);
        // For time series multi-port comparison, we need to filter the data so that only relevant sectors show
        // Ex: Port A has sectors for Cash, Treasuries, & Corporates
        // Port B has sectors only for Cash & Treasuries
        // The cube will create a series for Port B Corporates even though data is all null
        // So we get all the sectors that apply to the given port across the entire time period and only keep those series
        if (this.requestConfig.isCompareMode && this._widgetPayload.widgetSpecificData.sectorsToShowForPort && this.includesLineMeasures(this.chartMeasures)) {
            return _filter(data, (sectorSeries) => {
                // Split the name. (Ex: 'PEP Notional Market Value % BND')
                const sectorSeriesName = sectorSeries.name.split(' ');
                const port = sectorSeriesName[0];
                const sector = sectorSeriesName[sectorSeriesName.length - 1];
                return includes(this._widgetPayload.widgetSpecificData.sectorsToShowForPort[port], sector);
            });
        }
        // ^ is unnecessary for the bar chart, as the additional series does not cause any issues.
        return data;
    }

    protected enrichCube(
        cube: SimpleCube<any>,
        chartConfig: EnrichingChartConfigType<any>,
        defaultQueryKeyEntries: QueryKeyEntry[]
    ) {
        // only when displaying from root level
        if (chartConfig.groupBy.length > 1 && defaultQueryKeyEntries.length <= 1) {
            // if we have only date specified (level-1) so we don't need to enrich
            const {
                groupBy: [level1, level2],
                measures
            } = chartConfig;

            const measureKeys = this.chartMeasures.map((measure) => new AggregationKey(measure.name, measure.aggMethod));
            const groupKeys = [new GroupByKey(level1), new GroupByKey(level2)];

            const cksForSet = cube.keys().filter((ck) => ck.groupKeys().find((gk) => gk.isEqual(groupKeys[1])));
            const keysToJoin: Observable<any>[] = cksForSet.map((ck) => cube.getSimilarIfPresent(ck));

            const totalCK = [...defaultQueryKeyEntries, ...measureKeys, new GroupByKey(level1)];

            if (this.customVizConfig?.showTotal) {
                // add new entry to the cube for total lines
                cube.get(createQK(totalCK))
                    .pipe(
                        filter((v) => !!v),
                        map((totalRows: any[]) =>
                            totalRows.map((row) => ({
                                ...row,
                                [chartConfig.stacked]: 'Total'
                            }))
                        )
                    )
                    .subscribe((data) => {
                        cube.set(createQK([new FilterIncludeKey(level2, ['Total']), ...totalCK]), data);
                    });
            }
            // must override x-axis to group identical dates together
            cube.get(createQK(totalCK)).subscribe((data) => {
                if (data) {
                    chartConfig.xAxisOverride = () => data.map((row) => row[level1]);
                }
            });

            combineLatest(keysToJoin)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((dataSets) => {
                    const chartCk = createQK([...defaultQueryKeyEntries, ...groupKeys, ...measureKeys]);
                    cube.set(chartCk, flatten(dataSets));
                });
        } else if (chartConfig.groupBy.length > 1 && defaultQueryKeyEntries.length > 1 && this.customVizConfig?.showTotal) {
            this.enrichSectorLevelTotal(cube, chartConfig, defaultQueryKeyEntries);
        }
    }

    /**
     * Enriches total line for charts launched from sector group (below level-1 date)
     */
    private enrichSectorLevelTotal(
        cube: SimpleCube<any>,
        chartConfig: EnrichingChartConfigType<any>,
        defaultQueryKeyEntries: QueryKeyEntry[]
    ): void {
        // final key in defaultQueryKeyEntries is the level on which we should aggregate
        const totalDefaultGroupOnKey = defaultQueryKeyEntries[defaultQueryKeyEntries.length - 1] as FilterIncludeKey<string>;
        const totalGroupByKey = new GroupByKey(totalDefaultGroupOnKey.field);

        const measureKeys = this.chartMeasures.map((measure) => new AggregationKey(measure.name, measure.aggMethod));

        // level-1 is date, chartGroupOnLevel is what level the chart is broken down on
        const [level1, chartGroupOnLevel] = chartConfig.groupBy.map((measureKey) => new GroupByKey(measureKey));

        const totalCK = [...defaultQueryKeyEntries, ...measureKeys, level1];

        const cksForTotal = cube
            .keys()
            .filter(
                (ck) =>
                    ck
                        .filterKeys()
                        .find((fk) => fk.isEqual(defaultQueryKeyEntries[defaultQueryKeyEntries.length - 2] as FilterIncludeKey<string>)) &&
                    ck.groupKeys().find((gk) => gk.isEqual(totalGroupByKey))
            );
        const totalData: Observable<any>[] = cksForTotal.map((ck) =>
            cube.get(ck).pipe(
                mergeAll(),
                filter((row) => row[totalDefaultGroupOnKey.field] === totalDefaultGroupOnKey.includes[0]),
                map((r) => ({...r, [chartGroupOnLevel.field]: 'Total'}))
            )
        );

        // add new entry to the cube for total lines
        combineLatest(totalData)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                cube.set(createQK([new FilterIncludeKey(chartConfig.stacked, ['Total']), ...totalCK]), data);
            });
    }

    /**
     * create the ChartOptions for time series chart
     */
    createChartOptions(chartConfig: LineChartConfig<any>): Highcharts.Options {
        const context = this;
        const config = super.createChartOptions();

        const chartOptions = merge({}, config, {
            plotOptions: {
                column: {
                    stacking: chartConfig.groupBy.length > 1 ? 'normal' : null
                },
                line: {
                    marker: {
                        enabled: context.customVizConfig.showDataMarker
                    }
                },
                series: {
                    marker: {
                        enabled: null // set to null to enable threshold-based marker visibility
                    },
                    turboThreshold: 0,
                    dataLabels: {
                        padding: 0
                    },
                    tooltip: {
                        headerFormat: '',
                        pointFormatter() {
                            return context.tooltipPointFormatter(this);
                        }
                    }
                }
            },
            xAxis: this.getXAxisData(this),
            yAxis: this.createYAxisOptionsList(chartConfig),
            legend: {
                labelFormatter() {
                    return context.overrideSeriesName(this);
                }
            }
        });

        // In highcharts - `gridLineWidth` and `tickWidth` are properties to manage the size of gridlines and tickMarks.
        // These properties are available in both xAxis and yAxis, and they can be configured independently.
        // (reference: https://www.highcharts.com/docs/chart-concepts/axes)
        //
        // In Explore, we control the `gridLineWidth` using the `showGridLines` property (GridLines).
        // However, despite configuring this property exclusively for the `xAxis` (as seen in ExploreChartComponent at line 441),
        // it unexpectedly affects the `yAxis` as well.
        // And the configuration (gridLineWidth and tickWidth) on the `yAxis` (for both primary and secondary) doesn't work.
        // It will require some deeper investigation to determine why the configuration on the `yAxis` is not behaving as expected.
        //
        // As part of primary/secondary axis bound/interval work, we had to take the full control on bound/interval from highcharts (tick options).
        // As a result, the yAxis gridlines do not align with aesthetic standards, as Highcharts no longer automatically adjusts them for us.
        // After discussion with Deb, we decided to hide the gridLine for xAxis and primaryYAxis (because secondaryYAxis gridLine is not controllable).
        if (this.hasSecondaryAxisColumn() && this.hasAxisOverridden() && this.cols.length > 1) {
            (chartOptions.xAxis as XAxisOptions).gridLineWidth = 0;
            (chartOptions.xAxis as XAxisOptions).tickWidth = 1;
        }

        return chartOptions;
    }

    protected createYAxisOptionsList(chartConfig: LineChartConfig<any>): YAxisOptions[] {
        const primaryAxisCols = this.chartMeasures.filter(measure => measure.axis !== 1);
        const secondaryAxisCols = this.chartMeasures.filter(measure => measure.axis === 1);
        return super.createYAxisOptionsList(chartConfig, this.getDefaultAxisTitle(primaryAxisCols), this.getDefaultAxisTitle(secondaryAxisCols));
    }

    /**
     * format the points on time series chart
     */
    tooltipPointFormatter(point): any {
        const qbstr = (point as QbstrPoint)?.qbstr;
        const formatter = this.colsMap[qbstr?.measureName]?.formatter;
        const columnMeasure = this.colsMap[qbstr?.measureName]?.columnTitle || this.firstCol.columnTitle;
        const formattedValue = this.formatValue(point.y, formatter);
        const seriesName = this.overrideSeriesName(point.series);
        const category = this.chartConfig.groupBy.length > 1 || this.includesLineMeasures(this.chartMeasures) ? point.category : point.name;
        if (this.includesBarMeasures(this.chartMeasures) && this.requestConfig.portfolio === CommonConstants.COMPARE && qbstr?.stack) {
            return `
                <div style='z-index:999; background-color: var(--input-box__background-color--disabled); padding: 8px;'>
                    <span style='font-weight: bold'>${qbstr.stackName}</span><br/>
                    <span style='font-weight: bold'>${columnMeasure}</span><br/>
                    <span style='font-weight: bold'>Date:</span> ${category}<br/>
                    <span style='font-weight: bold'>${seriesName}:</span>${formattedValue}
                <div>`;
        } else {
            return `
                <div style='z-index:999; background-color: var(--input-box__background-color--disabled); padding: 8px;'>
                    <span style='font-weight: bold'>${columnMeasure}</span><br/>
                    <span style='font-weight: bold'>Date:</span> ${category}<br/>
                    <span style='font-weight: bold'>${seriesName}:</span> ${formattedValue}
                <div>`;
        }
    }

    /**
     * Adds additional enriching to the cube for showing leaf level data
     */
    protected enrichLeafLevel(
        cube: SimpleCube<any>,
        chartConfig: LineChartConfig<any>,
        defaultQueryKeyEntries: QueryKeyEntry[]
    ): void {
        const measureAggKeys = this.chartMeasures.map((measure) => new AggregationKey(measure.name, measure.aggMethod));

        const dateGroupByKey = new GroupByKey(WidgetConstants.DATE_GROUP_BY_LEVEL);
        // qbstr chart will display/group based on chartConfig.breakdowns index 0, 1
        const leafLevelGroupByKey = new GroupByKey(chartConfig.groupBy[1]);

        const cksForSet = cube.keys().filter((ck) => {
            // (defaultQueryKeyEntries.length + 1) to account for additional date level filter key
            return (
                ck.filterKeys().length === defaultQueryKeyEntries.length + 1 &&
                ck.filterKeys().find((fk) => fk.isEqual(defaultQueryKeyEntries[defaultQueryKeyEntries.length - 1] as FilterKey<any>))
            );
        });

        const keysToJoin: Observable<any>[] = cksForSet.map((ck) => cube.getSimilarIfPresent(ck));
        combineLatest(keysToJoin)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((dataSets) => {
                const flattenedData = flatten(dataSets);
                // when using a multi-level breakdown and sector does not have all levels, must enrich
                const enrichedData = flattenedData
                    .filter((data) => {
                        // when launching on a leaf node -- same as launching from a factor group one level up, only difference is we must filter to only include the rows matching the name of the leaf node
                        if (this.leafNodeFilterKey) {
                            return data[this.leafNodeFilterKey.field] === this.leafNodeFilterKey.includes[0];
                        }
                        return true;
                    })
                    .map((d) => ({
                        ...d,
                        // [leafLevelGroupByKey.field]: d[chartConfig.breakdowns[chartConfig.breakdowns.length - 1]], --> no longer used after qbstr upgrade
                        // this handles case where there is a multi-level breakdown and you are launching at a level where the children are a mix of factor groups and individual factors (leaf level) -> sets 'level-x' to leaf_level value (ie rfv_ftitle)
                        [leafLevelGroupByKey.field]: d[this.breakdownLevels[this.breakdownLevels.length - 1]]
                    }));

                // map the leaf level field to seriesNameFieldOverride field
                if (this.customVizConfig.seriesNameFieldOverride) {
                    enrichedData.forEach(d => this.nameOverrideMapping.set(d[leafLevelGroupByKey.field], d[this.customVizConfig.seriesNameFieldOverride]));
                }

                const enrichedCK = createQK([...defaultQueryKeyEntries, dateGroupByKey, leafLevelGroupByKey, ...measureAggKeys]);
                cube.set(enrichedCK, enrichedData);
                this.enrichKeys.push(enrichedCK);
            });
    }

    /**
     * Overrides the name for each data series in the chart
     * When displaying factor time series we must override the series name as it will default to the field that the leaf level is grouped by within the cube (rfv_block_path for factor TS)
     */
    private overrideSeriesName(series): string {
        if (!this.customVizConfig.seriesNameFieldOverride) {
            return series.name;
        }
        return this.nameOverrideMapping.get(series.name) || series.name;
    }

    protected isDefaultBreadcrumbsSupported(): boolean {
        return true;
    }

    /**
     * Returns if there are any bar measures in the chart
     * @param measures  All chart measures
     */
    private includesBarMeasures(measures: ChartMeasure<any>[]): boolean {
        return measures.some(measure => (measure.chartType as ChartType) === ChartType.COLUMN);
    }

    /**
     * Returns if there are any line measures in the chart
     * @param measures  All chart measures
     */
    private includesLineMeasures(measures: ChartMeasure<any>[]): boolean {
        return measures.some(measure => measure.chartType === ChartType.LINE);
    }
}
