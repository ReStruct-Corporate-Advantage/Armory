import {AbstractColumnOption, ColumnConfig, ColumnConstants, ColumnDefinition, CoreColumnUtils, CoreDefinitionStore, CoreTestUtils, UseType, WidgetConfigType} from '@blk/explore-ui-core';
import {ColumnOptionInitializer} from '../column-option.initializer';
import {ColumnFilter} from '../interfaces';
import {ActiveCalculationColumnOption} from '../models/column-option/active-calculation-column-option.model';
import {BookColumnOption} from '../models/column-option/book-column-option.model';
import {EquityColumnOption} from '../models/column-option/equity-column-option.model';
import {ScenarioColumnOption} from '../models/column-option/scenario-column-option.model';
import {ColumnSelectorOption} from '../models/ui/column-selector-option.model';
import {LibColumnUtils} from './lib-column.utils';
import {ColumnOptionConstants} from '../constants';

describe('LibColumnUtils', () => {
    beforeAll(() => {
        ColumnOptionInitializer.initializeConfig();
        CoreTestUtils.initDefinitions();
    });

    /**
     * Test case for method getOriginalColumnTitle
     */
    it('test getOriginalColumnTitle', () => {
        // Get a title for a column tag and positionColumnType
        let title = CoreColumnUtils.getOriginalColumnTitle('market_val', UseType.BENCH);
        expect(title).toStrictEqual('Benchmark Market Value');

        // Get a title for a column tag and undefined position type
        title = CoreColumnUtils.getOriginalColumnTitle('total_ret', undefined);
        expect(title).toStrictEqual('Total Return');

        // Get a title for the unknown column tag
        title = CoreColumnUtils.getOriginalColumnTitle('xyz', UseType.ACTIVE);
        expect(title).toBeNull();
    });

    /**
     * Test that requesting a column that does not exist returns no column.
     */
    it('Get invalid column', () => {
        const columnDef = LibColumnUtils.getColumnDefinition(ColumnConfig.createColumn('invalid_column'));
        expect(columnDef).toBeNull();
    });


    describe('Test getting column tree', () => {
        it('Get the column tree - no filter', () => {
            const tree = LibColumnUtils.makeColumnTree([], null);
            expect(tree).not.toBeUndefined();
            expect(tree).not.toBeNull();
            expect(tree.length).toBeGreaterThan(0);
        });

        it('Get the column tree - with filter', () => {
            const filter: ColumnFilter[] = [
                {
                    'type': '=',
                    'key': 'reportTypes',
                    'value': 'SINGLE'
                },
                {
                    'type': '!=',
                    'key': 'isSubTotalable',
                    'value': false
                }
            ];
            const tree = LibColumnUtils.makeColumnTree(filter, null);
            expect(tree).not.toBeUndefined();
            expect(tree).not.toBeNull();
            expect(tree.length).toBeGreaterThan(0);
        });

        it('Get the column tree - single column multiple groups', () => {
            // Go through all the columns and find the one with the maximum number of groups.
            let column: ColumnDefinition;
            CoreDefinitionStore.columns.forEach((col: ColumnDefinition) => {
                // Only interested in columns with more than 1 group and is supported by single.
                if (col.groups && col.groups.length > 1 && col.reportTypes && col.reportTypes.indexOf('SINGLE') >= 0 &&
                    (column == null || column.groups.length < col.groups.length)) {
                    column = col;
                }
            });
            expect(column).not.toBeUndefined();
            expect(column).not.toBeNull();
            const filter: ColumnFilter[] = [
                {
                    'type': '=',
                    'key': 'columnTag',
                    'value': column.columnTag
                },
                {
                    'type': '=',
                    'key': 'uses',
                    'value': column.uses
                },
                {
                    'type': '=',
                    'key': 'reportTypes',
                    'value': 'SINGLE'
                }
            ];

            const tree = LibColumnUtils.makeColumnTree(filter, null);
            expect(tree).not.toBeUndefined();
            expect(tree).not.toBeNull();
            expect(tree.length).toBeGreaterThan(0);
        });

        /**
         * Test getting columns that fall into buckets with same name. Test that same name buckets
         * don't replace each other.
         */
        it('Get the column tree - test buckets with same name do not replace each other', () => {
            const tree = LibColumnUtils.makeColumnTree(null, null);

            // Create a function to find the node we are interested in.
            // NOTE:  I have changed this as array.find does not exist in PhantomJS.
            const findItem = (item: any, childName: string) => {
                for (let i = 0; i < item.length; i++) {
                    const child = item[i];
                    if (child.label === childName) {
                        return child;
                    }
                }
                return null;
            };

            // Get hold of Company Fundamentals group under root.
            const companyFundamentalsGroup = findItem(tree, 'Company Fundamentals');
            expect(companyFundamentalsGroup).not.toBeNull();

            // Get hold of group Research -> Client Ratings -> Company Fundamentals.
            const researchGroup = findItem(tree, 'Research');
            expect(researchGroup).not.toBeNull();

            const clientRatingGroup = findItem(researchGroup.children, 'Client Ratings');
            expect(clientRatingGroup).not.toBeNull();

            const researchCompFundamentalsGroup = findItem(clientRatingGroup.children, 'Company Fundamentals');
            expect(researchCompFundamentalsGroup).not.toBeNull();
        });

        it('Test tree order for PGS and Returns widget', () => {
            let tree = LibColumnUtils.makeColumnTree([], null, undefined, undefined, WidgetConfigType.PGS);
            expect(tree[0].label).toBe(ColumnOptionConstants.PORTFOLIO);
            tree = LibColumnUtils.makeColumnTree([], null, undefined, undefined, WidgetConfigType.RETURNS);
            expect(tree[0].label).toBe(ColumnOptionConstants.PERFORMANCE);
        });

        it('Test tree order for recent columns', () => {
            const tree = LibColumnUtils.makeColumnTree([], null, undefined, undefined, WidgetConfigType.RISK_EXPOSURE, ['duration_PORT']);
            expect(tree[0].label).toBe(ColumnOptionConstants.RECENT_COLUMNS);
        });
    });

    describe('makeColumnTree without a filter', () => {
        let columnMock;
        let expectedSelectorNode: ColumnSelectorOption;
        beforeEach(() => {
            columnMock = {
                groups: ['Mortgage', 'Pool Characteristics', 'Lp Data'],
                title: 'Gross Margin',
                columnTag: 'gross_margin',
                uses: 'ALL'
            };

            expectedSelectorNode = new ColumnSelectorOption('Gross Margin', 'gross_margin_ALL', null, 'column', columnMock, undefined, false);
        });

        it('should create a nested structure', () => {
            const level3Node = new ColumnSelectorOption('Lp Data', 'Mortgage:Pool Characteristics:Lp Data', [expectedSelectorNode], 'group');
            const level2Node = new ColumnSelectorOption('Pool Characteristics', 'Mortgage:Pool Characteristics', [level3Node], 'group');
            const level1Node = new ColumnSelectorOption('Mortgage', 'Mortgage', [level2Node], 'group');

            const selectorData: ColumnSelectorOption[] = [
                level1Node
            ];

            CoreDefinitionStore.columns = [columnMock as ColumnDefinition];
            expect(LibColumnUtils.makeColumnTree([], '')).toEqual(selectorData);
        });

        it('should work with duplicate groups', () => {
            const columnsMockForCase = [
                {
                    ...columnMock,
                    groups: ['Mortgage', 'Mortgage']
                }
            ];
            const expectedSelectorNodeForCase = {...expectedSelectorNode};
            (expectedSelectorNodeForCase.eventData as ColumnDefinition).groups = ['Mortgage', 'Mortgage'];

            const level2Node = new ColumnSelectorOption('Mortgage', 'Mortgage:Mortgage', [expectedSelectorNodeForCase], 'group');
            const level1Node = new ColumnSelectorOption('Mortgage', 'Mortgage', [level2Node], 'group');
            const pickListData: ColumnSelectorOption[] = [
                level1Node
            ];

            CoreDefinitionStore.columns = columnsMockForCase as ColumnDefinition[];
            expect(LibColumnUtils.makeColumnTree([], '')).toEqual(pickListData);
        });

        it('should work without groups', () => {
            const columnsMockForCase = [
                {
                    ...columnMock,
                    groups: []
                }
            ];
            const pickListData: ColumnSelectorOption[] = [expectedSelectorNode];
            (pickListData[0].eventData as ColumnDefinition).groups = [];

            CoreDefinitionStore.columns = columnsMockForCase as ColumnDefinition[];
            expect(LibColumnUtils.makeColumnTree([], '')).toEqual(pickListData);
        });

        it('should work with duplicate nodes', () => {
            const columnsMockForCase = [
                {
                    ...columnMock,
                    groups: []
                },
                {
                    ...columnMock,
                    groups: []
                }
            ];
            const pickListData: ColumnSelectorOption[] = [expectedSelectorNode, expectedSelectorNode];
            (pickListData[0].eventData as ColumnDefinition).groups = [];
            (pickListData[1].eventData as ColumnDefinition).groups = [];

            CoreDefinitionStore.columns = columnsMockForCase as ColumnDefinition[];
            expect(LibColumnUtils.makeColumnTree([], '')).toEqual(pickListData);
        });
    });

    describe('compareColumns', () => {
        it('should return -1 if stripped names are equal and A use order less then B', () => {
            const columnA = {
                title: 'Portfolio title',
                columnTag: 'columnTagA',
                uses: 'usesA',
                strippedName: 'title'
            } as ColumnDefinition;
            const columnB = {
                title: 'Benchmark title',
                columnTag: 'columnTagB',
                uses: 'usesB',
                strippedName: 'title'
            } as ColumnDefinition;
            expect(LibColumnUtils.compareColumns(columnA, columnB)).toBe(-1);
        });

        it('should return 1 if stripped names are equal and A use order equal to B', () => {
            const columnA = {
                title: 'test title',
                columnTag: 'columnTagA',
                uses: 'Active',
                strippedName: 'test title'
            } as ColumnDefinition;
            const columnB = {
                title: 'test title',
                columnTag: 'columnTagB',
                uses: 'Active',
                strippedName: 'test title'
            } as ColumnDefinition;
            expect(LibColumnUtils.compareColumns(columnA, columnB)).toBe(0);
        });

        it('should return 1 if stripped names are equal and A use order more then B', () => {
            const columnA: ColumnDefinition = {
                title: 'test title',
                columnTag: 'columnTagA',
                uses: 'ACTIVE',
                strippedName: 'test title'
            } as ColumnDefinition;
            const columnB: ColumnDefinition = {
                title: 'test title',
                columnTag: 'columnTagB',
                uses: 'BENCH',
                strippedName: 'test title'
            } as ColumnDefinition;
            expect(LibColumnUtils.compareColumns(columnA, columnB)).toBe(1);
        });

        it('compare columns - port/bench/active', () => {
            const cols = [
                CoreColumnUtils.getColumnDefByTagAndUse('market_val', 'BENCH'),
                CoreColumnUtils.getColumnDefByTagAndUse('market_val', 'ACTIVE'),
                CoreColumnUtils.getColumnDefByTagAndUse('market_val', 'PORT')
            ];

            // Sort the columns.
            cols.sort(LibColumnUtils.compareColumns);

            expect(cols[0].uses).toBe('PORT');
            expect(cols[1].uses).toBe('BENCH');
            expect(cols[2].uses).toBe('ACTIVE');
        });

        /**
         * Test that the comparator returns the port/bench/active columns in the correct order.
         */
        it('compare columns - column title', () => {
            const portMarketValCol = CoreColumnUtils.getColumnDefByTagAndUse('market_val', 'PORT');
            const benchMarketValCol = CoreColumnUtils.getColumnDefByTagAndUse('market_val', 'BENCH');
            const accIntCol = CoreColumnUtils.getColumnDefByTagAndUse('acc_int_dollars', 'BENCH');

            const cols = [
                benchMarketValCol,
                portMarketValCol,
                accIntCol
            ];

            // Sort the columns.
            cols.sort(LibColumnUtils.compareColumns);

            expect(cols[0].title).toBe(accIntCol.title);
            expect(cols[1].title).toBe(portMarketValCol.title);
            expect(cols[2].title).toBe(benchMarketValCol.title);
        });

        /**
         * Test that the comparator returns the port/bench/active columns in the correct order.
         */
        it('compare columns - Performance columns', () => {
            const portCol = LibColumnUtils.getColumnDefinition(ColumnConfig.createColumn('pnl_contr'));
            const benchCol = LibColumnUtils.getColumnDefinition(ColumnConfig.createColumn('bench_pnl_contr'));
            const activeCol = LibColumnUtils.getColumnDefinition(ColumnConfig.createColumn('active_pnl_contr'));

            const cols = [
                activeCol,
                benchCol,
                portCol
            ];

            // Sort the columns.
            cols.sort(LibColumnUtils.compareColumns);

            expect(cols[0].title).toBe(portCol.title);
            expect(cols[1].title).toBe(benchCol.title);
            expect(cols[2].title).toBe(activeCol.title);
        });

        /**
         * Test that the comparator returns the port/bench/active columns in the correct order.
         */
        it('compare columns - Risk columns', () => {
            const portCol = LibColumnUtils.getColumnDefinition(ColumnConfig.createColumn('port_risk_contr'));
            const benchCol = LibColumnUtils.getColumnDefinition(ColumnConfig.createColumn('bench_risk_contr'));
            const activeCol = LibColumnUtils.getColumnDefinition(ColumnConfig.createColumn('active_risk_contr'));
            const cols = [
                activeCol,
                benchCol,
                portCol
            ];

            // Sort the columns.
            cols.sort(LibColumnUtils.compareColumns);

            expect(cols[0].title).toBe(portCol.title);
            expect(cols[1].title).toBe(benchCol.title);
            expect(cols[2].title).toBe(activeCol.title);
        });
    });

    describe('filterColumn', () => {
        let column;

        beforeEach(() => {
            column = {
                reportTypes: ['SINGLE'],
                columnTag: 'gross_margin',
                columnReports: ['prism_praada_sectors', 'prism_all', 'prism_dataagg', 'prism_sectors'],
                isGroupable: true,
                columnType: 'ASSET',
                field: 'gross_margin',
                isSubtotalable: false,
                isNotSupportedInCustomCal: false,
                functionFlag: 0,
                dataType: 'DOUBLE',
                isStaticColumn: false,
                groups: ['Mortgage', 'Pool Characteristics', 'Lp Data'],
                uses: 'ALL',
                title: 'Gross Margin',
                columnDesc: 'columnDesc',
                doDeserialize: () => {
                },
                deserialize: () => {
                }
            };
        });

        it('should return true if key exist and filter value not defined', () => {
            const filterTitle: ColumnFilter = {
                key: 'title',
                type: '!='
            };
            expect(LibColumnUtils.doesColumnPassFilter(filterTitle, column as ColumnDefinition)).toBe(true);
        });

        it('should return true if key is function and filter value not defined', () => {
            const filterDoSerialize: ColumnFilter = {
                key: 'doDeserialize',
                type: '!='
            };
            expect(LibColumnUtils.doesColumnPassFilter(filterDoSerialize, column as ColumnDefinition)).toBe(true);
        });

        it('should return false if both key and value not defined', () => {
            const filterNotExistKey: ColumnFilter = {
                key: 'keyThatNotExist',
                type: '!='
            };
            expect(LibColumnUtils.doesColumnPassFilter(filterNotExistKey, column as ColumnDefinition)).toBe(false);
        });

        it('should return false if filter value and key are equal when filter value is string', () => {
            const filterValueString: ColumnFilter = {
                key: 'title',
                type: '!=',
                value: 'Gross Margin'
            };
            expect(LibColumnUtils.doesColumnPassFilter(filterValueString, column as ColumnDefinition)).toBe(false);
        });

        it('should return reverse result if type is not !=', () => {
            const filterReverse: ColumnFilter = {
                key: 'title',
                type: '==',
                value: 'Gross Margin'
            };
            expect(LibColumnUtils.doesColumnPassFilter(filterReverse, column as ColumnDefinition)).toBe(true);
        });

        it('should return true if filter value and key are not equal when filter value is string', () => {
            const filterValueStringNotEqual: ColumnFilter = {
                key: 'title',
                type: '!=',
                value: 'Other Value'
            };
            expect(LibColumnUtils.doesColumnPassFilter(filterValueStringNotEqual, column as ColumnDefinition)).toBe(true);
        });

        it('should work when value is an array', () => {
            const filterValueArray: ColumnFilter = {
                key: 'title',
                type: '!=',
                value: ['Gross Margin', 'second value']
            };
            expect(LibColumnUtils.doesColumnPassFilter(filterValueArray, column as ColumnDefinition)).toBe(false);
        });

        it('should work when column is an array', () => {
            const filterColumnArray: ColumnFilter = {
                key: 'groups',
                type: '!=',
                value: 'Mortgage'
            };
            expect(LibColumnUtils.doesColumnPassFilter(filterColumnArray, column as ColumnDefinition)).toBe(false);
        });

        it('should work when both value and column are arrays', () => {
            const filterColumnArray: ColumnFilter = {
                key: 'groups',
                type: '!=',
                value: ['Pool Characteristics', 'Lp Data']
            };
            expect(LibColumnUtils.doesColumnPassFilter(filterColumnArray, column as ColumnDefinition)).toBe(false);
        });

        it('should work when filter value is "undefined" string', () => {
            const filterColumnArray: ColumnFilter = {
                key: 'levelColumns',
                type: '=',
                value: 'undefined'
            };
            expect(LibColumnUtils.doesColumnPassFilter(filterColumnArray, column as ColumnDefinition)).toBe(true);
        });
    });


    describe('getFilteredList', () => {
        const column1 = {
            title: 'Title1',
            columnTag: 'gross_margin',
            groups: ['Mortgage', 'Pool Characteristics', 'Lp Data']
        };
        const column2 = {
            title: 'Title2',
            groups: ['Mortgage', 'Pool Characteristics', 'Lp Data']
        };
        const columns = [column1, column2];

        beforeEach(() => {
            CoreDefinitionStore.columns = columns as ColumnDefinition[];
        });

        it('should not do any filtering if filters are not defined', () => {
            expect(LibColumnUtils.getFilteredList()).toEqual(columns);
        });

        it('should filter columns with not-equal filter', () => {
            const filterNotEqual: ColumnFilter = {
                key: 'title',
                type: '!=',
                value: 'Title1'
            };
            expect(LibColumnUtils.getFilteredList([filterNotEqual])).toEqual([column2]);
        });

        it('should filter columns with equal filter', () => {
            const filterEqual: ColumnFilter = {
                key: 'title',
                type: '==',
                value: 'Title1'
            };
            expect(LibColumnUtils.getFilteredList([filterEqual])).toEqual([column1]);
        });
    });

    describe('ensureChild', () => {
        it('should return child if groupId same with one of the groups id', () => {
            const column1 = {
                uid: 'id1',
                label: 'label1'
            };
            const column2 = {
                uid: 'id2',
                label: 'label2'
            };
            const childrenMock = [column1, column2];
            expect(LibColumnUtils.ensureChild(childrenMock, 'id2', 'group1')).toEqual(column2);
        });

        it('should return create child group and push it', () => {
            const column1 = {
                uid: 'id1',
                label: 'label1'
            };
            const column2 = {
                uid: 'id2',
                label: 'label2'
            };
            const expectedGroup = {
                uid: 'group1:group2',
                label: 'group2',
                type: 'group',
                children: []
            };
            const childrenMock = [column1, column2];
            expect(LibColumnUtils.ensureChild(childrenMock, 'group1:group2', 'group2')).toEqual(expectedGroup);
            expect(childrenMock[2]).toEqual(expectedGroup);
        });
    });

    describe('makeGroups', () => {
        let groupOrder;
        let _ensureChild;

        beforeEach(() => {
            groupOrder = ['group1', 'group2'];
            _ensureChild = LibColumnUtils.ensureChild;
            LibColumnUtils.ensureChild = jest.fn(() => ({
                label: 'child',
                type: 'group',
                children: []
            } as ColumnSelectorOption));
        });

        afterEach(() => {
            LibColumnUtils.ensureChild = _ensureChild;
        });

        it('should not do anything when groupName not equal to any group and tree type was not changed by ensureChild', () => {
            // Arrange
            const column1 = {
                title: 'label1',
                groups: ['group1', 'group2']
            };
            const nodeDataMock = {
                uid: 'nodeData1',
                label: 'node',
                type: 'column',
                children: []
            };
            const treeMock = [nodeDataMock];

            // Act
            LibColumnUtils.makeGroups(column1.groups, treeMock as ColumnSelectorOption[]);

            // Assert
            expect(treeMock).toEqual([nodeDataMock]);
        });

        it('should call ensureChild when groupName not provided', () => {
            // Arrange
            const column1 = {
                title: 'label1',
                groups: ['group1']
            };
            const treeMock = [];

            // Act
            LibColumnUtils.makeGroups(column1.groups, treeMock as ColumnSelectorOption[]);

            // Assert
            expect(LibColumnUtils.ensureChild).toHaveBeenCalledWith(treeMock, 'group1', 'group1');
        });
    });

    describe('getOptionValueByConfigType Test', () => {
        it('should match based on the correct config type', () => {
            const activeCalculationColumnOption = new ActiveCalculationColumnOption();
            const optionConfigType = 'activeCalculationColumnOption';
            const optionValues: AbstractColumnOption[] = [
                new EquityColumnOption(),
                activeCalculationColumnOption,
                new BookColumnOption(),
            ];
            expect(CoreColumnUtils.getOptionValueByConfigType(optionValues, optionConfigType)).toBe(activeCalculationColumnOption);
        });
        it('should match based on alternate config type', () => {
            const scenarioColumnOption = new ScenarioColumnOption();
            const optionConfigType = 'scenarioRiskFactorViewColumnSettings';
            const optionValues: AbstractColumnOption[] = [
                scenarioColumnOption,
                new EquityColumnOption(),
                new BookColumnOption(),
            ];
            expect(CoreColumnUtils.getOptionValueByConfigType(optionValues, optionConfigType)).toBe(scenarioColumnOption);
        });
    });

    describe('getRecentColumnsForWidget/setRecentColumnsForWidget Test', () => {

        it('should get recent columns for given widget type', () => {
            const recentColumns = {
                'commonColumns': ['Market Value'],
                'pgsColumns': ['Portfolio', 'Currency'],
                'returnColumns': ['Total Return Contribution'],
                'praColumns': ['Risk Contribution']
            };
            expect(LibColumnUtils.getRecentColumnsForWidget(null, WidgetConfigType.PGS)).toBeUndefined();
            expect(LibColumnUtils.getRecentColumnsForWidget(recentColumns, WidgetConfigType.PGS)).toEqual(['Portfolio', 'Currency']);
            expect(LibColumnUtils.getRecentColumnsForWidget(recentColumns, WidgetConfigType.RETURNS)).toEqual(['Total Return Contribution']);
            expect(LibColumnUtils.getRecentColumnsForWidget(recentColumns, WidgetConfigType.PRA)).toEqual(['Risk Contribution']);
            expect(LibColumnUtils.getRecentColumnsForWidget(recentColumns, WidgetConfigType.RISK_EXPOSURE)).toEqual(['Market Value']);
        });

        it('should set recent columns for given widget type', () => {
            const recentColumns = {
                'commonColumns': ['Market Value']
            };
            LibColumnUtils.setRecentColumnsForWidget(null, ['NAV'], WidgetConfigType.PGS);
            expect(recentColumns['pgsColumns']).toBeUndefined();
            LibColumnUtils.setRecentColumnsForWidget(recentColumns, null, WidgetConfigType.PGS);
            expect(recentColumns['pgsColumns']).toBeUndefined();
            LibColumnUtils.setRecentColumnsForWidget(recentColumns, ['NAV'], WidgetConfigType.PGS);
            expect(recentColumns['pgsColumns']).toEqual(['NAV']);
            LibColumnUtils.setRecentColumnsForWidget(recentColumns, ['Total Return Contribution'], WidgetConfigType.RETURNS);
            expect(recentColumns['returnColumns']).toEqual(['Total Return Contribution']);
            LibColumnUtils.setRecentColumnsForWidget(recentColumns, ['Risk Contribution'], WidgetConfigType.PRA);
            expect(recentColumns['praColumns']).toEqual(['Risk Contribution']);
            LibColumnUtils.setRecentColumnsForWidget(recentColumns, ['Benchmark Market Value'], WidgetConfigType.RISK_EXPOSURE);
            expect(recentColumns['commonColumns']).toEqual(['Benchmark Market Value']);
        });
    });

    /**
     * Test that we can get a security column just by specifying the column tag.
     */
    it('Get security column - sec_group', () => {
        const col = {columnTag: 'sec_group'};
        testColumn(col);
    });

    /**
     * Test that we can get a market value column just by specifying the column tag.
     * This tests the contract of ColumnService.getColumnDefinition to take position type into account
     * only if it's defined on the given column. If it's not defined, it returns the first column definition
     * that matches the given column's tag.
     */
    it('Get market_val col without pos type', () => {
        const col = {columnTag: 'market_val'};
        testColumn(col, false);
    });

    /**
     * Test that we can get a position column specifying the column tag and position type.
     */
    it('Get position column - market_val (PORT)', () => {
        testPositionColumn('market_val', 'PORT');
    });

    /**
     * Test that we can get a position column specifying the column tag and position type.
     */
    it('Get position column - market_val (BENCH)', () => {
        testPositionColumn('market_val', 'BENCH');
    });

    /**
     * Test that we can get a position column specifying the column tag and position type.
     */
    it('Get position column - market_val (ACTIVE)', () => {
        testPositionColumn('market_val', 'ACTIVE');
    });

    /**
     * Tests that we can get a performance column with the col tag and the position type.
     * The position type should be ignored and the column should be found by its tag because
     * performance columns don't use postion types but instead have unique column tags
     * (e.g. total_ret, bench_total_ret, active_total_ret)
     */
    it('Get performance column with pos type', () => {
        testPositionColumn('bench_total_ret', 'BENCH', false);
    });

    /**
     * Gets the position column and runs the tests on it.
     */
    function testPositionColumn(columnTag: any, positionType: any, useNotToEqual?: boolean) {
        const col = ColumnConfig.createColumn(columnTag, positionType);
        testColumn(col, useNotToEqual);
    }

    /**
     * Get the column and performs some tests on the response.
     * @param col - column
     * @param useNotToEqual? if true it checks that the use type of the found column definition does not equal
     * the given column's position type;
     * if underdefined or false, checks that the use type of the found columns equals the given column's position type.
     */
    function testColumn(col: any, useNotToEqual?: any) {
        const columnDef = LibColumnUtils.getColumnDefinition(col);
        expect(columnDef).not.toBeUndefined();
        expect(columnDef).not.toBeNull();
        expect(columnDef.columnTag).toEqual(col.columnTag);
        if (col.positionColumnType) {
            if (useNotToEqual) {
                expect(columnDef.uses).not.toEqual(col.positionColumnType);
            } else {
                expect(columnDef.uses).toEqual(col.positionColumnType);
            }
        }
    }


    describe('Test getting factor column tree', () => {

        it('Get the factor column tree with no groups', () => {
            const columnA = {
                title: 'Factor Z',
                columnTag: 'columnTagA',
                uses: ColumnConstants.FACTOR_MODEL,
            } as ColumnDefinition;
            const columnB = {
                title: 'Factor F',
                columnTag: 'columnTagB',
                uses: ColumnConstants.FACTOR_MODEL,
            } as ColumnDefinition;

            const factorDefinitions = [columnA, columnB];

            const tree = LibColumnUtils.makeFactorColumnTree(factorDefinitions);

            expect(tree).not.toBeUndefined();
            expect(tree).not.toBeNull();
            expect(tree.length).toBeGreaterThan(0);
            const options = [];
            tree.forEach(value => {
                options.push(value);
            });
            expect(options.length).toBe(2);
            expect(options[0].eventData).toBe(columnB);
            expect(options[1].eventData).toBe(columnA);
        });

        it('Get the factor column tree with groups', () => {
            const columnA = {
                title: 'Factor Z',
                columnTag: 'columnTagA',
                uses: ColumnConstants.FACTOR_MODEL,
                groups: ['Spread']
            } as ColumnDefinition;
            const columnB = {
                title: 'Factor F',
                columnTag: 'columnTagB',
                uses: ColumnConstants.FACTOR_MODEL,
                groups: ['Fx']
            } as ColumnDefinition;

            const factorDefinitions = [columnA, columnB];

            const tree = LibColumnUtils.makeFactorColumnTree(factorDefinitions);

            expect(tree).not.toBeUndefined();
            expect(tree).not.toBeNull();
            expect(tree.length).toBeGreaterThan(0);
            const options = [];
            tree.forEach(value => {
                options.push(value);
            });
            expect(options.length).toBe(2);
            expect(options[0].label).toBe('Fx');
            expect(options[0].eventData).toBeUndefined();
            expect(options[0].children).not.toBeNull();
            expect(options[0].children.length).toBe(1);
            expect(options[0].children[0].eventData).toBe(columnB);

            expect(options[1].label).toBe('Spread');
            expect(options[1].eventData).toBeUndefined();
            expect(options[1].children).not.toBeNull();
            expect(options[1].children.length).toBe(1);
            expect(options[1].children[0].eventData).toBe(columnA);
        });
    });

    it('test getActionCol', () => {
        const colDef = LibColumnUtils.getActionColDef();
        expect(colDef.field).toBe(ColumnConstants.ACTION_COL);
    });
});
