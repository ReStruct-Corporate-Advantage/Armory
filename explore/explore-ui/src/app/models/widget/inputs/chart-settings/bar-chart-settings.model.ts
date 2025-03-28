import {AbstractConfig, ChartWidgetInputConfigType, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isObject} from 'lodash';

/**
 * Model for BarChartSettings
 *
 * This model is used with below configTypes:
 *      ChartWidgetInputConfigType.BAR_SETTINGS
 *      WidgetDisplayInputConfigType.CHART
 */
export class BarChartSettings extends AbstractConfig implements WidgetInput {

    /**
     * Chosen includeTotalValues
     */
    includeTotalValues: boolean;

    /**
     * Show baseline
     */
    showBaseline: boolean;

    /**
     * Chosen chartType
     */
    chartType = '';

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return 'barSettings';
    }

    getConfigType(): string {
        return ChartWidgetInputConfigType.BAR_SETTINGS;
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

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        let dataToUse = data;
        if (data && data.chart) {
            dataToUse = data.chart;
        }
        if (dataToUse) {
            this.chartType = dataToUse.chartType;
            this.includeTotalValues = dataToUse.includeTotalValues;
            this.showBaseline = dataToUse.showBaseline;
        }
    }

    /**
     * Return true if the passed in widgetInput is equal to this BarChartSettingsModel
     */
    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof BarChartSettings)) {
            return false;
        }
        if (this.includeTotalValues !== widgetInput.includeTotalValues) {
            return false;
        }
        if (this.showBaseline !== widgetInput.showBaseline) {
            return false;
        }
        return this.chartType === widgetInput.chartType;
    }

    isDataStoreInput(): boolean {
        return false;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {
            includeTotalValues: this.includeTotalValues,
            chartType: this.chartType,
            showBaseline: this.showBaseline
        };

        data.configType = ChartWidgetInputConfigType.BAR_SETTINGS;
        return data;
    }
}
