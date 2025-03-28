import {AbstractConfig, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isObject} from 'lodash';

/**
 * PivotTableSettingsModel
 */
export class PivotTableSettingsModel extends AbstractConfig implements WidgetInput {
    static PIVOT_SETTING_CONFIG_TYPE = 'pivotSettings';

    portBenchActiveEnabled: boolean;

    /**
     * @returns config type.
     */
    static get configType(): string {
        return PivotTableSettingsModel.PIVOT_SETTING_CONFIG_TYPE;
    }

    /**
     * Constructor to create an instance of PivotTableSettingsModel
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * @param other other object to check the equality with
     * @return true if the given object equals to this one, otherwise false
     */
    equals(other: AbstractConfig): boolean {
        if (!(other instanceof PivotTableSettingsModel)) {
            return false;
        }

        return this.portBenchActiveEnabled === other.portBenchActiveEnabled;
    }

    /**
     * @return true as it's data store input
     */
    isDataStoreInput(): boolean {
        return true;
    }

    /*
     * See AbstractConfig.deserialize
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }

        this.portBenchActiveEnabled = data.portBenchActiveEnabled;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /*
     * See AbstractConfig.serialize
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            portBenchActiveEnabled: this.portBenchActiveEnabled
        };
    }
}
