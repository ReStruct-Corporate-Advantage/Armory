import {
    ColDef,
    Column,
    GetContextMenuItemsParams,
    GridApi,
    IRowNode,
    IServerSideDatasource,
    IServerSideGetRowsParams,
    RowGroupOpenedEvent,
    RowNode
} from 'ag-grid-community';
import {DEFAULT_QUERY_KEY, FilterIncludeKey, QueryKey, SortType, streamOf} from '@qbstr/data-cube';
import {createQK, filterCkes} from '@qbstr/ag-grid';
import {Observable, Subject, Subscription} from 'rxjs';
import {ReactiveCubeCrud} from '@qbstr/data-cube-reactive';
import {first, map} from 'rxjs/operators';
import {HashMap} from '@qbstr/hash-map';
import {isEmpty, isEqual, isNil, isNumber, pick, uniqWith} from 'lodash';
import {ROW_ID_COLUMN_NAME} from '@utils/qbstr/qbstr.adapter';
import {ExpandedState} from '@models/widget/inputs/expanded-state.model';
import {getSortedData, ROOT_LEVEL} from '@utils/qbstr/qbstr.utils';
import {GridSortModel} from '@interfaces/sort-model.interface';
import {TreeCube} from '@utils/qbstr/tree-cube';
import {ColumnConstants} from '@blk/explore-ui-core';
import {AuxActionCellRendererParams} from '@blk/aladdin-angular-components';

export interface QbstrServerSideParams<T> {
    dataCube: ReactiveCubeCrud<T>;
    gridApi: GridApi;
    expandedState?: ExpandedState;
    shouldReformat: boolean;
    localFiltering?: boolean;
    localSorting?: boolean;
    onRowExpand$?: Observable<RowGroupOpenedEvent>;
    onGetRowsCallback?: (loadedRowIds: string[]) => void;
    rowDataPopulated$?: Subject<string>;
    suppressRootNode?: boolean;
    actionCol?: (params: GetContextMenuItemsParams) => AuxActionCellRendererParams;
}

const defaultOptionalQbstrParams: QbstrServerSideParams<any> = {
    dataCube: undefined,
    gridApi: undefined,
    shouldReformat: true,
    localFiltering: true,
    localSorting: true,
    onRowExpand$: undefined
};

export class QbstrExploreServerSideDataSource<T> implements IServerSideDatasource {
    private readonly updatesQueryMap: HashMap<QueryKey, Subscription>;
    private readonly qssp: QbstrServerSideParams<T>;
    private formattedData;

    constructor(private qbstrServerSideParams: QbstrServerSideParams<T>) {
        this.updatesQueryMap = new HashMap<QueryKey, Subscription>();
        this.qssp = {...defaultOptionalQbstrParams, ...qbstrServerSideParams};
        this.init();
    }

    init() {
        if (this.qssp.onRowExpand$) {
            this.qssp.onRowExpand$.subscribe(event => this.onNodeExpanded(event.node));
        }
    }

