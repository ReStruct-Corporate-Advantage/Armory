import compositionColumnsConfigJson from '@assets/composition-config/CompositionColumnsConfig.json';
import {
    AuxSelectOption,
    AuxSelectSelectionChangedDetailInterface,
    AuxTabBarSelectedDetailInterface
} from '@blk/aladdin-angular-components';
import {Component, Input, OnInit} from '@angular/core';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {
    Breakdown,
    BreakdownBuilderSettings,
    BreakdownFavoriteConstants,
    NormalizedFlag
} from '@blk/explore-ui-breakdown';
import {CommonConstants} from '@constants/common.constants';
import {CompositionConstants} from '@constants/composition.constants';
import {cloneDeep, isEmpty} from 'lodash';
import {
    ColumnConfig,
    ColumnConstants,
    ColumnOptionAttribute,
    CoreFavoriteConstants,
    ExploreSelectOption,
    ExploreSelectOptionGroup
} from '@blk/explore-ui-core';
import {
    ColumnFilter,
    ColumnOptionResponse,
    ColumnOptionService,
    ColumnOptionUtils,
    createColumnFilter
} from '@blk/explore-ui-column-option';
import {UtilConstants} from '@constants/util.constants';
import {ModellingType} from '@enums/modelling-type.enum';

@Component({
    selector: 'app-modelling-setting',
    templateUrl: './modelling-setting.component.html',
    styleUrls: ['./modelling-setting.component.scss']
})

/**
 * Modelling Setting component for composition setting
 */
export class ModellingSettingComponent implements OnInit {
    @Input() portfolio: WhatIfPortfolio;

    /**
     * Tab content header name
     */
    readonly COLUMNS = 'Columns';
    readonly BREAKDOWN = 'Breakdown';
    readonly FILTER = 'Filter';
    readonly DISPLAY = 'Display';

    selectedModellingOption = '0';
    modellingBreakdown: Breakdown;
    modellingBreakdownBuilderSetting: BreakdownBuilderSettings;
    availableColumnsForModeling: ExploreSelectOptionGroup[];
    isOptimizationCashBreakdownSettingVisible: boolean;
    title: string;
    modellingOptionsTabData = [
        {
            'label': this.COLUMNS,
            'uid': '0'
        },
        {
            'label': this.BREAKDOWN,
            'uid': '1'
        },
        {
            'label': this.FILTER,
            'uid': '2'
        },
        {
            'label': this.DISPLAY,
            'uid': '3'
        }];
    /**
     * Collection of options that the drop down can have
     */
    selectOptions: ExploreSelectOptionGroup[];

    /**
     * constructor
     */
    constructor(private columnOptionService: ColumnOptionService) {
    }

    /**
     * Initialize setting
     */
    ngOnInit(): void {
        this.getCompositionBreakdown();
        if (this.portfolio.isFactorExposureBasedComposition()) {
            this.initializeModellingOptionsForExposureBasedPort();
        } else {
            this.initializeModellingOptionsForWhatIfPort();
        }
    }

    private initializeModellingOptionsForWhatIfPort(): void {
        this.initializeBreakdownBuilderSettings();
        this.initializeAvailableColumns();
        this.isOptimizationCashBreakdownSettingVisible = this.portfolio instanceof WhatIfPortfolio && this.portfolio.modellingType === ModellingType.POSITION;
        this.columnOptionService.fetchColumnOptions$([{colTag: ColumnConstants.SECURITY_DESCRIPTION, use: UtilConstants.ALL}])
            .subscribe((response: ColumnOptionResponse[]) => {
                this.populateDropDownOptions(response[0].options[0].columnOptionAttributes[0]);
            });
    }

    private initializeModellingOptionsForExposureBasedPort(): void {
        this.selectedModellingOption = undefined;
        this.modellingOptionsTabData = [];
    }

    /**
     * initialize breakdown if it's undefined or haven't set
     */
    getCompositionBreakdown() {
        if (!this.modellingBreakdown) {
            this.modellingBreakdown = this.portfolio.compositionSetting.breakdownTree;
        }
    }

    /**
     * Initialize setting for breakdown
     */
    initializeBreakdownBuilderSettings() {
        this.modellingBreakdownBuilderSetting = new BreakdownBuilderSettings();
        this.modellingBreakdownBuilderSetting.fieldToUse = CommonConstants.COLUMN_TAG;
        this.modellingBreakdownBuilderSetting.widgetType = CommonConstants.COMPOSITION;
        this.modellingBreakdownBuilderSetting.favoriteType = BreakdownFavoriteConstants.BREAKDOWN;
        this.modellingBreakdownBuilderSetting.favoriteFolderType = BreakdownFavoriteConstants.BREAKDOWN + CoreFavoriteConstants._FOLDER;
        this.modellingBreakdownBuilderSetting.columnFilter = this.getColumnFilter();
        this.modellingBreakdownBuilderSetting.customSectorColumnFilter = this.getCustomColumnFilter();
    }

