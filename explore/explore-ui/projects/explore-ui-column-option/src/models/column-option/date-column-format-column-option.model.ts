import {isEmpty, isNil, isObject} from 'lodash';
import {AbstractColumnOption, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Model class for date column format column option
 */
export class DateColumnFormatColumnOption extends AbstractColumnOption {

    static CONFIG_TYPE = 'dateColumnFormatColumnOption';

    value: string;
    label: number;

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    static createModelLegacy(optionValues: any): DateColumnFormatColumnOption {
        // If there is none of the required parameters then get out of here.
        if (isNil(optionValues.dateFormat)) {
            return undefined;
        }

        // Create the model.
        const columnOption: DateColumnFormatColumnOption = new DateColumnFormatColumnOption();
        columnOption.value = optionValues.dateFormat.value;
        columnOption.label = optionValues.dateFormat.label;

        // Remove the used settings.
        delete optionValues.dateFormat;

        return columnOption;
    }

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return DateColumnFormatColumnOption.CONFIG_TYPE;
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
        this.value = data.value;
        this.label = data.label;
    }

    /**
     * See AbstractColumnOption.doAddRequestParams
     */
    protected doAddRequestParams(requestParams: any) {
        requestParams.dateFormat =  {
            value: this.value,
            label: this.label
        };
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (!this.isValid()) {
            return undefined;
        }
        return {
            value: this.value,
            label: this.label
        };
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof DateColumnFormatColumnOption)) {
            return false;
        }
        return this.value === otherColOption.value && this.label === otherColOption.label;
    }

    /**
     * Method that validates if the column option settinsg are valid to be serialized or to be added on to the request
     */
    isValid(): boolean {
        return !isEmpty(this.value) || !isNil(this.label);
    }

}
