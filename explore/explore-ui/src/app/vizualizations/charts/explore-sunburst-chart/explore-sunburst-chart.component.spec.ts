import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ExploreSunburstChartComponent} from './explore-sunburst-chart.component';
import {data1} from '@mocks/test-data/qbstr-test-data';
import {ReactiveCube} from '@qbstr/data-cube-reactive';
import {TestUtils} from '@utils/test.utils';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {QueryKey, QueryKeyEntry} from '@qbstr/data-cube';
import {SimpleChange, SimpleChanges} from '@angular/core';
import {Widget} from '@models/widget/widget.model';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import * as hcCore from '@qbstr/highcharts-core';
import Highcharts from 'highcharts';
import {set} from 'lodash';

describe('ExploreSunburstChartComponent', () => {
    let component: ExploreSunburstChartComponent;
    let fixture: ComponentFixture<ExploreSunburstChartComponent>;
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
                }
            ]
        };
        widgetPayload = {widgetConfigType: WidgetConfigType.PIE};
        widgetPayload.requestConfig = request;
        widgetPayload.breakdownLevels = [''];
        widgetPayload.responseConfig = data1.data as any;
        widgetPayload.customVizConfig = {
            showGridLines: 'true',
        };
        widgetPayload.cube = new ReactiveCube<any>([]);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AladdinAngularComponentsModule],
            declarations: [ExploreSunburstChartComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ExploreSunburstChartComponent);
        component = fixture.componentInstance;
        component.chartConfig = {
            topLevelName: 'PEP',
            groupBy: ['level-1'],
            measures: [{name: 'pct_mv_1', aggMethod: 'sum'}]
        };
        component.widgetPayload = widgetPayload;

        setupHighchartsSpy.mockImplementation(() => component.hc);
        generateOptionsSpy.mockImplementation(() => Highcharts.getOptions());

        const simpleChanges: SimpleChanges = {
            widget: new SimpleChange(undefined, new Widget(WidgetConfigType.PIE), true),
            widgetPayload: new SimpleChange(undefined, widgetPayload, true)
        };
        component.ngOnChanges(simpleChanges);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('creates chart config from measures', () => {
        const measures = [{name: 'pct_mv_1', aggMethod: 'sum'}];
        expect(component.createChartConfig(measures)).toEqual({
            'breadcrumbs': {
                'separator': '&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;',
                'topNames': [
                    'pct_mv_1',
                    'Security Group',
                ],
            },
            'groupBy': [],
            'measures': [
                {
                    'aggMethod': 'sum',
                    'name': 'pct_mv_1',
                },
            ],
            'topLevelName': undefined,
            'useAbsoluteValue': true,
        });
    });

    it('creates chart options', () => {
        expect(component.createChartOptions()).toMatchObject({
            'chart': {
                'animation': false,
                'events': {
                },
                'zoomType': 'xy',
            },
            'colors': [
                '0x0998f6',
                '0xcb2cc0',
                '0x26d9ba',
                '0xff8900',
                '0x9952e0',
                '0xf8e71c',
                '0xfd4f03',
                '0x9fd926',
                '0x888f9a',
            ],
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
                        'enabled': true,
                    },
                    'tooltip': {
                    },
                },
            },
            'series': [
                {
                    'allowDrillToNode': true,
                    'cursor': 'pointer',
                    'data': [],
                    'dataLabels': {
                        'filter': {
                            'operator': '>',
                            'property': 'innerArcLength',
                            'value': 16,
                        },
                        'rotationMode': 'auto',
                        'useHTML': true,
                    },
                    'levels': [
                        {
                            'dataLabels': {
                                'filter': {
                                    'operator': '>',
                                    'property': 'outerArcLength',
                                    'value': 64,
                                },
                            },
                            'level': 1,
                            'levelIsConstant': false,
                        },
                        {
                            'colorByPoint': true,
                            'level': 1,
                        },
                        {
                            'colorVariation': {
                                'key': 'brightness',
                                'to': -0.5,
                            },
                            'level': 2,
                        },
                        {
                            'colorVariation': {
                                'key': 'brightness',
                                'to': 0.5,
                            },
                            'level': 3,
                        },
                    ],
                    'type': 'sunburst',
                },
            ],
            'title': {
                'text': null,
            },
            'xAxis': {
                'gridLineWidth': 1,
            },
            'yAxis': {
                'labels': {
                },
                'title': {
                    'text': '',
                },
            },
        });
    });

    it('test initializeColors', () => {
        component.chartOptions.colors = ['a', 'b', 'c'];
        expect(component.initializeColors(component.chartOptions)).toStrictEqual(['a', 'b', 'c']);

        // when colors are undefined
        component.chartOptions.colors = undefined;
        expect(component.initializeColors(component.chartOptions)).toStrictEqual(['0x0998f6', '0xcb2cc0', '0x26d9ba', '0xff8900', '0x9952e0', '0xf8e71c', '0xfd4f03', '0x9fd926', '0x888f9a']);
    });


    it('test clear is called', () => {
        jest.spyOn(component, 'clear');
        component.widgetPayload = widgetPayload;
        expect(component.clear).toHaveBeenCalled();
    });

    it('test clear deletes the enrich keys', () => {
        const queryKeyEntry = new class implements QueryKeyEntry {
            field: string;
            type: string;

            hash(): string {
                return '123';
            }

            isEmpty(): boolean {
                return false;
            }
        };
        const queryKey = new QueryKey([queryKeyEntry]);
        component.enrichKeys.push(queryKey) ;
        component.cube.set(queryKey, null);
        component.clear();
        expect(component.enrichKeys.length).toBe(0);
    });

    it('should format the tooltip points', () => {
        component['firstCol'] = {
            columnKey: 'pct_mv_1',
            columnTitle: 'pct_mv_1',
            formatter: {format: () => ''},
            dataType: 'DOUBLE',
            columnTag: 'pct_mv_1',
            isSubtotalable: true,
            isHidden: false
        };
        const point = {name: 'CASH', category: '24-FEB-2017', series: {name: 'CASH'}, value: 0.962044};
        expect(component.tooltipPointFormatter(point)).toMatchSnapshot();
    });

    it('should test dataLabelFormatter', () => {
        const chartOptions = component.createChartOptions();

        const style = {
            width: 160
        };

        chartOptions.series[0]['levels'][0].dataLabels.point = { name: 'Consumer Products', value: 3.5 };

        set(chartOptions.series[0]['levels'][0].dataLabels, 'series.chart.options.plotOptions.sunburst.dataLabels.enabled', true);

        expect(chartOptions.series[0]['levels'][0].dataLabels.formatter({style})).toBe(`<div style="text-align: center">
                        <tspan style="font-weight: bold;">Consumer Products</tspan>
                    </div>`);

        style.width = 120;
        expect(chartOptions.series[0]['levels'][0].dataLabels.formatter({style})).toBe(`<div style="text-align: center">
                        <tspan style="font-weight: bold;">Consumer Pro...</tspan>
                    </div>`);

        style.width = 17;
        expect(chartOptions.series[0]['levels'][0].dataLabels.formatter({style})).toBe(`<div style="text-align: center">
                        <tspan style="font-weight: bold;">...</tspan>
                    </div>`);
    });

});
