import {ExploreResponse} from '@interfaces/response.interface';
import {TestUtils} from '@utils/test.utils';
import {HighlightUtils} from '@utils/highlight.utils';
import {ColumnConfig, ResponseData} from '@blk/explore-ui-core';
import {ColumnSet, HighlightColumnOption, HighlightComparisonType, HighlightRule, HighlightSettings} from '@blk/explore-ui-column-option';
import {ColumnBreakdown} from '@blk/explore-ui-breakdown';
import {FactorDataHighlightSettings} from '@models/widget/inputs/factor-data-settings/factor-data-highlight-settings.model';
import {FactorDataCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {FactorTimeSeriesSelectedOption} from '@enums/factor-time-series-selected-option.enum';
import {ChartType} from '@qbstr/highcharts-api';
import {BG_COLOR_MAP, FG_COLOR_MAP} from '@utils/qbstr';

describe('HighlightUtils Tests', () => {

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    describe('Apply Highlighting Tests', () => {

        let response: ExploreResponse;
        let highlightColumnOption: HighlightColumnOption;
        let columnSet: ColumnSet;

        beforeEach(() => {
            response = {
                data: {
                    columns: ['security_description_1', 'cusip_0', 'pct_mv_1'],
                    data: getMockResponseData()
                }
            };

            const highlightColumn: ColumnConfig = ColumnConfig.createColumn('pct_mv', 'PORT', 'pct_mv_1');
            highlightColumnOption = new HighlightColumnOption();
            highlightColumnOption.initialize(undefined);

            highlightColumn.optionValues.push(highlightColumnOption);

            columnSet = new ColumnSet();
            columnSet.columns.push(
                ColumnConfig.createColumn('security_description', 'ALL', 'security_description_1'),
                ColumnConfig.createColumn('cusip', 'ALL', 'cusip_0'),
                highlightColumn
            );

            jest.spyOn<any>(HighlightUtils, 'getAllLeafValues');
        });

        it('should apply highlight rules', () => {
            const highlightSettings1 = new HighlightSettings();
            highlightSettings1.backGroundColors = ['rgb(242, 180, 205)', 'rgb(211, 211, 211)'];
            highlightSettings1.comparisonRawValues = [0.40];
            highlightSettings1.comparisonType = HighlightComparisonType.GREATER_THAN;
            highlightSettings1.comparisonValues = [];
            highlightSettings1.isEnabled = true;

            const highlightSettings2 = new HighlightSettings();
            highlightSettings2.backGroundColors = ['rgb(182, 240, 199)', 'rgb(211, 211, 211)'];
            highlightSettings2.comparisonRawValues = [0.10];
            highlightSettings2.comparisonType = HighlightComparisonType.LESS_THAN_EQUAL;
            highlightSettings2.comparisonValues = [];
            highlightSettings2.isEnabled = true;

            highlightColumnOption.highlightSettings.push(highlightSettings1, highlightSettings2);

            // mock the method in HighlightRule because that's tested in HighlightRule tests
            const applyRuleToData = HighlightRule.prototype.applyRuleToData = jest.fn();

            HighlightUtils.applyHighlighting(response, columnSet);
            expect(applyRuleToData).toHaveBeenCalledTimes(2);
            expect(HighlightUtils['getAllLeafValues']).not.toHaveBeenCalled();
        });

        it('should get leaf values for aggregation rule type and apply highlight rules', () => {
            const highlightSetting = new HighlightSettings();
            highlightSetting.backGroundColors = ['rgb(242, 180, 205)', 'rgb(211, 211, 211)'];
            highlightSetting.comparisonRawValues = [50];
            highlightSetting.comparisonType = HighlightComparisonType.TOP;
            highlightSetting.comparisonValues = [];
            highlightSetting.isEnabled = true;

            highlightColumnOption.highlightSettings.push(highlightSetting);
            highlightColumnOption.highlightOnlyLeaf = false;

            // mock the method in HighlightRule because that's tested in HighlightRule tests
            const applyRuleToData = HighlightRule.prototype.applyRuleToData = jest.fn();

            HighlightUtils.applyHighlighting(response, columnSet);
            expect(applyRuleToData).toHaveBeenCalledTimes(1);
            expect(HighlightUtils['getAllLeafValues']).toHaveBeenCalled();
        });

        it('Should properly apply highlighting on child columns spawned by isGroupByPortBenchActive', () => {
            const highlightSettings1 = new HighlightSettings();
            highlightSettings1.backGroundColors = ['rgb(242, 180, 205)', 'rgb(211, 211, 211)'];
            highlightSettings1.comparisonRawValues = [0.40];
            highlightSettings1.comparisonType = HighlightComparisonType.GREATER_THAN;
            highlightSettings1.comparisonValues = [];
            highlightSettings1.isEnabled = true;

            highlightColumnOption.highlightSettings.push(highlightSettings1);
            // Apply a column Breakdown on the existing pct_mv column
            const colBreakdown = new ColumnBreakdown({'breakdownLevel': 1, 'portfolioGroupLevel': 1, 'isGroupByPortBenchActive': true, 'isFullPortfolioName': false, 'isColumnBreakdownNormalize': false, 'breakdownHideTotal': false, 'breakdownHideOther': false, 'breakdownObject': {'breakdown': {'breakdownTitle': 'Security Group', 'subSectors': [{'breakdownRuleType': 'String', 'groupByColumn': {'columnName': 'Security Group', 'columnTag': 'sec_group', 'positionColumnType': 'ALL'}, 'useNoneBuckets': true}]}, 'title': 'Security Group'}, 'isFactorBreakdown': false, 'configType': 'columnBreakdown'});
            columnSet.columns[2].optionValues.push(colBreakdown);

            const highlightSettings2 = new HighlightSettings();
            highlightSettings2.backGroundColors = ['rgb(100, 180, 205)'];
            highlightSettings2.comparisonRawValues = [0.20];
            highlightSettings2.comparisonType = HighlightComparisonType.LESS_THAN;
            highlightSettings2.comparisonValues = [];
            highlightSettings2.isEnabled = true;

            const highlightColumn: ColumnConfig = ColumnConfig.createColumn('pct_mv', 'BENCH', 'pct_mv_1');
            const highlightOption = new HighlightColumnOption();
            highlightOption.initialize(undefined);
            highlightOption.highlightSettings.push(highlightSettings2);
            const colBreakdownCopy = new ColumnBreakdown(colBreakdown.serialize());
            colBreakdownCopy.isGroupByPortBenchActive = false;
            highlightColumn.optionValues.push(highlightOption, colBreakdownCopy);
            columnSet.columns.push(highlightColumn);

            response = {
                data: {
                    columnHeaderDetails: {
                        columnKeyToDisplayNameMap: {pct_mv_1: 'Portfolio Market Value % (Security Group)', pct_mv_2: 'Benchmark Market Value % (Security Group)', security_description_1: 'Security Description', cusip_0: 'CUSIP'},
                        columnKeyToTagMap: {pct_mv_1: 'pct_mv', pct_mv_2: 'pct_mv', security_description_1: 'security_description', cusip_0: 'cusip'}
                    },
                    columns: ['security_description_1', 'cusip_0', 'pct_mv_1|Total|Portfolio', 'pct_mv_1|Total|Benchmark', 'pct_mv_1|CASH|Portfolio', 'pct_mv_1|CASH|Benchmark', 'pct_mv_1|EQUITY|Portfolio', 'pct_mv_1|FUND|Benchmark'],
                    splitColumnKeys: {
                        pct_mv_1: [
                            {
                                'header': 'Total',
                                'originalKey': 'pct_mv_1|Total',
                                'children': [
                                    {
                                        'header': 'Portfolio',
                                        'originalKey': 'pct_mv_1|Total|Portfolio',
                                        'updatedKeySuffix': 'Portfolio',
                                        'updatedKey': 'pct_mv_1|Total|Portfolio'
                                    },
                                    {
                                        'header': 'Benchmark',
                                        'originalKey': 'pct_mv_1|Total|Benchmark',
                                        'updatedKeySuffix': 'Benchmark',
                                        'updatedKey': 'pct_mv_1|Total|Benchmark'
                                    }
                                ],
                                'updatedKeySuffix': 'Total',
                                'updatedKey': 'pct_mv_1|Total'
                            },
                            {
                                'header': 'CASH',
                                'originalKey': 'pct_mv_1|CASH',
                                'children': [
                                    {
                                        'header': 'Portfolio',
                                        'originalKey': 'pct_mv_1|CASH|Portfolio',
                                        'updatedKeySuffix': 'Portfolio',
                                        'updatedKey': 'pct_mv_1|CASH|Portfolio'
                                    },
                                    {
                                        'header': 'Benchmark',
                                        'originalKey': 'pct_mv_1|CASH|Benchmark',
                                        'updatedKeySuffix': 'Benchmark',
                                        'updatedKey': 'pct_mv_1|CASH|Benchmark'
                                    }
                                ],
                                'updatedKeySuffix': 'CASH',
                                'updatedKey': 'pct_mv_1|CASH'
                            },
                            {
                                'header': 'EQUITY',
                                'originalKey': 'pct_mv_1|EQUITY',
                                'children': [
                                    {
                                        'header': 'Portfolio',
                                        'originalKey': 'pct_mv_1|EQUITY|Portfolio',
                                        'updatedKeySuffix': 'Portfolio',
                                        'updatedKey': 'pct_mv_1|EQUITY|Portfolio'
                                    }
                                ],
                                'updatedKeySuffix': 'EQUITY',
                                'updatedKey': 'pct_mv_1|EQUITY'
                            },
                            {
                                'header': 'FUND',
                                'originalKey': 'pct_mv_1|FUND',
                                'children': [
                                    {
                                        'header': 'Benchmark',
                                        'originalKey': 'pct_mv_1|FUND|Benchmark',
                                        'updatedKeySuffix': 'Benchmark',
                                        'updatedKey': 'pct_mv_1|FUND|Benchmark'
                                    }
                                ],
                                'updatedKeySuffix': 'FUND',
                                'updatedKey': 'pct_mv_1|FUND'
                            }
                        ]
                    },
                    data: getMockResponseDataWithBench()
                }
            };

            // mock the method in HighlightRule because that's tested in HighlightRule tests
            const applyRuleToData = HighlightRule.prototype.applyRuleToData = jest.fn();
            jest.spyOn(HighlightUtils, 'getChildColumnKeys');

            HighlightUtils.applyHighlighting(response, columnSet);
            expect(HighlightUtils['getChildColumnKeys']).toHaveBeenCalled();
            expect(applyRuleToData).toHaveBeenCalledTimes(6);

        });
    });

    describe('Color Utils Tests', () => {
        let hexColor: string;
        let rgbColorString: string;
        let rgbColorArray: number[];

        beforeEach(() => {
            hexColor = '#c5fbcf';
            rgbColorString = 'rgb(197,251,207)';
            rgbColorArray = [197, 251, 207];
        });

        it('should convert from Hex to RGB color', () => {
            expect(HighlightUtils.convertHexToRGB(hexColor)).toEqual(rgbColorArray);
        });

        it('should just convert to array if Hex value is actually an RGB value', () => {
            expect(HighlightUtils.convertHexToRGB(rgbColorString)).toEqual(rgbColorArray);
        });

        it('should convert from RGB to Hex color', () => {
            expect(HighlightUtils.convertRgbToHex(rgbColorArray[0], rgbColorArray[1], rgbColorArray[2])).toBe(hexColor);
        });

        it('should convert from RGB to Hex color - RGB single digits', () => {
            expect(HighlightUtils.convertRgbToHex(5, 5, 5)).toBe('#050505');
        });
    });

    const getMockResponseData = (): ResponseData => {
        return {
            data: [null, null, 1.00],
            children: [
                {
                    title: 'CASH',
                    data: [null, null, 0.40],
                    children: [
                        {data: ['Sec_Desc1', 'cusip001', 0.25]},
                        {data: ['Sec_Desc2', 'cusip002', 0.15]}
                    ]
                },
                {
                    title: 'EQUITY',
                    data: [null, null, 0.60],
                    children: [
                        {data: ['Sec_Desc3', 'cusip003', 0.30]},
                        {data: ['Sec_Desc4', 'cusip004', 0.25]},
                        {data: ['Sec_Desc5', 'cusip005', 0.05]}
                    ]
                }

            ]
        };
    };

    const getMockResponseDataWithBench = (): ResponseData => {
        return {
            data: [null, null, 1.00, 1.00, 0.4, 0.2, 0.6, 0.8],
            children: [
                {
                    title: 'CASH',
                    data: [null, null, 0.4, 0.2, 0.4, 0.2, null, null],
                    children: [
                        {data: ['Sec_Desc1', 'cusip001', 0.25, 0.15, 0.25, 0.15, null, null]},
                        {data: ['Sec_Desc2', 'cusip002', 0.15, 0.05, 0.15, 0.05, null, null]}
                    ]
                },
                {
                    title: 'EQUITY',
                    data: [null, null, 0.6, 0, null, null, 0.6, null],
                    children: [
                        {data: ['Sec_Desc3', 'cusip003', 0.30, 0, null, null, 0.3, null]},
                        {data: ['Sec_Desc4', 'cusip004', 0.25, 0, null, null, 0.25, null]},
                        {data: ['Sec_Desc5', 'cusip005', 0.05, 0, null, null, 0.05, null]}
                    ]
                },
                {
                    title: 'FUND',
                    data: [null, null, 0, 0.8, null, null, null, 0.8],
                    children: [
                        {data: ['Sec_Desc6', 'cusip006', 0, 0.5, null, null, null, 0.5]},
                        {data: ['Sec_Desc7', 'cusip007', 0, 0.3, null, null, null, 0.3]}
                    ]
                }
            ]
        };
    };

    describe('test applyHighlightingToRiskMatrixRow method for Factor Data Widget Risk Matrix', () => {
        let row: any;
        let customVizConfig: FactorDataCustomVizConfig;
        const factorDataHighlightSettings = new FactorDataHighlightSettings({
            'lowerHighlightSettings': {
                'highlightSettings': [
                    {
                        'backGroundColors': [
                            'rgb(144,238,144)',
                            'rgb(211,211,211)'
                        ],
                        'foregroundColors': [
                            'rgb(224,48,48)',
                            'rgb(0,0,0)'
                        ],
                        'comparisonValues': [
                            '1.000000000'
                        ],
                        'comparisonRawValues': [
                            1
                        ],
                        'isEnabled': true,
                        'comparisonType': 0
                    },
                    {
                        'backGroundColors': [
                            'rgb(248,104,104)',
                            'rgb(211,211,211)'
                        ],
                        'comparisonValues': [
                            'abc'
                        ],
                        'comparisonRawValues': [
                            'abc'
                        ],
                        'isEnabled': true,
                        'comparisonType': 7
                    }
                ],
                'highlightOnlyLeaf': true,
            },
            'upperHighlightSettings': {
                'highlightSettings': [
                    {
                        'backGroundColors': [
                            'rgb(144,238,144)',
                            'rgb(211,211,211)'
                        ],
                        'comparisonValues': [
                            '1.000000000'
                        ],
                        'comparisonRawValues': [
                            1
                        ],
                        'isEnabled': true,
                        'comparisonType': 0
                    }
                ],
                'highlightOnlyLeaf': true,
            },
        });

        beforeEach(() => {
            row = {
                _ROOT_: 'PEP',
                rowId: 1,
                rfv_ftitle: 'WRLD Market',
                FMI_WRLD_MARKET_37425b994fb6493: 1,
                FMI_WRLD_VOLATILITY_2f11fd8ef1ef44b: 0.7904771881821152,
            };
            customVizConfig = {
                isTimeSeriesMode: false,
                factorTimeSeriesSelectedOption: FactorTimeSeriesSelectedOption.CORRELATIONS,
                chartType: ChartType.COLUMN,
                isTriangularMatrix: false,
                showChangeInUpperTriangle: false,
                colKeys: [
                    'rfv_ftitle',
                    'FMI_WRLD_MARKET_37425b994fb6493',
                    'FMI_WRLD_VOLATILITY_2f11fd8ef1ef44b'
                ],
                factorDataHighlightSettings,
            };
        });

        it('test for row data empty', () => {
            row.FMI_WRLD_MARKET_37425b994fb6493 = null;
            HighlightUtils.applyHighlightingToRiskMatrixRow(row, customVizConfig);
            expect(row[BG_COLOR_MAP]).toStrictEqual({});
            expect(row[FG_COLOR_MAP]).toStrictEqual({});
        });

        it('for - Rectangular', () => {
            HighlightUtils.applyHighlightingToRiskMatrixRow(row, customVizConfig);

            expect(row[BG_COLOR_MAP]).toStrictEqual({
                FMI_WRLD_MARKET_37425b994fb6493: 'rgb(144,238,144)',
            });
            expect(row[FG_COLOR_MAP]).toStrictEqual({
                FMI_WRLD_MARKET_37425b994fb6493: 'rgb(224,48,48)',
            });
        });

        it('for - Triangular', () => {
            customVizConfig.isTriangularMatrix = true;
            HighlightUtils.applyHighlightingToRiskMatrixRow(row, customVizConfig);

            expect(row[BG_COLOR_MAP]).toStrictEqual({
                FMI_WRLD_MARKET_37425b994fb6493: 'rgb(144,238,144)',
            });
            expect(row[FG_COLOR_MAP]).toStrictEqual({
                FMI_WRLD_MARKET_37425b994fb6493: 'rgb(224,48,48)',
            });
        });
    });
});
