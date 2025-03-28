import {isObject} from 'lodash';
import {AbstractConfig, RequestParamsCreator, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';

/**
 * RiskAndExposureAdditionalSettings model
 */
export class RiskAndExposureAdditionalSettings extends AbstractConfig implements WidgetInput, RequestParamsCreator {
    closedPositionAggregationType = '';
    benchmarkPositionAggregationType = '';
    portfolioPositionAggregationType = '';

    /**
     * @returns config type.
     */
    static get configType(): string {
        return 'riskAndExposureAdditionalSettings';
    }

    getConfigType() {
        return 'riskAndExposureAdditionalSettings';
    }

    /**
     * Constructor to create an instance of RiskAndExposureAdditionalSettings
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * @param otherRiskAndExposureAdditionalSettings otherRiskAndExposureAdditionalSettings to evaluate against
     * @return true if the given settings equals to this one, otherwise false
     */
    equals(otherRiskAndExposureAdditionalSettings: AbstractConfig): boolean {
        if (!(otherRiskAndExposureAdditionalSettings instanceof RiskAndExposureAdditionalSettings)) {
            return false;
        }
        if (this.closedPositionAggregationType !== otherRiskAndExposureAdditionalSettings.closedPositionAggregationType) {
            return false;
        }
        if (this.benchmarkPositionAggregationType !== otherRiskAndExposureAdditionalSettings.benchmarkPositionAggregationType) {
            return false;
        }

        return this.portfolioPositionAggregationType === otherRiskAndExposureAdditionalSettings.portfolioPositionAggregationType;
    }

    /**
     * @return true as it's data store input
     */
    isDataStoreInput(): boolean {
        return true;
    }

    /*
     * See AbstractConfig.deserialize
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }

        if (!(data.closedPositionAggregationType || data.benchmarkPositionAggregationType || data.portfolioPositionAggregationType) && data.data) {
            // this is to handle old favorites where data is stored inside data.data
            // But we only want to do this if the settings are not in the parent object already.
            data = data.data;
        }

        this.closedPositionAggregationType = data.closedPositionAggregationType;
        this.benchmarkPositionAggregationType = data.benchmarkPositionAggregationType;
        this.portfolioPositionAggregationType = data.portfolioPositionAggregationType;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /*
     * See AbstractConfig.serialize
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            configType: RiskAndExposureAdditionalSettings.configType,
            closedPositionAggregationType: this.closedPositionAggregationType,
            benchmarkPositionAggregationType: this.benchmarkPositionAggregationType,
            portfolioPositionAggregationType: this.portfolioPositionAggregationType
        };
    }

    /**
     * Adds its attributes as request parameters to the given requestParams
     * @see RequestParamsCreator.addRequestParams
     */
    addRequestParams(requestParams: any, paramName?: string): void {
        requestParams.benchmarkPositionAggregationType = this.benchmarkPositionAggregationType;
        requestParams.closedPositionAggregationType = this.closedPositionAggregationType;
        requestParams.portfolioPositionAggregationType = this.portfolioPositionAggregationType;
    }

    /**
     * Returns true if any of the position aggregation options are enabled
     */
    isAnyPositionAggregationEnabled(): boolean {
        return this.closedPositionAggregationType !== 'NONE' || this.benchmarkPositionAggregationType !== 'NONE' || this.portfolioPositionAggregationType !== 'NONE';
    }
}