    /**
     * GetRows is called internally from AgGrid to resolve a 'backendAggregationRequest' in this case we use
     * the requestParameters to generate the correct path for the cube and fetch data from it. We also automate
     * things like  filtering, updating data, expanding etc. More features will live here e.g. sorting
     *
     */
    getRows(params: IServerSideGetRowsParams): void {
        let ck: QueryKey = createQK(params, false, false, false);
        // Adding FilterIncludeKey to ck so that key corresponds to all the values that have the ROOT_LEVEL
        // as the portfolio name. All the rows corresponding to this key will be returned to aggrid.
        ck = !this.qssp.suppressRootNode ? ck :
            new QueryKey([...ck.queryKeyEntries, new FilterIncludeKey(ROOT_LEVEL,
                [(this.qssp.dataCube.store?.getState().data[DEFAULT_QUERY_KEY.hashId] as any[])[0][ROOT_LEVEL]])]);
        const data$: Observable<any[]> =
            ck.isEqual(DEFAULT_QUERY_KEY) || this.qssp.dataCube.has(ck)
                ? this.qssp.dataCube.get(ck)
                : this.qssp.dataCube
                    .stream()
                    .compute(ck)
                    .toList();

        data$.pipe(
            first(),
            map(data => this.filterData(data, params, ck)),
            map(data => this.sortData(data, params))
        ).subscribe(data => {
            const requestedRows = data.slice(params.request.startRow, params.request.endRow);
            params.success({rowData: requestedRows, rowCount: this.getLastRowIndex(params.request, requestedRows)});

            if (this.qssp.onGetRowsCallback) {
                this.qssp.onGetRowsCallback(requestedRows.map(row => row.rowId.toString()));
            }

            // Trigger rowDataPopulated$ event with the parentId when the data is populated.
            // This is based on the assumption that all other node data in the same requestedRows are also populated if the first one is.
            const firstRowID = requestedRows[0]?.[ROW_ID_COLUMN_NAME]?.toString();
            if (firstRowID) {
                const firstChildNode = params.api.getRowNode(firstRowID);
                if (firstChildNode?.data?.hasChildNodes) {
                    const parentId = params.api.getRowNode(firstRowID).parent.id;
                    this.qssp.rowDataPopulated$?.next(parentId);
                }
            }

            requestedRows.forEach(row => {
                const node = params.api.getRowNode(row[ROW_ID_COLUMN_NAME]?.toString());

                if (node?.data) {
                    if (!isNil(node.data.hasChildNodes)) {
                        node.group = node.data.hasChildNodes;
                    } else {
                        // the auto group col def mapped key should exist only for leaf nodes as
                        // we are removing the key in case of sector nodes (have children) in qbstr adapter
                        const autoColDef = params.api.getColumnDef(ColumnConstants.AUTO_GRP_COLUMN);
                        if (autoColDef && Object.keys(node.data).indexOf(autoColDef.field) !== -1) {
                            node.group = false;
                        }
                    }

                    // BUG 860304: leaf nodes is shown as group nodes.
                    // This looks like a bug from the ag-grid side after version upgrade (23.2.1 => 26.1.0).
                    // ag-grid introduced property called __hasChildren under RowNode, and the value of this isn't always correct.
                    // updateHasChildren() is to update the proper value manually.
                    (node as RowNode).updateHasChildren();
                }

                if (this.shouldExpand(node)) {
                    node.setExpanded(true);
                }

                this.setActionColData(params.api, node, params.context, params.api.getColumn(ColumnConstants.ACTION_COL));
            });
        });
    }

    /**
     * This will set the action column - aux inline menu options same as context menu
     * for Factor Based Analysis widget only
     * @param api Grid Api
     * @param node RowNode
     * @param context Context
     * @param column Column
     */
    setActionColData(api: GridApi, node: IRowNode, context: any, column: Column): void {
        const rowData = node.data;
        if (!isNil(rowData) && !isNil(this.qssp.actionCol)) {
            // HACK: when creating the context menu (right click) it requires GetContextMenuItemsParams.  Since we need
            // to initialize the action button menu outside right click, we must construct our own GetContextMenuItemsParams
            const actionColumnGetContextMenuItemsParams: GetContextMenuItemsParams = { api, node, context, column, defaultItems: undefined, value: null};
            rowData[ColumnConstants.ACTION_COL] = this.qssp.actionCol(actionColumnGetContextMenuItemsParams);
            node.setData(rowData);
        }
    }

    getLastRowIndex(request, results) {
        if (!results) {
            return undefined;
        }
        const currentLastRow = request.startRow + results.length;
        // if on or after the last block, work out the last row, otherwise return 'undefined'
        return currentLastRow < request.endRow ? currentLastRow : undefined;
    }

