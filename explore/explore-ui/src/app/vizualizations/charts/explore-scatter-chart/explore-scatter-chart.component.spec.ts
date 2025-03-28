import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange, SimpleChanges} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {data1} from '@mocks/test-data/qbstr-test-data';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {Widget} from '@models/widget/widget.model';
import {AggregationKey, createQK, GroupByKey} from '@qbstr/data-cube';
import {ReactiveCube, SimpleCube} from '@qbstr/data-cube-reactive';
import {BarChartConfig, BubbleChartConfig} from '@qbstr/highcharts-api';
import {ROOT_LEVEL} from '@utils/qbstr';
import {TestUtils} from '@utils/test.utils';
import {cloneDeep} from 'lodash';
import {TestScheduler} from 'rxjs/testing';
import {ExploreScatterChartComponent} from './explore-scatter-chart.component';
import * as hcCore from '@qbstr/highcharts-core';
import Highcharts from 'highcharts';


const request = {
    portfolio: 'PEP',
    columns: [
        {
            columnKey: 'market_val_639c2c1e02164d1',
            columnTitle: 'Market Value',
            formatter: {format: () => ''},
            dataType: 'DOUBLE',
            columnTag: 'market_val',
            isSubtotalable: true,
            isHidden: false
        },
        {
            columnKey: 'notional_mv_1',
            columnTitle: 'Notional Market Value',
            formatter: {format: () => ''},
            dataType: 'DOUBLE',
            columnTag: 'notional_mv',
            isSubtotalable: true,
            isHidden: false
        },
        {
            columnKey: 'quantity',
            columnTitle: 'Quantity',
            formatter: {format: () => ''},
            dataType: 'DOUBLE',
            columnTag: 'quantity',
            isSubtotalable: true,
            isHidden: false
        },
    ]
};

const setupHighchartsSpy = jest.spyOn(hcCore, 'setupHighcharts');
const generateOptionsSpy = jest.spyOn(hcCore, 'generateOptions');

