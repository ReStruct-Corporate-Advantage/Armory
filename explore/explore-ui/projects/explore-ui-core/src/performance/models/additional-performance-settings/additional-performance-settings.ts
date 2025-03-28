import {isNil, isObject} from 'lodash';
import {AbstractConfig} from '../../../core/models/abstract-config.model';
import {PerformanceConstants} from '../../performance.constants';

/**
 * Model for Additional Performance Settings for Returns Widget
 */
export class AdditionalPerformanceSettings extends AbstractConfig {
    asReported: boolean;
    showSummary: boolean;
    aggregateBMOnlyReturnSecurities: boolean;
    removeBMOnlyReturnBucket: boolean;
    collapseClosedPositions: boolean;
    customBreakdownType: boolean;
    customPivotPoint: string;
    isNetReturn: boolean;
    overrideDateSortByOldest: boolean;

    /**
     * Create an instance of AdditionalPerformanceSettings using the passed in params
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Return false if the passed in AdditionalPerformanceSettings is not equal to this
     */
    equals(otherAdditionalPerformanceSettings: AbstractConfig): boolean {
        if (!(otherAdditionalPerformanceSettings instanceof AdditionalPerformanceSettings)) {
            return false;
        }
        if (this.asReported !== otherAdditionalPerformanceSettings.asReported) {
            return false;
        }
        if (this.showSummary !== otherAdditionalPerformanceSettings.showSummary) {
            return false;
        }
        if (this.aggregateBMOnlyReturnSecurities !== otherAdditionalPerformanceSettings.aggregateBMOnlyReturnSecurities) {
            return false;
        }
        if (this.removeBMOnlyReturnBucket !== otherAdditionalPerformanceSettings.removeBMOnlyReturnBucket) {
            return false;
        }
        if (this.collapseClosedPositions !== otherAdditionalPerformanceSettings.collapseClosedPositions) {
            return false;
        }
        if (this.customBreakdownType !== otherAdditionalPerformanceSettings.customBreakdownType) {
            return false;
        }
        if (this.customPivotPoint !== otherAdditionalPerformanceSettings.customPivotPoint) {
            return false;
        }
        if (this.overrideDateSortByOldest !== otherAdditionalPerformanceSettings.overrideDateSortByOldest) {
            return false;
        }
        return this.isNetReturn === otherAdditionalPerformanceSettings.isNetReturn;
    }

    /**
     * Serialize the config to json.
     */
    serialize(): any {
        return {
            asReported: this.asReported,
            showSummary: this.showSummary,
            aggregateBMOnlyReturnSecurities: this.aggregateBMOnlyReturnSecurities,
            removeBMOnlyReturnBucket: this.removeBMOnlyReturnBucket,
            collapseClosedPositions: this.collapseClosedPositions,
            customBreakdownType: this.customBreakdownType,
            customPivotPoint: this.customPivotPoint,
            isNetReturn: this.isNetReturn,
            overrideDateSortByOldest: this.overrideDateSortByOldest
        };
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }

        if (!isNil(data.asReported)) {
            this.asReported = data.asReported;
        } else if (!isNil(data[PerformanceConstants.AS_REPORTED])) {
            this.asReported = data[PerformanceConstants.AS_REPORTED];
        }
        if (!isNil(data.showSummary)) {
            this.showSummary = data.showSummary;
        }
        if (!isNil(data.aggregateBMOnlyReturnSecurities)) {
            this.aggregateBMOnlyReturnSecurities = data.aggregateBMOnlyReturnSecurities;
        }
        if (!isNil(data.removeBMOnlyReturnBucket)) {
            this.removeBMOnlyReturnBucket = data.removeBMOnlyReturnBucket;
        }
        if (!isNil(data.collapseClosedPositions)) {
            this.collapseClosedPositions = data.collapseClosedPositions;
        }
        if (!isNil(data.customBreakdownType)) {
            this.customBreakdownType = data.customBreakdownType;
        }
        if (!isNil(data.customPivotPoint)) {
            this.customPivotPoint = data.customPivotPoint;
        }
        if (!isNil(data.isNetReturn)) {
            this.isNetReturn = data.isNetReturn;
        }
        if (!isNil(data.overrideDateSortByOldest)) {
            this.overrideDateSortByOldest = data.overrideDateSortByOldest;
        }
    }

    /**
     * Method to extract params for the request
     */
    addRequestData(requestParams: any): void {
        requestParams[PerformanceConstants.AS_REPORTED] = this.asReported;
        requestParams.showSummary = this.showSummary;
        requestParams.aggregateBMOnlyReturnSecurities = this.aggregateBMOnlyReturnSecurities;
        requestParams.removeBMOnlyReturnBucket = this.removeBMOnlyReturnBucket;
        requestParams.collapseClosedPositions = this.collapseClosedPositions;
        requestParams.customBreakdownType = this.customBreakdownType;
        requestParams.customPivotPoint = this.customPivotPoint;
        requestParams.isNetReturn = !!this.isNetReturn;
        requestParams.overrideDateSortByOldest = this.overrideDateSortByOldest;
    }
}
