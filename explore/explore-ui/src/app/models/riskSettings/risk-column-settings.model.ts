import {isNil, isObject, isString} from 'lodash';
import {AbstractConfig, RequestParamsCreator, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';

export class RiskColumnSettings extends AbstractConfig implements WidgetInput, RequestParamsCreator {

    static readonly CONFIG_TYPE = 'riskColumnSettings';

    disableSectorBreakdown = true;
    disableFactorBreakdown = false;
    groupingTypeSelected: { label: string; value: string; matchingRiskCategory: string };
    columnSetSelected: { label: string; value: string };
    isPortGroupSummaryRequest = false;
    showSecurities = false;

    /**
     * Constructor to create an instance of RiskColumnSettings
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Method to extract data for request params.
     */
    addRequestParams(requestParams: any, paramName?: string): void {
        requestParams.showSecurities = this.showSecurities;
        requestParams.isPortGroupSummaryRequest = this.isPortGroupSummaryRequest;
    }

    /**
     * Method to deserialize
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }

        if (!isNil(data.disableFactorBreakdown)) {
            this.disableFactorBreakdown = data.disableFactorBreakdown;
        }

        if (!isNil(data.disableSectorBreakdown)) {
            this.disableSectorBreakdown = data.disableSectorBreakdown;
        }

        if (!isNil(data.isPortGroupSummaryRequest)) {
            this.isPortGroupSummaryRequest = data.isPortGroupSummaryRequest;
        }

        if (!isNil(data.showSecurities)) {
            this.showSecurities = data.showSecurities;
        }

        if (!isNil(data.columnSetSelected)) {
            this.columnSetSelected = isString(data.columnSetSelected) ? JSON.parse(data.columnSetSelected) : data.columnSetSelected;
        }

        if (!isNil(data.groupingTypeSelected)) {
            this.groupingTypeSelected = isString(data.groupingTypeSelected) ? JSON.parse(data.groupingTypeSelected) : data.groupingTypeSelected;
        }
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Serialize the risk column settings to json.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {};

        if (!isNil(this.disableFactorBreakdown)) {
            data.disableFactorBreakdown = this.disableFactorBreakdown;
        }

        if (!isNil(this.disableSectorBreakdown)) {
            data.disableSectorBreakdown = this.disableSectorBreakdown;
        }

        if (!isNil(this.isPortGroupSummaryRequest)) {
            data.isPortGroupSummaryRequest = this.isPortGroupSummaryRequest;
        }

        if (!isNil(this.showSecurities)) {
            data.showSecurities = this.showSecurities;
        }

        if (!isNil(this.columnSetSelected)) {
            data.columnSetSelected = this.columnSetSelected;
        }

        if (!isNil(this.groupingTypeSelected)) {
            data.groupingTypeSelected = this.groupingTypeSelected;
        }

        return data;
    }

    /**
     * See WidgetInput.equals
     */
    equals(otherRiskColumnSettings: WidgetInput): boolean {
        if (!(otherRiskColumnSettings instanceof RiskColumnSettings)) {
            return false;
        }

        if (this.disableFactorBreakdown !== otherRiskColumnSettings.disableFactorBreakdown) {
            return false;
        }

        if (this.disableSectorBreakdown !== otherRiskColumnSettings.disableSectorBreakdown) {
            return false;
        }

        if (this.columnSetSelected !== otherRiskColumnSettings.columnSetSelected) {
            return false;
        }

        if (this.groupingTypeSelected !== otherRiskColumnSettings.groupingTypeSelected) {
            return false;
        }

        if (this.isPortGroupSummaryRequest !== otherRiskColumnSettings.isPortGroupSummaryRequest) {
            return false;
        }

        return this.showSecurities === otherRiskColumnSettings.showSecurities;
    }

    /**
     * See WidgetInput.isDataStoreInput
     */
    isDataStoreInput(): boolean {
        return true;
    }

}