describe('ExploreScatterChartComponent', () => {
    let component: ExploreScatterChartComponent;
    let fixture: ComponentFixture<ExploreScatterChartComponent>;
    let widgetPayload: WidgetPayload;
    let colMap: any;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {

        widgetPayload = {widgetConfigType: WidgetConfigType.SCATTER};
        widgetPayload.requestConfig = cloneDeep(request);
        widgetPayload.responseConfig = data1.data as any;
        widgetPayload.cube = new ReactiveCube<any>([]);
        widgetPayload.breakdownLevels = [ROOT_LEVEL, 'level-1'];
        widgetPayload.customVizConfig = {
            showGridLines: 'true',
        };
        colMap = {};
        request.columns.forEach(col => colMap[col.columnKey] = col);

        TestBed.configureTestingModule({
            declarations: [ExploreScatterChartComponent],
            imports: [AladdinAngularComponentsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ExploreScatterChartComponent);
        component = fixture.componentInstance;

        setupHighchartsSpy.mockImplementation(() => component.hc);
        generateOptionsSpy.mockImplementation(() => Highcharts.getOptions());

        component.widget = new Widget(WidgetConfigType.SCATTER);
        component.widgetPayload = widgetPayload;
        component['setInternalState'](widgetPayload);
        component.breakdownLevels = [ROOT_LEVEL, 'level-1'];
        component['colsMap'] = colMap;
        const simpleChanges: SimpleChanges = {
            widget: new SimpleChange(undefined, new Widget(WidgetConfigType.SCATTER), true),
            widgetPayload: new SimpleChange(undefined, widgetPayload, true)
        };
        component.ngOnChanges(simpleChanges);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('creates chart config from measures', () => {
        const measures = [
            {name: 'market_val_639c2c1e02164d1', title: 'Market Value', aggMethod: 'sum'},
            {name: 'notional_mv_1', title: 'Notional Market Value', aggMethod: 'sum'},
            {name: 'quantity', title: 'Quantity', aggMethod: 'sum'}
        ];
        expect(component.createChartConfig(measures)).toEqual({
            'breadcrumbs': {
                'separator': '&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;',
                'topNames': [
                    'Quantity',
                    'Security Group',
                ],
            },
            'drillDown': [],
            'groupBy': [
                'level-1',
            ],
            'groupByFirstLevel': undefined,
            'measures': [
                {
                    'aggMethod': 'sum',
                    'name': 'market_val_639c2c1e02164d1',
                    'title': 'Market Value',
                },
                {
                    'aggMethod': 'sum',
                    'name': 'notional_mv_1',
                    'title': 'Notional Market Value',
                },
                {
                    'aggMethod': 'sum',
                    'name': 'quantity',
                    'title': 'Quantity',
                },
            ],
        });
    });

    it('creates chart config from measures with no breakdowns', () => {
        const measures = [
            {name: 'market_val_639c2c1e02164d1', title: 'Market Value', aggMethod: 'sum'},
            {name: 'notional_mv_1', title: 'Notional Market Value', aggMethod: 'sum'},
            {name: 'quantity', title: 'Quantity', aggMethod: 'sum'}
        ];
        component.breakdownLevels = [];
        expect(component.createChartConfig(measures)).toEqual({
            'breadcrumbs': {
                'separator': '&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;',
                'topNames': [
                    'Quantity',
                    'Security Group',
                ],
            },
            'drillDown': [],
            'groupBy': [],
            'groupByFirstLevel': undefined,
            'measures': [
                {
                    'aggMethod': 'sum',
                    'name': 'market_val_639c2c1e02164d1',
                    'title': 'Market Value',
                },
                {
                    'aggMethod': 'sum',
                    'name': 'notional_mv_1',
                    'title': 'Notional Market Value',
                },
                {
                    'aggMethod': 'sum',
                    'name': 'quantity',
                    'title': 'Quantity',
                },
            ],
        });
    });

    it('creates chart config from measures when isGroupByFirstLevel is defined and breakdown level is <= 2', () => {
        const measures = [
            {name: 'market_val_639c2c1e02164d1', title: 'Market Value', aggMethod: 'sum'},
            {name: 'notional_mv_1', title: 'Notional Market Value', aggMethod: 'sum'},
            {name: 'quantity', title: 'Quantity', aggMethod: 'sum'}
        ];
        component.customVizConfig = {groupByFirstLevel: true};
        expect(component.createChartConfig(measures)).toEqual({
            'breadcrumbs': {
                'separator': '&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;',
                'topNames': [
                    'Quantity',
                    'Security Group',
                ],
            },
            'drillDown': [],
            'groupBy': [
                'level-1',
            ],
            'groupByFirstLevel': true,
            'measures': [
                {
                    'aggMethod': 'sum',
                    'name': 'market_val_639c2c1e02164d1',
                    'title': 'Market Value',
                },
                {
                    'aggMethod': 'sum',
                    'name': 'notional_mv_1',
                    'title': 'Notional Market Value',
                },
                {
                    'aggMethod': 'sum',
                    'name': 'quantity',
                    'title': 'Quantity',
                },
            ],
        });
    });

    it('creates chart config from measures when isGroupByFirstLevel is undefined and breakdown level is >= 2', () => {
        const measures = [
            {name: 'market_val_639c2c1e02164d1', title: 'Market Value', aggMethod: 'sum'},
            {name: 'notional_mv_1', title: 'Notional Market Value', aggMethod: 'sum'},
            {name: 'quantity', title: 'Quantity', aggMethod: 'sum'}
        ];
        component.customVizConfig = {groupByFirstLevel: false};
        widgetPayload.breakdownLevels = [ROOT_LEVEL, 'level-1', 'level-2', 'level-3'];
        expect(component.createChartConfig(measures)).toEqual({
            'breadcrumbs': {
                'separator': '&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;',
                'topNames': [
                    'Quantity',
                    'Security Group',
                ],
            },
            'drillDown': [],
            'groupBy': [
                'level-1',
            ],
            'groupByFirstLevel': false,
            'measures': [
                {
                    'aggMethod': 'sum',
                    'name': 'market_val_639c2c1e02164d1',
                    'title': 'Market Value',
                },
                {
                    'aggMethod': 'sum',
                    'name': 'notional_mv_1',
                    'title': 'Notional Market Value',
                },
                {
                    'aggMethod': 'sum',
                    'name': 'quantity',
                    'title': 'Quantity',
                },
            ],
        });
    });

    it('creates chart config from measures when isGroupByFirstLevel is defined and breakdown level is >= 2', () => {
        const measures = [
            {name: 'market_val_639c2c1e02164d1', title: 'Market Value', aggMethod: 'sum'},
            {name: 'notional_mv_1', title: 'Notional Market Value', aggMethod: 'sum'},
            {name: 'quantity', title: 'Quantity', aggMethod: 'sum'}
        ];
        component.customVizConfig = {groupByFirstLevel: true};
        widgetPayload.breakdownLevels = [ROOT_LEVEL, 'level-1', 'level-2', 'level-3'];
        expect(component.createChartConfig(measures)).toEqual({
            'breadcrumbs': {
                'separator': '&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;',
                'topNames': [
                    'Quantity',
                    'Security Group',
                ],
            },
            'drillDown': [],
            'groupBy': [
                'level-1',
            ],
            'groupByFirstLevel': true,
            'measures': [
                {
                    'aggMethod': 'sum',
                    'name': 'market_val_639c2c1e02164d1',
                    'title': 'Market Value',
                },
                {
                    'aggMethod': 'sum',
                    'name': 'notional_mv_1',
                    'title': 'Notional Market Value',
                },
                {
                    'aggMethod': 'sum',
                    'name': 'quantity',
                    'title': 'Quantity',
                },
            ],
        });
    });

    it('creates chart options', () => {
        expect(component.createChartOptions()).toMatchObject({
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
                'bubble': {
                    'sizeBy': 'width',
                    'sizeByAbsoluteValue': true,
                },
                'series': {
                    'animation': false,
                    'dataLabels': {
                        'color': '{point.color}',
                        'enabled': true,
                        'format': '{point.name}',
                        'style': {
                            'fontWeight': 'normal',
                            'textShadow': 'false',
                        },
                    },
                    'marker': {
                        'enabled': true,
                        'radius': 6,
                        'states': {
                            'hover': {
                                'enabled': true,
                                'lineColor': 'rgb(100,100,100)',
                            },
                        },
                    },
                    'pointStart': 0,
                    'tooltip': {
                        'headerFormat': '',
                    },
                },
            },
            'title': {
                'text': null,
            },
            'xAxis': {
                'endOnTick': true,
                'gridLineWidth': 1,
                'labels': {},
                'showLastLabel': true,
                'startOnTick': true,
                'title': {
                    'text': 'Market Value',
                },
            },
            'yAxis': {
                'endOnTick': true,
                'labels': {},
                'showLastLabel': true,
                'startOnTick': true,
                'title': {
                    'text': 'Notional Market Value',
                },
            },
        });
        // when size measure is not provided
        component.requestConfig.columns[2] = undefined;
        expect(component.createChartOptions()).toMatchObject({
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
                'bubble': {
                    'sizeBy': 'width',
                    'sizeByAbsoluteValue': true,
                },
                'series': {
                    'animation': false,
                    'dataLabels': {
                        'color': '{point.color}',
                        'enabled': true,
                        'format': '{point.name}',
                        'style': {
                            'fontWeight': 'normal',
                            'textShadow': 'false',
                        },
                    },
                    'marker': {
                        'enabled': true,
                        'radius': 6,
                        'states': {
                            'hover': {
                                'enabled': true,
                                'lineColor': 'rgb(100,100,100)',
                            },
                        },
                    },
                    'pointStart': 0,
                    'tooltip': {
                        'headerFormat': '',
                    },
                },
            },
            'title': {
                'text': null,
            },
            'xAxis': {
                'endOnTick': true,
                'gridLineWidth': 1,
                'labels': {},
                'showLastLabel': true,
                'startOnTick': true,
                'title': {
                    'text': 'Market Value',
                },
            },
            'yAxis': {
                'endOnTick': true,
                'labels': {},
                'showLastLabel': true,
                'startOnTick': true,
                'title': {
                    'text': 'Notional Market Value',
                },
            },
        });
    });

    it('should format the tooltip points', () => {
        const point = {name: 'FUND', x: 123.12, y: 142.53325, z: 524.123};
        expect(component.tooltipPointFormatter(point)).toMatchSnapshot();

        // when split col keys are present
        component['colsMap'] = {
            'market_val_639c2c1e02164d1|Month End': {
                columnKey: 'market_val_639c2c1e02164d1',
                columnTitle: 'Market Value',
                dataType: 'DOUBLE',
                columnTag: 'market_val',
                isHidden: false,
                isSubtotalable: true,
                formatter: {format: () => ''},
                splitColumnHeaderName: 'Market Value'
            },
            'notional_mv_1|Prior Day': {
                columnKey: 'notional_mv_1',
                columnTitle: 'Notional Market Value',
                dataType: 'DOUBLE',
                columnTag: 'notional_mv',
                isHidden: false,
                isSubtotalable: true,
                formatter: {format: () => ''},
                splitColumnHeaderName: 'Notional Market Value'
            },
            'quantity|Quarter End': {
                columnKey: 'quantity',
                columnTitle: 'Quantity',
                dataType: 'DOUBLE',
                columnTag: 'quantity',
                isHidden: false,
                isSubtotalable: true,
                formatter: {format: () => ''},
                splitColumnHeaderName: 'Quantity'
            }
        };

        component.chartConfig.measures = [
            {name: 'market_val_639c2c1e02164d1|Month End', title: 'Market Value', aggMethod: 'sum'},
            {name: 'notional_mv_1|Prior Day', title: 'Notional Market Value', aggMethod: 'sum'},
            {name: 'quantity|Quarter End', title: 'Quantity', aggMethod: 'sum'}
        ];

        expect(component.tooltipPointFormatter(point)).toMatchSnapshot();

        // Size measure missing
        component.chartConfig.measures = [
            {name: 'market_val_639c2c1e02164d1|Month End', title: 'Market Value', aggMethod: 'sum'},
            {name: 'notional_mv_1|Prior Day', title: 'Notional Market Value', aggMethod: 'sum'}
        ];

        expect(component.tooltipPointFormatter(point)).toMatchSnapshot();
    });

    it('should format the tooltip points when splitKeys present in comparison mode', () => {
        const point = {name: 'FUND', x: 123.12, y: 142.53325, z: 524.123};
        component.customVizConfig.isComparisonMode = true;

        component['colsMap'] = {
            'market_val_0': {
                columnKey: 'market_val_0',
                columnTitle: 'Market Value',
                dataType: 'DOUBLE',
                columnTag: 'market_val',
                isHidden: false,
                isSubtotalable: true,
                formatter: {format: () => ''},
                splitColumnHeaderName: 'Market Value'
            },
            'market_val_0|PEP': {
                columnKey: 'market_val_0',
                columnTitle: 'Market Value',
                dataType: 'DOUBLE',
                columnTag: 'market_val',
                isHidden: false,
                isSubtotalable: true,
                formatter: {format: () => ''},
                splitColumnHeaderName: 'Market Value'
            },
            'market_val_0|IP': {
                columnKey: 'market_val_0',
                columnTitle: 'Market Value',
                dataType: 'DOUBLE',
                columnTag: 'market_val',
                isHidden: false,
                isSubtotalable: true,
                formatter: {format: () => ''},
                splitColumnHeaderName: 'Market Value'
            },
            'notional_mv_1': {
                columnKey: 'notional_mv_1',
                columnTitle: 'Notional Market Value',
                dataType: 'DOUBLE',
                columnTag: 'notional_mv',
                isHidden: false,
                isSubtotalable: true,
                formatter: {format: () => ''},
                splitColumnHeaderName: 'Notional Market Value'
            },
            'notional_mv_1|PEP': {
                columnKey: 'notional_mv_1',
                columnTitle: 'Notional Market Value',
                dataType: 'DOUBLE',
                columnTag: 'notional_mv',
                isHidden: false,
                isSubtotalable: true,
                formatter: {format: () => ''},
                splitColumnHeaderName: 'Notional Market Value'
            },
            'notional_mv_1|IP': {
                columnKey: 'notional_mv_1',
                columnTitle: 'Notional Market Value',
                dataType: 'DOUBLE',
                columnTag: 'notional_mv',
                isHidden: false,
                isSubtotalable: true,
                formatter: {format: () => ''},
                splitColumnHeaderName: 'Notional Market Value'
            },
            'quantity': {
                columnKey: 'quantity',
                columnTitle: 'Quantity',
                dataType: 'DOUBLE',
                columnTag: 'quantity',
                isHidden: false,
                isSubtotalable: true,
                formatter: {format: () => ''},
                splitColumnHeaderName: 'Quantity'
            },
            'quantity|PEP': {
                columnKey: 'quantity',
                columnTitle: 'Quantity',
                dataType: 'DOUBLE',
                columnTag: 'quantity',
                isHidden: false,
                isSubtotalable: true,
                formatter: {format: () => ''},
                splitColumnHeaderName: 'Quantity'
            },
            'quantity|IP': {
                columnKey: 'quantity',
                columnTitle: 'Quantity',
                dataType: 'DOUBLE',
                columnTag: 'quantity',
                isHidden: false,
                isSubtotalable: true,
                formatter: {format: () => ''},
                splitColumnHeaderName: 'Quantity'
            }
        };

        component.chartConfig.measures = [
            {name: 'market_val_0', title: 'Market Value', aggMethod: 'sum'},
            {name: 'notional_mv_1', title: 'Notional Market Value', aggMethod: 'sum'},
            {name: 'quantity', title: 'Quantity', aggMethod: 'sum'}
        ];

        expect(component.tooltipPointFormatter(point)).toMatchSnapshot();
    });

    it('creates chart config when splitColumnKeys are present and comparison mode is false', () => {
        component.responseConfig.splitColumnKeys = {krd_123: []};
        component.customVizConfig.isComparisonMode = false;
        component.requestConfig.columns[0] = {
            columnKey: 'krdxx_123',
            columnTitle: 'KRDxx',
            formatter: {format: () => ''},
            dataType: 'DOUBLE',
            columnTag: 'krdxx',
            isSubtotalable: true,
            isHidden: false
        };
        const measures = [
            {name: 'krdxx_123|3M', title: 'KRDxx', aggMethod: 'sum'},
            {name: 'krdxx_123|1Y', title: 'KRDxx', aggMethod: 'sum'},
            {name: 'krdxx_123|2Y', title: 'KRDxx', aggMethod: 'sum'},
            {name: 'notional_mv_1', title: 'Notional Market Value', aggMethod: 'sum'},
            {name: 'quantity', title: 'Quantity', aggMethod: 'sum'}
        ];
        expect(component.createChartConfig(measures)).toEqual({
            'breadcrumbs': {
                'separator': '&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;',
                'topNames': [
                    'Quantity',
                    'Security Group',
                ],
            },
            'drillDown': [],
            'groupBy': [
                'level-1',
            ],
            'groupByFirstLevel': undefined,
            'measures': [
                {
                    'aggMethod': 'sum',
                    'name': 'krdxx_123|3M',
                    'title': 'KRDxx',
                },
                {
                    'aggMethod': 'sum',
                    'name': 'notional_mv_1',
                    'title': 'Notional Market Value',
                },
                {
                    'aggMethod': 'sum',
                    'name': 'quantity',
                    'title': 'Quantity',
                },
            ],
        });
    });

    it('creates chart config when splitColumnKeys are present and comparison mode is true and breakdown configured', () => {
        component.responseConfig.splitColumnKeys = {krd_123: []};
        component.customVizConfig.isComparisonMode = true;
        component.breakdownLevels = ['_ROOT_', 'level-1'];
        component.requestConfig.columns[0] = {
            columnKey: 'krdxx_123',
            columnTitle: 'KRDxx',
            formatter: {format: () => ''},
            dataType: 'DOUBLE',
            columnTag: 'krdxx',
            isSubtotalable: true,
            isHidden: false
        };
        const measures = [
            {name: 'krdxx_123|3M', title: 'KRDxx', aggMethod: 'sum'},
            {name: 'krdxx_123|1Y', title: 'KRDxx', aggMethod: 'sum'},
            {name: 'krdxx_123|2Y', title: 'KRDxx', aggMethod: 'sum'},
            {name: 'notional_mv_1', title: 'Notional Market Value', aggMethod: 'sum'},
            {name: 'quantity', title: 'Quantity', aggMethod: 'sum'}
        ];
        expect(component.createChartConfig(measures)).toEqual({
            'breadcrumbs': {
                'separator': '&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;',
                'topNames': [
                    'Quantity',
                    'Security Group',
                ],
            },
            'drillDown': [],
            'groupBy': [
                'level-1',
            ],
            'groupByFirstLevel': undefined,
            'measures': [
                {
                    'aggMethod': 'sum',
                    'name': 'krdxx_123|3M',
                    'title': 'KRDxx',
                },
                {
                    'aggMethod': 'sum',
                    'name': 'notional_mv_1',
                    'title': 'Notional Market Value',
                },
                {
                    'aggMethod': 'sum',
                    'name': 'quantity',
                    'title': 'Quantity',
                },
            ],
        });
    });

    it('creates chart config when splitColumnKeys are present and comparison mode is true and breakdown not configured', () => {
        component.responseConfig.splitColumnKeys = {krd_123: []};
        component.customVizConfig.isComparisonMode = true;
        component.breakdownLevels = ['_ROOT_'];
        component.requestConfig.columns[0] = {
            columnKey: 'krdxx_123',
            columnTitle: 'KRDxx',
            formatter: {format: () => ''},
            dataType: 'DOUBLE',
            columnTag: 'krdxx',
            isSubtotalable: true,
            isHidden: false
        };
        const measures = [
            {name: 'krdxx_123|3M', title: 'KRDxx', aggMethod: 'sum'},
            {name: 'krdxx_123|1Y', title: 'KRDxx', aggMethod: 'sum'},
            {name: 'krdxx_123|2Y', title: 'KRDxx', aggMethod: 'sum'},
            {name: 'notional_mv_1', title: 'Notional Market Value', aggMethod: 'sum'},
            {name: 'quantity', title: 'Quantity', aggMethod: 'sum'}
        ];
        expect(component.createChartConfig(measures)).toEqual({
            'breadcrumbs': {
                'separator': '&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;',
                'topNames': [
                    'Quantity',
                    'Security Group',
                ],
            },
            'drillDown': [],
            'groupBy': [],
            'groupByFirstLevel': undefined,
            'measures': [
                {
                    'aggMethod': 'sum',
                    'name': 'krdxx_123|3M',
                    'title': 'KRDxx',
                },
                {
                    'aggMethod': 'sum',
                    'name': 'krdxx_123|1Y',
                    'title': 'KRDxx',
                },
                {
                    'aggMethod': 'sum',
                    'name': 'krdxx_123|2Y',
                    'title': 'KRDxx',
                },
                {
                    'aggMethod': 'sum',
                    'name': 'notional_mv_1',
                    'title': 'Notional Market Value',
                },
                {
                    'aggMethod': 'sum',
                    'name': 'quantity',
                    'title': 'Quantity',
                },
            ],
        });
    });

    describe('Test enriching for scatter Chart', () => {
        let cube;
        let scheduler: TestScheduler;

        beforeEach(() => {
            cube = new SimpleCube([]);
        });

        it('should enrich cube #1', () => {
            const chartConfig: BarChartConfig = {
                measures: [{name: 'market_val_0', title: 'Market Value', aggMethod: 'sum'},
                    {name: 'notional_mv_1', title: 'Notional Market Value', aggMethod: 'sum'},
                    {name: 'quantity', title: 'Quantity', aggMethod: 'sum'}],
                groupBy: ['level-1'],
                breakdowns: ['level-1'],
                drillDown: []
            };

            cube.set(createQK([new GroupByKey('_ROOT_'), new GroupByKey('level-1'), new AggregationKey('market_val_0', 'sum'), new AggregationKey('notional_mv_1', 'sum'), new AggregationKey('quantity', 'sum')]), [{
                'market_val_0': 1,
                'notional_mv_1': 2,
                'quantity': 3,
                '_ROOT_': 'PEP',
                'level-1': 'ind'
            }]);
            component.enrichCube(cube, chartConfig, []);
            cube.get(createQK([new GroupByKey('_ROOT_'), new GroupByKey('level-1'), new AggregationKey('market_val_0', 'sum'), new AggregationKey('notional_mv_1', 'sum'), new AggregationKey('quantity', 'sum')])).subscribe(data => {
                expect(data).toEqual([{
                    'market_val_o': 1,
                    'notional_mv_1': 2,
                    'quantity': 3,
                    '_ROOT_': 'PEP',
                    'level-1': 'ind'
                }]);
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

            component['colsMap']['quantity|PEP'] = {
                columnKey: 'notional_mv_1|PEP'
            } as any;
            component['colsMap']['quantity|IP'] = {
                columnKey: 'notional_mv_1|IP'
            } as any;

            component.customVizConfig.isComparisonMode = true;
            component.breakdownLevels = ['_ROOT_'];
            const chartConfig: BubbleChartConfig = {
                measures: [{
                    name: 'market_val_0|PEP',
                    title: 'Market Value',
                    aggMethod: 'sum'
                }, {name: 'market_val_0|IP', title: 'Market Value', aggMethod: 'sum'},
                    {
                        name: 'notional_mv_1|PEP',
                        title: 'Notional Market Value',
                        aggMethod: 'sum'
                    }, {name: 'notional_mv_1|IP', title: 'Notional Market Value', aggMethod: 'sum'},
                    {name: 'quantity|PEP', title: 'Quantity', aggMethod: 'sum'}, {
                        name: 'quantity|IP',
                        title: 'Quantity',
                        aggMethod: 'sum'
                    }],
                groupBy: [],
                breakdowns: []
            };
            const totalCK = [new GroupByKey('_ROOT_'), new AggregationKey('market_val_0|PEP', 'sum'), new AggregationKey('market_val_0|IP', 'sum'),
                new AggregationKey('notional_mv_1|PEP', 'sum'), new AggregationKey('notional_mv_1|IP', 'sum'),
                new AggregationKey('quantity|PEP', 'sum'), new AggregationKey('quantity|IP', 'sum')];
            cube.set(createQK(totalCK), [{
                'market_val_0|PEP': 1,
                'market_val_0|IP': 2,
                'notional_mv_1|PEP': 3,
                'notional_mv_1|IP': 4,
                'quantity|PEP': 5,
                'quantity|IP': 6,
                '_ROOT_': 'PEP',
                'level-1': 'ind'
            }]);
            component.enrichCube(cube, chartConfig, [new GroupByKey('_ROOT_')]);
            cube.get(createQK([new GroupByKey('_ROOT_'), new AggregationKey('market_val_0', 'sum'), new AggregationKey('notional_mv_1', 'sum'), new AggregationKey('quantity', 'sum'), new GroupByKey('_splitKey')])).subscribe(data => {
                console.log(data);
                expect(data).toEqual([{
                    market_val_0: 1,
                    _splitKey: 'PEP',
                    'level-1': 'ind',
                    _ROOT_: 'PEP',
                    notional_mv_1: 3,
                    quantity: 5
                }, {
                    market_val_0: 2,
                    _splitKey: 'IP',
                    'level-1': 'ind',
                    _ROOT_: 'PEP',
                    notional_mv_1: 4,
                    quantity: 6
                }]);
            });
        });
    });
});
