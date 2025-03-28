import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {AuxActionCellRendererParams, AuxGridOptions} from '@blk/aladdin-angular-components';
import {ColumnSet, LibColumnUtils, NumericDataFormatter} from '@blk/explore-ui-column-option';
import {
    ColumnConstants,
    ColumnFilteringParameters,
    ColumnState,
    ConfigState,
    TelemetryActionConstants,
    TelemetryService,
    WidgetConfigType,
    WidgetInputType
} from '@blk/explore-ui-core';
import {TabularWidgetConstants} from '@constants/tabular-widget.constants';
import {VizualizationColumnConfig} from '@interfaces/request.interface';
import {CompositionConfig} from '@models/portfolio/composition/composition-config.model';
import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';
import {ExpandedState} from '@models/widget/inputs/expanded-state.model';
import {ExpostSortedColumns} from '@models/widget/inputs/expost-sorted-columns/expost-sorted.columns';
import {SortedColumn} from '@models/widget/inputs/sorted-columns/sorted-column';
import {SortedColumns} from '@models/widget/inputs/sorted-columns/sorted-columns';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {Widget} from '@models/widget/widget.model';
import {Report} from '@models/workspace/report.model';
import {ReactiveCubeCrud} from '@qbstr/data-cube-reactive';
import {BatchExportingStore} from '@stores/batch-exporting.store';
import {WorkspaceStore} from '@stores/workspace.store';
import {ColumnUtils} from '@utils/column.utils';
import {ExportUtils} from '@utils/export/export.utils';
import {QbstrExploreServerSideDataSource, QbstrServerSideParams, ROW_ID_COLUMN_NAME} from '@utils/qbstr';
import {
    CellClickedEvent,
    CellKeyDownEvent,
    CellRange,
    ColDef,
    ColumnGroupOpenedEvent,
    ColumnMovedEvent,
    ColumnPinnedEvent,
    ColumnResizedEvent,
    FilterChangedEvent,
    FilterModel,
    FirstDataRenderedEvent,
    GetContextMenuItemsParams,
    GetMainMenuItemsParams,
    GetRowIdParams,
    GridApi,
    GridReadyEvent,
    IsServerSideGroupOpenByDefaultParams,
    MenuItemDef,
    RangeSelectionChangedEvent,
    RowClickedEvent,
    RowGroupOpenedEvent,
    SortChangedEvent
} from 'ag-grid-community';
import {isEmpty, isNil, uniq} from 'lodash';
import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime, filter, takeUntil} from 'rxjs/operators';
import {Vizualization} from '../../vizualization';
import {BaseRightClickHandler} from '../right-click-handler/base-right-click.handler';
import {RightClickHandlerRegistry} from '../right-click-handler/right-click-handler.registry';
import {
    cellKeyDownHandler,
    generateColumnDefinitions,
    generateGroupColumn,
    getColumnHeaderNameWithScaling,
    getUpdatedColumnState,
    setSortedColumnsInGrid,
    setSortedColumnsInput
} from '../table.utils';
import {CommonConstants} from '@constants/common.constants';
import {ReturnSpriteletService} from '@services/widget/return-spritelet.service';
import {CollapsedColumns} from '@models/widget/inputs/collapsed-columns.model';

/**
 * This component is a wrapper to provide the correct initialization for the underlying AuxGrid and
 * the ServerSideDatasource that drives the Qbstr(data cube)
 */
