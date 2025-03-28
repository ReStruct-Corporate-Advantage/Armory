import {AbstractConfig, ChartWidgetInputConfigType, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isObject} from 'lodash';

/**
 * Model class for the ScatterDrilldownSetting widget input
 *
 * This model is used with below configTypes:
 *      ChartWidgetInputConfigType.SCATTER_SETTINGS
 */
export class ScatterDrilldownSetting extends AbstractConfig implements WidgetInput {
    groupByFirstLevelData: boolean;

    getConfigType(): string {
        return ChartWidgetInputConfigType.SCATTER_SETTINGS;
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
     * Returns false as ScatterDrilldownSetting is a display input
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
        return {groupByFirstLevelData: this.groupByFirstLevelData};
    }

    /**
     * Deserialize the input
     */
    deserialize(data: any): void {
        // For old Explore favorites, there were only two options saved as a boolean flag
        // sizeValue: false == 'Treat as Zero' for Tree Map widgets
        // sizeValue: true == 'Treat as Absolute Value' for Tree Map widgets
        this.groupByFirstLevelData = data.groupByFirstLevelData;
    }

    /**
     * Check equality of this and the ScatterDrilldownSetting passed in
     */
    equals(scatterDrilldownSetting: AbstractConfig): boolean {
        if (!(scatterDrilldownSetting instanceof ScatterDrilldownSetting)) {
            return false;
        }
        return this.groupByFirstLevelData === scatterDrilldownSetting.groupByFirstLevelData;
    }
}
