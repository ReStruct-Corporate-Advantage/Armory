import {ColumnBreakdown} from '@blk/explore-ui-breakdown';
import {AbstractColumnOption, ColumnConfig} from '@blk/explore-ui-core';

export class ConfigUtils {

    /**
     * check if column breakdown is a portfolio breakdown
     */
    static isColumnBreakdownPortfolioBreakdown(columnConfig: ColumnConfig): boolean {
        if (!columnConfig.hasOptionValues()) {
            return false;
        }

        const colBreakdown: ColumnBreakdown = columnConfig.optionValues.find(optionVal => optionVal instanceof ColumnBreakdown) as ColumnBreakdown;
        if (!colBreakdown || !colBreakdown.isValid()) {
            return false;
        }

        return colBreakdown.breakdown.hasPortfolioNameColumn();
    }

    /**
     * check if column breakdown is a macro factor
     */
    static isColumnBreakdownMacroFactor(columnConfig: ColumnConfig): boolean {
        if (!columnConfig.hasOptionValues()) {
            return false;
        }

        const colBreakdown: AbstractColumnOption = columnConfig.optionValues.find(optionVal => optionVal instanceof ColumnBreakdown);
        return colBreakdown instanceof ColumnBreakdown && colBreakdown.isValid() ? colBreakdown.breakdown.isMacroFactorBreakdown() : false;
    }
}
