import {isNil} from 'lodash';
import {GenericValueColumnOption} from './generic-value-column-option.model';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Model class for the swap equivalent column option
 */
export class SwapEquivalentColumnOption extends GenericValueColumnOption<number> {

    static CONFIG_TYPE = 'swapEquivalentColumnOptions';

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    public static createModelLegacy(optionValues: any): SwapEquivalentColumnOption {
        // If there is none of the required parameters then get out of here.
        if (isNil(optionValues.swapDuration)) {
            return undefined;
        }

        // Create the model.
        const columnOption: SwapEquivalentColumnOption = new SwapEquivalentColumnOption();
        columnOption.value = optionValues.swapDuration;

        // Remove the used settings.
        delete optionValues.swapDuration;

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
        return SwapEquivalentColumnOption.CONFIG_TYPE;
    }

    /**
     * Serialise the content for the favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            swapDuration: this.value
        };
    }

    /**
     * Deserialize the cond=tent from the favorite.
     */
    deserialize(data: any): void {
        this.value = data.swapDuration;
    }

    /**
     * Ad the request params for this column option.
     */
    protected doAddRequestParams(optionValues: any) {
        optionValues.swapDuration = this.value;
    }

    /**
     * Initialises the column with the default settings.
     */
    public initialize(defaultSettings: any): void {
        super.initialize(defaultSettings);
        this.value = 1;
    }

    /**
     * This option is always valid.
     */
    isValid(): boolean {
        return true;
    }
}
