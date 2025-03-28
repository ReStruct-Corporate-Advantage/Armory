import {Component} from '@angular/core';
import {
    AuxCheckboxGroupChangedDetailInterface,
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {BaseColumnOptionComponent, CustomCalculationConstants, LibColumnUtils} from '@blk/explore-ui-column-option';
import {
    ColumnConstants,
    ColumnDefinition,
    CoreFavoriteConstants,
    CoreWidgetConfigStore,
    ExploreCheckbox,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    TokenConstants,
    TokenUtils,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {
    Breakdown,
    BreakdownBuilderSettings,
    BreakdownFavoriteConstants,
    ColumnBreakdown,
    ColumnSector,
    MultiManagerBreakdownModel
} from '@blk/explore-ui-breakdown';
import {ColumnUtils} from '@utils/column.utils';
import {cloneDeep, find, without} from 'lodash';
import {MultiManagerConstants} from '@constants/multi-manager.constants';
import {CommonConstants} from '@constants/common.constants';
import {MultiManagerUtils} from '@utils/multi-manager.utils';

@Component({
    selector: 'app-column-breakdown-column-option',
    templateUrl: './column-breakdown-column-option.component.html',
    styleUrls: ['./column-breakdown-column-option.component.scss']
})
export class ColumnBreakdownColumnOptionComponent extends BaseColumnOptionComponent<ColumnBreakdown> {
    public static OPTION_KEY = 'columnBreakdown';
    public static HIDE_TOTAL = 'Show \'Total\' column';
    public static HIDE_OTHER = 'Show \'Other\' column';
    public static HIDE_EMPTY_COLUMNS = 'Display empty columns';

    supportsMultipleTypes: boolean;
    isPortGroupBreakdown: boolean;
    showNormalizeBreakdownOption: boolean;
    showFullPortfolioNameBreakdownOption: boolean;
    showGroupByPortBenchActiveBreakdownOption: boolean;

    breakdownBuilderSettings: BreakdownBuilderSettings;
    favoriteType: string;
    favoriteFolderType: string;
    selectedBreakdownType: ExploreSelectOption;
    breakdownTypeOptions: ExploreSelectOptionGroup[];
    hideCheckboxData: ExploreCheckbox[];
    favoriteConstants = BreakdownFavoriteConstants;
    multiManagerOptions: any;
    multiManagerInputData: MultiManagerBreakdownModel;

    isRASColumn: boolean;
    isMultiManagerEnabled: boolean;


    protected initializeComponent(): void {
        super.initializeComponent();
        const columnDefinition: ColumnDefinition = LibColumnUtils.getColumnDefinition(this.column);
        this.isRASColumn = columnDefinition?.isRASColumn;

        if (this.optionValue.multiManagerData) {
            this.multiManagerInputData = this.optionValue.multiManagerData;
        } else {
            this.optionValue.multiManagerData = new MultiManagerBreakdownModel();
        }

        // Set the favorite type and favTree type based on the columnBreakdown
        this.favoriteType = this.optionValue && this.optionValue.isFactorBreakdown ? BreakdownFavoriteConstants.FACTOR_BREAKDOWN : BreakdownFavoriteConstants.BREAKDOWN;
        this.favoriteFolderType = this.favoriteType + CoreFavoriteConstants._FOLDER;

        if (TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_MULTI_MANAGER) && TokenUtils.isValueDelimitedFeatureEnabled(TokenConstants.EXPLORE_ENABLE_MULTI_MANAGER_UI, CommonConstants.COLUMN_KEY_SPLITTER, MultiManagerConstants.WIDGET_TYPE_TO_TOKEN_VAL_MAP.get(this.widgetType))) {
            this.multiManagerOptions = this.createMultiManagerOptions();
            this.isMultiManagerEnabled = this.multiManagerOptions != null;
        }

        // Create the checkbox options
        this.hideCheckboxData = [
            new ExploreCheckbox(ColumnBreakdownColumnOptionComponent.HIDE_TOTAL, !this.optionValue.breakdownHideTotal, false),
            new ExploreCheckbox(ColumnBreakdownColumnOptionComponent.HIDE_OTHER, !this.optionValue.breakdownHideOther, false),
            new ExploreCheckbox(ColumnBreakdownColumnOptionComponent.HIDE_EMPTY_COLUMNS, !this.optionValue.breakdownHideWithNoValues, false)
        ];

        if (MultiManagerUtils.isMMDecompositionDisabled(this.multiManagerInputData)) {
            this.breakdownTypeOptions = this.createBreakdownTypeOptions();
        } else {
            this.supportsMultipleTypes = false;
        }

        this.updateBreakdownBuilderSettings();
    }

    /**
     * Get the type of option value this component should create.
     */
    protected getOptionValueConfigType(): string {
        return ColumnBreakdown.CONFIG_TYPE;
    }

    /**
     * Create the breakdown type options
     */
    createBreakdownTypeOptions(): ExploreSelectOptionGroup[] {
        const breakdownTypes: ExploreSelectOption[] = [];
        const sectorBreakdown = new ExploreSelectOption('Sector breakdown', BreakdownFavoriteConstants.BREAKDOWN, this.favoriteType === BreakdownFavoriteConstants.BREAKDOWN);
        const optionAttributes = this.option.columnOptionAttributes[0];
        // Check if there are options specified
        if (optionAttributes.values) {

            // Check if sector breakdown is available
            const sectorAttribute = optionAttributes.values.find((attribute: any) => attribute.label === 'hasSectorBreakdown');
            if (sectorAttribute.value) {
                breakdownTypes.push(sectorBreakdown);
                if (this.favoriteType === BreakdownFavoriteConstants.BREAKDOWN) {
                    this.selectedBreakdownType = sectorBreakdown;
                }
            }
            // Check if factor breakdown is available
            const factorAttribute = optionAttributes.values.find((attribute: any) => attribute.label === 'hasFactorBreakdown');
            if (factorAttribute.value) {
                const factorBreakdown = new ExploreSelectOption(
                    'Factor breakdown',
                    BreakdownFavoriteConstants.FACTOR_BREAKDOWN,
                    this.favoriteType === BreakdownFavoriteConstants.FACTOR_BREAKDOWN
                );
                breakdownTypes.push(factorBreakdown);
                if (this.favoriteType === BreakdownFavoriteConstants.FACTOR_BREAKDOWN) {
                    this.selectedBreakdownType = sectorBreakdown;
                }
            }
        } else {
            sectorBreakdown.isSelected = true;
            breakdownTypes.push(sectorBreakdown);
        }
        this.supportsMultipleTypes = breakdownTypes.length > 1;
        return [new ExploreSelectOptionGroup(breakdownTypes)];
    }

    /**
     * Update the BreakdownBuilderSettings of the component
     */
    updateBreakdownBuilderSettings(): void {

        const breakdownBuilderSettings = new BreakdownBuilderSettings();
        breakdownBuilderSettings.favoriteType = this.favoriteType;
        breakdownBuilderSettings.favoriteFolderType = this.favoriteFolderType;

        if (this.favoriteType === BreakdownFavoriteConstants.FACTOR_BREAKDOWN) {
            this.optionValue.isFactorBreakdown = true;
            // Set the inputName to riskFactorBreakdown so the breakdown component knows to grab the correct favorite types
            breakdownBuilderSettings.inputName = 'riskFactorBreakdown';
        } else {
            // Else, reset the inputName to empty string
            this.optionValue.isFactorBreakdown = false;
            breakdownBuilderSettings.inputName = '';
        }

        // Determine Normalize option visibility
        this.determineNormalizeOptionVisibility(this.optionValue.breakdown);

        const inputs = CoreWidgetConfigStore.getChartConfigForType(WidgetConfigType.PRA).inputCategories;
        const breakdownInputs = find(inputs, {categoryType: 'breakdown'})['inputs'];
        const breakdownEntry = find(breakdownInputs, {mandateSettingType: this.favoriteType});
        const filters: any[] = breakdownEntry['groupByColumnFilters'];
        const customFilters: any[] = breakdownEntry['customColumnFilters'];
        const eatFilter: any[] = breakdownEntry['EATBreakdownFilter'];
        breakdownBuilderSettings.fieldToUse = breakdownEntry['valueField'];


        if (this.column.columnTag === 'port_exp' || this.column.columnTag === 'bench_exp' || this.column.columnTag === 'active_exp') {
            breakdownBuilderSettings.columnFilter = cloneDeep(eatFilter);
            breakdownBuilderSettings.includeNoBreakdownOption = false;
            breakdownBuilderSettings.customSectorColumnFilter = cloneDeep(eatFilter);
        } else {
            // Set the column filters to the full list.
            breakdownBuilderSettings.columnFilter = cloneDeep(filters);

            // Set the custom sector column filters to the R&E filters.
            breakdownBuilderSettings.customSectorColumnFilter = cloneDeep(customFilters);
        }

        // Remove portfolio group exclusion as we want portfolio group column to be visible for column breakdown tree.
        // We only want this visible in the quick filter list.
        breakdownBuilderSettings.quickColumnFilter = without(
            breakdownBuilderSettings.columnFilter,
            find(breakdownBuilderSettings.columnFilter, {
                key: 'columnTag',
                value: ColumnConstants.PORTFOLIO_GROUP
            })
        );

        // Quantiles not supported at column level
        breakdownBuilderSettings.hideQuantiles = true;

        this.breakdownBuilderSettings = breakdownBuilderSettings;
    }


    /**
     * Updates flags to determine which options to show based on the Breakdown passed in
     */
    determineNormalizeOptionVisibility(breakdown: Breakdown): void {
        // Validate breakdown tree contains only one node which is portfolio name.
        if (breakdown && !breakdown.isEmpty() && breakdown.children.length === 1 && breakdown.children[0] instanceof ColumnSector) {
            const sector = breakdown.children[0] as ColumnSector;
            const breakdownColTag = sector.columnTag;

            const isPortfolioNameBreakdown =
                breakdownColTag === ColumnConstants.PORTFOLIO_NAME || breakdownColTag === ColumnConstants.PORTFOLIO_FULL_NAME;

            // Check if user has applied port group normalize breakdown then initialize port group level.
            this.isPortGroupBreakdown = breakdownColTag === ColumnConstants.PORTFOLIO_GROUP;
            if (!this.isPortGroupBreakdown) {
                this.optionValue.portfolioGroupLevel = 1;
            }

            // if breakdown is other then portfolio name or group then hide normalize option else show.
            this.showNormalizeBreakdownOption = (isPortfolioNameBreakdown || this.isPortGroupBreakdown) && this.isNormalizeModeApplicable();
            this.showFullPortfolioNameBreakdownOption = isPortfolioNameBreakdown || this.isPortGroupBreakdown;
            this.showGroupByPortBenchActiveBreakdownOption = ColumnUtils.isPortColumn(this.column) && !this.isPortGroupBreakdown;

            // If showNormalize Option is not applicable then reset isGroupByPortBenchActive to false
            if (!this.showNormalizeBreakdownOption) {
                this.optionValue.isColumnBreakdownNormalize = false;
            } else if (
                this.showNormalizeBreakdownOption &&
                (!ColumnUtils.isPortColumn(this.column) || ColumnUtils.isRiskColumn(this.column))
            ) {
                // if column is active column or risk column and is eligible for normalize breakdown option, then by default select normalize chick box.
                this.optionValue.isColumnBreakdownNormalize = true;
            }

            // If groupByPortBench Option is not applicable then reset isGroupByPortBenchActive to false
            if (!this.showGroupByPortBenchActiveBreakdownOption) {
                this.optionValue.isGroupByPortBenchActive = false;
            }

            // If show Full PortfolioName Option is not applicable then reset showFullPortfolioName to false
            if (!this.showFullPortfolioNameBreakdownOption) {
                this.optionValue.isFullPortfolioName = false;
            }
        } else {
            this.resetColumnBreakdownOptions(false);
            this.showGroupByPortBenchActiveBreakdownOption = breakdown && !breakdown.isEmpty();
            this.optionValue.isGroupByPortBenchActive = this.showGroupByPortBenchActiveBreakdownOption && this.optionValue.isGroupByPortBenchActive;
        }
        this.showGroupByPortBenchActiveBreakdownOption = !this.isRASColumn;
    }

    /**
     * Checks if normalize mode is applicable based on the column
     */
    isNormalizeModeApplicable(): boolean {
        const columnDef: any = LibColumnUtils.getColumnDefinition(this.column);

        return (
            columnDef.isSubtotalable &&
            columnDef.reportTypes.indexOf('RETATT') === -1 &&
            columnDef.reportTypes.indexOf('BFRE') === -1 &&
            columnDef.reportTypes.indexOf('SINGLE') !== -1 &&
            columnDef.columnTag !== CustomCalculationConstants.CUSTOM_CALCULATION &&
            (ColumnUtils.isDerivedColumn(this.column) || ColumnUtils.isRiskColumn(this.column))
        );
    }

    /**
     * Resets the column breakdown options
     */
    resetColumnBreakdownOptions(resetAll: boolean): void {
        this.showFullPortfolioNameBreakdownOption = false;
        this.optionValue.isFullPortfolioName = false;
        this.showNormalizeBreakdownOption = false;
        this.optionValue.isColumnBreakdownNormalize = false;
        this.isPortGroupBreakdown = false;
        if (resetAll) {
            this.showGroupByPortBenchActiveBreakdownOption = false;
            this.optionValue.isGroupByPortBenchActive = false;
            this.optionValue.breakdownLevel = 1;
            this.optionValue.breakdownHideTotal = false;
            this.optionValue.breakdownHideOther = false;
        }
    }

    /**
     * Creates the multi-manager data from the column option attributes.
     * @returns A map containing the decomposition modes, or `null` if no decomposition modes are found.
     */
    createMultiManagerOptions(): any {
        const optionAttributes = this.option.columnOptionAttributes[0];

        const attributeValue = optionAttributes.values?.find((attribute: any) => attribute.label === 'decompositionModes');
        if (attributeValue) {
            return JSON.parse(attributeValue.value);
        }

        return null;
    }

    /**
     * Callback when the breakdown type is changed in the select box
     */
    onBreakdownTypeChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.favoriteType = (event.detail.value as AuxSelectOption).value;
        this.favoriteFolderType = this.favoriteType + CoreFavoriteConstants._FOLDER;
        this.optionValue.breakdown.copyFrom(new Breakdown());
        this.updateBreakdownBuilderSettings();
    }

    /**
     * Callback when the 'hide' checkbox options are changed
     */
    onCheckboxGroupChanged(event: CustomEvent<AuxCheckboxGroupChangedDetailInterface>): void {
        for (const checkbox of event.detail.value) {
            if (checkbox.label === ColumnBreakdownColumnOptionComponent.HIDE_TOTAL) {
                this.optionValue.breakdownHideTotal = !checkbox.checked;
            } else if (checkbox.label === ColumnBreakdownColumnOptionComponent.HIDE_OTHER) {
                this.optionValue.breakdownHideOther = !checkbox.checked;
            } else if (checkbox.label === ColumnBreakdownColumnOptionComponent.HIDE_EMPTY_COLUMNS) {
                this.optionValue.breakdownHideWithNoValues = !checkbox.checked;
            }
        }
    }

    /**
     * Callback when the breakdown level numeric stepper value is changed
     */
    onBreakdownLevelChanged(level: string): void {
        this.optionValue.breakdownLevel = Number(level);
    }

    /**
     * Callback when the portfolio group level numeric stepper value is changed
     */
    onPortfolioGroupLevelChanged(level: string): void {
        this.optionValue.portfolioGroupLevel = Number(level);
    }

    /**
     * Callback when the normalize breakdown checkbox option is changed
     */
    onNormalizeBreakdownOptionChanged(value: boolean): void {
        this.optionValue.isColumnBreakdownNormalize = value;
    }

    /**
     * Callback when the portfolio name breakdown checkbox option is changed
     */
    onFullPortfolioNameBreakdownOptionChanged(value: boolean): void {
        this.optionValue.isFullPortfolioName = value;
    }

    /**
     * Callback when the group by port/bench/active breakdown checkbox option is changed
     */
    onGroupByPortBenchActiveBreakdownOptionChanged(value: boolean): void {
        this.optionValue.isGroupByPortBenchActive = value;
    }

    /**
     * Callback when the selected breakdown type changes.
     * @param $event The new selected breakdown type.
     */
    onSelectedBreakdownTypeChange($event: string) {
        this.optionValue.multiManagerData.breakdownType = $event;
    }

    /**
     * Callback when the selected decomposition mode changes.
     * @param $event The new selected decomposition mode.
     */
    onSelectedDecompositionModeChange($event: string) {
        this.optionValue.multiManagerData.decompositionMode = $event;
        if($event === 'none') {
            this.breakdownTypeOptions = this.createBreakdownTypeOptions();
        }else{
            this.supportsMultipleTypes = false;
        }
    }

    /**
     * Callback when the selected decomposition type changes.
     * @param $event The new selected decomposition type.
     */
    onSelectedDecompositionTypeChange($event: string) {
        this.optionValue.multiManagerData.decompositionType = $event;
    }

    protected readonly BreakdownFavoriteConstants = BreakdownFavoriteConstants;
}
