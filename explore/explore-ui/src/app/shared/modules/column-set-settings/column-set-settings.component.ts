import {AfterViewInit, Component} from '@angular/core';
import {
    AuxButtonSizeEnum,
    AuxButtonTypeEnum,
    AuxFacetedFilterMultiSelectGroup,
    AuxFacetedFilterOptionData,
    AuxFacetedFilterOptionMultiSelectData,
    AuxFacetedFilterOptionMultiSelectGroupedData,
    AuxFilterBarData,
    AuxFilterBarDataChangedInterface,
    AuxSearchFieldSearchValueChangedDetailInterface,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {
    BaseColumnSetSettingsComponent,
    ColumnOptionService,
    ColumnOptionUtils,
    ColumnSelectorOption,
    ColumnSet,
    CustomCalculationConstants,
    CustomTitleColumnOption,
    LibColumnUtils,
    LiquidityStore
} from '@blk/explore-ui-column-option';
import {
    ColumnConfig,
    CommonUtils,
    CoreDefinitionStore,
    CoreFavoriteConstants, CoreFavoriteUtils,
    ErrorTypeConstants,
    ExploreCheckbox,
    UIErrorParameters
} from '@blk/explore-ui-core';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {isEmpty, isNil, union} from 'lodash';
import {takeUntil} from 'rxjs/operators';
import {AppStore} from '../../../app.store';
import {FavoriteService, NotificationService} from '@services/index';
import {DefinitionsStore, UserMetaDataStore, WorkspaceStore} from '@stores/index';
import {ColumnUtils} from '@utils/index';
import {UserPreference} from '@constants/user-preference.constants';
import {BehaviorSubject} from 'rxjs';

/**
 * Component class for the widget settings column set selector
 *
 * @example
 *  <app-column-set-settings [widgetConfigInput]="widgetConfigInput"
 *                           [inputs]="inputs"
 *                           [isApplyButtonDisabled]="isApplyButtonDisabled"
 *                           [restrictedColumnOptions]="restrictedColumnOptions"
 *                           [columnOptionsToAdd]="columnOptionsToAdd"
 *                           sourceLabel="Column Measures"
 *                           targetLabel="Column Set">
 *  </app-column-set-settings>
 */
@Component({
    selector: 'app-column-set-settings',
    templateUrl: './column-set-settings.component.html',
    styleUrls: ['./column-set-settings.component.scss']
})
export class ColumnSetSettingsComponent extends BaseColumnSetSettingsComponent implements AfterViewInit {

    readonly AuxButtonSizeEnum = AuxButtonSizeEnum;
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    readonly CoreFavoriteConstants = CoreFavoriteConstants;
    readonly CUSTOM_CALCULATION = CustomCalculationConstants.CUSTOM_CALCULATION;
    readonly PGS_CUSTOM_CALCULATION = CustomCalculationConstants.PGS_CUSTOM_CALCULATION;
    coreFavoriteUtils = CoreFavoriteUtils;

    searchBy = this.SEARCH_BY_NAME;
    // to filter tree data based on the search term
    searchTermSubject$ = new BehaviorSubject<string>(null);

    displaySeparator = false;

    /**
     * constructor
     */
    constructor(protected columnOptionService: ColumnOptionService, protected favoriteService: FavoriteService,
                protected appStore: AppStore, protected notificationService: NotificationService) {
        super(columnOptionService);
    }

    initializeComponent(): void {
        this.widgetRecentColumns = LibColumnUtils.getRecentColumnsForWidget(JSON.parse(UserMetaDataStore.getPreferenceValue(UserPreference.RECENT_COLUMNS)), this.widgetType);
        super.initializeComponent();
        this.columnSelectorConfig.hasRemoveAll = false;
        this.columnSelectorConfig.hasSearch = false;
    }

    /**
     * Get option definitions
     */
    protected getOptionDefinitions(): Map<string, any> {
        return new Map(union(Object.entries(CoreDefinitionStore), Object.entries(DefinitionsStore), Object.entries(LiquidityStore)));
    }

    /**
     * Update column with derived settings
     */
    protected updateColumnWithDerivedSettings(column: ColumnConfig): void {
        ColumnUtils.updateColumnWithWidgetAndPortfolioSettings(column, WorkspaceStore.getCurrentPortfolio(), this.inputs, this.widgetType);
    }

    /**
     * Open save column set favorite modal
     */
    openSaveColumnSetModal(): void {
        this.appStore.saveFavoriteAction$.next(
            new SaveFavoriteAction(
                this.widgetInput,
                CoreFavoriteConstants.COLUMN_SET_LOWER,
                this.favoriteType,
                this.favoriteFolderType,
                () => this.updatedColumnOptionState()
            ));
    }

    /**
     * Updates the initial column option value that is compared against when detecting if a user has modified a column set
     */
    protected updatedColumnOptionState(): void {
        this.columnOptionUpdated$.next({column: this.selectedColumnConfig, isSaveUpdate: true});
    }

    /**
     * Open load column set favorite modal
     */
    openLoadColumnSetModal(): void {
        this.appStore.openLoadFavoriteModal$.next(
            new LoadFavoriteAction({
                type: this.favoriteType,
                treeType: this.favoriteFolderType,
                displayName: CoreFavoriteConstants.COLUMN_SET_LOWER + 's',
                callback: this.loadColumnSet,
                headerDisplayName: CoreFavoriteConstants.COLUMN_SET_LOWER
            }));
    }

    /**
     * Load a favorite column set
     * this function is used as callback so need arrow to get the right scope
     */
    loadColumnSet = (favId: number, loadingMessage: string, forceRefresh?: boolean): void => {
        this.loadColumnSetVersion(favId, loadingMessage, forceRefresh);
    };

    /**
     * Load a favorite column set
     * this function is used as callback so need arrow to get the right scope
     */
    loadColumnSetVersion = (favId: number, loadingMessage: string, forceRefresh?: boolean, global?: boolean, versionId?: string): void => {
        this.favoriteService
            .getFavorite$(favId, loadingMessage, false, forceRefresh, versionId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((columnSet: ColumnSet) => {
                    this.inputs.set('columns', columnSet);
                    this.widgetInput = columnSet;
                    // select the last column in order to initialize its column options
                    this.selectedColumnConfig = columnSet.columns[columnSet.columns.length - 1];
                    columnSet.columns.forEach((col: ColumnConfig) => {
                        ColumnUtils.updateColumnWithWidgetAndPortfolioSettings(col, WorkspaceStore.getCurrentPortfolio(), this.inputs, this.widgetType);
                    });
                    this.columnSetUpdated$.next(this.widgetInput);
                },
                (error) => {
                    this.notificationService.error('failed to load column set with id: ' + favId, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_FAVORITE_ERROR);
                    console.error(error);
                });
    };

    /**
     * Open save custom calc favorite modal
     */
    openSaveCustomCalcModal(columnTag: string): void {
        let saveFavoriteAction: SaveFavoriteAction
        if (columnTag === this.PGS_CUSTOM_CALCULATION) {
            saveFavoriteAction = new SaveFavoriteAction(
                this.selectedColumnConfig,
                CoreFavoriteConstants.PGS_CUSTOM_CALC_COLUMN_LOWER,
                CoreFavoriteConstants.PGS_CUSTOM_CALC_COLUMN,
                CoreFavoriteConstants.PGS_CUSTOM_CALC_COLUMN_FOLDER
            )
        } else {
            saveFavoriteAction = new SaveFavoriteAction(
                this.selectedColumnConfig,
                CoreFavoriteConstants.CUSTOM_CALC_COLUMN_LOWER,
                this.customCalcFavoriteType,
                CoreFavoriteConstants.CUSTOM_CALC_COLUMN_FOLDER
            )
        }
        this.appStore.saveFavoriteAction$.next(saveFavoriteAction);
    }

    /**
     * Open load custom calc favorite modal
     */
    openLoadCustomCalcModal(columnTag: string): void {
        let loadFavAction: LoadFavoriteAction;
        if (columnTag === this.PGS_CUSTOM_CALCULATION) {
            loadFavAction = new LoadFavoriteAction({
                type: CoreFavoriteConstants.PGS_CUSTOM_CALC_COLUMN,
                treeType: CoreFavoriteConstants.PGS_CUSTOM_CALC_COLUMN_FOLDER,
                displayName: CoreFavoriteConstants.PGS_CUSTOM_CALC_COLUMN_LOWER + 's',
                callback: this.loadCustomCalcColumn,
                headerDisplayName: CoreFavoriteConstants.PGS_CUSTOM_CALC_COLUMN_LOWER
            })
        } else {
            loadFavAction = new LoadFavoriteAction({
                type: this.customCalcFavoriteType,
                treeType: CoreFavoriteConstants.CUSTOM_CALC_COLUMN_FOLDER,
                displayName: CoreFavoriteConstants.CUSTOM_CALC_COLUMN_LOWER + 's',
                callback: this.loadCustomCalcColumn,
                headerDisplayName: CoreFavoriteConstants.CUSTOM_CALC_COLUMN_LOWER
            })
        }
        this.appStore.openLoadFavoriteModal$.next(loadFavAction);
    }

    /**
     * Load a favorite column set
     * this function is used as callback so need arrow to get the right scope
     */
    loadCustomCalcColumn = (favId: number, loadingMessage: string): void => {
        this.loadCustomCalcColumnVersion(favId, loadingMessage);
    }
    /**
     * Load a favorite column set
     * this function is used as callback so need arrow to get the right scope
     */
    loadCustomCalcColumnVersion = (favId: number, loadingMessage: string,  forceRefresh = false, isGlobal = false, versionId?: string): void => {
        this.favoriteService
            .getFavorite$(favId, loadingMessage, isGlobal, forceRefresh, versionId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((column: ColumnConfig) => {
                    column = column instanceof ColumnConfig ? column : new ColumnConfig(column);
                    // Done as part of https://webster.bfm.com/jira/browse/PM-17463
                    const suffix = CommonUtils.generateUniqueIdAsString();
                    column.columnKey = column.columnTag + '_' + suffix;
                    ColumnOptionUtils.updateColumnTitle(column, column.optionValues.find(option => option instanceof CustomTitleColumnOption), this.widgetType);
                    const insertIndex = this.widgetInput.columns.indexOf(this.selectedColumnConfig);
                    this.widgetInput.columns.splice(insertIndex, 1, column);
                    this.selectedColumnConfig = column;
                    this.selectedColumnConfig$.next(this.selectedColumnConfig);
                    this.columnOptionUpdated$.next({column: this.selectedColumnConfig, isSaveUpdate: false});
                },
                (error) => {
                    this.notificationService.error('failed to load column with id: ' + favId, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_FAVORITE_ERROR);
                    console.error(error);
                });
    };

    getColumnsOptionTitle(columnConfig: ColumnConfig): string {
        return isEmpty(columnConfig.optionValues) ? '' : (this.titleMod || columnConfig.columnTitle) + ' options';
    }

    /**
     * update user preferences for recent columns
     */
    updateRecentColumnsPreference(updatedRecentColumns: string[]) {
        this.widgetRecentColumns = updatedRecentColumns;
        let userRecentColumns = JSON.parse(UserMetaDataStore.getPreferenceValue(UserPreference.RECENT_COLUMNS));
        // initialize with empty object for the first time
        if (isNil(userRecentColumns)) {
            userRecentColumns = {};
        }
        LibColumnUtils.setRecentColumnsForWidget(userRecentColumns, this.widgetRecentColumns, this.widgetType);
        UserMetaDataStore.setPreferenceValue(UserPreference.RECENT_COLUMNS , JSON.stringify(userRecentColumns));
    }

    /**
     * Method called when categories are changed
     */
    onFilterBarDataChanged(event: CustomEvent<AuxFilterBarDataChangedInterface>): void {
        if (!event.detail) {
            return;
        }
        const {change, oldData, newData} = event.detail;
        // this is to avoid unnecessary changes when we dynamically update the filter bar data with categories and sub categories
        if (oldData.length !== newData.length || isEmpty(change)) {
            return;
        }
        // when main categories updated by search then return from here because the required updates are already done by onChildFilteredDataChanged
        if (isEmpty(this.filteredCategories) && oldData[0]?.data['length'] !== newData[0]?.data['length'] && this.searchString) {
            return;
        }

        this.categoriesData = newData;
        const changeLabel = change.length === 1 ? change[0].label : null;
        const isCategoriesUpdated = changeLabel === BaseColumnSetSettingsComponent.CATEGORIES;
        const isSubCategoriesUpdated = changeLabel === BaseColumnSetSettingsComponent.SUB_CATEGORIES;
        const isSubCategoriesL2Updated = changeLabel === BaseColumnSetSettingsComponent.SUB_CATEGORIES_L2;

        this.filteredCategories = this.getFilteredData(newData[0]?.data, 0);
        this.filteredSubCategories = this.getFilteredData(newData[1]?.data);
        this.filteredSubCategoriesL2 = this.getFilteredData(newData[2]?.data);

        this.sourceDataUpdated$.next(this.getFilteredAvailableColumns(isCategoriesUpdated, isSubCategoriesUpdated, isSubCategoriesL2Updated));
        if (this.searchString) {
            this.searchTermSubject$.next(this.searchString);
        }

    }

    /**
     * Get filtered available columns
     */
    private getFilteredData(data: AuxFacetedFilterOptionData, level?: number): string[] {
        if (isEmpty(data)) {
            return [];
        }
        // For Main categories we need to prepare the data differently of type AuxFacetedFilterOptionMultiSelectData
        if (level === 0) {
            return (data as AuxFacetedFilterOptionMultiSelectData).filter((category: ExploreCheckbox) => category.checked).map(selectedCategory => selectedCategory.label);
        }
        return (data as AuxFacetedFilterOptionMultiSelectGroupedData).flatMap((group: AuxFacetedFilterMultiSelectGroup) => group.options.filter((option: ExploreCheckbox) => option.checked).map(selectedCategory => selectedCategory.label));
    }

    /**
     * Method called when categories are changed
     */
    onResetAllClicked(): void {
        this.resetAllFilters();
        this.sourceDataUpdated$.next(this.getFilteredAvailableColumns(true, true, true));
        if (this.searchString) {
            this.searchTermSubject$.next(this.searchString);
        }
    }

    /**
     * Method called on search value change
     */
    columnSearchValueChanged(event: CustomEvent<AuxSearchFieldSearchValueChangedDetailInterface>): void {
        const searchValue = event.detail.submitValue.searchValue;
        // scenario when search value is cleared and no filter is applied
        if (this.searchString && !searchValue) {
            // when no filter is applied
            if (this.areAllFiltersEmpty()) {
                this.sourceDataUpdated$.next(this.getFilteredAvailableColumns(true, true, true));
            } else if (!isEmpty(this.filteredCategories) && isEmpty(this.filteredSubCategories) && isEmpty(this.filteredSubCategoriesL2)) { // when main category filter is applied
                this.searchString = searchValue;
                this.sourceDataUpdated$.next(this.getFilteredAvailableColumns(true, false, false));
            } else if (!isEmpty(this.filteredCategories) && !isEmpty(this.filteredSubCategories) && isEmpty(this.filteredSubCategoriesL2)) { // when main and sub category filter is applied
                this.searchString = searchValue;
                this.sourceDataUpdated$.next(this.getFilteredAvailableColumns(false, true, false));
            }
        } else { // this is to update the source list when search value is changed to a non-empty string but categories are not changed
            this.sourceDataUpdated$.next(this.getFilteredAvailableColumns(false, false, false));
        }
        this.searchString = searchValue;
        this.searchTermSubject$.next(searchValue);
    }

    /**
     * check if all the filters are empty
     */
    areAllFiltersEmpty(): boolean {
        return isEmpty(this.filteredCategories) && isEmpty(this.filteredSubCategories) && isEmpty(this.filteredSubCategoriesL2);
    }

    /**
     * reset all the filters
     */
    private resetAllFilters(): void {
        this.filteredCategories = [];
        this.filteredSubCategories = [];
        this.filteredSubCategoriesL2 = [];
    }

    /**
     * Method called on search by value change
     */
    onSearchByChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.searchBy = (event.detail.value as AuxSelectOption).displayValue;
    }

    /**
     * Method called when child visible filtered data is changed
     */
    onChildFilteredDataChanged(updatedCategories: ColumnSelectorOption[]) {
        if (isEmpty(updatedCategories)) {
            return;
        }

        // scenario when reset all clicked
        if (!isEmpty(this.filteredCategories) && !isEmpty(this.filteredSubCategories) && !isEmpty(this.filteredSubCategoriesL2) && this.searchString) {
            return;
        }

        // when no filter is applied and searching for a column then update main categories
        if (isEmpty(this.filteredCategories)) {
            const auxFilterBarData = this.initializeCategories(updatedCategories, true);
            this.categoriesData = [auxFilterBarData];
            return;
        }

        // when main category filter is applied and searching for a column then update sub categories
        if (isEmpty(this.filteredSubCategories)) {
            const updatedSubCategories = this.updateCategories(1, updatedCategories, true);
            if (this.isSubCategoriesUpdateRequired(updatedSubCategories, 1)) {
                this.categoriesData = [this.categoriesData[0], updatedSubCategories];
            }
            return;
        }

        // when main and sub category filter is applied and searching for a column then update sub categories at level 2
        if (isEmpty(this.filteredSubCategoriesL2)) {
            const updatedSubCategoriesL2 = this.updateCategories(2, updatedCategories, true);
            if (this.isSubCategoriesUpdateRequired(updatedSubCategoriesL2, 2)) {
                this.categoriesData = [this.categoriesData[0], this.categoriesData[1], updatedSubCategoriesL2];
            }
        }
    }

    /**
     * Method to check if sub categories need to be updated
     * @param updatedSubCategoriesData
     */
    isSubCategoriesUpdateRequired(updatedSubCategories: AuxFilterBarData, subCategoryLevel: number): boolean {
        const updatedSubCategoriesData = updatedSubCategories.data as AuxFacetedFilterOptionMultiSelectGroupedData;
        // means no sub categories are present to update
        if (updatedSubCategoriesData?.length === 0) {
            return false;
        }
        return !this.isSubCategoryDataSame(updatedSubCategoriesData, subCategoryLevel);
    }

    /**
     * Method to check if sub categories data is same for given level
     * @param updatedSubCategoriesData
     * @param subCategoryLevel
     */
    isSubCategoryDataSame(updatedSubCategoriesData: AuxFacetedFilterOptionMultiSelectGroupedData, subCategoryLevel: number): boolean {
        const updatedSubCategoriesOptions = updatedSubCategoriesData?.flatMap(data => data?.options)?.map(option => option.label + ' ' + option.facetCount);
        const oldSubCategoriesOptions = (this.categoriesData[subCategoryLevel]?.data as AuxFacetedFilterOptionMultiSelectGroupedData)?.flatMap(oldData => oldData.options)?.map(option => option.label + ' ' + option.facetCount);
        if (updatedSubCategoriesOptions?.length !== oldSubCategoriesOptions?.length) {
            return false;
        }
        const sortedUpdatedOptions = [...updatedSubCategoriesOptions].sort();
        const sortedOldOptions = [...oldSubCategoriesOptions].sort();
        return sortedUpdatedOptions.every((option, index) => option === sortedOldOptions[index]);
    }

}
