import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange, SimpleChanges} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {LibColumnUtils, OverrideDateColumnOption} from '@blk/explore-ui-column-option';
import {ChartWidgetInputConfigType, WidgetConfigType} from '@blk/explore-ui-core';
import {CommonConstants} from '@constants/common.constants';
import {VizualizationColumnConfig} from '@interfaces/request.interface';
import {data1} from '@mocks/test-data/qbstr-test-data';
import {BarChartSettings} from '@models/widget/inputs/chart-settings/bar-chart-settings.model';
import {BarChartAdditionalSettings} from '@models/widget/inputs/chart-settings/bar-chart-additional-settings.model';
import {ChartSettings} from '@models/widget/inputs/chart-settings/chart-settings.model';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {Widget} from '@models/widget/widget.model';
import {AggregationKey, createQK, FilterIncludeKey, GroupByKey, QueryKey, QueryKeyEntryType} from '@qbstr/data-cube';
import * as qbstrUtil from '@qbstr/data-cube-reactive';
import {ReactiveCube, SimpleCube} from '@qbstr/data-cube-reactive';
import {AuxColorsQualitative, BarChartConfig, ChartMeasure, ChartType} from '@qbstr/highcharts-api';
import {ROOT_LEVEL} from '@utils/qbstr';
import {TestUtils} from '@utils/test.utils';
import {ExploreBarChartComponent} from './explore-bar-chart.component';
import {SPLIT_KEY_COLUMN} from '../explore-enriching-chart.directive';
import * as hcCore from '@qbstr/highcharts-core';
import Highcharts from 'highcharts';
import {BehaviorSubject} from 'rxjs';
import {CustomColorPositiveNegative} from '@models/widget/inputs/chart-settings/custom-color-positive-negative';
import {ComboChartColumn} from '@models/widget/inputs/chart-settings/combo-chart-column.model';
import {ColumnSeriesChartType} from '@enums/column-series-chart-type.enum';
import {LineChartStyle} from '@enums/line-chart-style.enum';

