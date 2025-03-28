import {
    AbstractConfig,
    ChartWidgetInputConfigType,
    SerializeFavoriteType,
    WidgetInput
} from '@blk/explore-ui-core';
import {isNil, isObject} from 'lodash';

/**
 * Chart Widget Input Config - Axis settings model
 * widgetInputConfigTypes: primaryAxisSettings, secondaryAxisSettings
 * legacyWidgetInputConfigType: overrideAxisTitle
 */
export class AxisSettings extends AbstractConfig implements WidgetInput {
    axisType: AxisType;

    axisTitle: string;
    hideAxisTitle: boolean;

    yLowerBound: number;
    yUpperBound: number;
    yInterval: number;

    /**
     * Deserialize legacy widget input
     */
    static deserializeLegacyWidgetInput(serializedConfig: any, callback: Function): void {
        const primaryAxisTitle = serializedConfig.primaryAxisTitle || serializedConfig.overrideAxisTitle?.primaryAxisTitle;
        if (primaryAxisTitle) {
            callback(ChartWidgetInputConfigType.PRIMARY_AXIS_SETTINGS, {axisType: AxisType.PRIMARY, axisTitle: primaryAxisTitle});
        }
        const secondaryAxisTitle = serializedConfig.secondaryAxisTitle || serializedConfig.overrideAxisTitle?.secondaryAxisTitle;
        if (secondaryAxisTitle) {
            callback(ChartWidgetInputConfigType.SECONDARY_AXIS_SETTINGS, {axisType: AxisType.SECONDARY, axisTitle: secondaryAxisTitle});
        }
    }

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
     * Deserialize the passed in data into properties of this object
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }
        this.axisType = data.axisType;
        this.axisTitle = data.axisTitle;
        this.hideAxisTitle = data.hideAxisTitle;
        this.yLowerBound = data.yLowerBound;
        this.yUpperBound = data.yUpperBound;
        this.yInterval = data.yInterval;
    }

    /**
     * Serialize this object properties into a plain javascript style object
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (this.isEmpty()) {
            return;
        }
        return {
            axisType: this.axisType,
            axisTitle: this.axisTitle,
            hideAxisTitle: this.hideAxisTitle,
            yLowerBound: this.yLowerBound,
            yUpperBound: this.yUpperBound,
            yInterval: this.yInterval
        };
    }

    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof AxisSettings)) {
            return false;
        }
        if (this.axisType !== widgetInput.axisType) {
            return false;
        }
        if (this.axisTitle !== widgetInput.axisTitle) {
            return false;
        }
        if (this.hideAxisTitle !== widgetInput.hideAxisTitle) {
            return false;
        }
        if (this.yLowerBound !== widgetInput.yLowerBound) {
            return false;
        }
        if (this.yUpperBound !== widgetInput.yUpperBound) {
            return false;
        }
        return this.yInterval === widgetInput.yInterval;
    }

    /**
     * @return true as it's a data store input
     */
    isDataStoreInput(): boolean {
        return true;
    }

    isEmpty(): boolean {
        return isNil(this.axisTitle) && isNil(this.hideAxisTitle) && isNil(this.yLowerBound) && isNil(this.yUpperBound) && isNil(this.yInterval);
    }
    /**
     * geting the telemetry trackable properties
     */
    getTrackableProperties(): any {
        return {
            axisTitle: this.axisTitle,
            hideAxisTitle: this.hideAxisTitle,
            yLowerBound: this.yLowerBound,
            yUpperBound: this.yUpperBound,
            yInterval: this.yInterval
        };
    }
    /**
     * gets the config type.
     */
    getConfigType(): string {
        return this.axisType === AxisType.SECONDARY ? ChartWidgetInputConfigType.SECONDARY_AXIS_SETTINGS : ChartWidgetInputConfigType.PRIMARY_AXIS_SETTINGS;
    }
}

export enum AxisType {
    PRIMARY = 'PRIMARY',
    SECONDARY = 'SECONDARY'
}
