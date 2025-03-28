import {
    AbstractConfig, RequestParamsCreator,
    SerializeFavoriteType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {isEmpty, isObject, isUndefined} from 'lodash';

export class DiversificationScoreFactorSettings extends AbstractConfig implements WidgetInput, RequestParamsCreator {

    numberOfRiskFactors: number;
    additionalAnalytics: string[];

    /**
     * Gets the config type.
     */
    static get configType(): string {
        return WidgetInputType.DIVERSIFICATION_SCORE_FACTOR_SETTINGS;
    }

    getConfigType(): string {
        return WidgetInputType.DIVERSIFICATION_SCORE_FACTOR_SETTINGS;
    }

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (data.numberOfRiskFactors) {
            this.numberOfRiskFactors = data.numberOfRiskFactors;
        }
        if (data.additionalAnalytics) {
            this.additionalAnalytics = data.additionalAnalytics;
        }
    }

    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof DiversificationScoreFactorSettings)) {
            return false;
        }
        if (this.numberOfRiskFactors !== widgetInput.numberOfRiskFactors) {
            return false;
        }
        if (isUndefined(this.additionalAnalytics) && isUndefined(widgetInput.additionalAnalytics)) {
            return true;
        } else if (isUndefined(this.additionalAnalytics) && !isUndefined(widgetInput.additionalAnalytics)) {
            return false;
        } else if (!isUndefined(this.additionalAnalytics) && isUndefined(widgetInput.additionalAnalytics)) {
            return false;
        } else {
            if (this.additionalAnalytics.length !== widgetInput.additionalAnalytics.length) {
                return false;
            } else {
                return this.additionalAnalytics.filter(additionalAnalytic => !widgetInput.additionalAnalytics.includes(additionalAnalytic)).length == 0;
            }
        }

    }

    isDataStoreInput(): boolean {
        return true;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    serialize(_isNested?: boolean | SerializeFavoriteType, _shouldSaveLinkedFav?: (config: AbstractConfig) => boolean): any {
        const data: any = {};
        if (this.numberOfRiskFactors) {
            data.numberOfRiskFactors = this.numberOfRiskFactors;
        }
        if (!isEmpty(this.additionalAnalytics)) {
            data.additionalAnalytics = this.additionalAnalytics;
        }

        data.configType = WidgetInputType.DIVERSIFICATION_SCORE_FACTOR_SETTINGS;
        return data;
    }

    addRequestParams(requestParams: any, _paramName?: string, _isExportRequest?: boolean, _isBatchExport?: boolean): void {
        const diversificationScoreParam: any = {};
        if (this.numberOfRiskFactors) {
            diversificationScoreParam.numberOfRiskFactors = this.numberOfRiskFactors;
        }
        if (this.additionalAnalytics && this.additionalAnalytics.length > 0) {
            diversificationScoreParam.additionalAnalytics = this.additionalAnalytics;
        }
        if (Object.keys(diversificationScoreParam).length > 0) {
            requestParams.diversificationScoreFactorSettings = diversificationScoreParam;
        }
    }

}