describe('ExploreBarChartComponent', () => {
    let component: ExploreBarChartComponent;
    let fixture: ComponentFixture<ExploreBarChartComponent>;
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
                    formatter: {format: (val) => val},
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
                }
            ]
        };

        TestBed.configureTestingModule({
            declarations: [ExploreBarChartComponent],
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
            chartType: ColumnSeriesChartType.BAR
        })];
        component['initChartMeasures'](cols);
        expect(component.chartMeasures).toEqual([
            {
                aggMethod: 'sum',
                chartType: 'column',
                axis: undefined,
                name: 'std_risk_1',
                title: 'std_risk_1',
            },
        ]);

        // secondary axis
        component.customVizConfig.comboChartColumns = [new ComboChartColumn({
            colKey: 'std_risk_1',
            chartType: ColumnSeriesChartType.BAR,
            secondaryAxis: true
        })];
        component['initChartMeasures'](cols);
        expect(component.chartMeasures).toEqual([
            {
                aggMethod: 'sum',
                chartType: 'column',
                axis: 1,
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
                cssStyleClass: 'bar-chart-line-measure',
                axis: undefined,
                name: 'std_risk_1',
                title: 'std_risk_1'
            }
        ]);
    });

    it('initChartMeasures with positive/negative line', () => {
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

        const positiveNegativeSetting = new CustomColorPositiveNegative();
        positiveNegativeSetting.isEnabled = true;
        component.widget.displayInputs.set(ChartWidgetInputConfigType.CUSTOM_COLOR_POSITIVE_NEGATIVE, positiveNegativeSetting);

        component.customVizConfig.comboChartColumns = [new ComboChartColumn({
            colKey: 'std_risk_1',
            chartType: ColumnSeriesChartType.LINE
        })];
        component['initChartMeasures'](cols);
        expect(component.chartMeasures).toEqual([
            {
                aggMethod: 'sum',
                chartType: 'line',
                cssStyleClass: 'positive-negative-line-measure',
                axis: undefined,
                name: 'std_risk_1',
                title: 'std_risk_1'
            }
        ]);
    });

    it('createChartOptions', () => {
        const chartConfig: BarChartConfig<any> = {
            measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}],
            groupBy: ['country', 'sector'],
            stacked: 'sector'
        };
        const chartOptions = component['createChartOptions'](chartConfig);

        expect(chartOptions.yAxis[0]['title'].text).toBe('pct_mv_1');
    });

    it('createChartOptions with secondary axis', () => {
        const chartConfig: BarChartConfig<any> = {
            measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum', axis: 1}],
            groupBy: ['country', 'sector'],
            stacked: 'sector'
        };
        const chartOptions = component['createChartOptions'](chartConfig);

        expect(chartOptions.yAxis[1]['title'].text).toBe('pct_mv_1');
    });

    it('createChartOptions with overridden axis', () => {
        const chartConfig: BarChartConfig<any> = {
            measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}],
            groupBy: ['country', 'sector'],
            stacked: 'sector'
        };
        component.customVizConfig.primaryYAxisOverride = 'Primary Title';
        component.customVizConfig.secondaryYAxisOverride = 'Secondary Title';
        const chartOptions = component['createChartOptions'](chartConfig);

        expect(chartOptions.yAxis[0]['title'].text).toBe('Primary Title');
        expect(chartOptions.yAxis[1]['title'].text).toBe('Secondary Title');
    });

    describe('createChartOptions with custom colors ', () => {
        const chartConfig: BarChartConfig<any> = {
            measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}],
            groupBy: ['country', 'sector']
        };
        const customColor = new CustomColorPositiveNegative();
        customColor.isEnabled = true;
        customColor.positiveColor = '#FFFFFF';
        customColor.negativeColor = '#000000';
        it('custom color enabled and bar chart stacked', () => {
            customColor.isEnabled = true;
            component.widget.displayInputs.set('customColorPositiveNegative', customColor);
            component.customVizConfig.isStacked = true;
            let chartOptions = component['createChartOptions'](chartConfig);
            expect(chartOptions.legend?.useHTML).toBeUndefined();
            customColor.isEnabled = false;
            chartOptions = component['createChartOptions'](chartConfig);
            expect(chartOptions.legend?.useHTML).toBeUndefined();
        });
        it('custom color enabled and bar chart enabled/disable', () => {
            customColor.isEnabled = true;
            component.widget.displayInputs.set('customColorPositiveNegative', customColor);
            component.customVizConfig.isStacked = false;
            let chartOptions = component['createChartOptions'](chartConfig);
            expect(chartOptions.legend?.useHTML).toBeTruthy();
            customColor.isEnabled = false;
            chartOptions = component['createChartOptions'](chartConfig);
            expect(chartOptions.legend?.useHTML).toBeUndefined();
        });
    });

    it('createLegendLabelFormatterPositiveNegative test', () => {
        const customColor = new CustomColorPositiveNegative();
        customColor.isEnabled = true;
        customColor.positiveColor = '#FFFFFF';
        customColor.negativeColor = '#000000';
        const legendPoint = {name: 'CASH'};
        const obj = {
            chart: {legend: {allItems: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']}},
            name: 'Notional Market Value%',
            labelFormatter: component['createLegendLabelFormatterPositiveNegative'](customColor)
        };
        expect(obj.labelFormatter()).toEqual('<span style=\"height:12px;width:12px;display:inline-block;border-radius:50%;background:linear-gradient(to right,#FFFFFF 0%,#FFFFFF 50%,#000000 50%,#000000 100%)\"></span> <text style=\"font-weight: bold\">Notional Market Value%</text>');
    });

    it('formatXaxisLabel', () => {
        const point = {
            value: 'EQUITY'
        };
        expect(component.formatXaxisLabel(point)).toMatchSnapshot();
    });

    it('createChartConfig', () => {
        const measures = [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}];
        const chartSettings = new BarChartSettings();
        chartSettings.chartType = 'column';
        component.breakdownLevels = [];
        component.widget.displayInputs.set('chart', chartSettings);
        expect(component['createChartConfig'](measures).seriesNameOverride).toBe(undefined);
        expect(component['createChartConfig'](measures).groupBy).toEqual([]);
    });

    it('createChartConfig with defined customViz.chartType', () => {
        const measures = [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}];
        expect(component.createChartSpecificQbstrChartConfig(new SimpleCube([]), component['createChartConfig'](measures), {}, []).type).toBe('column');
    });

    it('createChartConfig with defined customViz.chartType and styleAnalysis columns', () => {
        const measures = [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}, {
            name: 'style_quality|Total',
            title: 'style_quality|Total',
            aggMethod: 'sum'
        }, {name: 'style_quality|Total Return', title: 'style_quality|Total Return', aggMethod: 'sum'}];
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
                    formatter: {format: (val) => val},
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
                {
                    columnKey: 'style_quality|Total',
                    columnTitle: 'style_quality|Total',
                    formatter: {format: () => ''},
                    dataType: 'STRING',
                    columnTag: 'style_quality|Total',
                    isHidden: false,
                    isSubtotalable: true
                },
                {
                    columnKey: 'style_quality|Total Return',
                    columnTitle: 'style_quality|Total Return',
                    formatter: {format: () => ''},
                    dataType: 'STRING',
                    columnTag: 'style_quality|Total Return',
                    isHidden: false,
                    isSubtotalable: true
                }
            ]
        };
        jest.spyOn(LibColumnUtils, 'isStyleColumn').mockReturnValue(true);
        initializeWidgetPayload(request);
        const barChartOptions = component.createChartSpecificQbstrChartConfig(new SimpleCube([]), component['createChartConfig'](measures), {}, []);
        expect(barChartOptions.type).toBe('column');
        const knownColors = {
            series: {
                'pct_mv_1': AuxColorsQualitative.BLUE,
                'style_quality|Total': AuxColorsQualitative.PURPLE_RED,
                'style_quality|Total Return': AuxColorsQualitative.PURPLE_RED
            }
        };
        expect(barChartOptions.chartConfig.knownColors).toEqual(knownColors);
    });

    it('createChartConfig with defined customViz.chartOrientation bar', () => {
        const measures = [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}];
        component.customVizConfig.chartOrientation = ChartType.BAR;
        const qbstrChartConfig = component.createChartSpecificQbstrChartConfig(new SimpleCube([]), component['createChartConfig'](measures), {}, []);
        expect(qbstrChartConfig.type).toEqual(ChartType.BAR);
    });

    it('createChartConfig', () => {
        const measures = [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}];
        const chartSettings = new BarChartSettings();
        chartSettings.chartType = 'column';
        component.breakdownLevels = [];
        component.widget.displayInputs.set('chart', chartSettings);
        expect(component['createChartConfig'](measures).seriesNameOverride).toBe(undefined);
        expect(component['createChartConfig'](measures).groupBy).toEqual([]);
    });

    it('createChartConfig when split keys are present', () => {
        component['colsMap']['krd_123|3M'] = {
            columnKey: 'krd_123|3M',
            splitColumnHeaderName: 'Key Rate Duration'
        } as any;
        component['colsMap']['krd_123|1Y'] = {
            columnKey: 'krd_123|1Y',
            splitColumnHeaderName: 'Key Rate Duration'
        } as any;
        const measures = [{
            name: 'krd_123|3M',
            title: '3M Key Rate Duration',
            aggMethod: 'sum',
            chartType: ChartType.BAR
        },
            {name: 'krd_123|1Y', title: '1Y Key Rate Duration', aggMethod: 'sum', chartType: ChartType.LINE}];
        component.customVizConfig.sortOrder = 'DESC';
        component.customVizConfig.sortBy = 'krd_123';
        expect(component['createChartConfig'](measures)).toMatchObject({
            'breadcrumbs': {
                'separator': '&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;',
                'topNames': [
                    'Column Measures',
                    'Security Group',
                ],
            },
            'drillDown': [],
            'groupBy': [
                'level-1',
            ],
            'measures': [
                {
                    'aggMethod': 'sum',
                    'chartType': 'bar',
                    'name': 'krd_123|3M',
                    'title': '3M Key Rate Duration',
                },
                {
                    'aggMethod': 'sum',
                    'chartType': 'line',
                    'name': 'krd_123|1Y',
                    'title': '1Y Key Rate Duration',
                },
            ],
            'sortBy': 'krd_123|3M',
            'sortOrder': 'DESC',
            'stacked': undefined,
            'topBottomFilterParams': undefined,
            'xAxisOverride': undefined,
        });
    });

    it('createChartConfig when split keys are present with no breakdown - sort order should be undefined', () => {
        component['colsMap']['krd_123|3M'] = {
            columnKey: 'krd_123|3M',
            splitColumnHeaderName: 'Key Rate Duration'
        } as any;
        component['colsMap']['krd_123|1Y'] = {
            columnKey: 'krd_123|1Y',
            splitColumnHeaderName: 'Key Rate Duration'
        } as any;
        const measures = [{
            name: 'krd_123|3M',
            title: '3M Key Rate Duration',
            aggMethod: 'sum',
            chartType: ChartType.BAR
        },
            {name: 'krd_123|1Y', title: '1Y Key Rate Duration', aggMethod: 'sum', chartType: ChartType.BAR}];
        component.breakdownLevels = ['_ROOT_'];
        component.customVizConfig.sortOrder = 'DESC';
        component.customVizConfig.sortBy = 'krd_123';
        expect(component['createChartConfig'](measures)).toMatchObject({
            'breadcrumbs': {
                'separator': '&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;',
                'topNames': [
                    'Column Measures',
                    'Security Group',
                ],
            },
            'drillDown': [],
            'groupBy': [],
            'measures': [
                {
                    'aggMethod': 'sum',
                    'chartType': 'bar',
                    'name': 'krd_123|3M',
                    'title': '3M Key Rate Duration',
                },
                {
                    'aggMethod': 'sum',
                    'chartType': 'bar',
                    'name': 'krd_123|1Y',
                    'title': '1Y Key Rate Duration',
                },
            ],
            'sortBy': undefined,
            'sortOrder': undefined,
            'stacked': undefined,
            'topBottomFilterParams': undefined,
            'xAxisOverride': undefined,
        });
    });

    it('createChartConfig when split keys are present and only stacked breakdown applied', () => {
        component['colsMap']['krd_123|3M'] = {
            columnKey: 'krd_123|3M',
            splitColumnHeaderName: 'Key Rate Duration'
        } as any;
        component['colsMap']['krd_123|1Y'] = {
            columnKey: 'krd_123|1Y',
            splitColumnHeaderName: 'Key Rate Duration'
        } as any;
        const measures = [{
            name: 'krd_123|3M',
            title: '3M Key Rate Duration',
            aggMethod: 'sum',
            chartType: ChartType.BAR
        },
            {name: 'krd_123|1Y', title: '1Y Key Rate Duration', aggMethod: 'sum', chartType: ChartType.BAR}];
        component.customVizConfig.isStacked = true;
        expect(component['createChartConfig'](measures)).toMatchObject({
            'breadcrumbs': {
                'separator': '&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;',
                'topNames': [
                    'Column Measures',
                    'Security Group',
                ],
            },
            'drillDown': undefined,
            'groupBy': [
                'level-1',
            ],
            'measures': [
                {
                    'aggMethod': 'sum',
                    'chartType': 'bar',
                    'name': 'krd_123|3M',
                    'title': '3M Key Rate Duration',
                },
                {
                    'aggMethod': 'sum',
                    'chartType': 'bar',
                    'name': 'krd_123|1Y',
                    'title': '1Y Key Rate Duration',
                },
            ],
            'sortBy': undefined,
            'sortOrder': undefined,
            'stacked': 'level-1',
            'topBottomFilterParams': undefined,
        });
    });

    it('createChartConfig when single split key column present - xAxis override should be undefined', () => {
        component['colsMap'] = {};
        component['colsMap']['port_stress_pnl_123|Stock Market Global'] = {
            columnKey: 'port_stress_pnl_123|Stock Market Global',
            splitColumnHeaderName: 'Stress P&L'
        } as any;
        const measures = [{
            name: 'port_stress_pnl_123|Stock Market Global',
            title: 'Stock Market Global Stress P&L',
            aggMethod: 'sum',
            chartType: ChartType.BAR
        }];
        expect(component['createChartConfig'](measures)).toMatchObject({
            'breadcrumbs': {
                'separator': '&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;',
                'topNames': [
                    'pct_mv_1',
                    'Security Group',
                ],
            },
            'drillDown': [],
            'groupBy': [
                'level-1',
            ],
            'measures': [
                {
                    'aggMethod': 'sum',
                    'chartType': 'bar',
                    'name': 'port_stress_pnl_123|Stock Market Global',
                    'title': 'Stock Market Global Stress P&L',
                },
            ],
            'sortBy': undefined,
            'sortOrder': undefined,
            'stacked': undefined,
            'topBottomFilterParams': undefined,
            'xAxisOverride': undefined,
        });
    });

    describe('enrichBreakdownLevels test', () => {
        const chartMeasures: ChartMeasure<any>[] = [];

        beforeEach(() => {
            chartMeasures.push({name: 'risk_contr', title: 'Risk contribution', aggMethod: 'sum'});
            chartMeasures.push({name: 'bench_risk_contr', title: 'Benchmark risk contribution', aggMethod: 'sum'});
            chartMeasures.push({name: 'act_risk_contr', title: 'Active risk contribution', aggMethod: 'sum'});
        });

        it('should enrich breakdown level without group by child level only', () => {
            const barChartAdditionalSettings = new BarChartAdditionalSettings();
            component.widget.dataStore.metaData.inputs.set(BarChartAdditionalSettings.configType, barChartAdditionalSettings);

            component.enrichBreakdownLevels();
            expect(component.breakdownLevels).toEqual(['_ROOT_', 'level-1']);
        });

        it('should enrich breakdown level with group by child level only', () => {
            const barChartAdditionalSettings = new BarChartAdditionalSettings();
            barChartAdditionalSettings.stackByImmediateChild = true;
            component.widget.dataStore.metaData.inputs.set(BarChartAdditionalSettings.configType, barChartAdditionalSettings);

            component.enrichBreakdownLevels();
            expect(component.breakdownLevels).toEqual(['_ROOT_', 'level-1']);
        });
    });

    describe('getSortBy Test', () => {
        it('should get the original sortBy for sorting', () => {
            component.customVizConfig.sortBy = 'pct_notional_val_0';
            component.customVizConfig.sortOrder = 'DESC';
            const measures = [{
                'name': 'pct_notional_val_0',
                'title': 'Notional Market Value %',
                'aggMethod': 'sum'
            }, {
                'name': 'pct_notional_val_389bc97177124f8|03/11/2016',
                'title': '03/11/2016 Notional Market Value %',
                'aggMethod': 'sum'
            }];
            expect(component['getSortBy'](measures)).toBe('pct_notional_val_0');
        });

        it('should get new sortBy for sorting', () => {
            component.customVizConfig.sortBy = 'pct_notional_val_389bc97177124f8';
            component.customVizConfig.sortOrder = 'DESC';
            const measures = [{
                'name': 'pct_notional_val_0| Δ Prior Day',
                'title': ' Δ Prior Day Notional Market Value %',
                'aggMethod': 'sum'
            }, {
                'name': 'pct_notional_val_389bc97177124f8|03/11/2016',
                'title': '03/11/2016 Notional Market Value %',
                'aggMethod': 'sum'
            }];
            expect(component['getSortBy'](measures)).toBe('pct_notional_val_389bc97177124f8|03/11/2016');
        });

        it('should get the original sortBy when sortOrder is set to BREAKDOWN(undefined)', () => {
            component.customVizConfig.sortBy = 'pct_notional_val_0';
            component.customVizConfig.sortOrder = undefined;
            const measures = [{
                'name': 'pct_notional_val_0| Δ Prior Day',
                'title': ' Δ Prior Day Notional Market Value %',
                'aggMethod': 'sum'
            }, {
                'name': 'pct_notional_val_389bc97177124f8|03/11/2016',
                'title': '03/11/2016 Notional Market Value %',
                'aggMethod': 'sum'
            }];
            expect(component['getSortBy'](measures)).toBe('pct_notional_val_0');
        });
    });


    it('test xAxisOverride', () => {
        component['colsMap']['krd_123|3M'] = {
            columnKey: 'krd_123|3M',
            splitColumnHeaderName: 'Key Rate Duration'
        } as any;
        component['colsMap']['krd_123|1Y'] = {
            columnKey: 'krd_123|1Y',
            splitColumnHeaderName: 'Key Rate Duration'
        } as any;
        const chartConfig = {measures: [{name: 'krd_123', title: 'krd_123', aggMethod: 'sum'}]};
        expect(component['xAxisOverride'](chartConfig)).toEqual([
            'cusip_0',
            'pct_mv_1',
            'security_description_1',
            '3M',
            '1Y',
        ]);
    });

    it('test xAxisOverride with stacked breakdown', () => {
        component['colsMap']['pct_mv_1|PEP'] = {
            columnKey: 'pct_mv_1|PEP',
            splitColumnHeaderName: 'Market Value %'
        } as any;
        component['colsMap']['pct_mv_1|CORE-HQ'] = {
            columnKey: 'pct_mv_1|CORE-HQ',
            splitColumnHeaderName: 'Market Value %'
        } as any;
        const chartConfig = {measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}]};
        component.chartConfig.stacked = 'level-1';
        component.breakdownLevels = ['_ROOT_', 'level-1'];
        component.requestConfig.portfolio = 'Compare';
        expect(component['xAxisOverride'](chartConfig)).toEqual([
            undefined,
            'Market Value %',
        ]);
    });

    it('test xAxisOverride with Stress P&L column (multiple stress scenario) in Compare mode with only stacked breakdown', () => {
        component['colsMap']['stress_pnl_123|Stock Market Drop Global|PEP'] = {
            columnKey: 'stress_pnl_123|PEP',
            splitColumnHeaderName: 'Stress P&L'
        } as any;
        component['colsMap']['stress_pnl_123|Stock Market Drop Global|IP'] = {
            columnKey: 'stress_pnl_123|IP',
            splitColumnHeaderName: 'Stress P&L'
        } as any;
        component['colsMap']['stress_pnl_123|Stock Market Drop US|PEP'] = {
            columnKey: 'stress_pnl_123|PEP',
            splitColumnHeaderName: 'Stress P&L'
        } as any;
        component['colsMap']['stress_pnl_123|Stock Market Drop US|IP'] = {
            columnKey: 'stress_pnl_123|IP',
            splitColumnHeaderName: 'Stress P&L'
        } as any;
        const chartConfig = {
            measures: [{
                name: 'stress_pnl_123|PEP',
                title: 'PEP',
                aggMethod: 'sum'
            }, {name: 'stress_pnl_123|IP', title: 'IP', aggMethod: 'sum'}]
        };
        component.breakdownLevels = ['_ROOT_', 'level-1'];
        component.chartConfig.stacked = 'level-1';
        component.requestConfig.portfolio = 'Compare';
        expect(component['xAxisOverride'](chartConfig)).toEqual([
            undefined,
            'Stock Market Drop Global',
            'Stock Market Drop US',
        ]);
    });


    it('createChartConfig when multilevel split keys are present', () => {
        component['colsMap']['krd_123|Prior Day|3M'] = {
            columnKey: 'krd_123|Prior Day|3M',
            splitColumnHeaderName: 'Key Rate Duration'
        } as any;
        component['colsMap']['krd_123|Month End|3M'] = {
            columnKey: 'krd_123|Month End|3M',
            splitColumnHeaderName: 'Key Rate Duration'
        } as any;
        const measures = [{
            name: 'krd_123|Prior Day|3M',
            title: '3M Key Rate Duration',
            aggMethod: 'sum',
            chartType: ChartType.BAR
        },
            {name: 'krd_123|Month End|3M', title: '3M Key Rate Duration', aggMethod: 'sum', chartType: ChartType.BAR}];
        expect(component['createChartConfig'](measures)).toMatchObject({
            'breadcrumbs': {
                'separator': '&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;',
                'topNames': [
                    'Column Measures',
                    'Security Group',
                ],
            },
            'drillDown': [],
            'groupBy': [
                'level-1',
            ],
            'measures': [
                {
                    'aggMethod': 'sum',
                    'chartType': 'bar',
                    'name': 'krd_123|Prior Day|3M',
                    'title': '3M Prior Day Key Rate Duration',
                },
                {
                    'aggMethod': 'sum',
                    'chartType': 'bar',
                    'name': 'krd_123|Month End|3M',
                    'title': '3M Month End Key Rate Duration',
                },
            ],
            'sortBy': undefined,
            'sortOrder': undefined,
            'stacked': undefined,
            'topBottomFilterParams': undefined,
            'xAxisOverride': undefined,
        });
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

        component.storeChangedChartState({legend: false});
        settings = component.widget.displayInputs.get(ChartSettings.CHART_SETTINGS) as ChartSettings;
        expect(settings.legendShow).toBe(false);

        component.storeChangedChartState({legend: true});
        settings = component.widget.displayInputs.get(ChartSettings.CHART_SETTINGS) as ChartSettings;
        expect(settings.legendShow).toBe(true);

    });

    describe('updateSeriesBeforeCharting Test', () => {
        const customColor = new CustomColorPositiveNegative();
        it('isStacked', () => {
            const measures = [];
            const api = {
            data: [{name: 'Notional', data: [{qbstr: {negative: true}, color: undefined}, {qbstr: {negative: false}, color: undefined}]}],
            chartConfig: { measures }, chart: {
                yAxis: [{
                    update: jest.fn()
                }]
            }
        };
            customColor.isEnabled = true;
            customColor.positiveColor = '#FFFFFF';
            customColor.negativeColor = '#000000';
            component.widget.displayInputs.set('customColorPositiveNegative', customColor);
            component.customVizConfig.isStacked = true;
            component.updateSeriesBeforeCharting(api as any);
            expect(api.data[0].data[0].color).toBeUndefined();
            customColor.isEnabled = false;
            component.updateSeriesBeforeCharting(api as any);
            expect(api.data[0].data[0].color).toBeUndefined();
        });
        it('is Disabled', () => {
            const measures = [];
            const api = {
            data: [{name: 'Notional', data: [{qbstr: {negative: true}, color: undefined}, {qbstr: {negative: false}, color: undefined}]}],
            chartConfig: { measures }, chart: {
                yAxis: [{
                    update: jest.fn()
                }]
            }
        };
            customColor.isEnabled = false;
            customColor.positiveColor = '#FFFFFF';
            customColor.negativeColor = '#000000';
            component.widget.displayInputs.set('customColorPositiveNegative', customColor);
            component.customVizConfig.isStacked = false;
            component.updateSeriesBeforeCharting(api as any);
            expect(api.data[0].data[0].color).toBeUndefined();
        });
        it('is Enabled', () => {
            const measures = [];
            const api = {
            data: [{name: 'Notional', data: [{qbstr: {negative: true}, color: undefined}, {qbstr: {negative: false}, color: undefined}]}],
            chartConfig: { measures }, chart: {
                yAxis: [{
                    update: jest.fn()
                }]
            }
        };
            customColor.isEnabled = true;
            customColor.positiveColor = '#FFFFFF';
            customColor.negativeColor = '#000000';
            component.widget.displayInputs.set('customColorPositiveNegative', customColor);
            component.customVizConfig.isStacked = false;
            component.updateSeriesBeforeCharting(api as any);
            expect(api.data[0].data[0].color).toEqual('#000000');
            expect(api.data[0].data[1].color).toEqual('#FFFFFF');
        });
        it('tesDefaultSecondaryXYAxisSettings', () => {
            const measures = [];
            const api = {
            data: [{name: 'Notional Market Value', data: [{qbstr: {negative: true}, color: undefined}, {qbstr: {negative: false}, color: undefined}]},
            {name: 'Market Value', data: [{qbstr: {negative: true}, color: undefined}, {qbstr: {negative: false}, color: undefined}]}],
            chartConfig: { measures }, chart: {
                yAxis: [{
                    update: jest.fn(),
                    title: 'Notional Market Value'
                },{
                    update: jest.fn(),
                    title: 'Market Value'
                }]
            }
        };
            component.chartConfig = {
                measures: [{name: 'nmv_123', title: 'Notional Market Value', aggMethod: 'sum'},{name: 'marketvalue_123', title: 'Market Value', aggMethod: 'sum', axis: 1}],
                drillDown : ['level-2', 'level-3' ]
                };
            component.updateSeriesBeforeCharting(api as any);
            expect(api.chart.yAxis[0].title).toEqual('Notional Market Value');
            expect(api.chart.yAxis[1].title).toEqual('Market Value');
        });
        it('EnableSecondaryXYAxisIfSeconadrySettingsEnabled', () => {
            const measures = [];
            const api = {
            data: [{name: 'Notional Market Value', data: [{qbstr: {negative: true}, color: undefined}, {qbstr: {negative: false}, color: undefined}]}],
            chartConfig: { measures }, chart: {
                yAxis: [{
                    update: jest.fn(),
                    title: 'Notional Market Value'
                },{
                    update: jest.fn(),
                    title: ''
                }]
            }
        };
            component.chartConfig = {
                measures: [{name: 'nmv_123', title: 'Notional Market Value', aggMethod: 'sum'},{name: 'marketvalue_123', title: 'Market Value', aggMethod: 'sum', axis: 1}],
                drillDown : ['level-2', 'level-3' ]
                };
            component.updateSeriesBeforeCharting(api as any);
            expect(api.chart.yAxis[0].title).toEqual('Notional Market Value');
            expect(api.chart.yAxis[1].title).toEqual('');
        });
        it('SwitchSecondaryXYAxisIfSeconadrySettingsEnabled', () => {
            const measures = [];
            const api = {
            data: [{name: 'Market Value', data: [{qbstr: {negative: true}, color: undefined}, {qbstr: {negative: false}, color: undefined}]}],
            chartConfig: { measures }, chart: {
                yAxis: [{
                    update: jest.fn(),
                    title: ''
                },{
                    update: jest.fn(),
                    title: 'Market Value'
                }]
            }
        };
            component.chartConfig = {
                measures: [{name: 'nmv_123', title: 'Notional Market Value', aggMethod: 'sum'},{name: 'marketvalue_123', title: 'Market Value', aggMethod: 'sum', axis: 1}],
                drillDown : ['level-2', 'level-3' ]
                };
            component.updateSeriesBeforeCharting(api as any);
            expect(api.chart.yAxis[0].title).toEqual('');
            expect(api.chart.yAxis[1].title).toEqual('Market Value');
        });
    });

    describe('formatter Test', () => {
        let chartOptions;

        beforeEach(() => {
            const chartConfig = {measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}]};
            chartOptions = component['createChartOptions'](chartConfig);
        });

        it('should test toolTipFormatter when seriesName and category name are same', () => {
            const point = {
                name: 'Communication Services',
                value: 9568303.50379725,
                colorValue: 0.13950736798781777,
                series: {
                    name: 'Communication Services'
                },
                qbstr: {
                    negative: false,
                    measureName: 'pct_mv_1'
                },
                formatter: chartOptions['plotOptions']['series']['tooltip']['pointFormatter']
            };

            jest.spyOn(component['firstCol'].formatter, 'format').mockReturnValue('9,568');
            expect(component.tooltipPointFormatter(point)).toBe(`<b>pct_mv_1</b><br><b>&nbsp;Communication Services</b>: 9,568<br>`);
        });

        it('should test toolTipFormatter when seriesName and category name are diff', () => {
            const point = {
                name: 'Communication Services',
                value: 9568303.50379725,
                colorValue: 0.13950736798781777,
                series: {
                    name: 'Test Series'
                },
                qbstr: {
                    negative: false,
                    measureName: 'pct_mv_1'
                },
                formatter: chartOptions['plotOptions']['series']['tooltip']['pointFormatter']
            };


            jest.spyOn(component['firstCol'].formatter, 'format').mockReturnValue('9,568');
            expect(component.tooltipPointFormatter(point)).toBe(`<b>pct_mv_1</b><br><b>&nbsp;Communication Services</b>: 9,568<br>`);
        });

        it('should test toolTipFormatter when seriesName and category name are diff and negative true', () => {
            const point = {
                name: 'Communication Services',
                value: -9568303.50379725,
                colorValue: 0.13950736798781777,
                series: {
                    name: 'Test Series'
                },
                qbstr: {
                    negative: true,
                    measureName: 'pct_mv_1'
                },
                formatter: chartOptions['plotOptions']['series']['tooltip']['pointFormatter']
            };


            jest.spyOn(component['firstCol'].formatter, 'format').mockReturnValue('-9,568');
            expect(component.tooltipPointFormatter(point)).toBe(`<b>pct_mv_1</b><br><b>&nbsp;Communication Services</b>: -9,568<br>`);
        });

        it('should test toolTipFormatter when seriesName and category name are same and negative true', () => {
            const point = {
                name: 'Communication Services',
                value: -9568303.50379725,
                colorValue: 0.13950736798781777,
                series: {
                    name: 'Communication Services'
                },
                qbstr: {
                    negative: true,
                    measureName: 'pct_mv_1'
                },
                formatter: chartOptions['plotOptions']['series']['tooltip']['pointFormatter']
            };


            jest.spyOn(component['firstCol'].formatter, 'format').mockReturnValue('-9,568');
            expect(component.tooltipPointFormatter(point)).toBe(`<b>pct_mv_1</b><br><b>&nbsp;Communication Services</b>: -9,568<br>`);
        });

        it('should test toolTipFormatter when seriesName and category name are same and negative true and positive point value', () => {
            const point = {
                name: 'Communication Services',
                y: 9568303.50379725,
                colorValue: 0.13950736798781777,
                series: {
                    name: 'Communication Services'
                },
                qbstr: {
                    negative: true,
                    measureName: 'pct_mv_1'
                },
                formatter: chartOptions['plotOptions']['series']['tooltip']['pointFormatter']
            };
            jest.spyOn(component['firstCol'].formatter, 'format').mockReturnValue('9,568');
            expect(component.tooltipPointFormatter(point)).toBe(`<b>pct_mv_1</b><br><b>&nbsp;Communication Services</b>: 9,568<br>`);
        });

        it('should test toolTipFormatter for compare mode', () => {
            const barChartOptions = component['createChartOptions'](component.chartConfig);
            const testObj = {
                y: 9568303.50379725,
                qbstr: {
                    measureName: 'pct_mv_1',
                    negative: true
                },
                formatter: barChartOptions['plotOptions']['series']['tooltip']['pointFormatter']
            } as any;
            component.breakdownLevels = ['_ROOT_'];
            component.requestConfig.portfolio = 'Compare';
            expect(testObj.formatter()).toMatchSnapshot();
        });

        it('should test toolTipFormatter for compare mode with Date Override', () => {
            const barChartOptions = component['createChartOptions'](component.chartConfig);
            const testObj = {
                y: 9568303.50379725,
                qbstr: {
                    measureName: 'pct_mv_1|PEP',
                    negative: true
                },
                formatter: barChartOptions['plotOptions']['series']['tooltip']['pointFormatter']
            } as any;
            component['colsMap']['pct_mv_1|PEP'] = {
                columnKey: 'pct_mv_1|PEP',
                columnTitle: 'Market Value %',
                formatter: {format: (val) => val}
            } as any;
            component.breakdownLevels = ['_ROOT_'];
            component.requestConfig.portfolio = 'Compare';
            expect(testObj.formatter()).toMatchSnapshot();
        });

        it('should test barChartFormattingFunc', () => {
            component.chartConfig = {measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggFunction: 'sum'}]} as any;
            const obj = {value: 3, formatter: component['createFormatter']()};
            expect(obj.formatter()).toEqual(3);
        });

        it('should test barChartFormattingFunc with %', () => {
            component.chartConfig = {
                measures: [{
                    name: 'pct_mv_1',
                    title: 'pct_mv_1',
                    aggFunction: 'sum'
                }, {name: 'pct_mv_2', title: 'pct_mv_2', aggFunction: 'sum'}]
            } as any;
            const obj = {value: '3%', formatter: component['createFormatter']()};
            expect(obj.formatter()).toEqual('3%');
        });

        it('should test barChartFormattingFunc', () => {
            component.chartConfig = {
                measures: [{
                    name: 'pct_mv_1',
                    title: 'pct_mv_1',
                    aggFunction: 'sum'
                }, {name: 'pct_mv_2', title: 'pct_mv_2', aggFunction: 'sum'}]
            } as any;
            const obj = {value: 3, formatter: component['createFormatter']()};
            expect(obj.formatter()).toEqual(3);
        });

        it('should test tooltip PointFormatter for Bar #1', () => {
            const chartConfig: BarChartConfig<any> = {
                measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}],
                groupBy: ['level-1', 'sector'],
                stacked: 'sector'
            };
            component.chartConfig = chartConfig;
            component.customVizConfig.showTotal = true;
            const barChartOptions = component['createChartOptions'](chartConfig);

            const testObj: any = {
                pointFormatter: barChartOptions.plotOptions.series.tooltip.pointFormatter,
                custom: {
                    stackName: 'test'
                },
                category: 'test-cat',
                name: 'test-name',
                qbstr: {
                    stack: 'test-name',
                    measureName: 'pct_mv_1',
                },
                y: 1
            };
            expect(testObj.pointFormatter()).toMatchSnapshot();
        });

        it('should test tooltip PointFormatter for Bar #2', () => {
            const chartConfig: BarChartConfig<any> = {
                measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}],
                groupBy: ['level-1'],
                stacked: 'sector'
            };
            component.chartConfig = chartConfig;
            component.customVizConfig.showTotal = true;
            const barChartOptions = component['createChartOptions'](chartConfig);

            const testObj: any = {
                pointFormatter: barChartOptions.plotOptions.series.tooltip.pointFormatter,
                custom: {
                    stackName: 'test'
                },
                category: 'test-cat',
                name: 'test-name',
                qbstr: {
                    measureName: 'pct_mv_1',
                },
                y: 1
            };
            expect(testObj.pointFormatter()).toMatchSnapshot();
        });

        it('should test tooltip PointFormatter for Bar #3', () => {
            const chartConfig: BarChartConfig<any> = {
                measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}],
                groupBy: ['level-1']
            };
            component.chartConfig = chartConfig;
            component.customVizConfig.showTotal = true;
            const barChartOptions = component['createChartOptions'](chartConfig);

            const testObj: any = {
                pointFormatter: barChartOptions.plotOptions.series.tooltip.pointFormatter,
                custom: {
                    stackName: 'test'
                },
                category: 'test-cat',
                name: 'test-name',
                qbstr: {
                    measureName: 'pct_mv_1',
                },
                y: 1
            };
            expect(testObj.pointFormatter()).toMatchSnapshot();
        });

        it('should test tooltip PointFormatter for Bar #4', () => {
            const chartConfig: BarChartConfig<any> = {
                measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}],
                groupBy: ['sector', 'level-1'],
                stacked: 'sector'
            };
            component.chartConfig = chartConfig;
            component.customVizConfig.showTotal = true;
            const barChartOptions = component['createChartOptions'](chartConfig);

            const testObj: any = {
                pointFormatter: barChartOptions.plotOptions.series.tooltip.pointFormatter,
                category: 'test-cat',
                name: 'test-name',
                qbstr: {
                    stack: 'test-name-2',
                    measureName: 'pct_mv_1',
                },
                y: 1
            };
            expect(testObj.pointFormatter()).toMatchSnapshot();
        });

        it('should test yAxis label formatter for totals', () => {
            const chartConfig: BarChartConfig<any> = {
                measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}],
                groupBy: ['level-1', 'sector'],
                stacked: 'sector'
            };
            component.chartConfig = chartConfig;
            component.customVizConfig.showTotal = true;
            component['_widgetPayload'].widgetConfigType = WidgetConfigType.BAR;
            const barChartOptions = component['createChartOptions'](chartConfig);

            const totalCK = [new FilterIncludeKey(ROOT_LEVEL, ['PEP']), new FilterIncludeKey('level-1', ['Total']), new GroupByKey('level-1'), new AggregationKey('pct_mv_1', 'sum')];
            component.cube.set(createQK(totalCK), [{'level-1': '19-FEB-2020', pct_mv_1: 2}, {
                'level-1': '10-FEB-2020',
                pct_mv_1: 1
            }]);

            expect(barChartOptions.yAxis[0]['stackLabels']).toMatchObject({
                'enabled': true,
                'style': {
                    'fontWeight': 'bold',
                },
            });
            const testObj = {
                x: 0,
                stack: 'pct_mv_1',
                axis: {
                    chart: {
                        xAxis: [{categories: ['10-FEB-2020']}]
                    },
                },
                total: 1,
                formatter: barChartOptions.yAxis[0]['stackLabels']['formatter']
            };
            expect(testObj.formatter()).toEqual(1);
        });

        it('should test yAxis label formatter for totals - with column having dateOverride', (done) => {
            const chartConfig: BarChartConfig<any> = {
                measures: [{
                    name: 'port_stress_pnl_0825c7a4f64c4fe|Quarter End|Stock Market Drop Global',
                    title: 'Stock Market Drop Global Quarter End Stress P&L',
                    aggMethod: 'sum'
                }],
                groupBy: ['level-1', 'sector'],
                stacked: 'sector'
            };
            component.chartConfig = chartConfig;
            component.customVizConfig.showTotal = true;
            component['_widgetPayload'].widgetConfigType = WidgetConfigType.BAR;
            const barChartOptions = component['createChartOptions'](chartConfig);

            const totalCK = [new FilterIncludeKey(ROOT_LEVEL, ['PEP']), new FilterIncludeKey('level-1', ['Total']), new GroupByKey('level-1'), new AggregationKey('port_stress_pnl_0825c7a4f64c4fe|Quarter End|Stock Market Drop Global', 'sum')];
            component.cube.set(createQK(totalCK), [{
                'level-1': '19-FEB-2020',
                'port_stress_pnl_0825c7a4f64c4fe|Quarter End|Stock Market Drop Global': 2
            }, {
                'level-1': '10-FEB-2020',
                'port_stress_pnl_0825c7a4f64c4fe|Quarter End|Stock Market Drop Global': 1
            }]);

            component['cols'].push({
                columnKey: 'port_stress_pnl_0825c7a4f64c4fe|Quarter End|Stock Market Drop Global',
                overrideDateColumnOption: new OverrideDateColumnOption(),
                formatter: {format: (val) => val}
            } as any);
            const testObj = {
                x: 0,
                stack: 'Stock Market Drop Global Quarter End Stress P&L',
                axis: {
                    chart: {
                        xAxis: [{categories: ['10-FEB-2020']}]
                    }
                },
                formatter: barChartOptions.yAxis[0]['stackLabels']['formatter']
            };
            setTimeout(() => {
                expect(testObj.formatter()).toEqual(1);
                done();
            }, 1000);

        });

        it('should test yAxis label formatter for totals - when split key present', () => {
            const chartConfig: BarChartConfig<any> = {
                measures: [{name: 'krd_123', title: 'Key Rate Duration', aggMethod: 'sum'}],
                groupBy: ['_splitKey', 'level-1'],
                stacked: 'level-1'
            };
            component.chartConfig = chartConfig;
            component.customVizConfig.showTotal = true;
            component['_widgetPayload'].widgetConfigType = WidgetConfigType.BAR;
            component.requestConfig.columns.push({
                originalColumnTitle: 'Key Rate Duration',
                columnKey: 'krd_123',
                columnTitle: 'Key Rate Duration',
                formatter: {format: (val) => val},
                dataType: 'DOUBLE',
                columnTag: 'krd_123',
                isHidden: false,
                isSubtotalable: true
            });
            const barChartOptions = component['createChartOptions'](chartConfig);

            const totalCK = [new FilterIncludeKey(ROOT_LEVEL, ['PEP']), new FilterIncludeKey('_splitKey', ['Total']), new GroupByKey('_splitKey'), new AggregationKey('krd_123', 'sum')];
            component.cube.set(createQK(totalCK), [{'_splitKey': '1Y', krd_123: 2}, {
                '_splitKey': '3M',
                krd_123: 1
            }]);

            const testObj = {
                x: 0,
                stack: 'Key Rate Duration',
                axis: {
                    chart: {
                        xAxis: [{categories: ['3M']}]
                    },
                },
                total: -0.9,
                formatter: barChartOptions.yAxis[0]['stackLabels']['formatter']
            };
            expect(testObj.formatter()).toEqual('');
        });
    });

    describe('Child chart spritelet widget from parent table widget tests', () => {

        let customVizConfig;
        beforeEach(() => {
            customVizConfig = {};
            customVizConfig.leafLevels = ['cusip_0'];
            customVizConfig.chartType = 'column';
            customVizConfig.columns = [
                {
                    columnKey: 'pct_mv_1',
                    columnTitle: 'pct_mv_1',
                    formatter: {format: () => ''},
                    dataType: 'DOUBLE',
                    columnTag: 'pct_mv_1',
                    isHidden: false,
                    isSubtotalable: true,
                    originalColumnTitle: 'pct_mv_1'
                } as VizualizationColumnConfig
            ];
            customVizConfig.queryKeys = [
                new FilterIncludeKey('_ROOT_', ['PEP']),
                new FilterIncludeKey('level-1', ['INSURANCE'])
            ];

            widgetPayload.customVizConfig = customVizConfig;
        });

        it('should use customVizConfigs to override parent payload parameters', () => {
            fixture.componentRef.instance['initialized'] = true;
            fixture.componentRef.instance.widgetPayload = widgetPayload;
            fixture.detectChanges();

            expect(component.requestConfig.splitColumns.length).toBe(1);
            expect(component.requestConfig.splitColumns[0].columnKey).toBe('pct_mv_1');

            expect(component.defaultQueryKey.length).toBe(2);
            expect(component.defaultQueryKey[0].field).toBe('_ROOT_');
            expect(component.defaultQueryKey[0].type).toBe(QueryKeyEntryType.FILTER_INCLUDE);
            expect(component.defaultQueryKey[1].field).toBe('level-1');
            expect(component.defaultQueryKey[1].type).toBe(QueryKeyEntryType.FILTER_INCLUDE);

            expect(component.breakdownLevels.length).toBe(3);
            expect(component.breakdownLevels[0]).toBe('_ROOT_');
            expect(component.breakdownLevels[1]).toBe('level-1');
            expect(component.breakdownLevels[2]).toBe('cusip_0');
        });
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

    describe('Test isGroupingEnabled for bar Chart', () => {

        it('should group - both sector and stack breakdown is applied', () => {
            component.chartConfig = {
                groupBy: ['country', 'sector'],
                stacked: 'sector'
            } as any;
            expect(component.isGroupingEnabled()).toBeTruthy();
        });

        it('should group - only sector breakdown is applied', () => {
            component.chartConfig = {
                groupBy: ['country'],
            } as any;
            expect(component.isGroupingEnabled()).toBeTruthy();
        });

        it('should not group - only stacked breakdown is applied', () => {
            component.chartConfig = {
                groupBy: ['sector'],
                stacked: 'sector',
                measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}]
            } as any;
            expect(component.isGroupingEnabled()).toBeFalsy();
        });

        it('should not group - no breakdown is applied', () => {
            component.chartConfig = {
                groupBy: [],
                measures: [{name: 'pct_mv_1', title: 'pct_mv_1', aggMethod: 'sum'}]
            } as any;
            expect(component.isGroupingEnabled()).toBeFalsy();
        });

        it('should group - only stacked breakdown and split keys present', () => {
            component['colsMap'] = {};
            component['colsMap']['krd_123|3M'] = {
                columnKey: 'krd_123|3M',
                splitColumnHeaderName: 'Key Rate Duration'
            } as any;
            component['colsMap']['krd_123|1Y'] = {
                columnKey: 'krd_123|1Y',
                splitColumnHeaderName: 'Key Rate Duration'
            } as any;
            const measures = [{name: 'krd_123|3M', title: '3M Key Rate Duration', aggMethod: 'sum'},
                {name: 'krd_123|1Y', title: '1Y Key Rate Duration', aggMethod: 'sum'}];
            component.chartConfig = {
                groupBy: ['sector'],
                stacked: 'sector',
                measures
            } as any;
            expect(component.isGroupingEnabled()).toBeTruthy();
        });

        it('should not group - only stacked breakdown and single split key column present', () => {
            component['colsMap'] = {};
            component['colsMap']['port_stress_pnl_123|Stock Market Global'] = {
                columnKey: 'port_stress_pnl_123|Stock Market Global',
                splitColumnHeaderName: 'Stress P&L'
            } as any;
            const measures = [{
                name: 'port_stress_pnl_123|Stock Market Global',
                title: 'Stock Market Global Stress P&L',
                aggMethod: 'sum'
            }];
            component.chartConfig = {
                groupBy: ['sector'],
                stacked: 'sector',
                measures
            } as any;
            expect(component.isGroupingEnabled()).toBeFalsy();
        });

    });

    describe('Test isSingleSplitKeyColumn for bar Chart', () => {

        it('should return true if single split key column present', () => {
            const measures = [{
                name: 'port_stress_pnl_123|Stock Market Global',
                title: 'Stock Market Global Stress P&L',
                aggMethod: 'sum'
            },
                {
                    name: 'bench_stress_pnl_223|Stock Market Global',
                    title: 'Stock Market Global Benchmark Stress P&L',
                    aggMethod: 'sum'
                }];
            expect(component.isSingleSplitKeyColumn(measures)).toBeTruthy();
        });

        it('should return false if multi split key column present', () => {
            const measures = [{
                name: 'port_stress_pnl_123|Stock Market Global',
                title: 'Stock Market Global Stress P&L',
                aggMethod: 'sum'
            },
                {name: 'port_stress_pnl_123|Global Equity', title: 'Global Equity Stress P&L', aggMethod: 'sum'}];
            expect(component.isSingleSplitKeyColumn(measures)).toBeFalsy();
        });
    });

    describe('Test getNewMeasures for bar Chart', () => {

        it('test when date override applied - without compare mode', () => {
            component['colsMap'] = {};
            component['colsMap']['pct_mv_123|Current'] = {
                columnKey: 'pct_mv_123|Current',
                splitColumnHeaderName: 'Market Value %'
            } as any;
            component['colsMap']['pct_mv_123|Prior Day'] = {
                columnKey: 'pct_mv_123|Prior Day',
                splitColumnHeaderName: 'Market Value %'
            } as any;
            const measures = [{name: 'pct_mv_123|Current', title: 'Current Market Value %', aggMethod: 'sum'},
                {name: 'pct_mv_123|Prior Day', title: 'Prior Day Market Value %', aggMethod: 'sum'}];
            expect(component['getNewMeasures'](measures)).toEqual([
                {
                    'aggMethod': 'sum',
                    'name': 'pct_mv_123',
                    'title': 'Market Value %',
                },
            ]);
        });

        it('test bar chart tooltip when compare mode is on', () => {
            component['colsMap'] = {};
            component['colsMap']['pct_mv_9b8c|PEP'] = {
                columnKey: 'pct_mv_9b8c|PEP',
                splitColumnHeaderName: 'Market Value %'
            } as any;
            component['colsMap']['pct_mv_9b8c|OBSID'] = {
                columnKey: 'pct_mv_9b8c|OBSID',
                splitColumnHeaderName: 'Market Value %'
            } as any;
            const measures = [{name: 'pct_mv_9b8c|PEP', title: 'PEP Market Value %', aggMethod: 'sum'},
                {name: 'pct_mv_9b8c|OBSID', title: 'OBSID Market Value %', aggMethod: 'sum'}];
            expect(component['getNewMeasures'](measures, true)).toEqual([
                {
                    'aggMethod': 'sum',
                    'name': 'PEP',
                    'title': 'PEP',
                },
                {
                    'aggMethod': 'sum',
                    'name': 'OBSID',
                    'title': 'OBSID',
                },
            ]);
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

    it('should update chart options with qbstr visibility utils - bugfix/1093117', () => {
        const chartConfig: BarChartConfig<any> = {
            measures: [{name: 'pct_notional_val_0', title: 'Notional Market Value %', aggMethod: 'sum'}],
            groupBy: []
        };
        const chartOptions = component['createChartOptions'](chartConfig);
        component.updateChartOptionsWithVisibilityUtils(chartOptions, ChartType.COLUMN);

        expect(chartOptions.plotOptions.series.dataLabels['formatter']).not.toBeNull();
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

    it('should test toggleShowExploreDefaultBreadcrumbsState', () => {
        component.showExploreDefaultBreadcrumbs$ = new BehaviorSubject<boolean>(null);
        jest.spyOn(component.showExploreDefaultBreadcrumbs$, 'next');

        component['toggleShowExploreDefaultBreadcrumbsState']({target: {drilldownLevels: [{level: 1}]}});
        expect(component.showExploreDefaultBreadcrumbs$.next).toHaveBeenCalledWith(false);

        component['toggleShowExploreDefaultBreadcrumbsState']({});
        expect(component.showExploreDefaultBreadcrumbs$.next).toHaveBeenCalledWith(true);
    });

    it('should test showYAxisTitle', () => {
        component.chart = {
            yAxis: [
                {
                    update: jest.fn(),
                    title: {
                        text: 'Notional Market Value'
                    }
                },
                {
                    update: jest.fn(),
                    title: {
                        text: 'Market Value'
                    }
                }
            ]
        } as any;
        component.qbstrOptions = {
            yAxis: [
                {
                    opposite: true,
                    title: {
                        text: 'Market Value'
                    }
                },
                {
                    opposite: false,
                    title: {
                        text: 'Notional Market Value'
                    }
                }
            ]
        } as any;
        component['showYAxisTitle']({target: {drilldownLevels: []}});
        expect((component.chart.yAxis[0] as any).title.text).toBe("Notional Market Value");
        expect((component.chart.yAxis[1] as any).title.text).toBe("Market Value");
        expect((component.chart.yAxis as any).length).toEqual(2);
    });

    it('should test showYAxisTitle switch', () => {
         component.chart = {
            yAxis: [
                {
                    update: jest.fn(),
                    title: {
                        text: 'Market Value'
                    }
                },
                {
                    update: jest.fn(),
                    title: {
                        text: 'Notional Market Value'
                    }
                }
            ]
        } as any;
        component.qbstrOptions = {
            yAxis: [
                {
                    opposite: false,
                    title: {
                        text: 'Market Value'
                    }
                },
                {
                    opposite: true,
                    title: {
                        text: 'Notional Market Value'
                    }
                }
            ]
        } as any;
        component['showYAxisTitle']({target: {drilldownLevels: []}});
        expect((component.chart.yAxis[0] as any).title.text).toBe("Market Value");
        expect((component.chart.yAxis[1] as any).title.text).toBe("Notional Market Value");
    });

    function initializeWidgetPayload(request: any) {
        widgetPayload = {widgetConfigType: WidgetConfigType.BAR};
        widgetPayload.requestConfig = request;
        widgetPayload.responseConfig = data1.data as any;
        widgetPayload.cube = new ReactiveCube<any>([]);
        widgetPayload.breakdownLevels = [ROOT_LEVEL, 'level-1'];
        widgetPayload.customVizConfig = {
            showGridLines: 'true',
            chartType: 'column',
            comboChartColumns: [{colKey: 'pct_mv_1', secondaryAxis: true}]
        };
        colMap = {};
        request.columns.forEach(col => colMap[col.columnKey] = col);

        fixture = TestBed.createComponent(ExploreBarChartComponent);
        component = fixture.componentInstance;
        component.widgetPayload = widgetPayload;
        setupHighchartsSpy.mockImplementation(() => component.hc);
        generateOptionsSpy.mockImplementation(() => Highcharts.getOptions());
        component.widget = new Widget(WidgetConfigType.BAR);
        component['setInternalState'](widgetPayload);
        component.breakdownLevels = [ROOT_LEVEL, 'level-1'];
        component['colsMap'] = colMap;
        const simpleChanges: SimpleChanges = {
            widget: new SimpleChange(undefined, new Widget(WidgetConfigType.BAR), true),
            widgetPayload: new SimpleChange(undefined, widgetPayload, true)
        };
        component.ngOnChanges(simpleChanges);
    }

    it('should test showHiddenBreadcrumbs', () => {
        component.chart = {breadcrumbs: {options: {position: {y: -100}}, update: jest.fn()}} as any;
        component.showHiddenBreadcrumbs();
        expect(component.chart['breadcrumbs'].options.position.y).toBe(-50);
    });

    it('should add positive/negative class for line chart', () => {
        const customColor = new CustomColorPositiveNegative({isEnabled: true});
        component.widget.displayInputs.set(ChartWidgetInputConfigType.CUSTOM_COLOR_POSITIVE_NEGATIVE, customColor);

        const comboChartColumn = new ComboChartColumn({chartType: ColumnSeriesChartType.LINE});

        const cssClass = component['getChartMeasureCssStyleClass'](comboChartColumn);

        expect(cssClass).toBe('positive-negative-line-measure');
    });

    it('should add positive/negative and line style classes for line chart', () => {
        const customColor = new CustomColorPositiveNegative({isEnabled: true});
        component.widget.displayInputs.set(ChartWidgetInputConfigType.CUSTOM_COLOR_POSITIVE_NEGATIVE, customColor);

        const comboChartColumn = new ComboChartColumn({chartType: ColumnSeriesChartType.LINE, lineStyle: LineChartStyle.DASHED});

        const cssClass = component['getChartMeasureCssStyleClass'](comboChartColumn);

        expect(cssClass).toBe('positive-negative-line-measure custom-stroke-dashed');
    });

    it('should add line style class for line chart', () => {
        const comboChartColumn = new ComboChartColumn({chartType: ColumnSeriesChartType.LINE, lineStyle: LineChartStyle.DASHED});

        const cssClass = component['getChartMeasureCssStyleClass'](comboChartColumn);

        expect(cssClass).toBe('bar-chart-line-measure custom-stroke-dashed');
    });

    it('should add positive/negative class for line chart', () => {
        const comboChartColumn = new ComboChartColumn({chartType: ColumnSeriesChartType.BAR});

        const cssClass = component['getChartMeasureCssStyleClass'](comboChartColumn);

        expect(cssClass).toBeUndefined();
    });
});

