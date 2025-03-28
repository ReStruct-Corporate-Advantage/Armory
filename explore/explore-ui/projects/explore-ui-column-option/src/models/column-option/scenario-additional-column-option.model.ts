import {AbstractColumnOption} from '@blk/explore-ui-core';
import {isEqual, isNil} from 'lodash';

/**
 * Model class for some additional scenario column options like floor p&l
 */
export class ScenarioAdditionalColumnOptionModel extends AbstractColumnOption {
    static CONFIG_TYPE = 'scenarioSettingsColumnOption';

    floorPnL: boolean;
    fullReval: boolean;

    /**
     * Constructs the column option.
     */
    constructor(data?: any) {
        super();
        if (!isNil(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Serialise the content for the favorite.
     */
    doSerialize(): any {
        return {
            floorPnL: this.floorPnL,
            fullReval: this.fullReval
        };
    }

    /**
     * Deserialize the cond=tent from the favorite.
     */
    deserialize(data: any): void {
        this.floorPnL = data.floorPnL;
        this.fullReval = data.fullReval === undefined ? true : data.fullReval;
    }

    /**
     * Add the request params for this column option.
     */
    protected doAddRequestParams(optionValues: any) {
        optionValues['scenarioAdditionalSettings'] = {
            'floorPnL': this.floorPnL === undefined ? false : this.floorPnL,
            'fullReval': this.fullReval === undefined ? true : this.fullReval
        };
    }

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return ScenarioAdditionalColumnOptionModel.CONFIG_TYPE;
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one.
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof ScenarioAdditionalColumnOptionModel)) {
            return false;
        }

        if (!isEqual(this.floorPnL, otherColOption.floorPnL)) {
            return false;
        }

        if (!isEqual(this.fullReval, otherColOption.fullReval)) {
            return false;
        }

        return true;
    }

    isValid(): boolean {
        return !isNil(this.floorPnL) || !isNil(this.fullReval);
    }

}