    /**
     * Initialize available columns for modeling
     */
    initializeAvailableColumns() {
        this.availableColumnsForModeling = [new ExploreSelectOptionGroup()];
        this.availableColumnsForModeling[0].values = this.getAvailableColumns().map(colConfig =>
            new ExploreSelectOption(colConfig.columnTitle, new ColumnConfig(colConfig)));
        if (!isEmpty(this.portfolio.compositionSetting.selectedColumns)) {
            this.portfolio.compositionSetting.selectedColumns.forEach(colConfig => {
                const columnToSelect = this.availableColumnsForModeling[0].values.find(option => (option.value as ColumnConfig).columnKey === colConfig.columnKey);
                if (columnToSelect) {
                    columnToSelect.isSelected = true;
                }
            });
        }
    }

    /**
     * return available columns for config
     */
    private getAvailableColumns() {
        return cloneDeep(compositionColumnsConfigJson['availableColumns']);
    }

    /**
     * Method called when selectedColumns is changed
     */
    onSelectedColumnsChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.portfolio.compositionSetting.selectedColumns = (event.detail.value as AuxSelectOption[]).map( (selectedColumn: ExploreSelectOption) => selectedColumn.value);
    }

    /**
     * Generates the list of drop down items.
     */
    populateDropDownOptions(colOptionAttribute: ColumnOptionAttribute): void {
        this.selectOptions = [new ExploreSelectOptionGroup()];
        this.title = colOptionAttribute.title;
        ColumnOptionUtils.populateFromColumnOptionAttribute(this.selectOptions[0], colOptionAttribute, isEmpty(this.portfolio.compositionSetting.secDescType) ? colOptionAttribute.defaultValue.value : this.portfolio.compositionSetting.secDescType);
    }

    /**
     * Event handler for selecting security type
     */
    setSelectedValue(selectOption: ExploreSelectOption) {
        this.portfolio.compositionSetting.secDescType = selectOption.value;
    }

    /**
     * Event handler for switching btw tabs
     * @param event
     */
    onTabSelected(event: CustomEvent<AuxTabBarSelectedDetailInterface>) {
        if (!event) {
            return;
        }

        this.selectedModellingOption = event.detail.uid;
    }

    /**
     * update in portfolio.applyFilter whatever filter is selected
     * @param value
     */
    updateAppliedFilter(value: string) {
        this.portfolio.applyFilterTo = value;
    }

    /**
     * updated normalized flag value coming from custom filter component
     */
    updateNormalizedCheckbox(flagValue: boolean): void {
        this.portfolio.compositionSetting.isNormalized = new NormalizedFlag(flagValue);
    }

    /**
     * return column filter for composition filter
     */
    private getColumnFilter(): ColumnFilter[] {
        return [
            createColumnFilter('isGroupable', '=', true),
            createColumnFilter('praadaBreakdown', '!=', true),
            createColumnFilter('columnTag', '!=', 'portfolio_group'),
            createColumnFilter('columnType', '!=', [CompositionConstants.FACTOR_ATTRIBUTES, CompositionConstants.GR_SECTOR]),
            createColumnFilter('uses', '!=', CompositionConstants.BENCH_ACTIVE_ARRAY),
            createColumnFilter('groups', '!=', CompositionConstants.LIQUIDITY_ARRAY)
        ];
    }

    /**
     * return custom column filter for composition filter
     */
    private getCustomColumnFilter(): ColumnFilter[] {
        return [
            createColumnFilter('isGroupable', '=', true),
            createColumnFilter('praadaBreakdown', '!=', true),
            createColumnFilter('columnType', '!=', [CompositionConstants.FACTOR_ATTRIBUTES]),
            createColumnFilter('uses', '!=', CompositionConstants.BENCH_ACTIVE_ARRAY),
            createColumnFilter('groups', '!=', CompositionConstants.LIQUIDITY_ARRAY),
            createColumnFilter('levelColumns', '=', 'undefined')
        ];
    }

    onOptimizationCashSettingChanged(isOptimizationCashSettingChecked: boolean) {
        this.portfolio.compositionSetting.isOptimizationCashSettingChecked = isOptimizationCashSettingChecked;
    }
}
