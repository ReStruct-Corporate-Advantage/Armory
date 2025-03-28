import {isEqual, isNil, isObject, isEmpty} from 'lodash';
import {AbstractColumnOption, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Model for the IRR multi-time period Settings column option.
 * @author Ashish Agarwal
 */
export class IrrMultiTimePeriodColumnOption extends AbstractColumnOption {

    public static CONFIG_TYPE = 'irrColumnOptions';

    public selectedTimePeriods: string[] = [];

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return IrrMultiTimePeriodColumnOption.CONFIG_TYPE;
    }

    /**
     * add params that are to be send as a part of the request Param
     */
    protected doAddRequestParams(requestParams: any) {
        requestParams['selectedIRR'] = this.selectedTimePeriods;
    }

    /**
     * Initialises the column with the default settings.
     */
    initialize(defaultSettings: any) {
        if (defaultSettings && defaultSettings.columnOptionAttributes && defaultSettings.columnOptionAttributes[0].defaultValue) {
            this.selectedTimePeriods.push(defaultSettings.columnOptionAttributes[0].defaultValue.value);
        }
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        this.selectedTimePeriods = data.selectedIRR;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (!this.isValid()) {
            return undefined;
        }
        return {
            selectedIRR: this.selectedTimePeriods,
        };
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof IrrMultiTimePeriodColumnOption)) {
            return false;
        }
        return isEqual(this.selectedTimePeriods, otherColOption.selectedTimePeriods);
    }

    /**
     * Check if the settings are valid
     */
    isValid(): boolean {
        return !(isNil(this.selectedTimePeriods) || isEmpty(this.selectedTimePeriods));
    }

}
