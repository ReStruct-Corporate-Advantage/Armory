import {
    AbstractConfig,
    RequestParamsCreator,
    SerializeFavoriteType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {AppUtils} from '@utils/app.utils';

/**
 * Setting that holds the group by/aggregation level of the commitment risk widget for portfolio-level requests
 */
export class CommitmentRiskGrouping extends AbstractConfig implements WidgetInput, RequestParamsCreator {

    private readonly AGGREGATION_LEVEL_REQUEST_PARAM: string = 'aggregationLevel';

    // determines which attribute to group funds by in the ACRM statistics tab (portfolio-level only)
    groupBy: string;

    constructor(data?: any) {
        super();
        this.deserialize(data);
    }

    addRequestParams(requestParams: any): void {
        // undefined means server will Group By NONE
        if (this.groupBy) {
            requestParams[this.AGGREGATION_LEVEL_REQUEST_PARAM] = this.groupBy;
        }
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return this.groupBy;
    }


    deserialize(_data: any) {
        // must add default in JSON widget config for setting to be initialized, default is {} so groupBy will be undefined
        if (AppUtils.isObject(_data)) {
            this.groupBy = _data.groupBy;
        } else {
            this.groupBy = _data;
        }
    }

    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof CommitmentRiskGrouping)) {
            return false;
        }
        return this.groupBy === widgetInput.groupBy;
    }

    getConfigType(): string {
        return WidgetInputType.COMMITMENT_RISK_GROUPING;
    }

    static get configType(): string {
        return WidgetInputType.COMMITMENT_RISK_GROUPING;
    }

    isDataStoreInput(): boolean {
        return true;
    }
}
