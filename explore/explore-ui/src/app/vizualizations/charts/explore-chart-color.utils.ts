import { Chart, ColorAxis } from 'highcharts';
import { ColorScaleMidpointOption } from '@enums/color-scale-midpoint-option';
import { GradientEnum } from '@enums/color-scale-gradient-option.enum';
import { isUndefined, maxBy, minBy } from 'lodash';
import { ColorScaleOptions } from '@interfaces/color-scale-options.interface';
/**
 * Used to parse the incoming data
 * param data
 */
export const updateChart = (data: any[], chart: Chart, colorScaleOptions: ColorScaleOptions): void => {
    let min = minBy(data, 'colorValue')?.colorValue;
    let max = maxBy(data, 'colorValue')?.colorValue;
    let initialMidpointValue = 0;
    let midPoint = colorScaleOptions.colorMidPointSelection;
    if ((midPoint === ColorScaleMidpointOption.ZERO_CENTERED)) { // For Zero-Centered
            // For Zero-Centerend
            const range = Math.max(Math.abs(min), Math.abs(max));
            min = range < 0 ? range : -range;
            max = range < 0 ? -range : range;
        } else if (midPoint === ColorScaleMidpointOption.MEDIAN) {
            // For Median
            initialMidpointValue = calculateMedian(data);                                
        }
    const colorRange = [min, max, initialMidpointValue];
    updateChartColor(chart, colorRange, colorScaleOptions);
}
/**
 * Used to compute median
 * param data
 * returns median
 */
export const calculateMedian = (data: any[]): number => {
    // First, exclude the null values for colorValue in the input and then sort the array in ascending order
    const sorted = data.filter(x => x.colorValue != null).slice().sort((a, b) => a.colorValue - b.colorValue);

    const length = sorted.length;

    // Check if the array has an odd number of elements
    if (length % 2 === 1) {
        return sorted[Math.floor(length / 2)].colorValue;
    } else {
        // If the array has an even number of elements, return the average of the middle two
        const middle1 = sorted[length / 2 - 1].colorValue;
        const middle2 = sorted[length / 2].colorValue;
        return (middle1 + middle2) / 2;
    }
}
/**
 * Used to update the chart color axis
 *
 * param chart
 * param colorRange
 * param colorScaleOptions
 */

export const updateChartColor = (chart: Chart & { colorAxis?: ColorAxis[] }, colorRange: number[], colorScaleOptions: ColorScaleOptions): void => {
    if ((chart?.colorAxis && chart?.colorAxis[0]) || colorScaleOptions) {       
        const [min, max] = colorRange;

            // after setData, colorAxis[0].min and colorAxis[0].max is available from high chart
        const newColorStops = calculateNewColorAxisGradient(colorRange, colorScaleOptions);

        if (chart.colorAxis[0]) {
            const updatable = chart.colorAxis[0] as { update: (stops) => any };
            updatable.update({...newColorStops, min, max});
        } else {
            chart.colorAxis[0] = new ColorAxis(chart, newColorStops);
        }
    }
};

/**
 * Used to generate the chart color palette
 *
 * param adsPalette
 * param midpoint
 * param midpointColor
 */
export const generatePalette = (colorRangeSelection: string[], midpoint: number, midpointColor: string ): Highcharts.ColorAxisOptions => {
    const segmentLength = colorRangeSelection.length / 2;

    const startColors = colorRangeSelection.slice(0, segmentLength); // list of start colors
    const endColors = colorRangeSelection.slice(segmentLength + 1); // list of end colors

    const startInterval = midpoint / (startColors.length);
    const endInterval = (1 - midpoint) / endColors.length;

    const startSegments: [number, string][]  = startColors.map((color, index) => [startInterval * index, color]); // list of start segments
    const midSegment: [number, string][]  = !isUndefined(midpointColor) ? [[midpoint, midpointColor]] : [];       // middle segment
    const endSegments: [number, string][]  = endColors.map((color, index) => [midpoint + (endInterval * (index + 1)), color]);   // list of end segments

    return {
        stops: [...startSegments, ...midSegment, ...endSegments]
    };
};


