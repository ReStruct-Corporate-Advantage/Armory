import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AuxTabBarItemInterface} from '@blk/aladdin-angular-components';
import {default as Highcharts, Options} from 'highcharts';
import {NumericDataFormatter} from '@blk/explore-ui-column-option';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {NumericColumnFormat} from '@blk/explore-ui-core';
import {AuxColorsQualitative, ChartMeasure, ChartType, UnionChartOptions} from '@qbstr/highcharts-api';
import {WidgetUtils} from '@utils/widget.utils';
import {ExploreChartComponent} from '../../explore-chart.component';

@Component({
  selector: 'explore-commitment-risk-chart-legacy',
  templateUrl: './explore-commitment-risk-chart-legacy.component.html',
  styleUrls: ['./explore-commitment-risk-chart-legacy.component.scss']
})
export class ExploreCommitmentRiskChartLegacyComponent extends ExploreChartComponent<any, any> implements OnChanges {
    @Input() columnToDisplay: AuxTabBarItemInterface;

    chartOptions: Options;
    chartReady: boolean;
    private widgetSpecificData: { seriesTitles: string[], timeInterval: number };
    formatter: NumericDataFormatter;

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
    }

    protected setInternalState(widgetPayload: WidgetPayload) {
        this.widgetSpecificData = widgetPayload.widgetSpecificData;
        super.setInternalState(widgetPayload);
        // A formatter is created here to hardcode the decimal places and scaling factor for the ACRM Chart widget
        // This will require modification once the feature enabling users to change the values for these variables is implemented
        const columnFormat: NumericColumnFormat = new NumericColumnFormat();
        columnFormat.decimalPlaces = 0;
        columnFormat.scalingFactor = 1000;
        this.formatter = new NumericDataFormatter(columnFormat, []);
    }

    createChartConfig(measures: ChartMeasure<any>[]): any {
        const chartConfig = {
            measures,
            groupBy: ['level-1', 'level-2']
        };
        this.overrideDefaultSeriesColor(chartConfig);
        return chartConfig;
    }

    private overrideDefaultSeriesColor(chartConfig: any): void {
        if (!this.widgetSpecificData) {
            return;
        }
        chartConfig.knownColors = {
            series: {
                [this.widgetSpecificData.seriesTitles[0]]: {
                    ...AuxColorsQualitative.BLUE,
                    classes: 'opaque'
                }
            }
        };
    }

    protected createXAxisFormatter(): any {
        return function(): string {
            return this.pos;
        };
    }
    protected yAxisFormatter = (): any => {
        const context = this;
        return function() {
            return context.formatter.formatInShort(WidgetUtils.getInputValueToFormat(this.value, context.formatter), 2);
        };
    };

    /**
     * Formats data labels such that they are scaled and to 3 d.p
     */
    dataLabelFormatter = (data): any => {
        return this.formatter.formatInShort(WidgetUtils.getInputValueToFormat(data, this.formatter), 2);
    };

    createChartOptions(): Highcharts.Options {
        const context = this;
        return {
            title: {
                text: null
            },
            xAxis: {
                title: {
                    text: this.widgetSpecificData?.timeInterval === 1 ? 'Projection Horizon (Months)' : 'Projection Horizon (Quarters)'
                },
                labels: {
                    formatter: this.createXAxisFormatter()
                }
            },
            yAxis: {
                reversedStacks: false,
                title: {
                    text: this.columnToDisplay.label
                },
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true,
                labels : {
                    formatter: this.yAxisFormatter()
                }
            },
            legend: {
                symbolHeight: 12,
                symbolWidth: 12,
                symbolRadius: 6
            },
            tooltip: {
                // shared is an option we can put which will show all Ys at the same X point in the tooltip.
                shared: true,
                useHTML: true,
                formatter() {
                    return context.tooltipFormatter(this);
                }
            },
            exporting: {
                enabled: false
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: false
                    },
                },
                area: {
                    dataLabels: {
                        formatter() {
                            return context.dataLabelFormatter(this.y);
                        }
                    },
                    events: {
                        legendItemClick() {
                            return false;
                        }
                    }
                }
            }
        };
    }

    tooltipFormatter(data): any {
        let tds = '';
        // Usually higher percentile points are above lower point percentile.
        // For the tooltip display it would make more sense to show higher percentiles above lower percentiles
        for (let i = data.points.length - 1; i > -1; i--) {
            const pointTitle = this.getSeriesTitle(data.points[i].series.index);
            const pointValue = (data.points[i].point.stackY);
            const displayValue = this.formatter.formatInShort(WidgetUtils.getInputValueToFormat(pointValue, this.formatter), 2);
            tds += `<tr><td style="font-weight: bold">${pointTitle}: </td><td>${displayValue}</td></tr>`;
        }
        let header = this.widgetSpecificData.timeInterval === 1 ? 'Month ' : 'Quarter ';
        header += data.points?.length > 0 && data.points[0].point ? data.points[0].point.index : data.x;
        return `<table>
                    <tr><th style="font-weight: bold">${header}</th></tr>
                    ${tds}
                </table>`;

    }

    private getSeriesTitle(index: number, showInLegend?: boolean): any {
        const percentileLabel = this.widgetSpecificData.seriesTitles[index];
        return + percentileLabel * 100 + 'th percentile';
    }

    /**
     * The data that we pass into stacked area chart need to be modified.
     * eg>  If the first value is 3 and the second value is 5,
     *      second value needs to be modified to 2 before fed into the chart.
     *      Otherwise 5 will be stacked on top of 3, so the second one will be pointing 8 on the Y axis.
     */
    updateSeriesBeforeCharting = ({data}): any => {
        let seriesIndex = data.length - 1;
        while (seriesIndex > -1) {
            data[seriesIndex].name = this.getSeriesTitle(seriesIndex, true);
            for (let i = 0; i < data[seriesIndex].data.length; i++) {
                // modifying data
                if (data[seriesIndex] && data[seriesIndex - 1]) {
                    data[seriesIndex].data[i].y -= data[seriesIndex - 1].data[i].y;
                }
            }
            seriesIndex--;
        }
        return data.map(s => ({ ...s, threshold: null, }));
    };


    /**
     * returns whether to show select all and none label
     */
    protected showSelectAllNoneToChartLib(): boolean {
        return false;
    }

    /**
     * Called when chart is ready
     */
    onChartReady(event: CustomEvent<Highcharts.Chart>) {
        this.chartReady = true;
    }

    createChartSpecificQbstrChartConfig(cube, chartConfig, chartOptions, defaultQueryKey): UnionChartOptions<any> {
        this.initChartMeasures([this.cols.find(col => col.columnTag === this.columnToDisplay.uid)]);
        return {
            data: cube,
            type: ChartType.AREA,
            chartConfig: this.createChartConfig(this.chartMeasures),
            chartOptions,
            defaultQueryKeyEntries: defaultQueryKey,
            updateSeriesBeforeChartingFn: this.updateSeriesBeforeCharting,
            autoResizeDelay: -1
        };
    }
}
