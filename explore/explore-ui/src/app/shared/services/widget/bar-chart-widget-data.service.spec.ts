import {BarChartWidgetDataService} from './bar-chart-widget-data.service';
import {Breakdown, ColumnSector} from '@blk/explore-ui-breakdown';
import {validateService} from '@services/widget/functions-for-data-service.testutil';
import {SortOrderColumnOptionModel} from '@models/columns/column-options/sort-order-column-option.model';
import {SortedColumns} from '@models/widget/inputs/sorted-columns/sorted-columns';
import {SortedColumn} from '@models/widget/inputs/sorted-columns/sorted-column';
import {AggregationColumnOption, ColumnSet} from '@blk/explore-ui-column-option';
import {
    ChartWidgetInputConfigType,
    ColumnConfig,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';

describe('BarChartWidgetDataService Test', () => {
    const breakdownPrefix = 'breakdown';
    const stackedBreakdownPrefix = 'stackedBreakdown';
    const leve1OneSuffix = 'Lvl1';
    const levelTwoSuffix = 'Lvl2';

    let service: BarChartWidgetDataService;
    let breakdown: Breakdown;
    let stackedBreakdown: Breakdown;
    let widgetInputs: Map<string, WidgetInput>;

    /**
     * Performs required initialisation
     */
    beforeEach(() => {
        service = new BarChartWidgetDataService(null);

        // Construct breakdown
        breakdown = createBreakdown(breakdownPrefix);
        // Construct stacked breakdown
        stackedBreakdown = createBreakdown(stackedBreakdownPrefix);

        widgetInputs = new Map<string, WidgetInput>();
    });

    /**
     * Tests BarChartWidgetDataService.modifyBreakdown
     */
    it('modifyBreakdown - has no breakdown, has no stacked breakdown - expect original widget inputs', () => {
        BarChartWidgetDataService.modifyWidgetInputs(widgetInputs);

        expect(widgetInputs.size).toStrictEqual(0);
    });

    /**
     * Tests BarChartWidgetDataService.modifyBreakdown
     */
    it('modifyBreakdown - has breakdown, has no stacked breakdown - expect original breakdown with all levels', () => {
        widgetInputs.set(WidgetInputType.BREAKDOWN_TREE, breakdown);
        BarChartWidgetDataService.modifyWidgetInputs(widgetInputs);

        // Extract breakdown and verify the breakdown is the original one
        const breakdownFromWidgetInputs = widgetInputs.get(WidgetInputType.BREAKDOWN_TREE);
        expect(breakdownFromWidgetInputs === breakdown).toStrictEqual(true);
        verifyBreakdown(breakdownFromWidgetInputs as Breakdown, breakdownPrefix + leve1OneSuffix, breakdownPrefix + levelTwoSuffix);
    });

    /**
     * Tests BarChartWidgetDataService.modifyBreakdown
     */
    it('modifyBreakdown - has breakdown, has stacked breakdown - expect breakdown = (1st lvl from breakdown) + (1st lvl from stacked breakdown)', () => {
        widgetInputs.set(WidgetInputType.BREAKDOWN_TREE, breakdown);
        widgetInputs.set(WidgetInputType.STACKED_BREAKDOWN_TREE, stackedBreakdown);
        BarChartWidgetDataService.modifyWidgetInputs(widgetInputs);

        // Extract breakdown
        const breakdownFromWidgetInputs = widgetInputs.get(WidgetInputType.BREAKDOWN_TREE);

        // Verify the stacked breakdown has been removed
        expect(widgetInputs.has(WidgetInputType.STACKED_BREAKDOWN_TREE)).toStrictEqual(false);

        // Verify that the extracted breakdown is of Breakdown type and is not either of the two breakdowns
        expect(breakdownFromWidgetInputs instanceof Breakdown).toStrictEqual(true);
        expect(breakdownFromWidgetInputs === breakdown).toStrictEqual(false);
        expect(breakdownFromWidgetInputs === stackedBreakdown).toStrictEqual(false);

        // Verify that the original breakdowns have not been modified
        verifyBreakdown(breakdown, breakdownPrefix + leve1OneSuffix, breakdownPrefix + levelTwoSuffix);
        verifyBreakdown(stackedBreakdown, stackedBreakdownPrefix + leve1OneSuffix, stackedBreakdownPrefix + levelTwoSuffix);

        // Verify that the constructed breakdown is the combination of the two breakdowns' first levels
        verifyBreakdown(breakdownFromWidgetInputs as Breakdown, breakdownPrefix + leve1OneSuffix, stackedBreakdownPrefix + leve1OneSuffix);
    });

    /**
     * Tests BarChartWidgetDataService.modifyBreakdown
     */
    it('modifyBreakdown - has no breakdown, has stacked breakdown - expect 1st lvl stacked breakdown', () => {
        widgetInputs.set(WidgetInputType.STACKED_BREAKDOWN_TREE, stackedBreakdown);
        BarChartWidgetDataService.modifyWidgetInputs(widgetInputs);

        // Extract breakdown
        const breakdownFromWidgetInputs = widgetInputs.get(WidgetInputType.BREAKDOWN_TREE);

        // Verify the stacked breakdown has been removed
        expect(widgetInputs.has(WidgetInputType.STACKED_BREAKDOWN_TREE)).toStrictEqual(false);

        // Verify that the extracted breakdown is of Breakdown type and is not a stacked breakdown
        expect(breakdownFromWidgetInputs instanceof Breakdown).toStrictEqual(true);
        expect(breakdownFromWidgetInputs === stackedBreakdown).toStrictEqual(false);

        // Verify that the original stacked breakdown have not been modified
        verifyBreakdown(stackedBreakdown, stackedBreakdownPrefix + leve1OneSuffix, stackedBreakdownPrefix + levelTwoSuffix);

        // Verify that the constructed breakdown is the first level of the stacked breakdown
        verifyBreakdown(breakdownFromWidgetInputs as Breakdown, stackedBreakdownPrefix + leve1OneSuffix);
    });

    /**
     * Tests modifyWidgetInputsForRequest.
     */
    it('modifyWidgetInputsForRequest - checks that expected methods are called', () => {
        // noinspection JSUnusedLocalSymbols
        const spy1 = jest.spyOn(BarChartWidgetDataService, 'modifyWidgetInputs');
        const spy2 = jest.spyOn(BarChartWidgetDataService, 'applyWidgetSortingSettings');

        // Execute the method
        service['modifyWidgetInputsForRequest'](widgetInputs, null);

        // Verify the methods were called
        expect(spy1).toHaveBeenCalledWith(widgetInputs);
        expect(spy1).toHaveBeenCalledTimes(1);

        expect(spy2).toHaveBeenCalledWith(widgetInputs);
        expect(spy2).toHaveBeenCalledTimes(1);
    });

    it('applyWidgetSortingSettings - no column is present in widgetInputs', () => {
        BarChartWidgetDataService.applyWidgetSortingSettings(widgetInputs);
        expect(widgetInputs.get(WidgetInputType.COLUMNS)).toBeFalsy();

        widgetInputs.set(WidgetInputType.COLUMNS, new ColumnSet());
        BarChartWidgetDataService.applyWidgetSortingSettings(widgetInputs);
        expect(widgetInputs.get(WidgetInputType.COLUMNS)).toStrictEqual(new ColumnSet());
    });


    it('Test noDataResponse', () => {
        let response: any = {
            data: {
                data: {
                    children: [
                        {
                            data: [null]
                        },
                        {
                            data: [null]
                        }
                    ]
                }
            }
        };

        expect(service['noDataResponse'](response)).toBe('No data is available for the selected date');
        response = {
            data: {
                data: {
                    children: [
                        {
                            data: [null]
                        },
                        {
                            data: [null]
                        }
                    ]
                },
            },
            message : 'Unexpected error'
        };

        expect(service['noDataResponse'](response)).toBe('No data in the response, response.message =Unexpected error');
        response = {
            data: {
                data: {
                    data: [null, null]
                }
            },
        };
        expect(service['noDataResponse'](response)).toBe('No data is available for the selected date');

        response = {
            data: {
                data: {
                    data: [null, null]
                }
            },
            message : 'Unexpected error'
        };
        expect(service['noDataResponse'](response)).toBe('No data in the response, response.message =Unexpected error');
    });

    it('applyWidgetSortingSettings - column is present without optionValues, sortedColumns not present in widgetInputs', () => {
        const columnSet = createColumnSet('market_val');

        widgetInputs.set(WidgetInputType.COLUMNS, columnSet);
        BarChartWidgetDataService.applyWidgetSortingSettings(widgetInputs);
        expect(widgetInputs.get(WidgetInputType.COLUMNS)).toStrictEqual(columnSet);
        expect((widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns[0].optionValues).toStrictEqual([new SortOrderColumnOptionModel({sortOrder: 'DESC'})]);
    });

    it('applyWidgetSortingSettings - column is present with optionValues, sortedColumns not present in widgetInputs', () => {
        const columnSet = createColumnSet('market_val');
        columnSet.columns[0].optionValues = [new AggregationColumnOption()];
        widgetInputs.set(WidgetInputType.COLUMNS, columnSet);
        BarChartWidgetDataService.applyWidgetSortingSettings(widgetInputs);
        expect(widgetInputs.get(WidgetInputType.COLUMNS)).toStrictEqual(columnSet);
        expect((widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns[0].optionValues).toStrictEqual([new AggregationColumnOption(), new SortOrderColumnOptionModel({sortOrder: 'DESC'})]);
    });

    it('applyWidgetSortingSettings - column is present, sortedColumns present without any columns in widgetInputs', () => {
        const columnSet = createColumnSet('market_val');
        widgetInputs.set(WidgetInputType.COLUMNS, columnSet);
        const sortedColumns = new SortedColumns();
        // sortedColumns.sortedColumns = [new SortedColumn({colId: 'PORT', sort: 'DESC'})];
        widgetInputs.set('sortedColumns', sortedColumns);
        BarChartWidgetDataService.applyWidgetSortingSettings(widgetInputs);
        expect(widgetInputs.get(WidgetInputType.COLUMNS)).toStrictEqual(columnSet);
        expect((widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns[0].optionValues).toStrictEqual([new SortOrderColumnOptionModel({sortOrder: 'DESC'})]);
    });

    it('applyWidgetSortingSettings - column is present, sortedColumns present with valid columns but diff columnKey and colId', () => {
        const columnSet = createColumnSet('market_val');
        columnSet.columns[0].columnKey = 'market_val_123';
        widgetInputs.set(WidgetInputType.COLUMNS, columnSet);
        const sortedColumns = new SortedColumns();
        sortedColumns.sortedColumns = [new SortedColumn({colId: 'market_val', sort: 'DESC'})];
        widgetInputs.set('sortedColumns', sortedColumns);
        BarChartWidgetDataService.applyWidgetSortingSettings(widgetInputs);
        expect(widgetInputs.get(WidgetInputType.COLUMNS)).toStrictEqual(columnSet);
        expect((widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns[0].optionValues).toStrictEqual([new SortOrderColumnOptionModel({sortOrder: 'DESC'})]);
    });

    it('applyWidgetSortingSettings - column is present, sortedColumns present with valid columns and same columnKey and colId', () => {
        const columnSet = createColumnSet('market_val');
        columnSet.columns[0].columnKey = 'market_val_123';
        widgetInputs.set(WidgetInputType.COLUMNS, columnSet);
        const sortedColumns = new SortedColumns();
        sortedColumns.sortedColumns = [new SortedColumn({colId: 'market_val_123', sort: 'DESC'})];
        widgetInputs.set('sortedColumns', sortedColumns);
        BarChartWidgetDataService.applyWidgetSortingSettings(widgetInputs);
        expect(widgetInputs.get(WidgetInputType.COLUMNS)).toStrictEqual(columnSet);
        expect((widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet).columns[0].optionValues).toStrictEqual([new SortOrderColumnOptionModel({sortOrder: 'DESC'})]);
    });

    /**
     * @return a newly created column set
     */
    function createColumnSet(columnTag: string): ColumnSet {
        // Create a column
        const column: ColumnConfig = new ColumnConfig();
        column.columnTag = columnTag;

        // Create a column set
        const columnSet: ColumnSet = new ColumnSet();
        columnSet.columns.push(column);

        return columnSet;
    }

    /**
     *
     */
    it('validate service', () => {
        validateService(service, [WidgetConfigType.BAR], 'Y');
    });

    /**
     * @return a newly created two-level breakdown
     */
    function createBreakdown(sectorNamePrefix: string): Breakdown {
        const sectorLvl1: ColumnSector = new ColumnSector();
        sectorLvl1.columnName = sectorNamePrefix + leve1OneSuffix;

        const sectorLvl2: ColumnSector = new ColumnSector();
        sectorLvl2.columnName = sectorNamePrefix + levelTwoSuffix;

        sectorLvl1.addChild(sectorLvl2);
        const newBreakdown: Breakdown = new Breakdown();
        newBreakdown.addChild(sectorLvl1);

        return newBreakdown;
    }

    /**
     * Verifies that the given breakdown has two levels with the given prefix
     * @param breakdownToVerify a breakdown to verify
     * @param lvlOneSectorName expected name of the breakdown's level 1 sector
     * @param lvlTwoSectorName expected name of the breakdown's level 2 sector,
     *                               if not passed, it means the breakdowns is to only have sector level 1
     */
    function verifyBreakdown(breakdownToVerify: Breakdown, lvlOneSectorName: string, lvlTwoSectorName?: string): void {
        // Verify it has one direct child
        expect(breakdownToVerify.children.length).toStrictEqual(1);

        // Extract sector level 1 and verify
        const sectorLvl1: ColumnSector = breakdownToVerify.children[0] as ColumnSector;
        expect(sectorLvl1.columnName).toStrictEqual(lvlOneSectorName);

        if (lvlTwoSectorName) {
            // Verify sector level 1 has one direct child
            expect(sectorLvl1.children.length).toStrictEqual(1);

            // Extract sector level 2 and verify
            const sectorLvl2: ColumnSector = sectorLvl1.children[0] as ColumnSector;
            expect(sectorLvl2.columnName).toStrictEqual(lvlTwoSectorName);
            expect(sectorLvl2.hasNoChildren()).toStrictEqual(true);
        } else {
            // Verify sector level 1 has no children
            expect(sectorLvl1.hasNoChildren()).toStrictEqual(true);
        }
    }

    it('should test customVizConfig', () => {
        widgetInputs.set('chart', {chartType: 'column', sortedColumns: []} as any);
        widgetInputs.set('stackedBreakdownTree', {children: ['test']} as any);
        widgetInputs.set(ChartWidgetInputConfigType.GRID_LINES, {[ChartWidgetInputConfigType.GRID_LINES]: true} as any);
        widgetInputs.set(ChartWidgetInputConfigType.SECONDARY_AXIS_COLUMN, {[ChartWidgetInputConfigType.SECONDARY_AXIS_COLUMN]: 'test'} as any);
        const widget = {
            displayInputs: widgetInputs,
            dataStore: {
                metaData: {
                    inputs: new Map<string, WidgetInput>()
                }
            }
        };
        expect(service['customVizConfig'](widget, widgetInputs));
    });
});
