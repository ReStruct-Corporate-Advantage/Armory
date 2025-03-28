import {getBreakdownLevels, ROOT_LEVEL} from './qbstr.utils';
import {data1, data2, data8, data4, data6, data7} from '@mocks/test-data/qbstr-test-data';
import {pgsStackedData} from '@mocks/test-data/pgs-bar-chart-test-data';
import {convertArrayToJson, createDataCube, createQueryKeyForLevel} from './qbstr.adapter';
import {AggregationKey, createQK, FilterIncludeKey, GroupByKey} from '@qbstr/data-cube';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {NumericDataFormatter, StringDataFormatter} from '@blk/explore-ui-column-option';
import {ColumnConstants, ColumnDefinition, CoreDefinitionStore, NumericColumnFormat, TokenConstants} from '@blk/explore-ui-core';
import {DateDataFormatter} from '@models/data-formatters/date-data.formatter';
import {DateFormat} from '@models/column-formats/date-format.model';
import {GroupLevel} from '@interfaces/response.interface';
import {FactorDataHighlightSettings} from '@models/widget/inputs/factor-data-settings/factor-data-highlight-settings.model';
import {FactorTimeSeriesSelectedOption} from '@enums/factor-time-series-selected-option.enum';
import {FactorDataCustomVizConfig} from '@interfaces/custom-viz-config.interface';
import {
    COMPARE_MODE_VALUE, COMPARE_MODE_PERCENT
} from '../../modules/widget/widget-settings/factor-data-settings/factor-data.constants';
import {TestUtils} from '@utils/test.utils';
import {isNil} from 'lodash';

