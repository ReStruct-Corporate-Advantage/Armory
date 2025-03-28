import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NumericColumnFormat, WidgetConfigType, WidgetDisplayInputConfigType} from '@blk/explore-ui-core';
import {TestUtils} from '@utils/test.utils';
import {Widget} from '@models/widget/widget.model';
import {ExploreCommitmentRiskChartComponent} from './explore-commitment-risk-chart.component';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {ReactiveCube} from '@qbstr/data-cube-reactive';
import Highcharts from 'highcharts';
import * as hcCore from '@qbstr/highcharts-core';
import {CommitmentRiskLegendSettings} from '@models/widget/inputs/chart-settings/commitment-risk-legend-settings.model';
import {LongPercentile, PercentileRange} from '@enums/commitment-risk-percentiles.enum';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';


describe('ExploreCommitmentRiskChartComponent', () => {
    let component: ExploreCommitmentRiskChartComponent;
    let fixture: ComponentFixture<ExploreCommitmentRiskChartComponent>;
    let widgetPayload: WidgetPayload;

    const setupHighchartsSpy = jest.spyOn(hcCore, 'setupHighcharts');
    const generateOptionsSpy = jest.spyOn(hcCore, 'generateOptions');

    beforeAll((done) => {
        TestUtils.initialize(done);
        const columnFormat = new NumericColumnFormat({scalingFactor: 1000000, decimalPlaces: 2, useThousandsSeparator: true});
        const request = {
            portfolio: 'PEP',
            columns: [
                {
                    columnKey: 'acrm_proj_nav',
                    columnTitle: 'Projected NAV',
                    columnTag: 'acrm_proj_nav',
                    formatter: {columnFormat}
                },
                {
                    columnKey: 'acrm_proj_contrib',
                    columnTitle: 'Projected Contributions',
                    columnTag: 'acrm_proj_contrib',
                    formatter: {columnFormat}
                },
                {
                    columnKey: 'acrm_proj_dist',
                    columnTitle: 'Projected Distributions',
                    columnTag: 'acrm_proj_dist',
                    formatter: {columnFormat}
                },
                {
                    columnKey: 'acrm_proj_net_cash',
                    columnTitle: 'Projected Net Cashflow',
                    columnTag: 'acrm_proj_net_cash',
                    formatter: {columnFormat}
                }
            ]
        };
        widgetPayload = {widgetConfigType: WidgetConfigType.COMMITMENT_RISK_CHART};
        widgetPayload.requestConfig = request;
        widgetPayload.cube = new ReactiveCube<any>([]);
        widgetPayload.breakdownLevels = ['_ROOT_', 'level-1', 'level-2'];
        widgetPayload.widgetSpecificData = {'seriesTitles': ['25th Percentile'], 'timeInterval': 2};
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ExploreCommitmentRiskChartComponent],
            imports: [AladdinAngularComponentsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
        fixture = TestBed.createComponent(ExploreCommitmentRiskChartComponent);
        component = fixture.componentInstance;
        component.widget = new Widget(WidgetConfigType.COMMITMENT_RISK_CHART);
        component.columnToDisplay = {label: 'Projected NAV', uid: 'acrm_proj_nav', eventData: {label: 'Projected NAV'}};
        setupHighchartsSpy.mockImplementation(() => component.hc);
        generateOptionsSpy.mockImplementation(() => Highcharts.getOptions());
        component['setInternalState'](widgetPayload);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test setInternalState - scenario selected', () => {
        component.widgetSpecificData.scenario = 'General recession';
        const commitmentRiskLegendSettings = new CommitmentRiskLegendSettings();
        commitmentRiskLegendSettings.showBaseScenario = true;
        commitmentRiskLegendSettings.showStressScenario = true;
        commitmentRiskLegendSettings.percentileRange = PercentileRange.P10P90;
        component.widget.dataStore.metaData.inputs.set(WidgetDisplayInputConfigType.COMMITMENT_RISK_LEGEND_SETTINGS, commitmentRiskLegendSettings);

        component['setInternalState'](widgetPayload);

        expect(component.legendSettings).toEqual(commitmentRiskLegendSettings);
        expect(component.chartToggles.legendToggleBtnDisplay).toEqual(false);
        expect(component.chartToggles.labelToggleBtnDisplay).toEqual(false);
        expect(component.chartToggles.legend).toEqual(false);
    });

    it('test getQuarterYear', () => {
        expect(component['getQuarterYear']('30-SEP-2028')).toBe('Q3 2028');
        expect(component['getQuarterYear']('31-DEC-2028')).toBe('Q4 2028');
    });

    describe('test toolTipFormatter', () => {
        it('test toolTipFormatter - base case', () => {
            component.widgetSpecificData.scenario = undefined;

            const data = {
                points: [
                    {
                        series: {name: '10-25th', index: 0},
                        point: {low: 2.41316375, high: 3.09032175},
                        y: 2.41316375
                    }, {
                        series: {name: '25-50th', index: 1},
                        point: {low: 3.09032175, high: 3.893713},
                        y: 3.09032175
                    }, {
                        series: {name: '50th', index: 2},
                        y: 3.09032175
                    }, {
                        series: {name: '50-75th', index: 3},
                        point: {low: 3.893713, high: 1114.7843255},
                        y: 3.893713
                    }, {
                        series: {name: '75-90th', index: 4},
                        point: {low: 1114.7843255, high: 5.746056},
                        y: 1114.7843255
                    }
                ],
                x: '31-MAR-2023',
                y: 2413163.75
            };
            const tooltipHtml = component['tooltipFormatter'](data);

            const expectedTooltipHtml = `<div>
                <div style="font-weight: bold;">Q1 2023</div>
                <div style="padding: 5px 0 2px 0;">Percentiles:</div>
                <div style="display: flex; align-items: center;">
                    <div style="color:#9BD5FC; padding:0 9px 0 5px;">
                        <span style="font-size: 20px;">●</span>
                    </div>
                    <div><strong>90th</strong>: 1,114.78 mm</div>
                </div><div style="display: flex; align-items: center;">
                    <div style="color:#3BADF8; padding:0 9px 0 5px;">
                        <span style="font-size: 20px;">●</span>
                    </div>
                    <div><strong>75th</strong>: 3.89 mm</div>
                </div><div style="display: flex; align-items: center;">
                    <div style="color:; padding:0 5px 0 0;">
                        <span style="font-size: 20px;">━</span>
                    </div>
                    <div><strong>50th</strong>: 3.09 mm</div>
                </div><div style="display: flex; align-items: center;">
                    <div style="color:#3BADF8; padding:0 9px 0 5px;">
                        <span style="font-size: 20px;">●</span>
                    </div>
                    <div><strong>25th</strong>: 3.09 mm</div>
                </div><div style="display: flex; align-items: center;">
                    <div style="color:#9BD5FC; padding:0 9px 0 5px;">
                        <span style="font-size: 20px;">●</span>
                    </div>
                    <div><strong>10th</strong>: 2.41 mm</div>
                </div>
            </div>`;

            expect(tooltipHtml).toBe(expectedTooltipHtml);
        });

        it('test toolTipFormatter - base vs stress case', () => {
            component.widgetSpecificData.scenario = 'General recession';

            const data = {
                points: [
                    {
                        series: {name: '50th Percentile|Base', index: 0},
                        y: 3.89822075
                    }, {
                        series: {name: '50th Percentile|General recession', index: 1},
                        y: 4.760712
                    }, {
                        series: {name: '10th Percentile-90th Percentile|Base', index: 2},
                        point: {low: 2.36634975, high: 5.7729345, qbstr: {measureName: 'acrm_proj_nav|Base'}},
                        y: 2.36634975
                    }, {
                        series: {name: '10th Percentile-90th Percentile|General recession', index: 3},
                        point: {low: 2.8971655, high: 6.939471, qbstr: {measureName: 'acrm_proj_nav|General recession'}},
                        y: 2.8971655
                    }
                ],
                x: '31-MAR-2023',
                y: 2.8971655
            };
            const tooltipHtml = component['tooltipFormatter'](data);

            const expectedTooltipHtml = `<div>
                <div style="font-weight: bold;">Q1 2023</div>
                <div style="padding: 5px 0 2px 0;">Percentiles:</div>
                <div style="display: flex; align-items: center;">
                    <div style="color:; padding:0 5px 0 0;">
                        <span style="font-size: 20px;">━</span>
                    </div>
                    <div><strong>50th</strong>: 3.90 mm</div>
                </div><div style="display: flex; align-items: center;">
                    <div style="color:; padding:0 5px 0 0;">
                        <span style="font-size: 20px;">┄</span>
                    </div>
                    <div><strong>50th</strong>: 4.76 mm</div>
                </div><div style="display: flex; align-items: center;">
                    <div style="color:#3BADF8; padding:0 9px 0 5px;">
                        <span style="font-size: 20px;">●</span>
                    </div>
                    <div><strong>25th</strong>: 5.77 mm</div>
                </div><div style="display: flex; align-items: center;">
                    <div style="color:#F8E71C; padding:0 9px 0 5px;">
                        <span style="font-size: 20px;">●</span>
                    </div>
                    <div><strong>25th</strong>: 6.94 mm</div>
                </div><div style="display: flex; align-items: center;">
                    <div style="color:#3BADF8; padding:0 9px 0 5px;">
                        <span style="font-size: 20px;">●</span>
                    </div>
                    <div><strong>10th</strong>: 2.37 mm</div>
                </div><div style="display: flex; align-items: center;">
                    <div style="color:#F8E71C; padding:0 9px 0 5px;">
                        <span style="font-size: 20px;">●</span>
                    </div>
                    <div><strong>10th</strong>: 2.90 mm</div>
                </div>
            </div>`;

            expect(tooltipHtml).toBe(expectedTooltipHtml);
        });
    });

    describe('Test update series before charting', () => {
        it('should update series before charting - base case', () => {
            component.widgetSpecificData.scenario = undefined;

            const testData = {
                data: [
                    {type: 'arearange', name: '10th Percentile-25th Percentile', zIndex: 0, data: []},
                    {type: 'arearange', name: '25th Percentile-50th Percentile', zIndex: 0, data: []},
                    {type: 'line', name: '50th Percentile', zIndex: 1, data: []},
                    {type: 'arearange', name: '50th Percentile-75th Percentile', zIndex: 0, data: []},
                    {type: 'arearange', name: '75th Percentile-90th Percentile', zIndex: 0, data: []}
                ]
            };

            component.updateSeriesBeforeCharting(testData);

            expect(testData.data[0].name).toBe('10-25th');
            expect(testData.data[1].name).toBe('25-50th');
            expect(testData.data[2].name).toBe('50th');
            expect(testData.data[3].name).toBe('50-75th');
            expect(testData.data[4].name).toBe('75-90th');
        });

        it('should update series before charting - base vs stress case', () => {
            component.widgetSpecificData.scenario = 'General recession';

            const testData = {
                data: [
                    {type: 'line', name: '50th Percentile|Base', zIndex: 1, data: []},
                    {type: 'line', name: '50th Percentile|General recession', zIndex: 1, data: []},
                    {type: 'arearange', name: '10th Percentile-90th Percentile|Base', zIndex: 0, data: []},
                    {type: 'arearange', name: '10th Percentile-90th Percentile|General recession', zIndex: 0, data: []}
                ]
            };

            component.updateSeriesBeforeCharting(testData);

            expect(testData.data[0].zIndex).toBe(1);
            expect(testData.data[1].zIndex).toBe(-1);
            expect(testData.data[2].zIndex).toBe(0);
            expect(testData.data[3].zIndex).toBe(-2);
        });
    });

    describe('Test createChartConfig', () => {
        it('should test createChartConfig - base case', () => {
            component.widgetSpecificData.scenario = null;
            const measures = [
                {
                    'name': 'acrm_proj_nav',
                    'title': 'Projected NAV',
                    'aggMethod': 'sum'
                },
                {
                    'name': 'acrm_proj_contrib',
                    'title': 'Projected Contributions',
                    'aggMethod': 'sum'
                },
                {
                    'name': 'acrm_proj_dist',
                    'title': 'Projected Distributions',
                    'aggMethod': 'sum'
                },
                {
                    'name': 'acrm_proj_net_cash',
                    'title': 'Projected Net Cashflow',
                    'aggMethod': 'sum'
                }
            ];

            const chartConfig = component.createChartConfig(measures);
            expect(chartConfig.groupBy).toEqual(['level-1', 'level-2']);
            expect(chartConfig.midline).toEqual(LongPercentile.P50);
            expect(chartConfig.showMidlineInLegend).toBeTruthy();
            expect(chartConfig.areaRanges).toEqual([
                [LongPercentile.P10, LongPercentile.P25],
                [LongPercentile.P25, LongPercentile.P50],
                [LongPercentile.P50, LongPercentile.P75],
                [LongPercentile.P75, LongPercentile.P90]
            ]);
            expect(chartConfig.knownColors).toEqual({
                series: {
                    [LongPercentile.P10 + '-' + LongPercentile.P25]: 'light-blue',
                    [LongPercentile.P25 + '-' + LongPercentile.P50]: 'dark-blue',
                    [LongPercentile.P50]: 'midline',
                    [LongPercentile.P50 + '-' + LongPercentile.P75]: 'dark-blue',
                    [LongPercentile.P75 + '-' + LongPercentile.P90]: 'light-blue'
                }
            });
        });

        describe('Test createChartConfig - base vs stress case', () => {
            const measures = [
                {
                    'name': 'acrm_proj_nav|Base',
                    'title': 'Projected NAV',
                    'aggMethod': 'sum'
                },
                {
                    'name': 'acrm_proj_nav|Fed Severely Adverse',
                    'title': 'Projected NAV',
                    'aggMethod': 'sum'
                },
                {
                    'name': 'acrm_proj_contrib|Base',
                    'title': 'Projected Contributions',
                    'aggMethod': 'sum'
                },
                {
                    'name': 'acrm_proj_contrib|Fed Severely Adverse',
                    'title': 'Projected Contributions',
                    'aggMethod': 'sum'
                },
                {
                    'name': 'acrm_proj_dist|Base',
                    'title': 'Projected Distributions',
                    'aggMethod': 'sum'
                },
                {
                    'name': 'acrm_proj_dist|Fed Severely Adverse',
                    'title': 'Projected Distributions',
                    'aggMethod': 'sum'
                },
                {
                    'name': 'acrm_proj_net_cash|Base',
                    'title': 'Projected Net Cashflow',
                    'aggMethod': 'sum'
                },
                {
                    'name': 'acrm_proj_net_cash|Fed Severely Adverse',
                    'title': 'Projected Net Cashflow',
                    'aggMethod': 'sum'
                }
            ];

            beforeEach(() => {
                component.widgetSpecificData.scenario = 'Fed Severely Adverse';
            });

            it('should test createChartConfig - both base and stress scenario / 10-90th selected', () => {
                component.legendSettings.showBaseScenario = true;
                component.legendSettings.showStressScenario = true;
                component.legendSettings.percentileRange = PercentileRange.P10P90;

                const chartConfig = component.createChartConfig(measures);

                expect(chartConfig.groupBy).toEqual(['level-1', 'level-2']);
                expect(chartConfig.midline).toEqual(LongPercentile.P50);
                expect(chartConfig.showMidlineInLegend).toBeFalsy();
                expect(chartConfig.areaRanges).toEqual([
                    [LongPercentile.P10, LongPercentile.P90]
                ]);
                expect(chartConfig.knownColors).toEqual({
                    series: {
                        [LongPercentile.P10 + '-' + LongPercentile.P90 + '|' + 'Base']: 'scenario-dark-blue',
                        [LongPercentile.P25 + '-' + LongPercentile.P75 + '|' + 'Base']: 'scenario-dark-blue',
                        [LongPercentile.P50 + '|' + 'Base']: 'midline',

                        [LongPercentile.P10 + '-' + LongPercentile.P90 + '|' + component.widgetSpecificData.scenario]: 'yellow',
                        [LongPercentile.P25 + '-' + LongPercentile.P75 + '|' + component.widgetSpecificData.scenario]: 'yellow',
                        [LongPercentile.P50 + '|' + component.widgetSpecificData.scenario]: 'scenario-midline'
                    }
                });
            });

            it('should test createChartConfig - only stress scenario / 25-75th selected', () => {
                component.legendSettings.showBaseScenario = false;
                component.legendSettings.showStressScenario = true;
                component.legendSettings.percentileRange = PercentileRange.P25P75;

                const chartConfig = component.createChartConfig(measures);

                expect(chartConfig.groupBy).toEqual(['level-1', 'level-2']);
                expect(chartConfig.midline).toEqual(LongPercentile.P50);
                expect(chartConfig.showMidlineInLegend).toBeFalsy();
                expect(chartConfig.areaRanges).toEqual([
                    [LongPercentile.P25, LongPercentile.P75]
                ]);
                expect(chartConfig.knownColors).toEqual({
                    series: {
                        [LongPercentile.P10 + '-' + LongPercentile.P90]: 'yellow',
                        [LongPercentile.P25 + '-' + LongPercentile.P75]: 'yellow',
                        [LongPercentile.P50]: 'scenario-midline'
                    }
                });
            });

            it('should test createChartConfig - only base scenario / 10-90th selected', () => {
                component.legendSettings.showBaseScenario = true;
                component.legendSettings.showStressScenario = false;
                component.legendSettings.percentileRange = PercentileRange.P10P90;

                const chartConfig = component.createChartConfig(measures);

                expect(chartConfig.groupBy).toEqual(['level-1', 'level-2']);
                expect(chartConfig.midline).toEqual(LongPercentile.P50);
                expect(chartConfig.showMidlineInLegend).toBeFalsy();
                expect(chartConfig.areaRanges).toEqual([
                    [LongPercentile.P10, LongPercentile.P90]
                ]);
                expect(chartConfig.knownColors).toEqual({
                    series: {
                        [LongPercentile.P10 + '-' + LongPercentile.P90]: 'scenario-dark-blue',
                        [LongPercentile.P25 + '-' + LongPercentile.P75]: 'scenario-dark-blue',
                        [LongPercentile.P50]: 'midline'
                    }
                });
            });
        });
    });
});
