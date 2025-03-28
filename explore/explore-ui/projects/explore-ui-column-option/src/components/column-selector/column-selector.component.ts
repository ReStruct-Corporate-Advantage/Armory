import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {
    AuxAdvancedTreeListContextMenuClickedDetailInterface,
    AuxAdvancedTreeListInterface,
    AuxButtonSizeEnum,
    AuxButtonTypeEnum,
    AuxColumnSelector,
    AuxColumnSelectorConfig,
    AuxColumnSelectorItemMovedDetailInterface,
    AuxColumnSelectorRemoveItemClickedDetailInterface,
    AuxColumnSelectorSelectionChangedDetailInterface,
    AuxColumnSelectorSourceItemMovedDetailInterface,
    AuxColumnSelectorTreeInterface,
    AuxSelectInterface,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {
    AbstractColumnOption,
    BaseCustomSearchTreeListComponent,
    ColumnConfig,
    ColumnDefinition,
    ColumnDescriptionTrackingParameters,
    CoreColumnUtils,
    CoreCommonConstants,
    CoreDefinitionStore,
    CoreFavoriteConstants,
    CoreFavoriteUtils,
    ExploreColumnQueryAction,
    TelemetryActionConstants,
    TelemetryService,
    TokenConstants,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {debounceTime, filter, takeUntil} from 'rxjs/operators';
import {BehaviorSubject, Subject} from 'rxjs';
import {ColumnOptionUpdate, ColumnSelectorConfig} from '../../interfaces';
import {CustomTitleColumnOption} from '../../models/column-option/custom-title-column-option.model';
import {ColumnSet} from '../../models/column-set/column-set.model';
import {ColumnSelectorOption} from '../../models/ui/column-selector-option.model';
import {SelectedColumnSelectorOption} from '../../models/ui/selected-column-selector-option.model';
import {ColumnOptionUtils, LibColumnUtils} from '../../utils';
import {cloneDeep, isEmpty, isNil} from 'lodash';
import {ScenarioColumnOption} from '../../models/column-option/scenario-column-option.model';
import {ColumnOptionConstants} from '../../constants';

/**
 * Column Selector wrapper component of aux-column-selector
 */
@Component({
    selector: 'explore-column-option-column-selector',
    templateUrl: './column-selector.component.html',
    styleUrls: ['./column-selector.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnSelectorComponent extends BaseCustomSearchTreeListComponent implements OnInit, OnChanges, AfterViewInit {
    readonly CoreFavoriteConstants = CoreFavoriteConstants;
    readonly AuxButtonSizeEnum = AuxButtonSizeEnum;
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    coreFavoriteUtils = CoreFavoriteUtils;
    @ViewChild('columnSelector', {static: false}) columnSelector: AuxColumnSelector;

    @Input() requireLoadAndSaveOptions: boolean;
    @Input() showColumnCounter: boolean;
    @Input() disableSelectColumnOnAdd?: boolean;
    @Input() singleColumnOnly?: boolean;

    @Input() columnSet: ColumnSet;

    @Input() sourceDataUpdated$: Subject<ColumnSelectorOption[]>;
    @Input() columnSetUpdated$?: Subject<ColumnSet>;
    @Input() columnOptionCopied$?: Subject<{columns: ColumnConfig[], columnOptionValue: AbstractColumnOption}>;
    @Input() columnOptionsFetched$?: Subject<SelectedColumnSelectorOption[]>;
    @Input() columnOptionUpdated$?: Subject<ColumnOptionUpdate>;
    @Input() favoriteType: string;

    @Input()
    set config(value: ColumnSelectorConfig) {
        this.columnSelectorConfig = Object.assign({}, this._defaultConfig, value);
    }

    @Input() widgetType: string;
    @Input() widgetRecentColumns: string[];

    @Input() selectedColumnConfig$?: BehaviorSubject<ColumnConfig>;

    // Parent ColumnSet is available if the widget is a child widget.
    @Input() parentColumnSet?: ColumnSet;

    @Input() searchBy: string;
    @Input() searchTermSubject$: BehaviorSubject<string>;
    @Input() showSelectDropdown: boolean;

    @Input() loadColumnSet: Function;

    @Output() saveColumnSetClicked = new EventEmitter();
    @Output() loadColumnSetClicked = new EventEmitter();

    @Output() sourceSelectionChanged = new EventEmitter<ColumnSelectorOption[]>();
    @Output() targetSelectionChanged = new EventEmitter<ColumnSelectorOption>();
    @Output() sourceItemMoved = new EventEmitter<ColumnSelectorOption[]>();
    @Output() targetItemRemoved = new EventEmitter<ColumnSelectorOption>();
    @Output() recentColumnsChanged = new EventEmitter<string[]>();
    @Output() filteredFlatDataChanged = new EventEmitter<ColumnSelectorOption[]>();

    sourceData: AuxColumnSelectorTreeInterface[];
    targetData: AuxColumnSelectorTreeInterface[] = [];

    isDescriptionDataAvailable = false;

    private readonly SEARCH_BY_NAME = 'Search by name';
    private readonly SEARCH_BY_DEFINITION = 'Search by definition';

    auxConfig: AuxColumnSelectorConfig = {
        sourceList: { paddingLeft: 12, indentation: 12 },
        allowedTags: ['strong', 'br', 'div'],
        popoverOpenCloseDelay: 600,
        targetList: { paddingLeft: -8},
    };

    selectDropdownProps: AuxSelectInterface = {
        onSelectionChanged: (event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) => {
            this.searchCriteriaChanged(event);
        },
        data: [{
            values: [
                {
                    displayValue: this.SEARCH_BY_NAME,
                    isSelected: true
                },
                {
                    displayValue: this.SEARCH_BY_DEFINITION
                },
            ]
        }],
        type: 'simple',
        hasInitialOptionPlaceholder: false
    } as AuxSelectInterface;

    readonly CUSTOM_COLUMN_TITLE = 'customColumnTitle';

    private _defaultConfig: ColumnSelectorConfig = {
        hasAggregator: true,
        hasDoubleClick: true,
        hasReorder: true,
        allowDuplicates: true,
        hasSearch: false,
        sourceLabel: CoreCommonConstants.EMPTY_STRING,
        customSearch: this.customSearch,
        customSort: this.customSort
    };

    columnSelectorConfig: ColumnSelectorConfig = {...this._defaultConfig};
    isFirstTimeInitialize = true;

    /**
     * constructor
     */
    constructor(protected changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        // intentionally settings this undefined to avoid showing the dropdown only for the Explore
        if (!this.showSelectDropdown) {
            this.selectDropdownProps = undefined;
        }

        if (this.columnOptionsFetched$) {
            // columnOptionsFetched$ is not available for sector-attribute-rule-builder
            this.columnOptionsFetched$
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((columnsToUpdate: SelectedColumnSelectorOption[]) => {
                    this.updateTargetList(ColumnSelectorActionTypes.UPDATE, null, null, columnsToUpdate);
                });
        }

        if (this.columnOptionUpdated$) {
            this.columnOptionUpdated$
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(({column: columnToUpdate, isSaveUpdate}) => {
                    // if triggered by a saving update, do nothing besides trigger change detection to update the favorite info
                    if (isSaveUpdate) {
                        this.changeDetectorRef.markForCheck();
                        return;
                    }
                    this.updateTargetList(ColumnSelectorActionTypes.UPDATE, null, null, columnToUpdate);
                });
        }

        if (this.searchTermSubject$) {
            this.searchTermSubject$
                .pipe(
                    takeUntil(this.ngUnsubscribe),
                    debounceTime(300)
                ).subscribe((searchString: string) => {
                if (isNil(searchString)) {
                    searchString = CoreCommonConstants.EMPTY_STRING;
                }
                this.columnSelector.getSourceRef()
                    .then(async sourceTreeList => {
                        // this is done to refresh the visible data in sourceTreeList when filtering is done after the search
                        if (sourceTreeList.searchString === searchString) {
                            sourceTreeList.searchString = CoreCommonConstants.EMPTY_STRING;
                        }
                        // Earlier we're not having debounceTime, and now we have a debounceTime of 300ms
                        // So if user types in say 'Risk' quickly then the search is performed only once (usually in automated scripts), We update the match score only while searching
                        // So we'll not get the sorted results based on the match score, so we'll mimic the search again to get the sorted results
                        if (searchString.length > 1) {
                            sourceTreeList.searchString = searchString.substring(0, searchString.length - 1);
                        }
                        sourceTreeList.searchString = searchString;
                        this.changeDetectorRef.markForCheck();
                    });
            });
        }

        this.initializeComponent();
    }

    /**
     * ngOnChanges handler
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.searchBy && changes.searchBy.currentValue !== changes.searchBy.previousValue) {
            if (changes.searchBy.currentValue === this.SEARCH_BY_DEFINITION) {
                this.isDescriptionSearch = true;
            } else {
                this.isDescriptionSearch = false;
            }
        }
    }

    /**
     * Initializes the component
     */
    protected initializeComponent(): void {
        // This is intentional to override by child component
    }

    /**
     * ngAfterViewInit
     *  the very first time updateSourceList/updateTargetList can be called is after columnSelector is initialized
     */
    ngAfterViewInit(): void {
        this.sourceDataUpdated$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((updatedSourceData: ColumnSelectorOption[]) => {
                this.updateSourceList(updatedSourceData);
            });

        if (this.columnSetUpdated$) {
            // columnSetUpdated$ is not available for sector-attribute-rule-builder
            this.columnSetUpdated$
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((columnSet: ColumnSet) => {
                    this.updateTargetList(ColumnSelectorActionTypes.CREATE, null, columnSet);
                });
        }

        // if columnOptionCopied$ gets value from copy column option component, update ColumnSelectorOptionModel
        if (this.columnOptionCopied$) {
            this.columnOptionCopied$
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(({columns: columns, columnOptionValue: sourceColumnOptionValue}) => {
                    // update column selector option data model after copying column option
                    this.updateColumnSelectorOptionModel(columns, sourceColumnOptionValue);
                });
        }
    }

    /**
     * Callback when the status tag is updated
     */
    updateStatusTag = (): void  => {
        // When the status tag is updated, we need angular to update the view
        this.changeDetectorRef.markForCheck();
    }

    /**
     * targetSelectionChangedHandler
     */
    targetSelectionChangedHandler(event: CustomEvent<AuxColumnSelectorSelectionChangedDetailInterface>) {
        event.stopPropagation();
        // If selected item is removed, this gets triggered first with event.detail.value as empty array
        if (event.detail.value.length) {
            this.updateTargetList(ColumnSelectorActionTypes.UPDATE, null, null, this.selectedColumnConfig$.getValue());
            this.updateTargetList(ColumnSelectorActionTypes.SELECT, event.detail.value);
        }
    }

    /**
     * itemMovedToTargetAreaHandler
     */
    itemMovedToTargetAreaHandler(event: CustomEvent<AuxColumnSelectorItemMovedDetailInterface | AuxColumnSelectorSourceItemMovedDetailInterface>): void {
        event.stopPropagation();
        for (const col of event.detail.value) {
            col.isLearnLink = false;
        }
        this.updateTargetList(ColumnSelectorActionTypes.ADD, event.detail.value);
    }

    /**
     * itemReOrderHandler
     */
    // TODO: Item reordering still shows the animation APGUX-3382
    //  will be fixed with DS 6.7
    itemReOrderHandler(isDragAndDrop?: boolean): void {
        // We have used setTimeout to introduce async behavior while getting latest target column list, as the list gets updated after the event is processed.
        // This is workaround to DS library issue
        setTimeout(() => {
            this.updateTargetList(isDragAndDrop ? ColumnSelectorActionTypes.REORDER_DRAG_AND_DROP : ColumnSelectorActionTypes.REORDER);
        });
    }

    /**
     * removeItemClickedHandler
     */
    async removeItemClickedHandler(event?: CustomEvent<AuxColumnSelectorRemoveItemClickedDetailInterface>, removeAll?: boolean) {
        event?.stopPropagation();
        if (removeAll) {
            await this.updateTargetList(ColumnSelectorActionTypes.REMOVE_ALL);
        } else {
            await this.updateTargetList(ColumnSelectorActionTypes.REMOVE, event?.detail.value);
        }
    }

    /**
     * Update source list
     */
    private updateSourceList(updatedSourceData: ColumnSelectorOption[]): void {
        this.columnSelector.getSourceRef()
            .then(async sourceTreeList => {
                this.sourceData = updatedSourceData;
                sourceTreeList.dataMoved(updatedSourceData);
            });
    }


    /**
     * Update target list
     */
    protected async updateTargetList(eventType: string, selectedColumns?: ColumnSelectorOption | ColumnSelectorOption[], columnSet?: ColumnSet, columnToUpdate?: ColumnConfig | SelectedColumnSelectorOption[]) {
        if (eventType === ColumnSelectorActionTypes.CREATE && this.isFirstTimeInitialize) {
            this.initializeColumns(columnSet);
            return;
        }

        const targetTreeList = await this.columnSelector.getTargetRef();
        // targetTreeList is not available in sector rule builder
        if (!targetTreeList) {
            return;
        }
        const targetAreaColumns = await targetTreeList.getData();
        this.updateColumnSet(eventType, selectedColumns || targetAreaColumns);

        switch (eventType) {
            case ColumnSelectorActionTypes.CREATE:
                this.initializeColumns(columnSet, targetTreeList);
                break;
            case ColumnSelectorActionTypes.CLONE:
                // due to how data is rendered in the aux component, we must totally re-initialize the data when programatically cloning a column,
                // otherwise the data will not render, or the delete icons will disappear
                this.initializeColumns(this.columnSet, targetTreeList);
                break;
            case ColumnSelectorActionTypes.ADD:
                this.addColumns(selectedColumns as ColumnSelectorOption[], targetAreaColumns, targetTreeList);
                break;
            case ColumnSelectorActionTypes.REMOVE:
                this.removeColumn(selectedColumns as ColumnSelectorOption, targetAreaColumns, targetTreeList);
                break;
            case ColumnSelectorActionTypes.UPDATE:
                this.updateColumn(targetAreaColumns.length ? targetAreaColumns : this.targetData, columnToUpdate, targetTreeList);
                break;
            case ColumnSelectorActionTypes.SELECT:
                this.selectColumn(selectedColumns[0]);
                break;
            case ColumnSelectorActionTypes.REMOVE_ALL:
                this.targetData = [];
                targetTreeList.dataMoved([]);
                // emit null value to remove currently displayed column options
                this.targetItemRemoved.emit(null);
                break;
            default:
                break;
        }
    }

    /**
     * Initialize columns
     */
    private initializeColumns(columnSet: ColumnSet, targetTreeList?: any): void {
        // columnSet.columns is empty on customCalc initialize
        if (columnSet.columns.length) {
            const targetData = this.createTargetAreaColumns(columnSet);
            // First time initialize, we bind target data to aux-column-selector via data binding
            if (this.isFirstTimeInitialize) {
                this.targetData = targetData;
                // TODO: APGUX-3494 - for now we are always passing targetData via data binding and this cause the animation,
                //  because with dataMoved, we don't see the (x) icons to remove columns.
                //  this.isFirstTimeInitialize = false;
                this.changeDetectorRef.markForCheck();
            } else {
                // If the component is already initialized, then we update the data using dataMoved method to prevent the data overriding and the bad animation.
                targetTreeList.dataMoved(targetData);
            }
            this.targetSelectionChanged.emit(targetData[targetData.length - 1]);
        }
    }

    /**
     * Select column
     */
    private selectColumn(selectedColumn: ColumnSelectorOption): void {
        this.targetSelectionChanged.emit(selectedColumn);
    }

    /**
     * Add columns
     */
    private addColumns(selectedColumns: ColumnSelectorOption[], targetAreaColumns: ColumnSelectorOption[], targetTreeList: any): void {
        let columnKeyToSelect = 0;
        if (this.singleColumnOnly) {
            if (selectedColumns.length > 1) {
                // take only last selected column in case of Single column widget
                selectedColumns.splice(0, selectedColumns.length - 1);
            }

            // Update targetAreaColumns.
            targetAreaColumns.splice(0, targetAreaColumns.length - 1);
        } else {
            // Select the last column of added columns.
            columnKeyToSelect = selectedColumns[selectedColumns.length - 1].key;
        }
        this.forceSelectColumn(columnKeyToSelect, targetAreaColumns);
        targetTreeList.dataMoved(targetAreaColumns);

        if (this.searchQuery) {
            this.searchQuery.columnSearchQueryAction = ExploreColumnQueryAction.EXPLORE_COLUMN_QUERY_ACTION_ADD;
            const addedColumnAndOrder = new Map<string, number>();
            selectedColumns.forEach(column => addedColumnAndOrder.set(column.label, column[CoreCommonConstants.COLUMN_ORDER_IN_SEARCH_RESULTS]));
            this.searchQuery.addedColumnAndOrder = addedColumnAndOrder;
            TelemetryService.track(TelemetryActionConstants.USER_BEHAVIOUR.COLUMN_SEARCH_QUERY, this.searchQuery);
        }
        this.sourceItemMoved.emit(selectedColumns);

        // save new selected columns to user preferences column.columnTag + '_' + column.uses
        let newSelectedColumns: string[] = selectedColumns.map(column => column.eventData[ColumnOptionConstants.COLUMN]?.columnTag + ColumnOptionConstants.UNDERSCORE + column.eventData[ColumnOptionConstants.COLUMN]?.positionColumnType);

        if (!isNil(this.widgetRecentColumns)) {
            newSelectedColumns = newSelectedColumns.filter(col => !this.widgetRecentColumns.includes(col));
        }

        if (newSelectedColumns.length > 0) {
            this.widgetRecentColumns = isNil(this.widgetRecentColumns) ? newSelectedColumns : newSelectedColumns.concat(this.widgetRecentColumns);
            // get recent column count configuration to save recent columns
            const recentColumnsCount = CoreDefinitionStore.tokens[TokenConstants.EXPLORE_RECENT_COL_COUNT] ? Number(CoreDefinitionStore.tokens[TokenConstants.EXPLORE_RECENT_COL_COUNT]) : 10;
            if (this.widgetRecentColumns.length > recentColumnsCount) {
                this.widgetRecentColumns.splice(recentColumnsCount);
            }
            this.recentColumnsChanged.emit(this.widgetRecentColumns);
        }
    }

    /**
     * Remove columns
     */
    private removeColumn(selectedColumns: ColumnSelectorOption, targetAreaColumns: ColumnSelectorOption[], targetTreeList: any): void {
        if (!targetAreaColumns.length) {
            this.targetItemRemoved.emit(null);
        }
        // If removing selected column, trigger the emitter to fetch the last column's option.
        if (selectedColumns.isSelected) {
            if (targetAreaColumns.length) {
                this.forceSelectColumn(targetAreaColumns.length - 1, targetAreaColumns);
            }
            targetTreeList.dataMoved(targetAreaColumns);

            this.targetItemRemoved.emit(targetAreaColumns.find(column => column.isSelected));
        }
    }

    /**
     * Select the column in target area in Explore way, while adding and removing columns.
     */
    private forceSelectColumn(columnKey: number, targetAreaColumns: ColumnSelectorOption[]): void {
        // Deselect all columns in target area.
        targetAreaColumns.forEach((option) => option.isSelected = false);
        // Select the passed in column; we are relying on key param from the events.
        if (targetAreaColumns[columnKey]) {
            targetAreaColumns[columnKey].isSelected = true;
        }
    }

    /**
     * Update column label
     */
    private updateColumn(targetAreaColumns: ColumnSelectorOption[], columnToUpdate: ColumnConfig | SelectedColumnSelectorOption[], targetTreeList: any): void {
        // If columnToUpdate is instanceof ColumnConfig, it comes from columnOptionUpdated$.
        if (columnToUpdate instanceof ColumnConfig) {
            let columnSelectorOption = targetAreaColumns.find((column => (column.eventData as SelectedColumnSelectorOption).column.columnKey === columnToUpdate.columnKey));
            // In case loading favorite custom calc, columnKeys are not the same.
            if (!columnSelectorOption) {
                columnSelectorOption = targetAreaColumns.find((column => column.isSelected));
            }
            // Need to update column in columnSelectorOption.
            (columnSelectorOption.eventData as SelectedColumnSelectorOption).column = columnToUpdate;
            columnSelectorOption.label = ColumnOptionUtils.getCustomTitle(columnToUpdate) || columnToUpdate.columnTitle;

        } else {
            // If columnToUpdate is SelectedColumnSelectorOption[], it comes from columnOptionsFetched$.
            this.updateLabelForColumnToUpdate(targetAreaColumns, columnToUpdate);
        }
        targetTreeList.dataMoved(targetAreaColumns);
    }

    protected updateLabelForColumnToUpdate(targetAreaColumns: ColumnSelectorOption[], columnToUpdate: SelectedColumnSelectorOption[]): void {
        for (const selectedColumnSelectorOption of columnToUpdate) {
            const columnSelectorOption = targetAreaColumns.find((col => (col.eventData as SelectedColumnSelectorOption).column.columnKey === selectedColumnSelectorOption.column.columnKey));
            if (columnSelectorOption && columnSelectorOption.label !== selectedColumnSelectorOption.column.columnTitle) {
                columnSelectorOption.label = selectedColumnSelectorOption.column.columnTitle;
            }
        }
    }

    /**
     * Convert the widget columns into pick list selected column models
     */
    private createTargetAreaColumns(columnSet: ColumnSet): ColumnSelectorOption[] {
        // Loop through all the columns and create options out of them
        const targetAreaColumns = columnSet.columns.map((item: ColumnConfig) => {
            return this.createColumnSelectorOption(item);
        });
        if (targetAreaColumns.length) {
            targetAreaColumns[targetAreaColumns.length - 1].isSelected = true;
        }
        return targetAreaColumns;
    }

    /**
     * Create column selector option
     */
    protected createColumnSelectorOption(column: ColumnConfig): ColumnSelectorOption {
        //Update title from col def first before column options to prioritize custom title col option
        //Get the modified title for research note topic columns from column definition
        CoreColumnUtils.getOriginalTitleForResearchTopicColumns(column);
        column.optionValues.forEach((value: AbstractColumnOption) => {
            ColumnOptionUtils.updateColumnTitle(column, value, this.widgetType);
        });

        const customTitleColumnOption = column.optionValues.find(option => option.configType === this.CUSTOM_COLUMN_TITLE);
        if (customTitleColumnOption && (customTitleColumnOption as CustomTitleColumnOption).customTitle) {
            column.columnTitle = (customTitleColumnOption as CustomTitleColumnOption).customTitle;
        }
        const columnSelectorOption = new ColumnSelectorOption(column.columnTitle);
        columnSelectorOption.eventData = new SelectedColumnSelectorOption(column, []);
        columnSelectorOption.contextMenu = this.singleColumnOnly ? undefined : LibColumnUtils.COLUMN_SELECTOR_CONTEXT_MENU;
        return columnSelectorOption;
    }

    /**
     * Update columnSet
     */
    private updateColumnSet(eventType: string, selectedColumns: ColumnSelectorOption | ColumnSelectorOption[]): void {
        let columnConfig: ColumnConfig;
        switch (eventType) {
            case ColumnSelectorActionTypes.SELECT:
                const selectedColumn = (selectedColumns[0].eventData as SelectedColumnSelectorOption).column;
                const selectedIndex = this.getColumnIndex(selectedColumn.columnKey, this.columnSet.columns);
                this.columnSet.columns.splice(selectedIndex, 1, selectedColumn);
                break;
            case ColumnSelectorActionTypes.ADD:
                this.handleAdd(selectedColumns, columnConfig);
                break;
            case ColumnSelectorActionTypes.CLONE:
                // column has been cloned, add to end of list
                const selectedColumnOption = (selectedColumns as ColumnSelectorOption).eventData as SelectedColumnSelectorOption;
                columnConfig = cloneDeep(selectedColumnOption.column);
                // must create new columnKey to identify cloned column
                columnConfig.columnKey = ColumnConfig.generateColumnKey(columnConfig.columnTag);
                this.columnSet.columns.push(columnConfig);
                break;
            case ColumnSelectorActionTypes.REORDER:
            case ColumnSelectorActionTypes.REORDER_DRAG_AND_DROP:
                for (let i = 0; i < this.columnSet.columns.length ?? 0; i++) {
                    if (this.columnSet.columns[i].columnKey !== selectedColumns[i].eventData.column.columnKey) {
                        const itemIndex = this.getColumnIndex(selectedColumns[i].eventData.column.columnKey, this.columnSet.columns);
                        const reorderedColumn = this.columnSet.columns[itemIndex];
                        this.columnSet.columns[itemIndex] = this.columnSet.columns[i];
                        this.columnSet.columns[i] = reorderedColumn;
                    }
                }
                break;
            case ColumnSelectorActionTypes.REMOVE:
                const removedColumn = ((selectedColumns as ColumnSelectorOption).eventData as SelectedColumnSelectorOption).column;
                const removedIndex = this.getColumnIndex(removedColumn.columnKey, this.columnSet.columns);
                this.columnSet.columns.splice(removedIndex, 1);
                break;
            case ColumnSelectorActionTypes.REMOVE_ALL:
                this.columnSet.columns = [];
                // remove all should also remove the favorite
                this.columnSet.unlinkFavorite();
                break;
            default:
                break;
        }
    }

    /**
     * Handle add columns
     */
    private handleAdd(selectedColumns: ColumnSelectorOption | ColumnSelectorOption[], columnConfig) {
        for (const column of selectedColumns as ColumnSelectorOption[]) {
            if (column.eventData instanceof ColumnDefinition) {
                let columnKey = null;
                if (this.widgetType === WidgetConfigType.FACTOR_GRAPHING_BAR_CHART || this.widgetType === WidgetConfigType.FACTOR_GRAPHING_STACK_BAR_CHART) {
                    // We do not make a separate calls for child column but leverage the existing cube that was created for the parent widget.
                    // When we add a new column, the column should hold the same column key in order to keep the same mapping in the cube.
                    columnKey = this.parentColumnSet.columns
                        .filter(col => col.columnTag === (column.eventData as ColumnDefinition).columnTag)?.[0]?.columnKey;
                }
                columnConfig = ColumnConfig.createColumnFromColumnDefinition(column.eventData, columnKey);
                column.eventData = new SelectedColumnSelectorOption(columnConfig, []);

                // If we have singleColumn widget, user should be able to choose only one column in the column list
                if (this.singleColumnOnly) {
                    this.columnSet.columns.splice(0, this.columnSet.columns.length, column.eventData.column);
                } else {
                    // Else, by default just add it to the end of the list (Array.splice to array length index is the same as Array.push)
                    this.columnSet.columns.splice(column.key, 0, column.eventData.column);
                }
            }
            // add context menu as column is moved to target
            column.contextMenu = this.singleColumnOnly ? undefined : LibColumnUtils.COLUMN_SELECTOR_CONTEXT_MENU;
        }
    }

    /**
     * Get column index
     */
    private getColumnIndex(columnKey: string, columns: ColumnConfig[]): number {
        return columns.findIndex((column: ColumnConfig) => column.columnKey === columnKey);
    }

    /**
     * On load column set clicked
     */
    onLoadColumnSetClicked(): void {
        this.loadColumnSetClicked.emit();
    }

    /**
     * On save column set clicked
     */
    onSaveColumnSetClicked(): void {
        this.saveColumnSetClicked.emit();
    }

    /**
     * Event handler that is called when a tooltip is required for the column.
     */
    onTooltip = (optionData: AuxAdvancedTreeListInterface): Promise<string> => {
        return new Promise<string>(resolve => {
            let tooltip = '';
            let colDef: ColumnDefinition;

            if (optionData?.isLearnLink && optionData?.eventData instanceof ColumnDefinition) {
                colDef = optionData.eventData;
                // it has already been checked in lib.column.util that there is a description so won't throw a NPE
                tooltip = (`<div style="width: 400px; white-space: pre-line"><div style="font-weight: bold"> ${colDef.title}</div><br>Definition:\n${colDef.columnDesc}</div>`);
            }
            resolve(tooltip);

            // log hover over col def
            if (optionData?.eventData?.column) {
                const columnTrackingParams = new ColumnDescriptionTrackingParameters(optionData.eventData.column.columnTag);
                TelemetryService.track(
                    TelemetryActionConstants.COLUMN.SHOW_COLUMN_DEFINITION,
                    columnTrackingParams);
            }
        });
    };


    /**
     * searchCriteriaChanged: Fetch all the descriptions and update our tree data with the same
     */
    searchCriteriaChanged(event: CustomEvent): void {
        // Get the Label of column search which user has selected
        const label = event.detail.value.displayValue;
        if (label === this.SEARCH_BY_DEFINITION) {
            this.isDescriptionSearch = true;
        } else {
            this.isDescriptionSearch = false;
        }
    }

    /**
     * reset the columnCount and return sourceData
     */
    getSourceData(): AuxAdvancedTreeListInterface[] {
        this.columnCount = CoreCommonConstants.EMPTY_STRING;
        this.changeDetectorRef.markForCheck();
        return this.sourceData;
    }

    /**
     * @inheritDoc
     */
    getColumnCount(filteredData: AuxAdvancedTreeListInterface[]): string {
        // emit the filtered data to the parent component so that we can update the filter category and subcategory
        this.filteredFlatDataChanged.emit(filteredData.filter(item => (item as ColumnSelectorOption).type === 'group' && item.nestedLevel === 0 && item.match));
        return (this.showColumnCounter) ? ' (' + filteredData.filter(item => (item as ColumnSelectorOption).type === 'column').length + ')' : CoreCommonConstants.EMPTY_STRING;
    }

    /**
     * Called when right click on column in target list
     * @param event
     */
    onContextMenuClick(event: CustomEvent<AuxAdvancedTreeListContextMenuClickedDetailInterface>): void {
        const columnSelectorOption = event.detail.value;
        const columnKey = columnSelectorOption.eventData.column.columnKey;
        const columnOptionValues = this.columnSet.columns.find(col => col.columnKey === columnKey)?.optionValues;

        // columnSelectorOption doesn't hold the optionValues in the column.
        // updating the optionValues in the column before cloning it
        columnSelectorOption.eventData.column.optionValues = columnOptionValues;
        this.updateTargetList(ColumnSelectorActionTypes.CLONE, columnSelectorOption);
    }

    /**
     * Method to update ColumnSelectorOptionModel for copy column option
     * @param columns: Array of columnConfigs
     * @param sourceColumnOptionValue: AbstractColumnOption
     * @private
     */
    protected async updateColumnSelectorOptionModel(columns: ColumnConfig[], sourceColumnOptionValue: AbstractColumnOption) {
        const targetTreeList = await this.columnSelector.getTargetRef();
        // return if targetTreeList is not available in sector rule builder
        if (!targetTreeList) {
            return;
        }
        // get columns for the current column set
        const targetAreaColumns = await targetTreeList.getData();
        columns.forEach(column => {
            const targetColumn = targetAreaColumns.find(target => target.eventData.column.columnKey === column.columnKey)?.eventData?.column;
            // Don't need to do anything if there is no targetColumn to apply the copied column option value
            if (!targetColumn) {
                return;
            }
            // if the target column exists but has no optionValue, add the source column option value to it,
            // else try to find the optionValue and update it.
            if (isEmpty(targetColumn.optionValues)) {
                targetColumn.optionValues.push(cloneDeep(sourceColumnOptionValue));
            } else {
                // ScenarioColumnOption has two config types: 'scenarioSettings' and 'scenarioRiskFactorViewColumnSettings'
                // need to check both
                const optionIndex = targetColumn
                    .optionValues
                    .findIndex(option => option.configType === sourceColumnOptionValue.configType
                        || option instanceof ScenarioColumnOption
                        && (ScenarioColumnOption.ALT_CONFIG_TYPE === sourceColumnOptionValue.configType || ScenarioColumnOption.CONFIG_TYPE === sourceColumnOptionValue.configType));
                // if the target column doesn't contain the source optionValue, add to it.
                if (optionIndex === -1) {
                    targetColumn.optionValues.push(cloneDeep(sourceColumnOptionValue));
                } else {
                    targetColumn.optionValues[optionIndex] = cloneDeep(sourceColumnOptionValue);
                }
            }
        });
    }

}

export enum ColumnSelectorActionTypes {
    CREATE = 'Create',
    ADD = 'Add',
    SELECT = 'Select',
    REORDER = 'Reorder',
    REORDER_DRAG_AND_DROP = 'ReorderDragAndDrop',
    REMOVE = 'Remove',
    REMOVE_ALL = 'RemoveAll',
    UPDATE = 'Update',
    CLONE = 'Clone'
}
