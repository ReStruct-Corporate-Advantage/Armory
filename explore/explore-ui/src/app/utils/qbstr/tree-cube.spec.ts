import {data1, data5} from '@mocks/test-data/qbstr-test-data';
import {TreeCube} from '@utils/qbstr/tree-cube';
import {VizualizationColumnConfig} from '@interfaces/request.interface';
import {QueryKey, FilterIncludeKey} from '@qbstr/data-cube';
import {ColumnConstants, NumericColumnFormat} from '@blk/explore-ui-core';
import {ROOT_LEVEL} from '@utils/qbstr/qbstr.utils';
import {NumericColumnFormatColumnOption, NumericDataFormatter} from '@blk/explore-ui-column-option';
import {TestScheduler} from 'rxjs/testing';

describe('TreeCube tests', () => {

    let cube: TreeCube;

    const colFormat = new NumericColumnFormatColumnOption();
    colFormat.scaling = 0.001;

    const cols: VizualizationColumnConfig[] = [
        {
            originalColumnTitle: 'Market Value %',
            columnTag: 'pct_mv',
            columnKey: 'pct_mv_1',
            columnTitle: 'Market Value %',
            dataType: 'Double',
            isHidden: false,
            isSubtotalable: true,
            formatter: new NumericDataFormatter(new NumericColumnFormat(), [colFormat])
        }
    ];

    /**
     * Before each test create the tree cube used for the validation.
     */
    beforeEach(() => {
        cube = new TreeCube('PEP', cols, JSON.parse(JSON.stringify(data1.data)));
    });

    it('Get the root node', (done: any) => {
        const key = new QueryKey([]);
        const rows$ = cube.get(key);
        rows$.subscribe((rows) => {
            expect(rows.length).toBe(1);
            expect(rows[0][ColumnConstants.AGGRID_AUTO_COLUMN]).toBe('PEP');
            done();
        });
    });

    it('Get the first level sector nodes', (done: any) => {
        const key = new QueryKey([new FilterIncludeKey(ROOT_LEVEL, ['PEP'])]);
        const rows$ = cube.get(key);
        rows$.subscribe((rows) => {
            expect(rows.length).toBe(39);
            expect(rows[0]['level-1']).toBe(2);
            expect(rows[0].hasChildNodes).toBe(true);
            expect(rows[0][ColumnConstants.AGGRID_AUTO_COLUMN]).toBe('Airlines');
            done();
        });
    });

    it('Get the second level sector nodes', (done: any) => {
        const key = new QueryKey([
            new FilterIncludeKey(ROOT_LEVEL, ['PEP']),
            new FilterIncludeKey(TreeCube.LEVEL_KEY + 1, [2])
        ]);
        const rows$ = cube.get(key);
        rows$.subscribe((rows) => {
            expect(rows.length).toBe(1);
            expect(rows[0]['level-1']).toBe(2);
            expect(rows[0]['level-2']).toBe(3);
            expect(rows[0].hasChildNodes).toBe(true);
            expect(rows[0][ColumnConstants.AGGRID_AUTO_COLUMN]).toBe('Industrials');
            done();
        });
    });

    it('should delete all the data', () => {
        const key = new QueryKey([
            new FilterIncludeKey(ROOT_LEVEL, ['PEP'])
        ]);

        cube.delete(key);

        const rows$ = cube.get(key);

        const expectedList = [null, null, null, null];

        rows$.subscribe((rows) => {
            for (const row of rows) {
                expect(row.data).toEqual(expectedList);
            }
        });

    });

    it('should not have any issues with same sector title', () => {
        const testScheduler = new TestScheduler((a, e) => expect(a).toEqual(e));

        const cubeWithDuplicatedSectorName = new TreeCube('PEP', cols, data5.data);

        const key1 = new QueryKey([
            new FilterIncludeKey(ROOT_LEVEL, ['PEP'])
        ]);
        const rows1$ = cubeWithDuplicatedSectorName.get(key1);
        testScheduler.run(() => rows1$.subscribe((rows) => {
            expect(rows.length).toBe(2);
            expect(rows[0].rowId).toBe(2);
            expect(rows[0][ColumnConstants.AGGRID_AUTO_COLUMN]).toBe('Airlines');
            expect(rows[0]['level-1']).toBe(2);

            expect(rows[1].rowId).toBe(5);
            expect(rows[1][ColumnConstants.AGGRID_AUTO_COLUMN]).toBe('Airlines');
            expect(rows[1]['level-1']).toBe(5);
        }));

        const key2 = new QueryKey([
            new FilterIncludeKey(ROOT_LEVEL, ['PEP']),
            new FilterIncludeKey(TreeCube.LEVEL_KEY + 1, [2])
        ]);
        const rows2$ = cubeWithDuplicatedSectorName.get(key2);
        testScheduler.run(() => rows2$.subscribe((rows) => {
            expect(rows[0].rowId).toBe(3);
            expect(rows[0][ColumnConstants.AGGRID_AUTO_COLUMN]).toBe('Industrials');
            expect(rows[0]['level-1']).toBe(2);
            expect(rows[0]['level-2']).toBe(3);
        }));

        const key3 = new QueryKey([
            new FilterIncludeKey(ROOT_LEVEL, ['PEP']),
            new FilterIncludeKey(TreeCube.LEVEL_KEY + 1, [5])
        ]);
        const rows3$ = cubeWithDuplicatedSectorName.get(key3);
        testScheduler.run(() => rows3$.subscribe((rows) => {
            expect(rows[0].rowId).toBe(6);
            expect(rows[0][ColumnConstants.AGGRID_AUTO_COLUMN]).toBe('Consumer Discretionary');
            expect(rows[0]['level-1']).toBe(5);
            expect(rows[0]['level-2']).toBe(6);
        }));
    });

    it('Get the leaf nodes', () => {
        const rows = cube.getLeafNodes();
        expect(rows.length).toBe(98);
        expect(rows[0]['security_description_1']).toBe('QANTAS AIRWAYS LTD');
        expect(rows[0]['cusip_0']).toBe('S67103473');
        expect(rows[0]['pct_mv_1']).toBe(9.762143124744508);
    });

    describe('searchTree', () => {
        beforeEach(() => {
            const searchCols: VizualizationColumnConfig[] = [
                {
                    columnKey: 'security_description_1',
                    columnTitle: 'security_description_1',
                    originalColumnTitle: 'security_description_1',
                    formatter: {format: () => ''},
                    dataType: 'STRING',
                    columnTag: 'security_description_1',
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'cusip_0',
                    columnTitle: 'cusip_0',
                    originalColumnTitle: 'cusip_0',
                    formatter: undefined,
                    dataType: 'STRING',
                    columnTag: 'cusip_0',
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'pct_mv_1',
                    columnTitle: 'pct_mv_1',
                    originalColumnTitle: 'pct_mv_1',
                    formatter: {format: () => ''},
                    dataType: 'DOUBLE',
                    columnTag: 'pct_mv_1',
                    isHidden: false,
                    isSubtotalable: true
                },
                {
                    columnKey: 'sec_group_hidden',
                    columnTitle: 'Security Group',
                    originalColumnTitle: 'Security Group',
                    formatter: {format: () => ''},
                    dataType: 'STRING',
                    columnTag: 'sec_group',
                    isHidden: true,
                    isSubtotalable: false
                }
            ];
            cube = new TreeCube('PEP', searchCols, JSON.parse(JSON.stringify(data1.data)));
        });

        it('should search data for matches against search term and return the results', () => {
            const matches = cube.searchTree('china', null);
            expect(matches).toHaveLength(3);
            expect(matches[0].rowId).toEqual(11);
            expect(matches[0].columnKey).toEqual('security_description_1');
            expect(matches[0].path).toEqual([1, 8, 9]);
            expect(matches[0].isLeafNode).toEqual(true);

            expect(matches[1].rowId).toEqual(13);
            expect(matches[1].columnKey).toEqual('security_description_1');
            expect(matches[1].path).toEqual([1, 8, 9]);
            expect(matches[1].isLeafNode).toEqual(true);

            expect(matches[2].rowId).toEqual(46);
            expect(matches[2].columnKey).toEqual('security_description_1');
            expect(matches[2].path).toEqual([1, 44, 45]);
            expect(matches[2].isLeafNode).toEqual(true);
        });

        it('should search for matches against row groups', () => {
            const matches = cube.searchTree('automobiles', null);
            expect(matches).toHaveLength(1);
            expect(matches[0].rowId).toEqual(5);
            expect(matches[0].columnKey).toEqual('security_description_1');
            expect(matches[0].path).toEqual([1]);
            expect(matches[0].isLeafNode).toEqual(false);
        });

        it('should search for matches only in a specified column and ignore row groups if its not the first column', () => {
            let matches = cube.searchTree('china', 'cusip_0');
            expect(matches).toHaveLength(0);

            matches = cube.searchTree('cash', 'cusip_0');
            expect(matches).toHaveLength(9);
            expect(matches.every(match => match.columnKey === 'cusip_0')).toEqual(true);
        });

        it('should search for matches on both row groups and the first column when first column selected', () => {
            const matches = cube.searchTree('air', 'security_description_1');
            expect(matches).toHaveLength(2);
            expect(matches[0]).toStrictEqual({
                columnKey: 'security_description_1',
                isLeafNode: false,
                path: [1],
                rowId: 2
            });
            expect(matches[1]).toStrictEqual({
                columnKey: 'security_description_1',
                isLeafNode: true,
                path: [1, 2, 3],
                rowId: 4
            });
        });
    });
});
