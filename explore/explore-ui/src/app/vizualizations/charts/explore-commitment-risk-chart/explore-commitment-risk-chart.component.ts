import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AuxTabBarItemInterface} from '@blk/aladdin-angular-components';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {
    AreaRangeChartConfig,
    AreaRangeChartOptions,
    ChartMeasure,
    ChartType,
    EnrichingChartConfigType
} from '@qbstr/highcharts-api';
import {
    AxisLabelsFormatterContextObject,
    LegendOptions,
    Options,
    PlotOptions,
    TooltipOptions,
    XAxisOptions,
    YAxisOptions
} from 'highcharts';
import {NumericDataFormatter} from '@blk/explore-ui-column-option';
import {WidgetDisplayInputConfigType} from '@blk/explore-ui-core';
import {
    CommitmentRiskLegendSettings
} from '@models/widget/inputs/chart-settings/commitment-risk-legend-settings.model';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {AggregationKey, createQK, FilterIncludeKey, GroupByKey, QueryKeyEntry} from '@qbstr/data-cube';
import {DefaultCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {LongPercentile, Percentile, PercentileRange, SHORT_PERCENTILE_SUFFIX} from '@enums/commitment-risk-percentiles.enum';
import {ExploreEnrichingChartDirective} from '../explore-enriching-chart.directive';
import {combineLatest, Observable} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {flatten} from 'lodash';

@Component({
    selector: 'explore-commitment-risk-chart',
    templateUrl: './explore-commitment-risk-chart.component.html',
    styleUrls: ['./explore-commitment-risk-chart.component.scss']
})
export class ExploreCommitmentRiskChartComponent extends ExploreEnrichingChartDirective<AreaRangeChartConfig<any>, DefaultCustomVizConfig> implements OnChanges {
    @Input() columnToDisplay: AuxTabBarItemInterface;

    private readonly DARK_BLUE = '#3BADF8';
    private readonly LIGHT_BLUE = '#9BD5FC';
    private readonly YELLOW = '#F8E71C';

    private readonly BASE = 'Base';

    private readonly baseTooltipSeriesMap = {
        [PercentileRange.P10P25]: [Percentile.P10, this.LIGHT_BLUE],
        [PercentileRange.P25P50]: [Percentile.P25, this.DARK_BLUE],
        [PercentileRange.P50P75]: [Percentile.P75, this.DARK_BLUE],
        [PercentileRange.P75P90]: [Percentile.P90, this.LIGHT_BLUE]
    };

    private scenarioChartMeasures: ChartMeasure<any>[];
    widgetSpecificData: {seriesTitles: string[], timeInterval: number, scenario: string};
    private formatter: NumericDataFormatter;
    legendSettings: CommitmentRiskLegendSettings;

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
    }

    /**
     * Set internal state
     */
    protected setInternalState(widgetPayload: WidgetPayload) {
        this.widgetSpecificData = widgetPayload.widgetSpecificData;
        this.legendSettings = this.widget.getCombinedInputs().get(WidgetDisplayInputConfigType.COMMITMENT_RISK_LEGEND_SETTINGS) as CommitmentRiskLegendSettings;

        const column = widgetPayload.requestConfig.columns.find(col => col.columnTag === this.columnToDisplay.uid);
        this.formatter = new NumericDataFormatter((column.formatter as NumericDataFormatter).columnFormat, []);

        super.setInternalState(widgetPayload);

        // hide default HC legend if in scenario mode
        if (this.widgetSpecificData.scenario) {
            this.chartToggles.legendToggleBtnDisplay = false;
            this.chartToggles.labelToggleBtnDisplay = false;
            this.chartToggles.legend = false;
        }
    }

    /**
     * Create chart config
     */
    createChartConfig(measures: ChartMeasure<any>[]): AreaRangeChartConfig<any> {
        return {
            measures,
            groupBy: ['level-1', 'level-2'],
            midline: LongPercentile.P50,
            showMidlineInLegend: !this.widgetSpecificData.scenario,
            areaRanges: this.getAreaRangeConfig(),
            knownColors: {
                series: this.getKnownColorsConfig()
            }
        };
    }

    /**
     * Get scenario areaRange chart config
     */
    private getAreaRangeConfig(): string[][] {
        if (!this.widgetSpecificData.scenario) {
            return [
                [LongPercentile.P10, LongPercentile.P25],
                [LongPercentile.P25, LongPercentile.P50],
                [LongPercentile.P50, LongPercentile.P75],
                [LongPercentile.P75, LongPercentile.P90]
            ];
        }
        return this.legendSettings.percentileRange === PercentileRange.P10P90
            ? [[LongPercentile.P10, LongPercentile.P90]] : [[LongPercentile.P25, LongPercentile.P75]];
    }

    /**
     * Get scenario knownColors chart config
     */
    private getKnownColorsConfig(): any {
        const CSS_CLASS_LIGHT_BLUE = 'light-blue';
        const CSS_CLASS_DARK_BLUE = 'dark-blue';
        const CSS_CLASS_SCENARIO_DARK_BLUE = 'scenario-dark-blue';
        const CSS_CLASS_YELLOW = 'yellow';
        const CSS_CLASS_BASE_MIDLINE = 'midline';
        const CSS_CLASS_SCENARIO_MIDLINE = 'scenario-midline';

        if (!this.widgetSpecificData.scenario) {
            return {
                [LongPercentile.P10 + '-' + LongPercentile.P25]: CSS_CLASS_LIGHT_BLUE,
                [LongPercentile.P25 + '-' + LongPercentile.P50]: CSS_CLASS_DARK_BLUE,
                [LongPercentile.P50]: CSS_CLASS_BASE_MIDLINE,
                [LongPercentile.P50 + '-' + LongPercentile.P75]: CSS_CLASS_DARK_BLUE,
                [LongPercentile.P75 + '-' + LongPercentile.P90]: CSS_CLASS_LIGHT_BLUE
            };
        }

        if (this.legendSettings.showBaseScenario && this.legendSettings.showStressScenario) {
            return {
                [LongPercentile.P10 + '-' + LongPercentile.P90 + '|' + this.BASE]: CSS_CLASS_SCENARIO_DARK_BLUE,
                [LongPercentile.P25 + '-' + LongPercentile.P75 + '|' + this.BASE]: CSS_CLASS_SCENARIO_DARK_BLUE,
                [LongPercentile.P50 + '|' + this.BASE]: CSS_CLASS_BASE_MIDLINE,

                [LongPercentile.P10 + '-' + LongPercentile.P90 + '|' + this.widgetSpecificData.scenario]: CSS_CLASS_YELLOW,
                [LongPercentile.P25 + '-' + LongPercentile.P75 + '|' + this.widgetSpecificData.scenario]: CSS_CLASS_YELLOW,
                [LongPercentile.P50 + '|' + this.widgetSpecificData.scenario]: CSS_CLASS_SCENARIO_MIDLINE
            };
        }
        return {
            [LongPercentile.P10 + '-' + LongPercentile.P90]: this.legendSettings.showBaseScenario ? CSS_CLASS_SCENARIO_DARK_BLUE : CSS_CLASS_YELLOW,
            [LongPercentile.P25 + '-' + LongPercentile.P75]: this.legendSettings.showBaseScenario ? CSS_CLASS_SCENARIO_DARK_BLUE : CSS_CLASS_YELLOW,
            [LongPercentile.P50]: this.legendSettings.showBaseScenario ? CSS_CLASS_BASE_MIDLINE : CSS_CLASS_SCENARIO_MIDLINE
        };
    }

    protected enrichCube(
        cube: SimpleCube<any>,
        chartConfig: EnrichingChartConfigType<any>,
        defaultQueryKeyEntries: QueryKeyEntry[]
    ) {
        const {
            groupBy: [level1, level2],
        } = chartConfig;

        const measureKeys = this.chartMeasures.map((measure) => new AggregationKey(measure.name, measure.aggMethod));
        const groupKeys = [new GroupByKey(level1), new GroupByKey(level2)];
        const chartCk = createQK([...defaultQueryKeyEntries, ...groupKeys, ...measureKeys]);

        // if query key with selected measure is already present in cube, skip this and reuse until reload.
        if (!cube.isSimilarPresent(chartCk)) {
            const cksForSet = cube.keys().filter((ck) => {
                // this check is needed because we want to make sure we are not combining data for individual measure/tabs selected
                return ck.aggregationKeys().length !== measureKeys.length &&
                ck.groupKeys().find((gk) => gk.isEqual(groupKeys[1]));
            });
            const keysToJoin: Observable<any>[] = cksForSet.map((ck) => cube.getSimilarIfPresent(ck));

            combineLatest(keysToJoin)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((dataSets) => {
                cube.set(chartCk, flatten(dataSets));
            });
        }
    }

    /**
     * Create chart options
     */
    protected createChartOptions(): Options {
        return {
            title: {text: null},
            xAxis: this.createXAxis(),
            yAxis: this.createYAxis(),
            tooltip: this.createTooltip(),
            plotOptions: this.createPlotOptions(),
            legend: this.createLegendOptions(),
            exporting: {enabled: false},
            chart: this.createChartConfigOptions()
        };
    }

    /**
     * Create legend options
     */
    private createLegendOptions(): LegendOptions {
        return {
            title: {
                text: '<span class="aux-bold" style="color: var(--primary-text__color); font-size: 0.8125rem">Percentile:</span>'
            }
        };
    }

    /**
     * Create plot options
     */
    private createPlotOptions(): PlotOptions {
        return {
            series: {
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2
                }
            }
        };
    }


    /**
     * Create X Axis
     */
    private createXAxis(): XAxisOptions {
        const context = this;
        return {
            title: {
                text: this.widgetSpecificData?.timeInterval === 1 ? 'Projection Horizon (Months)' : 'Projection Horizon (Quarters)'
            },
            gridLineWidth: 0,
            labels: {
                formatter(point: AxisLabelsFormatterContextObject): string {
                    return context.getQuarterYear(point.value as string);
                }
            }
        };
    }

    /**
     * Get quarter year
     */
    private getQuarterYear(dateString: string): string {
        const date = new Date(dateString);
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        const year = date.toLocaleDateString('en', {year: 'numeric'});
        return `Q${quarter} ${year}`;
    }

    /**
     * Create Y Axis
     */
    private createYAxis(): YAxisOptions {
        const context = this;
        return {
            reversedStacks: false,
            title: {
                text: this.columnToDisplay.label + ` (${this.formatter.getScaleUnit()})`
            },
            gridLineWidth: 1,
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true,
            labels: {
                formatter(): string {
                    return context.formatValue(this.value, context.formatter);
                }
            }
        };
    }

    /**
     * Create tooltip
     */
    private createTooltip(): TooltipOptions {
        const context = this;
        return {
            shared: true,
            useHTML: true,
            formatter(): string {
                return context.tooltipFormatter(this);
            }
        };
    }

    /**
     * Get tooltip formatter
     */
    private tooltipFormatter(data: any): any {
        if (this.widgetSpecificData.scenario) {
            return this.getToolTipHtmlForScenario(data);
        }
        return this.getToolTipHtml(data);
    }

    /**
     * Get tooltip html for scenario
     */
    private getToolTipHtmlForScenario(data: any): string {
        // Extract values from the points to display tooltip, sorted in the right way.
        const pointsHtmlMap = new Map();
        data.points.forEach((point: any) => {
            const isMidline = point.series.name?.includes(this.chartConfig.midline);

            if (isMidline) {
                const midlineColor = this.getMidlineColor();
                const yValue = this.formatValueWithUnit(point.y);
                // eg> point.series.name: '50th Percentile|Base', '50th Percentile|Scenario'
                const seriesName = this.updateSeriesName(point.series.name);
                const seriesCategory = point.series.name?.split('|')[1];
                pointsHtmlMap.set(point.series.name, this.getPointHtml(seriesName, yValue, midlineColor, seriesCategory === this.BASE ? '━' : '┄'));
            } else {
                const seriesColor = point.point.qbstr.measureName.includes(this.BASE) ? this.DARK_BLUE : this.YELLOW;
                // The symbol is circle.
                const symbol = '\u25CF';
                const lowerBoundValue = this.formatValueWithUnit(point.point.low);
                const upperBoundValue = this.formatValueWithUnit(point.point.high);
                const areaRange = this.chartConfig.areaRanges[0];
                const lowerBoundSeriesName = this.updateSeriesName(areaRange[0]);
                const upperBoundBoundSeriesName = this.updateSeriesName(areaRange[1]);

                // eg> point.series.name: 'Base', 'General recession'
                pointsHtmlMap.set(areaRange[0] + '|' + point.series.name, this.getPointHtml(lowerBoundSeriesName, lowerBoundValue, seriesColor, symbol));
                pointsHtmlMap.set(areaRange[1] + '|' + point.series.name, this.getPointHtml(upperBoundBoundSeriesName, upperBoundValue, seriesColor, symbol));
            }
        });
        const pointsHtmlKeys = Array.from(pointsHtmlMap.keys());
        this.sortScenarioPercentiles(pointsHtmlKeys);

        let pointsHtml = '';
        for (const key of pointsHtmlKeys) {
            pointsHtml += pointsHtmlMap.get(key);
        }
        const header = this.getQuarterYear(data.x);
        return `<div>
                <div style="font-weight: bold;">${header}</div>
                <div style="padding: 5px 0 2px 0;">Percentiles:</div>
                ${pointsHtml}
            </div>`;
    }

    /**
     * Sort scenario percentiles
     */
    private sortScenarioPercentiles(percentileKeys: string[]): void {
        // eg> 90th percentile|Base > 90th percentile|General recession > 50th percentile|Base > 50th percentile|General recession > 10th percentile|Base > 10th percentile|General recession
        percentileKeys.sort((a, b) => {
            // Function to parse the percentile value and category from the string
            const orderRank = (str) => {
                const parts = str.split('|');
                const percentilePart = parts[0];
                const categoryPart = parts[1];

                // Extract the numeric value of the percentile
                const percentileValue = parseInt(percentilePart.match(/\d+/)[0], 10);

                // Rank the category, assuming "Base" is higher than "Scenario"
                const categoryRank = categoryPart === this.BASE ? 1 : 2;

                // Combine the percentile and category rank into a sortable value
                return (100 - percentileValue) * 10 + categoryRank;
            };

            return orderRank(a) - orderRank(b);
        });
    }

    /**
     * Get tooltip html
     */
    private getToolTipHtml(data: any): string {
        const formattedPoints = data.points.reverse().map((point: any) => {
            const seriesName = this.baseTooltipSeriesMap[point.series.name]?.[0] || point.series.name;
            const seriesColor = point.series.name === Percentile.P50 ? this.getMidlineColor() : this.baseTooltipSeriesMap[point.series.name][1];
            // The symbol is circle for area and dash for line.
            const symbol = seriesName === Percentile.P50 ? '━' : '\u25CF';

            let yValue: number;
            if (point.colorIndex > 2) {
                yValue = point.point.high;
            } else if (point.colorIndex < 2) {
                yValue = point.point.low;
            } else {
                yValue = point.y;
            }
            return this.getPointHtml(seriesName, this.formatValueWithUnit(yValue), seriesColor, symbol);
        });

        const header = this.getQuarterYear(data.x);
        return `<div>
                <div style="font-weight: bold;">${header}</div>
                <div style="padding: 5px 0 2px 0;">Percentiles:</div>
                ${formattedPoints.join('')}
            </div>`;
    }

    /**
     * Get point html
     */
    private getPointHtml(title: string, value: string, color: string, symbol: string): string {
        const padding = symbol === '\u25CF' ? '0 9px 0 5px;' : '0 5px 0 0;';
        return `<div style="display: flex; align-items: center;">
                    <div style="color:${color}; padding:${padding}">
                        <span style="font-size: 20px;">${symbol}</span>
                    </div>
                    <div><strong>${title}</strong>: ${value}</div>
                </div>`;
    }

    /**
     * Format value with unit
     *  scale in million (mm) and 2 decimal places
     *  eg> 2.0511435 => 2.05 mm
     */
    protected formatValueWithUnit(value: number | string): string {
        return this.formatValue(value, this.formatter) + ' ' + this.formatter.getScaleUnit();
    }

    /**
     * Get midline color
     */
    private getMidlineColor(): string {
        const computedStyle = window.getComputedStyle(document.body);
        return computedStyle.getPropertyValue('--midline-color').trim();
    }

    /**
     * This method updates the series data before it is charted.
     */
    updateSeriesBeforeCharting = ({data}): any => {
        if (!this.widgetSpecificData.scenario) {
            data.forEach(series => {
                series.name = this.updateSeriesName(series.name);
            });
            return data;
        }

        data.forEach(series => {
            if (series.name.includes(this.widgetSpecificData.scenario)) {
                series.zIndex = series.type === ChartType.AREA_RANGE ? -2 : -1;
            }
        });
        return data;
    };

    /**
     * Update chart from custom legend change event
     */
    updateChartFromLegendChange(): void {
        // update chart measures
        this.setScenarioChartMeasures();
        // update area range
        this.chartConfig.areaRanges = this.getAreaRangeConfig();
        this.qbstrChartConfig = this.createQbstrChartConfig();
        this.generateQbstrOptions();
    }

    /**
     * Set scenarioChartMeasures based on the selected legend checkboxes
     */
    private setScenarioChartMeasures(): void {
        if (!this.widgetSpecificData.scenario) {
            this.scenarioChartMeasures = null;
            return;
        }
        this.scenarioChartMeasures = this.chartMeasures.filter(chartMeasure => {
            if (chartMeasure.name.includes(this.BASE)) {
                return this.legendSettings.showBaseScenario;
            } else {
                return this.legendSettings.showStressScenario;
            }
        });
    }

    /**
     * Update series name
     *  eg> '10th Percentile-25th Percentile' => '10-25th'
     */
    private updateSeriesName(seriesName: string): string {
        // extract numbers from series.name
        // eg> '10th Percentile-25th Percentile' => ['10', '25']
        const ranges = seriesName.match(/\d+/g) || [];
        return ranges.join('-') + SHORT_PERCENTILE_SUFFIX;
    }

    /**
     * returns whether to show select all and none label
     */
    protected showSelectAllNoneToChartLib(): boolean {
        return false;
    }

    /**
     * returns whether to show label input
     */
    protected showLabelInputToChartLib(): boolean {
        return false;
    }

    /**
     * Create chart specific qbstr chart config
     */
    createChartSpecificQbstrChartConfig(cube: SimpleCube<any>, _chartConfig: AreaRangeChartConfig<any>, chartOptions: Options, defaultQueryKey: FilterIncludeKey<any>[]): AreaRangeChartOptions<any> {
        this.initChartMeasures(this.cols.filter(col => col.columnTag === this.columnToDisplay.uid));
        this.setScenarioChartMeasures();
        const chartMeasures = this.scenarioChartMeasures || this.chartMeasures;
        return {
            data: cube,
            type: ChartType.AREA_RANGE,
            chartConfig: this.createChartConfig(chartMeasures),
            chartOptions,
            defaultQueryKeyEntries: defaultQueryKey,
            updateSeriesBeforeChartingFn: this.updateSeriesBeforeCharting,
            autoResizeDelay: -1
        };
    }
}
