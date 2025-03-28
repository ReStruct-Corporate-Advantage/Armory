import {AbstractConfig, ChartWidgetInputConfigType, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isObject} from 'lodash';

/**
 * Model class for option to enable stacked bar chart in PGS spawned charts
 */
export class PgsStackedBarChartSettingsModel extends AbstractConfig implements WidgetInput {

    /**
     * Flag to indicate if the chart is a stacked bar chart
     */
    isStackedBarChart: boolean;

    /**
     * Constructor to create an instance of PgsStackedBarChartSettingsModel
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize the passed in data into properties of this object
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }

        this.isStackedBarChart = data.isStackedBarChart;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Serialize this object properties into a plain javascript style object
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            isStackedBarChart: this.isStackedBarChart
        };
    }

    /**
     * geting the telemetry trackable properties
     */
    getTrackableProperties(): any {
        return this.serialize();
    }

    /**
     * comparing items of PgsStackedBarChartSettingsModel
     */
    equals(other: AbstractConfig): boolean {

        if (!(other instanceof PgsStackedBarChartSettingsModel)) {
            return false;
        }

        return this.isStackedBarChart === other.isStackedBarChart;
    }

    /**
     * @return false as it's data store input
     */
    isDataStoreInput(): boolean {
        return false;
    }

    /**
     * gets the config type.
     */
    getConfigType(): string {
        return ChartWidgetInputConfigType.PGS_STACKED_BAR_CHART_SETTINGS;
    }

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return 'pgsStackedBarChartSettings';
    }
}
