import {NumericalAggregateHighlightRule} from '@models/highlight-rules/numerical-aggregate-highlight-rule.model';
import {ColumnConfig} from '@blk/explore-ui-core';
import {HighlightComparisonType, HighlightSettings, RuleColors} from '@blk/explore-ui-column-option';

/**
 * Highlight Rules that highlights either the top or bottom specified percentile of values
 */
export class TopBottomHighlightRule extends NumericalAggregateHighlightRule {

    // flag for if it is a top or bottom % rule
    private readonly isTop: boolean;

    // value that cell value must exceed to be highlighted
    private thresholdValue: number;

    constructor(highlightSetting: HighlightSettings, columnConfig: ColumnConfig, dataColumnIndex: number, columnValues: any[]) {
        super(highlightSetting, columnConfig, dataColumnIndex, columnValues);
        this.isTop = this.highlightSetting.comparisonType === HighlightComparisonType.TOP;
    }

    /**
     * Computes, scales, and formats values needed for applying the highlight rule
     */
    protected setComparisonValues(): void {
        super.setComparisonValues();

        // set the value that each data cell is compared against to determine if it's in the specified top/bottom percentile
        this.thresholdValue = this.calculateValueThreshold(Number(this.highlightSetting.comparisonRawValues[0]));
    }

    /**
     * Calculates the percentage value threshold
     */
    private calculateValueThreshold(percentThreshold: number): number {
        // sort values in ascending order
        this.columnValues.sort((a, b) => a - b);

        const decimalPercentThreshold = percentThreshold / 100;

        return this.isTop
            ? this.columnValues[Math.trunc((1 - decimalPercentThreshold) * this.columnValues.length)]
            : this.columnValues[Math.trunc(decimalPercentThreshold * this.columnValues.length)];
    }

    /**
     * Determines if data value meets rule criteria for color to be applied to the cell
     */
    protected evaluateColors(dataCellValue: number): RuleColors {
        const isConditionMet = this.isTop ? dataCellValue >= this.thresholdValue : dataCellValue <= this.thresholdValue;
        return isConditionMet ? {
            bgColor: this.highlightSetting.backGroundColors?.[0],
            fgColor: this.highlightSetting.foreGroundColors?.[0],
        } : null;
    }
}
