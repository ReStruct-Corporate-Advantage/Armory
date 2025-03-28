import {isNil, isObject} from 'lodash';
import {AbstractColumnOption, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Model class for numeric column format column options
 */
export class NumericColumnFormatColumnOption extends AbstractColumnOption {

    static CONFIG_TYPE = 'numericColumnFormatColumnOption';

    decimalPlaces: number;
    useThousandsSeparator: boolean;
    scaling: number;

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    static createModelLegacy(optionValues: any): NumericColumnFormatColumnOption {
        // If there is none of the required parameters then get out of here.
        if (isNil(optionValues.decimalPlaces)) {
            return undefined;
        }

        // Create the model.
        const columnOption: NumericColumnFormatColumnOption = new NumericColumnFormatColumnOption();
        columnOption.decimalPlaces = optionValues.decimalPlaces;
        columnOption.useThousandsSeparator = optionValues.useThousandsSeparator;
        columnOption.scaling = optionValues.scaling;

        // Remove the used settings.
        delete optionValues.decimalPlaces;
        delete optionValues.useThousandsSeparator;
        delete optionValues.scaling;

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
        return NumericColumnFormatColumnOption.CONFIG_TYPE;
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        this.decimalPlaces = data.decimalPlaces;
        this.useThousandsSeparator = data.useThousandsSeparator;
        this.scaling = data.scaling;
    }

    /**
     * See AbstractColumnOption.doAddRequestParams
     */
    protected doAddRequestParams(requestParams: any) {
        requestParams.decimalPlaces = this.decimalPlaces;
        requestParams.useThousandsSeparator = this.useThousandsSeparator;
        requestParams.scaling = this.scaling;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            decimalPlaces: this.decimalPlaces,
            useThousandsSeparator: this.useThousandsSeparator,
            scaling: this.scaling
        };
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof NumericColumnFormatColumnOption)) {
            return false;
        }
        return this.decimalPlaces === otherColOption.decimalPlaces && this.scaling === otherColOption.scaling && this.useThousandsSeparator === otherColOption.useThousandsSeparator;
    }

    /**
     * Method that validates if the column option settinsg are valid to be serialized or to be added on to the request
     */
    isValid(): boolean {
        return !isNil(this.scaling);
    }

}
