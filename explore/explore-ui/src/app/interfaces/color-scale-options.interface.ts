import { ColorScaleFormatOption } from "@enums/color-scale-format-option";
import { ColorScaleGradientOption } from "@enums/color-scale-gradient-option.enum";
import { ColorScaleMidpointOption } from "@enums/color-scale-midpoint-option";

export interface ColorScaleOptions {
    colorRangeSelection: ColorScaleGradientOption;
    colorMidPointSelection: ColorScaleMidpointOption;
    colorFormatSelection: ColorScaleFormatOption;
}