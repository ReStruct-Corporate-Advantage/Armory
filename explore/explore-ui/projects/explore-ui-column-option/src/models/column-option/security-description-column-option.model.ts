import {isNil} from 'lodash';
import {GenericValueColumnOption} from './generic-value-column-option.model';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Model class for the security description column option
 */
export class SecurityDescriptionColumnOption extends GenericValueColumnOption<string> {

    static CONFIG_TYPE = 'secDescOptions';

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    public static createModelLegacy(optionValues: any): SecurityDescriptionColumnOption {
        // If there is none of the required parameters then get out of here.
        if (isNil(optionValues.secDescDisplay)) {
            return undefined;
        }

        // Create the model.
        const columnOption: SecurityDescriptionColumnOption = new SecurityDescriptionColumnOption();
        columnOption.value = optionValues.secDescDisplay;

        // Remove the used settings.
        delete optionValues.secDescDisplay;

        return columnOption;
    }

    /**
     * Constructs the column option.
     */
    constructor(data?: any) {
        super(data);
    }

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return SecurityDescriptionColumnOption.CONFIG_TYPE;
    }

    /**
     * Serialise the content for the favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            secDescDisplay: this.value
        };
    }

    /**
     * Deserialize the cond=tent from the favorite.
     */
    deserialize(data: any): void {
        this.value = data.secDescDisplay;
    }

    /**
     * Ad the request params for this column option.
     */
    protected doAddRequestParams(optionValues: any) {
        optionValues.secDescDisplay = this.value;
    }
}
