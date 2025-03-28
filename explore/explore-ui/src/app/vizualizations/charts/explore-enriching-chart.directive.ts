import {Directive} from '@angular/core';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {CommonConstants} from '@constants/common.constants';
import {DefaultCustomVizConfig, SecondaryYAxis, YAxisOverridable} from '@interfaces/custom-viz-config.interface';
import {AggregationKey, createQK, FilterIncludeKey, GroupByKey, QueryKey, QueryKeyEntry} from '@qbstr/data-cube';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {
    BarChartConfig,
    ChartMeasure,
    ChartType,
    EnrichingChartConfigType,
    HasColorMeasure,
    LineChartConfig,
    QbstrHighchartsOptions,
    UnionChartConfig,
    UnionChartOptions
} from '@qbstr/highcharts-api';
import {ROOT_LEVEL} from '@utils/qbstr';
import {flatten, groupBy, isEmpty, isNil, isUndefined, join, merge, reverse, uniqBy} from 'lodash';
import {combineLatest, Observable} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {ExploreChartComponent} from './explore-chart.component';
import {ChartUtils} from '@utils/chart.utils';
import {
    ExploreExpostTimeSeriesChartComponent
} from './explore-expost-time-series-chart/explore-expost-time-series-chart.component';
import {ExploreTimeSeriesChartComponent} from './explore-time-series-chart/explore-time-series-chart.component';
import {YAxisOptions} from 'highcharts';

/**
 * This is a constant to provide a new name for the split column key name that the columns are grouped bys in the case of KRD P/B/A.
 */
export const SPLIT_KEY_COLUMN = '_splitKey';

@Directive()
export abstract class ExploreEnrichingChartDirective<T extends UnionChartConfig<any> & HasColorMeasure<any>, C extends DefaultCustomVizConfig> extends ExploreChartComponent<T, C> {

    enrichKeys: QueryKey[] = [];

    isSplitColumnKey(measures: ChartMeasure<any>[]): boolean {
        return !measures.every(measure => !this.colsMap[measure.name].splitColumnHeaderName);
    }

    /**
     * Clear rge enrich keys when widgetPayload is set - This is needed for compare to functionality where different compare tabs use the same instance of cube
     */
    public clear() {
        this.enrichKeys.forEach((queryKey: QueryKey) => {
            this.cube.delete(queryKey);
        });
        this.enrichKeys = [];
    }

    /**
     * Create chart state
     */
    public createQbstrChartConfig(): UnionChartOptions<any>[] {
        const qbstrChartConfigs = super.createQbstrChartConfig();
        const [qbstrChartConfig] = qbstrChartConfigs;

        this.enrichCube(qbstrChartConfig.data as SimpleCube<any>, qbstrChartConfig.chartConfig as EnrichingChartConfigType<any>, qbstrChartConfig.defaultQueryKeyEntries);
        return qbstrChartConfigs;
    }

    /**
     * Add emphasis to baseline for chart.
     * Used in timeseries and bar/column charts.
     */
    protected applyBaseline(type: ChartType, chartOptions: QbstrHighchartsOptions): QbstrHighchartsOptions {
        const plotLinesOptions = {
            plotLines: [{
                value: 0,
                zIndex: 2 // above grid lines, below plot lines
            }]
        };

        const axis = type === ChartType.BAR ? 'xAxis' : 'yAxis';

        const origOption = chartOptions[axis];

        chartOptions = merge({
            [axis]: Array.isArray(origOption)
                // Depending on various settings, axis length can be 1 or 2
                // make sure we only populate the last index to merge with the correct axis
                ? origOption.length === 1 ? [plotLinesOptions] : [, plotLinesOptions]
                : plotLinesOptions
        }, chartOptions);

        return chartOptions;
    }

