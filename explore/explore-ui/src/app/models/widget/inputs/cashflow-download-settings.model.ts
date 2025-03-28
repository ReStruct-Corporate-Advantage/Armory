import {AppUtils} from '@utils/app.utils';
import {AbstractConfig, RequestParamsCreator, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';

/**
 * Input model for the cashFlow Downloads
 */
export class CashflowDownloadSettings extends AbstractConfig implements WidgetInput, RequestParamsCreator {
    cashFlowDownload: boolean;

    readonly visibleColumns = [
        'portfolio_name', 'cusip', 'irr_fund_code', 'irr_currency',
        'irr_trade_date', 'irr_settle_date', 'irr_local_currency', 'irr_original_face', 'irr_local_market_value',
        'irr_exchange_rate', 'irr_type', 'irr_tran_type', 'irr_sub_tran_type', 'irr_mapping_type',
        'irr_transaction_id', 'irr_captured_aggs'
    ];

    readonly hiddenColumns = ['strategy_id'];

    readonly cashFlowFileTitle = 'IRR Cashflows';

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return 'cashFlowDownloadSettings';
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
        return {
            cashFlowDownload: this.cashFlowDownload
        };
    }

    /**
     * WidgetInput.deserialize(any)
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }
        this.cashFlowDownload = data.cashFlowDownload;
    }

    /**
     * WidgetInput.equals(WidgetInput)
     */
    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof CashflowDownloadSettings)) {
            return false;
        }
        return this.cashFlowDownload === widgetInput.cashFlowDownload;
    }

    addRequestParams(requestParams: any): void {
        requestParams['cashflowDownload'] = this.cashFlowDownload;
    }
}
