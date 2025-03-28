import {NotificationService} from '../index';
import {TestUtils} from '@utils/test.utils';
import {beforAllDataServiceTest, runValidateInputsAndCheckItFailsOnComparisonMode, validateService} from '@services/widget/functions-for-data-service.testutil';
import {PivotTableWidgetDataService} from '@services/widget/pivot-table-widget-data.service';
import {Report} from '@models/workspace/report.model';
import {Breakdown, ColumnBreakdown, ColumnSector} from '@blk/explore-ui-breakdown';
import {Widget} from '@models/widget/widget.model';
import {WidgetDataStore} from '@models/dataStore/widget-data-store.model';
import {WidgetDataStoreMetaData} from '@models/dataStore/widget-data-store-meta-data.model';
import {PivotTableSettingsModel} from '@models/widget/inputs/pivot-table-settings.model';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {ColumnSet, LibColumnUtils} from '@blk/explore-ui-column-option';
import {ColumnConfig, ColumnDefinition, WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {FlatWorkpad} from '../../../models/workspace/flat-workpad.model';
import {WorkspaceStore} from '../../../stores';

describe('PivotTableWidgetDataService Test', () => {
    let service: PivotTableWidgetDataService;
    let exploreDataRequestService: ExploreDataRequestService;
    const notificationService: NotificationService = new NotificationService();
    let report: Report;
    let widget: Widget;
    let rowBreakdown: Breakdown;
    let columnBreakdown: Breakdown;
    let cellBreakdown: Breakdown;
    let widgetInputs: Map<string, WidgetInput>;
    let columnSet: ColumnSet;
    let column: ColumnConfig;
    let pivotTableSettings: PivotTableSettingsModel;
    let columnSector: ColumnSector;

    let getBreakdownSpy;
    let addCellLevelBreakdownSpy;
    let addPortBenchActiveColumnsSpy;
    let addColumnLevelBreakdownSpy;
    let deepCloneAndOptionalStripToSpecifiedLevelSpy;

    beforeAll(() => {
        exploreDataRequestService = beforAllDataServiceTest();
        service = new PivotTableWidgetDataService(exploreDataRequestService, notificationService);
    });

    beforeEach((done) => {
        TestUtils.initialize(done);

        report = new Report();
        widget = new Widget();

        column = new ColumnConfig();
        column.columnTag = 'x';
        column.positionColumnType = 'port';

        columnSet = new ColumnSet();
        columnSet.columns.push(column);

        pivotTableSettings = new PivotTableSettingsModel();
        pivotTableSettings.portBenchActiveEnabled = true;

        widgetInputs = new Map<string, WidgetInput>();
        widgetInputs.set(WidgetInputType.COLUMNS, columnSet);
        widgetInputs.set(PivotTableSettingsModel.configType, pivotTableSettings);

        widget.dataStore = new WidgetDataStore();
        widget.dataStore.metaData = new WidgetDataStoreMetaData();
        widget.dataStore.metaData.inputs = widgetInputs;

        rowBreakdown = new Breakdown();
        columnBreakdown = new Breakdown();
        cellBreakdown = new Breakdown();

        columnSector = new ColumnSector();
        columnSector.columnTag = 'x';

        rowBreakdown.addChild(columnSector);
        columnBreakdown.addChild(columnSector);
        cellBreakdown.addChild(columnSector);
    });

    afterEach( () => {
        jest.restoreAllMocks();
    });

    /**
     *
     */
    it('validate service', () => {
        validateService(service, [WidgetConfigType.PIVOT], 'Y');
    });

    /**
     *
     */
    it('validateInputs - invalid scenario - no breakdown', () => {
        initMethodMocks();
        WorkspaceStore.init();
        WorkspaceStore.currentWorkpad$.next(new FlatWorkpad());

        // No breakdown - invalid
        getBreakdownSpy.mockImplementation(jest.fn(() => {
            return undefined;
        }));

        const notification = service['validateInputs'](widget, null, report);
        expect(notification).not.toBeNull();
        expect(getBreakdownSpy).toHaveBeenCalledTimes(2);
    });

    it('displayWarningForMultiLevelBreakdown - scenario - multi-level breakdown', () => {
        const pivotWidget = new Widget(WidgetConfigType.PIVOT);
        const notificationSpy = jest.spyOn(service['notificationService'], 'warning');
        service['displayWarningForMultiLevelBreakdown'](pivotWidget);
        expect(notificationSpy).not.toHaveBeenCalled();

        const breakdown = new Breakdown();
        breakdown.children = [];
        breakdown.addChild(new ColumnSector());
        breakdown.children[0].addChild(new ColumnSector());
        pivotWidget.dataStore.metaData.inputs.set(WidgetInputType.BREAKDOWN_TREE, breakdown);

        service['displayWarningForMultiLevelBreakdown'](pivotWidget);
        expect(notificationSpy).toHaveBeenCalledTimes(1);
    });

    it('validateInputs - invalid scenario - comparison mode', () => {
        runValidateInputsAndCheckItFailsOnComparisonMode(service);
    });

    it('validateInputs - valid scenarios', () => {
        initMethodMocks();
        WorkspaceStore.currentWorkpad$.next(new FlatWorkpad());

        // Has breakdowns
        getBreakdownSpy.mockImplementation(jest.fn(() => {
            return new Breakdown();
        }));

        const notification = service['validateInputs'](widget, null, report);
        expect(notification).toBeNull();
        expect(getBreakdownSpy).toHaveBeenCalledTimes(2);
    });

    it('modifyWidgetInputsForRequest - has cell breakdown', () => {
        runModifyWidgetInputsForRequestAndValidate(new Breakdown(), 1, 1, 0);
    });

    it('modifyWidgetInputsForRequest - has no cell breakdown', () => {
        runModifyWidgetInputsForRequestAndValidate(undefined, 0, 1, 1);
    });

    it('addColumnLevelBreakdown', () => {
        widgetInputs.set(WidgetInputType.COLUMN_BREAKDOWN_TREE, columnBreakdown);

        deepCloneAndOptionalStripToSpecifiedLevelSpy = jest.spyOn(Breakdown, 'deepCloneAndOptionalStripToSpecifiedLevel');

        // Run the method
        service.addColumnLevelBreakdown(widgetInputs, column);

        // Validate
        expect(widgetInputs.has(WidgetInputType.COLUMN_BREAKDOWN_TREE)).toStrictEqual(false);
        expect(deepCloneAndOptionalStripToSpecifiedLevelSpy).toHaveBeenCalledTimes(1);

        expect(column.optionValues.length).toStrictEqual(1);

        const columnBreakdownOption: ColumnBreakdown = column.optionValues[0] as ColumnBreakdown;
        expect(columnBreakdownOption.breakdown).not.toBe(columnBreakdown);

        expect(columnBreakdownOption.breakdown.children.length).toStrictEqual(1);
        const sector = columnBreakdownOption.breakdown.children[0] as ColumnSector;
        expect(sector.columnTag).toStrictEqual(columnSector.columnTag);
    });

    it('addCellLevelBreakdown', () => {
        const rowBreakdownColumnSector = rowBreakdown.children[0] as ColumnSector;
        rowBreakdownColumnSector.columnTag = rowBreakdownColumnSector.columnTag + '1';

        const cellBreakdownColumnSector = cellBreakdown.children[0] as ColumnSector;
        cellBreakdownColumnSector.columnTag = cellBreakdownColumnSector.columnTag + '2';

        widgetInputs.set(WidgetInputType.BREAKDOWN_TREE, rowBreakdown);
        widgetInputs.set(WidgetInputType.CELL_BREAKDOWN_TREE, cellBreakdown);

        deepCloneAndOptionalStripToSpecifiedLevelSpy = jest.spyOn(Breakdown, 'deepCloneAndOptionalStripToSpecifiedLevel');

        // Run the method
        service.addCellLevelBreakdown(widgetInputs, cellBreakdown);

        // Validate
        expect(widgetInputs.has(WidgetInputType.CELL_BREAKDOWN_TREE)).toStrictEqual(false);
        expect(deepCloneAndOptionalStripToSpecifiedLevelSpy).toHaveBeenCalledTimes(2);

        const calledWithCellBreakdown = deepCloneAndOptionalStripToSpecifiedLevelSpy.mock.calls[0][0];
        const calledWithRowBreakdown = deepCloneAndOptionalStripToSpecifiedLevelSpy.mock.calls[1][0];
        expect(calledWithCellBreakdown).toBe(cellBreakdown);
        expect(calledWithRowBreakdown).toBe(rowBreakdown);

        // Validate it's a two level breakdown
        const resultingBreakdown = widgetInputs.get(WidgetInputType.BREAKDOWN_TREE) as Breakdown;
        expect(resultingBreakdown).toBeDefined();
        expect(resultingBreakdown.children.length).toStrictEqual(1);

        const columnSectorChild = resultingBreakdown.children[0] as ColumnSector;
        expect(columnSectorChild.columnTag).toStrictEqual(rowBreakdownColumnSector.columnTag);
        expect(columnSectorChild.children.length).toStrictEqual(1);

        const columnSectorGrandChild = columnSectorChild.children[0] as ColumnSector;
        expect(columnSectorGrandChild.columnTag).toStrictEqual(columnSectorGrandChild.columnTag);
        expect(columnSectorGrandChild.children.length).toStrictEqual(0);
    });

    it('addPortBenchActiveColumns - has both port and bench', () => {
        const benchColumnDef = new ColumnDefinition();
        benchColumnDef.columnTag = 'benchColTag';
        benchColumnDef.uses = 'bench';

        const activeColumnDef = new ColumnDefinition();
        activeColumnDef.columnTag = 'activeColTag';
        activeColumnDef.uses = 'active';

        const columnDefs: ColumnDefinition[] = [benchColumnDef, activeColumnDef];

        const getFilteredListSpy = jest.spyOn(LibColumnUtils, 'getFilteredList');
        getFilteredListSpy.mockImplementation(jest.fn(() => {
            return columnDefs;
        }));

        // Run the method
        service.addPortBenchActiveColumns(column, columnSet);

        // Validate
        expect(getFilteredListSpy).toHaveBeenCalledTimes(1);
        expect(columnSet.columns.length).toStrictEqual(3);

        // Validate that all 3 columns are different objects and have the expected position types
        const positionTypeColumnPairs: Map<string, ColumnConfig> = new Map<string, ColumnConfig>();
        let previousColumn;

        columnSet.columns.forEach(function(col: ColumnConfig) {
            expect(col).not.toBe(previousColumn);
            previousColumn = col;

            const posType = col.positionColumnType;
            positionTypeColumnPairs.set(posType, col);

            if (posType === column.positionColumnType) {
                // Validate that the actual column has not been cloned
                expect(col).toBe(column);
                expect(col.columnKey).toStrictEqual(column.columnKey);
            } else {
                // Other two columns should be not be the original column
                expect(col).not.toBe(column);
                expect(col.columnKey).toStrictEqual(column.columnKey + '_' + posType);
            }
        });

        expect(positionTypeColumnPairs.size).toStrictEqual(3);
        expect(positionTypeColumnPairs.has(column.positionColumnType)).toStrictEqual(true);
        expect(positionTypeColumnPairs.has(benchColumnDef.uses)).toStrictEqual(true);
        expect(positionTypeColumnPairs.has(activeColumnDef.uses)).toStrictEqual(true);
    });

    it('addPortBenchActiveColumns - has no bench nor active', () => {
        const columnDefs: ColumnDefinition[] = [];

        const getFilteredListSpy = jest.spyOn(LibColumnUtils, 'getFilteredList');
        getFilteredListSpy.mockImplementation(jest.fn(() => {
            return columnDefs;
        }));

        // Run the method
        service.addPortBenchActiveColumns(column, columnSet);

        // Validate - should only have one original column
        expect(getFilteredListSpy).toHaveBeenCalledTimes(1);
        expect(columnSet.columns.length).toStrictEqual(1);

        const columnInSet: ColumnConfig = columnSet.columns[0];
        expect(columnInSet).toBe(column);
    });

    it('customVizConfig', () => {
        widget.dataStore.metaData.inputs.set(WidgetInputType.BREAKDOWN_TREE, {title: 'test-1'} as any);
        widget.dataStore.metaData.inputs.set(WidgetInputType.COLUMN_BREAKDOWN_TREE, {title: 'test-1'} as any);
        widget.dataStore.metaData.inputs.set(WidgetInputType.CELL_BREAKDOWN_TREE, {title: 'test-1'} as any);
        widget.dataStore.metaData.inputs.delete('pivotSettings');



        // chartType bar
        expect(service['customVizConfig'](widget, widgetInputs)).toEqual({
            rowBreakdown: 'test-1',
            columnBreakdown: 'test-1',
            cellBreakdown: 'test-1',
            portBenchActiveEnabled: false
        });

        widget.dataStore.metaData.inputs.set('pivotSettings', {portBenchActiveEnabled: true} as any);


        expect(service['customVizConfig'](widget, widgetInputs)).toEqual({
            rowBreakdown: 'test-1',
            columnBreakdown: 'test-1',
            cellBreakdown: 'test-1',
            portBenchActiveEnabled: true
        });

    });

    function runModifyWidgetInputsForRequestAndValidate(breakdown: Breakdown, addCellLevelBreakdownCalledTimes: number,
                                                        addColumnLevelBreakdownCalledTimes: number, addPortBenchActiveColumnsCalledTimes: number) {
        initMethodMocks();

        // Has cell breakdown
        getBreakdownSpy.mockImplementationOnce(jest.fn(() => {
            return breakdown;
        }));

        addCellLevelBreakdownSpy.mockImplementationOnce(jest.fn(() => {
            // Do nothing
        }));

        addPortBenchActiveColumnsSpy.mockImplementationOnce(jest.fn(() => {
            // Do nothing
        }));

        addColumnLevelBreakdownSpy.mockImplementationOnce(jest.fn(() => {
            // Do nothing
        }));

        // Call the method
        service['modifyWidgetInputsForRequest'](widgetInputs, widget);

        // Validate
        expect(addCellLevelBreakdownSpy).toHaveBeenCalledTimes(addCellLevelBreakdownCalledTimes);
        expect(addColumnLevelBreakdownSpy).toHaveBeenCalledTimes(addColumnLevelBreakdownCalledTimes);
        expect(addPortBenchActiveColumnsSpy).toHaveBeenCalledTimes(addPortBenchActiveColumnsCalledTimes);

        // Validate column set
        const modifiedColumnSet = widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        expect(modifiedColumnSet.columns.length).toStrictEqual(1);
        expect(modifiedColumnSet).not.toBe(columnSet);

        const modifiedColumn = modifiedColumnSet.columns[0];
        expect(modifiedColumn).not.toBe(column);
        expect(modifiedColumn).toStrictEqual(column);
    }

    /**
     *
     */
    function initMethodMocks() {
        addCellLevelBreakdownSpy = jest.spyOn(service, 'addCellLevelBreakdown');
        addPortBenchActiveColumnsSpy = jest.spyOn(service, 'addPortBenchActiveColumns');
        addColumnLevelBreakdownSpy = jest.spyOn(service, 'addColumnLevelBreakdown');
        getBreakdownSpy = jest.spyOn(AbstractWidgetService, 'getBreakdown');
        deepCloneAndOptionalStripToSpecifiedLevelSpy = jest.spyOn(Breakdown, 'deepCloneAndOptionalStripToSpecifiedLevel');
    }
});

