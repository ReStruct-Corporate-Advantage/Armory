import {isNil} from 'lodash';
import {ColumnTitleModifiable, SerializeFavoriteType} from '@blk/explore-ui-core';
import {GenericValueColumnOption} from './generic-value-column-option.model';

/**
 * Value XX Column Options Model
 */
export class ValueXXColumnOption extends GenericValueColumnOption<number> implements ColumnTitleModifiable {

    public static CONFIG_TYPE = 'valueXXColumnOptions';

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    public static createModelLegacy(optionValues: any): ValueXXColumnOption {
        // If there is none of the required parameters then get out of here.
        if (isNil(optionValues.shockValue)) {
            return undefined;
        }

        // Create the model.
        const columnOption = new ValueXXColumnOption();
        columnOption.value = optionValues.shockValue;

        // Remove the used settings.
        delete optionValues.shockValue;

        return columnOption;
    }

    /**
     * Constructor
     */
    constructor(data?: any) {
        super(data);
    }

    /**
     * Gets the type of the config object.
     */
    public get configType(): string {
        return ValueXXColumnOption.CONFIG_TYPE;
    }

    /**
     * Function to change the shock size.
     */
    public getModifiedColumnTitle(originalTitle: string): string {
        return this.value ? originalTitle.replace('xx', this.value.toString()) : originalTitle;
    }

    /**
     * Get params that are to be send as a part of the request param
     */
    public doAddRequestParams(requestParams: any): void {
        requestParams['shockValue'] = this.value;
    }

    /**
     * Initialises the column with the default settings.
     */
    public initialize(defaultSettings: any): void {
        if (defaultSettings) {
            this.value = defaultSettings.columnOptionAttributes[0].defaultValue.value;
        }
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    public doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            shockValue: this.value
        };
    }

    /**
     * Deserialize the data into this object.
     */
    public deserialize(data: any): void {
        this.value = data.shockValue;
    }

    /**
     * Validates that the settings are valid.
     */
    isValid(): boolean {
        return !isNil(this.value);
    }
}
