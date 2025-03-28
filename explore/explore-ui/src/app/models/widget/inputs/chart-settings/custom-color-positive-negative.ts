import {AbstractConfig, ChartWidgetInputConfigType, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isObject} from 'lodash';

/**
 * CustomColorPositiveNegative model
 *
 * This model is used with below configTypes:
 *      ChartWidgetInputConfigType.CUSTOM_COLOR_POSITIVE_NEGATIVE
 */
export class CustomColorPositiveNegative extends AbstractConfig implements WidgetInput {

    positiveColor: string;
    negativeColor: string;
    isEnabled: boolean;

    /**
     * Constructor to create an instance of Color Scale
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

        this.positiveColor = data.positiveColor;
        this.negativeColor = data.negativeColor;
        this.isEnabled = data.isEnabled;
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
            positiveColor: this.positiveColor,
            negativeColor: this.negativeColor,
            isEnabled: this.isEnabled
        };
    }

    /**
     * geting the telemetry trackable properties
     */
    getTrackableProperties(): any {
        return this.serialize();
    }

    /**
     * comparing items of Color Scale
     */
    equals(other: AbstractConfig): boolean {

        if (!(other instanceof CustomColorPositiveNegative)) {
            return false;
        }

        if (this.isEnabled !== other.isEnabled) {
            return false;
        }

        if (this.positiveColor !== other.positiveColor) {
            return false;
        }

        return this.negativeColor === other.negativeColor;
    }

    disableAndResetColors() {
        this.isEnabled = false;
        this.positiveColor = '#008000';
        this.negativeColor = '#FF0000';
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
        return ChartWidgetInputConfigType.CUSTOM_COLOR_POSITIVE_NEGATIVE;
    }

}
