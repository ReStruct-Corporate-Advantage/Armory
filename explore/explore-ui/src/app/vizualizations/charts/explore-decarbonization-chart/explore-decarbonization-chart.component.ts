import {Component, ViewEncapsulation} from '@angular/core';
import {createQK, FilterIncludeKey, GroupByKey, QueryKeyEntry} from '@qbstr/data-cube';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {QbstrHighchartsOptions, DataProcessingAPI, LineChartConfig, LineChartOptions, AuxColorsQualitative, ChartMeasure, QbstrPoint, ChartType} from '@qbstr/highcharts-api';
import {dropRight, first, isNil, last, merge} from 'lodash';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import { DefaultCustomVizConfig } from '@interfaces/custom-viz-config.interface';
import { ExploreEnrichingChartDirective } from '../explore-enriching-chart.directive';
import { ROOT_LEVEL, SUB_TOTAL_AGG } from '@utils/qbstr';
import { Options } from 'highcharts';
import { ColumnSeriesChartType } from '@enums/column-series-chart-type.enum';
import { VizualizationColumnConfig } from '@interfaces/request.interface';

/**
 * Explore Decarbonization chart handles explore specific parts of the initialization.
 * Prepares cube
 * Handles types specific chart configuration
 */
@Component({
    selector: 'app-explore-decarbonization-chart',
    templateUrl: '../explore-chart.component.html',
    styleUrls: ['./explore-decarbonization-chart.component.scss', '../explore-chart.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ExploreDecarbonizationChartComponent extends ExploreEnrichingChartDirective<LineChartConfig<any>, DefaultCustomVizConfig> {

    updateSeriesBeforeCharting = <DATATYPE>(api: DataProcessingAPI<DATATYPE, LineChartConfig<DATATYPE>>): any[] => {
        // Update on base year refresh
        const baseYear = '2023';
        const baseYearPlotLineValue = this.getPlotLineValue(api.data[0].data, baseYear);

        //base line
        api.chart.xAxis[0]?.addPlotLine({
            className: 'vertical-plot-line-color',
            value: 0,
            zIndex: 2,
          });

        // Adding 2 plot lines for same base year, just to have 2 diff labels - "Historical" & "Forward-looking"
        api.chart.xAxis[0]?.addPlotLine({
            className: 'vertical-plot-line-color',
            value: baseYearPlotLineValue,
            zIndex: 2,
            label: {
                text: 'Historical',
                useHTML: true,
                verticalAlign: 'top',
                rotation: 0,
                align: 'right',
                x: -5,
                y: 15,
            }
        });
        api.chart.xAxis[0]?.addPlotLine({
            className: 'vertical-plot-line-color',
            value: baseYearPlotLineValue,
            zIndex: 3,
            label: {
                text: 'Forward-looking',
                useHTML: true,
                verticalAlign: 'top',
                rotation: 0,
                align: 'left',
                x: 5,
                y: 15
            }
        });

        //Plot lines for all the Portfolio Targets
        api.data.forEach(data =>{
            if(data.name.includes('Portfolio Target')){
                api.chart.xAxis[0]?.addPlotLine({
                    className: 'vertical-plot-line-color',
                    value: this.getPlotLineValue(data.data),
                    zIndex: 2,
                    label: {
                        y:25,
                        text: '<b>'+data.name+'</b>',
                        useHTML: true,
                        style: {
                            fontWeight: 'bold'
                        }
                    }
                });
            }
        });
        
        return api.data;
    };

    protected getCubeSelectedEnrichDataSet(cube: SimpleCube<any>, _chartConfig: LineChartConfig<any>, defaultQueryKeyEntries: QueryKeyEntry[], measureKeys: QueryKeyEntry[]): Observable<any[]> {
        const groupByQueryKey = last(defaultQueryKeyEntries);

        const defaultQueryKey = dropRight(defaultQueryKeyEntries);
        const groupByKey = new GroupByKey(groupByQueryKey.field);

        return cube.getSimilarIfPresent(createQK([...defaultQueryKey, ...measureKeys, groupByKey])).pipe(
            filter(data => !isNil(data)),
            map((data: any[]) => data.filter(dataItem => dataItem[groupByQueryKey.field] === first((groupByQueryKey as FilterIncludeKey<string>).includes))),
            map((data: any[]) => data.map(dataItem => ({
                ...dataItem,
                forMeasureSeriesOnly: true,
            })))
        );
    }

    /**
     * create chart measures
     */
    protected initChartMeasures(cols: VizualizationColumnConfig[]): void {
        this.chartMeasures = cols
            .filter((col) => col.isSubtotalable)
            .map((col) => {
                return {
                    name: col.columnKey,
                    title: col.columnTitle,
                    aggMethod: SUB_TOTAL_AGG,
                    chartType: ColumnSeriesChartType.getHighchartChartType(ColumnSeriesChartType.LINE),
                };
            });
    }

    /**
     * createChartConfig
     */
    protected createChartConfig(measures: ChartMeasure<any>[]): LineChartConfig<any> {
        
        this.defaultQueryKey = [new GroupByKey(ROOT_LEVEL)];

        return {
            groupBy: [],
            seriesNameOverride: this.seriesNameOverride as any,
            measures: measures,
            knownColors: this.getKnownColors()
        };
    }

    protected createChartOptions(_chartConfig: LineChartConfig<any>): Options {

        const context = this;

        const chartOptions = merge({},
            super.createChartOptions(),
            {   
                title: {
                    text: context.getChartTitle(),
                    align: 'left',
                    x: 8,
                    useHTML:true
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            formatter() {
                                const qbstr = (this.point as QbstrPoint)?.qbstr;
                                const formatter = context.colsMap[qbstr.measureName].formatter;
                                return context.formatValue(this.y, formatter);
                            }
                        },
                        zIndex: 1 // ensure that line/marker series are on top of line series
                    },
                    series: {
                        dataLabels: {
                            crop: false,
                            allowOverlap: false,
                            overflow: 'none',
                            padding: 1
                        },
                        marker: {
                            enabled: false
                          },
                        grouping: true,
                        tooltip: {
                            headerFormat: '',
                            pointFormatter() {
                                return context.tooltipPointFormatter(this);
                            }
                        }
                    }
                },
                yAxis: {
                    title:{
                        text: this.getYAxisLabel(context.firstCol)
                    },
                    gridLineWidth:1},
                xAxis: {
                    labels: {
                        autoRotationLimit: 100,
                        startOnTick: true,
                        endOnTick: true,
                        showLastLabel: true
                    },
                    gridLineWidth: 0,
                    
                }
            });

        return chartOptions;
    }

    /**
     * Creates a qbstr chart config of LINE.
     */
    createChartSpecificQbstrChartConfig(cube: SimpleCube<any>,
                                        chartConfig: LineChartConfig<any>,
                                        chartOptions: QbstrHighchartsOptions,
                                        defaultQueryKey: QueryKeyEntry[]
    ): LineChartOptions<any> {
        return {
            data: cube,
            type: ChartType.LINE,
            chartConfig,
            chartOptions,
            defaultQueryKeyEntries: defaultQueryKey,
            autoResizeDelay: -1,
            updateSeriesBeforeChartingFn: this.updateSeriesBeforeCharting
        };
    }


    protected seriesNameOverride = (_measure: ChartMeasure<any>, column: any): string => {
        let seriesName ='Portfolio';
        const seriesType = column?.name?.split('|')[0].split('-')[1];
        if(seriesType === 'base'){
            return seriesName +' ' + this.requestConfig.portfolio +' - '+ column?.name?.split('|')[1];
        } else{
            return seriesName + ' Target ' + seriesType?.split('_')[1];
        }
    }

    /**
     * format the tooltip points on bar chart
     */
    tooltipPointFormatter(point): any {
        const qbstr = (point as QbstrPoint).qbstr;
        const vizConfig = this.colsMap[qbstr.measureName];
        const y = this.formatValue(point.y, vizConfig.formatter);

        const measureToUse = this.chartConfig.measures.find(measure => measure.name === qbstr.measureName);
        let columnTitle =this.seriesNameOverride(null, measureToUse);

        return `<b>${columnTitle}</b><br><b>&nbsp;${point.name}</b>: ${y} tCO2e/$mn<br>`;
    }

    enrichCube(cube: SimpleCube<any>, chartConfig: LineChartConfig<any>, defaultQueryKeyEntries: QueryKeyEntry[]) {
        super.enrichSplitColumnKeys(cube, chartConfig, defaultQueryKeyEntries, true);
    }

    private getChartTitle():string{
        return '<b>' +this.firstCol?.columnTitle + ' with ' + this.firstCol?.columnKey?.split('|')[2] + ', ' + this.firstCol?.columnKey?.split('|')[1]+'</b>';
    }

    private getKnownColors(){
        return {
            series: {
                'Portfolio Target 1': {...AuxColorsQualitative.BLUE, classes: 'custom-stroke-dash' },
                'Portfolio Target 2': {...AuxColorsQualitative.GREEN_BLUE, classes: 'custom-stroke-dash' },

            }
        }
    }

    private getPlotLineValue(data: any[], year?: string): number{
        if(!year){
            year = (data.filter(dataPoint => dataPoint.y !== undefined)).at(-1)?.name;
        }
        return data.map(dataPoint => dataPoint.name).indexOf(year);
    }

    private getYAxisLabel(column: VizualizationColumnConfig): string {
        if(column?.columnTag === 'TA_SOV_SCOPE1_INTENSITY_GDP' || column?.columnTag === 'TA_SOV_SCOPE1_INTENSITY_GDP_PPP' || column?.columnTag === 'TA_SOV_SCOPE1_INTENSITY_SOV_DEBT') {
            return 'kgCO2e/$mn';
        } else if(column?.columnTag === 'TA_SOV_SCOPE1_INTENSITY_PER_CAPITA' || column?.columnTag === 'financed_emis_s12' || column?.columnTag === 'financed_emis_s12' || column?.columnTag === 'financed_emis_s123') {
            return 'tCO2e';
        } else {
            return 'tCO2e/$mn'
        }
    }
}
