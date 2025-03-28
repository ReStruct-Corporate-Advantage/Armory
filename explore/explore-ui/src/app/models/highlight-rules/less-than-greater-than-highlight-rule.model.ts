import {ColumnConfig} from '@blk/explore-ui-core';
import {HighlightRule, HighlightComparisonType, HighlightSettings, ColumnDataType, RuleColors} from '@blk/explore-ui-column-option';

/**
 * Highlight Rule for less than (or equal to), greater than (or equal to) comparisons
 */
export class LessThanGreaterThanHighlightRule extends HighlightRule {

    constructor(highlightSetting: HighlightSettings, columnConfig: ColumnConfig, dataColumnIndex: number, columnValues: any[]) {
        super(highlightSetting, columnConfig, dataColumnIndex, columnValues);
    }

    /**
     * Checks if the rule can be applied to the column data type
     */
    protected isValidRule(): boolean {
        const columnDataType = ColumnDataType[this.columnDefinition.dataType];
        return columnDataType === ColumnDataType.DOUBLE
            || columnDataType === ColumnDataType.INT
            || columnDataType === ColumnDataType.DATE
            || columnDataType === ColumnDataType.TIME_SPAN;
    }

    /**
     * Determines if data value meets rule criteria for color to be applied to the cell
     */
    protected evaluateColors(dataCellValue: number | Date): RuleColors {

        // flag for whether or not the data meets the highlight rule condition
        let isConditionMet = false;

        switch (this.highlightSetting.comparisonType) {
            case HighlightComparisonType.GREATER_THAN:
                isConditionMet = dataCellValue > this.comparisonValues[0];
                break;
            case HighlightComparisonType.GT_THAN_EQUAL:
                isConditionMet = dataCellValue >= this.comparisonValues[0];
                break;
            case HighlightComparisonType.LESS_THAN:
                isConditionMet = dataCellValue < this.comparisonValues[0];
                break;
            case HighlightComparisonType.LESS_THAN_EQUAL:
                isConditionMet = dataCellValue <= this.comparisonValues[0];
                break;
            default:
                break;
        }
        return isConditionMet ? {
            bgColor: this.highlightSetting.backGroundColors?.[0],
            fgColor: this.highlightSetting.foreGroundColors?.[0],
        } : null;
    }
}