    /**
     * We remap date strings to data objects so that they can be compared correctly and we
     * format the underlying values to the ones shown on the grid so the user actions can match
     * the underlying data for filtering
     *
     * `shouldReformat` changes only whenever we reformat a column this makes sure no unnecessary
     * formatting is happening.
     */
    formatValues = (data: any[], params: IServerSideGetRowsParams) => {
        if (this.qssp.shouldReformat) {
            this.formattedData = data.map(row => {
                const newRow = {...row};
                // taking colDef for just columns since we have value formatter for all colDef, rowGroup can be a distinguishing factor
                params.api.getAllGridColumns().map(col => col.getColDef()).filter(colDef => colDef.valueFormatter && !colDef.rowGroup).forEach((colDef: ColDef) => {
                    if (colDef.type === 'auxDateColumn') {
                        newRow[colDef.field] = newRow[colDef.field] ? new Date(newRow[colDef.field]) : undefined;
                        return;
                    }
                    newRow[colDef.field] = this.getFormattedValue(row, colDef);
                });
                return newRow;
            });
            this.qssp.shouldReformat = false;
        }
        return this.formattedData;
    }

    private getFormattedValue(row: any, colDef: ColDef): any {
        let formattedValue = (colDef.valueFormatter as any)({value: row[colDef.field]});
        if (colDef.type === 'auxNumberColumn') {
            const numericValue = Number(String(formattedValue).replace(/,/g, '').replace(/%/g, ''));
            formattedValue = isNaN(numericValue) ? undefined : numericValue;
        }
        return formattedValue;
    }

    /**
     * after we reFormat and filter the data we want to send it back in the original format
     * that is why we use the rowIds to filter from the original data set
     */
    filterRawData = (data: any[], params: IServerSideGetRowsParams) => {
        const reFormattedFilterIds = streamOf(this.formatValues(data, params))
            .configure({shouldLowerCaseStringFilters: true})
            .filterQK(filterCkes(params.request.filterModel, [], false))
            .toList().map(row => row[ROW_ID_COLUMN_NAME]);
        return data.filter(row => reFormattedFilterIds.includes(row[ROW_ID_COLUMN_NAME]));
    }

    /**
     * This is a custom filter implementation that will stay Explore specific.
     *
     *
     * @param data the data retrieved from the cube based on the QueryKey 'ck'
     * @param params the ag grid server side parameters
     * @param ck QueryKey that points to the data in the cube.
     */
    filterData = (data: any[], params: IServerSideGetRowsParams, ck: QueryKey): any[] => {
        const shouldFilter = this.qssp.localFiltering
            && !isEmpty(params.request.filterModel);

        if (shouldFilter) {
            // If the key is for a group level then we need to do more specific filtering
            this.getMappedFieldForAutoGrpCol(params.api, params.request.filterModel);
            const filterFields = Object.keys(params.request.filterModel);
            const ckeFields: string[] = [...ck.groupKeys().map(key => key.field), ...ck.aggregationKeys().map(key => key.field)];

            // if not all of the fields from the FilterModel are present in the QueryKey then we do a more complicated filter
            if (ck.groupKeys().length > 0) {

                const refinedFilterModel = pick(params.request.filterModel, filterFields.filter(field => ckeFields.includes(field)));
                const remainingFilterModel = pick(params.request.filterModel, filterFields.filter(field => !ckeFields.includes(field)));

                // When we have created the cube we have created a key that points to all the Leaf level data -> DEFAULT_QUERY_KEY
                // This allows us to filter the underlying nodes and then group on the same key as the current level to see which of
                // the current level nodes must remain in the filter.
                // Then we end up with a small list of levels that we know must be kept and we filter the incoming data based on those fields.
                // Because we are using the same underlying rows we are not duplicating data. The whole filter is O(n + log(n))
                let leafNodes: any[];
                if (this.qssp.dataCube instanceof TreeCube) {
                    leafNodes = this.qssp.dataCube.getLeafNodes();
                } else {
                    const state = this.qssp.dataCube.store.getState();
                    leafNodes = state.data[DEFAULT_QUERY_KEY.hashId] as any[];
                }

                const formattedData = this.formatValues(Object.values(leafNodes), params);
                const leafData = streamOf(formattedData)
                    .configure({shouldLowerCaseStringFilters: true})
                    .filterQK(filterCkes({...remainingFilterModel, ...refinedFilterModel}, ck.filterKeys(), false))
                    .groupByQK(ck.groupKeys())
                    .toList();
                const groupKeys = Object.keys(leafData[0]);
                let filteredDataForGroupKeys = data.filter(row => leafData && leafData.length > 0 && groupKeys.filter(key => key !== 'undefined').includes(row[ck.groupKeys()[0].field] + ''));
                if (groupKeys.includes('undefined')) {
                    filteredDataForGroupKeys = [...filteredDataForGroupKeys, ...this.filterRawData(data, params)];
                }
                return filteredDataForGroupKeys;

            } else {
                // if all filter columns from the filterModel are present in the QueryKey then we do a regular filter
                return this.filterRawData(data, params);
            }
        }
        return data;
    }

