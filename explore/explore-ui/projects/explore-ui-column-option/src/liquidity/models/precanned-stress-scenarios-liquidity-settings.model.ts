import {isNil} from 'lodash';
import {AbstractLiquiditySettings} from './abstract-liquidity-settings.model';
import {LiquidityConstants} from '../liquidity.constants';

/**
 * Precanned liquidity stress scenarios model class
 */
export class PrecannedStressScenariosLiquiditySettings extends AbstractLiquiditySettings {
    assetStressScenario: string;
    stressMultiplierType: string;

    /**
     * Initialises the liquidity settings with the default settings.
     */
    initialize(defaultSettings: Map<string, boolean>) {
        super.initialize(defaultSettings);
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    serialize(_isNested?: boolean | number): any {
        return {
            assetStressScenario: this.assetStressScenario !== LiquidityConstants.DEFAULT_ASSET_STRESS_SCENARIO ? this.assetStressScenario : undefined,
            stressMultiplierType: this.stressMultiplierType !== LiquidityConstants.DEFAULT_STRESS_MULTIPLIER_TYPE ? this.stressMultiplierType : undefined,
        };
    }

    /**
     * Deserialize the data into this object
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }
        if (!isNil(data.assetStressScenario)) {
            this.assetStressScenario = data.assetStressScenario;
        }
        if (!isNil(data.stressMultiplierType)) {
            this.stressMultiplierType = data.stressMultiplierType;
        }
    }

    /**
     * return true if two object are same otherwise return false
     */
    equals(option: AbstractLiquiditySettings) {
        if (!(option instanceof PrecannedStressScenariosLiquiditySettings)) {
            return false;
        }

        if (this.assetStressScenario !== option.assetStressScenario) {
            return false;
        }

        return (this.stressMultiplierType === option.stressMultiplierType);
    }

    /**
     * Get params that are to be send as a part of the request param
     */
    addRequestParams(requestParam: any): void {
        if (this.assetStressScenario && this.assetStressScenario !== LiquidityConstants.DEFAULT_ASSET_STRESS_SCENARIO) {
            requestParam.assetStressScenario = this.assetStressScenario;
        }
        if (this.stressMultiplierType && this.stressMultiplierType !== LiquidityConstants.DEFAULT_STRESS_MULTIPLIER_TYPE) {
            requestParam.stressMultiplierType = this.stressMultiplierType;
        }
    }
}
