/**
 * Enum for color scale chart gradient setting options
 */

export enum ColorScaleGradientOption {
    // Three color scale options
    PINK_TO_BLUE = 'pinkToBlue',
    RED_TO_GREEN = 'redToGreen',
    BLUE_TO_RED = 'blueToRed',
    RED_TO_GREEN_WITH_YELLOW_MIDPOINT = 'redToGreenWithYellowMidpoint',
    // Two color scale options
    BLUE = 'blue',
    GREEN = 'green',
    YELLOW = 'yellow',
    RED = 'red'
}
// Three color scale values
const PINK_TO_BLUE_COLORS = ['#ef6ce5', '#f49bed', '#f9c6f5', '#fff4fe', '#F1F2F4', '#e4f4fe', '#cdeafe', '#9bd5fc', '#69c0fa'];
const RED_TO_GREEN_COLORS = ['#8c0200', '#bc0300', '#d90400', '#ff2825', '#ff5755', '#ff8a89', '#ffbbbb', '#F1F2F4', '#c5fbcf', '#95f7a7', '#67f280', '#3aef59', '#13e236', '#04bd24', '#048119'];
const BLUE_TO_RED_COLORS = ['#005e9b', '#007ac9', '#0998f6', '#3badf8', '#69c0fa', '#9bd5fc', '#cdeafe', '#F1F2F4', '#ffbbbb', '#ff8a89', '#ff5755', '#ff2825', '#d90400', '#bc0300', '#8c0200'];
const RED_TO_GREEN_WITH_YELLOW_MIDPOINT_COLORS = ['#8c0200', '#bc0300', '#d90400', '#fd4f03', '#ff8900', '#ffa032', '#ffbf0d', '#9fd926', '#04bd24', '#048119'];
// Two color scale values
const BLUE_COLORS = ['#cdeafe', '#9bd5fc', '#69c0fa', '#3badf8', '#0998f6', '#007ac9', '#005e9b'];
const GREEN_COLORS = ['#c5fbcf', '#95f7a7', '#67f280', '#3aef59', '#13e236', '#04bd24', '#048119'];
const YELLOW_COLORS = ['#fff6db', '#ffe8a7', '#ffdb75', '#ffcd41', '#ffbf0d', '#d7a720', '#af8c29'];
const RED_COLORS = ['#ffbbbb', '#ff8a89', '#ff5755', '#ff2825', '#d90400', '#bc0300', '#8c0200'];

export class GradientEnum {
    private static AllValues: { [name: string]: GradientEnum } = {};
    // Three color scale gradients, maps to the enum and colors
    static readonly PINK_TO_BLUE = new GradientEnum(ColorScaleGradientOption.PINK_TO_BLUE, PINK_TO_BLUE_COLORS);
    static readonly RED_TO_GREEN = new GradientEnum(ColorScaleGradientOption.RED_TO_GREEN, RED_TO_GREEN_COLORS);
    static readonly BLUE_TO_RED = new GradientEnum(ColorScaleGradientOption.BLUE_TO_RED, BLUE_TO_RED_COLORS);
    static readonly RED_TO_GREEN_WITH_YELLOW_MIDPOINT = new GradientEnum(ColorScaleGradientOption.RED_TO_GREEN_WITH_YELLOW_MIDPOINT, RED_TO_GREEN_WITH_YELLOW_MIDPOINT_COLORS);
    // Two color scale gradients, maps to the enum and colors
    static readonly BLUE = new GradientEnum(ColorScaleGradientOption.BLUE, BLUE_COLORS);
    static readonly GREEN = new GradientEnum(ColorScaleGradientOption.GREEN, GREEN_COLORS);
    static readonly YELLOW = new GradientEnum(ColorScaleGradientOption.YELLOW, YELLOW_COLORS);
    static readonly RED = new GradientEnum(ColorScaleGradientOption.RED, RED_COLORS);

    static readonly GRADIENTS__THREE_SCALE = [
        // Backward Compatibility display of existing colors mapped to DS colors
        GradientEnum.PINK_TO_BLUE,
        // From DS Color Palette Divergent Palettes
        GradientEnum.RED_TO_GREEN,
        GradientEnum.BLUE_TO_RED,
        GradientEnum.RED_TO_GREEN_WITH_YELLOW_MIDPOINT
    ];
    
    static readonly GRADIENTS__TWO_SCALE = [
        // From DS Color Palette Sequential Palettes
        GradientEnum.BLUE,
        GradientEnum.GREEN,
        GradientEnum.YELLOW,
        GradientEnum.RED
    ];

    private constructor(readonly colorOption: ColorScaleGradientOption, readonly colors: string[]) {
        GradientEnum.AllValues[colorOption] = this;
    }

    /**
     * Parse enum
     */
    static parseEnum(displayValue: ColorScaleGradientOption): GradientEnum {
        return GradientEnum.AllValues[displayValue];
    }

    public getStyle(): {'background-image': string} {
        // return the gradient colors in css style
        return {'background-image': 'linear-gradient(to right,' + this.colors.join(',') + ')'};
    }
}
