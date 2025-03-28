import {AfterViewInit, Component, Input} from '@angular/core';
import {AuxFacetedFilterOptionMultiSelectSelection, AuxFilterBarData} from '@blk/aladdin-angular-components';
import {
    AbstractColumnOption,
    ColumnConfig,
    ColumnOptionMetaDataInterface,
    CoreColumnUtils,
    CoreDefinitionStore,
    ExploreCheckbox,
    ExploreSelectOptionGroup,
    WidgetConfigUtils,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {flatMap, isEmpty, union} from 'lodash';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {ColumnOptionUpdate, ColumnSelectorConfig} from '../../interfaces';
import {LiquidityStore} from '../../liquidity/liquidity.store';
import {ColumnSet} from '../../models/column-set/column-set.model';
import {ColumnSelectorOption} from '../../models/ui/column-selector-option.model';
import {SelectedColumnSelectorOption} from '../../models/ui/selected-column-selector-option.model';
import {ColumnOptionService} from '../../services/column-option.service';
import {ColumnOptionUtils, LibColumnUtils} from '../../utils';
import {BaseWidgetSettingComponent} from '../widget-setting/base-widget-setting.component';

/**
 * Base ColumnSet Settings Component with default logics that library consumers can use.
 */
@Component({
    selector: 'explore-column-option-column-set-settings',
    templateUrl: './base-column-set-settings.component.html',
    styleUrls: ['./base-column-set-settings.component.scss']
})
export class BaseColumnSetSettingsComponent extends BaseWidgetSettingComponent<ColumnSet> implements AfterViewInit {

    static readonly CATEGORIES = 'Categories';
    static readonly SUB_CATEGORIES = 'Subcategories';
    static readonly SUB_CATEGORIES_L2 = 'Subcategories Level 2';

    protected readonly SEARCH_BY_NAME = 'Search by name';
    protected readonly SEARCH_BY_DEFINITION = 'Search by definition';

    selectedColumnConfig: ColumnConfig;
    singleColumnOnly: boolean;
    titleMod: string;

    @Input() columnTree: ColumnSelectorOption[];
    @Input() isColumnOptionsDisabled: boolean;
    @Input() singleSelectionAllowed: boolean;
    @Input() columnOptionsToAdd: ColumnOptionMetaDataInterface[];
    @Input() sourceLabel = 'Column measures';
    @Input() targetLabel = 'Column set';
    @Input() requireLoadAndSaveOptions = true;

    // used when opening settings for a child spritelet widget that is dependent on parent widget's columns
    @Input() parentInputs: Map<string, WidgetInput>;

    // Map of {column option name => update function} to modify existing column options on the column
    @Input() columnOptionsToModify: Map<string, (columnOption: ColumnOptionMetaDataInterface) => void>;

    @Input() isCopyDisplayOptionsBtnHidden = false;

    @Input() isDisabled = false;

    isCopyColumnOptionsModalOpen = false;

    widgetRecentColumns: string[];

    // Column selector config that will be passed to the column selector component to configure it how this component needs
    columnSelectorConfig: ColumnSelectorConfig;

    // subjects to update column options component
    selectedColumnConfig$ = new BehaviorSubject<ColumnConfig>(null);

    // subjects to update column selector component
    sourceDataUpdated$ = new Subject<ColumnSelectorOption[]>();
    columnSetUpdated$ = new Subject<WidgetInput>();
    columnOptionCopied$ = new Subject<{columns: ColumnConfig[], columnOptionValue: AbstractColumnOption}>();
    columnOptionsFetched$ = new Subject<SelectedColumnSelectorOption[]>();
    columnSetLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    // columnOptionUpdated$ to update columnSelector and columnSetSettings column label and title with option change
    columnOptionUpdated$ = new Subject<ColumnOptionUpdate>();

    // source column option metadata for copy modal
    sourceColumnOptionMetaDataForCopy: ColumnOptionMetaDataInterface;

    parentColumnSet: ColumnSet;

    categoriesData: AuxFilterBarData[] = [];
    filteredCategories: string[];
    filteredSubCategories: string[];
    filteredSubCategoriesL2: string[];

    searchString: string;
    selectDropdownProps: ExploreSelectOptionGroup[];

    /**
     * constructor
     */
    constructor(protected columnOptionService: ColumnOptionService) {
        super();
    }

    /**
     * Performs required initialisation
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    initializeComponent(): void {
        // requireLoadAndSaveOptions is false for cust-calc column selector
        this.singleColumnOnly = this.singleSelectionAllowed ? this.singleSelectionAllowed : WidgetConfigUtils.isSingleColumnWidget(this.widgetType) && this.requireLoadAndSaveOptions;
        this.columnSelectorConfig = {
            sourceLabel: this.sourceLabel,
            targetLabel: this.targetLabel,
            multiSelection: true,
            hasSearch: true,
            isDisabled: false
        };

        this.parentColumnSet = this.parentInputs?.get(WidgetInputType.COLUMNS) as ColumnSet;

        this.initializeSelectProps();

        this.columnOptionUpdated$
            .pipe(
                filter(({isSaveUpdate}) => !isSaveUpdate),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(() => {
                this.setTitleMod();
            });
    }

    /**
     * Initialize select dropdown props
     */
    private initializeSelectProps() {
        this.selectDropdownProps = [{
            values: [
                {
                    displayValue: this.SEARCH_BY_NAME,
                    value: this.SEARCH_BY_NAME,
                    isSelected: true
                },
                {
                    displayValue: this.SEARCH_BY_DEFINITION,
                    value: this.SEARCH_BY_DEFINITION
                }
            ]
        }];
    }

    openCopyColumnOptionsModal(): void {
        this.isCopyColumnOptionsModalOpen = true;
    }

    // handle copy button click
    copyButtonClickEventHandler(columnOptionForCopy: ColumnOptionMetaDataInterface) {
        this.openCopyColumnOptionsModal();
        this.sourceColumnOptionMetaDataForCopy = columnOptionForCopy;
    }

    /**
     * ngAfterViewInit
     */
    ngAfterViewInit(): void {
        this.sourceDataUpdated$.next(this.getAvailableColumns());
        this.columnSetUpdated$.next(this.widgetInput);
    }

    /**
     * On target selection changed
     */
    onTargetSelectionChanged(selectedColumn: ColumnSelectorOption): void {
        const selectedColumnData = selectedColumn.eventData as SelectedColumnSelectorOption; // items in target list should always be SelectedColumnSelectorOption
        if (!isEmpty(selectedColumnData.columnOptions)) {
            this.selectedColumnConfig = selectedColumnData.column;
            this.setTitleMod();
            this.selectedColumnConfig$.next(this.selectedColumnConfig);
            return;
        }
        // fetching data for just one item that is selected
        // We only need to fetch column options for the this column because,
        // 1. If the user is opening widget settings for the first time, then we want to initialize option values for the user to change.
        // Because the we select only the last column by default, we only need optionValues for the last column
        // 2. If the column set is from a favorite, then option values for all columns that have them will get them from the favorite
        // 3. If no changes were made, the server will handle default option values. This is the same as just sending the plain columns to the server for a data request
        this.fetchAndPopulateColumnOptions([selectedColumnData]);
    }

    /**
     * On columns added to target area
     */
    onColumnsAddedToTargetArea(addedColumns: ColumnSelectorOption[]): void {
        // Fetch the column options
        const columnsToFetch = addedColumns.map((item) => item.eventData as SelectedColumnSelectorOption);
        this.fetchAndPopulateColumnOptions(columnsToFetch);
    }

    /**
     * On target item removed
     */
    onTargetItemRemoved(selectedColumn: ColumnSelectorOption): void {
        if (!selectedColumn) {
            this.selectedColumnConfig = null;
            this.selectedColumnConfig$.next(null);
        } else {
            this.onTargetSelectionChanged(selectedColumn);
        }
    }

    /**
     * Fetches and then populates the column options in the passed in selected column items
     */
    private fetchAndPopulateColumnOptions(selectedColumns: SelectedColumnSelectorOption[]): void {
        // Just get out of here if there is no columns passed in.
        if (!this.isColumnOptionRequired(selectedColumns)) {
            return;
        }
        // Disable the apply button.
        this.isApplyButtonDisabled.value++;

        this.fetchColumnOptions(selectedColumns)
            .subscribe((populatedColumns) => {
                    this.selectedColumnConfig = populatedColumns[populatedColumns.length - 1].column;
                    this.setTitleMod();

                    // columnTitle needs to be updated in columnSelector if different
                    this.columnOptionsFetched$.next(populatedColumns);
                },
                () => {
                },
                () => {
                    // HACK: For some reason, sometimes, selectedColumnConfig$ is getting triggered before selectedColumnConfig is getting updated.
                    //  Adding setTimeout to prevent that.
                    setTimeout(() => {
                        this.isApplyButtonDisabled.value--;
                        this.selectedColumnConfig$.next(this.selectedColumnConfig);
                    }, 100);
                }
            );
    }

    /**
     *  Check whether column option required to load.
     */
    protected isColumnOptionRequired(selectedColumns: SelectedColumnSelectorOption[]): boolean {
        if (this.isColumnOptionsDisabled) {
            return false;
        }
        const isColumnOptionRequired = selectedColumns && selectedColumns.length !== 0;
        if (isColumnOptionRequired && this.singleSelectionAllowed) {
            this.selectedColumnConfig = selectedColumns[0].column;
            this.columnOptionsFetched$.next(selectedColumns);
            this.selectedColumnConfig$.next(selectedColumns[0].column);
            return false;
        }
        return isColumnOptionRequired;
    }

    /**
     * Callback during column option population to update the derived settings and title
     */
    protected updateDerivedSettingsAndColumnTitle(column: ColumnConfig) {
        //Get the modified title for research note topic columns
        CoreColumnUtils.getOriginalTitleForResearchTopicColumns(column);
        this.updateColumnWithDerivedSettings(column);
        column.optionValues.forEach((value: AbstractColumnOption) => {
            ColumnOptionUtils.updateColumnTitle(column, value, this.widgetType);
        });
    }

    /**
     * Get option definitions
     */
    protected getOptionDefinitions(): Map<string, any> {
        return new Map(union(Object.entries(CoreDefinitionStore), Object.entries(LiquidityStore)));
    }

    /**
     * Update column with derived settings - this method is intentionally empty
     */
    protected updateColumnWithDerivedSettings(column: ColumnConfig): void {
        // this method is intentionally empty
    }

    /**
     * @return available column tree
     */
    protected getColumnTree(): ColumnSelectorOption[] {
        // if child spritelet depends on parent for data, available columns should be filtered down to only those present in parent widget
        let columnTree = this.columnTree ? this.columnTree : LibColumnUtils.makeColumnTree(this.widgetConfigInput.columnFilters, this.widgetConfigInput.valueField, undefined, this.parentColumnSet, this.widgetType, this.widgetRecentColumns);

        if (this.widgetConfigInput.hideTopColumnGroup) {
            columnTree = flatMap(columnTree, (group: ColumnSelectorOption) => group.children);
        }
        return columnTree;
    }

    /**
     * @return available columns
     */
    protected getAvailableColumns(): ColumnSelectorOption[] {
        const columnTree = this.getColumnTree();
        this.categoriesData = [this.initializeCategories(columnTree.filter(c => !c.parent && c.children))];
        return columnTree;
    }

    /**
     * @return filtered available columns
     */
    protected getFilteredAvailableColumns(isCategoriesUpdated: boolean, isSubCategoriesUpdated: boolean, isSubCategoriesL2Updated: boolean): ColumnSelectorOption[] {
        let columnTree = this.getColumnTree();

        // handle reset all clicked i.e. all the categories are updated
        if (isCategoriesUpdated && isSubCategoriesUpdated && isSubCategoriesL2Updated) {
            // initialize main categories and return
            this.categoriesData = [this.initializeCategories(columnTree.filter(c => !c.parent && c.children))];
            return columnTree;
        }

        columnTree = this.filterTreeForCategories(columnTree, isCategoriesUpdated);
        columnTree = this.filterTreeForSubCategories(columnTree, isSubCategoriesUpdated);
        columnTree = this.filterTreeForSubCategoriesL2(columnTree, isSubCategoriesL2Updated);

        return columnTree;
    }

    /**
     * filter the tree data on main categories
     */
    private filterTreeForCategories(columnTree: ColumnSelectorOption[], isCategoriesUpdated: boolean) {
        // check if filteredCategories is empty, if not then filter the columnTree
        if (!isEmpty(this.filteredCategories)) {
            columnTree = columnTree.filter(c => this.filteredCategories.includes(c.label));
            if (isCategoriesUpdated && !this.searchString) {
                this.categoriesData.splice(1);
                this.updateFilterCategories(1, columnTree);
                // expand root level categories
                columnTree.forEach(group => group.isExpanded = true);
            }
        } else if (isCategoriesUpdated) { // this means user has clicked on clear filter for categories, so we need to remove subcategories and subcategoriesL2
            this.categoriesData.splice(1);
            this.filteredSubCategories = [];
            this.filteredSubCategoriesL2 = [];
        }
        return columnTree;
    }

    /**
     * update the filter categories based on the level
     */
    private updateFilterCategories(level: number, columnTree: ColumnSelectorOption[])   {
        const updatedCategories = this.updateCategories(level, columnTree);
        if (updatedCategories.data['length'] > 0) {
            this.categoriesData.push(updatedCategories);
            this.categoriesData = [...this.categoriesData];
        }
    }

    /**
     * filter the tree data on sub categories L1
     */
    private filterTreeForSubCategories(columnTree: ColumnSelectorOption[], isSubCategoriesUpdated: boolean) {
        // check if filteredSubCategories is empty, if not then filter the columnTree
        if (!isEmpty(this.filteredSubCategories)) {
            columnTree.forEach(group => group.children = group.children?.filter(child => this.filteredSubCategories.includes(child.label)));
            columnTree = columnTree.filter(group => group.children?.length > 0);
            if (isSubCategoriesUpdated && !this.searchString) {
                this.categoriesData.splice(2);
                this.updateFilterCategories(2, columnTree);
                // expand root and level 1 categories
                columnTree.forEach(group => {
                    group.isExpanded = true;
                    group.children.forEach(child => child.isExpanded = true);
                });
            }
        } else if (isSubCategoriesUpdated) { // this means user has clicked on clear filter for subCategories, so we need to remove subcategoriesL2
            this.categoriesData.splice(2);
            this.filteredSubCategoriesL2 = [];
        }
        return columnTree;
    }

    /**
     * filter the tree data on sub categories L2
     */
    private filterTreeForSubCategoriesL2(columnTree: ColumnSelectorOption[], isSubCategoriesL2Updated: boolean) {
        // check if filteredSubCategoriesL2 is empty, if not then filter the columnTree
        if (!isEmpty(this.filteredSubCategoriesL2)) {
            columnTree.forEach(group => group.children?.forEach(nestedChild => nestedChild.children = nestedChild.children?.filter(child => this.filteredSubCategoriesL2.includes(child.label))));
            columnTree.forEach(group => group.children = group.children?.filter(subGroup => subGroup.children?.length > 0));
            columnTree = columnTree.filter(group => group.children?.length > 0);
            if (isSubCategoriesL2Updated && !this.searchString) {
                // expand root, level 1 and level 2 categories
                columnTree.forEach(group => {
                    group.isExpanded = true;
                    group.children.forEach(child => {
                        child.isExpanded = true;
                        child.children.forEach(nestedChild => nestedChild.isExpanded = true);
                    });
                });
            }
        }
        return columnTree;
    }


    /**
     * Initialize categories for the first time
     */
    protected initializeCategories(columnSelectorOptions: ColumnSelectorOption[], filterChild?: boolean): AuxFilterBarData {
        if (isEmpty(columnSelectorOptions)) {
            return;
        }
        const categories: AuxFilterBarData = {
            label: BaseColumnSetSettingsComponent.CATEGORIES,
            uid: 'categories',
            type: 'multi-select'
        };
        categories.data = columnSelectorOptions.map(option => {
            const checkboxOption: AuxFacetedFilterOptionMultiSelectSelection = new ExploreCheckbox(option.label, false, false, option.uid);
            checkboxOption.facetCount = filterChild ? LibColumnUtils.getColumnCount(option) : option.children?.length;
            return checkboxOption;
        });
        return categories;
    }

    /**
     * update the categories based on the level
     */
    protected updateCategories(level: number, columnTree: ColumnSelectorOption[], isSearchMode?: boolean): AuxFilterBarData {
        const categories: AuxFilterBarData = {
            label: level === 1 ? BaseColumnSetSettingsComponent.SUB_CATEGORIES : BaseColumnSetSettingsComponent.SUB_CATEGORIES_L2,
            uid: level === 1 ? BaseColumnSetSettingsComponent.SUB_CATEGORIES : BaseColumnSetSettingsComponent.SUB_CATEGORIES_L2,
            isDisabled: false,
            type: 'multi-select-grouped'
        };
        let flatColumnTree = columnTree;
        // when preparing sub-categories level 2, we need to operate on the children of the main group
        if (level === 2) {
            flatColumnTree = flatColumnTree.flatMap(group => group.children?.filter(child => child.children));
        }

        if (isSearchMode) {
            flatColumnTree.forEach(group => group.children = group.children.filter(item => item.match));
        }
        // prepare the multi-select-grouped data for the sub-categories
        categories.data = flatColumnTree.map(group => {
            return {
                uid: group.uid,
                label: group.label,
                options: group.children?.filter(child => child.children).map(option => {
                    const checkboxOption: AuxFacetedFilterOptionMultiSelectSelection = new ExploreCheckbox(option.label, false, false, option.uid);
                    checkboxOption.facetCount = isSearchMode ? LibColumnUtils.getColumnCount(option) : option.children?.length;
                    return checkboxOption;
                }),
            };
        }).filter(group => group.options.length > 0);
        return categories;
    }

    /**
     * Set title mod
     */
    protected setTitleMod(): void {
        // checking for customTitle so that the titleMod can be assigned the column name to be displayed
        if (this.selectedColumnConfig) {
            this.titleMod = ColumnOptionUtils.getCustomTitle(this.selectedColumnConfig) || CoreColumnUtils.getOriginalColumnTitle(this.selectedColumnConfig.columnTag, this.selectedColumnConfig.positionColumnType);
        }
    }

    /**
     * Close copy column options modal, bound with emit event
     */
    closeCopyColumnOptionsModal(): void {
        this.isCopyColumnOptionsModalOpen = false;
    }

    protected fetchColumnOptions(selectedColumns): Observable<SelectedColumnSelectorOption[]> {
        return this.columnOptionService.fetchAndPopulateColumnOptions$(
            selectedColumns,
            this.columnOptionsToAdd,
            this.restrictedColumnOptions,
            this.updateDerivedSettingsAndColumnTitle.bind(this));
    }
}
