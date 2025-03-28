import {ColumnConfig} from '@blk/explore-ui-core';
import {ColumnDataType, HighlightRule, HighlightSettings} from '@blk/explore-ui-column-option';

/**
 * Base class for Highlight Rules that highlight based on the values of the leaf nodes
 */
export abstract class NumericalAggregateHighlightRule extends HighlightRule {

    protected constructor(highlightSetting: HighlightSettings, columnConfig: ColumnConfig, dataColumnIndex: number, columnValues: any[]) {
        super(highlightSetting, columnConfig, dataColumnIndex, columnValues);
    }

    /**
     * Checks if the rule can be applied to the column data type
     */
    protected isValidRule(): boolean {
        const columnDataType = ColumnDataType[this.columnDefinition.dataType];
        return columnDataType === ColumnDataType.DOUBLE
            || columnDataType === ColumnDataType.INT;
    }

    /**
     * Computes, scales, and formats values needed for applying the highlight rule
     * NumericalAggregateHighlightRules do not require formatting because they are always numbers
     */
    protected setComparisonValues() {
        return;
    }
}
