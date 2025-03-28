import {isObject, isUndefined} from 'lodash';
import {AbstractColumnOption, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Euro bond Column Option Model
 */
export class EuroBondColumnOption extends AbstractColumnOption {
    public static CONFIG_TYPE = 'DurationForEuroBond';
    useDurationForEuroGovtBonds: boolean;

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    public static createModelLegacy(optionValues: any): EuroBondColumnOption {
        // If there is none of the required parameters then get out of here.
        // NOTE: We need the euroBonds options (that is this model) if the given options values have
        // useDurationForEuroGovtBonds attribute and it does not have isOasBased attribute.
        // (The DxsColumnOptionsModel also has useDurationForEuroGovtBonds attribute but it also has isOasBased.
        // Hence we know when the given option values do not have isOasBased attribute they are for this model)
        if (isUndefined(optionValues.useDurationForEuroGovtBonds) || !isUndefined(optionValues.isOasBased)) {
            // Given options are not euroBonds options
            return undefined;
        }
        // Create the model.
        const columnOption: EuroBondColumnOption = new EuroBondColumnOption();
        columnOption.useDurationForEuroGovtBonds = optionValues.useDurationForEuroGovtBonds;

        // Remove the used settings.
        delete optionValues.useDurationForEuroGovtBonds;

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
        return EuroBondColumnOption.CONFIG_TYPE;
    }

    /**
     * Initialises the column with the default settings.
     */
    initialize(defaultSettings: any): void {
        this.useDurationForEuroGovtBonds = false;
    }

    /**
     * Get params that are to be send as a part of the request param
     */
    protected doAddRequestParams(requestParams: any): void {
        requestParams.useDurationForEuroGovtBonds = this.useDurationForEuroGovtBonds;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (!this.isValid()) {
            return undefined;
        }
        const data: any = {};
        data.useDurationForEuroGovtBonds = this.useDurationForEuroGovtBonds;
        return data;
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        this.useDurationForEuroGovtBonds = data.useDurationForEuroGovtBonds;
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: EuroBondColumnOption): boolean {
        if (!(otherColOption instanceof EuroBondColumnOption)) {
            return false;
        }
        return this.useDurationForEuroGovtBonds === otherColOption.useDurationForEuroGovtBonds;
    }

    /**
     * Method that validates if the column option settings are valid to be serialized or to be added on to the request
     */
    isValid(): boolean {
        return !isUndefined(this.useDurationForEuroGovtBonds);
    }
}
