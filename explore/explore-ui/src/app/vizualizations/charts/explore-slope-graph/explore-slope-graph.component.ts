import { Component } from '@angular/core';
import { VizualizationColumnConfig } from '@interfaces/request.interface';
import { QueryKeyEntry } from '@qbstr/data-cube';
import { SimpleCube } from '@qbstr/data-cube-reactive';
import { ChartMeasure, ChartType, QbstrHighchartsOptions, QbstrPoint, SlopeChartConfig, SlopeChartOptions } from '@qbstr/highcharts-api';
import { Options } from 'highcharts';
import { merge } from 'lodash';
import { ExploreChartComponent } from '../explore-chart.component';

/**
 * Explore Slope Graph handles explore specific parts of the initialization.
 * Prepares cube
 * Handles types specific chart configuration
 */
@Component({
    selector: 'app-explore-slope-graph',
    templateUrl: '../explore-chart.component.html',
    styleUrls: ['../explore-chart.component.scss']
})
export class ExploreSlopeGraphComponent extends ExploreChartComponent<SlopeChartConfig<any>, any> {
    /**
     * create config for slope graph
     */
    createChartConfig(measures: ChartMeasure<any>[]): SlopeChartConfig<any> {
        return {
            groupBy: [this.breakdownLevels[1]],
            measures
        };
    }

    createChartSpecificQbstrChartConfig(cube: SimpleCube<any>, chartConfig: SlopeChartConfig<any>, chartOptions: QbstrHighchartsOptions, defaultQueryKey: QueryKeyEntry[]): SlopeChartOptions<any> {
        return {
            data: cube,
            type: ChartType.SLOPE,
            chartConfig: chartConfig,
            chartOptions: chartOptions,
            defaultQueryKeyEntries: defaultQueryKey,
            autoResizeDelay: -1
        };
    }

    /**
     * create the ChartOptions for slope graph
     */
    protected createChartOptions(): Options {
        const context = this;
        const pointFormatter: any = function () {
            const qbstr = (this as QbstrPoint)?.qbstr;
            return `<b>${this.series.name}</b>: ${context.formatValue(qbstr?.negative && this.point.y > 0 ? this.point.y * (-1) : this.point.y, context.firstCol.formatter)}<br/>`;
        };
        const config = super.createChartOptions();
        config.xAxis = {
            opposite: true,
            categories: this.getCategories()
        };
        config.yAxis = {
            visible: false
        };

        return merge({},
            config,
            {
                plotOptions: {
                    series: {
                        dataLabels: {
                            shadow: false,
                            style: {
                                textOutline: 'none',
                                fontWeight: 'normal'
                            },
                            pointFormatter
                        },
                        tooltip: {
                            headerFormat: '',
                            pointFormatter() {
                                return context.tooltipPointFormatter(this);
                            }
                        }
                    }
                },
            });
    }

    /**
     * format the tooltip points on slope graph chart
     */
    tooltipPointFormatter(point): any {
        const qbstr = (point as QbstrPoint)?.qbstr;
        const formattedValue = this.formatValue(qbstr?.negative && point.y > 0 ? point.y * (-1) : point.y, this.firstCol.formatter);

        return `
                <div style='z-index:999; background-color: var(--input-box__background-color--disabled); padding: 8px;'>
                    <span style='font-weight: bold'>${this.requestConfig.portfolio}</span><br/>
                    <span style='font-weight: bold'>${point.name}:</span> ${formattedValue}
                <div>`;
    }

    /**
     * this will initialize the xAxis categories for the slope graph based on comparison mode
     */
    getCategories(): string[] {
        let categories = [];
        if (!this.responseConfig.splitColumnKeys) {
            categories = ['Before', 'After'];
        } else {
            const requestColumns: VizualizationColumnConfig[] = this.requestConfig.columns;
            categories = this.responseConfig.splitColumnKeys[requestColumns[0].columnKey].map(column => column['header']);
        }
        return categories;
    }
}