    /**
     * The data that is needed for a chart is equivalent to a multi groupBy statement.
     * used in Treemap and Sunburst chart
     *
     * @example
     *  breakdown -> sector_1, sector_2, sector_3 / measure -> pct_mv_1
     */
    protected enrichCube(cube: SimpleCube<any>, chartConfig: EnrichingChartConfigType<any>, defaultQueryKeyEntries: QueryKeyEntry[]) {
        const measures: ChartMeasure<any>[] = chartConfig.measures;
        const measureKeys = measures.map(measure => new AggregationKey(measure.name, measure.aggMethod));

        this.enrichLevels(cube, defaultQueryKeyEntries, measureKeys, this.chartConfig.groupBy);

        const topLevelCk = createQK([new GroupByKey(ROOT_LEVEL), measureKeys[0]]);
        this.cube.getSimilarIfPresent(topLevelCk).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
            const key = createQK([measureKeys[0]]);
            this.enrichKeys.push(key);
            this.cube.set(key, data);
        });
    }

    /**
     * Enrich levels
     */
    protected enrichLevels(cube, defaultQueryKeyEntries, measureKeys, breakdownLevels: string[] = []) {
        breakdownLevels.forEach((breakdownLevel, i) => {
            const groupKey = new GroupByKey(breakdownLevel);
            const cksForSet = cube.keys().filter(ck => ck.groupKeys().find(gk => gk.isEqual(groupKey)));

            const keysToJoin: Observable<any>[] = cksForSet.map(ck => cube.getSimilarIfPresent(ck));
            combineLatest(keysToJoin).pipe(takeUntil(this.ngUnsubscribe)).subscribe(dataSets => {
                const groupByKeys = breakdownLevels.slice(0, i + 1).map(bdl => new GroupByKey(bdl));
                const sunburstCK = createQK(!isEmpty(measureKeys)
                    ? [...defaultQueryKeyEntries, ...groupByKeys, measureKeys[0]]
                    : [...defaultQueryKeyEntries, ...groupByKeys]);
                cube.set(sunburstCK, flatten(dataSets));
                this.enrichKeys.push(sunburstCK);
            });
        });
    }

    protected enrichSplitColumnKeys(cube: SimpleCube<any>, chartConfig: EnrichingChartConfigType<any>, defaultQueryKeyEntries: QueryKeyEntry[], combineSplitKeysData?: boolean) {
        const measures: ChartMeasure<any>[] = chartConfig.measures;
        const measureKeys = measures.map(measure => new AggregationKey(measure.name, measure.aggMethod));
        const ckes = [...defaultQueryKeyEntries, ...chartConfig.groupBy.map(bd => new GroupByKey(bd)), ...measureKeys];
        const ck = createQK(ckes);
        const isBarChartCompareMode = this._widgetPayload.widgetConfigType === WidgetConfigType.BAR && this.requestConfig.portfolio === CommonConstants.COMPARE;
        const newMeasures = this.getNewMeasures(measures, isBarChartCompareMode);

        chartConfig.groupBy.unshift(SPLIT_KEY_COLUMN);
        if (isUndefined(chartConfig.groupBy.find(measure => measure === SPLIT_KEY_COLUMN))) {
            chartConfig.groupBy.unshift(SPLIT_KEY_COLUMN);
        }
        if (chartConfig.colorMeasure) {
            const [chartMeasure, colorMeasure] = newMeasures;
            chartConfig.measures = [chartMeasure];
            chartConfig.colorMeasure = colorMeasure;
        } else {
            chartConfig.measures = newMeasures;
        }

        cube.get(ck).pipe(map((data: any[]) => {
                return this.getFlatDataForSplitColumnKeys(data, measures, undefined, isBarChartCompareMode);
            }),
            map((data: any[]) => {
                let updatedData = data;
                if (combineSplitKeysData) {
                    updatedData = Object.values(groupBy(data, SPLIT_KEY_COLUMN)).map((rows: any[]) => {
                        let obj = {};
                        rows.forEach(row => obj = {...obj, ...row});
                        return obj;
                    });
                }
                return updatedData;
            })).subscribe((data: any[]) => {
            cube.set(createQK([...defaultQueryKeyEntries, ...chartConfig.groupBy.map(bd => new GroupByKey(bd)), ...newMeasures.map(measure => new AggregationKey(measure.name, measure.aggMethod))]), data);
        });

        // further enrich the cube in case only stack breakdown applied with show total enabled
        // for Bar chart with KRD columns
        if (this.customVizConfig['showTotal'] && (this._widgetPayload.widgetConfigType === WidgetConfigType.BAR || this._widgetPayload.widgetConfigType === WidgetConfigType.PRA)) {
            const ckesNew = [new GroupByKey(ROOT_LEVEL), ...measureKeys];
            cube.get(createQK(ckesNew)).pipe(map((data: any[]) => {
                return this.getFlatDataForSplitColumnKeys(data, measures, 'Total');
            })).subscribe((data: any[]) => {
                cube.set(createQK([...defaultQueryKeyEntries, new GroupByKey(chartConfig.groupBy[0]),
                    new FilterIncludeKey(this.chartConfig.groupBy[0], ['Total']),
                    ...newMeasures.map(measure => new AggregationKey(measure.name, measure.aggMethod))]), data);
            });
        }
    }

    /**
     * returns the flat data for SplitColumnKeys
     */
    getFlatDataForSplitColumnKeys(data: any, measures: ChartMeasure<any>[], level1?: string, isComparisonMode?: boolean) {
        return flatten(data.map(row => {
            return measures.map(measure => {
                const measureSplitKeys = measure.name.split('|');
                const splitKey = measureSplitKeys.length === 1
                    ? measure.title
                    : isComparisonMode
                        ? measureSplitKeys.splice(measureSplitKeys.length - 2, 1)
                        : measureSplitKeys.splice(measureSplitKeys.length - 1, 1);

                const flatData = {
                    [join(measureSplitKeys, '|')]: row[measure.name],
                    [SPLIT_KEY_COLUMN]: splitKey.toString(),
                    ['level-1']: level1 ? level1 : row['level-1'],
                    [ROOT_LEVEL]: row[ROOT_LEVEL]
                };
                // In compare mode without Date override, the column title needs to be passed.
                if (isComparisonMode && measureSplitKeys.length < 2) {
                    flatData.title = this.colsMap[measure.name].splitColumnHeaderName;
                    flatData[SPLIT_KEY_COLUMN] = this.colsMap[measure.name].splitColumnHeaderName;
                }
                return flatData;
            });
        }));
    }

    /**
     * get the unique measures to be used
     */
    private getNewMeasures(measures: ChartMeasure<any>[], isComparisonMode?: boolean) {
        return uniqBy(measures.map(measure => {
            const measureNameSplitKeys = measure.name.split('|');
            // find the original length of measureNameSplitKeys to be used later
            // to find the correct column title in case of comparison mode stacked bar chart
            const originalMeasuresLength = measureNameSplitKeys.length;
            if (measureNameSplitKeys.length === 1) {
                return {
                    name: measure.name,
                    aggMethod: 'sum',
                    title: measure.title
                };
            }
            const splitKeyIndex = isComparisonMode ? 2 : 1;
            measureNameSplitKeys.splice(measureNameSplitKeys.length - splitKeyIndex, 1);
            const newColName = join(measureNameSplitKeys, '|');
            if (measureNameSplitKeys.length > 1 || (measureNameSplitKeys.length === 1 && !isComparisonMode)) {
                measureNameSplitKeys.splice(0, 1);
            }
            // if comparisonMode is true and originalMeasuresLength is 2 (market_123|H2) then don't append measure name
            const newColTitle = isComparisonMode && originalMeasuresLength === 2 ? join(reverse(measureNameSplitKeys), ' ') : join([...reverse(measureNameSplitKeys), this.colsMap[measure.name].splitColumnHeaderName], ' ');
            this.colsMap[newColName] = this.colsMap[measure.name];
            this.colsMap[newColName].columnKey = newColName;
            return {
                name: newColName,
                aggMethod: 'sum',
                title: newColTitle
            };
        }), 'name');
    }

    /**
     * enrich cube for expost / factor data time series chart
     */
    protected enrichDataForFactorDataAndExpostTimeSeries(cube: SimpleCube<any>, chartConfig: EnrichingChartConfigType<any>, defaultQueryKeyEntries: QueryKeyEntry[]): void {
        cube.get(createQK([...defaultQueryKeyEntries])).subscribe(data => {
            cube.set(createQK([...defaultQueryKeyEntries, ...chartConfig.measures.map(measure => new AggregationKey(measure.name, measure.aggMethod)), ...chartConfig.groupBy.map(groupName => new GroupByKey(groupName))]), data);
        });
    }

    /**
     * should enrich the measure title if split keys are present
     */
    protected enrichMeasureTitle(measures: ChartMeasure<any>[]): ChartMeasure<any>[] {
        measures.forEach((measure) => {
            this.enrichTitle(measure);
        });
        return measures;
    }

    /**
     * enrich the measure title if the measure has split keys
     */
    protected enrichTitle(measure: ChartMeasure<any>): ChartMeasure<any> {
        if (measure.name.indexOf(CommonConstants.COLUMN_KEY_SPLITTER) === -1) {
            return measure;
        }
        let splitKeys = measure.name.split(CommonConstants.COLUMN_KEY_SPLITTER).slice(1);

        const splitColumnHeaderName = this.colsMap[measure.name]?.splitColumnHeaderName || this.colsMap[measure.name]?.columnTitle;
        if (splitColumnHeaderName) {
            splitKeys = [splitColumnHeaderName, ...splitKeys];
        }
        measure.title = join(reverse(splitKeys), ' ');
        return measure;
    }

    protected getDefaultAxisTitle(measures: ChartMeasure<any>[]): string {
        if (measures.length < 1) {
            return CommonConstants.EMPTY_STRING;
        } else if (measures.length > 1) {
            if (this.checkIfScaleIsSupported(measures[0]) && measures.every(measure => this.colsMap[measure.name].scale === this.colsMap[measures[0].name].scale)) {
                return this.colsMap[measures[0].name].scale;
            } else {
                return CommonConstants.EMPTY_STRING;
            }
        } else {
             return this.getMeasureTitle(measures[0]) + (this.checkIfScaleIsSupported(measures[0]) ? this.getShortFormOfScale(this.colsMap[measures[0].name].scale) : CommonConstants.EMPTY_STRING);
        }
    }

    protected getMeasureTitle(chartMeasure: ChartMeasure<any>) {
        return this.enrichTitle(chartMeasure).title;
    }

    /**
     * get the short form of scale for example Thousands (m) to (m)
     */
    protected getShortFormOfScale(scale: string): string {
        return scale.split(' ').pop();
    }

    private checkIfScaleIsSupported(measure: ChartMeasure<any>): boolean {
        return this.colsMap?.[measure.name]?.scale && this.colsMap[measure.name].scale !== 'None';
    }

    protected getXAxisData(context: ExploreExpostTimeSeriesChartComponent | ExploreTimeSeriesChartComponent): any {
        return {
            endOnTick: false,
            labels: {
                formatter() {
                    return ChartUtils.xAxisDateLabelFormatter(this.value, context.customVizConfig.dateFormat);
                }
            }
        };
    }

    /**
     * Create Y Axis options list for highcharts options
     */
    protected createYAxisOptionsList(_chartConfig: BarChartConfig<any> | LineChartConfig<any>, defaultPrimaryAxisTitle?: string, defaultSecondaryAxisTitle?: string): YAxisOptions[] {
        const {
            hidePrimaryYAxisTitle,
            primaryYAxisOverride,
            hideSecondaryYAxisTitle,
            secondaryYAxisOverride,
        } = this.customVizConfig as YAxisOverridable;

        const primaryYAxisTitle = this.createYAxisTitle(hidePrimaryYAxisTitle, primaryYAxisOverride, defaultPrimaryAxisTitle);
        const yAxisOptions: YAxisOptions[] = [this.createYAxisOptions(primaryYAxisTitle, false)];

        // if any of secondary option is set, add the secondary options
        if (this.hasSecondaryAxisColumn() || this.hasSecondaryAxisPropertyOverridden()) {
            const secondaryYAxisTitle = this.createYAxisTitle(hideSecondaryYAxisTitle, secondaryYAxisOverride, defaultSecondaryAxisTitle);
            yAxisOptions.push(this.createYAxisOptions(secondaryYAxisTitle, true));
        }
        return yAxisOptions;
    }

    private hasSecondaryAxisPropertyOverridden(): boolean {
        const {
            hideSecondaryYAxisTitle,
            secondaryYAxisOverride,
            secondaryYLowerBound,
            secondaryYUpperBound,
            secondaryYInterval,
            secondaryYAxis
        } = this.customVizConfig as YAxisOverridable & SecondaryYAxis;
        return hideSecondaryYAxisTitle || !isEmpty(secondaryYAxisOverride) || !isNil(secondaryYLowerBound) || !isNil(secondaryYUpperBound) || !isNil(secondaryYInterval) || !isEmpty(secondaryYAxis);
    }

    private createYAxisOptions(columnTitle: string, isSecondary?: boolean): YAxisOptions {
        const {
            primaryYLowerBound,
            primaryYUpperBound,
            primaryYInterval,
            secondaryYLowerBound,
            secondaryYUpperBound,
            secondaryYInterval
        } = this.customVizConfig as YAxisOverridable;
        const hasAxisOverridden = this.hasAxisOverridden();
        return {
            opposite: isSecondary,
            labels: {
                formatter: this.createFormatter(isSecondary)
            },
            startOnTick: !hasAxisOverridden,
            endOnTick: !hasAxisOverridden,
            alignTicks: !hasAxisOverridden,
            showLastLabel: true,
            title: {text: columnTitle},
            min: isSecondary ? secondaryYLowerBound : primaryYLowerBound,
            max: isSecondary ? secondaryYUpperBound : primaryYUpperBound,
            tickInterval: isSecondary ? secondaryYInterval : primaryYInterval,
        };
    }

    /**
     * Check if user customized the axis (excluding the title)
     * If then, we need to take the tick control from highcharts (otherwise we let highcharts keep the control)
     */
    protected hasAxisOverridden(): boolean {
        const {
            primaryYLowerBound,
            primaryYUpperBound,
            primaryYInterval,
            secondaryYLowerBound,
            secondaryYUpperBound,
            secondaryYInterval
        } = this.customVizConfig as YAxisOverridable;
        return !isNil(primaryYLowerBound) || !isNil(primaryYUpperBound) || !isNil(primaryYInterval) || !isNil(secondaryYLowerBound) || !isNil(secondaryYUpperBound) || !isNil(secondaryYInterval);
    }


    private createYAxisTitle(hide: boolean, overriddenTitle: string, defaultTitle?: string): string {
        return hide ? '' : (isEmpty(overriddenTitle) ? defaultTitle : overriddenTitle);
    }

    protected hasSecondaryAxisColumn(): boolean {
        return this.chartMeasures.some(measure => measure.axis === 1);
    }
}