@Component({
    selector: 'app-explore-table',
    templateUrl: './explore-table.component.html',
    styleUrls: ['./explore-table.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ExploreTableComponent extends Vizualization implements OnInit {

    readonly widgetsWithActionCol = [WidgetConfigType.PRA, WidgetConfigType.RETURNS, WidgetConfigType.PGS, WidgetConfigType.RISK_EXPOSURE];

    @Input() widget: Widget;

    @Input() set widgetPayload(widgetPayload: WidgetPayload) {
        if (!this._widgetPayload$) {
            this._widgetPayload$ = new BehaviorSubject<WidgetPayload>(widgetPayload);
        } else {
            this._widgetPayload$.next(widgetPayload);
        }
    }

    @Input() shouldSizeColumnsToFit: boolean;

    // flag for whether or not table search should be visible
    // WidgetComponent handles determining whether or not table search is supported on the table
    @Input() isTableSearchActive$: BehaviorSubject<boolean>;

    @Input() compositionConfig: CompositionConfig;

    @Input() suppressRootNode: boolean;

    @Input() isFutureRowExpanded? = false;

    // flag to indicate if the table is a Factor Data Analysis or Returns Analysis Widget
    @Input() isActionColumnNeeded: boolean;

    /**
     * Event emitted when user right clicked to launch a spritelet
     */
    @Output() spriteletLaunched = new EventEmitter<SpriteletEvent>();

    // These 2 inputs for LookThrough widget settings
    @Input() widgetViewCss = 'component-hw-100 explore-search';
    @Input() widgetSize = 'xsmall';

    @Output() cellClicked = new EventEmitter();

    private _widgetPayload$: BehaviorSubject<WidgetPayload>;
    private onRowGroupOpenedSubject$ = new Subject<RowGroupOpenedEvent>();
    private rightClickHandler: BaseRightClickHandler;
    public config: AuxGridOptions;
    protected setServerSideDataSourceSubject$: BehaviorSubject<ReactiveCubeCrud<any>> = new BehaviorSubject<ReactiveCubeCrud<any>>(undefined);
    protected setColDefSubject$ = new Subject<ColDef[]>();

    private columnResized$ = new Subject<ColumnResizedEvent>();

    private expandedState: ExpandedState;
    private sortModels: SortedColumn[];
    private columnState: ColumnState;
    widgetColumns: ColumnSet;
    private initialColOrder: string[];
    private draggedColumn: string;
    private shouldReformat = true;
    gridApiHandle: GridApi;

    rowsLoaded$ = new Subject<string[]>();

    rowDataPopulated$ = new Subject<string>();

    // flag to indicate if the table is autosizing for the first time after initial render
    private isFirstRenderAutosize = false;

    /**
     * constructor
     */
    constructor(private rightClickHandlerRegistry: RightClickHandlerRegistry) {
        super();
    }

    /**
     * ngOnInit
     */
    ngOnInit() {
        this.columnResized$
            .pipe(
                takeUntil(this.ngUnsubscribe),
                debounceTime(200)
            )
            .subscribe((event: ColumnResizedEvent) => {
                this.updateColumnState(event, true);
            });

        this._widgetPayload$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((widgetPayload: WidgetPayload) => {
                this.responseConfig = widgetPayload.responseConfig;
                this.requestConfig = widgetPayload.requestConfig;
                this.breakdownLevels = widgetPayload.breakdownLevels;
                this.rightClickHandler = this.rightClickHandlerRegistry.getRightClickHandler(widgetPayload.widgetConfigType);
                if (this.rightClickHandler) {
                    this.rightClickHandler.rowDataPopulated$ = this.rowDataPopulated$;
                }
                // When the cube changes we want to make sure the latest version is used by the ag-grid
                // reset the expanded State
                this.onCubeChanged(widgetPayload);

                let colDefs = this.createTableColDefs(widgetPayload);

                if (widgetPayload.responseConfig.collapsableColumns) {
                   this.handleCollapsableColumns(colDefs, widgetPayload);
                }

                this.isActionColumnNeeded = this.isActionColumnNeeded ?? this.widgetsWithActionCol.includes(this.widget?.configType);

                if (this.isActionColumnNeeded) {
                    const actionColDef = LibColumnUtils.getActionColDef();
                    colDefs = [actionColDef, ...colDefs];
                }

                if (this.config) {
                    this.setColDefSubject$.next(colDefs);
                } else {
                    this.config = this.createAuxGridOptions(colDefs);
                    this.setUpAutoColDef(colDefs);
                    this.config.getContextMenuItems = (params: GetContextMenuItemsParams): MenuItemDef[] => this.getContextMenuItems(params, true);
                    this.config.getMainMenuItems = (params: GetMainMenuItemsParams) => {
                        if (this.rightClickHandler) {
                            return this.rightClickHandler.getMainMenuItemsForAgGrid(params, this.requestConfig, this.spriteletLaunched);
                        }
                        return params.defaultItems;
                    };
                }
                this.findCollapsedColumns();
            });
    }

    /**
     * Returns the right-click menu items for the table
     */
    private getContextMenuItems(params: GetContextMenuItemsParams, isRightClick: boolean): MenuItemDef[] {
        // do not support right click menu on action column
        if (isRightClick && params.column.getColId() === ColumnConstants.ACTION_COL) {
            return [];
        }
        return this.rightClickHandler?.getContextMenuItemsForAgGrid(params, this.requestConfig, this.spriteletLaunched, this.expandedState, this.widget) || [];
    }

    /**
     * Creates column definitions for the table columns
     */
    protected createTableColDefs(widgetPayload: WidgetPayload): ColDef[] {
        // first time colDefs come we want to initialize the grid, after that we only update it
        return widgetPayload.defaultColumnDefs
            ? [...widgetPayload.breakdownLevels.map(col => generateGroupColumn(col)), ...ColumnUtils.updateCompositionTableColDefsWidth(widgetPayload.defaultColumnDefs, this.compositionConfig)]
            : generateColumnDefinitions(this.requestConfig, this.responseConfig, this.breakdownLevels, this.columnState.columns, undefined, this.suppressRootNode);
    }

    /**
     * Handle collapsable columns for Performance Details widget
     */
    private handleCollapsableColumns(colDefs: ColDef[], widgetPayload: WidgetPayload): void {
        colDefs.forEach(colDef => {
            const groupChildColumns = colDef['children'];
            if (!groupChildColumns) {
                return;
            }

            // Process each child column for collapsibility.
            let allChildrenCollapsable = true;
            groupChildColumns.forEach(child => {
                if (widgetPayload.responseConfig.collapsableColumns.has(child.colTag)) {
                    child.columnGroupShow = 'open';
                } else {
                    allChildrenCollapsable = false;
                }
            });

            // If all children columns are set to 'open', unset the columnGroupShow for the main column.
            const mainColumns = ReturnSpriteletService.getPerformanceDetailsMainColumns();
            if (allChildrenCollapsable) {
                const mainChildColumn = groupChildColumns.find(child => mainColumns.has(child.colTag));
                if (mainChildColumn) {
                    mainChildColumn.columnGroupShow = undefined;
                }
            }
        });
    }

    /**
     * cube change handler
     */
    onCubeChanged(widgetPayload: WidgetPayload): void {
        if (this.widget) {
            this.expandedState = this.widget.displayInputs.get(ExpandedState.CONFIG_TYPE) as ExpandedState;
            const columnSetInputType = this.widget.configType === WidgetConfigType.COMMITMENT_RISK ? WidgetInputType.COMMITMENT_RISK_TABLE_COLUMNS : WidgetInputType.COLUMNS;
            this.widgetColumns = this.widget.getCombinedInputs().get(columnSetInputType) as ColumnSet;
            this.columnState = this.widget.getColumnState();
        } else {
            // for composition table scenario
            if (widgetPayload.customVizConfig) {
                this.expandedState = widgetPayload.customVizConfig.expandedState;
                this.sortModels = widgetPayload.customVizConfig.sortModel;
            }
        }
        this.cube = widgetPayload.cube;
        this.setServerSideDataSourceSubject$.next(this.cube);
    }

    /**
     * sets up Auto Column Def
     */
    setUpAutoColDef(colDefs: ColDef<any>[]): void {
        if (this.requestConfig && !isEmpty(this.requestConfig.columns)) {
            const colDefForAutoCol: ColDef = colDefs.find(colDef => colDef.field === this.requestConfig.columns[0].columnKey);
            // in few cases auto group column could be undefined, but to handle this situation gracefully we are doing Nil check
            // for example in case of compare mode we don't have any security description or cusip field
            if (!isNil(colDefForAutoCol)) {
                this.config.autoGroupColumnDef = {
                    ...this.createBaseAutoGroupColDef(colDefForAutoCol, this.requestConfig.columns[0]),
                    pinned: ColumnConstants.PINS.LEFT
                } as ColDef;
            }
        }
    }

    /**
     * Creates the Aux-Inline-Menu data for Action Column
     */
    public getActionColMenuOptions = (params: GetContextMenuItemsParams): AuxActionCellRendererParams => {
        const actionColMenuOptions = this.getContextMenuItems(params, false);
        const options = ColumnUtils.createActionColMenu(actionColMenuOptions);
        return {
            inlineMenuData: options,
            inlineMenuItemClicked: (event: any) => {
                if (event?.detail?.element?.eventData?.action && typeof event.detail.element.eventData.action === 'function') {
                    event.detail.element.eventData.action();
                }
            }
        };
    };

    onFirstDataRendered = (params: FirstDataRenderedEvent) => {
        if (!this.shouldSizeColumnsToFit && this.columnState) {
            // If the columns.length is 0, it means the widget is newly added.
            // Then we want to autoSize all columns.
            if (!this.columnState.columns.length) {
                // Giving enough time for agGrid to have the data before calling autoSizeAllColumns.
                setTimeout(() => {
                    // flag to indicate that the column state is being updated by the first render autosizing, need this to avoid false positives in favorite change detection
                    this.isFirstRenderAutosize = true;
                    this.gridApiHandle.autoSizeAllColumns();
                    // after the columns are autosized for the first time, we want to update widget.displayInputs.
                    this.updateColumnState(params);
                }, 200);
            } else {
                // While all ExploreNew favorite have width saved, ExploreOld favorite can have some width undefined.
                // AutoSizing those undefined widths.
                this.autoSizeUndefinedWidths(params);
            }
        }
        if (this.isActionColumnNeeded) {
            this.moveActionColumnToFirst();
        }
    };

    autoSizeUndefinedWidths(params: FirstDataRenderedEvent): void {
        const columnIdsToAutoSize = [];
        let updateFirstColumn = false;
        for (let i = 0; i < this.columnState.columns.length; i++) {
            if (!this.columnState.columns[i].width) {
                if (i === 0) {
                    columnIdsToAutoSize.push(ColumnConstants.AGGRID_AUTO_COLUMN);
                    updateFirstColumn = true;
                } else {
                    columnIdsToAutoSize.push(this.columnState.columns[i].columnKey);
                }
            }
        }
        // Giving enough time for agGrid to have the data before updating columns.
        setTimeout(() => {
            if (columnIdsToAutoSize.length) {
                // flag to indicate that the column state is being updated by the first render autosizing, need this to avoid false positives in favorite change detection
                this.isFirstRenderAutosize = true;
                this.gridApiHandle.autoSizeColumns(columnIdsToAutoSize);
            }
            this.updateColumnState(params, updateFirstColumn);
        }, 200);
    }

    /**
     * When rendering the grid, ag-grid will move the grouping column to the first position.
     * In order to have the action column be first, we need to manually set it there after the grid as rendered.
     */
    private moveActionColumnToFirst(): void {
        this.gridApiHandle.moveColumns([ColumnConstants.ACTION_COL], 0);
    }

    protected gridReady = (params: GridReadyEvent) => {
        this.gridApiHandle = params.api;

        // initializing column order
        this.initialColOrder = this.gridApiHandle.getAllGridColumns().map(col => col.getColId());

        // do sorting if applies, when widget is initialized for the first time
        this.setSortedColumns(params);

        this.setServerSideDataSourceSubject$
            .pipe(
                takeUntil(this.ngUnsubscribe),
                filter(cube => !isNil(cube))
            ).subscribe(cube => {
            const qbstrServerSideParams: QbstrServerSideParams<any> = {
                dataCube: cube,
                gridApi: this.gridApiHandle,
                shouldReformat: this.shouldReformat,
                expandedState: this.expandedState,
                onRowExpand$: this.onRowGroupOpenedSubject$,
                rowDataPopulated$: this.rowDataPopulated$,
                onGetRowsCallback: (loadedRowIds: string[]) => this.rowsLoaded$.next(loadedRowIds),
                suppressRootNode: this.suppressRootNode
            };
            if (this.isActionColumnNeeded) {
                qbstrServerSideParams.actionCol = this.getActionColMenuOptions;
            }
            this.gridApiHandle.updateGridOptions({serverSideDatasource: new QbstrExploreServerSideDataSource(qbstrServerSideParams)});

            setTimeout(() => this.gridApiHandle.setFilterModel(!isNil(this.compositionConfig) ? this.compositionConfig.colFilters : this.requestConfig.columnFilters));

            if (this.shouldSizeColumnsToFit) {
                setTimeout(() => {
                    this.gridApiHandle.sizeColumnsToFit();
                });
            }
        });

        this.setColDefSubject$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(colDefs => {
                params.context[CommonConstants.INITIAL_SCALING_INFO] = {}; // reset field when data reloads
                this.gridApiHandle.updateGridOptions({columnDefs: []}); // workaround due to ag-grid mutating the column name.
                if (this.requestConfig && !isEmpty(this.requestConfig.columns)) {
                    const colZero = colDefs.find(colDef => colDef.field === this.requestConfig.columns[0].columnKey);
                    // in few cases column zero could be undefined, but to handle this situation gracefully we are doing Nil check
                    if (!isNil(colZero)) {
                        const pinnedState = colZero && colZero.pinned === null ? ColumnConstants.PINS.NO_PIN : colZero.pinned;
                        const autoGroupColumnDef = {
                            ...this.createBaseAutoGroupColDef(colZero, this.requestConfig.columns[0]),
                            // setting the pin to left unless user modifies it to something else
                            pinned: pinnedState ? pinnedState : ColumnConstants.PINS.LEFT
                        } as ColDef;
                        this.gridApiHandle.updateGridOptions({autoGroupColumnDef});
                    }
                }
                this.gridApiHandle.updateGridOptions({columnDefs: colDefs});
                // preserve the sorting in case of reloading of widget as well
                this.setSortedColumns(params);
                setTimeout(() => this.initialColOrder = this.gridApiHandle.getAllGridColumns().map(col => col.getColId()));
            });
    };

    private createBaseAutoGroupColDef(colDef: ColDef, column: VizualizationColumnConfig): ColDef {
        return {
            headerValueGetter: () => this.headerValueGetter(colDef, column),
            ...(colDef['colTag'] ? {colTag: colDef['colTag']} : {}), // for autoCol colTag is not defined
            ...(!this.widget ? {cellClass: colDef.cellClass} : {}), // for composition tables, widget is not defined
            field: colDef.field,
            width: colDef.width,
            type: colDef.type,
            filter: colDef.filter,
            filterParams: {
                maxNumConditions: 1,
                suppressAndOrCondition: true
            },
            cellClass: 'auto-column-align',
            cellStyle: colDef.cellStyle = (params) => this.autoGroupCellStyleGetter(params, colDef),
        };
    }

    headerValueGetter = (colDef: ColDef, column: VizualizationColumnConfig) => {
        if (!isNil(colDef.headerValueGetter) && column.formatter instanceof NumericDataFormatter) {
            return getColumnHeaderNameWithScaling(column.columnTitle, column.formatter);
        } else {
            return column.columnTitle || colDef.headerName;
        }
    };

    autoGroupCellStyleGetter = (params, colDef) => {
        const backgroundColor = params.data?.bgColorMap?.[colDef.field];
        const color = params.data?.fgColorMap?.[colDef.field];
        const style = {} as any;
        if (color) {
            style.color = color;
        }
        if (backgroundColor) {
            style.backgroundColor = backgroundColor;
        }
        return style;
    }

    /**
     * Called when a user selects a range of cells
     */
    protected onRangeSelectionChanged = (event: RangeSelectionChangedEvent) => {
        // When clicking an action button, it causes an accidental range selection.  In order to prevent this, clear the
        // range selection when it is initiated from the action column.
        if (event.api.getCellRanges().find((range: CellRange) => range.startColumn.getColId() === ColumnConstants.ACTION_COL)) {
            event.api.clearRangeSelection();
        }
    }

    /**
     * filter change event handler
     */
    protected onFilterChanged = (event: FilterChangedEvent) => {
        const filters: FilterModel = event.api.getFilterModel();
        if (this.widgetColumns) {
            this.widgetColumns.updateColumnFiltersFromGrid(filters, this.gridApiHandle.getColumn(ColumnConstants.AUTO_GRP_COLUMN).getColDef().field);
            this.trackColumnFilterViaTelemetry(this.isBatchExport ? BatchExportingStore.getCurrentReport() : WorkspaceStore.getCurrentReport());
        } else if (this.compositionConfig) {
            this.compositionConfig.colFilters = filters;
        }
    };

    private trackColumnFilterViaTelemetry(currentReport: Report) {
        this.widgetColumns.columns.filter(x => x.columnFilters).forEach(x => {
            const colKey = x.columnKey;
            const colTag = x.columnTag;
            const colFilterData = x.columnFilters.columnFilters[colKey];

            if (colFilterData) {
                const columnTrackingParameters = new ColumnFilteringParameters(colTag, this.widget.configType.toString(),
                    colFilterData['type'], colFilterData['filter'], currentReport.title, currentReport.id, currentReport.owner);
                TelemetryService.track(TelemetryActionConstants.COLUMN.COLUMN_FILTER, columnTrackingParameters);
            }
        });
    }

    /**
     * on row clicked event handler
     */
    protected onRowClicked = (event: RowClickedEvent) => {
        // If ctrl or shift key haven't pressed i.e(normal click) then only clear selection
        if (!(event.event as MouseEvent).ctrlKey && !(event.event as MouseEvent).shiftKey) {
            event.api.deselectAll();
        }
        // If row is selected set setSelected=> true
        event.node.setSelected(true);
    };

    /**
     * on cell clicked event handler
     */
    protected onCellClicked = (_event: CellClickedEvent) => {
        if (this) {
            this.cellClicked.emit();
        }
    };

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
        const sortedColumns = this.widget?.dataStore?.metaData?.inputs?.get(ColumnConstants.SORTED_COLUMNS) as SortedColumns;

        if (sortedColumns) {
            setSortedColumnsInGrid(this.widget, params);
            return;
        }
        if (this.sortModels?.length) {
            const updatedColumnState = getUpdatedColumnState(this.gridApiHandle.getColumnState(), this.sortModels);
            this.gridApiHandle.applyColumnState({state: updatedColumnState});
        }
    }

    protected getRowId = (params: GetRowIdParams): string => params.data[ROW_ID_COLUMN_NAME].toString();

    protected onColumnMoved = (event: ColumnMovedEvent) => {
        if (!event.column) {
            return;
        }

        this.draggedColumn = event.column.getColId();
        // TODO: this should be using the possible column group function from table.utils
    };

    /**
     * On column resized
     */
    protected onColumnResized = (event: ColumnResizedEvent) => {
        this.columnResized$.next(event);
    };

    /* Finds all the collapsed columns when a performance details spritelet widget is first opened. */
    findCollapsedColumns(): void {
        const collapsedColumns = this.widget?.getCombinedInputs().get(WidgetInputType.COLLAPSED_COLUMNS) as CollapsedColumns;
        if (!collapsedColumns) {
            return;
        }
        const colDefs = this.config.columnDefs;
        colDefs.forEach((colDef) => {
            const groupChildColumns = colDef['children'];
            if (!groupChildColumns) {
                return;
            }
            // Process each child column to find collapsed columns
            groupChildColumns.forEach((child) => {
                if (child.columnGroupShow === 'open') {
                    collapsedColumns.collapsedColumns.add(child.colTag);
                }
            });
        });
    }

    /**
     * On column group opened
     */
    onColumnGroupOpened = (event: ColumnGroupOpenedEvent): void => {
        const collapsedColumns = this.widget.getCombinedInputs().get(WidgetInputType.COLLAPSED_COLUMNS) as CollapsedColumns;
        if (!collapsedColumns) {
            return;
        }
        this.updateCollapsedCols(event, collapsedColumns);
    };

    /** helper method for onColumnGroupOpened */
    updateCollapsedCols(event: ColumnGroupOpenedEvent, collapsedColumns: CollapsedColumns): void {
        const groupChildColumns = event.columnGroup.getColGroupDef()['children'];
        if (!groupChildColumns) {
            return;
        }

        // Process each child column to add collapsed columns
        groupChildColumns.forEach((child) => {
            if (child.columnGroupShow === 'open') {
                if (event.columnGroup.isExpanded()) {
                    collapsedColumns.collapsedColumns.delete(child['colTag']);
                } else {
                    collapsedColumns.collapsedColumns.add(child['colTag']);
                }
            }
        });
    }

    /**
     * cell key down event handler
     */
    protected onCellKeyDown = (event: CellKeyDownEvent) => {
        cellKeyDownHandler(event, this.widget, this.requestConfig);
        this.shouldReformat = true;
    };

    /**
     * drag stopped event handler
     */
    protected onDragStopped = () => {
        // guard check for composition table
        if (!this.widget) {
            return;
        }

        if (this.draggedColumn && this.draggedColumn.indexOf('|') !== -1) {
            this.gridApiHandle.moveColumns([this.draggedColumn], this.initialColOrder.indexOf(this.draggedColumn));
        }
        const finalColOrder = uniq(this.gridApiHandle.getAllDisplayedColumns().map(col => col.getColDef().field.split('|')[0]));

        // Save the order of the generated columns for Expost Stats Widget
        if (this.widget.configType === WidgetConfigType.EXPOST_STATS) {
            this.widget.dataStore.metaData.inputs.set(ExpostSortedColumns.configType, new ExpostSortedColumns({expostSortedColumns: finalColOrder}));
            return;
        }

        setTimeout(() => this.initialColOrder = this.gridApiHandle.getAllGridColumns().map(col => col.getColId()));
    };

    /**
     * Update column state model
     */
    protected updateColumnState = (event: ColumnPinnedEvent | ColumnResizedEvent | FirstDataRenderedEvent, updateFirstColumn?: boolean): void => {
        const agGridColumnState = this.gridApiHandle.getColumnState();
        this.syncFirstAndAutoColumn(event, agGridColumnState, updateFirstColumn);

        if (this.compositionConfig) {
            this.compositionConfig.columnState = new ColumnState({columns: agGridColumnState});
        }

        // now create Column State model with the data and update displayInputs
        const colState = new ColumnState({columns: agGridColumnState});

        // we only want to show the ColumnState as modified to a user if they explicitly resized or pinned a column
        // do not include autosize that grid calls when initially rendered as a change
        if (event.type === 'columnPinned' || (event.type === 'columnResized' && !this.isFirstRenderAutosize)) {
            colState.changeState = ConfigState.MODIFIED;
        } else if (event.type === 'columnResized' && this.isFirstRenderAutosize) {
            // clear flag after updating column state for first render autosize event
            this.isFirstRenderAutosize = false;
        }
        const columnSet = this.widget.getCombinedInputs().get(WidgetInputType.COLUMNS) as ColumnSet;
        const isColumnStatePresentAsInput = this.widget.getCombinedInputs().get(ColumnState.CONFIG_TYPE) as ColumnState;
        if (isColumnStatePresentAsInput) {
            this.widget.displayInputs.set(ColumnState.CONFIG_TYPE, colState);
        } else if (columnSet) {
            if (columnSet.columnState) {
                colState.mergeColumnState(columnSet.columnState);
            }
            columnSet.columnState = colState;
        }
    };

    /**
     * Sync up the first column and auto column manually if different
     */
    protected syncFirstAndAutoColumn(event: ColumnPinnedEvent | ColumnResizedEvent | FirstDataRenderedEvent, agGridColumnState: any, updateFirstColumn?: boolean) {
        // First column is the column that we use for auto column
        const firstColumn = agGridColumnState.find(column => column.colId === this.requestConfig.columns[0].columnKey);
        const autoColumn = agGridColumnState.find(column => column.colId === ColumnConstants.AUTO_GRP_COLUMN);

        if (firstColumn && autoColumn && (firstColumn.width !== autoColumn.width || firstColumn.pinned !== autoColumn.pinned)) {
            if (updateFirstColumn) {
                // If auto column is resized by user, then we want to update the first column width so the width can be updated in the columnState model properly.
                firstColumn.width = autoColumn.width;
                firstColumn.pinned = autoColumn.pinned;
            }
        }
    }

    /**
     * On destroy implementation
     */
    protected onDestroy() {
        // Destroy AgGrid Object
        if (this.gridApiHandle && !this.gridApiHandle.isDestroyed()) {
            this.gridApiHandle.destroy();
        }
    }

    private createAuxGridOptions(colDefs: ColDef[]): AuxGridOptions {
        return {
            context: {
                isFutureRowExpanded: () => this.isFutureRowExpanded
            },
            onGridReady: this.gridReady,
            onFirstDataRendered: this.onFirstDataRendered,
            onFilterChanged: this.onFilterChanged,
            rowModelType: 'serverSide',
            cacheBlockSize: TabularWidgetConstants.AG_GRID_BLOCK_SIZE,
            columnDefs: colDefs,
            rowSelection: 'multiple',
            suppressRowDeselection: true,
            enableRangeSelection: true,
            suppressAggFuncInHeader: true,
            animateRows: false,
            onSortChanged: this.onSortChanged,
            onRowGroupOpened: (event: RowGroupOpenedEvent) => {
                this.onRowGroupOpenedSubject$.next(event);
            },
            onColumnGroupOpened: this.onColumnGroupOpened,
            onRowClicked: this.onRowClicked,
            getRowId: this.getRowId, // v27.1 onwards getRowNodeId is deprecated
            onCellClicked: this.onCellClicked,
            onColumnMoved: this.onColumnMoved,
            onColumnResized: this.onColumnResized,
            onColumnPinned: this.updateColumnState,
            suppressCopyRowsToClipboard: true,
            ...(this.widget ? {onCellKeyDown: this.onCellKeyDown} : {}),
            suppressGroupRowsSticky: true,
            onDragStopped: this.onDragStopped,
            enableGroupEdit: true,
            singleClickEdit: true,
            suppressFieldDotNotation: true,
            defaultColDef: {
                floatingFilter: false,
                suppressKeyboardEvent: this.preventDefaultForCtrlDAndS
            },
            processCellForClipboard: ExportUtils.processCellForExport,
            serverSideSortAllLevels: true,
            isServerSideGroupOpenByDefault: (params: IsServerSideGroupOpenByDefaultParams) => params.context.isFutureRowExpanded(params),
            onRangeSelectionChanged: this.onRangeSelectionChanged
        };
    }

    /**
     * prevent browser default on ctrl S and ctrl D (After ag-grid updates used in suppressKeyboardEvent)
     * This will return true if we find specific shortcuts
     */
    preventDefaultForCtrlDAndS(params): boolean {
        if (params.event.ctrlKey && (params.event.key === TabularWidgetConstants.SHORTCUTS.D_SHORTCUT || params.event.key === TabularWidgetConstants.SHORTCUTS.S_SHORTCUT)) {
            params.event.preventDefault();
            return true;
        }
    }
}
