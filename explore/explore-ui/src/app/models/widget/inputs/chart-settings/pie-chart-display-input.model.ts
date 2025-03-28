import {AbstractConfig, ChartWidgetInputConfigType, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isObject} from 'lodash';

/**
 * Model class for the PieChartDisplay widget input
 *
 * This model is used with below configTypes:
 *      ChartWidgetInputConfigType.PIE_CHART_DISPLAY
 */
export class PieChartDisplayInput extends AbstractConfig implements WidgetInput {
    displayAs: string;

    getConfigType(): string {
        return ChartWidgetInputConfigType.PIE_CHART_DISPLAY;
    }

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Returns false as PieChartDisplayInput is a display input
     */
    isDataStoreInput(): boolean {
        return false;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Serialize the input
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {displayAs: this.displayAs};
    }

    /**
     * Deserialize the input
     */
    deserialize(data: any): void {
        // For old Explore favorites, there were only two options saved as a boolean flag
        // isDonutChart: false == Pie Chart
        // isDonutChart: true == Sunburst Chart
        if (data && data.hasOwnProperty('isDonutChart')) {
            this.displayAs = data.isDonutChart ? PieChartDisplayAsOption.SUNBURST : PieChartDisplayAsOption.PIE;
        } else {
            // Just deserialize as normal
            this.displayAs = data.displayAs;
        }
    }

    /**
     * Check equality of this and the PieChartDisplayInput passed in
     */
    equals(pieChartDisplayInput: AbstractConfig): boolean {
        if (!(pieChartDisplayInput instanceof PieChartDisplayInput)) {
            return false;
        }
        return this.displayAs === pieChartDisplayInput.displayAs;
    }
}

/**
 * Enum of the different PieChartDisplayAs options
 */
export enum PieChartDisplayAsOption {
    PIE = 'pie',
    SUNBURST = 'sunburst'
}
