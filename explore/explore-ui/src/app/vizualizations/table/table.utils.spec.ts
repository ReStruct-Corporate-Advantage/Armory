import {
    cellKeyDownHandler,
    determineColumnFilter,
    doScalingOrDecimalPreChecks,
    generateColumn,
    generateColumnDefinitions,
    generateColumnGroups,
    generateGroupColumn,
    getCellStyle,
    getColumnHeaderNameWithScaling,
    getSortedColumns,
    getUpdatedColumnState,
    handleKeydownForS,
    updateHeaderNameOrValueGetter
} from './table.utils';
import {data1, data3} from '@mocks/test-data/qbstr-test-data';
import {
    ExploreResponse,
    ExploreResponseConfig,
    ExpostStatsRequestAdapterConfig,
    RequestAdapterConfig,
    VizualizationColumnConfig
} from '../../interfaces';
import {ROOT_LEVEL} from '@utils/qbstr';
import {ColDef, ColGroupDef} from 'ag-grid-community';
import {Widget} from '@models/widget/widget.model';
import {
    ColumnConfig,
    NumericColumnFormat,
    TableColumnState,
    WidgetConfigType,
    WidgetInputType
} from '@blk/explore-ui-core';
import {
    ColumnSet,
    DataFormatter,
    NumericColumnFormatColumnOption,
    NumericDataFormatter
} from '@blk/explore-ui-column-option';
import {SortedColumn} from '@models/widget/inputs/sorted-columns/sorted-column';

