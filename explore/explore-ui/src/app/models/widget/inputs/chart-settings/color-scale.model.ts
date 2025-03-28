import {AbstractConfig, ChartWidgetInputConfigType, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isObject} from 'lodash';
import {ColorScaleFormatOption} from '@enums/color-scale-format-option';
import {ColorScaleMidpointOption} from '@enums/color-scale-midpoint-option';
import { ColorScaleGradientOption } from '@enums/color-scale-gradient-option.enum';

/**
 * Model to define common attributes for Color Scale
 *
 * This model is used with below configTypes:
 *      ChartWidgetInputConfigType.COLOR_SCALE
 */
export class ColorScale extends AbstractConfig implements WidgetInput {

    /**
     * Variables for Color Scale
     * @var format  String that defines the scaling measures as 3-Color Scale or 2-Color Scale
     * @var midpoint  String that defines the midpoint of a given scaling measure as Zero-Centered or median
     * @var colors  String array that defines the color range gradient selection of hex colors
     * eg. ['#CDEAFE', '#0998F6', '#0998FF', '#CDEAFE', '#0998F6', '#0998FF', ...]
     */
    format: ColorScaleFormatOption;
    midpoint: ColorScaleMidpointOption;
    colors: ColorScaleGradientOption;

    /**
     * Constructor to create an instance of Color Scale
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
     * Deserialize the passed in data into properties of this object
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }

        this.format = data.format;
        this.midpoint = data.midpoint;
        this.colors = data.colors;
    }

    /**
     * Serialize this object properties into a plain javascript style object
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            format: this.format,
            midpoint: this.midpoint,
            colors: this.colors
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

        if (!(other instanceof ColorScale)) {
            return false;
        }

        if (this.midpoint !== other.midpoint) {
            return false;
        }

        if (this.colors.toString() !== other.colors.toString()) {
            return false;
        }

        return this.format === other.format;
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
        return ChartWidgetInputConfigType.COLOR_SCALE;
    }
}