    sortData = (data: any[], params: IServerSideGetRowsParams): any[] => {
        if (this.qssp.localSorting && !isEmpty(params.request.sortModel)) {
            const column = this.qssp.gridApi.getColumn(ColumnConstants.AUTO_GRP_COLUMN);
            const autoGrpColDef: ColDef & {colTag: string} = column ? column.getColDef() as ColDef & {colTag: string} : undefined;
            const rowGrpColIds: string[] = this.qssp.gridApi.getRowGroupColumns().map(rowGrpCol => rowGrpCol.getColId());
            const colDefsForDisplayedColumns: (ColDef & {colTag: string})[] = this.qssp.gridApi.getAllDisplayedColumns().map(col => col.getColDef()) as (ColDef & {colTag: string})[];
            // we require colTag to pick the correct column definition and get the data type of column
            const sortModelWithColTags: GridSortModel[] = uniqWith(params.request.sortModel.map(eachModel => {
                const matchingColDef: ColDef & {colTag: string} = colDefsForDisplayedColumns.find(def => def.field === eachModel.colId);
                return {
                    sort: eachModel.sort,
                    colId: matchingColDef ? eachModel.colId : autoGrpColDef.field,
                    colTag: matchingColDef ? matchingColDef.colTag : autoGrpColDef.colTag,
                    origColId: eachModel.colId
                };
            }), (firstSortModel, secondSortModel) => firstSortModel.sort === secondSortModel.sort && firstSortModel.colId === secondSortModel.colId && firstSortModel.colTag === secondSortModel.colTag);

            // if we are sorting autoGroupColDef then we are passing params.request.sortModel in sortedSectorData else we pass updated values from sortModelWithColTags
            const pickSortModel = autoGrpColDef
                ? sortModelWithColTags.some(sortModel => sortModel.colTag === autoGrpColDef.colTag) && isEqual(params.request.sortModel.map(sortRule => sortRule.colId), rowGrpColIds)
                    ? params.request.sortModel
                    : sortModelWithColTags
                : sortModelWithColTags;

            // condition would be true if we are sorting on auto group column
            // we want to sort here based on either sectorOrder or the value (leaf node)
            if (pickSortModel === params.request.sortModel && isEqual(params.request.sortModel.map(model => model.colId), rowGrpColIds)) {
                // sort leaf data first at current level
                const sortedLeafData: any[] = getSortedData(data.filter(rec => !isNumber(rec.sectorOrder)), autoGrpColDef ? autoGrpColDef : undefined, rowGrpColIds, sortModelWithColTags);
                // sort sector data then at current level
                const sortedSectorData: any[] = getSortedData(data.filter(rec => isNumber(rec.sectorOrder)), autoGrpColDef ? autoGrpColDef : undefined, rowGrpColIds,
                    pickSortModel.map(model => {
                        return {origColId: model.colId, ...model};
                    })
                );
                return params.request.sortModel[params.request.sortModel.length - 1][ColumnConstants.SORT_MODEL_KEY].toUpperCase() === SortType.DESC
                    ? [...sortedLeafData, ...sortedSectorData]
                    : [...sortedSectorData, ...sortedLeafData];
            }

            // sort columns other than the auto group column
            // we want to sort in this case only on the values
            return getSortedData(data, autoGrpColDef ? autoGrpColDef : undefined, rowGrpColIds,
                pickSortModel.map(model => {
                    return {origColId: model.colId, ...model};
                }), this.qssp.gridApi.getAllDisplayedColumns()
            );
        }

        return data;
    }

