import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {
    ColumnFilter,
    ColumnSet,
    CustomCalculationColumnOption,
    FxFactorOptionsColumnOption,
    LibColumnUtils,
    NumericColumnFormatColumnOption
} from '@blk/explore-ui-column-option';
import {
    AbstractColumnOption,
    ColumnConfig,
    ColumnConstants,
    ColumnDefinition,
    ConfigTypeFactory,
    CoreColumnConstants, CoreColumnUtils, FormatConstants,
    isDerivedSetting, NumericColumnFormat, PositionType,
    TableColumnState,
    WidgetConfigInput,
    WidgetConfigType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {OptimizationConstraint} from '@models/definitions/optimization/optimization-constraint.model';
import {CompositionConfig} from '@models/portfolio/composition/composition-config.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {DefinitionsStore} from '@stores/definitions.store';
import {ColDef} from 'ag-grid-community';
import {isEmpty, isNil, mapValues} from 'lodash';
import {CommonConstants} from '@constants/common.constants';
import {FactorTimeSeriesSelectedOption} from '@enums/factor-time-series-selected-option.enum';
import {ColumnBreakdown} from '@blk/explore-ui-breakdown';
import {SUB_TYPE_SECTOR_CONSTRAINTS} from '@optimization-settings/constants/optimization-types.constants';
import {isNotDeprecatedActiveSectorConstraint} from '@optimization-settings/constraints-settings/utils/constraint.utils';

export class ColumnUtils {

    /**
     * Method that will create tooltip(column name and description) for available and selected column list.
     * @param column - columns source
     */
    public static createTooltip(column: ColumnDefinition): string {
        let toolTip = column.title;
        // if a description is defined in the column the append the description to the tooltip.
        if (column.columnDesc) {
            toolTip = toolTip + '\n\nDefinition:\n' + column.columnDesc;
        }
        return toolTip;
    }

    /**
     * Update column options of the passed in column with portfolio or widget settings
     */
    static updateColumnWithWidgetAndPortfolioSettings(column: ColumnConfig, portfolio: Portfolio, widgetInputs: Map<string, WidgetInput>, widgetType: string) {
        // For column level, samplingPeriod and statisticPeriods are "Widget Default" for EXPOST_STATS and EXPOST_TIME_SERIES,
        // and in that case we want to skip them while updating default settings with derived settings.
        let updateColumnOnlySettings: boolean;
        if (widgetType === WidgetConfigType.EXPOST_STATS || widgetType === WidgetConfigType.EXPOST_TIME_SERIES) {
            updateColumnOnlySettings = true;
        }
        column.optionValues.forEach((optionValue: AbstractColumnOption) => {

            if (optionValue instanceof CustomCalculationColumnOption) {
                mapValues(optionValue.measureMapping, value => this.updateColumnWithWidgetAndPortfolioSettings(value, portfolio, widgetInputs, widgetType));
            }

            if (isDerivedSetting(optionValue)) {
                if (isNil(optionValue.getParentWidgetSettingKey())) {
                    return;
                }
                let defaultSettings = widgetInputs ? widgetInputs.get(optionValue.getParentWidgetSettingKey()) : null;
                if (!defaultSettings) {
                    defaultSettings = portfolio[optionValue.getParentPortfolioSettingKey()];
                }
                optionValue.updateDerivedSettings(defaultSettings, updateColumnOnlySettings);
            }
        });
    }

    static isDerivedColumn(column: ColumnConfig): boolean {
        const columnDef: any = LibColumnUtils.getColumnDefinition(column);
        return (columnDef && isNil(columnDef.field)) || ColumnUtils.isActiveColumn(column);
    }

    /**
     * Checks if the column passed has PORT use type
     */
    static isPortColumn(column: ColumnConfig): boolean {
        return column.positionColumnType && column.positionColumnType === CoreColumnConstants.USE_TYPES.PORT;
    }

    /**
     * Checks if the column passed has ACTIVE use type
     */
    static isActiveColumn(column: ColumnConfig): boolean {
        return column.positionColumnType && column.positionColumnType === CoreColumnConstants.USE_TYPES.ACTIVE;
    }

    /**
     * Checks if the column passed in is a Risk column
     */
    static isRiskColumn(column: ColumnConfig): boolean {
        const columnDef: any = LibColumnUtils.getColumnDefinition(column);
        return columnDef.groups && columnDef.groups.length === 1 && columnDef.groups[0] === 'Portfolio Risk';
    }

    /**
     * Extracts the default columns from the widget congfig
     * @param widgetConfigInputs  Widget defaults
     */
    static getWidgetConfigColumns(widgetConfigInputs: WidgetConfigInput[]): ColumnConfig[] {
        if (!widgetConfigInputs) {
            return [];
        }
        const columnConfig: WidgetConfigInput = widgetConfigInputs.find((inputConfig) => inputConfig.inputName === WidgetInputType.COLUMNS);
        if (!columnConfig) {
            return [];
        }
        const defaultColumnSet = ConfigTypeFactory.createConfig(columnConfig.default, columnConfig.inputConfigType, false) as ColumnSet;
        return defaultColumnSet.columns;
    }

    /**
     * Create column tree for optimization constraint.
     */
    static createConstraintMeasures(type: string, columnFilters?: ColumnFilter[], isConstraint?: boolean): AuxAdvancedTreeListInterface[] {
        let result = DefinitionsStore.optimizationConstraint.filter((optimizationConstraint: OptimizationConstraint) => optimizationConstraint.constraintType === type);
        if (columnFilters) {
            result = result.filter((optimizationConstraint: ColumnDefinition) => {
                for (const filter of columnFilters) {
                    if (!LibColumnUtils.doesColumnPassFilter(filter, optimizationConstraint)) {
                        return false;
                    }
                }
                return true;
            });
        }
        if (type === SUB_TYPE_SECTOR_CONSTRAINTS) {
            result = result.filter(optimizationConstraint => isNotDeprecatedActiveSectorConstraint(optimizationConstraint.uses, optimizationConstraint.columnTag));
        }
        return LibColumnUtils.prepareColumnTree(result);
    }

    /**
     * Update coldefs widths for composition table
     */
    static updateCompositionTableColDefsWidth(defaultColumnDefs: ColDef[], compositionConfig: CompositionConfig): ColDef[] {
        if (!(compositionConfig && compositionConfig.columnState && !isEmpty(compositionConfig.columnState.columns))) {
            return defaultColumnDefs;
        }
        if ((compositionConfig && compositionConfig.columnState && !isEmpty(compositionConfig.columnState.columns))) {
            defaultColumnDefs.forEach((colDef: ColDef) => {
                // update width of child columns
                const childColumns = (colDef as any).children;
                if (!isEmpty(childColumns)) {
                    childColumns.forEach(column => ColumnUtils.assignWidthToColumn(column, compositionConfig.columnState.columns));
                } else {
                    ColumnUtils.assignWidthToColumn(colDef as any, compositionConfig.columnState.columns);
                }
            });
        }
        return defaultColumnDefs;
    }

    /**
     * Assign width to column
     */
    static assignWidthToColumn(column: any, columns: TableColumnState[]): void {
        column.width = !isEmpty(columns.filter(col => col.columnKey === column.field)) ? columns.filter(col => col.columnKey === column.field)[0].width : column.width;
    }

    /**
     * Checks if the column passed in is a Style column
     */
    static isStyleColumn(columnTag: string): boolean {
        return !isEmpty(columnTag) && ColumnConstants.STYLE_COLUMN === CoreColumnUtils.getColumnDefByTag(columnTag)?.groups?.[0];
    }

    /**
     * Create Aux-Menu options for Action Column
     * @return any[]
     */
    static createActionColMenu(actionColMenuOptions): any[] {
        if (isNil(actionColMenuOptions)) {
            return [];
        }
        const options = [];
        let temp = [];
        for (const menuItemDef of actionColMenuOptions) {
            if (menuItemDef === CommonConstants.SEPARATOR) {
                options.push([...temp]);
                temp = [];
            } else {
                const opt = { label: menuItemDef.name, eventData: { action: menuItemDef.action }};
                if (!isNil(menuItemDef.subMenu)) {
                    opt['flyoutData'] = this.createActionColMenu(menuItemDef.subMenu);
                }
                temp.push(opt);
            }
        }
        if (temp.length > 0) {
            options.push([...temp]);
        }
        return options;
    }

    /**
     * Update FxFactorColumnOption
     */
    static updateFxFactorColumn(column: ColumnConfig, portfolio: Portfolio): void {
        if (column.columnTag.includes(ColumnConstants.FX_FACTOR_TYPE)) {
            const fxFactorColumnOption = column.optionValues.find(col => col.configType === FxFactorOptionsColumnOption.CONFIG_TYPE) as FxFactorOptionsColumnOption;
            if (!isNil(fxFactorColumnOption) && isNil(fxFactorColumnOption.fxCrossCurrency)) {
                fxFactorColumnOption.fxCrossCurrency = portfolio.currency;
            }
        }
    }

    /**
     * Condition for Hiding column level risk settings for Factor Data Widget
     */
    static checkToHideColumnRiskSettingsFactorDataWidget(isTimeSeriesMode: boolean, factorTimeSeriesSelectedOption: string): boolean {
        return !isTimeSeriesMode || factorTimeSeriesSelectedOption === FactorTimeSeriesSelectedOption.FACTOR_LEVELS || factorTimeSeriesSelectedOption === FactorTimeSeriesSelectedOption.FACTOR_RETURNS || factorTimeSeriesSelectedOption === FactorTimeSeriesSelectedOption.CUMULATIVE_RETURNS;
    }

    /**
     * Condition for showing factor permission column in factor summary table in Factor Data widget settings
     * @param factorTimeSeriesSelectedOption string
     */
    static checkToShowFactorLevelPermissionColumn(factorTimeSeriesSelectedOption: string): boolean {
        return factorTimeSeriesSelectedOption === FactorTimeSeriesSelectedOption.FACTOR_LEVELS || factorTimeSeriesSelectedOption === FactorTimeSeriesSelectedOption.FACTOR_RETURNS || factorTimeSeriesSelectedOption === FactorTimeSeriesSelectedOption.CUMULATIVE_RETURNS;
    }

    /**
     * check for ColumnId to configure the widget spritelet to launch row based
     */
    static checkIfColumnIsRowBasedForSpriteletLaunch(columnId: string): boolean {
        return columnId === ColumnConstants.AGGRID_AUTO_COLUMN || columnId === ColumnConstants.ACTION_COL;
    }


    /**
     * get scaling label for column using columnConfig ,column definition and NumericColumnFormatColumnOption
     */
    static getScalingLabel(columnConfig: ColumnConfig): string {
        const columnDef = LibColumnUtils.getColumnDefinition(columnConfig);
        const numericColFormat = columnDef?.columnFormat instanceof NumericColumnFormat ? columnDef.columnFormat : undefined;
        if (!numericColFormat) {
            return undefined;
        }
        const numericColumnFormatColumnOption = columnConfig.optionValues.find(col => col.configType === NumericColumnFormatColumnOption.CONFIG_TYPE) as NumericColumnFormatColumnOption;
        const defaultScalingOptionsOrder = FormatConstants.FORMAT_AND_SCALE_COLUMN_OPTION.SCALING_OPTIONS_ORDER;
        const scalingFactor = numericColumnFormatColumnOption?.scaling || numericColFormat?.scalingFactor;
        for (const scale of defaultScalingOptionsOrder) {
            const scaleOption = numericColFormat.scalingOptions?.get(scale);
            if (scaleOption && scalingFactor === scaleOption) {
                return scale;
            }
        }
        return undefined;
    }

    /**
     * Checks if any non-numerical column is present in the widget
     */
    static isNonNumericalPGSColumn(inputs: Map<string, WidgetInput>): boolean {
        const columnSet: ColumnSet = inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
        const nonNumericalColumns = columnSet.columns.filter(column => {
            const dataType = CoreColumnUtils.getColumnDefByTag(column.columnTag).dataType;
            return !((dataType === ColumnConstants.COLUMN_DATA_TYPE.DOUBLE) || (dataType === ColumnConstants.COLUMN_DATA_TYPE.INT));
        });
        if (nonNumericalColumns.length === 1 && nonNumericalColumns[0].columnTag === ColumnConstants.PORTFOLIO) {
            return nonNumericalColumns.length === columnSet.columns.length;
        }
        return (!isNil(nonNumericalColumns) && nonNumericalColumns.length > 1);
    }

    /**
     * Will return true if any column has a valid column breakdown and won't check further
     * @param columnSet ColumnSet
     */
    static hasAnyColumnBreakdown(columnSet: ColumnSet): boolean {
        let hasColumnBreakdown = false;
        for (const column of columnSet.columns) {
            hasColumnBreakdown = !isNil(column.optionValues.find(optionvalue => optionvalue instanceof ColumnBreakdown && optionvalue.isValid()));
            if (hasColumnBreakdown) {
                break;
            }
        }
        return hasColumnBreakdown;
    }

    /**
     * This method will see modifications as the risk columns become multi-manager enabled
     */
    static isMultiManagerEnabledColumn(column: ColumnConfig) {
        return [
            PositionType.BENCH_L1.toString(),
            PositionType.BENCH_L2.toString(),
            PositionType.BENCH_L3.toString()
        ].includes(column.positionColumnType);
    }
}
