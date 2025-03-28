import {AuxNumericStepperValueChangedDetailInterface, AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {MinValFilter} from '@models/widget/inputs/min-val-filter.model';
import {Component} from '@angular/core';
import {RiskConstants} from '@constants/risk.constants';
import {ColumnConfig, CoreColumnUtils, ExploreSelectOption, ExploreSelectOptionGroup, PortfolioRiskColumnCategoryDefinition} from '@blk/explore-ui-core';
import {BaseWidgetSettingComponent, ColumnSet, CustomTitleColumnOption} from '@blk/explore-ui-column-option';

@Component({
    selector: 'app-min-val-filter',
    templateUrl: './min-val-filter.component.html',
    styleUrls: ['./min-val-filter.component.scss']
})
export class MinValFilterComponent extends BaseWidgetSettingComponent<MinValFilter> {
    /**
     * fields for minValFilter
     */
    columns: ColumnSet;
    isSelectedColumnSubtotalAble: boolean;
    filterData: ExploreSelectOptionGroup[];
    widgetColumn: Array<ColumnConfig>;

    /**
     * Initialise component based on BaseWidgetSettingComponent
     */
    initializeComponent(): void {
        this.columns = this.getInput('columns') as ColumnSet;
        this.getAllWidgetColumns();
        this.setupDisplayDataForColumns();
        this.setSubtotalAbleColumn();
    }

    /**
     * Get all widget column for filter dropdown
     */
    getAllWidgetColumns() {
        this.widgetColumn = this.columns.columns.filter((col: ColumnConfig) => {
            const colDef = CoreColumnUtils.getColumnDefByTagAndUse(col.columnTag, col.positionColumnType);
            return colDef.dataType !== 'STRING';
        });
    }

    /**
     * Update Selection while selecting filter
     */
    onFilterSelectionChange(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        let selectedColumn = this.widgetColumn.find((col: ColumnConfig) => col.columnKey === (event.detail.value as AuxSelectOption).value);
        this.widgetInput.columnTag = selectedColumn.columnTag;
        this.widgetInput.columnKey = selectedColumn.columnKey;
        this.widgetInput.positionColumnType = selectedColumn.positionColumnType;
        this.widgetInput.title = selectedColumn.title;
        this.setSubtotalAbleColumn();
    }

    /**
     * Get the data in format of Aux-Selection
     */
    setupDisplayDataForColumns() {
        this.filterData = [new ExploreSelectOptionGroup()];
        this.widgetColumn.forEach((col: ColumnConfig) => {
            this.filterData[0].values.push(
                new ExploreSelectOption(this.getTitleForMinValFilter(col), col.columnKey, col.columnKey === this.widgetInput.columnKey)
            );
        });
    }

    /**
     * Return title for column
     * @param col
     */
    getTitleForMinValFilter(col: ColumnConfig): string {
        const customTitleOption = col.getOptionValueByConfigType(CustomTitleColumnOption.CONFIG_TYPE) as CustomTitleColumnOption;
        let customTitle: string = customTitleOption ? customTitleOption.customTitle : null;
        customTitle = !customTitle || /^\s*$/.test(customTitle) ? null : customTitle;
        return customTitle ? customTitle : col.columnTitle;
    }

    /**
     * Updating stepper value
     * @param event
     */
    onNumericValueChange(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        this.widgetInput.value = Number(event.detail.value);
    }

    /**
     * Toggle absolute radio button checked value
     */
    toggleAbsoluteValue() {
        this.widgetInput.useAbsolute = !this.widgetInput.useAbsolute;
    }

    /**
     * Set boolean true if column is subtotalAble other set it as false
     */
    setSubtotalAbleColumn() {
        // Initially setting it to false
        this.isSelectedColumnSubtotalAble = false;
        if (!this.widgetInput) {
            return;
        }

        const columnDef = CoreColumnUtils.getColumnDefByTagAndUse(
            this.widgetInput.columnTag,
            this.widgetInput.positionColumnType
        ) as PortfolioRiskColumnCategoryDefinition;
        if (columnDef && columnDef.matchingRiskCategories) {
            if (columnDef.matchingRiskCategories.includes(RiskConstants.MATCHING_RISK_CATEGORIES.IS_SUBTOTAL_ABLE)) {
                this.isSelectedColumnSubtotalAble = true;
            }
        }
    }
}
