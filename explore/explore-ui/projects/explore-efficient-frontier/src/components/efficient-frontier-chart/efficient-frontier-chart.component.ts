import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {
    ChartMeasure,
    LineChartConfig,
    QbstrChartConfiguration,
    UnionChartOptions,
} from '@qbstr/highcharts-api';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {default as Highcharts} from 'highcharts';
import {QueryKeyEntry, FilterIncludeKey} from '@qbstr/data-cube';
import {EfficientFrontierResponse, RequestConfig, VizualizationColumnConfigEF} from '../../interfaces/common.interface';
import {ROOT_LEVEL, SUB_TOTAL_AGG, createDataCube} from '../../utils/qbstr.adapter';
import {cloneDeep, isNil} from 'lodash';
import {LatestOptimizationRunDetails} from '../../models/latest-optimization-run-details';
import {EfficientFrontierChartService} from '../../services/efficient-frontier-chart-service';
import { ChartToggles, QbstrHighchartsOptions, QbstrPoint } from '@qbstr/highcharts-api';
import {generateSplineChartOptions, renderFn} from '@qbstr/highcharts-core';
import { addExploreButtons } from '@qbstr/highcharts-utils';

/**
 * Efficient frontier chart component handles initialization of chartState
 */
@Component({
    selector: 'explore-efficient-frontier-chart',
    templateUrl: './efficient-frontier-chart.component.html'
})
export class EfficientFrontierChartComponent implements OnChanges {

    // portfolio name
    @Input() portfolio: string;

    @Input() objectiveType: string;

    // optimization solutions
    @Input() latestOptimizationRunDetails: LatestOptimizationRunDetails[];

    // selected Yaxis column for chart
    @Input() selectedYAxisColumn: VizualizationColumnConfigEF;

    // selected Xaxis column for chart
    @Input() selectedXAxisColumn: VizualizationColumnConfigEF;

    requestConfig: RequestConfig;
    response: EfficientFrontierResponse;

    cube: SimpleCube<any>;
    levels: string[];

    chartConfig: LineChartConfig<any>;
    chartMeasures: ChartMeasure<any>[];
    qbstrChartConfig: QbstrChartConfiguration<any>;
    qbstrOptions: QbstrHighchartsOptions;
    qbstrOptions2: QbstrHighchartsOptions;

    // NOTE: | any required to workaround Highcharts typings errors
    chartOptions: Highcharts.Options | any = {};

    defaultQueryKey: QueryKeyEntry[];
    hc = Highcharts;

    /**
     * constructor
     */
    constructor(private efficientFrontierChartService: EfficientFrontierChartService) {
    }

    /**
     * this method is invoked when any of the bound property changes
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.selectedYAxisColumn?.currentValue !== changes?.selectedYAxisColumn?.previousValue || changes?.selectedXAxisColumn?.currentValue !== changes?.selectedXAxisColumn?.previousValue) {
            this.initializeChartContext();
        }
    }

    /**
     * prepares requestConfig, response object, cube and chartState
     */
    initializeChartContext() {
        this.requestConfig = this.efficientFrontierChartService.getRequestConfig(this.portfolio, this.selectedYAxisColumn.columnKey, this.objectiveType);
        this.response = this.efficientFrontierChartService.transformDataToFrontierResponse(this.latestOptimizationRunDetails, this.selectedYAxisColumn.columnKey, this.selectedXAxisColumn.columnKey);
        const {cube, breakdownLevels} = createDataCube(this.requestConfig, this.response);
        this.cube = cube;
        this.levels = breakdownLevels;
        this.qbstrChartConfig = this.createQbstrChartConfig();
        //TODO: This is a workaround for AUX data-viz bug ->  https://dev.azure.com/1A4D/AUX%20Aladdin%20User%20Experience/_workitems/edit/878225
        if (!this.qbstrOptions) {
            this.qbstrOptions = this.qbstrOptionGenerator(this.qbstrChartConfig, {});
            this.qbstrOptions2 = undefined;
        } else {
            this.qbstrOptions2 = this.qbstrOptionGenerator(this.qbstrChartConfig, {});
            this.qbstrOptions = undefined;
        }
    }

