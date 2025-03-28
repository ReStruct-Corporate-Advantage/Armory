import {isObject} from 'lodash';
import {AbstractColumnOption, CommonUtils, DerivedSettings, SerializeFavoriteType} from '@blk/explore-ui-core';
import {ColumnOptionConstants} from '@blk/explore-ui-column-option';
import {StressScenario} from '../stress-scenario.model';

/**
 * Model class for date column format column option
 */
export class ShockSettingColumnOption extends AbstractColumnOption implements DerivedSettings<StressScenario> {

    static CONFIG_TYPE = 'shockSettingColumnOption';

    scenario: StressScenario;
    shock: number;
    restrictImpliedShocks: string[] = [];
    shockUnit: string;

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return ShockSettingColumnOption.CONFIG_TYPE;
    }

    /**
     * Constructor
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        this.shock = data.shock;
        if (data.restrictImpliedShocks) {
            this.restrictImpliedShocks = data.restrictImpliedShocks.split(ColumnOptionConstants.COMMA);
        }
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {};
        if (this.shock) {
            data.shock = this.shock;
        }
        if (this.restrictImpliedShocks.length > 0) {
            data.restrictImpliedShocks = this.restrictImpliedShocks.toString();
        }
        return data;
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof ShockSettingColumnOption)) {
            return false;
        }
        if (this.shock !== otherColOption.shock) {
            return false;
        }
        if (this.restrictImpliedShocks.length !== otherColOption.restrictImpliedShocks.length) {
            return false;
        }
        // Compare the string arrays after sorting
        return CommonUtils.compareTheValues(this.restrictImpliedShocks, otherColOption.restrictImpliedShocks);
    }

    /**
     * Method that validates if the column option settings are valid to be serialized or to be added on to the request
     */
    isValid(): boolean {
        return true;
    }

    /**
     * See AbstractColumnOption.doAddRequestParams
     */
    protected doAddRequestParams(requestParams: any) {
        requestParams.shockSettings = this.doSerialize();
    }

    getParentWidgetSettingKey(): string {
        return StressScenario.STRESS_SCENARIO_SETTINGS;
    }

    /**
     * Return portfolio setting key
     */
    getParentPortfolioSettingKey(): string {
        return undefined;
    }

    /**
     * Update the derived settings using the settings passed in
     * @param settings T
     */
    updateDerivedSettings(settings: StressScenario) {
        this.scenario = settings;
    }

}
