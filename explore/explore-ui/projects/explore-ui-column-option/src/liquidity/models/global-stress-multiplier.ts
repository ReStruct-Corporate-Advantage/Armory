import {isNil} from 'lodash';

export class GlobalStressMultiplier {

    static readonly LEGACY_STRESS_MULTIPLIER_LABEL = 'Stress multiplier';
    static readonly FIXED_COST_MULTIPLIER_LABEL = 'Bid-ask spread';
    static readonly MARKET_IMPACT_MULTIPLIER_LABEL = 'Volatility / OAS';
    static readonly MARKET_DEPTH_MULTIPLIER_LABEL = 'Market depth (ADV)';

    static readonly DEFAULT_STRESS_MULTIPLIER: number = 1;

    fixedCostMultiplier: number;
    marketDepthMultiplier: number;
    marketImpactMultiplier: number;

    constructor(data?: any) {
        this.fixedCostMultiplier = GlobalStressMultiplier.DEFAULT_STRESS_MULTIPLIER;
        this.marketDepthMultiplier = GlobalStressMultiplier.DEFAULT_STRESS_MULTIPLIER;
        this.marketImpactMultiplier = GlobalStressMultiplier.DEFAULT_STRESS_MULTIPLIER;
        if (data) {
            this.deserialize(data);
        }
    }

    serializeInto(data: any): void {
        data.fixedCostMultiplier = this.fixedCostMultiplier;
        data.marketDepthMultiplier = this.marketDepthMultiplier;
        data.marketImpactMultiplier = this.marketImpactMultiplier;
    }

    /**
     * Deserialize the data into this object
     */
    deserialize(data: any): void {
        this.fixedCostMultiplier = !isNil(data.fixedCostMultiplier) ? data.fixedCostMultiplier : GlobalStressMultiplier.DEFAULT_STRESS_MULTIPLIER;
        this.marketImpactMultiplier = !isNil(data.marketImpactMultiplier) ? data.marketImpactMultiplier : GlobalStressMultiplier.DEFAULT_STRESS_MULTIPLIER;
        if (!isNil(data.marketDepthMultiplier)) {
            this.marketDepthMultiplier = data.marketDepthMultiplier;
        } else {
            this.marketDepthMultiplier = !isNil(data.stressMultiplier) ? data.stressMultiplier : GlobalStressMultiplier.DEFAULT_STRESS_MULTIPLIER;
        }
    }

    /**
     * Get params that are to be sent as a part of the request param
     */
    addRequestParams(requestParam: any): void {
        requestParam.fixedCostMultiplier = this.fixedCostMultiplier;
        requestParam.stressMultiplier = this.marketDepthMultiplier;
        requestParam.marketImpactMultiplier = this.marketImpactMultiplier;
    }
}
