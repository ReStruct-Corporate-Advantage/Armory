import {WeightingSchemes} from '@blk/explore-ui-core';
import {isObject} from 'lodash';

export class DefaultRiskSettings {
    riskHorizon: string;
    weightingScheme: WeightingSchemes;
    modelMapping: string;
    confidenceLevelInStdDeviation: number;
    assetClassCovariance: string;
    dxsBlock: string;
    scaleDxsExposures: boolean;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    deserialize(data: any) {
        if (!data) {
            return;
        }

        if (data.RiskHorizon) {
            this.riskHorizon = data.RiskHorizon;
        }
        if (data.WeightingScheme) {
            this.weightingScheme = new WeightingSchemes(data.WeightingScheme);
        }
        if (data.ModelMapping) {
            this.modelMapping = data.ModelMapping;
        }
        if (data.ConfidenceLevelInStdDeviation) {
            this.confidenceLevelInStdDeviation = data.ConfidenceLevelInStdDeviation;
        }
        if (data.AssetClassCovariance) {
            this.assetClassCovariance = data.AssetClassCovariance;
        }
        if (data.DxsBlock) {
            this.dxsBlock = data.DxsBlock;
        }
        if (data.ScaleDxsExposures) {
            this.scaleDxsExposures = data.ScaleDxsExposures;
        }
    }
}