/**
 * Used by heatmap to calculate Divergent - Qualitative colours https://dev.blackrock.com/apps/apgux/#/docs/data-viz/color?section=design
 * Generates color axis stops.
 * param colorScaleOptions
 * param colorRange
 * returns
 */
export const calculateNewColorAxisGradient = (colorRange: number[], colorScaleOptions: ColorScaleOptions): Highcharts.ColorAxisOptions => {
    const min = colorRange[0];
    // when median is selected as midpoint get the computed median
    const computedMedian = (colorScaleOptions.colorMidPointSelection === ColorScaleMidpointOption.MEDIAN) ? colorRange[2] : 0;
    // for median as midpoint set the max value as max input minus the median
    const max = (colorScaleOptions.colorMidPointSelection === ColorScaleMidpointOption.MEDIAN) ? colorRange[1] - computedMedian : colorRange[1];
    
    const colorRangeSelection = GradientEnum.parseEnum(colorScaleOptions.colorRangeSelection).colors;
    const colorRangeSelectionLength = colorRangeSelection.length;
    const firstColor = colorRangeSelection[0];
    const colorScaleMidPoint = Math.floor(colorRangeSelectionLength / 2);
    const midpointColor = colorRangeSelection[colorScaleMidPoint];
  
    if ((min === null || max === null || (min >= 0 && max > 0)) && colorScaleOptions.colorMidPointSelection !== ColorScaleMidpointOption.MEDIAN) {
        // Case 1: DEFAULT gradient OR both min and max are positive and midpoint is not median
        const positiveList = colorRangeSelection.slice(0);
        return generatePalette(positiveList.splice(colorScaleMidPoint + 1, colorRangeSelectionLength - 1), 0, midpointColor);
    }

    if (min < 0 && max <= 0 && colorScaleOptions.colorMidPointSelection !== ColorScaleMidpointOption.MEDIAN) {
        // Case 2: both min and max are negative and midpoint is not median
        const negativeList = colorRangeSelection.slice(0);
        return generatePalette(negativeList.splice(0, colorScaleMidPoint + 1), 0, firstColor);
    }
    // for median as midpoint set the absMin value as median minus the absMin value
    const absMin = (colorScaleOptions.colorMidPointSelection === ColorScaleMidpointOption.MEDIAN) ? computedMedian - Math.abs(min) : Math.abs(min);    

    // compute stops with AbsMin
    return computeStopsWithAbsMin(colorScaleOptions, absMin, min, max, colorRangeSelection, midpointColor);
};

export const computeStopsWithAbsMin = (colorScaleOptions: ColorScaleOptions, absMin: number, min: number, max: number, colorRangeSelection: string[], midpointColor: string): Highcharts.ColorAxisOptions => {
    // when the midpoint is zero centered or 50:50
    if ((colorScaleOptions.colorMidPointSelection === ColorScaleMidpointOption.ZERO_CENTERED) || (min === max) ||
        ((max - absMin < 0 && absMin / max < 1.1) || (max - absMin > 0 && absMin / max > 0.9))) {
        // Case 3: (50 : 50 ratio -- symmetric) - absMin / max ~= 1
        return generatePalette(colorRangeSelection, 1 / 2, midpointColor);
    }

    if (max - absMin > 0) {
        if (absMin / max > 0.49) {
            // Case 4: (33 : 66 or 1 : 2 ratio)
            return generatePalette(colorRangeSelection, 1 / 3, midpointColor);
        } else if (absMin / max > 0.32) {
            // Case 5: (25 : 75 or 1 : 3 ratio)
            return generatePalette(colorRangeSelection, 1 / 4, midpointColor);
        }
        // Case 6: (20 : 80 or 1 : 4 ratio)
        return generatePalette(colorRangeSelection, 0.2, midpointColor);
    }

    if (absMin / max < 2.1) {
        // Case 7: (66 : 33 or 2 : 1 ratio)
        return generatePalette(colorRangeSelection, 2 / 3, midpointColor);
    } else if (absMin / max < 3.1) {
        // Case 8: (75 : 25 or 3 : 1 ratio)
        return generatePalette(colorRangeSelection, 3 / 4, midpointColor);
    }

    // Case 9: (80 : 20 or 4 : 1 ratio)
    return generatePalette(colorRangeSelection, 0.8, midpointColor);
}