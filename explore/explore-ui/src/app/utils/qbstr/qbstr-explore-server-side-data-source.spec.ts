import {ColumnConstants, ColumnDefinition, CoreDefinitionStore} from '@blk/explore-ui-core';
import {ExpandedState} from '@models/widget/inputs/expanded-state.model';
import {AggregationKey, FilterIncludeKey, GroupByKey, QueryKey, SortType} from '@qbstr/data-cube';
import {ReactiveCube, SimpleCube} from '@qbstr/data-cube-reactive';
import {IServerSideGetRowsParams, RowNode} from 'ag-grid-community';
import {BehaviorSubject, of} from 'rxjs';
import {QbstrExploreServerSideDataSource} from './qbstr-explore-server-side-data-source';
import {ROOT_LEVEL} from './qbstr.utils';

const indAuto = {
    '_ROOT_': 'PEP',
    'level-1': 'Industry',
    'level-2': 'Automobile',
    'sec_description': 'sec_description_test_1',
    'cusip': 'cusip_1',
    'market_value': 1,
    'rowId': 1
};
const indConst1 = {
    '_ROOT_': 'PEP',
    'level-1': 'Industry',
    'level-2': 'Construction',
    'sec_description': 'sec_description_test_2',
    'cusip': 'cusip_2',
    'market_value': 1,
    'rowId': 2
};
const indConst2 = {
    '_ROOT_': 'PEP',
    'level-1': 'Industry',
    'level-2': 'Construction',
    'sec_description': 'sec_description_test_3',
    'cusip': 'cusip_3',
    'market_value': 1,
    'rowId': 3
};
const finBank = {
    '_ROOT_': 'PEP',
    'level-1': 'Financial',
    'level-2': 'Bank',
    'sec_description': 'sec_description_test_4',
    'cusip': 'cusip_4',
    'market_value': 1,
    'rowId': 4
};
const finIns = {
    '_ROOT_': 'PEP',
    'level-1': 'Financial',
    'level-2': 'Insurance',
    'sec_description': 'sec_description_test_5',
    'cusip': 'cusip_5',
    'market_value': 1,
    'rowId': 5
};

const data = [indAuto, indConst1, indConst2, finBank, finIns];
const cusip: any = {
    filterType: 'text',
    type: 'contains',
    filter: 'cusip_4'
};

const market_value = {
    filterType: 'number',
    type: 'greaterThan',
    filter: 1
};

const genParams = (model) => ({
    api: {
        getAllGridColumns: () => [{
            getColDef: () => ({
                field: 'market_value',
                valueScaler: (val) => val,
                valueUnScaler: (val) => val
            })
        }]
    },
    request: {
        'startRow': 0,
        'endRow': 100,
        'rowGroupCols': [
            {'id': '_ROOT_', 'displayName': '_ROOT_', 'field': '_ROOT_'},
            {
                'id': 'level-1',
                'displayName': 'Level-1',
                'field': 'level-1'
            },
            {
                'id': 'level-2',
                'displayName': 'Level-2',
                'field': 'level-2'
            }],
        'valueCols': [{'id': 'pct_mv_1', 'aggFunc': 'subTotal', 'displayName': 'Market Value %', 'field': 'pct_mv_1'}],
        'pivotCols': [],
        'pivotMode': false,
        'groupKeys': [],
        'filterModel': model,
        'sortModel': []
    }
});

