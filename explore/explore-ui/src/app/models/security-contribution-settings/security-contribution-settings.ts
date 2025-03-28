import {AbstractColumnOption, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Column setting for security contribution spritelet widget from FBA widget
 */
export class SecurityContributionSettings extends AbstractColumnOption {

    static readonly CONFIG_TYPE: string = 'factorSecContribSettings';

    // flag indicating if column is factor based
    isFactorBased: boolean;

    // flag to display column only if it is factor level
    showWhenFactorLevelOnly: boolean;
    // flag to display column only when there is a bench column in parent
    showWhenPosTypeBenchExists: boolean;
    // flag to display column only when there is an active column in parent
    showWhenPosTypeActiveExists: boolean;

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return SecurityContributionSettings.CONFIG_TYPE;
    }

    /**
     * Deserializes json data into object
     */
    deserialize(data: any): void {
        this.isFactorBased = data.isFactorBased;
        this.showWhenFactorLevelOnly = data.showWhenFactorLevelOnly;
        this.showWhenPosTypeBenchExists = data.showWhenPosTypeBenchExists;
        this.showWhenPosTypeActiveExists = data.showWhenPosTypeActiveExists;
    }

    /**
     * See AbstractColumnOption.doAddRequestParams
     */
    protected doAddRequestParams(requestParams: any) {
        requestParams[SecurityContributionSettings.CONFIG_TYPE] = this.doSerialize();
    }

    /**
     * Serializes object for saving favorite
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {};
        data.isFactorBased = this.isFactorBased;
        data.showWhenFactorLevelOnly = this.showWhenFactorLevelOnly;
        data.showWhenPosTypeBenchExists = this.showWhenPosTypeBenchExists;
        data.showWhenPosTypeActiveExists = this.showWhenPosTypeActiveExists;
        return data;
    }

    /**
     * Checks two objects for equality
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof SecurityContributionSettings)) {
            return false;
        }

        if (this.isFactorBased !== otherColOption.isFactorBased) {
            return false;
        }

        if (this.showWhenFactorLevelOnly !== otherColOption.showWhenFactorLevelOnly) {
            return false;
        }
        if (this.showWhenPosTypeBenchExists !== otherColOption.showWhenPosTypeBenchExists) {
            return false;
        }
        if (this.showWhenPosTypeActiveExists !== otherColOption.showWhenPosTypeActiveExists) {
            return false;
        }
        return true;
    }

    /**
     * Determines if the setting is valid
     */
    isValid(): boolean {
        return true;
    }
}
