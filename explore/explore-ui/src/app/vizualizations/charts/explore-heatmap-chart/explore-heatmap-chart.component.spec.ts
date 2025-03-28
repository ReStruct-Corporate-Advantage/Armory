import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {data1} from '@mocks/test-data/qbstr-test-data';
import {ReactiveCube, SimpleCube} from '@qbstr/data-cube-reactive';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {ExploreHeatmapChartComponent} from './explore-heatmap-chart.component';
import {ROOT_LEVEL} from '@utils/qbstr';
import {Widget} from '@models/widget/widget.model';
import {SimpleChange, SimpleChanges} from '@angular/core';
import {TestUtils} from '@utils/test.utils';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import * as hcCore from '@qbstr/highcharts-core';
import Highcharts, {Chart} from 'highcharts';
import {ChartSettings} from '@models/widget/inputs/chart-settings/chart-settings.model';
import {ColorScaleMidpointOption} from '@enums/color-scale-midpoint-option';
import {ColorScaleGradientOption} from '@enums/color-scale-gradient-option.enum';
import {ColorScaleFormatOption} from '@enums/color-scale-format-option';
import {GroupByKey} from '@qbstr/data-cube';
import {HeatmapChartConfig} from '@qbstr/highcharts-api';

describe('ExploreHeatmapChartComponent', () => {
    let component: ExploreHeatmapChartComponent;
    let fixture: ComponentFixture<ExploreHeatmapChartComponent>;
    let widgetPayload: WidgetPayload;

    const setupHighchartsSpy = jest.spyOn(hcCore, 'setupHighcharts');
    const generateOptionsSpy = jest.spyOn(hcCore, 'generateOptions');

    const chart: any = {
        series: [
            {
                setData: jest.fn()
            }
        ],
        addData: jest.fn(),
        addSeries: jest.fn(),
        update: jest.fn()
    };

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeAll(() => {
        const request = {
            portfolio: 'PEP',
            columns: [
                {
                    columnKey: 'cusip_0',
                    columnTitle: 'cusip_0',
                    formatter: undefined,
                    dataType: 'STRING',
                    columnTag: 'cusip_0',
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'pct_mv_1',
                    columnTitle: 'pct_mv_1',
                    formatter: {format: () => ''},
                    dataType: 'DOUBLE',
                    columnTag: 'pct_mv_1',
                    isHidden: false,
                    isSubtotalable: true
                },
                {
                    columnKey: 'security_description_1',
                    columnTitle: 'security_description_1',
                    formatter: {format: () => ''},
                    dataType: 'STRING',
                    columnTag: 'security_description_1',
                    isHidden: false,
                    isSubtotalable: true
                },
            ]
        };
        widgetPayload = {
            widgetConfigType: WidgetConfigType.BAR,
            requestConfig: request,
            responseConfig: data1.data as any,
            cube: new ReactiveCube<any>([]),
            breakdownLevels: [ROOT_LEVEL, 'level-1'],
            customVizConfig: {
                isXAxis: true,
                isYAxis: false,
                colorScaleFormat: ColorScaleFormatOption.THREE_COLOR_SCALE,
                colorScaleMidpoint: ColorScaleMidpointOption.ZERO_CENTERED,
                colorScaleColors: ColorScaleGradientOption.RED_TO_GREEN
            }
        };
        chart.colorAxis = [{min: -25000000, max: 75000000, update: jest.fn()}];
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ExploreHeatmapChartComponent],
            imports: [AladdinAngularComponentsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ExploreHeatmapChartComponent);
        component = fixture.componentInstance;
        component.widgetPayload = widgetPayload;
        component.widget = new Widget(WidgetConfigType.HEATMAP);

        setupHighchartsSpy.mockImplementation(() => component.hc);
        generateOptionsSpy.mockImplementation(() => Highcharts.getOptions());

        component['setInternalState'](widgetPayload);
        const simpleChanges: SimpleChanges = {
            widget: new SimpleChange(undefined, new Widget(WidgetConfigType.TREEMAP), true),
            widgetPayload: new SimpleChange(undefined, widgetPayload, true)
        };
        component.ngOnChanges(simpleChanges);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should test formatter #1', () => {
        jest.spyOn(component, 'getShowLegendAndLabel').mockReturnValue([false, false]);
        const chartOptions = component['createChartOptions']();
        const testObj = {
            point: undefined,
            value: 1,
            formatter: chartOptions['colorAxis']
        };
        expect(testObj.formatter).toBeDefined();
        expect(chartOptions.title).toStrictEqual({'align': 'left', 'text': null});
    });


    it('should test formatter #2', () => {
        const chartOptions = component['createChartOptions']();
        const testObj = {
            point: {
                value: 1,
                qbstr: {
                    measureName: 'pct_mv_1',
                    negative: false
                }
            },
            value: 1,
            formatter: chartOptions['format']
        };
        expect(testObj.formatter).toBeUndefined();
    });

    it('should test formatter #3', () => {
        const chartOptions = component['createChartOptions']();
        const testObj = {
            point: {
                value: 1,
                qbstr: {
                    measureName: 'pct_mv_1',
                    negative: true
                }
            },
            value: 1,
            formatter: chartOptions['format']
        };
        expect(testObj.formatter).toBeUndefined();
    });

    it('storeChangedChartState', () => {
        const chartSettings = new ChartSettings();
        chartSettings.labelShow = false;
        chartSettings.legendShow = false;
        component.widget.displayInputs.set(ChartSettings.CHART_SETTINGS, chartSettings);
        component.storeChangedChartState({label: false});
        let settings = component.widget.displayInputs.get(ChartSettings.CHART_SETTINGS) as ChartSettings;
        expect(settings.labelShow).toBe(false);

        component.storeChangedChartState({label: true});
        settings = component.widget.displayInputs.get(ChartSettings.CHART_SETTINGS) as ChartSettings;
        expect(settings.labelShow).toBe(true);

        const setTitleMock = jest.fn();
        component.chart = {} as Chart;
        component.chart.setTitle = setTitleMock;
        component.chart.setSubtitle = setTitleMock;
        component.storeChangedChartState({legend: false});
        settings = component.widget.displayInputs.get(ChartSettings.CHART_SETTINGS) as ChartSettings;
        expect(settings.legendShow).toBe(false);

        component.storeChangedChartState({legend: true});
        settings = component.widget.displayInputs.get(ChartSettings.CHART_SETTINGS) as ChartSettings;
        expect(settings.legendShow).toBe(true);

    });

    it('tests updateFormatterUnderChartType', () => {
        const formatter: any = () => {
        };
        let chartOptions: any = {plotOptions: {}};

        // case 1
        component.updateFormatterUnderChartType(chartOptions, formatter);
        expect(chartOptions.plotOptions.heatmap.dataLabels.formatter === formatter);

        // case 2
        chartOptions = {plotOptions: {dataLabels: {}}};
        component.updateFormatterUnderChartType(chartOptions, formatter);
        expect(chartOptions.plotOptions.heatmap.dataLabels.formatter === formatter);

        // case 3
        chartOptions = {plotOptions: {dataLabels: {formatter: undefined}}};
        component.updateFormatterUnderChartType(chartOptions, formatter);
        expect(chartOptions.plotOptions.heatmap.dataLabels.formatter === formatter);
    });

    it('tests createChartSpecificQbstrChartConfig', () => {
        const formatter: any = () => {
        };
        const chartOptions: any = {plotOptions: {}};
        const chartConfig: HeatmapChartConfig<any> = {
            measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}],
            groupBy: ['country'],
            breakdowns: ['country', 'sector'],
        };
        const cube = new SimpleCube([]);
        const configQbstr = component.createChartSpecificQbstrChartConfig(cube, chartConfig, chartOptions, [new GroupByKey('_ROOT_')]);
        expect(configQbstr).toMatchObject({
            'autoResizeDelay': -1,
            'chartConfig': {
                'breakdowns': [
                    'country',
                    'sector',
                ],
                'groupBy': [
                    'country',
                ],
                'measures': [
                    {
                        'aggMethod': 'sum',
                        'name': 'pct_mv_1',
                        'title': 'pct_mv_1',
                    },
                ],
            },
            'chartOptions': {
                'plotOptions': {},
            },
            'data': {
                'underlyingCube': {
                    '_config': {
                        'aggregationFunctions': {},
                        'customColumnFunctions': {},
                        'filterFunctions': {},
                        'groupByFunctions': {},
                        'saveOnCollect': true,
                        'shouldLowerCaseStringFilters': false,
                        'sortingFunctions': {
                        },
                    },
                },
            },
            'defaultQueryKeyEntries': [
                {
                    'field': '_ROOT_',
                    'type': 'groupBy',
                },
            ],
            'type': 'heatmap',
        });
        const api: any = { data: mockData, chart };
        expect(configQbstr.updateSeriesBeforeChartingFn(api)).toEqual([
            {
                'animation': false,
                'className': 'highcharts-color-0',
                'colorIndex': 0,
                'data': [
                    {
                        'className': 'highcharts-color-0',
                        'colorIndex': 0,
                        'name': 'UK',
                        'x': 2020,
                        'y': 1000000,
                    },
                ],
                'name': 'UK',
                'type': 'bubble',
            },
            {
                'animation': false,
                'className': 'highcharts-color-1',
                'colorIndex': 1,
                'data': [
                    {
                        'className': 'highcharts-color-1',
                        'colorIndex': 1,
                        'name': 'UK',
                        'x': 2021,
                        'y': 900000,
                    },
                ],
                'name': 'UK',
                'type': 'bubble',
            },
            {
                'animation': false,
                'className': 'highcharts-color-2',
                'colorIndex': 2,
                'data': [
                    {
                        'className': 'highcharts-color-2',
                        'colorIndex': 2,
                        'name': 'Hungary',
                        'x': 2021,
                        'y': 300000,
                    },
                ],
                'name': 'Hungary',
                'type': 'bubble',
            },
            {
                'animation': false,
                'className': 'highcharts-color-3',
                'colorIndex': 3,
                'data': [
                    {
                        'className': 'highcharts-color-3',
                        'colorIndex': 3,
                        'name': 'Hungary',
                        'x': 2020,
                        'y': 200000,
                    },
                ],
                'name': 'Hungary',
                'type': 'bubble',
            },
        ]);
    });
});
const mockData = [
    {
        name: 'UK',
        type: 'bubble',
        data: [{name: 'UK', x: 2020, y: 1000000, className: 'highcharts-color-0', colorIndex: 0, }, ],
        animation: false,
        className: 'highcharts-color-0',
        colorIndex: 0,
    },
    {
        name: 'UK',
        type: 'bubble',
        data: [{name: 'UK', x: 2021, y: 900000, className: 'highcharts-color-1', colorIndex: 1, }, ],
        animation: false,
        className: 'highcharts-color-1',
        colorIndex: 1,
    },
    {
        name: 'Hungary',
        type: 'bubble',
        data: [{name: 'Hungary', x: 2021, y: 300000, className: 'highcharts-color-2', colorIndex: 2, }, ],
        animation: false,
        className: 'highcharts-color-2',
        colorIndex: 2,
    },
    {
        name: 'Hungary',
        type: 'bubble',
        data: [{name: 'Hungary', x: 2020, y: 200000, className: 'highcharts-color-3', colorIndex: 3, }, ],
        animation: false,
        className: 'highcharts-color-3',
        colorIndex: 3,
    },
];