describe('Test QbstrExploreServerSideDataSource', () => {
    let cube;
    let qessds;

    beforeEach(() => {
        cube = new SimpleCube(data);
    });

    it('should check QbstrExploreServerSideDataSource is created', () => {
        qessds = new QbstrExploreServerSideDataSource({gridApi: {getRowNode: () => {}}, dataCube: cube});
        expect(qessds).toBeTruthy();
    });

    it('should check on row group expand code', (done) => {
        const eventExpand$ = new BehaviorSubject({
            node: {
                data: {[ROOT_LEVEL]: 'PEP', market_value: 1},
                isExpandable: (() => true),
                expanded: true
            },
            rowIndex: undefined,
            rowPinned: undefined,
            context: undefined
        });
        qessds = new QbstrExploreServerSideDataSource({
            gridApi: {
                getRowNode: () => {},
                getRowGroupColumns: () => [{getColDef: () => ({field: ROOT_LEVEL})}]
            },
            dataCube: cube,
            expandedState: new ExpandedState(),
            onRowExpand$: eventExpand$ as any
        });
        expect(qessds).toBeTruthy();
        setTimeout(() => {
            expect(qessds.qssp.expandedState.expandedPaths.length).toEqual(1);
            expect(qessds.qssp.expandedState.expandedPaths).toEqual([[ExpandedState.ROOT_NODE_KEY]]);
            done();
        }, 500);
    });

    it('should rely on title instead of rowId', () => {
        const node = {
            id: 2,
            key: 2,
            field: 'level-1',
            data: {
                [ROOT_LEVEL]: 'PEP',
                title: 'CASH',
                rowId: 2,
                'level-1': 2
            },
            isExpandable: (() => true),
            expanded: true
        };

        qessds = new QbstrExploreServerSideDataSource({
            gridApi: {
                getRowNode: (key) => {
                    if (key !== node.data[ROOT_LEVEL]) {
                        return {data: {title: 'CASH'}};
                    }
                },
                getRowGroupColumns: () => [
                    {getColDef: () => ({field: ROOT_LEVEL})},
                    {getColDef: () => ({field: 'level-1'})}
                ]
            },
            dataCube: cube,
            expandedState: new ExpandedState(),
        });

        expect(qessds.getNodeKey(node)).toEqual(['_ROOT_', 'CASH']);
    });


    it('tests sortData - on auto col', () => {
        const rowData: any[] = [
            {a: 'tjhg', b: 'hde', sectorOrder: 127},
            {a: 'zgfg', b: 'bcd', sectorOrder: 126},
            {a: 'ajhg', b: 'cde', sectorOrder: 128},
            {b: 'def', c: 'cde', sectorOrder: undefined},
            {b: 'tbg', c: 'kut', sectorOrder: undefined},
            {b: 'hbg', c: 'cut', sectorOrder: undefined}
        ];
        const params = {
            request: {
                sortModel: [
                    {colId: ROOT_LEVEL, sort: SortType.DESC}
                ]
            }
        };
        qessds = new QbstrExploreServerSideDataSource({
                gridApi: {
                    getRowNode: () => {},
                    getColumn: () => ({
                        getColDef: jest.fn().mockReturnValue({field: 'c', colTag: 'c'}),
                        getColId: jest.fn().mockReturnValue(ColumnConstants.AUTO_GRP_COLUMN)
                    }),
                    getRowGroupColumns: () => [{
                        getColDef: jest.fn().mockReturnValue({}),
                        getColId: jest.fn().mockReturnValue(ROOT_LEVEL)
                    }],
                    getAllDisplayedColumns: () => [
                        {
                            getColDef: jest.fn().mockReturnValue({field: 'b', colTag: 'b'}),
                            getColId: jest.fn().mockReturnValue('b')
                        },
                        ({
                            getColDef: jest.fn().mockReturnValue({field: 'c', colTag: 'c'}),
                            getColId: jest.fn().mockReturnValue(ColumnConstants.AUTO_GRP_COLUMN)
                        })
                    ]
                },
                dataCube: cube
            } as any
        );

        // #1 - sort on auto group col | descending
        CoreDefinitionStore.columnTagColumnsPairs.set('c', [new ColumnDefinition({
            columnTag: 'c',
            title: '',
            dataType: ColumnConstants.COLUMN_DATA_TYPE.STRING
        })]);
        expect(qessds.sortData(rowData, params as any)).toEqual([
            {b: 'tbg', c: 'kut', sectorOrder: undefined, sortColumn0: 'kut'},
            {b: 'hbg', c: 'cut', sectorOrder: undefined, sortColumn0: 'cut'},
            {b: 'def', c: 'cde', sectorOrder: undefined, sortColumn0: 'cde'},
            {a: 'ajhg', b: 'cde', sectorOrder: 128},
            {a: 'tjhg', b: 'hde', sectorOrder: 127},
            {a: 'zgfg', b: 'bcd', sectorOrder: 126}
        ]);

        // #2 - sort on auto group col | ascending
        params['request']['sortModel'][0][ColumnConstants.SORT_MODEL_KEY] = SortType.ASC;
        expect(qessds.sortData(rowData, params as any)).toEqual([
            {a: 'zgfg', b: 'bcd', sectorOrder: 126},
            {a: 'tjhg', b: 'hde', sectorOrder: 127},
            {a: 'ajhg', b: 'cde', sectorOrder: 128},
            {b: 'def', c: 'cde', sectorOrder: undefined, sortColumn0: 'cde'},
            {b: 'hbg', c: 'cut', sectorOrder: undefined, sortColumn0: 'cut'},
            {b: 'tbg', c: 'kut', sectorOrder: undefined, sortColumn0: 'kut'}
        ]);

        // #3 - sort on non-auto group col | ascending
        CoreDefinitionStore.columnTagColumnsPairs.set('b', [new ColumnDefinition({
            columnTag: 'b',
            title: '',
            dataType: ColumnConstants.COLUMN_DATA_TYPE.STRING
        })]);
        params['request']['sortModel'][0]['origColId'] = 'b';
        params['request']['sortModel'][0]['colId'] = 'b';
        expect(qessds.sortData(rowData, params as any)).toEqual([
            {a: 'zgfg', b: 'bcd', sectorOrder: 126, sortColumn0: 'bcd'},
            {a: 'ajhg', b: 'cde', sectorOrder: 128, sortColumn0: 'cde'},
            {b: 'def', c: 'cde', sectorOrder: undefined, sortColumn0: 'def'},
            {b: 'hbg', c: 'cut', sectorOrder: undefined, sortColumn0: 'hbg'},
            {a: 'tjhg', b: 'hde', sectorOrder: 127, sortColumn0: 'hde'},
            {b: 'tbg', c: 'kut', sectorOrder: undefined, sortColumn0: 'tbg'}
        ]);

        // #4 - sort on non-auto group col | descending
        params['request']['sortModel'][0][ColumnConstants.SORT_MODEL_KEY] = SortType.DESC;
        expect(qessds.sortData(rowData, params as any)).toEqual([
            {b: 'tbg', c: 'kut', sectorOrder: undefined, sortColumn0: 'tbg'},
            {a: 'tjhg', b: 'hde', sectorOrder: 127, sortColumn0: 'hde'},
            {b: 'hbg', c: 'cut', sectorOrder: undefined, sortColumn0: 'hbg'},
            {b: 'def', c: 'cde', sectorOrder: undefined, sortColumn0: 'def'},
            {a: 'ajhg', b: 'cde', sectorOrder: 128, sortColumn0: 'cde'},
            {a: 'zgfg', b: 'bcd', sectorOrder: 126, sortColumn0: 'bcd'}
        ]);

        CoreDefinitionStore.columnTagColumnsPairs.clear();
    });

    it('tests sortData with autoGrpColDef colTag defined', () => {
        const rowData: any[] = [
            {a: 'abc', b: 'bcd', c: 'gfg', sectorOrder: 126},
            {a: 'bcd', b: 'cde', c: 'jhg', sectorOrder: 127},
            {a: 'cde', b: 'def', c: 'ere', sectorOrder: 128},
            {a: 'kut', b: 'tbg', c: 'iyt', sectorOrder: 129}
        ];
        const params = {
            request: {
                sortModel: [
                    {colId: 'a', sort: SortType.DESC}
                ]
            }
        };
        qessds = new QbstrExploreServerSideDataSource({
                gridApi: {
                    getRowNode: () => {},
                    getColumn: () => ({
                        getColDef: jest.fn().mockReturnValue({field: 'a', colTag: 'a'}),
                        getColId: jest.fn().mockReturnValue(ColumnConstants.AUTO_GRP_COLUMN)
                    }),
                    getRowGroupColumns: () => [{
                        getColDef: jest.fn().mockReturnValue({}),
                        getColId: jest.fn().mockReturnValue(ROOT_LEVEL)
                    }],
                    getAllDisplayedColumns: () => [
                        {
                            getColDef: jest.fn().mockReturnValue({field: 'a'}),
                            getColId: jest.fn().mockReturnValue(ColumnConstants.AUTO_GRP_COLUMN)
                        },
                        {
                            getColDef: jest.fn().mockReturnValue({field: 'b', colTag: 'b'}),
                            getColId: jest.fn().mockReturnValue('b')
                        },
                        {
                            getColDef: jest.fn().mockReturnValue({field: 'c', colTag: 'c'}),
                            getColId: jest.fn().mockReturnValue('c')
                        }]
                },
                dataCube: cube
            }
        );
        expect(qessds.sortData(rowData, params as any)).toEqual([
            {a: 'kut', b: 'tbg', c: 'iyt', sectorOrder: 129},
            {a: 'cde', b: 'def', c: 'ere', sectorOrder: 128},
            {a: 'bcd', b: 'cde', c: 'jhg', sectorOrder: 127},
            {a: 'abc', b: 'bcd', c: 'gfg', sectorOrder: 126}
        ]);
        params['request']['sortModel'][0][ColumnConstants.SORT_MODEL_KEY] = SortType.ASC;
        expect(qessds.sortData(rowData, params as any)).toEqual([
            {a: 'abc', b: 'bcd', c: 'gfg', sectorOrder: 126},
            {a: 'bcd', b: 'cde', c: 'jhg', sectorOrder: 127},
            {a: 'cde', b: 'def', c: 'ere', sectorOrder: 128},
            {a: 'kut', b: 'tbg', c: 'iyt', sectorOrder: 129}
        ]);
    });

    it('test sortData when autoColumn is undefined', () => {
        const rowData: any[] = [
            {a: 'abc', b: 'bcd', c: 'gfg', sectorOrder: 126},
            {a: 'bcd', b: 'cde', c: 'jhg', sectorOrder: 127},
            {a: 'cde', b: 'def', c: 'ere', sectorOrder: 128},
            {a: 'kut', b: 'tbg', c: 'iyt', sectorOrder: 129}
        ];
        const params = {
            request: {
                sortModel: [
                    {colId: 'a', sort: SortType.DESC}
                ]
            }
        };
        qessds = new QbstrExploreServerSideDataSource({
                gridApi: {
                    getRowNode: () => {},
                    getColumn: () => undefined,
                    getRowGroupColumns: () => [{
                        getColDef: jest.fn().mockReturnValue({}),
                        getColId: jest.fn().mockReturnValue('b')
                    }],
                    getAllDisplayedColumns: () => [
                        {
                            getColDef: jest.fn().mockReturnValue({field: 'a'}),
                            getColId: jest.fn().mockReturnValue(ColumnConstants.AUTO_GRP_COLUMN)
                        },
                        {
                            getColDef: jest.fn().mockReturnValue({field: 'b', colTag: 'b'}),
                            getColId: jest.fn().mockReturnValue('b')
                        },
                        {
                            getColDef: jest.fn().mockReturnValue({field: 'c', colTag: 'c'}),
                            getColId: jest.fn().mockReturnValue('c')
                        }]
                },
                dataCube: cube
            }
        );
        expect(qessds.sortData(rowData, params as any)).toEqual([
            {a: 'kut', b: 'tbg', c: 'iyt', sectorOrder: 129},
            {a: 'cde', b: 'def', c: 'ere', sectorOrder: 128},
            {a: 'bcd', b: 'cde', c: 'jhg', sectorOrder: 127},
            {a: 'abc', b: 'bcd', c: 'gfg', sectorOrder: 126}
        ]);
    });
});

