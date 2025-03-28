import {isUndefined, isNil, isObject} from 'lodash';
import {AbstractColumnOption, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Model class for time to maturity column options
 */
export class TimeToMaturityColumnOption extends AbstractColumnOption {
    public static CONFIG_TYPE = 'timeToMaturityColumnOptions';

    timeUnit: string;
    customScalingBandsDays: number;
    customScalingBandsMonths: number;
    decimalPlaces: number;

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    public static createModelLegacy(optionValues: any): TimeToMaturityColumnOption {
        // If there is none of the required parameters then get out of here.
        // NOTE:  We are not checking the decimalPlaces here as it is also used in formatting options.
        //        The other 2 parameters are optional so not used either.
        if (isUndefined(optionValues.timeUnit)) {
            return undefined;
        }

        // Create the model.
        const columnOption: TimeToMaturityColumnOption = new TimeToMaturityColumnOption();
        columnOption.timeUnit = optionValues.timeUnit;
        columnOption.customScalingBandsDays = optionValues.customScalingBandsDays;
        columnOption.customScalingBandsMonths = optionValues.customScalingBandsMonths;
        columnOption.decimalPlaces = optionValues.decimalPlaces;

        // Remove the used settings.
        delete optionValues.timeUnit;
        delete optionValues.customScalingBandsDays;
        delete optionValues.customScalingBandsMonths;
        delete optionValues.decimalPlaces;

        return columnOption;
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
     * Gets the type of the config object.
     */
    get configType(): string {
        return TimeToMaturityColumnOption.CONFIG_TYPE;
    }

    /**
     * See AbstractColumnOption.doAddRequestParams
     */
     doAddRequestParams(requestParams: any): void {
        requestParams['timeUnit'] = this.timeUnit;
        if (!isUndefined(this.customScalingBandsDays)) {
            requestParams['customScalingBandsDays'] = this.customScalingBandsDays;
        }
        if (!isUndefined(this.customScalingBandsMonths)) {
            requestParams['customScalingBandsMonths'] = this.customScalingBandsMonths;
        }
        requestParams['decimalPlaces'] = this.decimalPlaces;
    }

    /**
     * Initialises the column with the default settings.
     */
    public initialize(defaultSettings: any): void {
        if (!defaultSettings) {
            return;
        }

        this.timeUnit = defaultSettings.columnOptionAttributes[0].defaultValue.value;
        if (this.timeUnit === 'Custom') {
            this.customScalingBandsDays = 90;
            this.customScalingBandsMonths = 24;
        }
        this.decimalPlaces = 0;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            timeUnit: this.timeUnit,
            customScalingBandsDays: this.customScalingBandsDays,
            customScalingBandsMonths: this.customScalingBandsMonths,
            decimalPlaces: this.decimalPlaces
        };
    }

    /**
     * Deserialize the data into this object.
     */
    public deserialize(data: any): void {
        this.timeUnit = data.timeUnit;
        this.customScalingBandsDays = data.customScalingBandsDays;
        this.customScalingBandsMonths = data.customScalingBandsMonths;
        this.decimalPlaces = data.decimalPlaces;
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof TimeToMaturityColumnOption)) {
            return false;
        }
        return this.timeUnit === otherColOption.timeUnit && this.customScalingBandsDays === otherColOption.customScalingBandsDays
            && this.customScalingBandsMonths === otherColOption.customScalingBandsMonths && this.decimalPlaces === otherColOption.decimalPlaces;
    }

    /**
     * Method that validates if the column option settinsg are valid to be serialized or to be added on to the request
     */
    isValid(): boolean {
        return !isNil(this.timeUnit);
    }

}
