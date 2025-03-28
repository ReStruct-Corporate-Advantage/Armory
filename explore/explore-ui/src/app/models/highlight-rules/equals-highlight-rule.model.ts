import {isEqual} from 'lodash';
import {ColumnConfig} from '@blk/explore-ui-core';
import {HighlightComparisonType, HighlightRule, HighlightSettings, RuleColors} from '@blk/explore-ui-column-option';

/**
 * Highlight rule for EQUAL and NOT EQUAL comparisons
 */
export class EqualsHighlightRule extends HighlightRule {

    constructor(highlightSetting: HighlightSettings, columnConfig: ColumnConfig, dataColumnIndex: number, columnValues: any[]) {
        super(highlightSetting, columnConfig, dataColumnIndex, columnValues);
    }

    /**
     * Checks if the rule can be applied to the column data type
     */
    protected isValidRule(): boolean {
        // any column type can have equals applied to it
        return true;
    }

    /**
     * Determines if data value meets rule criteria for color to be applied to the cell
     */
    protected evaluateColors(dataCellValue: string | number | Date): RuleColors {
        if (dataCellValue == null) {
            return null;
        }

        // EQUAL scenario
        let isConditionMet = isEqual(dataCellValue, this.comparisonValues[0]);

        // NOT EQUAL scenario
        if (HighlightComparisonType.DOES_NOT_EQUAL === this.highlightSetting.comparisonType) {
            isConditionMet = !isConditionMet;
        }

        return isConditionMet ? {
            bgColor: this.highlightSetting.backGroundColors?.[0],
            fgColor: this.highlightSetting.foreGroundColors?.[0],
        } : null;
    }
}
