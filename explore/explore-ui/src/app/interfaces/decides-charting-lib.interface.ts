/**
 * Interface implemented by those widget inputs that can drive the charting lib of a widget
 */
export interface DecidesChartingLib {
    /**
     * Get the charting lib value
     */
    getChartingLib(): string;

    /**
     * Toggle the widget's charting lib
     */
    toggleChartingLib(): void;
}

/**
 * Utility method to check if the object is an instance of this.
 */
export function decidesChartingLib(object: any): object is DecidesChartingLib {
    return 'getChartingLib' in object;
}