describe('Test QbstrExploreServerSideDataSource Filter Tests', () => {
    let cube;
    let qessds;

    beforeEach(() => {
        cube = new ReactiveCube(data);
        qessds = new QbstrExploreServerSideDataSource({gridApi: {getRowNode: () => {}}, dataCube: cube});
    });

    it('should test filter with no filter model', (done) => {
        const ck = new QueryKey([new FilterIncludeKey('level-1', ['Financial'])]);
        cube.stream().compute(ck).toList().subscribe(queryData => {
            expect(queryData.length).toEqual(2);
            const filterResult = qessds.filterData(queryData, genParams({}) as any, ck);
            expect(filterResult.length).toEqual(2);
            expect(filterResult).toEqual([finBank, finIns]);
            done();
        });
    });

    it('should test filter of regular leaf nodes', (done) => {
        const ck = new QueryKey([new FilterIncludeKey('level-1', ['Financial'])]);
        cube.stream().compute(ck).toList().subscribe(queryData => {
            expect(queryData.length).toEqual(2);
            const filterResult = qessds.filterData(queryData, genParams({cusip}) as any, ck);
            expect(filterResult.length).toEqual(1);
            expect(filterResult).toEqual([finBank]);
            done();
        });
    });

    it('should test filter of regular leaf nodes missing ', (done) => {
        const ck = new QueryKey([new FilterIncludeKey('level-1', ['Financial'])]);
        cube.stream().compute(ck).toList().subscribe(queryData => {
            expect(queryData.length).toEqual(2);
            const filterResult = qessds.filterData(queryData, genParams({
                cusip: {
                    filterType: 'text',
                    type: 'contains',
                    filter: 'cusip_2'
                }
            }) as any, ck);
            expect(filterResult.length).toEqual(0);
            expect(filterResult).toEqual([]);
            done();
        });
    });

    it('should test filter of top level group node', (done) => {
        const ck = new QueryKey([new GroupByKey(ROOT_LEVEL), new AggregationKey('market_value', 'sum')]);
        cube.stream().compute(ck).toList().subscribe(queryData => {
            expect(queryData.length).toEqual(1);
            const filterResult = qessds.filterData(queryData, genParams({cusip}) as any, ck);
            expect(filterResult.length).toEqual(1);
            expect(filterResult).toEqual([{[ROOT_LEVEL]: 'PEP', 'market_value': 5}]);
            done();
        });
    });

    it('should test filter of top level group node missing', (done) => {
        const ck = new QueryKey([new GroupByKey(ROOT_LEVEL), new AggregationKey('market_value', 'sum')]);
        cube.stream().compute(ck).toList().subscribe(queryData => {
            expect(queryData.length).toEqual(1);
            const filterResult = qessds.filterData(queryData, genParams({
                cusip: {
                    filter: 'cusip_10',
                    filterType: 'text',
                    type: 'contains'
                }
            }) as any, ck);
            expect(filterResult.length).toEqual(0);
            expect(filterResult).toEqual([]);
            done();
        });
    });

    it('should test filter of top level group node with market value present but not filtering', (done) => {
        const ck = new QueryKey([new GroupByKey(ROOT_LEVEL), new AggregationKey('market_value', 'sum')]);
        cube.stream().compute(ck).toList().subscribe(queryData => {
            expect(queryData.length).toEqual(1);
            const filterResult = qessds.filterData(queryData, genParams({
                cusip, market_value: {
                    filterType: 'number',
                    type: 'greaterThan',
                    filter: 5
                }
            }) as any, ck);
            expect(filterResult.length).toEqual(0);
            expect(filterResult).toEqual([]);
            done();
        });
    });

});

