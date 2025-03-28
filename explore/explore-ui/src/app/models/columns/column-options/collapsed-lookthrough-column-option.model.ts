import {AbstractColumnOption, SerializeFavoriteType} from '@blk/explore-ui-core';
import {isEmpty, isEqual, isObject} from 'lodash';
import {LookThroughSettings} from '@blk/explore-ui-look-through-settings';

export class CollapsedLookthroughColumnOption extends AbstractColumnOption {
    static CONFIG_TYPE = 'collapsedLookthroughColumnOption';

    lookthroughSettings: LookThroughSettings = new LookThroughSettings();

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
        return CollapsedLookthroughColumnOption.CONFIG_TYPE;
    }

    /**
     * Get the params that are to be sent as a part of the request param
     */
    protected doAddRequestParams(requestParams: any) {
        if (this.isValid()) {
            requestParams.collapsedLT = {
                // Add the ltSecurityTypes as a flat list like "FUND,ETF,FUTURE_INDEX"
                ltSecurityTypes: this.lookthroughSettings.ltSecurityTypes.join(',')
            };
        }
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            lookthroughSettings: this.lookthroughSettings.serialize()
        };
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (data.lookthroughSettings) {
            this.lookthroughSettings = new LookThroughSettings(data.lookthroughSettings);
        }
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof CollapsedLookthroughColumnOption)) {
            return false;
        }

        return isEqual(this.lookthroughSettings.ltSecurityTypes.sort(), otherColOption.lookthroughSettings.ltSecurityTypes.sort());
    }

    /**
     * Check if the settings are valid
     */
    isValid(): boolean {
        return !isEmpty(this.lookthroughSettings.ltSecurityTypes);
    }
}