describe('Table Utils Test', () => {

    let request: RequestAdapterConfig;
    beforeAll(() => {
        request = {
            portfolio: 'PEP',
            columns: [
                {
                    originalColumnTitle: 'cusip_0',
                    columnKey: 'cusip_0',
                    columnTitle: 'cusip_0',
                    formatter: undefined,
                    dataType: 'STRING',
                    columnTag: 'cusip_0',
                    isHidden: false,
                    isSubtotalable: false,
                    width: 100,
                    pinned: null
                },
                {
                    originalColumnTitle: 'pct_mv_1',
                    columnKey: 'pct_mv_1',
                    columnTitle: 'pct_mv_1',
                    formatter: {format: () => ''},
                    dataType: 'DOUBLE',
                    columnTag: 'pct_mv_1',
                    isHidden: false,
                    isSubtotalable: true,
                    width: 100,
                    pinned: 'right'
                },
                {
                    originalColumnTitle: 'security_description_1',
                    columnKey: 'security_description_1',
                    columnTitle: 'security_description_1',
                    formatter: {format: () => ''},
                    dataType: 'STRING',
                    columnTag: 'security_description_1',
                    isHidden: false,
                    isSubtotalable: false,
                    width: 100,
                    pinned: null
                }
            ]
        };
    });

    it('should test generate Column Definitions #1', () => {
        const colDefs = generateColumnDefinitions(request, data1.data as any, [ROOT_LEVEL, 'level-1', 'level-2']);
        expect(colDefs.length).toEqual(6);
    });

    it('should test generate Column Definitions #2', () => {
        const request2 = {
            portfolio: 'PEP',
            columns: [
                {
                    originalColumnTitle: 'cusip_0',
                    columnKey: 'cusip_0',
                    columnTitle: 'cusip_0',
                    formatter: undefined,
                    dataType: 'STRING',
                    columnTag: 'cusip_0',
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'pct_mv_1586952131474',
                    columnTitle: 'pct_mv_1586952131474',
                    formatter: {format: () => ''},
                    dataType: 'DOUBLE',
                    columnTag: 'pct_mv_1',
                    isHidden: false,
                    isSubtotalable: true
                },
                {
                    columnKey: 'pct_mv_1586952153403',
                    columnTitle: 'pct_mv_1586952153403',
                    formatter: {format: () => ''},
                    dataType: 'DOUBLE',
                    columnTag: 'pct_mv_1',
                    isHidden: false,
                    isSubtotalable: true
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
                }
            ]
        };
        const colDefs: Array<ColDef | ColGroupDef> = generateColumnDefinitions(request2, data3.data as any, [ROOT_LEVEL, 'level-1']);
        expect(colDefs.length).toEqual(5);
        expect((colDefs[3] as ColGroupDef).children).toBeTruthy();
        expect((colDefs[3] as ColGroupDef).children.length).toEqual(3);
    });

    it('tests generateColumnDefinitions - for multiple column groups', () => {
        const cols = [
            {
                originalColumnTitle: 'Security Description',
                columnKey: 'security_description_1',
                columnTag: 'security_description',
                columnTitle: 'Security Description',
                dataType: 'STRING',
                formatter: null,
                isHidden: false,
                isSubtotalable: false
            },
            {
                originalColumnTitle: 'CUSIP',
                columnKey: 'cusip_0',
                columnTag: 'cusip',
                columnTitle: 'CUSIP',
                dataType: 'STRING',
                formatter: null,
                isHidden: false,
                isSubtotalable: false
            },
            {
                originalColumnTitle: 'Market Value %',
                columnKey: 'pct_mv_1',
                columnTag: 'pct_mv',
                columnTitle: 'Market Value %',
                dataType: 'DOUBLE',
                formatter: null,
                isHidden: false,
                isSubtotalable: true
            },
            {
                originalColumnTitle: 'Benchmark Market Value %',
                columnKey: 'pct_mv_0c77391e98734be',
                columnTag: 'pct_mv',
                columnTitle: 'Benchmark Market Value %',
                dataType: 'DOUBLE',
                formatter: null,
                isHidden: false,
                isSubtotalable: true
            },
            {
                columnKey: 'pct_mv_4fd8083f992c42e',
                columnTag: 'pct_mv',
                columnTitle: 'Active Market Value %',
                dataType: 'DOUBLE',
                formatter: null,
                isHidden: false,
                isSubtotalable: true
            },
            {
                columnKey: 'notional_mv_e0f934eaf2ac43f',
                columnTag: 'notional_mv',
                columnTitle: 'Notional Market Value',
                dataType: 'DOUBLE',
                formatter: null,
                isHidden: false,
                isSubtotalable: true
            },
            {
                columnKey: 'notional_mv_41037b6c2d31441',
                columnTag: 'notional_mv',
                columnTitle: 'Benchmark Notional Market Value',
                dataType: 'DOUBLE',
                formatter: null,
                isHidden: false,
                isSubtotalable: true
            },
            {
                columnKey: 'notional_mv_f2e51a5bb9c747e',
                columnTag: 'notional_mv',
                columnTitle: 'Active Notional Market Value',
                dataType: 'DOUBLE',
                formatter: null,
                isHidden: false,
                isSubtotalable: true
            }
        ];
        const requestConfig = {
            columns: cols,
            splitColumns: cols,
            portfolio: 'PEP'
        };
        const response: ExploreResponseConfig = {
            columnHeaderDetails: {
                columnKeyToDisplayNameMap: {
                    cusip_0: 'CUSIP',
                    notional_mv_41037b6c2d31441: 'Benchmark Notional Market Value',
                    notional_mv_e0f934eaf2ac43f: 'Notional Market Value',
                    notional_mv_f2e51a5bb9c747e: 'Active Notional Market Value',
                    pct_mv_0c77391e98734be: 'Benchmark Market Value %',
                    pct_mv_1: 'Market Value %',
                    pct_mv_4fd8083f992c42e: 'Active Market Value %',
                    security_description_1: 'Security Description'
                },
                columnKeyToTagMap: {
                    cusip_0: 'cusip',
                    notional_mv_41037b6c2d31441: 'notional_mv',
                    notional_mv_e0f934eaf2ac43f: 'notional_mv',
                    notional_mv_f2e51a5bb9c747e: 'notional_mv',
                    pct_mv_0c77391e98734be: 'pct_mv',
                    pct_mv_1: 'pct_mv',
                    pct_mv_4fd8083f992c42e: 'pct_mv',
                    security_description_1: 'security_description'
                },
                possibleColumnGroups: [
                    {
                        columnKeyToChildHeaderMap: {
                            pct_mv_0c77391e98734be: 'Benchmark',
                            pct_mv_1: 'Portfolio',
                            pct_mv_4fd8083f992c42e: 'Active'
                        },
                        columnKeys: ['pct_mv_4fd8083f992c42e', 'pct_mv_1', 'pct_mv_0c77391e98734be'],
                        groupName: 'Market Value %'
                    },
                    {
                        columnKeyToChildHeaderMap: {
                            notional_mv_41037b6c2d31441: 'Benchmark',
                            notional_mv_e0f934eaf2ac43f: 'Portfolio',
                            notional_mv_f2e51a5bb9c747e: 'Active'
                        },
                        columnKeys: ['notional_mv_e0f934eaf2ac43f', 'notional_mv_f2e51a5bb9c747e', 'notional_mv_41037b6c2d31441'],
                        groupName: 'Notional Market Value'
                    }
                ]
            },
            columns: ['security_description_1', 'cusip_0', 'pct_mv_1', 'pct_mv_0c77391e98734be', 'pct_mv_4fd8083f992c42e', 'notional_mv_e0f934eaf2ac43f', 'notional_mv_41037b6c2d31441', 'notional_mv_f2e51a5bb9c747e']
        };
        const breakdownLevels = ['_ROOT_', 'level-1'];

        const colDefs = generateColumnDefinitions(requestConfig, response, breakdownLevels);
        expect(colDefs.length).toBe(6);
        const colDefForMarketVal = colDefs[4] as ColGroupDef;
        expect(colDefForMarketVal.headerName).toBe('Market Value %');
        expect(colDefForMarketVal.children.length).toBe(3);
        expect((colDefForMarketVal.children[0] as ColDef).field).toBe('pct_mv_1');
        expect((colDefForMarketVal.children[0] as ColDef).headerName).toBe('Portfolio');
        expect((colDefForMarketVal.children[1] as ColDef).field).toBe('pct_mv_0c77391e98734be');
        expect((colDefForMarketVal.children[1] as ColDef).headerName).toBe('Benchmark');
        expect((colDefForMarketVal.children[2] as ColDef).field).toBe('pct_mv_4fd8083f992c42e');
        expect((colDefForMarketVal.children[2] as ColDef).headerName).toBe('Active');

        const colDefForNotionalMarketVal = colDefs[5] as ColGroupDef;
        expect(colDefForNotionalMarketVal.headerName).toBe('Notional Market Value');
        expect(colDefForNotionalMarketVal.children.length).toBe(3);
        expect((colDefForNotionalMarketVal.children[0] as ColDef).field).toBe('notional_mv_e0f934eaf2ac43f');
        expect((colDefForNotionalMarketVal.children[0] as ColDef).headerName).toBe('Portfolio');
        expect((colDefForNotionalMarketVal.children[1] as ColDef).field).toBe('notional_mv_41037b6c2d31441');
        expect((colDefForNotionalMarketVal.children[1] as ColDef).headerName).toBe('Benchmark');
        expect((colDefForNotionalMarketVal.children[2] as ColDef).field).toBe('notional_mv_f2e51a5bb9c747e');
        expect((colDefForNotionalMarketVal.children[2] as ColDef).headerName).toBe('Active');

    });

    it('tests generateColumnDefinitions - for column group and split together with width and pinned', () => {
        const requestConfig = {
            columns: [
                {
                    columnKey: 'security_description_1',
                    columnTag: 'security_description',
                    columnTitle: 'Security Description',
                    dataType: 'STRING',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'cusip_0',
                    columnTag: 'cusip',
                    columnTitle: 'CUSIP',
                    dataType: 'STRING',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'pct_mv_1',
                    columnTag: 'pct_mv',
                    columnTitle: 'Market Value %',
                    dataType: 'DOUBLE',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: true
                },
                {
                    columnKey: 'pct_mv_0c77391e98734be',
                    columnTag: 'pct_mv',
                    columnTitle: 'Benchmark Market Value %',
                    dataType: 'DOUBLE',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: true
                }
            ],
            splitColumns: [
                {
                    columnKey: 'security_description_1',
                    columnTag: 'security_description',
                    columnTitle: 'Security Description',
                    dataType: 'STRING',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'cusip_0',
                    columnTag: 'cusip',
                    columnTitle: 'CUSIP',
                    dataType: 'STRING',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'pct_mv_1|Current',
                    columnTag: 'pct_mv',
                    columnTitle: 'Current',
                    dataType: 'DOUBLE',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: true
                },
                {
                    columnKey: 'pct_mv_1|Prior Day',
                    columnTag: 'pct_mv',
                    columnTitle: 'Prior Day',
                    dataType: 'DOUBLE',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: true
                },
                {
                    columnKey: 'pct_mv_0c77391e98734be',
                    columnTag: 'pct_mv',
                    columnTitle: 'Benchmark Market Value %',
                    dataType: 'DOUBLE',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: true
                }
            ],
            portfolio: 'PEP'
        };
        const widgetColumnConfigs = [
            new TableColumnState('security_description_1'),
            new TableColumnState('cusip_0', undefined, 'right'),
            new TableColumnState('pct_mv_1', 754.8486328125),
            new TableColumnState('pct_mv_0c77391e98734be'),
            new TableColumnState('pct_mv_1|Current', 542.123046875),
            new TableColumnState('pct_mv_1|Prior Day')
        ];

        const response: ExploreResponseConfig = {
            columnHeaderDetails: {
                columnKeyToDisplayNameMap: {
                    cusip_0: 'CUSIP',
                    pct_mv_0c77391e98734be: 'Benchmark Market Value %',
                    pct_mv_1: 'Market Value %',
                    security_description_1: 'Security Description'
                },
                columnKeyToTagMap: {
                    cusip_0: 'cusip',
                    pct_mv_0c77391e98734be: 'pct_mv',
                    pct_mv_1: 'pct_mv',
                    security_description_1: 'security_description'
                },
                possibleColumnGroups: [
                    {
                        columnKeyToChildHeaderMap: {
                            pct_mv_0c77391e98734be: 'Benchmark',
                            pct_mv_1: 'Portfolio'
                        },
                        columnKeys: ['pct_mv_1', 'pct_mv_0c77391e98734be'],
                        groupName: 'Market Value %'
                    }
                ]
            },
            columns: ['security_description_1', 'cusip_0', 'pct_mv_1|Current', 'pct_mv_1|Prior Day', 'pct_mv_0c77391e98734be'],
            splitColumnKeys: {
                pct_mv_1: [
                    {
                        header: 'Current',
                        originalKey: 'pct_mv_1|Current',
                        updatedKey: 'pct_mv_1|Current',
                        updatedKeySuffix: 'Current'
                    },
                    {
                        header: 'Prior Day',
                        originalKey: 'pct_mv_1|Prior Day',
                        updatedKey: 'pct_mv_1|Prior Day',
                        updatedKeySuffix: 'Prior Day'
                    }
                ]
            }
        };
        const breakdownLevels = ['_ROOT_', 'level-1'];


        const colDefs = generateColumnDefinitions(requestConfig, response, breakdownLevels, widgetColumnConfigs);
        expect(colDefs.length).toBe(5);

        const colDefCusip = colDefs[3] as ColDef;
        expect(colDefCusip.field).toBe('cusip_0');
        expect(colDefCusip.pinned).toBe('right');

        const colDefForMarketVal = colDefs[4] as ColGroupDef;
        expect(colDefForMarketVal.headerName).toBe('Market Value %');
        expect(colDefForMarketVal.children.length).toBe(2);
        expect((colDefForMarketVal.children[0] as ColGroupDef).headerName).toBe('Portfolio');
        expect((colDefForMarketVal.children[0] as ColGroupDef).children.length).toBe(2);
        expect(((colDefForMarketVal.children[0] as ColGroupDef).children[0] as ColDef).headerName).toBe('Current');
        expect(((colDefForMarketVal.children[0] as ColGroupDef).children[0] as ColDef).field).toBe('pct_mv_1|Current');
        expect(((colDefForMarketVal.children[0] as ColGroupDef).children[0] as ColDef).width).toBe(542.123046875);
        expect(((colDefForMarketVal.children[0] as ColGroupDef).children[1] as ColDef).headerName).toBe('Prior Day');
        expect(((colDefForMarketVal.children[0] as ColGroupDef).children[1] as ColDef).field).toBe('pct_mv_1|Prior Day');
        expect((colDefForMarketVal.children[1] as ColDef).field).toBe('pct_mv_0c77391e98734be');
        expect((colDefForMarketVal.children[1] as ColDef).headerName).toBe('Benchmark');


    });

    it('tests generateColumnDefinitions - for split column keys scenario', () => {
        const requestConfig = {
            columns: [{
                originalColumnTitle: undefined,
                columnTag: 'portfolio',
                columnKey: 'portfolio',
                columnTitle: 'Portfolio',
                formatter: {format: () => ''},
                dataType: 'STRING',
                isHidden: false,
                isSubtotalable: false
            }, {
                originalColumnTitle: undefined,
                columnTag: 'pct_nav_group',
                columnKey: 'pct_nav_group_1',
                columnTitle: 'Port Group NAV %',
                formatter: {format: () => ''},
                dataType: 'DOUBLE',
                isHidden: false,
                isSubtotalable: false
            }
            ],
            splitColumns: [{
                columnTag: 'portfolio',
                columnKey: 'portfolio',
                columnTitle: 'Portfolio',
                formatter: {format: () => ''},
                dataType: 'STRING',
                isHidden: false,
                isSubtotalable: false
            }, {
                columnTag: 'pct_nav_group',
                columnKey: 'pct_nav_group_1|Current',
                formatter: {format: () => ''},
                columnTitle: 'Current',
                dataType: 'DOUBLE',
                isHidden: false,
                isSubtotalable: false
            }, {
                columnTag: 'pct_nav_group',
                columnKey: 'pct_nav_group_1|Prior Day',
                formatter: {format: () => ''},
                columnTitle: 'Prior Day',
                dataType: 'DOUBLE',
                isHidden: false,
                isSubtotalable: false
            }],
            portfolio: 'CORE-HQ'
        };

        const responseConfig: ExploreResponseConfig = {
            columnHeaderDetails: {
                columnKeyToDisplayNameMap: {
                    pct_nav_group_1: 'Port Group NAV %',
                    portfolio: 'Portfolio'
                },
                columnKeyToTagMap: {
                    pct_nav_group_1: 'pct_nav_group',
                    portfolio: 'portfolio'
                }
            },
            columns: ['portfolio', 'pct_nav_group_1|Current', 'pct_nav_group_1|Prior Day'],
            splitColumnKeys: {
                pct_nav_group_1: [{
                    header: 'Current',
                    originalKey: 'pct_nav_group_1|Current',
                    updatedKeySuffix: 'Current',
                    updatedKey: 'pct_nav_group_1|Current'
                }, {
                    header: 'Prior Day',
                    originalKey: 'pct_nav_group_1|Prior Day',
                    updatedKeySuffix: 'Prior Day',
                    updatedKey: 'pct_nav_group_1|Prior Day'
                }
                ]
            },
            footerDetails: {
                'PUBLISH_TIME': 0
            }
        };

        const colDefs: (ColDef | ColGroupDef)[] = generateColumnDefinitions(requestConfig, responseConfig, [ROOT_LEVEL]);
        expect(colDefs.length).toEqual(3);
        expect((colDefs[2] as ColGroupDef).children).toBeTruthy();
        expect((colDefs[2] as ColGroupDef).children.length).toEqual(2);
    });

    it('When response does not contain anything colDef will be an empty array', () => {
       const response: ExploreResponseConfig = {columns: [], columnHeaderDetails: {columnKeyToDisplayNameMap: {}, columnKeyToTagMap: {}}};
       response.columns = [];
       const request: RequestAdapterConfig = {columns: [], portfolio: 'PEP'};
       const colDef = generateColumnDefinitions(request, response, [ROOT_LEVEL]);
       expect(colDef).toStrictEqual([]);
    });

    it('tests generateColumnDefinitions - for multi level split columns', () => {
        const requestConfig = {
            columns: [
                {
                    columnKey: 'security_description_1',
                    columnTag: 'security_description',
                    columnTitle: 'Security Description',
                    dataType: 'STRING',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'cusip_0',
                    columnTag: 'cusip',
                    columnTitle: 'CUSIP',
                    dataType: 'STRING',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'pct_mv_1',
                    columnTag: 'pct_mv',
                    columnTitle: 'Market Value %',
                    dataType: 'DOUBLE',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: true
                }
            ],
            splitColumns: [
                {
                    columnKey: 'security_description_1',
                    columnTag: 'security_description',
                    columnTitle: 'Security Description',
                    dataType: 'STRING',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'cusip_0',
                    columnTag: 'cusip',
                    columnTitle: 'CUSIP',
                    dataType: 'STRING',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'pct_mv_1|Current|Total',
                    columnTag: 'pct_mv',
                    columnTitle: 'Total',
                    dataType: 'DOUBLE',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: true
                },
                {
                    columnKey: 'pct_mv_1|Current|CASH',
                    columnTag: 'pct_mv',
                    columnTitle: 'CASH',
                    dataType: 'DOUBLE',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: true
                },
                {
                    columnKey: 'pct_mv_1|Current|EQUITY',
                    columnTag: 'pct_mv',
                    columnTitle: 'EQUITY',
                    dataType: 'DOUBLE',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: true
                },
                {
                    columnKey: 'pct_mv_1|Current|FUND',
                    columnTag: 'pct_mv',
                    columnTitle: 'FUND',
                    dataType: 'DOUBLE',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: true
                },
                {
                    columnKey: 'pct_mv_1|Prior Day|Total',
                    columnTag: 'pct_mv',
                    columnTitle: 'Total',
                    dataType: 'DOUBLE',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: true
                },
                {
                    columnKey: 'pct_mv_1|Prior Day|CASH',
                    columnTag: 'pct_mv',
                    columnTitle: 'CASH',
                    dataType: 'DOUBLE',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: true
                },
                {
                    columnKey: 'pct_mv_1|Prior Day|EQUITY',
                    columnTag: 'pct_mv',
                    columnTitle: 'EQUITY',
                    dataType: 'DOUBLE',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: true
                },
                {
                    columnKey: 'pct_mv_1|Prior Day|FUND',
                    columnTag: 'pct_mv',
                    columnTitle: 'FUND',
                    dataType: 'DOUBLE',
                    formatter: null,
                    isHidden: false,
                    isSubtotalable: true
                }
            ],
            portfolio: 'PEP'
        };
        const response: ExploreResponseConfig = {
            columnHeaderDetails: {
                columnKeyToDisplayNameMap: {
                    cusip_0: 'CUSIP',
                    pct_mv_1: 'Portfolio Market Value % (Security Group)',
                    security_description_1: 'Security Description'
                },
                columnKeyToTagMap: {
                    cusip_0: 'cusip',
                    pct_mv_1: 'pct_mv',
                    security_description_1: 'security_description'
                }
            },
            columns: ['security_description_1', 'cusip_0', 'pct_mv_1|Current|Total', 'pct_mv_1|Current|CASH', 'pct_mv_1|Current|EQUITY', 'pct_mv_1|Current|FUND', 'pct_mv_1|Prior Day|Total', 'pct_mv_1|Prior Day|CASH',
                'pct_mv_1|Prior Day|EQUITY', 'pct_mv_1|Prior Day|FUND'],
            splitColumnKeys: {
                pct_mv_1: [
                    {
                        header: 'Current',
                        originalKey: 'pct_mv_1|Current',
                        updatedKey: 'pct_mv_1|Current',
                        updatedKeySuffix: 'Current',
                        children: [
                            {
                                header: 'Total',
                                originalKey: 'pct_mv_1|Current|Total',
                                updatedKey: 'pct_mv_1|Current|Total',
                                updatedKeySuffix: 'Total'
                            },
                            {
                                header: 'CASH',
                                originalKey: 'pct_mv_1|Current|CASH',
                                updatedKey: 'pct_mv_1|Current|CASH',
                                updatedKeySuffix: 'CASH'
                            },
                            {
                                header: 'EQUITY',
                                originalKey: 'pct_mv_1|Current|EQUITY',
                                updatedKey: 'pct_mv_1|Current|EQUITY',
                                updatedKeySuffix: 'EQUITY'
                            },
                            {
                                header: 'FUND',
                                originalKey: 'pct_mv_1|Current|FUND',
                                updatedKey: 'pct_mv_1|Current|FUND',
                                updatedKeySuffix: 'FUND'
                            }
                        ]
                    },
                    {
                        header: 'Prior Day',
                        originalKey: 'pct_mv_1|Prior Day',
                        updatedKey: 'pct_mv_1|Prior Day',
                        updatedKeySuffix: 'Prior Day',
                        children: [
                            {
                                header: 'Total',
                                originalKey: 'pct_mv_1|Prior Day|Total',
                                updatedKey: 'pct_mv_1|Prior Day|Total',
                                updatedKeySuffix: 'Total'
                            },
                            {
                                header: 'CASH',
                                originalKey: 'pct_mv_1|Prior Day|CASH',
                                updatedKey: 'pct_mv_1|Prior Day|CASH',
                                updatedKeySuffix: 'CASH'
                            },
                            {
                                header: 'EQUITY',
                                originalKey: 'pct_mv_1|Prior Day|EQUITY',
                                updatedKey: 'pct_mv_1|Prior Day|EQUITY',
                                updatedKeySuffix: 'EQUITY'
                            },
                            {
                                header: 'FUND',
                                originalKey: 'pct_mv_1|Prior Day|FUND',
                                updatedKey: 'pct_mv_1|Prior Day|FUND',
                                updatedKeySuffix: 'FUND'
                            }
                        ]
                    }
                ]
            }
        };
        const breakdownLevels = ['_ROOT_', 'level-1'];

        const colDefs = generateColumnDefinitions(requestConfig, response, breakdownLevels);
        expect(colDefs.length).toBe(5);
        const colDefForMarketVal = colDefs[4] as ColGroupDef;
        expect(colDefForMarketVal.headerName).toBe('Portfolio Market Value % (Security Group)');
        expect(colDefForMarketVal.children.length).toBe(2);
        expect((colDefForMarketVal.children[0] as ColGroupDef).headerName).toBe('Current');
        expect((colDefForMarketVal.children[0] as ColGroupDef).children.length).toBe(4);
        expect(((colDefForMarketVal.children[0] as ColGroupDef).children[0] as ColDef).headerName).toBe('Total');
        expect(((colDefForMarketVal.children[0] as ColGroupDef).children[0] as ColDef).field).toBe('pct_mv_1|Current|Total');
        expect(((colDefForMarketVal.children[0] as ColGroupDef).children[1] as ColDef).headerName).toBe('CASH');
        expect(((colDefForMarketVal.children[0] as ColGroupDef).children[1] as ColDef).field).toBe('pct_mv_1|Current|CASH');
        expect(((colDefForMarketVal.children[0] as ColGroupDef).children[2] as ColDef).headerName).toBe('EQUITY');
        expect(((colDefForMarketVal.children[0] as ColGroupDef).children[2] as ColDef).field).toBe('pct_mv_1|Current|EQUITY');
        expect(((colDefForMarketVal.children[0] as ColGroupDef).children[3] as ColDef).headerName).toBe('FUND');
        expect(((colDefForMarketVal.children[0] as ColGroupDef).children[3] as ColDef).field).toBe('pct_mv_1|Current|FUND');

        expect((colDefForMarketVal.children[1] as ColGroupDef).headerName).toBe('Prior Day');
        expect((colDefForMarketVal.children[1] as ColGroupDef).children.length).toBe(4);
        expect(((colDefForMarketVal.children[1] as ColGroupDef).children[0] as ColDef).headerName).toBe('Total');
        expect(((colDefForMarketVal.children[1] as ColGroupDef).children[0] as ColDef).field).toBe('pct_mv_1|Prior Day|Total');
        expect(((colDefForMarketVal.children[1] as ColGroupDef).children[1] as ColDef).headerName).toBe('CASH');
        expect(((colDefForMarketVal.children[1] as ColGroupDef).children[1] as ColDef).field).toBe('pct_mv_1|Prior Day|CASH');
        expect(((colDefForMarketVal.children[1] as ColGroupDef).children[2] as ColDef).headerName).toBe('EQUITY');
        expect(((colDefForMarketVal.children[1] as ColGroupDef).children[2] as ColDef).field).toBe('pct_mv_1|Prior Day|EQUITY');
        expect(((colDefForMarketVal.children[1] as ColGroupDef).children[3] as ColDef).headerName).toBe('FUND');
        expect(((colDefForMarketVal.children[1] as ColGroupDef).children[3] as ColDef).field).toBe('pct_mv_1|Prior Day|FUND');
    });

    it('should test generate Column Definitions - suppressRootNode is true', () => {

        const widgetColumnConfigs = [
            new TableColumnState('security_description_1'),
            new TableColumnState('cusip_0', undefined, 'right'),
            new TableColumnState('pct_mv_1', 754.8486328125)
        ];
        // For flat data structure eg. CORE-HQ
        let colDefs: ColDef[] = generateColumnDefinitions(request, data1.data as any, [ROOT_LEVEL], widgetColumnConfigs, undefined, true);
        expect(colDefs.length).toEqual(4);
        expect(colDefs.find(c => c.field === ROOT_LEVEL).rowGroup).toEqual(false);
        expect(colDefs.find(c => c.field === 'cusip_0').hide).toEqual(false);
        // For nested tree structure eg. TR-MULTI
        colDefs = generateColumnDefinitions(request, data1.data as any, [ROOT_LEVEL, 'level-1'], widgetColumnConfigs, undefined, true);
        expect(colDefs.length).toEqual(5);
        expect(colDefs.find(c => c.field === ROOT_LEVEL).rowGroup).toEqual(false);
        expect(colDefs.find(c => c.field === 'cusip_0').hide).toEqual(true);
    });

    it('should test generate Column Definitions - for expost stats widget', () => {
        const response: ExploreResponse = {
            data: {
                columns: ['test'],
                columnHeaderDetails: {
                    columnKeyToTagMap: null,
                    possibleColumnGroups: [],
                    columnKeyToDisplayNameMap: {}
                },
                data: null
            }
        };
        const colFormatters = new Map<string, DataFormatter>();
        colFormatters.set('test', new NumericDataFormatter(null, []));
         const requestConfig: ExpostStatsRequestAdapterConfig = new (class implements ExpostStatsRequestAdapterConfig {
            columns = [{
                originalColumnTitle: undefined,
                columnTag: null,
                columnKey: 'test',
                columnTitle: null,
                dataType: null,
                isHidden: false,
                isSubtotalable: false,
                formatter: null
            }];
            columnFormatters = colFormatters;
            portfolio = 'PEP';
        })();
       const colDefs = generateColumnDefinitions(requestConfig, response.data as any, [ROOT_LEVEL]);
       expect((colDefs[1] as ColDef).cellRenderer).toBeDefined();
    });


    it('should test generateGroupColumn #1', () => {
        const columName = 'test';
        expect(generateGroupColumn(columName).field).toBe('test');
        expect(generateGroupColumn(columName).hide).toBe(true);
        expect(generateGroupColumn(columName).rowGroup).toBe(true);
        const valueFormatter: any = generateGroupColumn(columName).valueFormatter;
        expect(valueFormatter({value: '5', data: {title: 'TEST'}})).toBe('TEST');
    });

    it('should test generateColumn #1', () => {
        const col: ColDef = generateColumn({
            originalColumnTitle: 'SplitHeaderTest',
            columnKey: 'test',
            columnTitle: 'Test',
            formatter: undefined,
            dataType: 'STRING',
            columnTag: 'test',
            isHidden: false,
            isSubtotalable: false,
            splitColumnHeaderName: 'SplitHeaderTest'
        });
        expect(col.aggFunc).toBeUndefined();
        expect(col.field).toBe('test');
        expect(col.headerName).toBe('Test');
        expect(col.hide).toBe(false);
        expect(col.type).toBe('auxTextColumn');
        expect(col.valueFormatter).toBeUndefined();
        expect(col.cellStyle).toBeDefined();
        expect(col.headerTooltip).toBe('Test SplitHeaderTest');
    });

    it('test getCellStyle', () => {
        let param = {data: {bgColorMap: {market_val: 'rgb(255, 0, 0)'}}} as any;
        let cellStyle = getCellStyle(param, {columnKey: 'market_val'} as any);
        expect(cellStyle.backgroundColor).toBe('rgb(255, 0, 0)');
        expect(cellStyle.color).toBe('#ffffff');
        param = {data: {fgColorMap: {market_val: 'rgb(255, 0, 0)'}}} as any;
        cellStyle = getCellStyle(param, {columnKey: 'market_val'} as any);
        expect(cellStyle.backgroundColor).toBeUndefined();
        expect(cellStyle.color).toBe('rgb(255, 0, 0)');
        param = {data: {fgColorMap: {market_val: 'rgb(255, 0, 0)'}, bgColorMap: {market_val: 'rgb(255, 0, 0)'}}} as any;
        cellStyle = getCellStyle(param, {columnKey: 'market_val'} as any);
        expect(cellStyle.backgroundColor).toBe('rgb(255, 0, 0)');
        expect(cellStyle.color).toBe('rgb(255, 0, 0)');
    });

    it('should test generateColumn #2', () => {
        const columnName = 'test';
        const columnHeader = 'Test';
        const col = generateColumn({
            originalColumnTitle: 'ABC',
            columnKey: 'test',
            columnTitle: 'Test',
            formatter: {format: () => ''},
            dataType: 'STRING',
            columnTag: 'test',
            isHidden: false,
            isSubtotalable: false
        });
        expect(col.field).toEqual(columnName);
        expect(col.headerName).toEqual(columnHeader);
        expect(col.aggFunc).toEqual(undefined);
        expect(col.valueFormatter).toBeTruthy();
        expect(col.headerTooltip).toBe(`Custom Column Title: Test<br>Original Title: ABC`);
    });

    it('should test generateColumn #2_1 - formatter instanceof NumericDataFormatter', () => {
        const columnName = 'test';
        const columnHeader = 'Test';
        const col = generateColumn({
            originalColumnTitle: undefined,
            columnKey: 'test',
            columnTitle: 'Test',
            formatter: new NumericDataFormatter(null, [new NumericColumnFormatColumnOption({scaling: 1})]),
            dataType: 'STRING',
            columnTag: 'test',
            isHidden: false,
            isSubtotalable: false
        }, undefined);
        expect(col.field).toEqual(columnName);
        expect((col.headerValueGetter as () => {})()).toEqual(columnHeader);
        expect(col.aggFunc).toEqual(undefined);
        expect(col.valueFormatter).toBeTruthy();
    });

    it('should test generateColumn #3 - expost stats widget', () => {
        const colFormatters = new Map<string, DataFormatter>();
        colFormatters.set('test', new NumericDataFormatter(null, []));
        const columnName = 'test';
        const col = generateColumn({
            originalColumnTitle: undefined,
            columnKey: 'test',
            columnTitle: null,
            formatter: null,
            dataType: null,
            columnTag: null,
            isHidden: false,
            isSubtotalable: false
        }, colFormatters);
        expect(col.field).toEqual(columnName);
        expect(col.aggFunc).toEqual(undefined);
        expect(col.valueFormatter).toBeUndefined();
        expect(col.cellRenderer).toBeDefined();
    });

    it('should generate column groups', () => {
        const columnName = 'test';
        const columnHeader = 'Test';
        const columnMap = {
            'test': {
                OriginalColumnTitle: undefined,
                columnKey: 'test',
                columnTitle: 'Test',
                formatter: undefined,
                dataType: 'STRING',
                columnTag: 'test',
                isHidden: false,
                isSubtotalable: false
            }
        };
        const col: ColDef = generateColumnGroups(columnName, columnHeader, undefined, columnMap);
        expect(col.field).toBe('test');
        expect(col.hide).toBe(false);
        expect(col.headerName).toBe('Test');
        expect(col.aggFunc).toBeUndefined();
        expect(col.valueFormatter).toBeUndefined();
        expect(col.type).toBe('auxTextColumn');
        expect(col.cellStyle).toBeDefined();
    });

    describe('Tests for control (d & s) shortcuts', () => {
        it('tests handleKeydownForS', () => {
            const numericFormat: NumericColumnFormat = new NumericColumnFormat();
            numericFormat.scalingOptions = new Map<string, number>();
            numericFormat.scalingOptions.set('Basis Point (bp)', 0.0001);
            const numericColOption: NumericColumnFormatColumnOption = new NumericColumnFormatColumnOption({scaling: 0.01});

            // When scaling factor is %
            const numericFormatter: NumericDataFormatter = new NumericDataFormatter(numericFormat, [numericColOption]);

            handleKeydownForS(numericFormatter);
            expect(numericFormatter.optionValue.scaling).toEqual(0.0001);

            // When scaling factor is bps
            numericFormatter.optionValue.scaling = 0.0001;

            handleKeydownForS(numericFormatter);
            expect(numericFormatter.optionValue.scaling).toEqual(0.01);

            // When scaling factor is 1
            numericFormat.scalingOptions.clear();
            numericFormatter.optionValue.scaling = 1;

            handleKeydownForS(numericFormatter);
            expect(numericFormatter.optionValue.scaling).toEqual(1e3);

            // When scaling factor is 1000
            numericFormatter.optionValue.scaling = 1e3;

            handleKeydownForS(numericFormatter);
            expect(numericFormatter.optionValue.scaling).toEqual(1e6);

            // When scaling factor is 1000000
            numericFormatter.optionValue.scaling = 1e6;

            handleKeydownForS(numericFormatter);
            expect(numericFormatter.optionValue.scaling).toEqual(1e9);

            // When scaling factor is 10000000000
            numericFormatter.optionValue.scaling = 1e9;

            handleKeydownForS(numericFormatter);
            expect(numericFormatter.optionValue.scaling).toEqual(1);
        });

        it('tests doScalingOrDecimalPreChecks', () => {
            // When scaling factor is %
            const numericFormatter: NumericDataFormatter = new NumericDataFormatter(new NumericColumnFormat(), []);
            expect(doScalingOrDecimalPreChecks(new NumericDataFormatter(null, []), true)).toBeFalsy();

            numericFormatter.columnFormat.isUseThousandsSeparator = false;
            expect(doScalingOrDecimalPreChecks(numericFormatter, false)).toBeFalsy();

            numericFormatter.columnFormat.isScalable = false;
            expect(doScalingOrDecimalPreChecks(numericFormatter, true)).toBeFalsy();

            numericFormatter.columnFormat.isScalable = true;
            numericFormatter.columnFormat.scalingFactor = 0.01;
            expect(doScalingOrDecimalPreChecks(numericFormatter, true)).toBeTruthy();
            expect(numericFormatter.optionValue.scaling).toBe(0.01);

            numericFormatter.optionValue = new NumericColumnFormatColumnOption();
            numericFormatter.columnFormat.isUseThousandsSeparator = true;
            numericFormatter.columnFormat.decimalPlaces = 6;
            expect(doScalingOrDecimalPreChecks(numericFormatter, false)).toBeTruthy();
            expect(numericFormatter.optionValue.decimalPlaces).toBe(6);
        });

        it('tests cellKeyDownHandler', () => {
            const colDef = {field: 'pct_mv_1'};
            const event = {
                event: {
                    ctrlKey: false,
                    key: ''
                },
                colDef,
                api: {
                    refreshCells: () => {},
                    getRenderedNodes: () => {},
                    refreshHeader: () => {},
                    getColumns: () => [{getColDef: jest.fn().mockReturnValue(colDef), getUserProvidedColDef: jest.fn().mockReturnValue(colDef), getColId: jest.fn().mockReturnValue('pct_mv_1')}]
                },
                context: {}
            };

            const widget = new Widget();
            const columnSet: ColumnSet = new ColumnSet();
            columnSet.columns.push(ColumnConfig.createColumn(null, null, 'pct_mv_1'));
            widget.dataStore.metaData.inputs.set(WidgetInputType.COLUMNS, columnSet);

            const numericFormat: NumericColumnFormat = new NumericColumnFormat();
            numericFormat.scalingOptions = new Map<string, number>();
            numericFormat.scalingOptions.set('Basis Point (bp)', 0.0001);
            const numericFormatter: NumericDataFormatter = new NumericDataFormatter(numericFormat, []);

            const requestConfig: RequestAdapterConfig = {
                columns: [{
                    originalColumnTitle: undefined,
                    columnTag: '',
                    columnKey: 'pct_mv_1',
                    columnTitle: '',
                    dataType: '',
                    isHidden: false,
                    isSubtotalable: true,
                    formatter: numericFormatter as any
                }],
                splitColumns: [{
                    originalColumnTitle: undefined,
                    columnTag: '',
                    columnKey: 'pct_mv_1',
                    columnTitle: '',
                    dataType: '',
                    isHidden: false,
                    isSubtotalable: true,
                    formatter: numericFormatter as any
                },
                    {
                        originalColumnTitle: undefined,
                        columnTag: '',
                        columnKey: 'pct_mv_1| What-IF',
                        columnTitle: '',
                        dataType: '',
                        isHidden: false,
                        isSubtotalable: true,
                        formatter: numericFormatter as any
                    }],
                portfolio: ''
            };

            // #1 - negative
            cellKeyDownHandler(event as any, widget, requestConfig);
            expect(columnSet.columns[0].optionValues.length).toBe(0);
            expect(event.context).toStrictEqual({});

            // #2 - negative
            event.event.ctrlKey = true;
            event.event.key = 'g';
            cellKeyDownHandler(event as any, widget, requestConfig);
            expect(columnSet.columns[0].optionValues.length).toBe(0);
            expect(event.context).toStrictEqual({});

            // #3 - scaling change
            event.event.key = 's';
            requestConfig.columns[0].formatter['columnFormat'].isScalable = true;
            colDef['cellRendererParams'] = {
                vizPivotColumnObject: {
                    formatter: numericFormatter as any
                }
            };
            widget.configType = WidgetConfigType.PIVOT;
            cellKeyDownHandler(event as any, widget, requestConfig);
            expect(columnSet.columns[0].optionValues.length).toBe(1);
            expect((columnSet.columns[0].optionValues[0] as NumericColumnFormatColumnOption).scaling).toBe(0.0001);
            expect(event.context).toStrictEqual({scaledAt: {pct_mv_1: undefined}});

            // #4 - decimal places change
            event.event.key = 'd';
            requestConfig.columns[0].formatter['columnFormat'].isUseThousandsSeparator = true;
            numericFormat.decimalPlaces = 2;
            cellKeyDownHandler(event as any, widget, requestConfig);
            expect(columnSet.columns[0].optionValues.length).toBe(1);
            expect((columnSet.columns[0].optionValues[0] as NumericColumnFormatColumnOption).decimalPlaces).toBe(3);
            expect(event.context).toStrictEqual({scaledAt: {pct_mv_1: 0.0001}});
        });
    });

    it('tests getColumnHeaderNameWithScaling', () => {
        expect(getColumnHeaderNameWithScaling('abc', {'optionValue': {'scaling': 0.0001}} as any)).toBe('abc (bp)');
        expect(getColumnHeaderNameWithScaling('abc', {'optionValue': {'scaling': 1000}} as any)).toBe('abc (m)');
        expect(getColumnHeaderNameWithScaling('abc', {'optionValue': {'scaling': 1000000}} as any)).toBe('abc (mm)');
        expect(getColumnHeaderNameWithScaling('abc', {'optionValue': {'scaling': 1000000000}} as any)).toBe('abc (mmm)');
        expect(getColumnHeaderNameWithScaling('abc', {'optionValue': {'scaling': 0.01}} as any)).toBe('abc');
    });

    it('tests updateHeaderNameOrValueGetter', () => {
        // headerValueGetter - optionValue defined
        let colDef = {headerValueGetter: {}, field: 'abc'};
        let columnMap = {'abc': {'formatter': new NumericDataFormatter(null, [new NumericColumnFormatColumnOption({'scaling': 0.0001})])}};
        updateHeaderNameOrValueGetter(colDef as any, 'bhg', columnMap as any);
        expect(typeof colDef.headerValueGetter === 'function').toBeTruthy();
        expect((colDef.headerValueGetter as () => string)()).toBe('bhg (bp)');

        // headerValueGetter - columnFormat defined
        colDef = {headerValueGetter: {}, field: 'abc'};
        columnMap = {'abc': {'formatter': new NumericDataFormatter(new NumericColumnFormat({scalingFactor: 0.0001}), [])}};
        updateHeaderNameOrValueGetter(colDef as any, 'bhg', columnMap as any);
        expect(typeof colDef.headerValueGetter === 'function').toBeTruthy();
        expect((colDef.headerValueGetter as () => string)()).toBe('bhg (bp)');

        // headerName
        colDef.headerValueGetter = undefined;
        updateHeaderNameOrValueGetter(colDef as any, 'bhg', columnMap as any);
        expect(colDef['headerName']).toBe('bhg');
    });

    it('tests determineColumnFilter', () => {
        const col: VizualizationColumnConfig = {
            originalColumnTitle : 'colTitle',
            columnTag: 'colTag',
            columnKey: 'colKey',
            columnTitle: 'colTitle',
            isHidden: false,
            isSubtotalable: false,
            formatter: null,
            dataType: 'STRING'
        };
        expect(determineColumnFilter(col)).toBe('agTextColumnFilter');
        col.dataType = 'RATING';
        expect(determineColumnFilter(col)).toBe('agTextColumnFilter');
        col.dataType = 'INT';
        expect(determineColumnFilter(col)).toBe('agNumberColumnFilter');
         col.dataType = 'DOUBLE';
        expect(determineColumnFilter(col)).toBe('agNumberColumnFilter');
        col.dataType = 'DATE';
        expect(determineColumnFilter(col)).toBe('agDateColumnFilter');
        col.dataType = 'OTHER';
        expect(determineColumnFilter(col)).toBe('agTextColumnFilter');
    });

    it('should test getSortedColumns', () => {
        const columnStates = [
            {colId: 'ag-Grid-AutoColumn', width: 149, hide: false, pinned: 'left', sort: null},
            {colId: 'security_description_1', width: 149, hide: true, pinned: 'left', sort: null},
            {colId: 'cusip_0', width: 57, hide: false, pinned: null, sort: null},
            {colId: 'pct_mv_1', width: 101, hide: false, pinned: null, sort: 'acs'}
        ];
        expect(getSortedColumns(columnStates)).toEqual([{colId: 'pct_mv_1', sort: 'acs'}]);
    });

    it('test getUpdatedColumnState with direct match', () => {
        const columnStates = [
            {colId: 'security_description_1', width: 149, hide: true, pinned: 'left', sort: null},
            {colId: 'cusip_0', width: 57, hide: false, pinned: null, sort: null},
            {colId: 'pct_mv_1', width: 101, hide: false, pinned: null, sort: 'acs'}
        ];

        const expected = [
            {colId: 'security_description_1', width: 149, hide: true, pinned: 'left', sort: null},
            {colId: 'cusip_0', width: 57, hide: false, pinned: null, sort: 'asc'},
            {colId: 'pct_mv_1', width: 101, hide: false, pinned: null, sort: 'dec'}
        ];

        // {colId: 'pct_mv_1|08/19/2020', sort: 'asc'}
        const sortedCols = [
            new SortedColumn({colId: 'pct_mv_1', sort: 'dec'}),
            new SortedColumn({colId: 'cusip_0', sort: 'asc'})
        ];
        expect(getUpdatedColumnState(columnStates, sortedCols, undefined)).toEqual(expected);
    });

    it('test getUpdatedColumnState with single parent match', () => {
        const columnStates = [
            {colId: 'security_description_1', width: 149, hide: true, pinned: 'left', sort: null},
            {colId: 'cusip_0', width: 57, hide: false, pinned: null, sort: null},
            {colId: 'pct_mv_1|08/17/2020', width: 101, hide: false, pinned: null, sort: 'acs'}
        ];

        const expected = [
            {colId: 'security_description_1', width: 149, hide: true, pinned: 'left', sort: null},
            {colId: 'cusip_0', width: 57, hide: false, pinned: null, sort: null},
            {colId: 'pct_mv_1|08/17/2020', width: 101, hide: false, pinned: null, sort: 'dec'}
        ];

        const sortedCols = [
            new SortedColumn({colId: 'pct_mv_1|08/19/2020', sort: 'dec'}),
        ];
        expect(getUpdatedColumnState(columnStates, sortedCols, undefined)).toEqual(expected);
    });

    it('test getUpdatedColumnState with direct parent match', () => {
        const columnStates = [
            {colId: 'security_description_1', width: 149, hide: true, pinned: 'left', sort: null},
            {colId: 'cusip_0', width: 57, hide: false, pinned: null, sort: null},
            {colId: 'pct_mv_1|08/17/2020', width: 101, hide: false, pinned: null, sort: 'acs'},
            {colId: 'pct_mv_1|08/19/2020', width: 101, hide: false, pinned: null, sort: 'acs'}
        ];

        const expected = [
            {colId: 'security_description_1', width: 149, hide: true, pinned: 'left', sort: null},
            {colId: 'cusip_0', width: 57, hide: false, pinned: null, sort: null},
            {colId: 'pct_mv_1|08/17/2020', width: 101, hide: false, pinned: null, sort: 'acs'},
            {colId: 'pct_mv_1|08/19/2020', width: 101, hide: false, pinned: null, sort: 'dec'}
        ];

        const sortedCols = [
            new SortedColumn({colId: 'pct_mv_1|08/19/2020', sort: 'dec'}),
        ];
        expect(getUpdatedColumnState(columnStates, sortedCols, undefined)).toEqual(expected);
    });

    it('test getUpdatedColumnState with multiple parent skipped', () => {
        const columnStates = [
            {colId: 'security_description_1', width: 149, hide: true, pinned: 'left', sort: null},
            {colId: 'cusip_0', width: 57, hide: false, pinned: null, sort: null},
            {colId: 'pct_mv_1|08/17/2020', width: 101, hide: false, pinned: null, sort: 'acs'},
            {colId: 'pct_mv_1|08/19/2020', width: 101, hide: false, pinned: null, sort: 'acs'}
        ];

        const expected = [
            {colId: 'security_description_1', width: 149, hide: true, pinned: 'left', sort: null},
            {colId: 'cusip_0', width: 57, hide: false, pinned: null, sort: null},
            {colId: 'pct_mv_1|08/17/2020', width: 101, hide: false, pinned: null, sort: 'acs'},
            {colId: 'pct_mv_1|08/19/2020', width: 101, hide: false, pinned: null, sort: 'acs'}
        ];

        const sortedCols = [
            new SortedColumn({colId: 'pct_mv_1|08/20/2020', sort: 'dec'}),
        ];
        expect(getUpdatedColumnState(columnStates, sortedCols, undefined)).toEqual(expected);
    });
});