describe('QbstrExploreServerSideDataSource getRows', () => {
    let qessds;
    let cube;
    let params;

    beforeEach(() => {
        cube = new ReactiveCube(data);
        qessds = new QbstrExploreServerSideDataSource({gridApi: {getRowNode: () => {}}, dataCube: cube});
        params = genParams({});
        params.success = jest.fn();
        params.api = {
            getColumnDef: () => {
                return {
                    colId: 'ag-Grid-AutoColumn',
                    field: 'portfolio',
                    filter: 'awTextFilter',
                    type: 'auxTextColumn',
                    headerName: 'Portfolio'
                };
            },
            getRowNode: (number) => {
                return {
                    key: 'Compare', level: 0, group: true,
                    data: {
                        'nav_group_0|CORE-HQ': 266777722.6530738,
                        'nav_group_0|PEP': 161258700.52465194,
                        'pct_nav_group_1|CORE-HQ': 1,
                        'pct_nav_group_1|PEP': 1,
                        'portfolio': 'CORE-HQ',
                        'portfolio_name': null,
                        'rowId': 1,
                        'sectorOrder': undefined,
                        '_ROOT_': 'Compare'
                    }
                };
            }
        };
    });

    it('should getRows #1', () => {
        qessds.getRows(params);
        setTimeout(() => expect(params.success).toHaveBeenCalled(), 500);
    });

    it('should getRows #2', () => {
        params.request.groupKeys = ['PEP', 'Industry', 'Automobile'];
        qessds.getRows(params);
        setTimeout(() => expect(params.success).toHaveBeenCalled(), 500);
    });

    it('should getRows when suppressRootNode is true', () => {
        params.request.groupKeys = ['PEP', 'Industry', 'Automobile'];
        qessds.suppressRootNode = true;
        qessds.getRows(params);
        setTimeout(() => expect(params.success).toHaveBeenCalled(), 500);
    });

    it('should getRows and keep node.group to true in compare mode first level', () => {
        const rowData = [{
            'rowId': 1,
            'portfolio_name': null,
            'portfolio': 'CORE-HQ',
            'nav_group_0|PEP': 161258700.52465194,
            'nav_group_0|CORE-HQ': 266777722.6530738,
            'pct_nav_group_1|PEP': 1,
            'pct_nav_group_1|CORE-HQ': 1,
            '_ROOT_': 'Compare'
        }];
        params.request.valueCols = [
            {'id': 'nav_group_0|PEP', 'aggFunc': 'sum', 'displayName': 'PEP', 'field': 'nav_group_0|PEP'},
            {'id': 'nav_group_0|CORE-HQ', 'aggFunc': 'sum', 'displayName': 'CORE-HQ', 'field': 'nav_group_0|CORE-HQ'},
            {'id': 'pct_nav_group_1|PEP', 'aggFunc': 'sum', 'displayName': 'PEP', 'field': 'pct_nav_group_1|PEP'},
            {
                'id': 'pct_nav_group_1|CORE-HQ',
                'aggFunc': 'sum',
                'displayName': 'CORE-HQ',
                'field': 'pct_nav_group_1|CORE-HQ'
            }
        ];
        jest.spyOn(qessds.qssp.dataCube, 'get').mockReturnValue(of(rowData));
        jest.spyOn(qessds, 'shouldExpand').mockReturnValue(true);

        qessds.getRows(params);

        expect(params.success).toHaveBeenCalled();
        expect(params.api.getRowNode(1).group).toBeTruthy();
    });

    it('should call onGetRowsCallback with loaded row IDs', () => {
        const mockCallback = jest.fn();
        const mockData = [
            { rowId: 1, market_value: 1 },
            { rowId: 2, market_value: 2 }
        ];
        const mockParams = genParams({});
        mockParams.api = {
            getRowNode: (id) => ({ data: mockData.find(row => row.rowId === id) })
        };

        qessds = new QbstrExploreServerSideDataSource({
            gridApi: mockParams.api,
            dataCube: new ReactiveCube(mockData),
            onGetRowsCallback: mockCallback
        });

        qessds.getRows(mockParams);

        setTimeout(() => expect(mockCallback).toHaveBeenCalledWith(['1', '2']), 500);
    });
});

