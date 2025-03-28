import {Component, Input, OnInit} from '@angular/core';
import {AuxButtonSizeEnum, AuxButtonTypeEnum, AuxSearchFieldClickSearchDetailInterface, AuxSearchFieldSearchValueChangedDetailInterface, AuxSearchSelectOptionsInterface, AuxSelectOption} from '@blk/aladdin-angular-components';
import {TreeCube} from '@utils/qbstr/tree-cube';
import {GridApi, IRowNode} from 'ag-grid-community';
import {SubscribableComponent, TelemetryActionConstants, TelemetryService, TelemetryWidgetSearchParameters} from '@blk/explore-ui-core';
import {takeUntil} from 'rxjs/operators';
import {WidgetSearchMatch} from '@interfaces/widget-search-match.interface';
import {BehaviorSubject, Observable} from 'rxjs';
import {TabularWidgetConstants} from '@constants/tabular-widget.constants';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {ColumnSet} from '@blk/explore-ui-column-option';

/**
 * This component adds search bar to table widgets
 * Requires that the widget uses TreeCube as its underlying data store structure
 *
 * @example
 * <app-table-search [gridApi]="gridApiHandle" [columnSet]="widgetColumns"
 *   [data]="(this.widget.dataStore.getData$() | async)"
 *   [rowsLoaded$]="rowsLoaded$.asObservable()"
 *   [isTableSearchActive$]="isTableSearchActive$">
 * </app-table-search>
 */
@Component({
    selector: 'app-table-search',
    templateUrl: './table-search.component.html',
    styleUrls: ['./table-search.component.scss']
})
export class TableSearchComponent extends SubscribableComponent implements OnInit {
    static readonly ALL_COLUMNS: string = 'All';
    readonly BUTTONS_WRAP_BREAKPOINT: number = 500;

    AuxButtonSizeEnum = AuxButtonSizeEnum;
    AuxButtonTypeEnum = AuxButtonTypeEnum;

    @Input() gridApi: GridApi;

    @Input() columnSet: ColumnSet;

    @Input() data: WidgetPayload;

    // callback that is called whenever ag-grid loads rows into the table via getRows
    @Input() rowsLoaded$: Observable<string[]>;

    @Input() isTableSearchActive$: BehaviorSubject<boolean>;

    selectBoxColumns: AuxSearchSelectOptionsInterface = {
        data: []
    };

    treeCube: TreeCube;

    columnSelected: string | null = null;
    searchTerm = '';
    isWrap = true;

    // flag to indicate if a user is stepping through search results
    isSearchInProgress = false;
    isNextEnabled = false;
    isPreviousEnabled = false;

    matches: WidgetSearchMatch[] = [];
    currentMatchIndex = 0;

    // path of rowId starting from _ROOT_ down to the current search match, used to traverse down the table and expand rows
    pathToMatch: string[] = [];

    constructor() {
        super();
    }

    ngOnInit() {
        // populates select box with the different columns that can be searched on
        const columnSelectOptions: AuxSelectOption[] = (this.columnSet || new ColumnSet()).columns.map(column => ({
            displayValue: column.columnTitle,
            value: column.columnKey
        }));
        this.selectBoxColumns.data = [{
            values: columnSelectOptions
        }];

        if (this.data.cube instanceof TreeCube) {
            this.treeCube = this.data.cube;
        } else {
            console.error('Table search is only supported on TreeCube data stores');
        }

        // listens for when new rows are loaded by ag-grid into the table
        this.rowsLoaded$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((loadedRowIds: string[]) => this.onTableRowsLoaded(loadedRowIds));
    }

    /**
     * Callback called after ag-grid has loaded additional rows via getRows()
     * This can be triggered when we are expanded a path to a search match where the data has not yet been loaded into the table.
     * If we receive the rowId we need, we continue iterating down the path to the search match
     * @param loadedRowIds  All the rowIds for the rows that were loaded in this getRows() call
     */
    private onTableRowsLoaded(loadedRowIds: string[]) {
        // done loading rows to show current result
        // this is likely triggered by a user scrolling
        if (this.pathToMatch.length === 0) {
            return;
        }

        // node has not rendered yet, stop and wait for rowsLoaded$ to be re-triggered
        const nextRowId = this.pathToMatch[0];
        if (!loadedRowIds.includes(nextRowId)) {
            console.warn(`Did not retrieve match for rowId: ${nextRowId}`);
        }

        this.traverseMatchPath();
    }

