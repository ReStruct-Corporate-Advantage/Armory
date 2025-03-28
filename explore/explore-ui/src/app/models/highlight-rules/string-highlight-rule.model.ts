import {isString} from 'lodash';
import {
    ColumnDataType,
    HighlightComparisonType,
    HighlightRule,
    HighlightSettings,
    RuleColors
} from '@blk/explore-ui-column-option';
import {ColumnConfig} from '@blk/explore-ui-core';

/**
 * Highlight Rules for string matching comparisons
 */
export class StringHighlightRule extends HighlightRule {

    constructor(highlightSetting: HighlightSettings, columnConfig: ColumnConfig, dataColumnIndex: number, columnValues: any[]) {
        super(highlightSetting, columnConfig, dataColumnIndex, columnValues);
    }

    /**
     * Checks if the rule can be applied to the column data type
     */
    protected isValidRule(): boolean {
        const columnDataType = ColumnDataType[this.columnDefinition.dataType];
        return columnDataType === ColumnDataType.STRING
            || columnDataType === ColumnDataType.RATING;
    }

    /**
     * Determines if data value meets rule criteria for color to be applied to the cell
     */
    protected evaluateColors(dataCellValue: string): RuleColors {
        if (!isString(dataCellValue)) {
            return null;
        }
        const comparisonValue: string = String(this.comparisonValues[0]);

        let isConditionMet = false;
        switch (this.highlightSetting.comparisonType) {
            case HighlightComparisonType.CONTAINS:
                isConditionMet = dataCellValue.includes(comparisonValue);
                break;
            case HighlightComparisonType.DOES_NOT_CONTAIN:
                isConditionMet = !dataCellValue.includes(comparisonValue);
                break;
            case HighlightComparisonType.STARTS_WITH:
                isConditionMet = dataCellValue.startsWith(comparisonValue);
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
