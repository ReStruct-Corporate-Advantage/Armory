import {isEmpty, isObject, isString, isUndefined} from 'lodash';
import {AbstractColumnOption, ColumnTitleModifiable, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Model for Custom title column option
 */
export class CustomTitleColumnOption extends AbstractColumnOption implements ColumnTitleModifiable {

    public static CONFIG_TYPE = 'customColumnTitle';

    customTitle: string;

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    public static createModelLegacy(optionValues: any): CustomTitleColumnOption {
        // If there is none of the required parameters then get out of here.
        if (isUndefined(optionValues.title) || !isString(optionValues.title)) {
            // Given options are not custom title options
            return undefined;
        }

        // Create the model.
        const columnOption: CustomTitleColumnOption = new CustomTitleColumnOption();
        columnOption.customTitle = optionValues.title;
        // Now remove the old optionValues so nothing else can process them.
        delete optionValues.title;
        return columnOption;
    }

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * See AbstractColumnOption.doAddRequestParams
     */
    protected doAddRequestParams(requestParams: any): void {
        requestParams.title = this.customTitle;
    }

    /**
     * @return config type
     */
    get configType(): string {
        return CustomTitleColumnOption.CONFIG_TYPE;
    }

    /**
     * Function to change the custom title
     */
    public getModifiedColumnTitle(originalTitle: string): string {
        return this.customTitle ? this.customTitle : originalTitle;
    }

    /**
     * Deserialises given data
     * @param data data to deserialise
     */
    deserialize(data: any): void {
        this.customTitle = data.customTitle;
    }

    /**
     * See AbstractColumnOption.doSerialize
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        if ( !this.isValid()) {
            return undefined;
        }
        return {
            customTitle: this.customTitle
        };
    }

    /**
     * Checks whether it's equal to the given option
     * @param columnOption column option to check for equality against
     * @return true if equals, otherwise false
     */
    equals(columnOption: AbstractColumnOption): boolean {
        if (!(columnOption instanceof CustomTitleColumnOption)) {
            return false;
        }
        return this.customTitle === columnOption.customTitle;
    }

    /**
     * Check if the settings are valid
     */
    isValid(): boolean {
        if (isEmpty(this.customTitle)) {
            return false;
        }
        return true;
    }

}
