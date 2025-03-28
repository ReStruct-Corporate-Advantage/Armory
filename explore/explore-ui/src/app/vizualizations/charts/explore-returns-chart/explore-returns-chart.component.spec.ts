import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ExploreReturnsChartComponent} from './explore-returns-chart.component';
import {LineChartConfig} from '@qbstr/highcharts-api';
import {SUB_TOTAL_AGG} from '@utils/qbstr';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {AggregationKey, createQK, GroupByKey} from '@qbstr/data-cube';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {Widget} from '@models/widget/widget.model';
import {DateFormatConstants, WidgetConfigType} from '@blk/explore-ui-core';
import {TimePeriodInterval} from '@models/widget/inputs/chart-settings/time-period-interval-settings.model';

describe('ExploreReturnsChartComponent', () => {
    let component: ExploreReturnsChartComponent;
    let fixture: ComponentFixture<ExploreReturnsChartComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ExploreReturnsChartComponent],
            imports: [AladdinAngularComponentsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ExploreReturnsChartComponent);
        component = fixture.componentInstance;
        component.widget = new Widget();
        component.widget.configType = WidgetConfigType.RETURN_ANALYSIS_CHART;
        fixture.detectChanges();
    });

    it('tests createChartConfig', () => {
        component.breakdownLevels = ['a', 'b', 'c'];
        component['initChartMeasures']([
            {
                columnTag: 'total_ret_cumulative',
                columnKey: 'total_ret_cumulative',
                columnTitle: 'Total Return Cumulative',
                dataType: 'number',
                isSubtotalable: true,
                cumulativeReturnColumnOption: {isCumulative: true}
            },
            {
                columnTag: 'total_ret',
                columnKey: 'total_ret',
                columnTitle: 'Total Return',
                dataType: 'number',
                isSubtotalable: true
            } as any
        ]);

        expect(component.createChartConfig(component.chartMeasures)).toEqual({
            groupBy: [
                'b',
                'c'
            ],
            ignoreUndefinedMeasure: true,
            measures: [
                {
                    name: 'total_ret_cumulative',
                    title: 'Total Return Cumulative',
                    aggMethod: SUB_TOTAL_AGG
                },
                {
                    name: 'total_ret',
                    title: 'Total Return',
                    aggMethod: SUB_TOTAL_AGG,
                    cssStyleClass: 'noncumulative'
                }
            ]
        });
    });

    it('should format the tooltip points', () => {
        component['colsMap'] = {
            'bench_total_ret_cumulative': {
                formatter: {format: () => '6.962044'}
            } as any,
            'total_ret_cumulative': {
                formatter: {format: () => '5.6789'}
            } as any
        };
        fixture.detectChanges();

        let point = {
            name: '13-SEP-2022',
            category: '13-SEP-2022',
            series: {name: 'Benchmark Total Return Cumulative'},
            qbstr: {negative: false, measureName: 'bench_total_ret_cumulative'},
            y: 6.962044
        } as any;
        expect(component.tooltipPointFormatter(point)).toMatchSnapshot();

        point = {
            name: '10-SEP-2022',
            category: '10-SEP-2022',
            series: {name: 'Total Return Cumulative'},
            qbstr: {negative: false, measureName: 'total_ret_cumulative'},
            y: 5.6789
        } as any;
        expect(component.tooltipPointFormatter(point)).toMatchSnapshot();
    });


    describe('Test enriching for line Chart', () => {
        let cube;

        beforeEach(() => {
            cube = new SimpleCube([]);
        });

        it('should enrich cube #1', () => {

            const chartConfig: LineChartConfig = {
                measures: [
                    {
                        name: 'total_ret_cumulative',
                        title: 'Total Return Cumulative',
                        aggMethod: SUB_TOTAL_AGG
                    },
                    {
                        name: 'total_ret',
                        title: 'Total Return',
                        aggMethod: SUB_TOTAL_AGG,
                        cssStyleClass: 'noncumulative'
                    }
                ],
                groupBy: ['level-1', 'level-2'],
                breakdowns: ['level-1', 'level-2'],
            };

            cube.set(createQK([new GroupByKey('level-1'), new AggregationKey('total_ret', 'sum'), new AggregationKey('total_ret_cumulative', 'sum')]), [1]);
            component['enrichCube'](cube, chartConfig, []);
            const subsc = cube.get(createQK([new GroupByKey('level-1'), new AggregationKey('total_ret', 'sum'), new AggregationKey('total_ret_cumulative', 'sum')])).subscribe(data => {
                expect(data).toEqual([1]);
            });
            subsc.unsubscribe();
        });

        it('should enrich cube #2', () => {
            component.customVizConfig = {};
            const chartConfig: LineChartConfig = {
                measures: [
                    {
                        name: 'total_ret_cumulative',
                        title: 'Total Return Cumulative',
                        aggMethod: SUB_TOTAL_AGG
                    },
                    {
                        name: 'total_ret',
                        title: 'Total Return',
                        aggMethod: SUB_TOTAL_AGG,
                        cssStyleClass: 'noncumulative'
                    }
                ],
                groupBy: ['level-1', 'level-2'],
                breakdowns: ['level-1', 'level-2'],
            };

            cube.set(createQK([new GroupByKey('level-1'), new AggregationKey('total_ret', 'sum')]), [1]);
            cube.set(createQK([new GroupByKey('level-2'), new AggregationKey('total_ret', 'sum')]), [2]);
            cube.set(createQK([new GroupByKey('level-1'), new AggregationKey('total_ret_cumulative', 'sum')]), [3]);
            cube.set(createQK([new GroupByKey('level-2'), new AggregationKey('total_ret_cumulative', 'sum')]), [4]);

            component['enrichCube'](cube, chartConfig, []);
            const subsc = cube.get(createQK([new GroupByKey('level-1'), new GroupByKey('level-2'), new AggregationKey('total_ret', 'sum'), new AggregationKey('total_ret_cumulative', 'sum')])).subscribe(data => {
                expect(data).toEqual([1, 2]);
            });
            subsc.unsubscribe();
        });
    });

    it('should test setXAxisLabelConfig', () => {
        const xAxisOptions = {};
        component.customVizConfig = {timePeriodInterval: TimePeriodInterval.WEEKLY};
        component['setXAxisLabelConfig'](xAxisOptions);

        expect(xAxisOptions['labels'].step).toBe(1);
        expect(xAxisOptions['labels'].rotation).toBe(-45);
    });

    it('should test getXAxisDataLabel', () => {
        const customVizConfig = {
            dateFormat: DateFormatConstants.ALADDIN_DATE_FORMAT_NAME,
            timePeriodInterval: TimePeriodInterval.DAILY
        };

        // DAILY
        let date = '06-FEB-2024';
        expect(component['getXAxisDataLabel'](date, customVizConfig)).toEqual('06-FEB-2024');

        // WEEKLY
        customVizConfig.timePeriodInterval = TimePeriodInterval.WEEKLY;
        expect(component['getXAxisDataLabel'](date, customVizConfig)).toBeUndefined();

        date = '05-FEB-2024';
        expect(component['getXAxisDataLabel'](date, customVizConfig)).toEqual('05-FEB-2024');

        // MONTHLY
        customVizConfig.timePeriodInterval = TimePeriodInterval.MONTHLY;
        expect(component['getXAxisDataLabel'](date, customVizConfig)).toBeUndefined();

        date = '01-FEB-2024';
        expect(component['getXAxisDataLabel'](date, customVizConfig)).toEqual('01-FEB-2024');

        // QUARTERLY
        customVizConfig.timePeriodInterval = TimePeriodInterval.QUARTERLY;
        expect(component['getXAxisDataLabel'](date, customVizConfig)).toBeUndefined();

        date = '01-APR-2024';
        expect(component['getXAxisDataLabel'](date, customVizConfig)).toEqual('01-APR-2024');

        // YEARLY
        customVizConfig.timePeriodInterval = TimePeriodInterval.YEARLY;
        expect(component['getXAxisDataLabel'](date, customVizConfig)).toBeUndefined();

        date = '01-JAN-2024';
        expect(component['getXAxisDataLabel'](date, customVizConfig)).toEqual('01-JAN-2024');
    });
});