describe('qbstr adapter tests', () => {

    let request: RequestAdapterConfig;

    beforeAll(() => {
        request = {
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
                    isSubtotalable: false
                },
            ]
        };
    });

    it('should do breakdown levels #1', () => {
        expect(getBreakdownLevels(data1.data.data)).toEqual([ROOT_LEVEL, 'level-1', 'level-2']);
    });

    it('should do breakdown levels #2', () => {
        expect(getBreakdownLevels(data2.data.data)).toEqual([ROOT_LEVEL, 'level-1', 'level-2', 'level-3', 'level-4']);
    });

    it('should do breakdown levels #3', () => {
        expect(getBreakdownLevels(undefined)).toEqual([ROOT_LEVEL]);
    });

    it('should create cube #1', () => {
        const {cube} = createDataCube(request, data1 as any);
        expect(cube).toBeTruthy();
    });

    it('should create cube and enrich leaf nodes when PGS stacked bar chart with uneven port-group structure', () => {
        request.widgetConfig = 'pgsBar';
        const {cube} = createDataCube(request, pgsStackedData as any);
        const ck = createQK([new FilterIncludeKey('_ROOT_', ['FAU-ALL']), new FilterIncludeKey('level-1', ['AMPNZGOV'])]);
        expect(cube).toBeTruthy();
        cube.stream().compute(ck).toList()
            .subscribe(data => {
                expect(data.every(x => !isNil(x['level-6']))).toBeTruthy();
            });
    });

    it('should create cube and group keys should exist#1', (done) => {
        const {cube} = createDataCube(request, data1 as any);
        expect(cube).toBeTruthy();
        const ck = createQK([ new GroupByKey(ROOT_LEVEL), new AggregationKey('pct_mv_1', 'sum')]);
        expect(cube.has(ck)).toBeTruthy();
        cube.get(ck).subscribe(data => {
            expect(data).toEqual([{
                cusip_0: null,
                pct_mv_1: 1.0000000000000009,
                rowId: 1,
                sectorOrder: undefined,
                _ROOT_: 'PEP',
                bgColorMap: {},
                fgColorMap: {}
            }]);
            done();
        });

    });

    it('tests convertArrayToJson', () => {
        // expost scenario
        const numFormatter = new NumericDataFormatter(new NumericColumnFormat({scalingFactor: 0.01}), []);
        expect(convertArrayToJson([{ columnKey: 'abc', value: 0.5 }], ['a'], false, {'abc': numFormatter}, true)).toStrictEqual({'a': {'columnKey': 'abc', 'value': 50}});

        // non-expost scenario
        expect(convertArrayToJson([4.2], ['b|abc|bcf'], false, {'b': numFormatter}, false)).toStrictEqual({'b|abc|bcf': 420});

        // non-expost scenario - value not a number
        expect(convertArrayToJson(['hello'], ['b|abc|bcf'], false, {'b': {} as any}, false)).toStrictEqual({'b|abc|bcf': 'hello'});

        // numericDataFormatter with empty string
        expect(convertArrayToJson([''], ['b|abc|bcf'], false, {'b': numFormatter}, false)).toStrictEqual({'b|abc|bcf': ''});
    });
    describe('tests scaling of mapped VARServer columns based on cutOffDate', () => {

        const colFormat = new NumericColumnFormat();
        colFormat.decimalPlaces = 2;
        colFormat.scalingFactor = 0.0001;
        colFormat.isScalable = true;
        colFormat.isUseThousandsSeparator = true;

        let request1: any;
        beforeAll((done) => {
            TestUtils.initialize(done);
        });

        beforeEach(() => {
            request1 = {
                portfolio: 'PEP',
                columns: [
                    {
                        columnKey: 'rfv_ftitle',
                        columnTitle: 'Title',
                        formatter: new StringDataFormatter(),
                        dataType: 'STRING',
                        columnTag: 'rfv_ftitle',
                        isHidden: false,
                        isSubtotalable: false,
                        originalColumnTitle: 'Title'
                    },
                    {
                        columnKey: 'rfv_contrib_port_4',
                        columnTitle: 'Risk Contribution',
                        formatter: new NumericDataFormatter(colFormat, []),
                        dataType: 'DOUBLE',
                        columnTag: 'rfv_contrib_port',
                        isHidden: false,
                        isSubtotalable: true,
                        originalColumnTitle: 'Risk Contribution'
                    },
                    {
                        columnKey: 'rfv_block_path',
                        columnTitle: 'Block Path',
                        formatter: new StringDataFormatter(),
                        dataType: 'STRING',
                        columnTag: 'rfv_block_path',
                        isHidden: true,
                        isSubtotalable: false,
                        originalColumnTitle: 'Block Path'
                    },
                    {
                        columnKey: 'rfv_ftitle_long_hidden',
                        columnTitle: 'Long Title',
                        formatter: new StringDataFormatter(),
                        dataType: 'STRING',
                        columnTag: 'rfv_ftitle_long',
                        isHidden: true,
                        isSubtotalable: false,
                        originalColumnTitle: 'Long Title'
                    },
                    {
                        columnKey: 'rfv_factor_tag_hidden',
                        columnTitle: 'Factor Tag',
                        formatter: new StringDataFormatter(),
                        dataType: 'STRING',
                        columnTag: 'rfv_factor_tag',
                        isHidden: true,
                        isSubtotalable: false,
                        originalColumnTitle: 'Factor Tag'
                    }
                ]
            };
            CoreDefinitionStore.tokens[TokenConstants.EXPLORE_RISK_CUTOFF_DATE] = '20220630';
            CoreDefinitionStore.columnTagColumnsPairs.set('rfv_contrib_port', [new ColumnDefinition({
                columnTag: 'rfv_contrib_port',
                title: 'Risk Contribution',
                dataType: ColumnConstants.COLUMN_DATA_TYPE.DOUBLE,
                mappedColTags: ['rfv_contrib_port_rk']
            })]);
            CoreDefinitionStore.columnTagColumnsPairs.set('rfv_contrib_port_rk', [new ColumnDefinition({
                columnTag: 'rfv_contrib_port_rk',
                title: 'Risk Contribution (In Testing)',
                dataType: ColumnConstants.COLUMN_DATA_TYPE.DOUBLE,
                columnFormat: new NumericColumnFormat({scalable: false, scalingFactor: 1, decimalPlaces: 2, isUseThousandsSeparator: true})
            })]);
        });

        it('tests scaling of mapped VarServer column when request date is beyond cutOffDate', () => {
            const {cube} = createDataCube(request1, data8 as any, null, null, null, '10/14/2022');
            expect(cube).toBeTruthy();
            const ck = createQK([new GroupByKey(ROOT_LEVEL), new AggregationKey('rfv_contrib_port_4', 'sum')]);
            expect(cube.has(ck)).toBeTruthy();
            let cubeData: any[];
            cube.get(ck).subscribe(data => {
                cubeData = data;
            });
            expect(cubeData).toEqual([
                {
                    _ROOT_: 'PEP',
                    rowId: 1,
                    bgColorMap: {},
                    fgColorMap: {},
                    rfv_ftitle: 'Total',
                    rfv_contrib_port_4: 53.848956185074535,
                    rfv_block_path: 'RAS=AUD_FX_USD#JPY_FX_USD#USD_FX_USD@@@VAR=',
                    rfv_ftitle_long_hidden: null,
                    rfv_factor_tag_hidden: '',
                    sectorOrder: undefined
                }
            ]);
        });

        it('tests scaling of mapped VarServer column when request date is before cutOffDate', () => {
            const {cube} = createDataCube(request1, data8 as any, null, null, null, '5/27/2022');
            expect(cube).toBeTruthy();
            const ck = createQK([new GroupByKey(ROOT_LEVEL), new AggregationKey('rfv_contrib_port_4', 'sum')]);
            expect(cube.has(ck)).toBeTruthy();
            let cubeData: any[];
            cube.get(ck).subscribe(data => {
                cubeData = data;
            });
            expect(cubeData).toEqual([
                {
                    _ROOT_: 'PEP',
                    rowId: 1,
                    bgColorMap: {},
                    fgColorMap: {},
                    rfv_ftitle: 'Total',
                    rfv_contrib_port_4: 538489.5618507453,
                    rfv_block_path: 'RAS=AUD_FX_USD#JPY_FX_USD#USD_FX_USD@@@VAR=',
                    rfv_ftitle_long_hidden: null,
                    rfv_factor_tag_hidden: '',
                    sectorOrder: undefined
                }
            ]);
        });
    });

    describe('Portfolio Long name test', () => {
        let request1: any;
        beforeAll(() => {
            request1 = {
                portfolio: 'FAU-CORE',
                columns: [
                    {
                        columnKey: 'portfolio',
                        columnTitle: 'portfolio',
                        formatter: undefined,
                        dataType: 'STRING',
                        columnTag: 'portfolio',
                        isHidden: false,
                        isSubtotalable: false
                    },
                    {
                        columnKey: 'pct_nav_group_1',
                        columnTitle: 'pct_nav_group_1',
                        formatter: {format: () => ''},
                        dataType: 'DOUBLE',
                        columnTag: 'pct_nav_group_1',
                        isHidden: false,
                        isSubtotalable: true
                    }
                ]
            };
        });

        it('should display long name of port group if set in additional settings of portfolio column', (done) => {
            const {cube} = createDataCube(request1, data4 as any);
            const ck = createQK([ new GroupByKey(ROOT_LEVEL), new AggregationKey('pct_nav_group_1', 'sum')]);
            expect(cube.has(ck)).toBeTruthy();
            cube.get(ck).subscribe(data => {
                expect(data).toEqual([{
                    nav_group_0: 64314432.25440367,
                    pct_nav_group_1: 1,
                    sectorOrder: undefined,
                    _ROOT_: 'Core',
                    bgColorMap: {},
                    fgColorMap: {},
                    rowId: 1,
                }]);
                done();
            });
        });
    });


    describe('should create Cube for Factor Data Widget when Time series mode is selected', () => {

        const colFormat = new NumericColumnFormat();
        colFormat.decimalPlaces = 9;
        colFormat.scalingFactor = 1;
        colFormat.isScalable = true;

        const dateFormat = new DateFormat();
        dateFormat.value = 'dd-MMM-yyyy';

        const factorDataRequest = {
            portfolio: 'E_TEA',
            columns: [
                {
                    columnKey: 'date',
                    columnTitle: 'Date',
                    formatter: new DateDataFormatter(dateFormat, []),
                    dataType: 'DATE',
                    columnTag: 'date',
                    isHidden: false,
                    isSubtotalable: false,
                    originalColumnTitle: 'Date'
                },
                {
                    columnKey: 'USD_3m_key',
                    columnTitle: 'Tsy 3M',
                    formatter: new NumericDataFormatter(colFormat, []),
                    dataType: 'DOUBLE',
                    columnTag: 'USD_3m',
                    isHidden: false,
                    isSubtotalable: true,
                    originalColumnTitle: 'USD_3m'
                },
                {
                    columnKey: 'CAD_3m_key',
                    columnTitle: 'CAD 3M',
                    formatter: new NumericDataFormatter(colFormat, []),
                    dataType: 'DOUBLE',
                    columnTag: 'CAD_3m',
                    isHidden: false,
                    isSubtotalable: true,
                    originalColumnTitle: 'CAD_3m'
                },
                {
                    columnKey: 'CAD_6m_key',
                    columnTitle: 'CAD 6M',
                    formatter: new NumericDataFormatter(colFormat, []),
                    dataType: 'DOUBLE',
                    columnTag: 'CAD_6m',
                    isHidden: false,
                    isSubtotalable: true,
                    originalColumnTitle: 'CAD_6m'
                },
                {
                    columnKey: 'CAD_9m_key',
                    columnTitle: 'CAD 9M',
                    formatter: new NumericDataFormatter(colFormat, []),
                    dataType: 'DOUBLE',
                    columnTag: 'CAD_9m',
                    isHidden: false,
                    isSubtotalable: true,
                    originalColumnTitle: 'CAD_9m'
                }
            ]
        };

        it ('Without comparison', () => {
            const {cube} = createDataCube(factorDataRequest, data6 as any, null, null, {
                isTimeSeriesMode: true,
                factorTimeSeriesSelectedOption: FactorTimeSeriesSelectedOption.VOLATILITIES,
                isTriangularMatrix: false,
                showChangeInUpperTriangle: false
            } as FactorDataCustomVizConfig);
            expect(cube).toBeTruthy();
            const port = 'E_TEA';
            const groupColumns = [ROOT_LEVEL];
            const groupLevels: GroupLevel = {groupKeys: [port] , groupColumns};
            const ck = createQueryKeyForLevel( groupLevels, [new AggregationKey('USD_3m_key', 'sum'), new AggregationKey('CAD_3m_key', 'sum')], true);
            expect(cube.has(ck)).toBeTruthy();
            let cubeData: any[];
            cube.get(ck).subscribe(data => {
                cubeData = data;
            });
            expect(cubeData).toEqual([
                {
                    _ROOT_: 'E_TEA',
                    rowId: 1,
                    bgColorMap: {},
                    fgColorMap: {},
                    date: '26-OCT-2022',
                    USD_3m_key: 128.6393737285191,
                    CAD_3m_key: 85.88,
                    CAD_6m_key: 0,
                    CAD_9m_key: 0,
                    sectorOrder: undefined
                },
                {
                    _ROOT_: 'E_TEA',
                    rowId: 2,
                    bgColorMap: {},
                    fgColorMap: {},
                    date: '27-OCT-2022',
                    USD_3m_key: 127.6393737285191,
                    CAD_3m_key: 86,
                    CAD_6m_key: 86,
                    CAD_9m_key: 0,
                    sectorOrder: undefined
                },
                {
                    _ROOT_: 'E_TEA',
                    rowId: 3,
                    bgColorMap: {},
                    fgColorMap: {},
                    date: '28-OCT-2022',
                    USD_3m_key: 126.63937372851909,
                    CAD_3m_key: 94.62999999999998,
                    CAD_6m_key: 94.62999999999998,
                    CAD_9m_key: 0,
                    sectorOrder: undefined
                },
                {
                    _ROOT_: 'E_TEA',
                    rowId: 4,
                    bgColorMap: {},
                    fgColorMap: {},
                    date: '29-OCT-2022',
                    USD_3m_key: 125.63937372851909,
                    CAD_3m_key: 94.64689410415626,
                    CAD_6m_key: 94.64689410415626,
                    CAD_9m_key: 0,
                    sectorOrder: undefined
                },
                {
                    _ROOT_: 'E_TEA',
                    rowId: 5,
                    bgColorMap: {},
                    fgColorMap: {},
                    date: '30-OCT-2022',
                    USD_3m_key: 124.96887187908764,
                    CAD_3m_key: 94.56052096050085,
                    CAD_6m_key: 0,
                    CAD_9m_key: 0,
                    sectorOrder: undefined
                }
            ]);
        });

        describe('With Comparison toggle enabled', () => {
            it('Comparison Mode value', async() => {
                const {cube} = createDataCube(factorDataRequest, data6 as any, null, null, {
                    factorTimeSeriesSelectedOption: FactorTimeSeriesSelectedOption.VOLATILITIES,
                    compareModeToggle: true,
                    compareMode: COMPARE_MODE_VALUE
                } as FactorDataCustomVizConfig);
                expect(cube).toBeTruthy();
                const port = 'E_TEA';
                const groupColumns = [ROOT_LEVEL];
                const groupLevels: GroupLevel = {groupKeys: [port] , groupColumns};
                const ck = createQueryKeyForLevel( groupLevels, [new AggregationKey('USD_3m_key', 'sum'), new AggregationKey('CAD_3m_key', 'sum')], true);
                expect(cube.has(ck)).toBeTruthy();
                let cubeData: any[];
                cube.get(ck).subscribe(data => {
                    cubeData = data;
                });
                expect(cubeData).toEqual([
                    {
                        _ROOT_: 'E_TEA',
                        rowId: 1,
                        bgColorMap: {},
                        fgColorMap: {},
                        date: '26-OCT-2022',
                        USD_3m_key: 0,
                        CAD_3m_key: 0,
                        CAD_6m_key: 0,
                        CAD_9m_key: 0,
                        sectorOrder: undefined
                    },
                    {
                        _ROOT_: 'E_TEA',
                        rowId: 2,
                        bgColorMap: {},
                        fgColorMap: {},
                        date: '27-OCT-2022',
                        USD_3m_key: -1,
                        CAD_3m_key: 0.12000000000000455,
                        CAD_6m_key: 0,
                        CAD_9m_key: 0,
                        sectorOrder: undefined
                    },
                    {
                        _ROOT_: 'E_TEA',
                        rowId: 3,
                        bgColorMap: {},
                        fgColorMap: {},
                        date: '28-OCT-2022',
                        USD_3m_key: -2.000000000000014,
                        CAD_3m_key: 8.749999999999986,
                        CAD_6m_key: 8.629999999999981,
                        CAD_9m_key: 0,
                        sectorOrder: undefined
                    },
                    {
                        _ROOT_: 'E_TEA',
                        rowId: 4,
                        bgColorMap: {},
                        fgColorMap: {},
                        date: '29-OCT-2022',
                        USD_3m_key: -3.000000000000014,
                        CAD_3m_key: 8.766894104156265,
                        CAD_6m_key: 8.64689410415626,
                        CAD_9m_key: 0,
                        sectorOrder: undefined
                    },
                    {
                        _ROOT_: 'E_TEA',
                        rowId: 5,
                        bgColorMap: {},
                        fgColorMap: {},
                        date: '30-OCT-2022',
                        USD_3m_key: -3.67050184943146,
                        CAD_3m_key: 8.680520960500857,
                        CAD_6m_key: -86,
                        CAD_9m_key: 0,
                        sectorOrder: undefined
                    }
                ]);
            });

            it('Comparison Mode percent', async() => {
                const {cube} = createDataCube(factorDataRequest, data6 as any, null, null, {
                    factorTimeSeriesSelectedOption: FactorTimeSeriesSelectedOption.VOLATILITIES,
                    compareModeToggle: true,
                    comparisonMode: COMPARE_MODE_PERCENT
                } as FactorDataCustomVizConfig);
                expect(cube).toBeTruthy();
                const port = 'E_TEA';
                const groupColumns = [ROOT_LEVEL];
                const groupLevels: GroupLevel = {groupKeys: [port] , groupColumns};
                const ck = createQueryKeyForLevel( groupLevels, [new AggregationKey('USD_3m_key', 'sum'), new AggregationKey('CAD_3m_key', 'sum')], true);
                expect(cube.has(ck)).toBeTruthy();
                let cubeData: any[];
                cube.get(ck).subscribe(data => {
                    cubeData = data;
                });
                expect(cubeData).toEqual([
                    {
                        _ROOT_: 'E_TEA',
                        rowId: 1,
                        bgColorMap: {},
                        fgColorMap: {},
                        date: '26-OCT-2022',
                        USD_3m_key: 0,
                        CAD_3m_key: 0,
                        CAD_6m_key: 0,
                        CAD_9m_key: 0,
                        sectorOrder: undefined
                    },
                    {
                        _ROOT_: 'E_TEA',
                        rowId: 2,
                        bgColorMap: {},
                        fgColorMap: {},
                        date: '27-OCT-2022',
                        USD_3m_key: -0.7773669686160031,
                        CAD_3m_key: 0.13972985561248783,
                        CAD_6m_key: 0,
                        CAD_9m_key: 0,
                        sectorOrder: undefined
                    },
                    {
                        _ROOT_: 'E_TEA',
                        rowId: 3,
                        bgColorMap: {},
                        fgColorMap: {},
                        date: '28-OCT-2022',
                        USD_3m_key: -1.5547339372320172,
                        CAD_3m_key: 10.188635305076836,
                        CAD_6m_key: 10.034883720930212,
                        CAD_9m_key: 0,
                        sectorOrder: undefined
                    },
                    {
                        _ROOT_: 'E_TEA',
                        rowId: 4,
                        bgColorMap: {},
                        fgColorMap: {},
                        date: '29-OCT-2022',
                        USD_3m_key: -2.3321009058480204,
                        CAD_3m_key: 10.208307061197328,
                        CAD_6m_key: 10.054528028088674,
                        CAD_9m_key: 0,
                        sectorOrder: undefined
                    },
                    {
                        _ROOT_: 'E_TEA',
                        rowId: 5,
                        bgColorMap: {},
                        fgColorMap: {},
                        date: '30-OCT-2022',
                        USD_3m_key: -2.8533268959919672,
                        CAD_3m_key: 10.107732837099276,
                        CAD_6m_key: -100,
                        CAD_9m_key: 0,
                        sectorOrder: undefined
                    }
                ]);
            });
        });
    });

    it('should create Cube for Factor Data Widget when Risk matrix mode is selected', (done) => {
        const colFormat = new NumericColumnFormat();
        colFormat.decimalPlaces = 9;
        colFormat.scalingFactor = 1;
        colFormat.isScalable = true;

        request = {
            portfolio: 'E_TEA',
            columns: [
                {
                    columnKey: 'rfv_ftitle',
                    columnTitle: 'Title',
                    formatter: new StringDataFormatter(),
                    dataType: 'STRING',
                    columnTag: 'rfv_ftitle',
                    isHidden: false,
                    isSubtotalable: false,
                    originalColumnTitle: 'Title'
                },
                {
                    columnKey: 'USD_3m_key',
                    columnTitle: 'Tsy 3M',
                    formatter: new NumericDataFormatter(colFormat, []),
                    dataType: 'DOUBLE',
                    columnTag: 'USD_3m',
                    isHidden: false,
                    isSubtotalable: true,
                    originalColumnTitle: 'USD_3m'
                },
                {
                    columnKey: 'USD_1yr_key',
                    columnTitle: 'Tsy 1Y',
                    formatter: new NumericDataFormatter(colFormat, []),
                    dataType: 'DOUBLE',
                    columnTag: 'USD_1yr',
                    isHidden: false,
                    isSubtotalable: true,
                    originalColumnTitle: 'USD_1yr'
                },
            ]
        };
        const customVizConfig: FactorDataCustomVizConfig = {
            isTimeSeriesMode: false,
            factorTimeSeriesSelectedOption: FactorTimeSeriesSelectedOption.CORRELATIONS,
            isTriangularMatrix: true,
            showChangeInUpperTriangle: false,
            factorDataHighlightSettings: new FactorDataHighlightSettings(),
            colKeys: [],
        } as FactorDataCustomVizConfig;
        const {cube} = createDataCube(request, data7 as any, null, null, customVizConfig);
        expect(cube).toBeTruthy();
        const port = 'E_TEA';
        const groupColumns = [ROOT_LEVEL];
        const groupLevels: GroupLevel = {groupKeys: [port] , groupColumns};
        const ck = createQueryKeyForLevel( groupLevels, [new AggregationKey('USD_3m_key', 'sum'), new AggregationKey('USD_1yr_key', 'sum')], true);
        expect(cube.has(ck)).toBeTruthy();
        cube.get(ck).subscribe(data => {
            expect(data).toEqual([
                {
                    _ROOT_: 'E_TEA',
                    rowId: 1,
                    bgColorMap: {},
                    fgColorMap: {},
                    sectorOrder: undefined,
                    rfv_ftitle: 'Tsy 3M',
                    USD_3m_key: 1.0,
                    USD_1yr_key: null
                },
                {
                    _ROOT_: 'E_TEA',
                    rowId: 2,
                    bgColorMap: {},
                    fgColorMap: {},
                    sectorOrder: undefined,
                    rfv_ftitle: 'Tsy 1Y',
                    USD_3m_key: 0.6655207023178683,
                    USD_1yr_key: 1.0
                }
            ]);
            done();
        });
    });

});
