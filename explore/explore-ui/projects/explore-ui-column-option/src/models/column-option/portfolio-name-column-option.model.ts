import {isNil, isObject, isUndefined} from 'lodash';
import {AbstractColumnOption, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Model class for Portfolio Name Options
 */
export class PortfolioNameColumnOption extends AbstractColumnOption {
    static CONFIG_TYPE = 'portfolioNameConfigOptions';

    private static readonly PORTFOLIO_SHORT_NAME = 'showShortNameForPortfolio';
    private static readonly PORT_GROUP_SHORT_NAME = 'showShortNameForPortGroup';

    showShortNameForPortfolio: boolean;
    showShortNameForPortGroup: boolean;

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    static createModelLegacy(optionValues: any): PortfolioNameColumnOption {
        // If there is none of the required parameters then get out of here.
        if (isUndefined(optionValues.showShortNameForPortfolio) && isUndefined(optionValues.showShortNameForPortGroup)) {
            return undefined;
        }

        // Create the model.
        const columnOption: PortfolioNameColumnOption = new PortfolioNameColumnOption();

        if (!isUndefined(optionValues.showShortNameForPortfolio)) {
            columnOption.showShortNameForPortfolio = optionValues.showShortNameForPortfolio;
            delete optionValues.showShortNameForPortfolio;
        }

        if (!isUndefined(optionValues.showShortNameForPortGroup)) {
            columnOption.showShortNameForPortGroup = optionValues.showShortNameForPortGroup;
            delete optionValues.showShortNameForPortGroup;
        }

        return columnOption;
    }

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
        return PortfolioNameColumnOption.CONFIG_TYPE;
    }

    /**
     * Get the params that are to be sent as a part of the request param
     */
    doAddRequestParams(optionValues: any): void {
        optionValues[ PortfolioNameColumnOption.PORTFOLIO_SHORT_NAME ] = this.showShortNameForPortfolio;
        optionValues[ PortfolioNameColumnOption.PORT_GROUP_SHORT_NAME ] = this.showShortNameForPortGroup;
    }

    /**
     * Initialises the column with the default settings.
     */
    public initialize(defaultSettings?: any): void {
        this.showShortNameForPortfolio = true;
        this.showShortNameForPortGroup = true;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            showShortNameForPortfolio: this.showShortNameForPortfolio,
            showShortNameForPortGroup: this.showShortNameForPortGroup
        };
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }
        this.showShortNameForPortfolio = data.showShortNameForPortfolio;
        this.showShortNameForPortGroup = data.showShortNameForPortGroup;
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof PortfolioNameColumnOption)) {
            return false;
        }
        return this.showShortNameForPortfolio === otherColOption.showShortNameForPortfolio && this.showShortNameForPortGroup === otherColOption.showShortNameForPortGroup;
    }

    /**
     * Check if the settings are valid
     */
    isValid(): boolean {
        return !isUndefined(this.showShortNameForPortfolio) && !isUndefined(this.showShortNameForPortGroup);
    }
}
