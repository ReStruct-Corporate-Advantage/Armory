import {Report} from './report.model';
import {Workspace} from './workspace.model';
import {Widget} from '../widget/widget.model';
import {TestUtils} from '@utils/test.utils';
import {WidgetDataStore} from '../dataStore/widget-data-store.model';
import {
    ColumnConfig,
    CommonUtils,
    ConfigState,
    ConfigTypeFactory, CoreDefinitionStore,
    CoreFavoriteStore,
    CoreFavoriteUtils,
    Favorite,
    FavoriteCacheKey, TokenConstants,
    UseType,
    WidgetConfigType,
    WidgetInputType
} from '@blk/explore-ui-core';
import {ActiveCalculationColumnOption, AggregationColumnOption, ColumnSet} from '@blk/explore-ui-column-option';

import sample1 from '../../../../mocks/duplicateIdWidgetsIssue/sample1.json';
import sample2 from '../../../../mocks/duplicateIdWidgetsIssue/sample2.json';
import sample3 from '../../../../mocks/duplicateIdWidgetsIssue/sample3.json';
import sample4 from '../../../../mocks/duplicateIdWidgetsIssue/sample4.json';
import sample5 from '../../../../mocks/duplicateIdWidgetsIssue/sample5.json';
import sample6 from '../../../../mocks/duplicateIdWidgetsIssue/sample6.json';
import sample7 from '../../../../mocks/duplicateIdWidgetsIssue/sample7.json';
import sample8 from '../../../../mocks/duplicateIdWidgetsIssue/sample8.json';
import sample9 from '../../../../mocks/duplicateIdWidgetsIssue/sample9.json';
import sample10 from '../../../../mocks/duplicateIdWidgetsIssue/sample10.json';
import {ComparisonConfig} from '../config/comparison-config.model';
import {WorkspaceStore} from '../../stores';
import {FlatWorkpad} from './flat-workpad.model';
import {LongRunningHandlerService} from '@services/long-running-operations';
import {LongRunningTrackingDetails} from '@models/requests/long-running-tracking-details.model';
import {FundCusip} from '@models/widget/inputs/fund-cusip.model';
import {CommitmentHorizon} from '@models/widget/inputs/commitment-risk/commitment-horizon.model';
import {
    CommitmentHorizonSelectedTab
} from '@models/widget/inputs/commitment-risk/commitment-horizon-selected-tab.model';

/**
 * Test cases for Report model
 */