describe('QbstrExploreServerSideDataSource should expand', () => {
    let qessds;
    let cube;
    let api;

    beforeEach(() => {
        api = {
            getRowNode: () => {},
            getRowGroupColumns: () => [
                {
                    getColDef: () => ({
                        field: ROOT_LEVEL
                    })
                }
            ]
        };
        cube = new ReactiveCube(data);
        const expandedState = new ExpandedState();
        expandedState.updateItem([ExpandedState.ROOT_NODE_KEY], true);
        qessds = new QbstrExploreServerSideDataSource({
            gridApi: api,
            dataCube: cube,
            expandedState
        });
    });

    it('should expand node', () => {
        const node = {
            data: indAuto,
            isExpandable: (() => true)
        };
        expect(qessds.shouldExpand(node)).toBeTruthy();
    });

    it('shouldnt expand node', () => {
        const node = {
            data: {test: 'fail'},
            isExpandable: (() => true)
        };
        expect(qessds.shouldExpand(node)).toBeFalsy();
    });

    it('test onNodeExpanded', () => {
        jest.spyOn(qessds, 'getNodeKey').mockReturnValue([ExpandedState.ROOT_NODE_KEY, 'NODE1']);
        jest.spyOn(qessds, 'updateAllExpandedNodes').mockImplementation();

        // Ensure that the node expands in the ExpandedState object.
        const node = {
            data: [],
            expanded: true,
            isExpandable: (() => true)
        };
        qessds.onNodeExpanded(node);
        expect(qessds.qssp.expandedState.expandedPaths).toStrictEqual([[ExpandedState.ROOT_NODE_KEY], [ExpandedState.ROOT_NODE_KEY, 'NODE1']]);

        // Ensure that the node gets removed from the ExpandedState object.
        node.expanded = false;
        qessds.onNodeExpanded(node);
        expect(qessds.qssp.expandedState.expandedPaths).toStrictEqual([[ExpandedState.ROOT_NODE_KEY]]);

        // Now set it to be all expanded and collapse a node.
        // Validating that the ExpandedState is correct after as all nodes should be cleared from being expanded.
        qessds.qssp.expandedState.allExpanded = true;
        qessds.onNodeExpanded(node);
        expect(qessds.qssp.expandedState.allExpanded).toBeFalsy();
        expect(qessds.qssp.expandedState.expandedPaths.length).toBe(0);
        expect(qessds.updateAllExpandedNodes).toHaveBeenCalled();
    });

    it('should check size of data', () => {
        qessds = new QbstrExploreServerSideDataSource({gridApi: {getRowNode: () => {}}, dataCube: cube});
        const numberOfItems = qessds.getLastRowIndex({startRow: 0, endRow: 100}, [1]);
        expect(numberOfItems).toEqual(1);
    });

    it('should check size of data with larger data set not in range', () => {
        qessds = new QbstrExploreServerSideDataSource({gridApi: {getRowNode: () => {}}, dataCube: cube});
        const resultArray = [];
        for (let i = 0; i < 101; i++) {
            resultArray.push(i);
        }
        const numberOfItems = qessds.getLastRowIndex({startRow: 0, endRow: 100}, resultArray);
        expect(numberOfItems).toEqual(undefined);
    });

    it('should check size of data with large data in range', () => {
        qessds = new QbstrExploreServerSideDataSource({gridApi: {getRowNode: () => {}}, dataCube: cube});
        const resultArray = [];
        for (let i = 0; i < 99; i++) {
            resultArray.push(i);
        }
        const numberOfItems = qessds.getLastRowIndex({startRow: 100, endRow: 200}, resultArray);
        expect(numberOfItems).toEqual(199);
    });

    it('tests getMappedFieldForAutoGrpCol', () => {
        let filterModel = {'ag-Grid-AutoColumn': {}};
        const colApi = {
            'getColumn': () => ({getColDef: jest.fn().mockReturnValue({field: 'bcd'})})
        } as any;
        qessds = new QbstrExploreServerSideDataSource({gridApi: {getRowNode: () => {}}, dataCube: cube});

        qessds.getMappedFieldForAutoGrpCol(colApi, filterModel);
        expect(filterModel).toEqual({'bcd': {}});

        filterModel = {'abc': {}};
        qessds.getMappedFieldForAutoGrpCol(colApi, filterModel);
        expect(filterModel).toEqual({'abc': {}});
    });
});

