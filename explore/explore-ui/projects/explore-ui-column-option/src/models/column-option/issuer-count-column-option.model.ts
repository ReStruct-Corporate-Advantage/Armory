import {isNil} from 'lodash';
import {ColumnTitleModifiable, SerializeFavoriteType} from '@blk/explore-ui-core';
import {GenericValueColumnOption} from './generic-value-column-option.model';

/**
 * Model class for the issuer count column option
 */
export class IssuerCountColumnOption extends GenericValueColumnOption<boolean> implements ColumnTitleModifiable {

    static CONFIG_TYPE = 'issuercountColumnOptions';

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    public static createModelLegacy(optionValues: any): IssuerCountColumnOption {
        // If there is none of the required parameters then get out of here.
        if (isNil(optionValues.issuerType)) {
            return undefined;
        }

        // Create the model.
        const columnOption = new IssuerCountColumnOption();
        columnOption.value = optionValues.issuerType;

        // Remove the used settings.
        delete optionValues.issuerType;

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
        return IssuerCountColumnOption.CONFIG_TYPE;
    }

    /**
     * Serialise the content for the favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            issuerType: this.value
        };
    }

    /**
     * Deserialize the cond=tent from the favorite.
     */
    deserialize(data: any): void {
        this.value = data.issuerType;
    }

    /**
     * Ad the request params for this column option.
     */
    protected doAddRequestParams(optionValues: any) {
        optionValues.issuerType = this.value;
    }

    /**
     * If the issuer Type is true - It means the Column is 'Direct Issuer Count'
     * If the issuer Type is false - It means the Column is 'Parent Issuer Count'
     * This method returns the title modified according to the issuer type selected.
     */
    public getModifiedColumnTitle(originalTitle: string): string {
        return (this.value ? 'Direct ' : 'Parent ').concat(originalTitle);
    }

    /**
     * Initialises the column with the default settings.
     */
    public initialize(defaultSettings: any): void {
        super.initialize(defaultSettings);
        this.value = true;
    }

    /**
     * This option is always valid.
     */
    isValid(): boolean {
        return true;
    }
}
