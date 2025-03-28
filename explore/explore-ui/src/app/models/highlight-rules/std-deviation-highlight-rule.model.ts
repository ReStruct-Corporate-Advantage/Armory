import {NumericalAggregateHighlightRule} from '@models/highlight-rules/numerical-aggregate-highlight-rule.model';
import {NumberUtils} from '@utils/number.utils';
import {ColumnConfig} from '@blk/explore-ui-core';
import {HighlightComparisonType, HighlightSettings, RuleColors} from '@blk/explore-ui-column-option';

/**
 * Highlight rule that highlights based if a value is within or outside of the specified number of standard deviations from the mean
 */
export class StdDeviationHighlightRule extends NumericalAggregateHighlightRule {

    // mean of leaf data
    private mean: number;
    // standard deviation of leaf data
    private standardDeviation: number;

    constructor(highlightSetting: HighlightSettings, columnConfig: ColumnConfig, dataColumnIndex: number, columnValues: any[]) {
        super(highlightSetting, columnConfig, dataColumnIndex, columnValues);
    }

    /**
     * Computes the mean and standard deviation of the leaf data
     */
    protected setComparisonValues() {
        super.setComparisonValues();

        this.mean = NumberUtils.calculateMean(this.columnValues);
        this.standardDeviation = NumberUtils.calculateStdDeviation(this.columnValues);
    }

    /**
     * Determines if data value meets rule criteria for color to be applied to the cell
     */
    protected evaluateColors(dataCellValue: number): RuleColors {
        // calculate initially for HighlightComparisonType.STD_DEV_IN
        let isConditionMet = this.evaluateStdDevIncludes(dataCellValue, Number(this.highlightSetting.comparisonRawValues[0]));

        // negate the result for HighlightComparisonType.STD_DEV_OUT
        if (this.highlightSetting.comparisonType === HighlightComparisonType.STD_DEV_OUT) {
            isConditionMet = !isConditionMet;
        }
        return isConditionMet ? {
            bgColor: this.highlightSetting.backGroundColors?.[0],
            fgColor: this.highlightSetting.foreGroundColors?.[0],
        } : null;
    }

    /**
     * Calculate the deviation range and determine if cell value falls inside
     * @param dataCellValue  Cell value being evaluated
     * @param comparisonValue  How many standard deviations from mean
     */
    private evaluateStdDevIncludes(dataCellValue: number, comparisonValue: number): boolean {
        const meanOffset = this.standardDeviation * comparisonValue;
        return ((this.mean - meanOffset) <= dataCellValue) && ((this.mean + meanOffset) >= dataCellValue);
    }
}
