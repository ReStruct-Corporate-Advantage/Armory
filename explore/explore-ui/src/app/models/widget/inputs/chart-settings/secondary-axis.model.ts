import {AbstractConfig, ChartWidgetInputConfigType, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isObject, isUndefined} from 'lodash';

/**
 * Model for SecondaryAxis
 *
 * This model is used with below configTypes:
 *      ChartWidgetInputConfigType.SECONDARY_AXIS, ChartWidgetInputConfigType.SECONDARY_AXIS_COLUMN
 *      WidgetDisplayInputConfigType.SECONDARY_AXIS_COLUMN
 */
export class SecondaryAxis extends AbstractConfig implements WidgetInput {

    secondaryAxisColumn: string;

    /**
     * Constructor to create an instance of SecondaryAxis
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
        if (isUndefined(data)) {
            return;
        }
        // for old favorites secondaryAxisColumn is stored inside data.data and
        // for new it will be inside data.secondaryAxisColumn else it will be data only
        if (data.data || data.secondaryAxisColumn) {
            this.secondaryAxisColumn = isUndefined(data.data) ? (data.secondaryAxisColumn.data ? data.secondaryAxisColumn.data : data.secondaryAxisColumn) : data.data;
        } else {
            this.secondaryAxisColumn = data;
        }
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Serialize this object properties into a plain javascript style object to be saved in favorites
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            'secondaryAxisColumn': this.secondaryAxisColumn,
        };
    }

    /**
     * comparing items of SecondaryAxis
     */
    equals(data: WidgetInput): boolean {
        return data instanceof SecondaryAxis ? this.secondaryAxisColumn === data.secondaryAxisColumn : false;
    }

    /**
     * @return false as it's not data store input
     */
    isDataStoreInput(): boolean {
        return false;
    }

    /**
     * geting the telemetry trackable properties
     */
    getTrackableProperties(): any {
        return this.serialize();
    }

    /**
     * gets the config type.
     */
    getConfigType(): string {
        return ChartWidgetInputConfigType.SECONDARY_AXIS_COLUMN;
    }
}