describe('QbstrExploreServerSideDataSource formatValues', () => {
    let qessds;
    let params: IServerSideGetRowsParams;
    let getColDef;
    let valueFormatter;

    beforeEach(() => {
        qessds = new QbstrExploreServerSideDataSource({gridApi: {getRowNode: () => {}}, dataCube: undefined});
        getColDef = jest.fn();
        valueFormatter = jest.fn();
        params = {
            api: {
                getAllGridColumns: () => [{
                    getColDef
                }]
            }
        } as any;
    });

    it('Test shouldReformat', () => {
        qessds['qssp'].shouldReformat = false;
        qessds.formatValues([{cusip: 'cusip_1'}], params);
        expect(getColDef).not.toHaveBeenCalled();
        getColDef.mockReturnValueOnce({field: 'market_value'} as any);
        qessds['qssp'].shouldReformat = true;
        qessds.formatValues([{cusip: 'cusip_1'}], params);
        expect(getColDef).toHaveBeenCalled();
        expect(qessds['qssp'].shouldReformat).toBeFalsy();
    });
    it('Test date column format', () => {
        getColDef.mockReturnValue({field: 'date', type: 'auxDateColumn', valueFormatter} as any);
        qessds['qssp'].shouldReformat = true;
        const formattedData = qessds.formatValues([{date: '13-March-2019'}, {date: undefined}], params);
        expect(formattedData[0].date).toEqual(new Date('13-March-2019'));
        expect(formattedData[1].date).toBeUndefined();
    });
    it('Test number column format', () => {
        valueFormatter.mockReturnValueOnce('2.1%');
        valueFormatter.mockReturnValueOnce('1.1%');
        valueFormatter.mockReturnValueOnce('ss');
        getColDef.mockReturnValue({field: 'number', type: 'auxNumberColumn', valueFormatter} as any);
        qessds['qssp'].shouldReformat = true;
        const formattedData = qessds.formatValues([{number: 2.12}, {number: 1.11}, {number: undefined}], params);
        expect(formattedData[0].number).toEqual(2.1);
        expect(formattedData[1].number).toEqual(1.1);
        expect(formattedData[2].number).toBeUndefined();
    });
    it('Test string column format', () => {
        valueFormatter.mockReturnValueOnce('AAA');
        valueFormatter.mockReturnValueOnce('BBB');
        getColDef.mockReturnValue({field: 'string', type: 'auxTextColumn', valueFormatter} as any);
        qessds['qssp'].shouldReformat = true;
        const formattedData = qessds.formatValues([{string: 'aaa'}, {string: 'bbb'}], params);
        expect(formattedData[0].string).toEqual('AAA');
        expect(formattedData[1].string).toEqual('BBB');
    });

    it('test setActionColData', () => {
        const node = {
            data: {},
            setData: (rowData: any) => {
                this.data = rowData;
            },
        } as unknown as RowNode ;
        qessds['qssp'].actionCol = (_params: any) => ({});
        qessds.setActionColData(undefined, node);

        expect(node.data[ColumnConstants.ACTION_COL]).not.toBeUndefined();
        expect(node.data[ColumnConstants.ACTION_COL]).toStrictEqual({});
    });
});
