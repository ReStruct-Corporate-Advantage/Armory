import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {TestUtils} from '@utils/test.utils';
import {data1} from '@mocks/test-data/qbstr-test-data';
import {ReactiveCube} from '@qbstr/data-cube-reactive';
import {TreemapChartConfig} from '@qbstr/highcharts-api';
import {ExploreTreemapChartComponent} from './explore-treemap-chart.component';
import {Widget} from '@models/widget/widget.model';
import {SimpleChange, SimpleChanges} from '@angular/core';
import {ROOT_LEVEL} from '@utils/qbstr';
import {AggregationKey, createQK, GroupByKey} from '@qbstr/data-cube';
import {SimpleCube} from '@qbstr/data-cube-reactive';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {set} from 'lodash';
import Highcharts from 'highcharts';
import * as hcCore from '@qbstr/highcharts-core';
import {ExploreHighchartsBreadcrumbsUtils} from '../explore-highcharts-breadcrumbs.utils';
import {ColorScaleMidpointOption} from '@enums/color-scale-midpoint-option';
import {ColorScaleFormatOption} from '@enums/color-scale-format-option';
import {ColorScaleGradientOption} from '@enums/color-scale-gradient-option.enum';

describe('ExploreTreemapChartComponent', () => {
    let component: ExploreTreemapChartComponent;
    let fixture: ComponentFixture<ExploreTreemapChartComponent>;
    let widgetPayload: WidgetPayload;

    const setupHighchartsSpy = jest.spyOn(hcCore, 'setupHighcharts');
    const generateOptionsSpy = jest.spyOn(hcCore, 'generateOptions');

    beforeAll((done) => {
        TestUtils.initialize(done);
        const request = {
            portfolio: 'PEP',
            columns: [
                {
                    columnKey: 'cusip_0',
                    columnTitle: 'cusip_0',
                    formatter: undefined,
                    dataType: 'STRING',
                    columnTag: 'cusip_0',
                    isSubtotalable: false,
                    isHidden: false
                },
                {
                    columnKey: 'pct_mv_1',
                    columnTitle: 'pct_mv_1',
                    formatter: {format: () => ''},
                    dataType: 'DOUBLE',
                    columnTag: 'pct_mv_1',
                    isSubtotalable: true,
                    isHidden: false
                },
                {
                    columnKey: 'security_description_1',
                    columnTitle: 'security_description_1',
                    formatter: {format: () => ''},
                    dataType: 'STRING',
                    columnTag: 'security_description_1',
                    isSubtotalable: false,
                    isHidden: false
                },
            ]
        };

        const request2 = {
            'columns': [{
                'columnTag': 'market_val',
                'columnKey': 'market_val_639c2c1e02164d1',
                'columnTitle': 'Market Value',
                'dataType': 'DOUBLE',
                'isHidden': false,
                'isSubtotalable': true,
                'formatter': {format: () => ''}
            }, {
                'columnTag': 'pct_mv',
                'columnKey': 'pct_mv_4c8809b666ef486',
                'columnTitle': 'Market Value %',
                'dataType': 'DOUBLE',
                'isHidden': false,
                'isSubtotalable': true,
                'formatter': {format: () => ''}
            }],
            'splitColumns': [{
                'columnTag': 'market_val',
                'columnKey': 'market_val_639c2c1e02164d1',
                'columnTitle': 'Market Value',
                'dataType': 'DOUBLE',
                'isHidden': false,
                'isSubtotalable': true,
                'formatter': {format: () => ''}
            }, {
                'columnTag': 'pct_mv',
                'columnKey': 'pct_mv_4c8809b666ef486',
                'columnTitle': 'Market Value %',
                'dataType': 'DOUBLE',
                'isHidden': false,
                'isSubtotalable': true,
                'formatter': {format: () => ''}
            }],
            'portfolio': 'PEP'
        };

        widgetPayload = {widgetConfigType: WidgetConfigType.TREEMAP};
        widgetPayload.requestConfig = request2;
        widgetPayload.breakdownLevels = ['_ROOT_', 'level-1', 'level-2'];
        widgetPayload.responseConfig = data1.data as any;
        widgetPayload.cube = new ReactiveCube<any>([]);
        widgetPayload.customVizConfig = {
            showGridLines: 'true',
            colorScaleFormat: ColorScaleFormatOption.THREE_COLOR_SCALE,
            colorScaleMidpoint: ColorScaleMidpointOption.ZERO_CENTERED,
            colorScaleColors: ColorScaleGradientOption.RED_TO_GREEN
        };
    });

    let cube;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AladdinAngularComponentsModule],
            declarations: [ExploreTreemapChartComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        cube = new SimpleCube([]);

        fixture = TestBed.createComponent(ExploreTreemapChartComponent);
        component = fixture.componentInstance;
        component.chartConfig = {
            topLevelName: 'PEP',
            breakdowns: ['level-1', 'level-2'],
            measures: [
                {name: 'market_val_639c2c1e02164d1', title: 'Market Value', aggMethod: 'sum'},
                {name: 'pct_mv_4c8809b666ef486', title: 'Market Value %', aggMethod: 'sum'}
            ]
        };
        component.widgetPayload = widgetPayload;

        setupHighchartsSpy.mockImplementation(() => component.hc);
        generateOptionsSpy.mockImplementation(() => Highcharts.getOptions());

        component.widget = new Widget(WidgetConfigType.TREEMAP);
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

    it('creates chart config from measures 1', () => {
        const measures = [
            {name: 'market_val_639c2c1e02164d1', title: 'Market Value', aggMethod: 'sum'},
            {name: 'pct_mv_4c8809b666ef486', title: 'Market Value %', aggMethod: 'sum'}
        ];
        expect(component.createChartConfig(measures)).toMatchSnapshot();
    });

    it('creates chart config from measures 2', () => {
        component.breakdownLevels = [ROOT_LEVEL];
        const measures = [
            {name: 'market_val_639c2c1e02164d1', title: 'Market Value', aggMethod: 'sum'},
            {name: 'pct_mv_4c8809b666ef486', title: 'Market Value %', aggMethod: 'sum'}
        ];
        const actual = component.createChartConfig(measures);
        expect(actual).toMatchSnapshot();
        expect(component.defaultQueryKey[0]['hashId']).toEqual(new GroupByKey(ROOT_LEVEL).hashId);
    });

    it('creates chart config from measures 3', () => {
        component.customVizConfig.isComparisonMode = true;
        component.breakdownLevels = ['level-1'];
        const measures = [
            {name: 'market_val_639c2c1e02164d1', title: 'Market Value', aggMethod: 'sum'},
            {name: 'pct_mv_4c8809b666ef486', title: 'Market Value %', aggMethod: 'sum'}
        ];
        expect(component.createChartConfig(measures)).toMatchSnapshot();
    });

    it('creates chart options', () => {
        expect(component.createChartOptions()).toMatchObject({
            'chart': {
                'animation': false,
                'events': {},
                'zoomType': 'xy',
            },
            'colorAxis': {
                'labels': {
                    'overflow': 'allow',
                },
                'stops': [
                    [
                        0,
                        '#CDEAFE',
                    ],
                    [
                        1,
                        '#0998F6',
                    ],
                ],
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
                'series': {
                    'dataLabels': {
                        'className': 'datalabelTreemap',
                    },
                },
            },
            'series': [
                {
                    'allowDrillToNode': true,
                    'borderWidth': 1,
                    'colorByPoint': true,
                    'cursor': 'pointer',
                    'data': [],
                    'layoutAlgorithm': 'squarified',
                    'levelIsConstant': true,
                    'levels': [
                        {
                            'dataLabels': {
                                'enabled': true,
                            },
                            'level': 1,
                        },
                    ],
                    'name': 'Top',
                    'turboThreshold': 0,
                    'type': 'treemap',
                },
            ],
            'title': {
                'text': 'Market Value %',
                'verticalAlign': 'bottom',
            },
            'tooltip': {
                'padding': 0,
                'useHTML': true,
            },
            'xAxis': {
                'gridLineWidth': 1,
            },
            'yAxis': {
                'labels': {},
                'title': {
                    'text': '',
                },
            },
        });
    });

    it('enrich cube', () => {

        const chartConfig: TreemapChartConfig = {
            measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}],
            groupBy: ['country'],
            breakdowns: ['country', 'sector'],
        };
        component.customVizConfig.isComparisonMode = false;
        cube.set(createQK([new GroupByKey('sector'), new AggregationKey('pct_mv_1', 'sum')]), [1]);
        component.enrichCube(cube, {
            measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}],
            groupBy: [],
            breakdowns: [],
        }, []);
        component.enrichCube(cube, chartConfig, []);
        cube.get(createQK([new GroupByKey('sector'), new GroupByKey('country'), new AggregationKey('pct_mv_1', 'sum')])).subscribe(data => {
            expect(data).toEqual([1]);
        });
    });

    it('should enrich cube #2', () => {
        component['colsMap']['market_val_0|PEP'] = {
            columnKey: 'market_val_0|PEP'
        } as any;
        component['colsMap']['market_val_0|IP'] = {
            columnKey: 'market_val_0|IP'
        } as any;

        component['colsMap']['notional_mv_1|PEP'] = {
            columnKey: 'notional_mv_1|PEP'
        } as any;
        component['colsMap']['notional_mv_1|IP'] = {
            columnKey: 'notional_mv_1|IP'
        } as any;

        component.customVizConfig.isComparisonMode = true;
        component.breakdownLevels = ['_ROOT_'];
        const chartConfig: TreemapChartConfig = {
            measures: [{name: 'market_val_0|PEP', title: 'Market Value', aggMethod: 'sum'}, {
                name: 'market_val_0|IP',
                title: 'Market Value',
                aggMethod: 'sum'
            },
                {
                    name: 'notional_mv_1|PEP',
                    title: 'Notional Market Value',
                    aggMethod: 'sum'
                }, {name: 'notional_mv_1|IP', title: 'Notional Market Value', aggMethod: 'sum'}],
            groupBy: [],
            colorMeasure: {name: 'market_val_0|IP', title: 'Market Value', aggMethod: 'sum'},
            breakdowns: []
        };
        const totalCK = [new GroupByKey('_ROOT_'), new AggregationKey('market_val_0|PEP', 'sum'), new AggregationKey('market_val_0|IP', 'sum'),
            new AggregationKey('notional_mv_1|PEP', 'sum'), new AggregationKey('notional_mv_1|IP', 'sum')];
        cube.set(createQK(totalCK), [{
            'market_val_0|PEP': 1,
            'market_val_0|IP': 2,
            'notional_mv_1|PEP': 3,
            'notional_mv_1|IP': 4,
            '_ROOT_': 'PEP',
            'level-1': 'ind'
        }]);
        component.enrichCube(cube, chartConfig, [new GroupByKey('_ROOT_')]);
        cube.get(createQK([new GroupByKey('_ROOT_'), new AggregationKey('market_val_0', 'sum'), new AggregationKey('notional_mv_1', 'sum'), new GroupByKey('_splitKey')])).subscribe(data => {
            expect(data).toEqual([{
                market_val_0: 1,
                _splitKey: 'PEP',
                'level-1': 'ind',
                _ROOT_: 'PEP',
                notional_mv_1: 3
            }, {market_val_0: 2, _splitKey: 'IP', 'level-1': 'ind', _ROOT_: 'PEP', notional_mv_1: 4}]);
        });
    });

    describe('formatter Test', () => {
        let chartOptions;

        beforeEach(() => {
            chartOptions = component.createChartOptions();
        });

        describe('dataLabelFormatter Test', () => {
            const style = {
                color: 'contrast',
                fontSize: '11px',
                fontWeight: 'normal',
                textOutline: 'none',
                width: 151
            };

            const chartConfig: TreemapChartConfig = {
                measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}],
                groupBy: ['country'],
                breakdowns: ['country', 'sector'],
            };

            const chart: any = {
                series: [
                    {
                        setData: jest.fn(),
                        update: jest.fn()
                    }
                ],
                addData: jest.fn(),
                addSeries: jest.fn(),
                update: jest.fn()
            };
            beforeAll(() => {
                chart.colorAxis = [{min: -25000000, max: 75000000, update: jest.fn()}];
            });

            it('should test dataLabelFormatter', () => {
                // inside of dataLabelFormatter in createChartOptions, the context this is highchart, and adding the point is to workaround it.
                chartOptions.series[0]['levels'][0].dataLabels.point = {name: 'Communication Services', value: 245};

                set(chartOptions.series[0]['levels'][0].dataLabels, 'series.chart.options.plotOptions.treemap.dataLabels.enabled', true);

                expect(chartOptions.series[0]['levels'][0].dataLabels.formatter({style})).toBe(`<div style="text-align: center">
                        <tspan style="font-weight: bold;">Communication Services</tspan><br/>
                        <tspan style="font-weight: 200;"></tspan>
                    </div>`);

                style.width = 120;
                expect(chartOptions.series[0]['levels'][0].dataLabels.formatter({style})).toBe(`<div style="text-align: center">
                        <tspan style="font-weight: bold;">Communication Ser...</tspan><br/>
                        <tspan style="font-weight: 200;"></tspan>
                    </div>`);

                style.width = 17;
                expect(chartOptions.series[0]['levels'][0].dataLabels.formatter({style})).toBe(`<div style="text-align: center">
                        <tspan style="font-weight: bold;"></tspan><br/>
                        <tspan style="font-weight: 200;"></tspan>
                    </div>`);

                const configQbstr = component.createChartSpecificQbstrChartConfig(cube, chartConfig, chartOptions, [new GroupByKey('_ROOT_')]);

                expect(configQbstr).toMatchSnapshot();

                const api: any = {data: mockData, chart};

                expect(configQbstr.updateSeriesBeforeChartingFn(api)).toMatchSnapshot();

            });

            it('should display text with white color (and black on dark theme) if the point.color value are in the category', () => {
                chartOptions.series[0]['levels'][0].dataLabels.point = {
                    name: 'Electrical Equipment',
                    value: 245,
                    colorValue: -234987.483279579
                };
                component['maxColorValue'] = 235000;
                component['minColorValue'] = -235000;

                style.width = 43;

                set(chartOptions.series[0]['levels'][0].dataLabels, 'series.chart.options.plotOptions.treemap.dataLabels.enabled', true);

                expect(chartOptions.series[0]['levels'][0].dataLabels.formatter({style})).toBe(`
                            <div style="color: var(--focus-highlight_background-color); text-align: center">
                                <tspan style="font-weight: bold;">Elec...</tspan><br/>
                                <tspan style="font-weight: 200;"></tspan>
                            </div>`);
            });

            it('should display no text when datalabels are disabled', () => {
                chartOptions.series[0]['levels'][0].dataLabels.point = {
                    name: 'Electrical Equipment',
                    colorValue: -234987.483279579
                };
                component['maxColorValue'] = 235000;
                component['minColorValue'] = -235000;

                style.width = 43;

                set(chartOptions.series[0]['levels'][0].dataLabels, 'series.chart.options.plotOptions.treemap.dataLabels.enabled', false);

                expect(chartOptions.series[0]['levels'][0].dataLabels.formatter({style})).toEqual('');
            });

            it('should display no text when datalabels aren\'t enabled', () => {
                chartOptions.series[0]['levels'][0].dataLabels.point = {
                    name: 'Electrical Equipment',
                    colorValue: -234987.483279579
                };
                component['maxColorValue'] = 235000;
                component['minColorValue'] = -235000;

                style.width = 43;

                set(chartOptions.series[0]['levels'][0].dataLabels, 'series.chart.options.plotOptions.treemap', {});

                expect(chartOptions.series[0]['levels'][0].dataLabels.formatter({style})).toEqual('');
            });
        });


        it('should test toolTipFormatter', () => {
            // inside of toolTipFormatter in createChartOptions, the context this is highchart, and adding the point is to workaround it.
            chartOptions.tooltip.point = {
                name: 'Communication Services',
                value: 9568303.50379725,
                colorValue: 0.13950736798781777
            };

            jest.spyOn(component['firstCol'].formatter, 'format').mockReturnValue('9,568');
            jest.spyOn(component['colorMeasureCol'].formatter, 'format').mockReturnValue('14.0%');

            expect(chartOptions.tooltip.formatter()).toBe(`
                <div style="z-index:999; background-color: var(--input-box__background-color--disabled); padding: 8px;">
                    <tspan style="font-weight: bold">Communication Services</tspan><br/>
                    <tspan style="font-weight: bold">&nbsp;Market Value:</tspan>  9,568<br/>
                    <tspan style="font-weight: bold">&nbsp;Market Value %:</tspan>  14.0%
                </div>`);

            const request3 = {
                'columns': [{
                    'columnTag': 'market_val',
                    'columnKey': 'market_val_639c2c1e02164d1',
                    'columnTitle': 'Market Value',
                    'customAggregation': 'demo',
                    'dataType': 'DOUBLE',
                    'isHidden': false,
                    'isSubtotalable': true,
                    'formatter': {format: () => ''}
                }, {
                    'columnTag': 'pct_mv',
                    'columnKey': 'pct_mv_4c8809b666ef486',
                    'columnTitle': 'Market Value %',
                    'customAggregation': 'demo_two',
                    'dataType': 'DOUBLE',
                    'isHidden': false,
                    'isSubtotalable': true,
                    'formatter': {format: () => ''}
                }],
                'splitColumns': [{
                    'columnTag': 'market_val',
                    'columnKey': 'market_val_639c2c1e02164d1',
                    'columnTitle': 'Market Value',
                    'customAggregation': 'demo',
                    'dataType': 'DOUBLE',
                    'isHidden': false,
                    'isSubtotalable': true,
                    'formatter': {format: () => ''}
                }, {
                    'columnTag': 'pct_mv',
                    'columnKey': 'pct_mv_4c8809b666ef486',
                    'columnTitle': 'Market Value %',
                    'customAggregation': 'demo_two',
                    'dataType': 'DOUBLE',
                    'isHidden': false,
                    'isSubtotalable': true,
                    'formatter': {format: () => ''}
                }],
                'portfolio': 'PEP'
            };
            widgetPayload = {widgetConfigType: WidgetConfigType.TREEMAP};
            widgetPayload.requestConfig = request3;
            widgetPayload.breakdownLevels = ['_ROOT_', 'level-1', 'level-2'];
            widgetPayload.responseConfig = data1.data as any;
            widgetPayload.cube = new ReactiveCube<any>([]);
            widgetPayload.customVizConfig = {
                showGridLines: 'true',
            };
            component.widgetPayload = widgetPayload;
            component.widget = new Widget(WidgetConfigType.TREEMAP);
            component['setInternalState'](widgetPayload);
            const simpleChanges: SimpleChanges = {
                widget: new SimpleChange(undefined, new Widget(WidgetConfigType.TREEMAP), true),
                widgetPayload: new SimpleChange(undefined, widgetPayload, true)
            };
            component.ngOnChanges(simpleChanges);
            fixture.detectChanges();
            expect(chartOptions.tooltip.formatter()).toBe(`
                <div style="z-index:999; background-color: var(--input-box__background-color--disabled); padding: 8px;">
                    <tspan style="font-weight: bold">Communication Services</tspan><br/>
                    <tspan style="font-weight: bold">&nbsp;undefined:</tspan>  <br/>
                    <tspan style="font-weight: bold">&nbsp;undefined:</tspan>  ` + `
                </div>`);

        });

        // This test case will fail if we do not add the below logic in explore-chart.component.ts files createQbstrChartConfig() logic
        // we are missing one more OR condition to keep measure column in the filter
        // This was causing tooltip to break

        it('Fix toolTip for Stress P/L column', () => {
            chartOptions.tooltip.point = {
                name: 'Communication Services',
                value: 9568303.50379725,
                colorValue: 0.13950736798781777
            };

            jest.spyOn(component['firstCol'].formatter, 'format').mockReturnValue('9,568');
            jest.spyOn(component['colorMeasureCol'].formatter, 'format').mockReturnValue('14.0%');

            const request4 = {
                'columns': [
                    {
                        'originalColumnTitle': 'Stress P&L',
                        'columnKey': 'port_stress_pnl_5fa705028c234d6',
                        'columnTag': 'port_stress_pnl',
                        'columnTitle': 'Stress P&L',
                        'dataType': 'DOUBLE',
                        'isHidden': false,
                        'isSubtotalable': true,
                        'formatter': {format: () => ''}
                    },
                    {
                        'originalColumnTitle': 'Notional Market Value',
                        'columnKey': 'notional_mv_1',
                        'columnTag': 'notional_mv',
                        'columnTitle': 'Notional Market Value',
                        'dataType': 'DOUBLE',
                        'isHidden': false,
                        'isSubtotalable': true,
                        'formatter': {format: () => ''}
                    }
                ],
                'splitColumns': [
                    {
                        'originalColumnTitle': 'Stress P&L',
                        'columnKey': 'port_stress_pnl_5fa705028c234d6|Stock Market Drop Global',
                        'columnTag': 'port_stress_pnl',
                        'columnTitle': 'Stress P&L',
                        'dataType': 'DOUBLE',
                        'splitColumnHeaderName': 'Stress P&L',
                        'isHidden': false,
                        'isSubtotalable': true,
                        'formatter': {format: () => ''}
                    },
                    {
                        'originalColumnTitle': 'Stress P&L',
                        'columnKey': 'port_stress_pnl_5fa705028c234d6|Stock Market Drop US',
                        'columnTag': 'port_stress_pnl',
                        'columnTitle': 'Stress P&L',
                        'dataType': 'DOUBLE',
                        'splitColumnHeaderName': 'Stress P&L',
                        'isHidden': false,
                        'isSubtotalable': true,
                        'formatter': {format: () => ''}
                    },
                    {
                        'originalColumnTitle': 'Notional Market Value',
                        'columnKey': 'notional_mv_1',
                        'columnTag': 'notional_mv',
                        'columnTitle': 'Notional Market Value',
                        'dataType': 'DOUBLE',
                        'isHidden': false,
                        'isSubtotalable': true,
                        'formatter': {format: () => ''}
                    }
                ],
                'portfolio': 'LEH_AGG'
            };
            widgetPayload = {widgetConfigType: WidgetConfigType.TREEMAP};
            widgetPayload.requestConfig = request4;
            widgetPayload.breakdownLevels = ['_ROOT_', 'level-1', 'level-2'];
            widgetPayload.responseConfig = data1.data as any;
            widgetPayload.cube = new ReactiveCube<any>([]);
            widgetPayload.customVizConfig = {
                showGridLines: 'true',
                header: 'Stock Market Drop Global'
            };
            component.widgetPayload = widgetPayload;
            component.widget = new Widget(WidgetConfigType.TREEMAP);
            component['setInternalState'](widgetPayload);
            expect(chartOptions.tooltip.formatter()).toBe(`
                <div style="z-index:999; background-color: var(--input-box__background-color--disabled); padding: 8px;">
                    <tspan style="font-weight: bold">Communication Services</tspan><br/>
                    <tspan style="font-weight: bold">&nbsp;Stress P&L:</tspan>  <br/>
                    <tspan style="font-weight: bold">&nbsp;Notional Market Value:</tspan>  ` + `
                </div>`);
        });
    });

    it('should return breadcrumbs options with or without breakdown', () => {
        expect(component['getBreadcrumbsOptions']('Market Value')).toEqual({
            topNames: ['Market Value', 'Security Group'],
            separator: ExploreHighchartsBreadcrumbsUtils.breadcrumbsSeparator
        });

        component['breakdown'] = null;
        expect(component['getBreadcrumbsOptions']('Market Value')).toEqual({
            topNames: ['Market Value'],
            separator: ExploreHighchartsBreadcrumbsUtils.breadcrumbsSeparator
        });
    });
})
;

const mockData = [
    {
        name: 'UK',
        type: 'bubble',
        data: [{name: 'UK', x: 2020, y: 1000000, className: 'highcharts-color-0', colorIndex: 0,},],
        animation: false,
        className: 'highcharts-color-0',
        colorIndex: 0,
    },
    {
        name: 'UK',
        type: 'bubble',
        data: [{name: 'UK', x: 2021, y: 900000, className: 'highcharts-color-1', colorIndex: 1,},],
        animation: false,
        className: 'highcharts-color-1',
        colorIndex: 1,
    },
    {
        name: 'Hungary',
        type: 'bubble',
        data: [{name: 'Hungary', x: 2021, y: 300000, className: 'highcharts-color-2', colorIndex: 2,},],
        animation: false,
        className: 'highcharts-color-2',
        colorIndex: 2,
    },
    {
        name: 'Hungary',
        type: 'bubble',
        data: [{name: 'Hungary', x: 2020, y: 200000, className: 'highcharts-color-3', colorIndex: 3,},],
        animation: false,
        className: 'highcharts-color-3',
        colorIndex: 3,
    },
];
