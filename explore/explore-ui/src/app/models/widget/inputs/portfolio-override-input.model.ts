import {AppUtils} from '@utils/app.utils';
import {
    AbstractConfig,
    DateValue,
    SerializeFavoriteType,
    WidgetInput,
    WidgetTitleModifiable
} from '@blk/explore-ui-core';

/**
 * Widget Input that represents a portfolio override to the workpad portfolio
 */
export class PortfolioOverrideInput extends AbstractConfig implements WidgetInput, WidgetTitleModifiable {

    static readonly PORTFOLIO_OVERRIDE_INPUT = 'portfolioOverrideInput';
    portfolio: string;
    updateBenchAndCurrency: boolean;

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return 'portfolioOverrideInput';
    }

    /**
     * Constructor
     */
    constructor(data?: any) {
        super();
        if (AppUtils.isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * WidgetInput.isDataStoreInput()
     */
    isDataStoreInput(): boolean {
        return true;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * WidgetInput.serialize(boolean)
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (!this.portfolio) {
           return undefined;
        }
        return {portfolio: this.portfolio,
        ...(this.updateBenchAndCurrency ? {updateBenchAndCurrency: this.updateBenchAndCurrency} : {})};
    }

    /**
     * WidgetInput.deserialize(any)
     */
    deserialize(data: any): void {
        if (data.customInputs && data.customInputs.portfolio) {
            this.portfolio = data.customInputs.portfolio;
        } else if (data.portfolio) {
            this.portfolio = data.portfolio;
        }
        if (data.updateBenchAndCurrency) {
            this.updateBenchAndCurrency = data.updateBenchAndCurrency;
        }
    }

    /**
     * WidgetInput.equals(WidgetInput)
     */
    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof PortfolioOverrideInput)) {
            return false;
        }
        if (this.updateBenchAndCurrency !== widgetInput.updateBenchAndCurrency) {
            return false;
        }
        return this.portfolio === widgetInput.portfolio;
    }

    /**
     * Add params to the passed in parameter that need to be passed to backend
     */
    addRequestParams(requestParams: any): void {
        if (this.portfolio) {
            requestParams.portfolio = this.portfolio;
            requestParams.portfolioIdentifier = this.portfolio;
        }

    }

    /**
     * WidgetTitleModifiable.getModifiedWidgetTitleDetails(DateValue)
     */
    getModifiedWidgetTitleDetails(portfolioDate: DateValue): any {
        if (!this.portfolio) {
            return '';
        }
        return this.portfolio;
    }
}
