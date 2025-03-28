import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange, SimpleChanges} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {ExpostColumnOption} from '@blk/explore-ui-column-option';
import {CoreCommonConstants, ExpostSettings, TimePeriod, WidgetConfigType} from '@blk/explore-ui-core';
import {data1} from '@mocks/test-data/qbstr-test-data';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {Widget} from '@models/widget/widget.model';
import {AggregationKey, createQK, GroupByKey} from '@qbstr/data-cube';
import {ReactiveCube, SimpleCube} from '@qbstr/data-cube-reactive';
import {LineChartConfig} from '@qbstr/highcharts-api';
import {ROOT_LEVEL} from '@utils/qbstr';
import {TestUtils} from '@utils/test.utils';
import {ExploreExpostTimeSeriesChartComponent} from './explore-expost-time-series-chart.component';
import Highcharts from 'highcharts';
import * as hcCore from '@qbstr/highcharts-core';


describe('ExploreExpostTimeSeriesChartComponent', () => {
    let component: ExploreExpostTimeSeriesChartComponent;
    let fixture: ComponentFixture<ExploreExpostTimeSeriesChartComponent>;
    let widgetPayload: WidgetPayload;
    let colMap: any;

    const setupHighchartsSpy = jest.spyOn(hcCore, 'setupHighcharts');
    const generateOptionsSpy = jest.spyOn(hcCore, 'generateOptions');

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        const request = {
            portfolio: 'PEP',
            columns: [
                {
                    columnKey: 'date',
                    columnTag: 'date',
                    originalColumnTitle: 'Date',
                    columnTitle: 'Date',
                    formatter: {format: () => ''},
                    dataType: 'DATE',
                    isSubtotalable: false,
                    isHidden: false
                },
                {
                    columnKey: 'ExpostTE',
                    columnTag: 'ExpostTE',
                    originalColumnTitle: 'Ex-post Tracking Error',
                    columnTitle: 'Ex-post Tracking Error',
                    formatter: {format: () => ''},
                    dataType: 'DOUBLE',
                    isSubtotalable: true,
                    isHidden: false
                }
            ]
        };

        widgetPayload = {widgetConfigType: WidgetConfigType.EXPOST_TIME_SERIES};
        widgetPayload.requestConfig = request;
        widgetPayload.responseConfig = data1.data as any;
        widgetPayload.cube = new ReactiveCube<any>([]);
        widgetPayload.breakdownLevels = [ROOT_LEVEL];
        widgetPayload.customVizConfig = {
            samplingPeriod: '1 Month',
            statisticPeriod: '1 Year'
        };
        colMap = {};
        request.columns.forEach(col => colMap[col.columnKey] = col);

        TestBed.configureTestingModule({
            declarations: [ExploreExpostTimeSeriesChartComponent],
            imports: [AladdinAngularComponentsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ExploreExpostTimeSeriesChartComponent);
        component = fixture.componentInstance;
        component.widgetPayload = widgetPayload;

        setupHighchartsSpy.mockImplementation(() => component.hc);
        generateOptionsSpy.mockImplementation(() => Highcharts.getOptions());

        component.widget = new Widget(WidgetConfigType.EXPOST_TIME_SERIES);
        component['setInternalState'](widgetPayload);
        component['colsMap'] = colMap;
        const simpleChanges: SimpleChanges = {
            widget: new SimpleChange(undefined, new Widget(WidgetConfigType.EXPOST_TIME_SERIES), true),
            widgetPayload: new SimpleChange(undefined, widgetPayload, true)
        };
        component.ngOnChanges(simpleChanges);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('creates chart config', () => {
        const measures = [
            {name: 'ExpostTE', title: 'Ex-post Tracking Error', aggMethod: 'sum'}
        ];
        expect(component.createChartConfig(measures)).toEqual({
            'groupBy': [
                'date',
            ],
            'measures': [
                {
                    'aggMethod': 'sum',
                    'axis': undefined,
                    'name': 'ExpostTE',
                    'title': 'Ex-post Tracking Error',
                },
            ],
        });
    });

    it('creates chart options', () => {
        component.customVizConfig = {secondaryYAxis: 'pct_mv_1'};
        const config = component.createChartConfig([{
            name: 'ExpostTE',
            title: 'Ex-post Tracking Error',
            aggMethod: 'sum'
        }]);
        expect(component.createChartOptions(config)).toMatchObject({
            'chart': {
                'animation': false,
                'events': {},
                'zoomType': 'xy',
            },
            'colors': undefined,
            'credits': {
                'enabled': false,
            },
            'exporting': {
                'enabled': false,
            },
            'hideLegendToggle': undefined,
            'legend': {
                'align': 'center',
                'enabled': true,
                'itemMarginTop': 3.5,
                'maxHeight': 100,
            },
            'plotOptions': {
                'line': {
                    'marker': {
                        'enabled': null,
                    },
                },
                'series': {
                    'dataLabels': {
                        'enabled': false,
                    },
                    'tooltip': {
                        'headerFormat': '',
                    },
                },
            },
            'title': {
                'text': null,
            },
            'xAxis': {
                'endOnTick': false,
                'gridLineWidth': 0,
                'labels': {},
            },
            'yAxis': [
                {
                    'alignTicks': true,
                    'endOnTick': true,
                    'labels': {},
                    'max': undefined,
                    'min': undefined,
                    'opposite': false,
                    'showLastLabel': true,
                    'startOnTick': true,
                    'tickInterval': undefined,
                    'title': {
                        'text': 'Ex-post Tracking Error',
                    },
                },
                {
                    'alignTicks': true,
                    'endOnTick': true,
                    'labels': {},
                    'max': undefined,
                    'min': undefined,
                    'opposite': true,
                    'showLastLabel': true,
                    'startOnTick': true,
                    'tickInterval': undefined,
                    'title': {
                        'text': undefined,
                    },
                }
            ],
        });
    });

    it('should format the tooltip points', () => {
        const point = {
            name: 'ExpostTE',
            category: '24-FEB-2017',
            qbstr: {
                measureName: 'ExpostTE'
            },
            y: 0.962044
        } as any;
        expect(component.tooltipPointFormatter(point)).toMatchSnapshot();
    });

    it('should format the tooltip points when sampling and statistic period undefined', () => {
        const point = {
            name: 'ExpostTE',
            category: '24-FEB-2017',
            qbstr: {
                measureName: 'ExpostTE'
            },
            y: 0.962044
        } as any;
        component.customVizConfig.samplingPeriod = undefined;
        component.customVizConfig.statisticPeriod = undefined;
        expect(component.tooltipPointFormatter(point)).toMatchSnapshot();
    });

    describe('Test enriching for line Chart', () => {
        let cube;

        beforeEach(() => {
            cube = new SimpleCube([]);
        });

        it('should enrich cube', () => {
            component['colsMap']['CumRetAnn'] = {
                columnKey: 'CumRetAnn'
            } as any;
            const chartConfig: LineChartConfig<any> = {
                measures: [{name: 'ExpostTE', title: 'Ex-post Tracking Error', aggMethod: 'sum'},
                    {name: 'ExpostTE', title: 'Ex-post Tracking Error', aggMethod: 'sum'},
                    {name: 'CumRetAnn', title: 'Annualized Total Return', aggMethod: 'sum'},
                    {name: 'CumRetAnn', title: 'Annualized Total Return', aggMethod: 'sum'}],
                groupBy: ['date']
            };
            cube.set(createQK([new GroupByKey('_ROOT_')]), [1, 2]);
            component['enrichCube'](cube, chartConfig, [new GroupByKey('_ROOT_')]);
            const sbsc = cube.get(createQK([new GroupByKey('_ROOT_'), new GroupByKey('date'), new AggregationKey('ExpostTE', 'sum'), new AggregationKey('CumRetAnn', 'sum')])).subscribe(data => {
                expect(data).toEqual([1, 2]);
            });
            sbsc.unsubscribe();
        });
    });

    describe('Test seriesLableFormatter method', () => {
        let series;

        it('should format the legend labels for expost time series chart - column level not overridden', () => {
            // setup
            series = {
                name: 'Ex-post Tracking Error'
            } as any;

            // action and validate
            expect(component.seriesLableFormatter(series)).toEqual('Ex-post Tracking Error(1 Month,1 Year)');
        });

        it('should format the legend labels for expost time series chart - expost column option exist but not expostSettings', () => {
            // setup
            const column = component['colsMap']['ExpostTE'];
            column['expostSettings'] = new ExpostColumnOption();
            series = {
                name: 'Ex-post Tracking Error'
            } as any;

            // action and validate
            expect(component.seriesLableFormatter(series)).toEqual('Ex-post Tracking Error(1 Month,1 Year)');
        });

        it('should format the legend labels for expost time series chart - invalid expostSettings exist in expost column option', () => {
            // setup
            const column = component['colsMap']['ExpostTE'];
            const expostColOption = new ExpostColumnOption();
            expostColOption.expostSettings = new ExpostSettings();
            column['expostSettings'] = expostColOption;
            series = {
                name: 'Ex-post Tracking Error'
            } as any;

            // action and validate
            expect(component.seriesLableFormatter(series)).toEqual('Ex-post Tracking Error(1 Month,1 Year)');
        });

        it('should format the legend labels for expost time series chart - valid expostSettings exist in expost column option', () => {
            // setup
            const column = component['colsMap']['ExpostTE'];
            const samplingPeriod = new TimePeriod('1 Day', 1, 'Days');
            const statisticPeriod = new TimePeriod('1 Month', 1, 'Months');
            const expostSettings = new ExpostSettings();
            expostSettings.samplingPeriod = samplingPeriod;
            expostSettings.statisticPeriods = [statisticPeriod];
            const expostColOption = new ExpostColumnOption();
            expostColOption.expostSettings = expostSettings;
            column['expostSettings'] = expostColOption;
            series = {
                name: 'Ex-post Tracking Error'
            } as any;

            // action and validate
            expect(component.seriesLableFormatter(series)).toEqual('Ex-post Tracking Error(1 Day,1 Month)');
        });

        it('should not format the legend labels is sampling period or statistic period is undefined', () => {
            // setup
            series = {
                name: 'Ex-post Tracking Error'
            } as any;

            // when both are undefined
            component.customVizConfig.samplingPeriod = undefined;
            component.customVizConfig.statisticPeriod = undefined;
            // action and validate
            expect(component.seriesLableFormatter(series)).toEqual('Ex-post Tracking Error');

            // when samplingPeriod is undefined
            component.customVizConfig.samplingPeriod = undefined;
            component.customVizConfig.statisticPeriod = '1 Year';
            // action and validate
            expect(component.seriesLableFormatter(series)).toEqual('Ex-post Tracking Error');

            // when statisticPeriod is undefined
            component.customVizConfig.samplingPeriod = '1 Month';
            component.customVizConfig.statisticPeriod = undefined;
            // action and validate
            expect(component.seriesLableFormatter(series)).toEqual('Ex-post Tracking Error');
        });

        it('Test appendScalingToSecondaryAxisLabel', () => {
            expect(component['appendScalingToSecondaryAxisLabel'](null)).toEqual('');
            expect(component['appendScalingToSecondaryAxisLabel'](CoreCommonConstants.BASIS_POINT)).toEqual('<br/> ' + CoreCommonConstants.BASIS_POINT);
        });
    });
});
