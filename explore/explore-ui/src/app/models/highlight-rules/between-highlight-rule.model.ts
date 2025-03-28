import {ColumnConfig} from '@blk/explore-ui-core';
import {HighlightRule, HighlightSettings, ColumnDataType, RuleColors} from '@blk/explore-ui-column-option';

/**
 * Highlight Rule for highlighting cells falling between two values
 */
export class BetweenHighlightRule extends HighlightRule {

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
            || columnDataType === ColumnDataType.TIME_SPAN
            || columnDataType === ColumnDataType.DATE;
    }

    /**
     * Determines if data value meets rule criteria for color to be applied to the cell
     */
    protected evaluateColors(dataCellValue: number | Date): RuleColors {
        const startValue = this.comparisonValues[0];
        const endValue = this.comparisonValues[1];
        const isBetween = startValue < endValue
            ? (startValue <= dataCellValue) && (dataCellValue <= endValue)
            : (endValue <= dataCellValue) && (dataCellValue <= startValue);

        if (isBetween) {
            return {
                bgColor: this.highlightSetting.backGroundColors?.[0],
                fgColor: this.highlightSetting.foreGroundColors?.[0],
            };
        }
        return null;
    }
}