    qbstrOptionGenerator(config: UnionChartOptions<any>, chartToggles: ChartToggles): QbstrHighchartsOptions {
        return addExploreButtons(Highcharts, generateSplineChartOptions(config as any), chartToggles ) as QbstrHighchartsOptions;
    }
    /**
     * prepares the chartState to be used by qbstr chart
     */
     createQbstrChartConfig(): QbstrChartConfiguration<any> {
        this.chartMeasures = this.createChartMeasures(this.requestConfig.columns);
        this.chartConfig = this.createChartConfig(this.chartMeasures);
        return {
            data: this.cube,
            chartOptions: this.createChartOptions(),
            chartConfig: this.chartConfig,
            defaultQueryKeyEntries: this.defaultQueryKey
        };
    }

    /**
     * create chart measures
     */
    createChartMeasures(cols: VizualizationColumnConfigEF[]): ChartMeasure<any>[] {
        return cols.filter(col => col.isSubtotalable).map(col => ({
            name: col.columnKey,
            title: col.columnTitle,
            aggMethod: SUB_TOTAL_AGG
        }));
    }

    /**
     * create chart config
     */
    createChartConfig(measures: ChartMeasure<any>[]): LineChartConfig<any> {
        const measuresToUse = cloneDeep(measures);
        this.defaultQueryKey = this.defaultQueryKey = [new FilterIncludeKey(ROOT_LEVEL, [this.requestConfig.portfolio])];
        const groupBys = this.levels.slice(1, this.levels.length);
        const config: any = {
            groupBy: groupBys,
            drillDown: undefined,
            breakdowns: groupBys,
            measures: measuresToUse,
            secondaryYAxis: undefined
        };
        return config;
    }

    /**
     * create the ChartOptions for spline chart
     */
    createChartOptions(): Highcharts.Options {
        const context = this;
        const chartOptions = {
                legend: {
                    enabled: false,
                },
                title: {
                    text: null
                },
                plotOptions: {
                    series: {
                        turboThreshold: 0,
                        dataLabels: {
                            enabled: false
                        },
                        tooltip: {
                            pointFormatter: this.tooltipPointFormatter(),
                            headerFormat: ''
                        }
                    }
                },
                chart: {
                    animation: false,
                    zoomType: 'xy',
                    events: {
                        render: event => renderFn(event, undefined)
                    }
                },
                credits: {
                    enabled: false
                },
                exporting: {
                    enabled: false
                },
                xAxis: {
                    title: {
                        text: `<b>${context.selectedXAxisColumn.columnTitle}</b>`
                    },
                    reversed: false,
                    gridLineWidth: 1
                },
                yAxis: [{
                    title: {
                        text: `<b>${context.selectedYAxisColumn.columnTitle}</b>`
                    },
                    labels: {
                        formatter: this.yAxisFormatter()
                    },
                    startOnTick: true,
                    endOnTick: true,
                    reversed: false,
                    showLastLabel: true
                }]
            } as any;

        return chartOptions;
    }

    /**
     * format yAxis values
     */
    yAxisFormatter = (): any => {
        const context = this;
        return function() {
            const formattedVal = context.formatValue(this.value, context.selectedYAxisColumn.formatter);
            return formattedVal;
        };
    };

    /**
     * format the given value as per formatter
     */
    formatValue(value: any, formatter: any): string {
        if (isNaN(value) || isNil(value) || value === '') {
            return isNil(value) ? null : value.toString();
        }

        const scaleFactor = formatter.scalingFactor;
        const decimalPlaces = formatter.decimalPlaces;

        const scaledValue = value / scaleFactor;
        const formattedValue = this.formatDecimalPlaces(scaledValue, decimalPlaces);

        return formattedValue;
    }

    /**
     * This method formats the passed in numeric value to the number of decimalPlaces passed in
     */
    formatDecimalPlaces(numValue: number, decimalPlaces: number): string {
        let tmpScale = 1;
        if (decimalPlaces > 0) {
            tmpScale = Math.round(Math.pow(10, decimalPlaces));
        }
        const scaledValue = Math.round(tmpScale * numValue) / tmpScale;
        return scaledValue.toFixed(decimalPlaces);
    }

    /**
     * format tooltip data
     */
    tooltipPointFormatter(): any {
        const context = this;
        return function(point): string {
            const qbstr = (point as QbstrPoint)?.qbstr;
            const formatter = context.selectedYAxisColumn.formatter;
            const formattedValue = context.formatValue(qbstr?.negative && this.y > 0 ? this.y * (-1) : this.y, formatter);
            return `<b>${context.requestConfig.portfolio}_${this.x + 1}</b><br/>
                    <b>${context.selectedYAxisColumn.columnTitle}</b>: ${formattedValue}<br/>`;
        };
    }
}
