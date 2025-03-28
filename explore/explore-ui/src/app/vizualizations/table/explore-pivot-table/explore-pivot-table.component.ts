import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Vizualization} from '../../vizualization';
import {BehaviorSubject, Subject} from 'rxjs';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {
    CellKeyDownEvent,
    ColDef,
    ColGroupDef,
    ColumnMovedEvent,
    ColumnPinnedEvent,
    ColumnResizedEvent,
    GridApi,
    GridReadyEvent,
    ICellRendererParams,
    SortChangedEvent
} from 'ag-grid-community';
import {BaseRightClickHandler} from '../right-click-handler/base-right-click.handler';
import {RightClickHandlerRegistry} from '../right-click-handler/right-click-handler.registry';
import {cellKeyDownHandler, generateColumnDefinitions, generateGroupColumn, setSortedColumnsInGrid, setSortedColumnsInput} from '../table.utils';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {ROOT_LEVEL} from '@utils/qbstr';
import {AggregationKey, Cube, GroupByKey} from '@qbstr/data-cube';
import {flatten, max} from 'lodash';
import {VizualizationColumnConfig} from '@interfaces/request.interface';
import {Widget} from '@models/widget/widget.model';
import {ListCellRenderer} from './list-cell-renderer';
import {PivotTableCustomViz} from '@interfaces/custom-viz-config.interface';
import {CommonConstants} from '@constants/common.constants';
import {ColumnState, WidgetInputType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {AuxGridOptions} from '@blk/aladdin-angular-components';

export const LIST_CELL_RENDERER = 'listCellRenderer';
const PIVOT_CELL_ROW_SIZE = 18;
const PIVOT_CELL_ROW_SPACER = 2;
const PIVOT_CELL_PADDING = 8;

const ROW_LEVEL = 'level-1';
const COLUMN_LEVEL = 'level-2';
const TOTAL_COLUMN_SPLIT = '|Total';

const accumulatorAgg = 'accumulator';
const benchActiveAgg = 'bencActiveAgg';
const totalAgg = 'totalAgg';

@Component({
    selector: 'app-explore-pivot-table',
    templateUrl: './explore-pivot-table.component.html',
    styleUrls: ['./explore-pivot-table.component.scss']
})
export class ExplorePivotTableComponent extends Vizualization implements OnInit {

    private customVizConfig: PivotTableCustomViz;
    private _widgetPayload$: BehaviorSubject<WidgetPayload>;

    @Input() widget: Widget;

    @Input() set widgetPayload(widgetPayload: WidgetPayload) {
        if (!this._widgetPayload$) {
            this._widgetPayload$ = new BehaviorSubject<WidgetPayload>(widgetPayload);
        } else {
            this._widgetPayload$.next(widgetPayload);
        }
    }

    @Input() shouldSizeColumnsToFit: boolean;

    /**
     * Event emitted when user right clicked to launch a spritelet
     */
    @Output() spriteletLaunched = new EventEmitter<SpriteletEvent>();

    private colDefs: ColDef[];
    private rightClickHandler: BaseRightClickHandler;
    private vizPivotColumnMap: { [field: string]: VizualizationColumnConfig } = {};
    private pivotColumnDefs: ColDef[] = [];
    public config: AuxGridOptions;
    private columnResized$ = new Subject<ColumnResizedEvent>();
    private columnState: ColumnState;
    auxGridOverrides = {
        'headerMenuItemsExclusionList': [
            'resetColumns'
        ]
    };

    constructor(private rightClickHandlerRegistry: RightClickHandlerRegistry) {
        super();
    }

    ngOnInit() {
        this._widgetPayload$.subscribe((widgetPayload: WidgetPayload) => {
            this.prepareGridConfig(widgetPayload);
        });

        this.columnResized$
            .pipe(
                takeUntil(this.ngUnsubscribe),
                debounceTime(200)
            )
            .subscribe((event: ColumnResizedEvent) => {
                this.updateColumnState(event);
            });
    }

    private prepareGridConfig(widgetPayload: WidgetPayload) {
        if (this.widget) {
            this.columnState = this.widget.getColumnState();
        }
        this.customVizConfig = widgetPayload.customVizConfig;
        this.responseConfig = widgetPayload.responseConfig;
        this.requestConfig = widgetPayload.requestConfig;
        this.breakdownLevels = widgetPayload.breakdownLevels;
        this.rightClickHandler = this.rightClickHandlerRegistry.getRightClickHandler(widgetPayload.widgetConfigType);

        // When the cube changes we want to make sure the latest version is used by the ag-grid
        this.cube = widgetPayload.cube;

        // first time colDefs come we want to initialize the grid, after that we only update it
        const colDefs: ColDef[] = widgetPayload.defaultColumnDefs
            ? [...widgetPayload.breakdownLevels.map(col => generateGroupColumn(col)), ...widgetPayload.defaultColumnDefs]
            : generateColumnDefinitions(this.requestConfig, this.responseConfig, this.breakdownLevels, this.columnState.columns, true).filter((col: any) => col && col.children);

        // Check if the column measure selected has child columns
        // If it does, the columns would be further nested (colDefs[0].children[0].children)
        const hasChildColumns: boolean = colDefs.length > 0 && (colDefs[0] as ColGroupDef).children?.length > 0 && ((colDefs[0] as ColGroupDef).children[0] as ColGroupDef).children?.length > 0;

        this.colDefs = this.preparePivotColumns(colDefs, hasChildColumns);

        this.config = {
            context: {},
            onGridReady: this.gridReady,
            components: {
                [LIST_CELL_RENDERER]: ListCellRenderer
            },
            columnDefs: this.colDefs,
            suppressAggFuncInHeader: true,
            defaultColDef: {
                floatingFilter: false,
                cellClass: 'cell-wrap-text'
            },
            getRowHeight: this.getRowHeight,
            onSortChanged: this.onSortChanged,
            onColumnMoved: this.onColumnMoved,
            onColumnResized: this.onColumnResized,
            onCellKeyDown: this.onCellKeyDown,
            suppressColumnVirtualisation: true,
            rowData: this.generateDataForPivotTable(this.colDefs),
            onRowDataUpdated: event => this.setBottomPinnedDataTotalRow(event.api),
            defaultAuxHeaderMenuItems: () => [
                'fontStyle',
                'fontSize',
                'paddingSize',
                'separator',
                'rowStriping',
                'columnDividers',
                'showFilterRow',
                'separator',
                'pinSubMenu',
                'separator',
                'sortBy',
                'multiColumnSort',
                'clearSortAllColumns',
                'separator',
                'autoSizeThis',
                'autoSizeAll',
            ],
        };
        if (this.rightClickHandler) {
            this.config.getMainMenuItems = (params) =>
                this.rightClickHandler.getMainMenuItemsForAgGrid(params, this.requestConfig, this.spriteletLaunched);
        }
    }

    /**
     * sort change event handler
     */
    protected onSortChanged = (event: SortChangedEvent) => {
        setSortedColumnsInput(this.widget, event);
    };

    /**
     * Get the sortedColumn from widget input and apply to gridOptions
     */
    protected setSortedColumns(params: GridReadyEvent): void {
        setSortedColumnsInGrid(this.widget, params);
    }

    protected preparePivotColumns(colDefs: ColDef[], hasChildColumns?: boolean): ColDef[] {
        if (colDefs.length > 0) {
            this.pivotColumnDefs = hasChildColumns ? ((colDefs[0] as ColGroupDef).children[0] as ColGroupDef).children : (colDefs[0] as ColGroupDef).children;
            this.requestConfig.splitColumns.forEach(col => this.vizPivotColumnMap[col.columnKey] = col);
            this.pivotColumnDefs.forEach(colDef => {
                colDef.cellRenderer = LIST_CELL_RENDERER;
                colDef.cellRendererParams = {vizPivotColumnObject: this.vizPivotColumnMap[colDef.field]};
                colDef.cellStyle = (params) => {
                    if (params.data && params.data.bgColorMap && params.data.bgColorMap[colDef.field]) {
                        return {backgroundColor: params.data.bgColorMap[colDef.field]};
                    }
                };
            });

            // TOTAL COLUMN
            if (this.pivotColumnDefs[0]) {
                this.pivotColumnDefs[0].pinned = 'right';
                this.pivotColumnDefs[0].cellRenderer = this.customVizConfig.portBenchActiveEnabled && !this.customVizConfig.cellBreakdown ? LIST_CELL_RENDERER : undefined;
                this.pivotColumnDefs[0].cellRendererParams = this.customVizConfig.portBenchActiveEnabled && !this.customVizConfig.cellBreakdown ? {vizPivotColumnObject: this.vizPivotColumnMap[this.pivotColumnDefs[0].field]} : undefined;
            }
        } else {
            this.pivotColumnDefs = [];
        }

        return [{
            headerName: `${this.getBreakdownName(this.customVizConfig.rowBreakdown)} \\ ${this.getBreakdownName(this.customVizConfig.columnBreakdown)}`,
            field: ROW_LEVEL,
            cellRenderer: this.pivotGroupCellRenderer
        }, ...this.pivotColumnDefs];
    }

    protected generateDataForPivotTable(colDefs: ColDef[]): any[] {
        // if active and bench then generate level2 grouping and run regular pivot

        const measureColumns = colDefs.slice(1, colDefs.length);
        // Set the first column width if widget is from favorite
        if (this.columnState.columns.length) {
            colDefs[0].width = this.columnState.columns[0].width;
        }

        if (this.customVizConfig.cellBreakdown) {
            const cksForSet = this.cube.keys().filter(ck => ck.groupKeys().find(gk => gk.isEqual(new GroupByKey(COLUMN_LEVEL))));
            const data: any[] = cksForSet.map(ck => this.cube.getData(ck));

            // all numeric columns (we are removing the first one that represents the row breakdown)
            const aggKeys = measureColumns.map((col: ColDef) => new AggregationKey(col.field, col.field.includes(TOTAL_COLUMN_SPLIT) ? totalAgg : accumulatorAgg));
            return this.flatDataForPivotTable(data, aggKeys);
        } else {
            const cksForSet = this.cube.keys().filter(ck => ck.groupKeys().find(gk => gk.isEqual(new GroupByKey(ROW_LEVEL))));
            const data: any[] = cksForSet.map(ck => this.cube.getData(ck));

            const aggKeys = this.customVizConfig.portBenchActiveEnabled
                ? measureColumns.map((col: ColDef) => new AggregationKey(col.field, benchActiveAgg))
                : measureColumns.map((col: ColDef) =>  new AggregationKey(col.field, col.field.includes(TOTAL_COLUMN_SPLIT) ? totalAgg : 'sum'));

            return this.flatDataForPivotTable(data, aggKeys);
        }
    }

    getBenchOrActive(field: VizualizationColumnConfig) {
        if (field.columnKey.includes('ACTIVE')) {
            return 'Act';
        } else if (field.columnKey.includes('BENCH')) {
            return 'Bm';
        } else {
            return 'Pf';
        }
    }

    /** We organize the data by the row level breakdown and we do a 'subtotal'
     *  that creates an array of all the data for the cell level breakdown
     *  We make sure that the values for the Total column that is already
     *  in the cube under a different QueryKey is simply re-maped for the Total 'substotal'
     */
    protected flatDataForPivotTable(dataSets: any[][], aggKeys: AggregationKey[]): any[] {
        const flattenDataSets = flatten(dataSets);

        /**
         * parentTotalCK is used to filter out level-1 aggregate data(bgColorMap included) from this.cube.
         * listOfRows contains level-1 data based on parentTotalCK
         */
        const parentTotalCK = this.cube['underlyingCube'].keys().find(ck => ck.groupKeys().find(gk => gk.isEqual(new GroupByKey(ROW_LEVEL))));
        const listOfRows = this.cube['underlyingCube'].get(parentTotalCK);
        const synchronousCube = new Cube(flattenDataSets, {
            aggregationFunctions: {
                [accumulatorAgg]: (data, field) => {
                    return data.filter(row => row[field]).map(row => ({
                        name: row[COLUMN_LEVEL],
                        value: row[field]
                    }));
                },
                [benchActiveAgg]: (data, field) => {
                    const dataPoints = data.map(row => Object.entries(row)
                        .filter(([key, value]) => key.split('|')[1] === field.split('|')[1])
                        .map(([key, value]) => ({name: this.getBenchOrActive(this.vizPivotColumnMap[key]), value: value || ''})))[0];
                    return dataPoints.every((dp: { name: string, value: any }) => !dp.value) ? [] : dataPoints;
                },
                [totalAgg]: (data, field) => {
                    const dataRow = listOfRows.find(row => row[ROW_LEVEL] === data[0][ROW_LEVEL]);
                    return dataRow[field];
                }
            },
        });
        const tableData = synchronousCube.stream().groupByQK(new GroupByKey(ROW_LEVEL)).aggregate(aggKeys).toList();

        for (let i = 0; i < tableData.length; i++) {
            if (listOfRows[i].bgColorMap) {
                tableData[i].bgColorMap = listOfRows[i].bgColorMap;
            }
        }
        return tableData;
    }

    protected gridReady = (params: GridReadyEvent): void => {
        const api = params.api;
        // do sorting if applies, when widget is initialized for the first time
        this.setSortedColumns(params);
        setTimeout(() => {
            api.autoSizeColumns(api.getColumns());
        });
    };

    protected setBottomPinnedDataTotalRow(gridApi: GridApi) {
        const ckTotal = this.cube.keys().find(ck => ck.groupKeys().find(gk => gk.isEqual(new GroupByKey(ROOT_LEVEL))) !== undefined);
        this.cube.get(ckTotal).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
            data[0][ROW_LEVEL] = this.requestConfig.portfolio;
            gridApi.updateGridOptions({pinnedBottomRowData: data});
        });
    }

    protected onColumnMoved = (event: ColumnMovedEvent) => {
        // TODO: this should be using the possible column group function from table.utils
    }

    /**
     * cell key down event handler
     */
    protected onCellKeyDown = (event: CellKeyDownEvent) => {
        cellKeyDownHandler(event, this.widget, this.requestConfig);
    }

    protected pivotGroupCellRenderer = (params: ICellRendererParams) => {
        const eDiv = document.createElement('div');
        eDiv.setAttribute('style', 'width: 100%; height: 100%');
        eDiv.innerHTML = params.value;
        return eDiv;
    }

    /**
     * Returns the height for each row in pivot table.  Since each column uses a custom cell renderer we must manually calculate this
     */
    protected getRowHeight = (params): number => {
        const maxRowsInCell = max(Object.values(params.node.data).filter(value => Array.isArray(value)).map((arr: any[]) => arr.length)) || 1;
        const cellInnerTableHeight = (maxRowsInCell * PIVOT_CELL_ROW_SIZE) + ((maxRowsInCell - 1) * PIVOT_CELL_ROW_SPACER);
        return cellInnerTableHeight + PIVOT_CELL_PADDING;
    }

    getBreakdownName(breakdownName: string): string {
        return breakdownName.includes(CommonConstants.LESS_THAN) ? '&lt' + breakdownName.slice(1, -1) + '&gt' : breakdownName;
    }

    /**
     * Update column state
     */
    protected updateColumnState = (event: ColumnPinnedEvent | ColumnResizedEvent) => {
        const agGridColumnState = event.api.getColumnState();
        const columnSet = this.widget.getCombinedInputs().get(WidgetInputType.COLUMNS) as ColumnSet;
        if (columnSet) {
            columnSet.columnState = new ColumnState({columns: agGridColumnState});
        }
    };

    /**
     * On column resized
     */
    protected onColumnResized = (event: ColumnResizedEvent) => {
        this.columnResized$.next(event);
    };
}
