import {
    AbstractConfig,
    RequestParamsCreator,
    SerializeFavoriteType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';

/**
 * WidgetInput model for fund cusip for which commitment risk needs to be calculated
 */
export class FundCusip extends AbstractConfig implements WidgetInput, RequestParamsCreator {
    static readonly CONFIG_TYPE = 'fundCusip';

    cusip: string;

    /**
     * Constructor.
     */
    constructor(cusip?: string) {
        super();
       this.cusip = cusip;
    }

    /**
     * Return config value
     */
    static get configType(): string {
        return WidgetInputType.FUND_CUSIP;
    }

    getConfigType() {
        return WidgetInputType.FUND_CUSIP;
    }

    /**
     * Equals method to test whether two object are equal or not
     */
    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof FundCusip)) {
            return false;
        }
        return this.cusip === widgetInput.cusip;
    }

    isDataStoreInput(): boolean {
        return true;
    }

    addRequestParams(requestParams: any, paramName?: string): void {
        requestParams[paramName ? paramName : WidgetInputType.FUND_CUSIP] = this.cusip;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return this.cusip;
    }

    deserialize(data: any): void {
        this.cusip = data;
    }
}