    /**
     * Called to expand the node (row) group in the path starting from the root down to the search match
     * @param node  Node is the current row group that should be brought into view and expanded
     */
    private showNextPathNode(node: IRowNode): void {
        // remove current node from path
        this.pathToMatch = this.pathToMatch.slice(1);

        // bring row into view and expand so that it triggers the grid to load the children of this row
        this.gridApi.ensureIndexVisible(node.rowIndex, 'top');
        if (node.isExpandable()) {
            node.setExpanded(true);
        }
    }

    /**
     * Called to select the node (row) that matches the search result and display in table
     * @param node  Node (row) that is to be selected
     */
    private selectMatchingNode(node: IRowNode): void {
        this.pathToMatch = [];

        // scroll to vertically to row in grid and select it
        this.gridApi.ensureIndexVisible(node.rowIndex, 'middle');
        node.setSelected(true, true);

        // scroll horizontally to column of match in grid
        const {columnKey} = this.getCurrentMatch();
        this.gridApi.ensureColumnVisible(columnKey);
    }

    /**
     * Toggles whether or not search results should wrap
     */
    toggleIsWrap() {
        this.isWrap = !this.isWrap;
        this.updateButtonStates();
    }

    /**
     * Clears any search results
     */
    private clearSearch() {
        this.isSearchInProgress = false;
        this.currentMatchIndex = 0;
        this.matches = [];

        this.pathToMatch = [];

        this.updateButtonStates();
    }

    /**
     * Called when user clicks "Close" button to close search
     */
    onCloseClicked() {
        this.clearSearch();
        this.isTableSearchActive$.next(false);
    }

    /**
     * Called when text in search box changes
     */
    onSearchValueChanged(event: CustomEvent<AuxSearchFieldSearchValueChangedDetailInterface>) {
        this.clearSearch();
        if (event.detail.type === 'selectionChanged') {
            const selectionValue = event.detail.submitValue.parameter.value;
            this.columnSelected = (selectionValue === TableSearchComponent.ALL_COLUMNS) ? null : selectionValue;
            this.clearSearch();
        }
        this.searchTerm = event.detail.submitValue.searchValue;
        event.stopPropagation();
    }

    /**
     * Called when user clicks search icon or presses enter while focused on search bar
     */
    onSearchClicked(event: CustomEvent<AuxSearchFieldClickSearchDetailInterface>) {
        event.stopPropagation();

        if (this.isSearchInProgress) {
            // same effect as clicking "Next" button
            this.showNextResult();
        } else {
            // kick off new search
            this.isSearchInProgress = true;
            // track Search
            this.trackWidgetSearchClickedViaTelemetry();

            const lowerCaseSearchTerm = this.searchTerm.toLowerCase();

            this.matches = this.treeCube.searchTree(lowerCaseSearchTerm, this.columnSelected);

            this.updateButtonStates();

            this.showMatchAtCurrentIndex();
        }
    }

