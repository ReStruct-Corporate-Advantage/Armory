import {isUndefined, isObject} from 'lodash';
import {AbstractColumnOption, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Research Additional Display Column Options Model
 */
export class ResearchAdditionalDisplayColumnOption extends AbstractColumnOption {
    public static CONFIG_TYPE = 'researchAdditionalDisplayOption';
    showMembership: boolean;

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    public static createModelLegacy(optionValues: any): ResearchAdditionalDisplayColumnOption {
        if (isUndefined(optionValues.showMembership)) {
            return undefined;
        }
        // Create the model.
        const columnOption: ResearchAdditionalDisplayColumnOption = new ResearchAdditionalDisplayColumnOption();
        columnOption.showMembership = (optionValues.showMembership === 'true');

        // Remove the used settings.
        delete optionValues.showMembership;

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
        return ResearchAdditionalDisplayColumnOption.CONFIG_TYPE;
    }

    /**
     * Initialises the column with the default settings.
     */
    initialize(defaultSettings: any): void {
        if (defaultSettings && defaultSettings.columnOptionAttributes) {
            if (!isUndefined(defaultSettings.columnOptionAttributes[0].defaultValue)) {
                this.showMembership = defaultSettings.columnOptionAttributes[0].defaultValue.value;
            }
        }
    }

    /**
     * Get params that are to be send as a part of the request param
     */
    protected doAddRequestParams(requestParams: any): void {
        requestParams.showMembership = this.showMembership;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (!this.isValid()) {
            return undefined;
        }
        const data: any = {};
        data.showMembership = this.showMembership;
        return data;
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        this.showMembership = data.showMembership;
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: ResearchAdditionalDisplayColumnOption): boolean {
        if (!(otherColOption instanceof  ResearchAdditionalDisplayColumnOption)) {
            return false;
        }
        return this.showMembership === otherColOption.showMembership;
    }

    /**
     * Method that validates if the column option settings are valid to be serialized or to be added on to the request
     */
    isValid(): boolean {
        return !isUndefined(this.showMembership);
    }
}
