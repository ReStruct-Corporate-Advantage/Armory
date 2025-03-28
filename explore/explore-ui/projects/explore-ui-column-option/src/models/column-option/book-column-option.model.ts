import {isEmpty, isObject, isUndefined} from 'lodash';
import {AbstractColumnOption, ColumnTitleModifiable, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Book Column Options Model
 */
export class BookColumnOption extends AbstractColumnOption implements ColumnTitleModifiable {

    static CONFIG_TYPE = 'bookColumnOptions';

    accountingConvention: string;

    bookFxConversion = false;

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    static createModelLegacy(optionValues: any): BookColumnOption {
        // If there is none of the required parameters then get out of here.
        if (isUndefined(optionValues.accountingConvention)) {
            return undefined;
        }

        // Create the model.
        const columnOption: BookColumnOption = new BookColumnOption();
        columnOption.accountingConvention = optionValues.accountingConvention;
        columnOption.bookFxConversion = optionValues.bookFxConversion;

        // Remove the used settings.
        delete optionValues.accountingConvention;
        delete optionValues.bookFxConversion;

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
        return BookColumnOption.CONFIG_TYPE;
    }

    /**
     * Modify the column title to have the selected book type.
     */
    getModifiedColumnTitle(originalTitle: string): string {
        return originalTitle + ' (' + this.accountingConvention + ')';
    }

    /**
     * See AbstractColumnOption.doAddRequestParams
     */
    protected doAddRequestParams(requestParams: any): void {
        requestParams['accountingConvention'] = this.accountingConvention;
        if (!isUndefined(this.bookFxConversion)) {
            requestParams['bookFxConversion'] = this.bookFxConversion;
        }
    }

    /**
     * Initialises the column with the default settings.
     */
    initialize(defaultSettings: any): void {
        if (defaultSettings && defaultSettings.columnOptionAttributes) {
            this.accountingConvention = defaultSettings.columnOptionAttributes[0].defaultValue.value;
            if (!isUndefined(defaultSettings.columnOptionAttributes[1])) {
                this.bookFxConversion = defaultSettings.columnOptionAttributes[1].defaultValue.value;
            }
        }
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (!this.isValid()) {
            return undefined;
        }
        const data: any = {};
        data.accountingConvention = this.accountingConvention;
        if (!isUndefined(this.bookFxConversion)) {
            data.bookFxConversion = this.bookFxConversion;
        }
        return data;
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        this.accountingConvention = data.accountingConvention;
        if (!isUndefined(data.bookFxConversion)) {
            this.bookFxConversion = data.bookFxConversion;
        }
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof  BookColumnOption)) {
            return false;
        }
        return this.bookFxConversion === otherColOption.bookFxConversion && this.accountingConvention === otherColOption.accountingConvention;
    }

    /**
     * Check if the settings are valid
     */
    isValid(): boolean {
        return !isEmpty(this.accountingConvention);
    }
}
