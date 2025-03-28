import {ScatterChartWidgetDataService} from './scatter-chart-widget-data.service';
import {WorkspaceStore} from '../../../stores';
import {Report} from '@models/workspace/report.model';
import {BehaviorSubject} from 'rxjs';
import {ColumnConfig, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {FlatWorkpad} from '../../../models/workspace/flat-workpad.model';

describe('ScatterChartWidgetDataService Test', () => {
    const xAxisColumnTag = 'x';
    const yAxisColumnTag = 'y';
    const sizeColumnTag = 's';

    let service: ScatterChartWidgetDataService;
    let xAxisColumnSet: ColumnSet;
    let yAxisColumnSet: ColumnSet;
    let sizeColumnSet: ColumnSet;
    let widgetInputs: Map<string, WidgetInput>;
    let expectedColumnSet: ColumnSet;

    /**
     * Performs required initialisation
     */
    beforeEach(() => {
        service = new ScatterChartWidgetDataService(null);

        // Create required column sets
        xAxisColumnSet = createColumnSet(xAxisColumnTag);
        yAxisColumnSet = createColumnSet(yAxisColumnTag);
        sizeColumnSet = createColumnSet(sizeColumnTag);

        // Create widget inputs and add two measures that will always be present
        widgetInputs = new Map<string, WidgetInput>();
        widgetInputs.set(WidgetInputType.X_AXIS_COLUMN, xAxisColumnSet);
        widgetInputs.set(WidgetInputType.Y_AXIS_COLUMN, yAxisColumnSet);

        // Create expected column set
        expectedColumnSet = new ColumnSet();
        expectedColumnSet.columns.push(xAxisColumnSet.columns[0]);
        expectedColumnSet.columns.push(yAxisColumnSet.columns[0]);
    });

    /**
     * Tests removeMeasureColumnSet
     */
    it('removeMeasureColumnSet', () => {
        const extractedXAxisColumnSet = ScatterChartWidgetDataService.removeMeasureColumnSet(WidgetInputType.X_AXIS_COLUMN, widgetInputs);

        // Validate that get the expected column set and that it's removed from the widget input
        expect(extractedXAxisColumnSet).toBe(xAxisColumnSet);
        expect(widgetInputs.has(WidgetInputType.X_AXIS_COLUMN)).toStrictEqual(false);
    });

    /**
     * Tests modifyWidgetInputsForRequest
     */
    it('modifyWidgetInputsForRequest - has no Size measure - should have "columns" collection with xAxis and yAxis columns in widget inputs', () => {
        runModifyWidgetInputsForRequestAndValidate();
    });

    /**
     * Tests modifyWidgetInputsForRequest
     */
    it('modifyWidgetInputsForRequest - has Size measure - should have "columns" collection with xAxis, yAxis and size columns in widget inputs', () => {
        widgetInputs.set(WidgetInputType.SIZE_COLUMN, sizeColumnSet);
        expectedColumnSet.columns.push(sizeColumnSet.columns[0]);

        runModifyWidgetInputsForRequestAndValidate();
    });

    it('should calc custom viz config', () => {
        const displayInputs = new Map();
        displayInputs.set('scatterSettings', {groupByFirstLevelData: false});
        WorkspaceStore.init();
        WorkspaceStore.currentReport$ = new BehaviorSubject<Report>(new Report());
        WorkspaceStore.currentWorkpad$.next(new FlatWorkpad());
        expect(service['customVizConfig']({displayInputs} as any, widgetInputs)).toEqual({showGridLines: false, groupByFirstLevel: false, isComparisonMode: false});
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
     * Runs modifyWidgetInputsForRequest and validates that the columns in the widget inputs are
     * as in the expectedColumnSet.
     * It also checks that the measures have been removed from the widget inputs
     */
    function runModifyWidgetInputsForRequestAndValidate(): void {
        // Execute the method
        service['modifyWidgetInputsForRequest'](widgetInputs, null);

        // Extract columns
        const columnSet: ColumnSet = widgetInputs.get(WidgetInputType.COLUMNS) as ColumnSet;

        // Validate the columns are the same
        expect(columnSet.columns).toStrictEqual(expectedColumnSet.columns);

        // Validate that the measures are removed
        expect(widgetInputs.has(WidgetInputType.X_AXIS_COLUMN)).toStrictEqual(false);
        expect(widgetInputs.has(WidgetInputType.Y_AXIS_COLUMN)).toStrictEqual(false);
        expect(widgetInputs.has(WidgetInputType.SIZE_COLUMN)).toStrictEqual(false);
    }
});
