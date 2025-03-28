/**
 * Dimensions and positioning properties of widget
 */
export interface WidgetDimensions {
    /** Number of columns the widget uses in gridster */
    cols: number;
    /** Number of rows the widget uses in gridster */
    rows: number;

    /** Position of widget on x-axis */
    x: number;
    /** Position of widget on y-axis */
    y: number;
}