describe('Report', () => {
    let report: Report;
    let widget: Widget;

    beforeAll((done) => {
        TestUtils.initialize(done);
        WorkspaceStore.init();
        const comparisonConfig = new ComparisonConfig();
        comparisonConfig.portComparisonList = ['PEP', 'IP'];

        const comparisonConfigMap = new Map<number, ComparisonConfig>();
        comparisonConfigMap.set(1, comparisonConfig);
        const workpad: FlatWorkpad = new FlatWorkpad({
            reports: [{}],
            portfolio: {ticker: 'PEP'},
            comparisonConfigMap
        });
        WorkspaceStore.currentWorkpad$.next(workpad);
    });

    beforeEach(() => {
        report = new Report();
        report.title = 'report 1';
        widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        widget.id = 123;
        report.widgets = [widget];
        report.availableDataStores.set(widget.dataStore.name, widget.dataStore);
        report.comparisonConfigLegacyPlaceholder = new ComparisonConfig();
        report.comparisonConfigLegacyPlaceholder.portComparisonList = ['PEP12345', 'CORE-HQ54321'];
        report.comparisonConfigLegacyPlaceholder.portAnchorId = 'PEP12345';
    });

    it('configType Test', () => {
        expect(report.getConfigType()).toEqual(Report.configType);
    });

    it('Construct object and test getter/setters', (() => {
        expect(report).not.toBeUndefined();
        expect(report.widgets).not.toBeUndefined();
        expect(report.availableDataStores).not.toBeUndefined();
        // Validate that the get of the properties returns the correct values.
        expect(report.widgets.length).toBe(1);
        expect(report.availableDataStores.size).toBe(1);
    }));


    it('should test doCopyFrom', () => {
        const newReport = new Report();
        newReport.copyFrom(report);
        expect(newReport.widgets.length).toBe(1);
        expect(newReport.widgets[0].id).toEqual(123);
        expect(newReport.availableDataStores.size).toBe(1);
        const workspace = new Workspace();
        workspace.copyFrom(report);
        expect(workspace.workpads.length).toBe(0);
    });


    /**
     * Test calling serialize on the Report and then using that generated string to deserialize into a new Report and test it is the same.
     */
    it('Serialize/Deserialize test', (() => {
        report = new Report();
        report.title = 'Test Report';
        report.addWidget(createTestWidget('Widget1'));
        report.addWidget(createTestWidget('Widget2'));

        report.availableDataStores.set(report.widgets[0].dataStore.name, report.widgets[0].dataStore);
        report.availableDataStores.set(report.widgets[1].dataStore.name, report.widgets[1].dataStore);

        report.comparisonConfigLegacyPlaceholder.portComparisonList = ['PEP12345', 'CORE-HQ54321'];
        report.comparisonConfigLegacyPlaceholder.portAnchorId = 'PEP12345';

        // Convert the object to string and then back to json again.
        const serializedData = report.serialize();
        const newReport: Report = new Report();
        newReport.deserialize(serializedData);

        // Validate that the before and after are the same.
        expect(newReport).not.toBeUndefined();
        expect(newReport.title).toBe('Test Report');
        expect(newReport.widgets).not.toBeUndefined();
        expect(newReport.widgets.length).toBe(report.widgets.length);

        for (let i = 0; i < newReport.widgets.length; i++) {
            expect(newReport.widgets[i].equals(report.widgets[i])).toBeTruthy();
            expect(newReport.widgets[i].title).toBe(report.widgets[i].title);
        }
        expect(newReport.availableDataStores.size).toBe(report.availableDataStores.size);
        newReport.availableDataStores.forEach((value: WidgetDataStore, key: string) => {
            expect(value.equals(report.availableDataStores.get(key))).toBeTruthy();
        });
    }));

    it('Serialize/Deserialize test with fba and return spritletes from old explore', (() => {
        const columnsData = {
            'configType': 'columnSet',
            'columns': [
                {
                    'columnTag': 'rfv_ftitle',
                    'columnKey': 'rfv_ftitle',
                    'positionColumnType': 'ALL'
                },
                {
                    'columnTag': 'rfv_exp_port',
                    'columnKey': 'rfv_exp_port_35',
                    'positionColumnType': 'PORT',
                    'displayWidth': 80.6845703125,
                    'title': 'Factor Exposure'
                },
                {
                    'columnTag': 'rfv_exp_bench',
                    'columnKey': 'rfv_exp_bench_756',
                    'positionColumnType': 'BENCH',
                    'displayWidth': 273.576171875,
                    'title': 'Benchmark Factor Exposure'
                }
            ],
            'type': 'RISK_REPORT'
        };
        const data: any = {
            widgets: [{configType: 'praBar', id: 1}, {configType: 'praPie', id: 2}, {configType: 'praSecurityContribution', id : 3}, {configType: 'returnsTimeSeries', id : 4}],
            availableDataStores: [{observers: [1], name: 'dataStore1', metaData: {columns: columnsData}}, {observers: [2], name: 'dataStore2', metaData: {columns: columnsData}}, {observers: [3], name: 'dataStore3', metaData: {columns: columnsData}}, {observers: [4], name: 'dataStore4', metaData: {columns: columnsData}}]
        };
        report = new Report(data);
        expect(report.availableDataStores.get('dataStore1').isDependentOnParentForData).toBeTruthy();
        expect(report.availableDataStores.get('dataStore2').isDependentOnParentForData).toBeTruthy();
        expect(report.availableDataStores.get('dataStore3').isDependentOnParentForMetaData).toBeTruthy();
        expect(report.availableDataStores.get('dataStore4').isDependentOnParentForMetaData).toBeTruthy();
    }));


    /**
     * Since the data for all the existing favorites is a little different I have a test case to ensure we can deserialize them.
     */
    it('Deserialize from existing json', function() {

        const serializedData = '{"id":"","widgets":[{"title":"Risk and Exposure","type":"agGrid","sizeX":8,"sizeY":6,"row":0,"col":0,"isMaximized":false,"inputs":{"columns":{"columns":[{"columnTag":"sec_desc"}]}}}]}';
        const newReport: Report = new Report(JSON.parse(serializedData));

        // Validate that the before and after are the same.
        expect(newReport).not.toBeUndefined();
        expect(newReport.widgets).not.toBeUndefined();
        expect(newReport.widgets.length).toBe(1);
        expect(newReport.widgets[0].title).toBe('Risk and Exposure');
        expect(newReport.widgets[0].dataStore.metaData.inputs.get('columns') instanceof ColumnSet).toBeTruthy();
        const colSet: ColumnSet = newReport.widgets[0].dataStore.metaData.inputs.get('columns') as ColumnSet;
        expect(colSet.columns.length).toBe(1);
        expect(colSet.columns[0].columnTag).toBe('sec_desc');
    });

    /**
     * Test doDeserialize
     */
    it('doDeserialize from existing json with data stores', function() {
        const serializedData = '{"configType":"layout","title":"Report 1","widgets":[{"configType":"praWidget","title":"Factor Based Analysis","sizeX":8,"sizeY":6,"type":"praAgGrid","row":0,"col":0,"id":1541604375333,"inputs":null},{"title":"Risk and Exposure","type":"agGrid","sizeX":8,"sizeY":6,"row":0,"col":8,"inputs":{"columns":{"configType":"report","columns":[{"columnTag":"sec_desc","columnKey":"sec_desc","positionColumnType":"ALL"},{"columnTag":"cusip","columnKey":"cusip_0","positionColumnType":"ALL"},{"columnTag":"pct_mv","columnKey":"pct_mv_1","positionColumnType":"PORT"}]},"breakdownTree":{"breakdown":{"isConfigured":true,"breakdownTitle":"Security Group","subSectors":[{"breakdownRuleType":"String","useNoneBuckets":true,"groupByColumn":{"columnName":"Security Group","columnTag":"sec_group","positionColumnType":"ALL"}}]},"title":"Security Group"},"topBottomFilter":{},"normalizedFlag":{"inputType":"normalizedFlag","data":null},"riskAndExposureAdditionalSettings":{"inputType":"riskAndExposureAdditionalSettings","data":{"benchmarkPositionAggregationType":"NONE","closedPositionAggregationType":"NONE","portfolioPositionAggregationType":"NONE"}},"expandedState":{"expandedPaths":[["_ROOT_"]]}}}],"availableDataStores":[{"name":"3cd3e14f-b9c8-4b03-a077-3a7b81b3d140","type":"RiskDataStore","metaData":{"riskColumnSettings":{"disableFactorBreakdown":true,"disableSectorBreakdown":false,"columnSetSelected":"{\\"label\\":\\"Analytical VAR\\",\\"value\\":\\"PRISM_VAR_COLS_AVAR\\"}","groupingTypeSelected":"{\\"label\\":\\"Sector Only\\",\\"value\\":\\"sectorOnly\\",\\"matchingRiskCategory\\":\\"BELONGS_TO_SECTOR_REPORT\\"}","isPortGroupSummaryRequest":false,"showSecurities":false},"expandedState":{"expandedPaths":[["_ROOT_"]]},"breakdownTree":{"breakdown":{"breakdownTitle":"GICS","subSectors":[{"breakdownRuleType":"String","useNoneBuckets":true,"groupByColumn":{"columnName":"GICS Sector","columnTag":"gics_1_sector","dataType":"STRING","positionColumnType":"ALL"}}]},"title":"GICS"},"riskFactorBreakdown":{"breakdown":{"subSectors":[{"breakdownRuleType":"String","useNoneBuckets":true,"groupByColumn":{"columnName":"BRS Standard Factor Tree Level 1","columnTag":"BRS_GOLD_5","dataType":"STRING","positionColumnType":"ALL"},"subSectors":[{"breakdownRuleType":"String","useNoneBuckets":true,"groupByColumn":{"columnName":"BRS Standard Factor Tree Level 2","columnTag":"BRS_GOLD_4","dataType":"STRING","positionColumnType":"ALL"},"subSectors":[{"breakdownRuleType":"String","useNoneBuckets":true,"groupByColumn":{"columnName":"BRS Standard Factor Tree Level 3","columnTag":"BRS_GOLD_3","dataType":"STRING","positionColumnType":"ALL"},"subSectors":[{"breakdownRuleType":"String","useNoneBuckets":true,"groupByColumn":{"columnName":"BRS Standard Factor Tree Level 4","columnTag":"BRS_GOLD_2","dataType":"STRING","positionColumnType":"ALL"},"subSectors":[{"breakdownRuleType":"String","useNoneBuckets":true,"groupByColumn":{"columnName":"BRS Standard Factor Tree Level 5","columnTag":"BRS_GOLD_1","dataType":"STRING","positionColumnType":"ALL"}}]}]}]}]}]}},"widgetPerformanceSettings":{"shortName":"MTD","timePeriodName":"Month to Date","numberOfPeriods":1,"fromDateValue":"29-FEB-2016","toDateValue":"10-MAR-2016"},"widgetRiskSettings":{"economyRiskSettings":{},"exposureRiskSettings":{},"advancedRiskSettings":{}},"columns":{"configType":"report","columns":[{"columnTag":"rfv_ftitle","columnKey":"rfv_ftitle","positionColumnType":"ALL"},{"columnTag":"rfv_factor_type","columnKey":"rfv_factor_type_2","positionColumnType":"ALL"},{"columnTag":"rfv_factor_lvl","columnKey":"rfv_factor_lvl_64","positionColumnType":"ALL"},{"columnTag":"rfv_factor_vol","columnKey":"rfv_factor_vol_5","positionColumnType":"ALL"},{"columnTag":"rfv_exp_port","columnKey":"rfv_exp_port_35","positionColumnType":"PORT"},{"columnTag":"rfv_exp_bench","columnKey":"rfv_exp_bench_756","positionColumnType":"BENCH"},{"columnTag":"rfv_exp_active","columnKey":"rfv_exp_active_546","positionColumnType":"ACTIVE"},{"columnTag":"rfv_std_port","columnKey":"rfv_std_port_776","positionColumnType":"PORT"},{"columnTag":"rfv_std_bench","columnKey":"rfv_std_bench_5633","positionColumnType":"BENCH"},{"columnTag":"rfv_std_active","columnKey":"rfv_std_active_63456","positionColumnType":"ACTIVE"},{"columnTag":"rfv_contrib_port","columnKey":"rfv_contrib_port_4","positionColumnType":"PORT"},{"columnTag":"rfv_contrib_bench","columnKey":"rfv_contrib_bench_674","positionColumnType":"BENCH"},{"columnTag":"rfv_contrib_active","columnKey":"rfv_contrib_active_645","positionColumnType":"ACTIVE","optionValues":{"decimalPlaces":2,"useThousandsSeparator":true,"scaling":0.0001,"portfolioRiskAttributes":{"economyRiskSettings":{},"exposureRiskSettings":{},"advancedRiskSettings":{},"configType":"RISK_SETTINGS"}}}]}},"observers":[1541604375333]}]}';
        report = new Report(JSON.parse(serializedData));

        // Validate that the before and after are the same.
        expect(report).not.toBeUndefined();
        expect(report.widgets).not.toBeUndefined();
        expect(report.widgets.length).toEqual(2);
        expect(report.widgets[0].title).toEqual('Factor Based Analysis');
        expect(report.widgets[1].title).toEqual('Risk and Exposure');
        expect(report.availableDataStores.size).toEqual(2);
        expect(report.widgets[0].dataStore.metaData.inputs.get('columns') instanceof ColumnSet).toBeTruthy();
        expect(report.widgets[1].dataStore.metaData.inputs.get('columns') instanceof ColumnSet).toBeTruthy();
    });

    /**
     * serialize/deserialize with nested favorite
     */
    it('serialize/deserialize with nested favorite', (() => {
        report = new Report();
        widget = new Widget(WidgetConfigType.PRA);
        let colSet = new ColumnSet();
        colSet.id = 12345;
        colSet.columns.push(new ColumnConfig('total_ret'));
        widget.dataStore.metaData.inputs.set('columns', colSet);

        report.addWidget(widget);
        report.availableDataStores.set(widget.dataStore.name, widget.dataStore);

        const serializedData = report.serialize(true);

        const columns: any = {
            'isGlobalFav': false,
            'favId': 12345,
            'configType': 'columnSet'
        };

        expect(columns).toEqual(serializedData.availableDataStores[widget.dataStore.name].metaData.inputs['columns']);

        jest.spyOn(ConfigTypeFactory, 'getFavoriteConfig').mockReturnValueOnce(widget.dataStore.metaData.inputs.get('columns'));

        report = new Report(serializedData);
        colSet = report.availableDataStores.get(report.widgets[0].dataStore.name).metaData.inputs.get('columns') as ColumnSet;
        expect(colSet.id).toBe(12345);
        expect(colSet.columns.length).toBe(1);
        expect(colSet.columns[0].columnTag).toBe('total_ret');
    }));

    /**
     * Test doDeserialize
     */
    it('doDeserialize for old saved data', (() => {

        const serializedData = '{"configType":"layout","title":"Report 1","widgets":[{"title":"Factor Based Analysis","type":"praAgGrid","sizeX":14,"sizeY":6,"row":0,"col":0,"inputs":{"riskColumnSettings":{"inputType":"riskColumnSettings","data":null},"columns":{"configType":"report","columns":[{"columnTag":"rfv_ftitle","columnKey":"rfv_ftitle","positionColumnType":"ALL"},{"columnTag":"rfv_factor_type","columnKey":"rfv_factor_type_2","positionColumnType":"ALL"},{"columnTag":"rfv_factor_lvl","columnKey":"rfv_factor_lvl_64","positionColumnType":"ALL"},{"columnTag":"rfv_factor_vol","columnKey":"rfv_factor_vol_5","positionColumnType":"ALL"},{"columnTag":"rfv_exp_port","columnKey":"rfv_exp_port_35","positionColumnType":"PORT"},{"columnTag":"rfv_exp_bench","columnKey":"rfv_exp_bench_756","positionColumnType":"BENCH"},{"columnTag":"rfv_exp_active","columnKey":"rfv_exp_active_546","positionColumnType":"ACTIVE"},{"columnTag":"rfv_std_port","columnKey":"rfv_std_port_776","positionColumnType":"PORT"},{"columnTag":"rfv_std_bench","columnKey":"rfv_std_bench_5633","positionColumnType":"BENCH"},{"columnTag":"rfv_std_active","columnKey":"rfv_std_active_63456","positionColumnType":"ACTIVE"},{"columnTag":"rfv_contrib_port","columnKey":"rfv_contrib_port_4","positionColumnType":"PORT"},{"columnTag":"rfv_contrib_bench","columnKey":"rfv_contrib_bench_674","positionColumnType":"BENCH"},{"columnTag":"rfv_contrib_active","columnKey":"rfv_contrib_active_645","positionColumnType":"ACTIVE"}]},"breakdownTree":{"isGlobalFav":false,"configType":"breakdown"},"riskFactorBreakdown":{"breakdown":{"isConfigured":true,"subSectors":[{"breakdownRuleType":"String","useNoneBuckets":true,"groupByColumn":{"columnName":"BRS Standard Factor Tree Level 1","columnTag":"BRS_GOLD_5","dataType":"STRING","positionColumnType":"ALL"},"subSectors":[{"breakdownRuleType":"String","useNoneBuckets":true,"groupByColumn":{"columnName":"BRS Standard Factor Tree Level 2","columnTag":"BRS_GOLD_4","dataType":"STRING","positionColumnType":"ALL"},"subSectors":[{"breakdownRuleType":"String","useNoneBuckets":true,"groupByColumn":{"columnName":"BRS Standard Factor Tree Level 3","columnTag":"BRS_GOLD_3","dataType":"STRING","positionColumnType":"ALL"},"subSectors":[{"breakdownRuleType":"String","useNoneBuckets":true,"groupByColumn":{"columnName":"BRS Standard Factor Tree Level 4","columnTag":"BRS_GOLD_2","dataType":"STRING","positionColumnType":"ALL"},"subSectors":[{"breakdownRuleType":"String","useNoneBuckets":true,"groupByColumn":{"columnName":"BRS Standard Factor Tree Level 5","columnTag":"BRS_GOLD_1","dataType":"STRING","positionColumnType":"ALL"}}]}]}]}]}]}},"widgetRiskSettings":{"economyRiskSettings":{},"exposureRiskSettings":{},"advancedRiskSettings":{},"configType":"RISK_SETTINGS"},"widgetPerformanceSettings":{"shortName":"MTD","timePeriodName":"Month To Date","numberOfPeriods":1,"data":{}},"expandedState":{"expandedPaths":[["_ROOT_"]]},"sortedColumns":[]}}]}';
        report = new Report();
        report.deserialize(JSON.parse(serializedData));

        // Validate that the before and after are the same.
        expect(report).not.toBeUndefined();
        expect(report.widgets).not.toBeUndefined();
        expect(report.widgets.length).toEqual(1);
        expect(report.widgets[0].title).toEqual('Factor Based Analysis');
        expect(report.availableDataStores.size).toEqual(1);
        expect(report.availableDataStores.get(report.widgets[0].dataStore.name).metaData.inputs.get('columns') instanceof ColumnSet).toBeTruthy();
    }));

    it('test doDeserialize with ACRM 1.0 chart widget', () => {
        const serializedReportWithLegacyChart = {
            'configType': 'WIDGETS_REPORT',
            'widgets': [
                {
                    'configType': 'commitmentRiskChartWidget',
                    'title': 'Commitment Risk',
                    'id': 48932385,
                    'sizeX': 16,
                    'sizeY': 8,
                    'col': 0,
                    'row': 0,
                    'displayInputs': {
                        'chartSettings': {
                            'labelShow': false,
                            'legendShow': true
                        },
                        'columnState': {
                            'columns': []
                        },
                        'expandedState': {
                            'expandedPaths': [
                                [
                                    '_ROOT_'
                                ]
                            ]
                        }
                    },
                    'dataStore': '9a5e3727-6c95-40dd-8ecd-53780ea9e27d'
                }
            ],
            'availableDataStores': {
                '9a5e3727-6c95-40dd-8ecd-53780ea9e27d': {
                    'name': '9a5e3727-6c95-40dd-8ecd-53780ea9e27d',
                    'metaData': {
                        'inputs': {
                            'columns': {
                                'configType': 'columnSet',
                                'columns': [
                                    {
                                        'columnTag': 'market_val',
                                        'columnKey': 'market_val',
                                        'positionColumnType': 'PORT',
                                        'optionValues': [
                                            {
                                                'customTitle': 'Value of Private Equity',
                                                'configType': 'customColumnTitle'
                                            },
                                            {
                                                'decimalPlaces': 0,
                                                'useThousandsSeparator': true,
                                                'scaling': 1,
                                                'configType': 'numericColumnFormatColumnOption'
                                            }
                                        ]
                                    },
                                    {
                                        'columnTag': 'contributions',
                                        'columnKey': 'contributions',
                                        'positionColumnType': 'ALL',
                                        'optionValues': [
                                            {
                                                'customTitle': 'Capital Called',
                                                'configType': 'customColumnTitle'
                                            },
                                            {
                                                'decimalPlaces': 0,
                                                'useThousandsSeparator': true,
                                                'scaling': 1,
                                                'configType': 'numericColumnFormatColumnOption'
                                            }
                                        ]
                                    },
                                    {
                                        'columnTag': 'distributions',
                                        'columnKey': 'distributions',
                                        'positionColumnType': 'ALL',
                                        'optionValues': [
                                            {
                                                'customTitle': 'Capital Distributed',
                                                'configType': 'customColumnTitle'
                                            },
                                            {
                                                'decimalPlaces': 0,
                                                'useThousandsSeparator': true,
                                                'scaling': 1,
                                                'configType': 'numericColumnFormatColumnOption'
                                            }
                                        ]
                                    },
                                    {
                                        'columnTag': 'commitment',
                                        'columnKey': 'commitment',
                                        'positionColumnType': 'ALL',
                                        'optionValues': [
                                            {
                                                'customTitle': 'Cash Position',
                                                'configType': 'customColumnTitle'
                                            },
                                            {
                                                'decimalPlaces': 0,
                                                'useThousandsSeparator': true,
                                                'scaling': 1,
                                                'configType': 'numericColumnFormatColumnOption'
                                            }
                                        ]
                                    }
                                ],
                                'columnState': {
                                    'columns': [
                                        {
                                            'columnKey': 'market_val'
                                        },
                                        {
                                            'columnKey': 'contributions'
                                        },
                                        {
                                            'columnKey': 'distributions'
                                        },
                                        {
                                            'columnKey': 'commitment'
                                        }
                                    ]
                                }
                            },
                            'breakdownTree': {
                                'breakdown': {
                                    'isConfigured': true,
                                    'breakdownTitle': 'Percentiles',
                                    'subSectors': [
                                        {
                                            'breakdownRuleType': 'String',
                                            'groupByColumn': {
                                                'columnName': 'Percentiles',
                                                'columnTag': 'percentiles',
                                                'positionColumnType': 'ALL'
                                            },
                                            'useNoneBuckets': true
                                        }
                                    ]
                                },
                                'title': 'Percentiles'
                            },
                            'commitmentHorizon': 12,
                            'fundCusip': 'BLKBB24B2',
                            'commitmentHorizonTab': {
                                'selectedTab': 'commitment'
                            }
                        }
                    }
                }
            },
            'comparisonConfigId': 38696999,
            'title': 'Report 1'
        };
        // ACRM 1.0 enabled, should remain ACRM 1.0 widget
        CoreDefinitionStore.tokens[TokenConstants.ENABLE_COMMITMENT_RISK] = 'Y';
        CoreDefinitionStore.tokens[TokenConstants.ENABLE_COMMITMENT_RISK_LEGACY] = 'Y';

        report = new Report(serializedReportWithLegacyChart);
        expect(report.widgets[0].configType).toEqual(WidgetConfigType.COMMITMENT_RISK_CHART_LEGACY);
        let fundCusip = report.availableDataStores.get(report.widgets[0].dataStore.name).metaData.inputs.get(WidgetInputType.FUND_CUSIP) as FundCusip;
        expect(fundCusip.cusip).toEqual('BLKBB24B2');
        let commitmentHorizon = report.availableDataStores.get(report.widgets[0].dataStore.name).metaData.inputs.get(WidgetInputType.COMMITMENT_HORIZON) as CommitmentHorizon;
        expect(commitmentHorizon.horizon).toEqual(12);
        let selectedTab = report.availableDataStores.get(report.widgets[0].dataStore.name).metaData.inputs.get(WidgetInputType.COMMITMENT_RISK_SELECTED_TAB) as CommitmentHorizonSelectedTab;
        expect(selectedTab.selectedTab).toEqual('commitment');

        // ACRM 1.0 disabled, should convert to ACRM 2.0 widget
        CoreDefinitionStore.tokens[TokenConstants.ENABLE_COMMITMENT_RISK_LEGACY] = 'N';

        report = new Report(serializedReportWithLegacyChart);
        expect(report.widgets[0].configType).toEqual(WidgetConfigType.COMMITMENT_RISK_CHART);
        fundCusip = report.availableDataStores.get(report.widgets[0].dataStore.name).metaData.inputs.get(WidgetInputType.FUND_CUSIP) as FundCusip;
        expect(fundCusip.cusip).toEqual('BLKBB24B2');
        commitmentHorizon = report.availableDataStores.get(report.widgets[0].dataStore.name).metaData.inputs.get(WidgetInputType.COMMITMENT_HORIZON) as CommitmentHorizon;
        expect(commitmentHorizon.horizon).toEqual(12);
        selectedTab = report.availableDataStores.get(report.widgets[0].dataStore.name).metaData.inputs.get(WidgetInputType.COMMITMENT_RISK_SELECTED_TAB) as CommitmentHorizonSelectedTab;
        expect(selectedTab.selectedTab).toEqual('commitment');
    });

    it('test doDeserialize with ACRM 1.0 table widget', () => {
        const serializedReportWithLegacyTable = {
            'configType': 'WIDGETS_REPORT',
            'widgets': [
                {
                    'configType': 'commitmentRiskWidget',
                    'title': 'Commitment Risk',
                    'id': 323642479,
                    'sizeX': 16,
                    'sizeY': 8,
                    'col': 0,
                    'row': 0,
                    'displayInputs': {
                        'columnState': {
                            'columns': [
                                {
                                    'columnKey': '_ROOT_',
                                    'width': 200,
                                    'pinned': null
                                },
                                {
                                    'columnKey': 'percentiles',
                                    'width': 81,
                                    'pinned': null
                                },
                                {
                                    'columnKey': 'time_break_even',
                                    'width': 120,
                                    'pinned': null
                                },
                                {
                                    'columnKey': 'time_first_dist',
                                    'width': 148,
                                    'pinned': null
                                },
                                {
                                    'columnKey': 'time_to_through',
                                    'width': 102,
                                    'pinned': null
                                },
                                {
                                    'columnKey': 'trough_magn',
                                    'width': 116,
                                    'pinned': null
                                },
                                {
                                    'columnKey': 'distb_wal',
                                    'width': 108,
                                    'pinned': null
                                },
                                {
                                    'columnKey': 'simulated_hrzn_1yr|TVPI',
                                    'width': 49,
                                    'pinned': null
                                },
                                {
                                    'columnKey': 'simulated_hrzn_1yr|DPI',
                                    'width': 46,
                                    'pinned': null
                                },
                                {
                                    'columnKey': 'simulated_hrzn_1yr|Fund Value',
                                    'width': 94,
                                    'pinned': null
                                },
                                {
                                    'columnKey': 'simulated_hrzn_1yr|Cash Position',
                                    'width': 100,
                                    'pinned': null
                                },
                                {
                                    'columnKey': 'simulated_hrzn_3yr|TVPI',
                                    'width': 49,
                                    'pinned': null
                                },
                                {
                                    'columnKey': 'simulated_hrzn_3yr|DPI',
                                    'width': 46,
                                    'pinned': null
                                },
                                {
                                    'columnKey': 'simulated_hrzn_3yr|Fund Value',
                                    'width': 80,
                                    'pinned': null
                                },
                                {
                                    'columnKey': 'simulated_hrzn_3yr|Cash Position',
                                    'width': 100,
                                    'pinned': null
                                }
                            ]
                        },
                        'expandedState': {
                            'expandedPaths': [
                                [
                                    '_ROOT_'
                                ]
                            ]
                        }
                    },
                    'dataStore': '31508d6e-ee48-41cd-871c-05e2dd794fc4'
                }
            ],
            'availableDataStores': {
                '31508d6e-ee48-41cd-871c-05e2dd794fc4': {
                    'name': '31508d6e-ee48-41cd-871c-05e2dd794fc4',
                    'metaData': {
                        'inputs': {
                            'columns': {
                                'configType': 'columnSet',
                                'columns': [
                                    {
                                        'columnTag': 'market_val',
                                        'columnKey': 'market_val',
                                        'positionColumnType': 'PORT',
                                        'optionValues': [
                                            {
                                                'customTitle': 'Value of Private Equity',
                                                'configType': 'customColumnTitle'
                                            },
                                            {
                                                'decimalPlaces': 0,
                                                'useThousandsSeparator': true,
                                                'scaling': 1,
                                                'configType': 'numericColumnFormatColumnOption'
                                            }
                                        ]
                                    },
                                    {
                                        'columnTag': 'contributions',
                                        'columnKey': 'contributions',
                                        'positionColumnType': 'ALL',
                                        'optionValues': [
                                            {
                                                'customTitle': 'Capital Called',
                                                'configType': 'customColumnTitle'
                                            },
                                            {
                                                'decimalPlaces': 0,
                                                'useThousandsSeparator': true,
                                                'scaling': 1,
                                                'configType': 'numericColumnFormatColumnOption'
                                            }
                                        ]
                                    },
                                    {
                                        'columnTag': 'distributions',
                                        'columnKey': 'distributions',
                                        'positionColumnType': 'ALL',
                                        'optionValues': [
                                            {
                                                'customTitle': 'Capital Distributed',
                                                'configType': 'customColumnTitle'
                                            },
                                            {
                                                'decimalPlaces': 0,
                                                'useThousandsSeparator': true,
                                                'scaling': 1,
                                                'configType': 'numericColumnFormatColumnOption'
                                            }
                                        ]
                                    },
                                    {
                                        'columnTag': 'commitment',
                                        'columnKey': 'commitment',
                                        'positionColumnType': 'ALL',
                                        'optionValues': [
                                            {
                                                'customTitle': 'Cash Position',
                                                'configType': 'customColumnTitle'
                                            },
                                            {
                                                'decimalPlaces': 0,
                                                'useThousandsSeparator': true,
                                                'scaling': 1,
                                                'configType': 'numericColumnFormatColumnOption'
                                            }
                                        ]
                                    }
                                ],
                                'columnState': {
                                    'columns': [
                                        {
                                            'columnKey': 'market_val'
                                        },
                                        {
                                            'columnKey': 'contributions'
                                        },
                                        {
                                            'columnKey': 'distributions'
                                        },
                                        {
                                            'columnKey': 'commitment'
                                        }
                                    ]
                                }
                            },
                            'breakdownTree': {
                                'isGlobalFav': false,
                                'favId': 111597,
                                'configType': 'breakdown'
                            },
                            'commitmentHorizon': 12,
                            'fundCusip': 'BLKBB24B2',
                            'commitmentHorizonTab': {
                                'selectedTab': 'table'
                            }
                        }
                    }
                }
            },
            'comparisonConfigId': 35869085,
            'title': 'Report 1'
        };

        // ACRM 1.0 enabled, should remain ACRM 1.0 widget
        CoreDefinitionStore.tokens[TokenConstants.ENABLE_COMMITMENT_RISK] = 'Y';
        CoreDefinitionStore.tokens[TokenConstants.ENABLE_COMMITMENT_RISK_LEGACY] = 'Y';

        report = new Report(serializedReportWithLegacyTable);
        expect(report.widgets[0].configType).toEqual(WidgetConfigType.COMMITMENT_RISK_LEGACY);
        let fundCusip = report.availableDataStores.get(report.widgets[0].dataStore.name).metaData.inputs.get(WidgetInputType.FUND_CUSIP) as FundCusip;
        expect(fundCusip.cusip).toEqual('BLKBB24B2');
        let commitmentHorizon = report.availableDataStores.get(report.widgets[0].dataStore.name).metaData.inputs.get(WidgetInputType.COMMITMENT_HORIZON) as CommitmentHorizon;
        expect(commitmentHorizon.horizon).toEqual(12);
        let selectedTab = report.availableDataStores.get(report.widgets[0].dataStore.name).metaData.inputs.get(WidgetInputType.COMMITMENT_RISK_SELECTED_TAB) as CommitmentHorizonSelectedTab;
        expect(selectedTab.selectedTab).toEqual('table');

        // ACRM 1.0 disabled, should convert to ACRM 2.0 widget
        CoreDefinitionStore.tokens[TokenConstants.ENABLE_COMMITMENT_RISK_LEGACY] = 'N';

        report = new Report(serializedReportWithLegacyTable);
        expect(report.widgets[0].configType).toEqual(WidgetConfigType.COMMITMENT_RISK);
        fundCusip = report.availableDataStores.get(report.widgets[0].dataStore.name).metaData.inputs.get(WidgetInputType.FUND_CUSIP) as FundCusip;
        expect(fundCusip.cusip).toEqual('BLKBB24B2');
        commitmentHorizon = report.availableDataStores.get(report.widgets[0].dataStore.name).metaData.inputs.get(WidgetInputType.COMMITMENT_HORIZON) as CommitmentHorizon;
        expect(commitmentHorizon.horizon).toEqual(12);
        selectedTab = report.availableDataStores.get(report.widgets[0].dataStore.name).metaData.inputs.get(WidgetInputType.COMMITMENT_RISK_SELECTED_TAB) as CommitmentHorizonSelectedTab;
        expect(selectedTab.selectedTab).toEqual('table');
    });

    it('should test when id is copied over as favId', () => {
        const data = report.serialize();
        data.id = 12345;

        const cacheFav: Favorite = new Favorite();
        cacheFav.data = data;
        cacheFav.id = 12345;
        const favItem: FavoriteCacheKey = CoreFavoriteUtils.getFavoriteKey(false, 12345);
        CoreFavoriteStore.favoriteCache.set(favItem.toString(), cacheFav);

        const favData: any = {
            id: 12345
        };

        const newReport = new Report(favData);
        expect(newReport.widgets.length).toBe(1);
        expect(newReport.widgets[0].id).toEqual(123);
    });

    /**
     * Scenario -
     * Duplicate RnE (126)
     * Duplicate RA (127)
     * RA and FBA with same Id and datastore absent for RA (128)
     *
     * Expect -
     * RnE get unique Ids
     * RA and their datastores get unique Ids
     * RA gets deleted, FBA remains as it is
     */
    it('Tests handleDuplicateIdsForWidgets method - 1: sample1.json', function() {
        report = new Report();
        const favoriteData = sample1;
        jest.spyOn(CommonUtils, 'generateUniqueIdAsString').mockReturnValue('-0.999999');
        report.handleDuplicateIdsForWidgets(favoriteData.widgets, favoriteData.availableDataStores);
        expect(JSON.stringify(favoriteData)).toEqual('{"widgets":[{"configType":"riskExposure","title":"Risk And Exposure","id":"-0.999999","inputs":{"expandedState":{"expandedPaths":[[]]}}},{"configType":"riskExposure","title":"Risk And Exposure","id":"-0.999999","inputs":{"expandedState":{"expandedPaths":[[]]}}},{"configType":"returnsWidget","title":"Return Analysis","id":"-0.999999","inputs":null},{"configType":"returnsWidget","title":"Return Analysis","id":"-0.999999","inputs":null},{"configType":"praWidget","title":"Factor Based Analysis","id":128,"inputs":null}],"availableDataStores":[{"configType":"ReturnsDataStore","name":"2f261028-2be3-433a-b415-8c5801e751c7","observers":["-0.999999"]},{"configType":"ReturnsDataStore","name":"2f261028-2be3-433a-b415-fd789jh79879e","observers":["-0.999999"]},{"configType":"RiskDataStore","name":"2f261028-2be3-433a-b415-fd789jh79879e","observers":[128]}]}');
    });

    /**
     * Scenario -
     * Duplicate RA (1561363549219)
     * unique RA (1561363549221)
     *
     * Expect -
     * RA and their datastores get unique Ids
     * Unique RA untouched
     */
    it('Tests handleDuplicateIdsForWidgets method - 2: sample2.json', function() {
        report = new Report();
        const favoriteData = sample2;
        jest.spyOn(CommonUtils, 'generateUniqueIdAsString').mockReturnValue('-0.999999');
        report.handleDuplicateIdsForWidgets(favoriteData.widgets, favoriteData.availableDataStores);
        expect(JSON.stringify(favoriteData)).toEqual('{"widgets":[{"configType":"returnsWidget","title":"Return Analysis","type":"returnGrid","id":"-0.999999","inputs":null},{"configType":"returnsWidget","title":"Return Analysis","type":"returnGrid","id":"-0.999999","inputs":null},{"configType":"returnsWidget","title":"Top 10 Detractors","type":"returnGrid","id":1561363549221,"inputs":null}],"availableDataStores":[{"configType":"ReturnsDataStore","name":"8860dc90-45f6-48b2-a816-8910a18e76dd","observers":["-0.999999"],"metaData":{"expandedState":{"expandedPaths":[["_ROOT_"]]}}},{"configType":"ReturnsDataStore","name":"56dd1f18-4bad-4103-9a48-19f0058af343","observers":["-0.999999"],"metaData":{"expandedState":{"expandedPaths":[["_ROOT_"]]}}},{"configType":"ReturnsDataStore","name":"b7af7408-6d56-4597-81ce-4d14d65bf8ed","observers":[1561363549221],"metaData":{"expandedState":{"expandedPaths":[["_ROOT_"],["_ROOT_","Unassigned"]]}}}]}');
    });


    /**
     * Scenario -
     * unique RA
     *
     * Expect -
     * one RA gets deleted since datastore for it is absent
     */
    it('Tests handleDuplicateIdsForWidgets method - 3: sample3.json', function() {
        report = new Report();
        const favoriteData = sample3;
        jest.spyOn(CommonUtils, 'generateUniqueIdAsString').mockReturnValue('-0.999999');
        report.handleDuplicateIdsForWidgets(favoriteData.widgets, favoriteData.availableDataStores);
        expect(JSON.stringify(favoriteData)).toEqual('{"widgets":[{"configType":"returnsWidget","title":"Top 11 Detractors","type":"returnGrid","id":1561363549221,"inputs":null},{"configType":"returnsWidget","title":"Top 11 Detractors","type":"returnGrid","id":1568444581859,"inputs":null}],"availableDataStores":[{"configType":"ReturnsDataStore","name":"b7af7408-6d56-4597-81ce-4d14d65bf8ed","observers":[1561363549221],"metaData":{"expandedState":{"expandedPaths":[["_ROOT_"],["_ROOT_","Unassigned"]]}}},{"configType":"ReturnsDataStore","name":"7992c88c-87d1-4272-b664-b0123bc158f0","observers":[1568444581859],"metaData":{"expandedState":{"expandedPaths":[["_ROOT_"],["_ROOT_","Unassigned"]]}}}]}');
    });

    /**
     * Scenario -
     * unique RnE
     *
     * Expect -
     * no changes
     */
    it('Tests handleDuplicateIdsForWidgets method - 4: sample4.json', function() {
        report = new Report();
        const favoriteData = sample4;
        jest.spyOn(CommonUtils, 'generateUniqueIdAsString').mockReturnValue('-0.999999');
        report.handleDuplicateIdsForWidgets(favoriteData.widgets, favoriteData.availableDataStores);
        expect(JSON.stringify(favoriteData)).toEqual('{"widgets":[{"configType":"riskExposure","title":"Risk And Exposure","id":126,"inputs":{"expandedState":{"expandedPaths":[[]]}}},{"configType":"riskExposure","title":"Risk And Exposure","id":127,"inputs":{"expandedState":{"expandedPaths":[[]]}}},{"configType":"riskExposure","title":"Risk And Exposure","id":128,"inputs":{"expandedState":{"expandedPaths":[[]]}}}],"availableDataStores":[]}');
    });


    /**
     * Scenario -
     * Duplicate RnE (126)
     * one unique RA (127)
     * 2 RA and 1 FBA with duplicate Ids (128)
     * unique FBA (129, 130)
     *
     * Expect -
     * RnE gets unique Ids
     * RA gets removed since no datastore (127)
     * FBA (129) removed since no datastore
     */
    it('Tests handleDuplicateIdsForWidgets method - 5: sample5.json', function() {
        report = new Report();
        const favoriteData = sample5;
        jest.spyOn(CommonUtils, 'generateUniqueIdAsString').mockReturnValue('-0.999999');
        report.handleDuplicateIdsForWidgets(favoriteData.widgets, favoriteData.availableDataStores);
        expect(JSON.stringify(favoriteData)).toEqual('{"widgets":[{"configType":"riskExposure","title":"Risk And Exposure","id":"-0.999999","inputs":{"expandedState":{"expandedPaths":[[]]}}},{"configType":"riskExposure","title":"Risk And Exposure","id":"-0.999999","inputs":{"expandedState":{"expandedPaths":[[]]}}},{"configType":"returnsWidget","title":"Return Analysis","id":"-0.999999","inputs":null},{"configType":"returnsWidget","title":"Return Analysis","id":"-0.999999","inputs":null},{"configType":"praWidget","title":"Factor Based Analysis","id":128,"inputs":null},{"configType":"praWidget","title":"Factor Based Analysis","id":130,"inputs":null}],"availableDataStores":[{"configType":"ReturnsDataStore","name":"2f261028-2be3-433a-b415-8c5801e751c7","observers":["-0.999999"]},{"configType":"ReturnsDataStore","name":"2f261028-2be3-433a-b415-fd789jh79879e","observers":["-0.999999"]},{"configType":"RiskDataStore","name":"2f261028-2be3-433a-b415-fd789jh79879e","observers":[128]},{"configType":"ReturnsDataStore","name":"2f261028-2be3-433a-b415-fd789jh79879e","observers":[129]},{"configType":"RiskDataStore","name":"2f261028-2be3-433a-b415-fd789jh79879e","observers":[130]}]}');
    });

    /**
     * Scenario - Multiple RA widgets
     * Dupliate RA - (1568708023340 - 2) (1568708023343 - 3) (1568708023345 - 3) (1568708023346 - 2) (1568708023346 - 2)
     *
     * Expect -
     * All duplicate RA and their datastores get unique Id
     */
    it('Tests handleDuplicateIdsForWidgets method - 6: sample6.json', function() {
        report = new Report();
        const favoriteData = sample6;
        jest.spyOn(CommonUtils, 'generateUniqueIdAsString').mockReturnValue('-0.999999');
        report.handleDuplicateIdsForWidgets(favoriteData.widgets, favoriteData.availableDataStores);
        expect(JSON.stringify(favoriteData)).toEqual('{"widgets":[{"configType":"returnsWidget","title":"Return Analysis","type":"returnGrid","id":1568708023332,"inputs":null},{"configType":"returnsWidget","title":"MTD Return Analysis - Top & Bottom 10","type":"returnGrid","id":1568708023334,"inputs":null},{"configType":"returnsWidget","title":"Return Analysis","type":"returnGrid","id":1568708023336,"inputs":null},{"configType":"returnsWidget","title":"QTD Return Analysis - Top & Bottom 10","type":"returnGrid","id":1568708023339,"inputs":null},{"configType":"returnsWidget","title":"Return Analysis","type":"returnGrid","id":"-0.999999","inputs":null},{"configType":"returnsWidget","title":"Return Analysis","type":"returnGrid","id":"-0.999999","inputs":null},{"configType":"returnsWidget","title":"Return Analysis","type":"returnGrid","id":1568708023341,"inputs":null},{"configType":"returnsWidget","title":"YTD Return Analysis - Top & Bottom 10","type":"returnGrid","id":1568708023342,"inputs":null},{"configType":"returnsWidget","title":"Return Analysis","type":"returnGrid","id":"-0.999999","inputs":null},{"configType":"returnsWidget","title":"Return Analysis","type":"returnGrid","id":"-0.999999","inputs":null},{"configType":"returnsWidget","title":"Return Analysis","type":"returnGrid","id":"-0.999999","inputs":null},{"configType":"returnsWidget","title":"3m Industry Return Analysis","type":"returnGrid","row":29,"col":12,"id":1568708023344,"inputs":null},{"configType":"returnsWidget","title":"Return Analysis","type":"returnGrid","id":"-0.999999","inputs":null},{"configType":"returnsWidget","title":"Return Analysis","type":"returnGrid","id":"-0.999999","inputs":null},{"configType":"returnsWidget","title":"Return Analysis","type":"returnGrid","id":"-0.999999","inputs":null},{"configType":"returnsWidget","title":"Return Analysis","type":"returnGrid","id":"-0.999999","inputs":null},{"configType":"returnsWidget","title":"Return Analysis","type":"returnGrid","id":"-0.999999","inputs":null},{"configType":"returnsWidget","title":"Return Analysis","type":"returnGrid","id":"-0.999999","inputs":null},{"configType":"returnsWidget","title":"Return Analysis","type":"returnGrid","id":"-0.999999","inputs":null},{"configType":"returnsWidget","title":"Custom Return Analysis - Top & Bottom 10","type":"returnGrid","id":1568708023348,"inputs":null},{"configType":"returnsWidget","title":"Custom Industry Return Analysis","type":"returnGrid","id":1568708023350,"inputs":null}],"availableDataStores":[{"configType":"ReturnsDataStore","name":"44ca43f7-04e7-46d4-9cd8-0dc80f9e2f40","observers":[1568708023332]},{"configType":"ReturnsDataStore","name":"0d3fe10d-858c-4317-b697-5176e8defc82","observers":[1568708023334]},{"configType":"ReturnsDataStore","name":"a4aab26c-d1ff-406b-ab4f-acca1d6a1e81","observers":[1568708023336]},{"configType":"ReturnsDataStore","name":"0bc3da01-353a-42c4-8088-5ed106e3be98","observers":[1568708023339]},{"configType":"ReturnsDataStore","name":"fc245607-79f9-4a68-a773-fa1b7972c0e8","observers":["-0.999999"]},{"configType":"ReturnsDataStore","name":"16cee66c-fa6c-4e13-8896-b983db53f38e","observers":["-0.999999"]},{"configType":"ReturnsDataStore","name":"6211dc91-0ef0-4f7c-8b7c-8743adf83893","observers":[1568708023341]},{"configType":"ReturnsDataStore","name":"a75e2e7e-bc4a-4841-866a-06898c2fd3dc","observers":[1568708023342]},{"configType":"ReturnsDataStore","name":"f279704e-62e5-48f4-9d3f-006b0d2fb0a2","observers":["-0.999999"]},{"configType":"ReturnsDataStore","name":"3154236b-1350-4500-b1bf-c24b1407dc2c","observers":["-0.999999"]},{"configType":"ReturnsDataStore","name":"49e4d590-5e16-455e-b5c2-8446ec72f4bd","observers":["-0.999999"]},{"configType":"ReturnsDataStore","name":"638765ca-1f5a-4f0a-889d-da10cf7d3bc2","observers":[1568708023344]},{"configType":"ReturnsDataStore","name":"c37bc30a-d3ce-41e9-a559-ebe30b23ad16","observers":["-0.999999"]},{"configType":"ReturnsDataStore","name":"4f9e0dc6-433d-443c-a941-2e009dbed1f5","observers":["-0.999999"]},{"configType":"ReturnsDataStore","name":"09ee9d6f-726b-4f52-9594-fbd904c4b980","observers":["-0.999999"]},{"configType":"ReturnsDataStore","name":"a5250787-ae51-41f5-b341-987eddf01377","observers":["-0.999999"]},{"configType":"ReturnsDataStore","name":"8cdec5a9-bb98-4eb6-8f06-73181062c265","observers":["-0.999999"]},{"configType":"ReturnsDataStore","name":"c1f050f4-3488-4aaa-a77f-fd0ed13da498","observers":["-0.999999"]},{"configType":"ReturnsDataStore","name":"1e6e413a-c0c3-4919-ac32-b8329e9fc4ef","observers":["-0.999999"]},{"configType":"ReturnsDataStore","name":"4105c0ac-9837-491b-bcbd-3290ecb3f4d3","observers":[1568708023348]},{"configType":"ReturnsDataStore","name":"863e93a0-f6db-4547-8ff3-b373f56dac75","observers":[1568708023350]}]}');
    });

    /**
     * Scenario -
     * Old RA widgets: no datastores but input are present, widgetId instead of id
     * 2 RA with duplicate and one with unique widgetId's
     *
     * Expect -
     * 2 RA get unique widgetId's
     */
    it('Tests handleDuplicateIdsForWidgets method - 7: sample7.json', function() {
        report = new Report();
        const favoriteData = sample7;
        jest.spyOn(CommonUtils, 'generateUniqueIdAsString').mockReturnValue('-0.999999');
        report.handleDuplicateIdsForWidgets(favoriteData.widgets, favoriteData.availableDataStores);
        expect(JSON.stringify(favoriteData)).toEqual('{"widgets":[{"title":"Return Analysis","type":"returnGrid","inputs":{"expandedState":{"expandedPaths":[["_ROOT_"]]},"sortedColumns":[]},"widgetId":"-0.999999","linkedWidgets":[1549943160399,1549943175805,1549943196485]},{"title":"Return Analysis","type":"returnGrid","inputs":{"expandedState":{"expandedPaths":[["_ROOT_"]]},"sortedColumns":[]},"widgetId":"-0.999999","linkedWidgets":[1549943160399,1549943175805,1549943196485]},{"title":"Return Analysis","type":"returnGrid","inputs":{"expandedState":{"expandedPaths":[["_ROOT_"],["_ROOT_","Government Related"],["_ROOT_","Government Related","Agency"],["_ROOT_","Government Related","Agency","Owned No Guarantee"]]},"sortedColumns":[]},"widgetId":1549943321616,"linkedWidgets":[1549943330019,1549943338903,1549943354902]}],"availableDataStores":[]}');
    });

    /**
     * Scenario -
     * Old widgets (RA, RnE, PGS): no datastores but input are present, widgetId instead of id
     * Unique widgetId's
     *
     * Expect -
     * no change
     */
    it('Tests handleDuplicateIdsForWidgets method - 8: sample8.json', function() {
        report = new Report();
        const favoriteData = sample8;
        jest.spyOn(CommonUtils, 'generateUniqueIdAsString').mockReturnValue('-0.999999');
        report.handleDuplicateIdsForWidgets(favoriteData.widgets, favoriteData.availableDataStores);
        expect(JSON.stringify(favoriteData)).toEqual('{"widgets":[{"title":"Return Analysis","type":"returnGrid","inputs":{"expandedState":{"expandedPaths":[["_ROOT_"]]},"sortedColumns":[]},"widgetId":1549943244866},{"title":"Risk and Exposure","type":"agGrid","inputs":{"expandedState":{"expandedPaths":[["_ROOT_"]]},"sortedColumns":[]}},{"configType":"pgsWidget","title":"Portfolio Group Summary","type":"pgsGrid","id":1549944010460,"inputs":{"expandedState":{"allExpanded":true},"sortedColumns":[]}}],"availableDataStores":[]}');
    });

    it('Tests handleDuplicateIdsForWidgets method - 9: sample9.json', function() {
        report = new Report();
        const favoriteData = sample9;
        jest.spyOn(CommonUtils, 'generateUniqueIdAsString').mockReturnValue('-0.999999');
        report.handleDuplicateIdsForWidgets(favoriteData.widgets, favoriteData.availableDataStores);
        expect(JSON.stringify(favoriteData)).toEqual('{"widgets":[{"configType":"returnsTimeSeries","title":"Time Series for BLK ICS USD LEAF AGENCY DIST","type":"returnsSpritelet","id":1569825897971,"inputs":null,"sectorPathRules":[{"lineItem":null,"newWeight":null,"ruleType":"Sector"}]},{"configType":"returnsWidget","title":"Return Analysis","sizeX":8,"sizeY":6,"type":"returnGrid","row":0,"col":8,"id":1569825892330,"inputs":null}],"availableDataStores":[{"configType":"ReturnsDataStore","name":"f7262e18-773b-4460-9791-dc7b0daa2fb6","observers":[1569825897971,1569825892330],"metaData":{"expandedState":{"expandedPaths":[["_ROOT_"]]}}},{"configType":"ReturnsDataStore","name":"18152b4f-8a44-4bc0-b422-8ca077c454dc","observers":[1569825897971],"parentDataStore":"f7262e18-773b-4460-9791-dc7b0daa2fb6","metaData":{"columns":{"configType":"columnSet"}}}]}');
    });

    it('Tests handleDuplicateIdsForWidgets method - 10: sample10.json', function() {
        report = new Report();
        let uniqueWidgetId = 126126126126126;
        const favoriteData = sample10;
        jest.spyOn(CommonUtils, 'generateUniqueIdAsString').mockImplementation(() => String(uniqueWidgetId++));
        report.handleDuplicateIdsForWidgets(favoriteData.widgets, favoriteData.availableDataStores);
        console.log(JSON.stringify(favoriteData));
        expect(JSON.stringify(favoriteData)).toEqual('{"widgets":[{"configType":"riskExposure","title":"Risk And Exposure123","type":"agGrid","id":"126126126126130","inputs":{"expandedState":{"expandedPaths":[["_ROOT_"]]},"sortedColumns":[]}},{"configType":"riskExposure","title":"Risk And Exposure345","type":"agGrid","id":"126126126126131","inputs":{"expandedState":{"expandedPaths":[["_ROOT_"]]},"sortedColumns":[]}},{"configType":"returnsWidget","title":"Return Analysis","type":"returnGrid","id":"126126126126126","inputs":null},{"configType":"returnsTimeSeries","title":"Time Series for AJINOMOTO INC","type":"returnsSpritelet","id":1569864891253,"inputs":null,"pnlID":"SecurityGroup.EQUITY.S60109063","nodeDesc":"AJINOMOTO INC","sectorPathRules":[{"lineItem":null,"newWeight":null,"ruleType":"Sector"}]},{"configType":"praWidget","title":"Factor Based Analysis","type":"praAgGrid","id":"126126126126128","inputs":null},{"configType":"praWidget","title":"Factor Based Analysis","type":"praAgGrid","id":"126126126126129","inputs":null},{"configType":"returnsWidget","title":"Return Analysis","type":"returnGrid","id":"126126126126127","inputs":null},{"configType":"returnsTimeSeries","title":"Time Series for AJINOMOTO INC","type":"returnsSpritelet","id":1569864903176,"inputs":null,"pnlID":"SecurityGroup.EQUITY.S60109063","nodeDesc":"AJINOMOTO INC","sectorPathRules":[{"lineItem":null,"newWeight":null,"ruleType":"Sector"}]},{"configType":"returnsWidget","title":"Return Analysis764445","type":"returnGrid","id":131,"inputs":null},{"configType":"expostReturnsWidget","title":"Ex-Post Returns","type":"expostReturns","id":1569860808556,"inputs":{"expandedState":{"allExpanded":true}}},{"configType":"praWidget","title":"Factor Based Analysis32336","type":"praAgGrid","id":1569860805602,"inputs":null},{"configType":"praPie","title":"Pie Chart","type":"praPie","id":1569864933215,"inputs":null,"chartSettings":{"labelShow":true,"legendShow":true}},{"configType":"pgsWidget","title":"Portfolio Group Summary","type":"pgsGrid","id":1569860813472,"inputs":{"expandedState":{"allExpanded":true},"sortedColumns":[]}},{"configType":"expostTimeSeriesWidget","title":"Ex-Post Time Series","type":"expostTimeSeries","id":1569860807672,"inputs":{"expandedState":{"allExpanded":true}}},{"configType":"praBar","title":"Bar Chart","type":"praBar","id":1569864951614,"inputs":null,"chartSettings":{"labelShow":true,"legendShow":true},"chart":{"chartType":"column"},"secondaryAxisColumn":{"data":{"data":null}},"overrideAxisTitle":{"primaryAxisTitle":"","secondaryAxisTitle":""},"showGridLines":{"data":false},"topBottomFilter":{"configType":"topBottomFilter"}}],"availableDataStores":[{"configType":"ReturnsDataStore","name":"443562e7-ebb9-4b3b-8d2c-1aa35267e441","observers":["126126126126126",1569864903176],"metaData":{"expandedState":{"expandedPaths":[["_ROOT_"],["_ROOT_","EQUITY"]]}}},{"configType":"ReturnsDataStore","name":"5c0eb8fe-f964-4ee7-8a6f-63f7ddc3e871","observers":["126126126126127",1569864891253],"metaData":{"expandedState":{"expandedPaths":[["_ROOT_"],["_ROOT_","EQUITY"]]}}},{"configType":"RiskDataStore","name":"7d15bbd0-b155-4e99-afbf-8007db3940e0","observers":["126126126126128",1569864951614],"metaData":{"expandedState":{"expandedPaths":[["_ROOT_"]]}}},{"configType":"RiskDataStore","name":"3fcb171a-1fbc-4a45-a220-1150156d1e55","observers":["126126126126129",1569864933215],"metaData":{"expandedState":{"expandedPaths":[["_ROOT_"]]}}},{"configType":"ReturnsDataStore","name":"b9e18ae7-43a1-45f7-97c1-0a403a4c1c1c","observers":[131],"metaData":{"expandedState":{"expandedPaths":[["_ROOT_"]]}}},{"configType":"RiskDataStore","name":"63236fbc-bb4e-4946-a3c4-0729c7362e73","observers":[1569860805602],"metaData":{"expandedState":{"expandedPaths":[["_ROOT_"]]}}},{"configType":"ReturnsDataStore","name":"09bbdb6e-bf8d-4efe-88df-4501e2e08015","observers":[1569864891253],"parentDataStore":"5c0eb8fe-f964-4ee7-8a6f-63f7ddc3e871","metaData":{}},{"configType":"ReturnsDataStore","name":"d287baf2-0abd-4b63-af15-d12ef8efdd5d","observers":[1569864903176],"parentDataStore":"443562e7-ebb9-4b3b-8d2c-1aa35267e441","metaData":{"columns":{"configType":"columnSet"}}},{"configType":"RiskDataStore","name":"efad25c3-e9ba-4731-80bb-a409840077e8","observers":[1569864933215],"parentDataStore":"3fcb171a-1fbc-4a45-a220-1150156d1e55","metaData":{"columns":{"configType":"columnSet","type":"RISK_REPORT"}}},{"configType":"RiskDataStore","name":"d085c3d4-aaeb-4109-9c39-2f733963815b","observers":[1569864951614],"parentDataStore":"7d15bbd0-b155-4e99-afbf-8007db3940e0","metaData":{"columns":{"configType":"columnSet","type":"RISK_REPORT"}}}]}');
    });

    describe('cleanUpDataStoresForWidgetDeletion test', () => {
        it('should not remove dataStore if it is a parent widget of the remaining widget', () => {
            // widget1: the deleted widget
            const widget1 = new Widget();
            // widget2: the remaining widget which is also the child widget of widget1
            const widget2 = new Widget();
            widget1.dataStore = new WidgetDataStore();
            widget2.dataStore = new WidgetDataStore();
            widget2.dataStore.parentDataStore = widget1.dataStore;
            report.availableDataStores = new Map<string, WidgetDataStore>([
                [widget1.dataStore.name, widget1.dataStore],
                [widget2.dataStore.name, widget2.dataStore]
            ]);
            report.widgets = [widget1, widget2];
            // delete widget1 from widget list
            report.deleteWidget(widget1);
            expect(report.widgets.length).toBe(1);
            expect(report.widgets.includes(widget2));
            expect(report.availableDataStores.size).toBe(2);
            expect(report.availableDataStores.has(widget1.dataStore.name)).toBeTruthy();
        });

        it('should only remove dataStore if the widget is not related with the remaining or the parentDataStore is still in use', () => {
            // widget1: the parent of widget3
            const widget1 = new Widget();
            // widget2: not related with widget1 but has same parent as widget4
            const widget2 = new Widget();
            // widget3: the child of widget1 but was already deleted from the report
            const widget3 = new Widget();
            // widget4: shares the same parent with widget2
            const widget4 = new Widget();
            widget1.dataStore = new WidgetDataStore();
            widget2.dataStore = new WidgetDataStore();
            widget3.dataStore = new WidgetDataStore();
            widget4.dataStore = new WidgetDataStore();
            widget3.dataStore.parentDataStore = widget1.dataStore;
            const widgetsParentDataStore = new WidgetDataStore();
            widget2.dataStore.parentDataStore = widgetsParentDataStore;
            widget4.dataStore.parentDataStore = widgetsParentDataStore;
            report.availableDataStores = new Map<string, WidgetDataStore>([
                [widget1.dataStore.name, widget1.dataStore],
                [widget2.dataStore.name, widget2.dataStore],
                [widget4.dataStore.name, widget4.dataStore],
                [widgetsParentDataStore.name, widgetsParentDataStore]
            ]);
            expect(report.availableDataStores.size).toBe(4);
            // delete widget1 from widget list
            report.widgets = [widget1, widget2, widget4];
            report.deleteWidget(widget1);
            expect(report.widgets.length).toBe(2);
            expect(report.availableDataStores.size).toBe(3);
            // delete widget4 from widget list
            report.deleteWidget(widget4);
            expect(report.widgets.length).toBe(1);
            expect(report.availableDataStores.size).toBe(2);
            expect(report.availableDataStores.has(widgetsParentDataStore.name)).toBeTruthy();
        });

        it('should also remove parent dataStore if no remaining widget has the same parent', () => {
            // widget1: the deleted widget
            const widget1 = new Widget();
            // widget2: the remaining widget
            const widget2 = new Widget();
            widget1.dataStore = new WidgetDataStore();
            widget2.dataStore = new WidgetDataStore();
            const parentDataStore1 = new WidgetDataStore();
            const parentDataStore2 = new WidgetDataStore();
            widget1.dataStore.parentDataStore = parentDataStore1;
            widget2.dataStore.parentDataStore = parentDataStore2;
            report.availableDataStores = new Map<string, WidgetDataStore>([
                [parentDataStore1.name, parentDataStore1],
                [parentDataStore2.name, parentDataStore2],
                [widget1.dataStore.name, widget1.dataStore],
                [widget2.dataStore.name, widget2.dataStore]
            ]);
            expect(report.availableDataStores.size).toBe(4);
            // delete widget1 from widget list
            report.widgets = [widget1, widget2];
            report.deleteWidget(widget1);
            expect(report.availableDataStores.size).toBe(2);
            expect(report.availableDataStores.has(parentDataStore1.name)).toBeFalsy();
        });

        it('should remove dataStore if it is a child of the remaining widget', () => {
            report = new Report();
            // widget1: the deleted widget
            const widget1 = new Widget();
            // widget2: the remaining widget which is also the parent widget of widget1
            const widget2 = new Widget();
            widget1.dataStore = new WidgetDataStore();
            widget2.dataStore = new WidgetDataStore();
            widget1.dataStore.parentDataStore = widget2.dataStore;
            report.availableDataStores = new Map<string, WidgetDataStore>([
                [widget1.dataStore.name, widget1.dataStore],
                [widget2.dataStore.name, widget2.dataStore]
            ]);
            // delete widget1 from widget list
            report.widgets = [widget1, widget2];
            report.deleteWidget(widget1);
            expect(report.availableDataStores.size).toBe(1);
            expect(report.availableDataStores.has(widget2.dataStore.name)).toBeTruthy();
        });
    });

    it('test getWidgetInOrder', () => {
        // Create widgets with different coordinates
        const widget1 = new Widget();
        widget1.dimensions = {x: 0, y: 0, cols: 4, rows: 4};
        const widget2 = new Widget();
        widget2.dimensions = {x: 100, y: 0, cols: 4, rows: 4};
        const widget3 = new Widget();
        widget3.dimensions = {x: 0, y: 100, cols: 4, rows: 4};
        const widget4 = new Widget();
        widget4.dimensions = {x: 100, y: 100, cols: 4, rows: 4};
        const widget5 = new Widget();
        widget5.dimensions = {x: 0, y: 200, cols: 4, rows: 4};

        const reportToTest = new Report();
        // Add the widgets to the report, purposely out of order
        reportToTest.widgets = [widget2, widget5, widget3, widget4, widget1];
        // Sort the widgets and expect them to be in order
        reportToTest.getWidgetsInOrder();
        expect(reportToTest.widgets[0]).toEqual(widget1);
        expect(reportToTest.widgets[1]).toEqual(widget2);
        expect(reportToTest.widgets[2]).toEqual(widget3);
        expect(reportToTest.widgets[3]).toEqual(widget4);
        expect(reportToTest.widgets[4]).toEqual(widget5);
    });

    it('should clear change detection flags from columns', () => {
        const col1 = ColumnConfig.createColumn('pnl_contr', UseType.PORT);
        const aggregationColOption = new AggregationColumnOption();
        aggregationColOption.optionState = ConfigState.MODIFIED;
        col1.optionValues.push(aggregationColOption);

        const faveColSet = new ColumnSet();
        faveColSet.id = 1234;
        faveColSet.columns = [col1];
        faveColSet.columnState.changeState = ConfigState.MODIFIED;

        const widget1 = new Widget(WidgetConfigType.RISK_EXPOSURE);
        widget1.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, faveColSet);

        const col2 = ColumnConfig.createColumn('market_val', UseType.ACTIVE);
        const activeColOption = new ActiveCalculationColumnOption();
        activeColOption.optionState = ConfigState.MODIFIED;
        col2.optionValues.push(activeColOption);

        const colSet = new ColumnSet();
        colSet.columns = [col2];
        colSet.columnState.changeState = ConfigState.MODIFIED;

        const widget2 = new Widget(WidgetConfigType.RISK_EXPOSURE);
        widget2.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, colSet);

        report.widgets = [widget1, widget2];

        expect(faveColSet.columns[0].getOptionValueByConfigType(AggregationColumnOption.CONFIG_TYPE).optionState).toEqual(ConfigState.MODIFIED);
        expect(faveColSet.columnState.changeState).toEqual(ConfigState.MODIFIED);
        expect(colSet.columns[0].getOptionValueByConfigType(ActiveCalculationColumnOption.CONFIG_TYPE).optionState).toEqual(ConfigState.MODIFIED);
        expect(colSet.columnState.changeState).toEqual(ConfigState.MODIFIED);

        report.resetChangeDetectionFlags();

        expect(faveColSet.columns[0].getOptionValueByConfigType(AggregationColumnOption.CONFIG_TYPE).optionState).toEqual(ConfigState.MODIFIED);
        expect(faveColSet.columnState.changeState).toEqual(ConfigState.MODIFIED);
        expect(colSet.columns[0].getOptionValueByConfigType(ActiveCalculationColumnOption.CONFIG_TYPE).optionState).toEqual(ConfigState.EXISTING);
        expect(colSet.columnState.changeState).toEqual(ConfigState.EXISTING);
    });

    it('Test removeWidgetLongRunningRequests', () => {
        createDummyLongRunningDetails();
        widget.id = 456;
        report.removeWidgetLongRunningRequests(widget);
        expect(LongRunningHandlerService.widgetIdToToLongRunningTrackingDetails.has(123)).toBeTruthy();
        expect(LongRunningHandlerService.widgetIdToToLongRunningTrackingDetails.get(123).length === 2).toBeTruthy();
        expect(LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.has('abc')).toBeTruthy();
        expect(LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.has('def')).toBeTruthy();

        // Delete all for widget id 123
        widget.id = 123;
        report.removeWidgetLongRunningRequests(widget);
        expect(LongRunningHandlerService.widgetIdToToLongRunningTrackingDetails.has(123)).toBeFalsy();
        expect(LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.has('abc')).toBeFalsy();
        expect(LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.has('def')).toBeFalsy();

        createDummyLongRunningDetails();
        // Delete only for widget id 123 and port PEP
        report.removeWidgetLongRunningRequests(widget, 'PEP');
        expect(LongRunningHandlerService.widgetIdToToLongRunningTrackingDetails.has(123)).toBeTruthy();
        expect(LongRunningHandlerService.widgetIdToToLongRunningTrackingDetails.get(123).length === 1).toBeTruthy();
        expect(LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.has('abc')).toBeFalsy();
        expect(LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.has('def')).toBeTruthy();
    });

    it('Test removeAllWidgetLongRunningRequests', () => {
        createDummyLongRunningDetails();
        widget.id = 123;
        report.removeAllWidgetLongRunningRequests();
        expect(LongRunningHandlerService.widgetIdToToLongRunningTrackingDetails.has(123)).toBeFalsy();
        expect(LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.has('abc')).toBeFalsy();
        expect(LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.has('def')).toBeFalsy();
    });

    /**
     * Creates a simple widget for using in the tests.
     */
    function createTestWidget(title: string) {
        const reportWidget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        reportWidget.title = title;
        return reportWidget;
    }

    function createDummyLongRunningDetails(): void {
        LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails = new Map<string, LongRunningTrackingDetails>();
        LongRunningHandlerService.widgetIdToToLongRunningTrackingDetails = new Map<number, LongRunningTrackingDetails[]>();

        const longRunningTrackingDetails = new LongRunningTrackingDetails('abc', '', 123);
        longRunningTrackingDetails.portIds.push('PEP');
        LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.set('abc', longRunningTrackingDetails);
        const longRunningTrackingDetails2 = new LongRunningTrackingDetails('def', '', 123);
        longRunningTrackingDetails2.portIds.push('BR-CORE');
        LongRunningHandlerService.longRunningIdToLongRunningTrackingDetails.set('def', longRunningTrackingDetails2);
        LongRunningHandlerService.widgetIdToToLongRunningTrackingDetails.set(123, [longRunningTrackingDetails, longRunningTrackingDetails2]);
    }
});
