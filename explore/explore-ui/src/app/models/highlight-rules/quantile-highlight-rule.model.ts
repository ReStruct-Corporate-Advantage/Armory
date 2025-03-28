import {NumericalAggregateHighlightRule} from '@models/highlight-rules/numerical-aggregate-highlight-rule.model';
import {HighlightUtils} from '@utils/highlight.utils';
import {NumberUtils} from '@utils/number.utils';
import {ColumnConfig} from '@blk/explore-ui-core';
import {HighlightSettings, RuleColors} from '@blk/explore-ui-column-option';

/**
 * Divides leaf data into specified quantiles (buckets) and gives each bucket a color
 */
export class QuantileHighlightRule extends NumericalAggregateHighlightRule {

    // number of quantiles (buckets) specified in rule
    private numBuckets: number;
    // upper value bounds of each bucket
    private bucketBoundaries: number[];
    // color of each bucket
    private bgBucketColors: string[] = [];
    // color of each bucket
    private fgBucketColors: string[] = [];

    constructor(highlightSetting: HighlightSettings, columnConfig: ColumnConfig, dataColumnIndex: number, columnValues: any[]) {
        super(highlightSetting, columnConfig, dataColumnIndex, columnValues);
    }

    /**
     * Computes bucket (quantile) boundaries and colors
     */
    protected setComparisonValues() {
        super.setComparisonValues();

        this.numBuckets = Number(this.highlightSetting.comparisonRawValues[0]);

        if (this.highlightSetting.backGroundColors?.length) {
            this.setBucketColors(this.highlightSetting.backGroundColors, this.bgBucketColors);
        }

        if (this.highlightSetting.foreGroundColors?.length) {
            this.setBucketColors(this.highlightSetting.foreGroundColors, this.fgBucketColors);
        }

        this.setBucketUpperBounds();
    }

    /**
     * Computers color for each bucket (quantile).  Uses a gradient from start to end color.
     * Note: Bucket colors are in hex
     */
    private setBucketColors(startEndColorArr: string[], colorBucket: string[]): void {
        const startBGColor = startEndColorArr[0];
        const endBGColor = startEndColorArr[1];

        // create an rgb array [r, g, b]
        // note: may already be in RGB string format
        const startRGB = HighlightUtils.convertHexToRGB(startBGColor);
        const endRGB = HighlightUtils.convertHexToRGB(endBGColor);

        // calculate gradient steps
        const redStep = Math.trunc((endRGB[0] - startRGB[0]) / (this.numBuckets - 1));
        const greenStep = Math.trunc((endRGB[1] - startRGB[1]) / (this.numBuckets - 1));
        const blueStep = Math.trunc((endRGB[2] - startRGB[2]) / (this.numBuckets - 1));

        // calculate color for each bucket
        // final color is stored as hex value
        for (let i = 0; i < this.numBuckets - 1; i++) {
            colorBucket.push(HighlightUtils.convertRgbToHex(startRGB[0] + (i * redStep), startRGB[1] + (i * greenStep), startRGB[2] + (i * blueStep)));
        }
        colorBucket.push(HighlightUtils.convertRgbToHex(endRGB[0], endRGB[1], endRGB[2]));
    }

    /**
     * Computes the upper bounds for each bucket (quantile) based on the column leaf values
     */
    private setBucketUpperBounds(): void {
        this.bucketBoundaries = NumberUtils.getUpperBoundsForQuantiles(this.columnValues, this.numBuckets);
    }

    /**
     * Determine which bucket each value falls into and return the bucket color
     */
    protected evaluateColors(dataCellValue: number): RuleColors {

        // loop through all buckets to find which one the value fits into
        const index = this.bucketBoundaries.findIndex((bucketUpperBounds: number) => dataCellValue <= bucketUpperBounds);

        return (index > -1) ? {
            bgColor: this.bgBucketColors[index],
            fgColor: this.fgBucketColors[index]
        } : null;
    }
}
