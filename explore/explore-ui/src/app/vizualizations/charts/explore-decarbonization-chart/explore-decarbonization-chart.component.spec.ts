import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange, SimpleChanges} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {CommonConstants} from '@constants/common.constants';
import {data9} from '@mocks/test-data/qbstr-test-data';
import { DecarbonizationChartSettings } from '@models/widget/inputs/decarbonization-chart-settings.model';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {Widget} from '@models/widget/widget.model';
import {AggregationKey, createQK, FilterIncludeKey, GroupByKey, QueryKey} from '@qbstr/data-cube';
import * as qbstrUtil from '@qbstr/data-cube-reactive';
import {ReactiveCube, SimpleCube} from '@qbstr/data-cube-reactive';
import {AuxColorsQualitative, BarChartConfig, ChartType, LineChartConfig} from '@qbstr/highcharts-api';
import {ROOT_LEVEL} from '@utils/qbstr';
import {TestUtils} from '@utils/test.utils';
import {ExploreDecarbonizationChartComponent} from './explore-decarbonization-chart.component';
import {SPLIT_KEY_COLUMN} from '../explore-enriching-chart.directive';
import * as hcCore from '@qbstr/highcharts-core';
import Highcharts from 'highcharts';
import {ComboChartColumn} from '@models/widget/inputs/chart-settings/combo-chart-column.model';
import {ColumnSeriesChartType} from '@enums/column-series-chart-type.enum';
import { RequestAdapterConfig } from '../../../interfaces';

