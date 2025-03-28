import {ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {CommonConstants} from '@constants/common.constants';
import {AuxGridColumnType, AuxGridOptions, AuxNumericStepperValueChangedDetailInterface, AuxSearchFieldSearchValueChangedDetailInterface, AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {get, isEmpty} from 'lodash';
import {ExploreColumnSearchService} from '@services/explore-column-search/explore-column-search.service';
import {debounceTime, map, takeUntil} from 'rxjs/operators';
import {ExploreSelectOption, ExploreSelectOptionGroup, SubscribableComponent, TelemetryActionConstants, TelemetrySemanticSearchParameters, TelemetryService, TelemetryUtil} from '@blk/explore-ui-core';
import {BehaviorSubject} from 'rxjs';
import {ColDef, GridApi, GridReadyEvent} from 'ag-grid-community';
import {ColumnSearchOptions} from '@enums/column-search-options.enum';

@Component({
  selector: 'app-semantic-search-modal',
  templateUrl: './semantic-search-modal.component.html',
  styleUrls: ['./semantic-search-modal.component.scss']
})
export class SemanticSearchModalComponent extends SubscribableComponent implements OnInit {

    readonly CLOSE_TEXT = CommonConstants.BUTTON_TEXT.CLOSE;
    // variables to control modal open/close event
    @Output() modalClosed = new EventEmitter<boolean>();
    @Input() isOpen: boolean;

    searchTermSubject$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    gridApi: GridApi;
    gridOptions: AuxGridOptions;
    searchString: string;
    searchBy = ColumnSearchOptions.SEMANTIC_SEARCH;
    widgetType = 'RE';
    rows = 500;
    categoryFilter: string;
    noOfColumns: number;
    timeTakenForSearch: number;
    searchTypeOptions: ExploreSelectOptionGroup[] = [];
    widgetTypeOptions: ExploreSelectOptionGroup[] = [];
    isLikeDislikeEnabled = false;

    /**
     * Constructor
     */
    constructor(private columnSearchService: ExploreColumnSearchService, private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    /**
     * OnInit hook
     */
    ngOnInit(): void {

        this.initializeSearchTypeOptions();

        this.initializeWidgetTypeOptions();

        this.gridOptions = {
            onGridReady: event => this.gridReady(event),
            defaultColDef: {
                floatingFilter: false,
                flex: 1
            },
            domLayout: 'normal',
            suppressContextMenu: true,
            columnDefs: this.getColDefs(),
            rowData: []
        };

        this.searchTermSubject$
            .pipe(
                takeUntil(this.ngUnsubscribe),
                debounceTime(300),
                map((str: string) => {
                    // we are not allowing search if search string is less than 3 characters and all are just alphabets.
                    if ((typeof str === 'string') &&  !(str?.length < 3 && /^[a-zA-Z]+$/.test(str))) {
                        return str;
                    } else {
                        return CommonConstants.EMPTY_STRING;
                    }
                })
            ).subscribe((searchString: string) => {
                if (!isEmpty(searchString)) {
                    this.performSearch(searchString);
                }
        });
    }

    /**
     * initialize the select options for Search type dropdown
     */
    initializeSearchTypeOptions() {
        this.searchTypeOptions = [new ExploreSelectOptionGroup([
            new ExploreSelectOption('Phrasal Search', ColumnSearchOptions.PHRASAL_SEARCH),
            new ExploreSelectOption('Semantic Search', ColumnSearchOptions.SEMANTIC_SEARCH, true),
            new ExploreSelectOption('Hybrid Search', ColumnSearchOptions.HYBRID_SEARCH)
        ])];
    }

    /**
     * initialize the select options for Widget type dropdown
     */
    initializeWidgetTypeOptions() {
        this.widgetTypeOptions = [new ExploreSelectOptionGroup([
            new ExploreSelectOption('Risk and Exposure', 'RE', true),
            new ExploreSelectOption('Portfolio Group Summary', 'PGS'),
            new ExploreSelectOption('Return Analysis', 'RA'),
            new ExploreSelectOption('Factor Based Analysis', 'FBA'),
            new ExploreSelectOption('None', 'None'),
        ])];
    }

    /**
     * search through the columns for the given search string
     */
    performSearch(searchString: string) {
        if (isEmpty(searchString)) {
            return;
        }
        const startTimestamp = new Date().getTime();
        this.columnSearchService.searchColumns$(searchString, this.searchBy, this.widgetType, this.rows, this.categoryFilter, 'Loading Columns')
            .subscribe((searchResults: any[]) => {
                // update grid data
                this.gridApi.updateGridOptions({rowData: searchResults});
                this.noOfColumns = searchResults.length;
                const endTimestamp = new Date().getTime();
                this.timeTakenForSearch = endTimestamp - startTimestamp;
                this.isLikeDislikeEnabled = true;
                const telemetrySemanticSearchParameters = new TelemetrySemanticSearchParameters(this.widgetType, this.searchBy, this.rows, searchString, TelemetryUtil.getDuration(this.timeTakenForSearch), this.noOfColumns);
                TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.SEMANTIC_SEARCH_QUERY, telemetrySemanticSearchParameters);
                this.changeDetectorRef.markForCheck();
            });
    }

    /**
     * Close modal
     */
    closeModal(applyChange?: boolean): void {
        this.isOpen = false;
        this.modalClosed.emit(applyChange);
    }

    /**
     * search value change handler
     */
    onSearchValueChanged(event: CustomEvent<AuxSearchFieldSearchValueChangedDetailInterface>) {
        if (get(event, 'detail')) {
            // get the latest search string
            this.searchString = event.detail.submitValue ? event.detail.submitValue.searchValue : null;
            if (!isEmpty(this.searchString)) {
                // perform search
                this.searchTermSubject$.next(this.searchString);
            }
        }
    }

    /**
     * set gridApi
     */
    private gridReady(event: GridReadyEvent<any>) {
        this.gridApi = event.api;
        this.gridApi.sizeColumnsToFit();
    }

    /**
     * Triggered when window width is changed and resizes grid columns
     */
    @HostListener('window:resize')
    onResize(): void {
        this.gridApi.sizeColumnsToFit();
    }

    /**
     * returns column definitions for the grid
     */
    getColDefs() {
        const columnDefinitions: (ColDef)[] = [
            {
                field: 'title',
                headerName: 'Column Title',
                type: AuxGridColumnType.AUX_TEXT_COLUMN,
                suppressSizeToFit: true,
                minWidth: 280
            },
            {
                field: 'columnTag',
                headerName: 'Column Tag',
                type: AuxGridColumnType.AUX_TEXT_COLUMN,
                width: 150
            },
            {
                field: 'score',
                headerName: 'Match Score',
                type: AuxGridColumnType.AUX_NUMBER_COLUMN,
                width: 150
            }];
        return columnDefinitions;
    }

    /**
     * search type change handler
     */
    onSearchTypeSelectionChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.searchBy = (event.detail.value as AuxSelectOption).value;
        this.performSearch(this.searchString);
    }

    /**
     * widget type change handler
     */
    onWidgetTypeSelectionChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.widgetType = (event.detail.value as AuxSelectOption).value;
        this.performSearch(this.searchString);
    }

    /**
     * on rows count change handler
     */
    onRowCountChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        this.rows = event.detail.value;
        this.performSearch(this.searchString);
    }

    /**
     * on like/dislike button clicked
     */
    onLikeDislikeBtnClicked(likeResults: boolean) {
        if (this.isLikeDislikeEnabled) {
            this.isLikeDislikeEnabled = false;
            const telemetrySemanticSearchParameters = new TelemetrySemanticSearchParameters(this.widgetType, this.searchBy, this.rows, this.searchString, TelemetryUtil.getDuration(this.timeTakenForSearch), this.noOfColumns, likeResults);
            TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.SEMANTIC_SEARCH_QUERY, telemetrySemanticSearchParameters);
        }
    }
}
