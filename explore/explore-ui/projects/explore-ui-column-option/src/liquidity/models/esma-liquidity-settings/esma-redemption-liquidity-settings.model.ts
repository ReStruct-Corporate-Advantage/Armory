import {get, head, isNil} from 'lodash';
import {AbstractLiquiditySettings} from '../abstract-liquidity-settings.model';
import {LiquidityConstants} from '../../liquidity.constants';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * ESMA Redemption Liquidity model class as a part of ESMA liquidation Settings
 */
export class EsmaRedemptionLiquiditySettings extends AbstractLiquiditySettings {
    private static readonly DEFAULT_LIABILITY_TYPE: string = LiquidityConstants.LIABILITY_TYPE_REDEMPTION_SCENARIOS;

    liabilityType: string;
    redemptionScenario: string;
    includeAdditionalCollateralFlag: boolean;

    /**
     * Initialises the liquidity settings with the default settings.
     */
    initialize(defaultSettings: Map<string, boolean>, definitions: Map<string, any>) {
        super.initialize(defaultSettings, definitions);

        this.liabilityType = EsmaRedemptionLiquiditySettings.DEFAULT_LIABILITY_TYPE;
        this.redemptionScenario = get(head(definitions.get(EsmaRedemptionLiquiditySettings.DEFAULT_LIABILITY_TYPE)), 'value');
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            liabilityType: this.liabilityType,
            redemptionScenario: this.redemptionScenario,
            includeAdditionalCollateralFlag: this.includeAdditionalCollateralFlag
        };
    }

    /**
     * Deserialize the data into this object
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }
        this.liabilityType = !isNil(data.liabilityType) ? data.liabilityType : EsmaRedemptionLiquiditySettings.DEFAULT_LIABILITY_TYPE;
        this.redemptionScenario = data.redemptionScenario;
        this.includeAdditionalCollateralFlag = data.includeAdditionalCollateralFlag;
    }

    /**
     * return true if two object are same otherwise return false
     */
    equals(option: AbstractLiquiditySettings) {
        if (!(option instanceof EsmaRedemptionLiquiditySettings)) {
            return false;
        }

        if (this.liabilityType !== option.liabilityType) {
            return false;
        }
        if (this.redemptionScenario !== option.redemptionScenario) {
            return false;
        }

        return (this.includeAdditionalCollateralFlag === option.includeAdditionalCollateralFlag);
    }

    /**
     * Get params that are to be send as a part of the request param
     */
    addRequestParams(requestParam: any): void {
        requestParam.liabilityType = this.liabilityType;
        requestParam.redemptionScenario = this.redemptionScenario;
        requestParam.includeAdditionalCollateralFlag = this.includeAdditionalCollateralFlag;
    }
}