    shouldExpand(node): boolean {
        if (node && node.data && node.isExpandable() && this.qssp.expandedState) {
            const keyPath = this.getNodeKey(node);
            return this.qssp.expandedState.isExpanded(keyPath);
        }
        return false;
    }

    /**
     * Gets the key for the node.
     */
    getNodeKey(node: IRowNode): string[] {
        const key = this.qssp.gridApi.getRowGroupColumns()
            .map(rgc => {
                const nodeKey: string = node.data[rgc.getColDef().field]?.toString();
                const rowNode = this.qssp.gridApi.getRowNode(nodeKey);
                // Return the _ROOT_ field of the node if rowNode is not available
                return rowNode?.data?.title || nodeKey;
            })
            .filter(row => row);

        // The first node here contains the portfolio name, we need to modify it to have the generic value.
        if (key.length > 0) {
            key[0] = ExpandedState.ROOT_NODE_KEY;
        }
        return key;
    }

    /**
     * Checks if the node is expanded.  To do this we need to ensure that none of the parent nodes are set to be not expanded.
     */
    isNodeExpanded(node: IRowNode): boolean {
        while (node.level >= 0) {
            if (!node.isExpandable() || !node.expanded) {
                return false;
            }
            node = node.parent;
        }
        return true;
    }

    /**
     * Event handler for when a node is expanded/collapsed.
     */
    onNodeExpanded(node: IRowNode): void {
        if (!this.qssp.expandedState || !node.isExpandable()) {
            return;
        }

        // If the state has been set to all expanded and we are collapsing a node then we need to update the state
        // of all nodes to be expanded that are no longer expanded.
        if (this.qssp.expandedState.allExpanded && !node.expanded) {
            this.qssp.expandedState.allExpanded = false;
            this.qssp.expandedState.clearPaths();
            this.updateAllExpandedNodes();
            return;
        }

        // If all are expanded and we are expanding a node then just ignore it as it does nothing.
        if (this.qssp.expandedState.allExpanded && node.expanded) {
            return;
        }

        // Since the row data can be populated asynchronously the data may not always be there.
        // If not then just skip it.
        if (node.data) {
            const nodeKey = this.getNodeKey(node);
            this.qssp.expandedState.updateItem(nodeKey, node.expanded);
        }
    }

    /**
     * Goes through all the nodes in the table and if expanded updates the state.
     */
    updateAllExpandedNodes(): void {
        this.qssp.gridApi.forEachNode(node => {
            if (this.isNodeExpanded(node)) {
                const nodeKey = this.getNodeKey(node);
                this.qssp.expandedState.updateItem(nodeKey, node.expanded);
            }
        });
    }

    unsubscribe(): void {
        Array.from(this.updatesQueryMap.values()).forEach(sub => {
            sub.unsubscribe();
        });
    }

    destroy(): void {
        this.unsubscribe();
    }

    /**
     * replace auto-group-column key with the corresponding mapped field in the filter model
     */
    getMappedFieldForAutoGrpCol(api: GridApi, filterModel: any): void {
        if (Object.keys(filterModel).find(filterKey => filterKey === ColumnConstants.AUTO_GRP_COLUMN)) {
            filterModel[api.getColumn(ColumnConstants.AUTO_GRP_COLUMN).getColDef().field] = filterModel[ColumnConstants.AUTO_GRP_COLUMN];
            delete filterModel[ColumnConstants.AUTO_GRP_COLUMN];
        }
    }
}
