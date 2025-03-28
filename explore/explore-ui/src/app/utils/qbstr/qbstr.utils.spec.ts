import {ColumnConstants, ColumnDefinition, CoreDefinitionStore, ResponseData} from '@blk/explore-ui-core';
import {findTreeDataDepth, getSortedData, getSortKeyForAutoGrpCol, makeDateAndTimeSpanCompatibleStream, ROOT_LEVEL} from './qbstr.utils';
import {SortType} from '@qbstr/data-cube';
import {TabularWidgetConstants} from '@constants/tabular-widget.constants';
import {ColDef} from 'ag-grid-community';

describe('qbstr utils test', () => {

    it('findTreeDataDepth tests', () => {
        // Create a sample tree with only the root node.
        const tree: ResponseData = {
            data: []
        };

        // Validate that it only has 0 levels.
        expect(findTreeDataDepth(tree, -1)).toBe(-1);

        // Now add a child sector node with no children.
        tree.children = [
            {
                title: 'CASH',
                data: []
            }
        ];
        expect(findTreeDataDepth(tree, -1)).toBe(1);

        // Now add a child to this sector node that is not a sector.
        tree.children[0].children = [
            {
                data: []
            }
        ];
        expect(findTreeDataDepth(tree, -1)).toBe(1);

        // Tree depth with multiple children with different depths
        tree.children = [
            {
                title: 'CASH',
                data: [],
                children: [{
                    title: 'CASH',
                    data: [],
                    children: [{
                        title: 'CASH',
                        data: [],
                        children: [{
                            title: 'CASH',
                            data: []
                        }]
                    }]
                }, {
                    title: 'CASH',
                    data: [],
                    children: [{
                        title: 'CASH',
                        data: []
                    }]
                }]
            },
            {
                title: 'CASH',
                data: [],
                children: [{
                    title: 'CASH',
                    data: [],
                    children: [{
                        title: 'CASH',
                        data: []
                    }]
                }]
            },
            {
                title: 'CASH',
                data: []
            }
        ];
        expect(findTreeDataDepth(tree, -1)).toBe(4);

        // Max call stack limit exceeded test
        tree.children = [];
        for (let i = 0; i <= 800000; i++) {
            tree.children.push({data: [i.toString()]});
        }
        expect(findTreeDataDepth(tree, -1)).toBe(0);
    });

    it('tests getSortKeyForAutoGrpCol', () => {
        const sortModel = [{colId: 'a', sort: SortType.DESC}];

        // scenario 1 ->  first model is NOT __ROOT__ (Other than auto group column has been clicked upon)
        expect(getSortKeyForAutoGrpCol({colTag: 'b'} as any, [ROOT_LEVEL], sortModel).length).toBe(0);

        // scenario 2 -> first model is __ROOT__ (Auto group column has been clicked upon)
        sortModel[0].colId = ROOT_LEVEL;
        expect(getSortKeyForAutoGrpCol({colTag: 'b'} as any, [ROOT_LEVEL], sortModel)[0]).toEqual({
            colId: ColumnConstants.SECTOR_ORDER_KEY,
            sort: SortType.DESC,
            origColId: ROOT_LEVEL
        });

        // negative -> autoColDef null
        expect(getSortKeyForAutoGrpCol(null, ['b'], sortModel).length).toBe(0);
    });

    it('tests getSortedData', () => {
        let sortModel = [
            {colId: 'b', sort: SortType.DESC, origColId: 'b'},
            {colId: 'a', sort: SortType.ASC, origColId: 'a'}
        ];
        const data = [
            {a: 'abc', b: 'fcd', sectorOrder: undefined},
            {a: 'bbc', b: 'jcd', sectorOrder: undefined},
            {a: 'abc', b: 'kcd', sectorOrder: undefined},
            {a: 'bbc', b: 'gcd', sectorOrder: undefined},
            {a: 'abc', b: 'rcd', sectorOrder: undefined},
            {a: 'bbc', b: 'xde', sectorOrder: undefined}
        ];

        // data: undefined
        expect(getSortedData(undefined, {colTag: 'c'} as any, ['c'], sortModel)).toEqual([]);

        // sectorOrder: undefined - picks descending b & then ascending a order
        expect(getSortedData(data, {colTag: 'c'} as any, ['c'], sortModel)).toStrictEqual([
            {a: 'bbc', b: 'xde', sectorOrder: undefined},
            {a: 'abc', b: 'rcd', sectorOrder: undefined},
            {a: 'abc', b: 'kcd', sectorOrder: undefined},
            {a: 'bbc', b: 'jcd', sectorOrder: undefined},
            {a: 'bbc', b: 'gcd', sectorOrder: undefined},
            {a: 'abc', b: 'fcd', sectorOrder: undefined}
        ]);

        // sectorOrder: undefined - picks ascending a & then descending b order
        sortModel = [
            {colId: 'a', sort: SortType.ASC, origColId: 'a'},
            {colId: 'b', sort: SortType.DESC, origColId: 'b'}
        ];
        expect(getSortedData(data, {colTag: 'c'} as any, ['c'], sortModel)).toEqual([
            {a: 'abc', b: 'rcd', sectorOrder: undefined},
            {a: 'abc', b: 'kcd', sectorOrder: undefined},
            {a: 'abc', b: 'fcd', sectorOrder: undefined},
            {a: 'bbc', b: 'xde', sectorOrder: undefined},
            {a: 'bbc', b: 'jcd', sectorOrder: undefined},
            {a: 'bbc', b: 'gcd', sectorOrder: undefined}
        ]);

        // auto + non-auto (primary + secondary sort) - picks ascending a & then descending b order
        data[2][ColumnConstants.SECTOR_ORDER_KEY] = 128;
        data[4][ColumnConstants.SECTOR_ORDER_KEY] = 130;
        data[0][ColumnConstants.SECTOR_ORDER_KEY] = 126;
        sortModel = [
            {colId: 'b', sort: SortType.ASC, origColId: ROOT_LEVEL, colTag: 'b'},
            {colId: 'a', sort: SortType.DESC, origColId: 'a', colTag: 'a'}
        ];
        CoreDefinitionStore.columnTagColumnsPairs.set('b', [new ColumnDefinition({columnTag: 'b', colId: ROOT_LEVEL, title: '', dataType: ColumnConstants.COLUMN_DATA_TYPE.STRING})]);
        expect(getSortedData(data, {colTag: 'b'} as any, [ROOT_LEVEL], sortModel)).toEqual([
            {a: 'abc', b: 'fcd', sectorOrder: 126, sortColumn0: 'fcd'},
            {a: 'bbc', b: 'gcd', sortColumn0: 'gcd'},
            {a: 'bbc', b: 'jcd', sortColumn0: 'jcd'},
            {a: 'abc', b: 'kcd', sectorOrder: 128, sortColumn0: 'kcd'},
            {a: 'abc', b: 'rcd', sectorOrder: 130, sortColumn0: 'rcd'},
            {a: 'bbc', b: 'xde', sortColumn0: 'xde'}
        ]);
        CoreDefinitionStore.columnTagColumnsPairs.clear();

        // sectorOrder: defined - picks ascending order
        data[3][ColumnConstants.SECTOR_ORDER_KEY] = 129;
        data[5][ColumnConstants.SECTOR_ORDER_KEY] = 131;
        data[1][ColumnConstants.SECTOR_ORDER_KEY] = 127;
        sortModel = [
            {colId: ROOT_LEVEL, sort: SortType.ASC, origColId: 'a'}
        ];
        expect(getSortedData(data, {colTag: 'a'} as any, [ROOT_LEVEL], sortModel)).toEqual(data);

        // sectorOrder: defined - picks descending order
        sortModel[0].sort = SortType.DESC;
        expect(getSortedData(data, {colTag: 'a'} as any, [ROOT_LEVEL], sortModel)).toEqual(data.reverse());
    });

    it('tests makeDateAndTimeSpanCompatibleStream', () => {
        // time span column scenario
        CoreDefinitionStore.columnTagColumnsPairs.set('abc', [new ColumnDefinition({columnTag: 'abc', title: '', dataType: ColumnConstants.COLUMN_DATA_TYPE.TIME_SPAN})]);
        const autoGrpColDef = {colTag: 'anotherCol', colId: 'ag-Grid-AutoColumn'} as unknown as ColDef & {colTag: string};
        let result = makeDateAndTimeSpanCompatibleStream([{abc: '123,21-AUG-2018'}, {abc: ''}, {abc: null}], [{colId: 'abc', colTag: 'abc', sort: SortType.ASC}], autoGrpColDef);
        expect(result.stream.toList()).toEqual([
            {abc: '123,21-AUG-2018', sortColumn0: 123},
            {abc: '', sortColumn0: TabularWidgetConstants.COLUMN_SORT_NULL_VAL_REPLACEMENT},
            {abc: null, sortColumn0: TabularWidgetConstants.COLUMN_SORT_NULL_VAL_REPLACEMENT}
        ]);
        expect(result.transformedCols[0].colId).toBe('sortColumn0');

        // date column scenario
        CoreDefinitionStore.columnTagColumnsPairs.get('abc')[0].dataType = ColumnConstants.COLUMN_DATA_TYPE.DATE;
        result = makeDateAndTimeSpanCompatibleStream([{abc: '21-AUG-2018'}, {abc: ''}, {abc: null}], [{colId: 'abc', colTag: 'abc', sort: SortType.ASC}], autoGrpColDef);
        jest.spyOn(Date, 'parse').mockImplementation(dateStr => dateStr ? 126 : TabularWidgetConstants.COLUMN_SORT_NULL_VAL_REPLACEMENT);
        expect(result.stream.toList()).toEqual([
            {abc: '21-AUG-2018', sortColumn0: 126},
            {abc: '', sortColumn0: TabularWidgetConstants.COLUMN_SORT_NULL_VAL_REPLACEMENT},
            {abc: null, sortColumn0: TabularWidgetConstants.COLUMN_SORT_NULL_VAL_REPLACEMENT}
        ]);
        expect(result.transformedCols[0].colId).toBe('sortColumn0');

        // string/rating column scenario
        CoreDefinitionStore.columnTagColumnsPairs.get('abc')[0].dataType = ColumnConstants.COLUMN_DATA_TYPE.STRING;
        result = makeDateAndTimeSpanCompatibleStream([{abc: 'bb'}, {abc: 'aaa'}, {abc: ''}, {abc: null}, {abc: 'aaa-'}, {abc: 'aaa+'}, {abc: undefined}], [{colId: 'abc', colTag: 'abc', sort: SortType.ASC}], autoGrpColDef);
        expect(result.stream.toList()).toEqual([
            {abc: 'bb', sortColumn0: 'bb'},
            {abc: 'aaa', sortColumn0: 'aaa'},
            {abc: '', sortColumn0: ''},
            {abc: null, sortColumn0: ''},
            {abc: 'aaa-', sortColumn0: 'aaa-'},
            {abc: 'aaa+', sortColumn0: 'aaa+'},
            {abc: undefined, sortColumn0: ''}
        ]);
        expect(result.transformedCols[0].colId).toBe('sortColumn0');

        // number column scenario
        CoreDefinitionStore.columnTagColumnsPairs.get('abc')[0].dataType = ColumnConstants.COLUMN_DATA_TYPE.DOUBLE;
        result = makeDateAndTimeSpanCompatibleStream([{abc: 0.1}, {abc: 13}, {abc: -5.346544}, {abc: null}, {abc: NaN}, {abc: -0.0003453453400036745345}, {abc: undefined}], [{colId: 'abc', colTag: 'abc', sort: SortType.ASC}], autoGrpColDef);
        expect(result.stream.toList()).toEqual([
            {abc: 0.1, sortColumn0: 0.1},
            {abc: 13, sortColumn0: 13},
            {abc: -5.346544, sortColumn0: -5.346544},
            {abc: null, sortColumn0: Number.NEGATIVE_INFINITY},
            {abc: NaN, sortColumn0: Number.NEGATIVE_INFINITY},
            {abc: -0.0003453453400036745345, sortColumn0: -0.0003453453400036745345},
            {abc: undefined, sortColumn0: Number.NEGATIVE_INFINITY}
        ]);
        expect(result.transformedCols[0].colId).toBe('sortColumn0');

        // default scenario - no colDef found
        CoreDefinitionStore.columnTagColumnsPairs.clear();
        jest.spyOn(console, 'warn');
        result = makeDateAndTimeSpanCompatibleStream([{abc: 'ABC'}, {abc: ''}, {abc: null}], [{colId: 'abc', colTag: 'abc', sort: SortType.ASC}], autoGrpColDef);
        expect(result.stream.toList()).toEqual([
            {abc: 'ABC'},
            {abc: ''},
            {abc: null}
        ]);
        expect(result.transformedCols.length).toBe(0);
        expect(console.warn).toHaveBeenCalled();
    });

    describe('getSortedData - sortByCustomCalc Test', () => {
        const ascSortModel = [{colId: 'custom_calc_1607997215297', sort: SortType.ASC.toLowerCase(), origColId: 'custom_calc_1607997215297', colTag: 'custom_calc'}];
        const descSortModel = [{colId: 'custom_calc_1607997215297', sort: SortType.DESC.toLowerCase(), origColId: 'custom_calc_1607997215297', colTag: 'custom_calc'}];

        it('sortByCustomCalc test case', () => {
            const data = [
                {custom_calc_1607997215297: 0.02811920455721663, rowId: 2, title: 'CASH', _ROOT_: 'PEP'},
                {custom_calc_1607997215297: 0.9677658138893122, rowId: 46, title: 'EQUITY', _ROOT_: 'PEP'},
                {custom_calc_1607997215297: 0.004114981553471011, rowId: 114, title: 'FUND', _ROOT_: 'PEP'},
                {custom_calc_1607997215297: 0, rowId: 116, title: 'FUTURE', _ROOT_: 'PEP'}
            ];

            const data2 = [
                {custom_calc_1607997215297: '31-DEC-1969', rowId: 2, title: 'CASH', _ROOT_: 'PEP'},
                {custom_calc_1607997215297: '28-NOV-2019', rowId: 46, title: 'EQUITY', _ROOT_: 'PEP'},
            ];

            const expectedAscData = [
                {custom_calc_1607997215297: 0, rowId: 116, title: 'FUTURE', _ROOT_: 'PEP'},
                {custom_calc_1607997215297: 0.004114981553471011, rowId: 114, title: 'FUND', _ROOT_: 'PEP'},
                {custom_calc_1607997215297: 0.02811920455721663, rowId: 2, title: 'CASH', _ROOT_: 'PEP'},
                {custom_calc_1607997215297: 0.9677658138893122, rowId: 46, title: 'EQUITY', _ROOT_: 'PEP'}
            ];
            const expectedDescData = [
                {custom_calc_1607997215297: 0.9677658138893122, rowId: 46, title: 'EQUITY', _ROOT_: 'PEP'},
                {custom_calc_1607997215297: 0.02811920455721663, rowId: 2, title: 'CASH', _ROOT_: 'PEP'},
                {custom_calc_1607997215297: 0.004114981553471011, rowId: 114, title: 'FUND', _ROOT_: 'PEP'},
                {custom_calc_1607997215297: 0, rowId: 116, title: 'FUTURE', _ROOT_: 'PEP'}
            ];

            expect(getSortedData(data, {colTag: 'custom_calc_1607997215297'} as any, [ROOT_LEVEL], ascSortModel)).toStrictEqual(expectedAscData);
            expect(getSortedData(data, {colTag: 'custom_calc_1607997215297'} as any, [ROOT_LEVEL], descSortModel)).toStrictEqual(expectedDescData);
            expect(getSortedData(data2, {colTag: 'custom_calc_1607997215297'} as any, [ROOT_LEVEL], descSortModel)).toStrictEqual([
                {
                    '_ROOT_': 'PEP',
                    'custom_calc_1607997215297': '31-DEC-1969',
                    'rowId': 2,
                    'title': 'CASH'
                },
                {
                    '_ROOT_': 'PEP',
                    'custom_calc_1607997215297': '28-NOV-2019',
                    'rowId': 46,
                    'title': 'EQUITY'
                }
            ]);
        });

        it('should not sort group rows when dataType is auxDateColumn - BUG 873440', () => {
            const data = [
                {custom_calc_1607997215297: null, rowId: 2, title: 'Treasuries', _ROOT_: 'CORE-HQ'},
                {custom_calc_1607997215297: null, rowId: 46, title: 'Government Related', _ROOT_: 'CORE-HQ'},
            ];

            expect(getSortedData(data, {colTag: 'custom_calc_1607997215297'} as any, [ROOT_LEVEL], ascSortModel)).toStrictEqual(data);
            expect(getSortedData(data, {colTag: 'custom_calc_1607997215297'} as any, [ROOT_LEVEL], descSortModel)).toStrictEqual(data);
        });
    });
});
