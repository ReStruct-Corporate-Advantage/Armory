import {AbstractConfig, ChartWidgetInputConfigType, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isObject} from 'lodash';

/**
 * Model class for the AbsoluteValueSetting widget input
 *
 * This model is used with below configTypes:
 *      ChartWidgetInputConfigType.ABSOLUTE_VALUE
 */
export class AbsoluteValueSetting extends AbstractConfig implements WidgetInput {
    useAbsoluteValue: boolean;

    getConfigType(): string {
        return ChartWidgetInputConfigType.ABSOLUTE_VALUE;
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
     * Returns false as AbsoluteValueSetting is a display input
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
        return {useAbsoluteValue: this.useAbsoluteValue};
    }

    /**
     * Deserialize the input
     */
    deserialize(data: any): void {
        // For old Explore favorites, there were only two options saved as a boolean flag
        // sizeValue: false == 'Treat as Zero' for Tree Map widgets
        // sizeValue: true == 'Treat as Absolute Value' for Tree Map widgets
        this.useAbsoluteValue = !!(data.useAbsoluteValue || data.sizeValue);
    }

    /**
     * Check equality of this and the AbsoluteValueSetting passed in
     */
    equals(absoluteValueSetting: AbstractConfig): boolean {
        if (!(absoluteValueSetting instanceof AbsoluteValueSetting)) {
            return false;
        }
        return this.useAbsoluteValue === absoluteValueSetting.useAbsoluteValue;
    }
}