    /**
     * trackWidgetSearchClickedViaTelemetry is invoked when search is Clicked on a widget table.
     * we store the widget_type, the column searched on, search text and if isWrap is enabled via telemetry
     */
    trackWidgetSearchClickedViaTelemetry() {
        if (this.data?.widgetConfigType && this.searchTerm) {
            const columnSelected = this.columnSelected ??  TableSearchComponent.ALL_COLUMNS;
            const widgetSearchParameter = new TelemetryWidgetSearchParameters(this.data.widgetConfigType, columnSelected,
                this.searchTerm.toLowerCase(), this.isWrap);
            TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.WIDGET_SEARCH,
                widgetSearchParameter);
        }
    }

    /**
     * Shows the next search match
     */
    showNextResult() {
        this.updateMatchIndex(SearchDirection.NEXT);
        this.showMatchAtCurrentIndex();
    }

    /**
     * SHows the previous search match
     */
    showPreviousResult() {
        this.updateMatchIndex(SearchDirection.PREVIOUS);
        this.showMatchAtCurrentIndex();
    }

    /**
     * Increments/decrements what search match the user is on
     */
    private updateMatchIndex(direction: SearchDirection) {
        let newIndex = (direction === SearchDirection.NEXT) ? (this.currentMatchIndex + 1) : (this.currentMatchIndex - 1);

        // wrap from beginning to end or end to beginning
        if (this.isWrap) {
            newIndex = (newIndex < 0) ? (this.matches.length - 1) : (newIndex % this.matches.length);
        }

        this.currentMatchIndex = newIndex;
        this.updateButtonStates();
    }

    /**
     * Shows the search match in the table at the current index.  Will expand the path in the table down to the matching node
     * and trigger ag-grid to begin loading groups/rows that are needed in the path
     */
    private showMatchAtCurrentIndex() {
        // check if index is within bounds of matches
        if (this.currentMatchIndex >= 0 && this.matches.length > this.currentMatchIndex) {

            const {rowId, path, isLeafNode} = this.getCurrentMatch();

            // HACK: since ag-grid loads data in blocks with size of AG_GRID_BLOCK_SIZE,
            // if the leaf node we want is not in the first block, we must trigger ag-grid to load additional blocks
            // NOTE: we are assuming there will never be a group with more than AG_GRID_BLOCK_SIZE child groups
            const additionalLeafBlocksToLoad = [];
            if (isLeafNode) {
                let lastRowIdInBlock = Number(path[path.length - 1]) + TabularWidgetConstants.AG_GRID_BLOCK_SIZE;
                while (lastRowIdInBlock < Number(rowId)) {
                    additionalLeafBlocksToLoad.push(lastRowIdInBlock);
                    lastRowIdInBlock += TabularWidgetConstants.AG_GRID_BLOCK_SIZE;
                }
            }
            this.pathToMatch = [...path, ...additionalLeafBlocksToLoad, rowId];

            // start at root and step through the path
            this.traverseMatchPath();
        } else if (this.matches.length === 0) {
            // no matches, end search
            this.isSearchInProgress = false;
        } else {
            // deselect all rows when user has gone through all the matches (and no wrap)
            this.gridApi.getSelectedRows().forEach((row: IRowNode) => {
                if (row.setSelected) {
                    row.setSelected(false);
                }
            });
        }
    }

    /**
     * Traverse the path from root node to the search match while path nodes are present in the table
     */
    private traverseMatchPath(): void {
        // iterate through the path until you get to a row that isn't loaded
        // when you reach a row that isn't loaded, ag-grid will automatically load the row and trigger this.rowsLoaded$ to continue the process
        const rowId: string = this.pathToMatch[0]?.toString();
        let node = this.gridApi.getRowNode(rowId);
        while (node) {
            if (this.pathToMatch.length === 1) {
                this.selectMatchingNode(node);
                break;
            } else {
                this.showNextPathNode(node);
                // pathToMatch has been updated, try to get next node
                const nextRowId: string = this.pathToMatch[0]?.toString();
                node = this.gridApi.getRowNode(nextRowId);
            }
        }
    }

    /**
     * Returns the search match at the current match index the user is on
     */
    private getCurrentMatch(): WidgetSearchMatch {
        return this.matches[this.currentMatchIndex];
    }

    private updateButtonStates(): void {
        // only enable the buttons if there are matches
        this.isNextEnabled = this.matches.length > 0;
        this.isPreviousEnabled = this.matches.length > 0;

        // at beginning of matches and wrap disabled
        if (!this.isWrap && this.currentMatchIndex <= 0) {
            this.isPreviousEnabled = false;
        }

        // at end of matches and wrap disabled
        if (!this.isWrap && this.currentMatchIndex >= this.matches.length - 1) {
            this.isNextEnabled = false;
        }
    }
}

enum SearchDirection {
    NEXT,
    PREVIOUS
}