describe('ExploreDecarbonizationChartComponent', () => {
    let component: ExploreDecarbonizationChartComponent;
    let fixture: ComponentFixture<ExploreDecarbonizationChartComponent>;
    let widgetPayload: WidgetPayload;
    let colMap: any;
    const setupHighchartsSpy = jest.spyOn(hcCore, 'setupHighcharts');
    const generateOptionsSpy = jest.spyOn(hcCore, 'generateOptions');

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        const request = {
            portfolio: 'SNP500',
            columns: [
                {
                    columnKey: 'ta_rev_int_s12-base|Hot House World - Nationally Determined Contributions|Targets Applied|2018',
                    columnTitle: 'Revenue Intensity Scope1&2',
                    formatter: undefined,
                    dataType: 'STRING',
                    columnTag: 'ta_rev_int_s12',
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'ta_rev_int_s12-portfolioTarget_1|Hot House World - Nationally Determined Contributions|Targets Applied|2018',
                    columnTitle: 'Revenue Intensity Scope1&2',
                    formatter: undefined,
                    dataType: 'STRING',
                    columnTag: 'ta_rev_int_s12',
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'ta_rev_int_s12-portfolioTarget_2|Hot House World - Nationally Determined Contributions|Targets Applied|2018',
                    columnTitle: 'Revenue Intensity Scope1&2',
                    formatter: undefined,
                    dataType: 'STRING',
                    columnTag: 'ta_rev_int_s12',
                    isHidden: false,
                    isSubtotalable: false
                }
            ]
        };

        TestBed.configureTestingModule({
            declarations: [ExploreDecarbonizationChartComponent],
            imports: [AladdinAngularComponentsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
        initializeWidgetPayload(request);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test initChartMeasures', () => {
        const cols = [{
            columnKey: 'std_risk_1',
            columnTitle: 'std_risk_1',
            formatter: {format: (val) => val},
            dataType: 'DOUBLE',
            columnTag: 'std_risk_1',
            originalColumnTitle: 'std_risk_1',
            isHidden: false,
            isSubtotalable: true
        }];

        component.customVizConfig.comboChartColumns = [new ComboChartColumn({
            colKey: 'std_risk_1',
            chartType: ColumnSeriesChartType.Line
        })];
        component['initChartMeasures'](cols);
        expect(component.chartMeasures).toEqual([
            {
                aggMethod: 'sum',
                chartType: 'line',
                name: 'std_risk_1',
                title: 'std_risk_1',
            },
        ]);

        // line chart type
        component.customVizConfig.comboChartColumns = [new ComboChartColumn({
            colKey: 'std_risk_1',
            chartType: ColumnSeriesChartType.LINE
        })];
        component['initChartMeasures'](cols);
        expect(component.chartMeasures).toEqual([
            {
                aggMethod: 'sum',
                chartType: 'line',
                name: 'std_risk_1',
                title: 'std_risk_1'
            }
        ]);
    });

    it('createChartOptions', () => {
        const chartConfig: LineChartConfig<any> = {
            measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}]
        };
        component['firstCol'] = {
            columnTitle: 'Revenue Intensity',
            columnKey: "ta_rev_int_s12-portfolioTarget_2|Hot House World - Nationally Determined Contributions|Targets Applied|2030",
        }
        const chartOptions = component['createChartOptions'](chartConfig);

        expect(chartOptions.yAxis['title'].text).toBe('tCO2e/$mn');
        expect(chartOptions['title'].text).toBe('<b>Revenue Intensity with Targets Applied, Hot House World - Nationally Determined Contributions</b>');
        expect(chartOptions['plotOptions']).toBeDefined();
        component.tooltipPointFormatter = jest.fn();
        chartOptions['plotOptions'].series.tooltip.pointFormatter(null);
        expect(component.tooltipPointFormatter).toHaveBeenCalled();
    });

    it('createChartConfig', () => {
        const measures = [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}];
        const chartSettings = new DecarbonizationChartSettings();
        chartSettings.chartType = 'line';
        component.breakdownLevels = [];
        component.widget.displayInputs.set('chart', chartSettings);
        expect(component['createChartConfig'](measures).groupBy).toEqual([]);
        expect(component['createChartConfig'](measures).knownColors).toEqual({
            series: {
                'Portfolio Target 1': {...AuxColorsQualitative.BLUE, classes: 'custom-stroke-dash' },
                'Portfolio Target 2': {...AuxColorsQualitative.GREEN_BLUE, classes: 'custom-stroke-dash' },

            }
        });
    });

    it('updateSeriesBeforeCharting Test', () => {
        const measures = [];
        const api = {
            data: [{name: 'Portfolio Target 1', data: [{qbstr: {negative: true}, color: undefined}, {qbstr: {negative: false}, color: undefined}]}],
            chartConfig: { measures }, chart: {
                yAxis: [{
                    update: jest.fn()
                }],
                xAxis: [{
                    addPlotLine: jest.fn()
                }]
            }
        };
        component.updateSeriesBeforeCharting(api as any);
        expect(api.chart.xAxis[0].addPlotLine).toHaveBeenCalledTimes(4);
    });

    describe('Test enriching for bar Chart', () => {
        let cube;

        beforeEach(() => {
            cube = new SimpleCube([]);
        });

        it('should enrich cube #1', () => {

            const chartConfig: BarChartConfig<any> = {
                measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}],
                groupBy: ['country', 'sector'],
                stacked: 'sector'
            };

            cube.set(createQK([new GroupByKey('sector'), new AggregationKey('pct_mv_1', 'sum')]), [1]);
            component.enrichCube(cube, chartConfig, []);
            const sbsc = cube.get(createQK([new GroupByKey('sector'), new GroupByKey('country'), new AggregationKey('pct_mv_1', 'sum')]))
                .subscribe(data => {
                    expect(data).toEqual([1]);
                });
            sbsc.unsubscribe();
        });

        it('should enrich cube #2', () => {

            const chartConfig: BarChartConfig<any> = {
                measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}],
                groupBy: ['country', 'sector'],
                stacked: 'sector'
            };
            component.customVizConfig.showTotal = true;
            const totalCK = [new GroupByKey('country'), new AggregationKey('pct_mv_1', 'sum')];
            cube.set(createQK(totalCK), [{pct_mv_1: 1}]);
            component.enrichCube(cube, chartConfig, []);
            const sbsc = cube.get(createQK([new FilterIncludeKey('level-1', ['Total']), ...totalCK]))
                .subscribe(data => {
                    expect(data).toEqual([{sector: 'Total', pct_mv_1: 1}]);
                });
            sbsc.unsubscribe();
        });

        it('should enrich cube #3', () => {
            component.isSplitColumnKey = () => true;
            component['colsMap']['pct_mv_1|1Y'] = {
                columnKey: 'pct_mv_1|1Y'
            } as any;
            component['colsMap']['pct_mv_1|2Y'] = {
                columnKey: 'pct_mv_1|2Y'
            } as any;
            const chartConfig: BarChartConfig<any> = {
                measures: [{name: 'pct_mv_1|1Y', title: 'pct_mv_1Y', aggMethod: 'sum'}, {
                    name: 'pct_mv_1|2Y',
                    title: 'pct_mv_2Y',
                    aggMethod: 'sum'
                }],
                groupBy: ['sector'],
                stacked: 'sector'
            };
            component.customVizConfig.showTotal = true;
            const totalCK = [new GroupByKey('sector'), new AggregationKey('pct_mv_1|1Y', 'sum'), new AggregationKey('pct_mv_1|2Y', 'sum')];
            cube.set(createQK(totalCK), [{'pct_mv_1|1Y': 1, 'pct_mv_1|2Y': 2, 'level-1': 'ind'}, {
                'pct_mv_1|1Y': 3,
                'pct_mv_1|2Y': 4,
                'level-1': 'fin'
            }]);
            component.enrichCube(cube, chartConfig, []);
            const sbsc = cube.get(createQK([new GroupByKey('sector'), new AggregationKey('pct_mv_1', 'sum')]))
                .subscribe(data => {
                    expect(data).toEqual([{'pct_mv_1': 1, [SPLIT_KEY_COLUMN]: '1Y', 'level-1': 'ind'}, {
                        'pct_mv_1': 2,
                        [SPLIT_KEY_COLUMN]: '2Y',
                        'level-1': 'ind'
                    }, {'pct_mv_1': 3, [SPLIT_KEY_COLUMN]: '1Y', 'level-1': 'fin'}, {
                        'pct_mv_1': 4,
                        [SPLIT_KEY_COLUMN]: '2Y',
                        'level-1': 'fin'
                    }]);
                });
            sbsc.unsubscribe();
        });

        it('should enrich cube #4', () => {
            component.isSplitColumnKey = () => true;
            component['colsMap']['pct_mv_1|1Y|PEP'] = {
                columnKey: 'pct_mv_1|1Y|PEP'
            } as any;
            component['colsMap']['pct_mv_1|2Y|H2'] = {
                columnKey: 'pct_mv_1|2Y|H2'
            } as any;
            const chartConfig: BarChartConfig<any> = {
                measures: [{name: 'pct_mv_1|1Y|PEP', title: 'pct_mv_1Y', aggMethod: 'sum'}, {
                    name: 'pct_mv_1|2Y|H2',
                    title: 'pct_mv_2Y',
                    aggMethod: 'sum'
                }],
                groupBy: ['sector'],
                stacked: 'sector'
            };
            component.customVizConfig.showTotal = false;
            component.requestConfig.portfolio = CommonConstants.COMPARE;
            const totalCK = [new GroupByKey('sector'), new AggregationKey('pct_mv_1|1Y|PEP', 'sum'), new AggregationKey('pct_mv_1|2Y|H2', 'sum')];
            const simpleCube = new SimpleCube<any>([]);
            simpleCube.getSimilarIfPresent = jest.fn();
            component['getCubeSelectedEnrichDataSet'](new SimpleCube<any>([]),null, [{field: 'key'}], []);
            cube.set(createQK(totalCK), [{
                'pct_mv_1|1Y|PEP': 1,
                'pct_mv_1|2Y|H2': 2,
                'level-1': 'ind'
            }, {'pct_mv_1|1Y|PEP': 3, 'pct_mv_1|2Y|H2': 4, 'level-1': 'fin'}]);
            component.enrichCube(cube, chartConfig, []);
            const sbsc = cube.get(createQK([new GroupByKey('sector'), new GroupByKey('_splitKey'), new AggregationKey('pct_mv_1|PEP', 'sum'), new AggregationKey('pct_mv_1|H2', 'sum')]))
                .subscribe(data => {
                    expect(data.length).toEqual(4);
                });
            sbsc.unsubscribe();
        });

        it('should enrich cube #5', () => {

            const chartConfig: BarChartConfig<any> = {
                measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}],
                groupBy: ['sector'],
                stacked: 'sector'
            };
            component.customVizConfig.showTotal = true;
            const totalCK = [new GroupByKey(ROOT_LEVEL), new AggregationKey('pct_mv_1', 'sum')];
            cube.set(createQK(totalCK), [{pct_mv_1: 1}]);
            component.enrichCube(cube, chartConfig, []);
            const sbsc = cube.get(createQK([new FilterIncludeKey('level-1', ['Total']), new GroupByKey(chartConfig.groupBy[0]),
                new AggregationKey('pct_mv_1', 'sum')]))
                .subscribe(data => {
                    expect(data).toEqual([{sector: 'Total', pct_mv_1: 1}]);
                });
            sbsc.unsubscribe();
        });

        it('should enrich cube #6', () => {
            const chartConfig: BarChartConfig<any> = {
                measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}],
                groupBy: ['sector'],
                stacked: 'sector'
            };
            component.customVizConfig.stackByImmediateChild = true;
            component.customVizConfig.showSelected = true;

            const totalCK = [new GroupByKey(ROOT_LEVEL), new AggregationKey('pct_mv_1', 'sum')];
            cube.set(createQK(totalCK), [{pct_mv_1: 1}]);
            component.enrichCube(cube, chartConfig, [new FilterIncludeKey('_ROOT_')]);
            const sbsc = cube.get(createQK([new FilterIncludeKey('_ROOT_',), new FilterIncludeKey('sector', ['Selected']),
                new AggregationKey('pct_mv_1', 'sum'),
                new GroupByKey('level-1')]))
                .subscribe(data => {
                    expect(data).toEqual([{sector: undefined, pct_mv_1: 1, chartType: ChartType.LINE}]);
                });
            sbsc.unsubscribe();
        });
    });

    describe('enrichLeafLevel Test', () => {
        it('should enrich leaf level for FBA Bar chart to fix the drilldown data miss-match issue - 916657', () => {
            const cube = new SimpleCube([]);
            const queryKey = new QueryKey([
                new FilterIncludeKey('_ROOT_', ['PEP']),
                new FilterIncludeKey('level-1', ['Spreads']),
                new FilterIncludeKey('level-2', ['Other Spreads']),
                new FilterIncludeKey('level-3', ['US Money Market Spreads']),
            ]);

            const data = [{
                bgColorMap: {},
                color: undefined,
                'level-1': 'Spreads',
                'level-2': 'Other Spreads',
                'level-3': 'US Money Market Spreads',
                rfv_block_path: '685cf3322e291cf93d2c742bcf84c57b0a87ce70_BRS_GOLD__5_SPREADS:685cf3322e291cf93d2c742bcf84c57b0a87ce70_BRS_GOLD__5_SPREADS_BRS_GOLD__3_OTHER_SPREADS:685cf3322e291cf93d2c742bcf84c57b0a87ce70_BRS_GOLD__5_SPREADS_BRS_GOLD__3_OTHER_SPREADS_USD_DEPO_SPRD,USD_CP_A1P1_SPRD,USD_CP_A2P2_SPRD,USD_BMA_SWAP_SPRD:USD_DEPO_Sprd_2w',
                rfv_ftitle: 'DEPO Sprd 2w',
                'rfv_stress_pnl_act_ab6658fd1c2f4b9|Stock Market Drop Global': -0.0000034202903738559787,
                rowId: 179,
                sectorOrder: undefined,
                _ROOT_: 'PEP'
            }, {
                bgColorMap: {},
                color: undefined,
                'level-1': 'Spreads',
                'level-2': 'Other Spreads',
                'level-3': 'US Money Market Spreads',
                rfv_block_path: '685cf3322e291cf93d2c742bcf84c57b0a87ce70_BRS_GOLD__5_SPREADS:685cf3322e291cf93d2c742bcf84c57b0a87ce70_BRS_GOLD__5_SPREADS_BRS_GOLD__3_OTHER_SPREADS:685cf3322e291cf93d2c742bcf84c57b0a87ce70_BRS_GOLD__5_SPREADS_BRS_GOLD__3_OTHER_SPREADS_USD_DEPO_SPRD,USD_CP_A1P1_SPRD,USD_CP_A2P2_SPRD,USD_BMA_SWAP_SPRD:USD_DEPO_Sprd_1m',
                rfv_ftitle: 'DEPO Sprd 1m',
                'rfv_stress_pnl_act_ab6658fd1c2f4b9|Stock Market Drop Global': -0.000002423616395326109,
                rowId: 180,
                sectorOrder: undefined,
                _ROOT_: 'PEP'
            }];
            cube.set(queryKey, data);

            const fbaWidgetPayload = {
                widgetConfigType: 'praWidget',
                requestConfig: {
                    portfolio: 'PEP',
                    columns: [{
                        columnKey: 'rfv_ftitle',
                        columnTag: 'rfv_ftitle',
                        columnTitle: ' Title',
                        dataType: 'STRING',
                        formatter: undefined,
                        isHidden: false,
                        isSubtotalable: false,
                        originalColumnTitle: ' Title',
                        pinned: 'left',
                        splitColumnHeaderName: undefined,
                        width: 249
                    }, {
                        columnKey: 'rfv_stress_pnl_act_ab6658fd1c2f4b9',
                        columnTag: 'rfv_stress_pnl_act',
                        columnTitle: 'Active Stress PnL',
                        dataType: 'DOUBLE',
                        formatter: undefined,
                        isHidden: false,
                        isSubtotalable: true,
                        numericColumnFormatColumnOption: undefined,
                        originalColumnTitle: 'Active Stress PnL',
                        riskSettings: undefined,
                        scenarioSettings: undefined,
                        splitColumnHeaderName: undefined
                    }, {
                        columnKey: 'rfv_block_path',
                        columnTag: 'rfv_block_path',
                        columnTitle: 'Block Path',
                        dataType: 'STRING',
                        formatter: undefined,
                        isHidden: true,
                        isSubtotalable: false,
                        originalColumnTitle: 'Block Path',
                        splitColumnHeaderName: undefined
                    }]
                },
                responseConfig: {},
                cube,
                breakdownLevels: ['_ROOT_', 'level-1', 'level-2', 'level-3'],
                customVizConfig: {
                    chartType: 'column',
                    isStacked: undefined,
                    leafLevels: ['rfv_ftitle'],
                    columns: [{
                        columnKey: 'rfv_stress_pnl_act_ab6658fd1c2f4b9|Stock Market Drop Global',
                        columnTag: 'rfv_stress_pnl_act',
                        columnTitle: 'Stock Market Drop Global Active Stress PnL',
                        dataType: 'DOUBLE',
                        formatter: undefined,
                        isHidden: false,
                        isSubtotalable: true,
                        numericColumnFormatColumnOption: undefined,
                        originalColumnTitle: 'Active Stress PnL',
                        riskSettings: undefined,
                        scenarioSettings: undefined,
                        splitColumnHeaderName: 'Active Stress PnL'
                    }]
                }
            };

            const simpleChanges: SimpleChanges = {
                widget: new SimpleChange(undefined, new Widget(WidgetConfigType.FACTOR_GRAPHING_BAR_CHART), true),
                widgetPayload: new SimpleChange(undefined, fbaWidgetPayload, true)
            };
            component['initialized'] = false;
            jest.spyOn(qbstrUtil, 'isLeafNode').mockImplementation(
                qk => qk.queryKeyEntries.length > 0 && !qk.queryKeyEntries.find(key => key instanceof AggregationKey || key instanceof GroupByKey)
            );

            const cubeSizeBeforeEnriching = cube.keys().length;
            expect(cube.keys()[cube.keys().length - 1].queryKeyEntries.length).toBe(4);
            expect(cube.keys()[cube.keys().length - 1].queryKeyEntries[0]).toBeInstanceOf(FilterIncludeKey);
            expect(cube.keys()[cube.keys().length - 1].queryKeyEntries[1]).toBeInstanceOf(FilterIncludeKey);
            expect(cube.keys()[cube.keys().length - 1].queryKeyEntries[2]).toBeInstanceOf(FilterIncludeKey);
            expect(cube.keys()[cube.keys().length - 1].queryKeyEntries[3]).toBeInstanceOf(FilterIncludeKey);

            component.ngOnChanges(simpleChanges);

            expect(cube.keys().length).toBe(cubeSizeBeforeEnriching + 1);
            expect(cube.keys()[cube.keys().length - 1].queryKeyEntries.length).toBe(6);
            expect(cube.keys()[cube.keys().length - 1].queryKeyEntries[0]).toBeInstanceOf(FilterIncludeKey);
            expect(cube.keys()[cube.keys().length - 1].queryKeyEntries[1]).toBeInstanceOf(FilterIncludeKey);
            expect(cube.keys()[cube.keys().length - 1].queryKeyEntries[2]).toBeInstanceOf(FilterIncludeKey);
            expect(cube.keys()[cube.keys().length - 1].queryKeyEntries[3]).toBeInstanceOf(FilterIncludeKey);
            expect(cube.keys()[cube.keys().length - 1].queryKeyEntries[4]).toBeInstanceOf(AggregationKey);
            expect(cube.keys()[cube.keys().length - 1].queryKeyEntries[5]).toBeInstanceOf(GroupByKey);
        });
    });

    it('test legend label formatter', () => {
        let obj = {
            chart: {legend: {allItems: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']}},
            name: 'Notional Market Value%',
            labelFormatter: component['createLegendLabelFormatter']()
        };
        expect(obj.labelFormatter()).toEqual('Notional Market Va...');
        obj = {
            chart: {legend: {allItems: ['1', '2', '3', '4', '5', '6', '7', '8', '9']}},
            name: 'Notional Market Value%',
            labelFormatter: component['createLegendLabelFormatter']()
        };
        expect(obj.labelFormatter()).toEqual('Notional Market Value%');
    });

    it('seriesNameOverride Test', () => {
        component.requestConfig = {
            portfolio: 'SNP500'
        } as RequestAdapterConfig;
        const column = {
            name: 'ta_rev_int_s12-base|Hot House World - Nationally Determined Contributions|Targets Applied|2018'
        };
        expect(component['seriesNameOverride'](null, column)).toEqual('Portfolio SNP500 - Hot House World - Nationally Determined Contributions');

        column.name = 'ta_rev_int_s12-portfolioTarget_1|Hot House World - Nationally Determined Contributions|Targets Applied|2018'
        expect(component['seriesNameOverride'](null, column)).toEqual('Portfolio Target 1');
    });

    it('Tooltip formatter Test', () => {
        const point = {
            name: '2018',
            y: 10.11,
            qbstr: {
                measureName: 'ta_rev_int_s12-portfolioTarget_1|Hot House World - Nationally Determined Contributions|Targets Applied|2018'
            }
        };
        component.chartConfig.measures = [{
            name: 'ta_rev_int_s12-portfolioTarget_1|Hot House World - Nationally Determined Contributions|Targets Applied|2018'
        }];
        component['formatValue'] = jest.fn().mockReturnValue(10.11)
        expect(component['tooltipPointFormatter'](point)).toEqual('<b>Portfolio Target 1</b><br><b>&nbsp;2018</b>: 10.11 tCO2e/$mn<br>');
    });

    function initializeWidgetPayload(request: any) {
        widgetPayload = {widgetConfigType: WidgetConfigType.DECARBONIZATION_WIDGET};
        widgetPayload.requestConfig = request;
        widgetPayload.responseConfig = data9.data as any;
        widgetPayload.cube = new ReactiveCube<any>([]);
        widgetPayload.breakdownLevels = [ROOT_LEVEL];
        widgetPayload.customVizConfig = {
            columnTag: "ta_rev_int_s12",
            positionColumnType: "PORT",
            selectedScenario: "Nationally Determined Contributions",
            emissionStartYear: "2018",
            aggregationMethod: 1401,
            emissionTargetType: "TA_METRIC_CODE_PRIORITY"
        };
        colMap = {};
        request.columns.forEach(col => colMap[col.columnKey] = col);
        fixture = TestBed.createComponent(ExploreDecarbonizationChartComponent);
        component = fixture.componentInstance;
        component.widgetPayload = widgetPayload;

        setupHighchartsSpy.mockImplementation(() => component.hc);
        generateOptionsSpy.mockImplementation(() => Highcharts.getOptions());
        component.widget = new Widget(WidgetConfigType.DECARBONIZATION_WIDGET);


        component['colsMap'] = colMap;
        const simpleChanges: SimpleChanges = {
            widget: new SimpleChange(undefined, new Widget(WidgetConfigType.DECARBONIZATION_WIDGET), true),
            widgetPayload: new SimpleChange(undefined, widgetPayload, true)
        };
        
        component.ngOnChanges(simpleChanges);
    }

    it('should setup the yaxis label', () => {
        const chartConfig: LineChartConfig<any> = {
            measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}]
        };
        component['firstCol'] = {
            columnTag: "TA_SOV_SCOPE1_INTENSITY_GDP"
        }
        let chartOptions = component['createChartOptions'](chartConfig);

        expect(chartOptions.yAxis['title'].text).toBe('kgCO2e/$mn');

        component['firstCol'] = {
            columnTag: "TA_SOV_SCOPE1_INTENSITY_PER_CAPITA"
        }
        chartOptions = component['createChartOptions'](chartConfig);
        expect(chartOptions.yAxis['title'].text).toBe('tCO2e');

        component['firstCol'] = {
            columnTag: "ta_rev_intens_proj"
        }
        chartOptions = component['createChartOptions'](chartConfig);
        expect(chartOptions.yAxis['title'].text).toBe('tCO2e/$mn');
    });
});

