import {AbstractLiquiditySettings} from './abstract-liquidity-settings.model';
import {isNil} from 'lodash';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * General liquidity Setting model as a part of liquidity Setting model
 */
export class GeneralLiquiditySettings extends AbstractLiquiditySettings {

    private static readonly DEFAULT_HORIZON: number = 1;
    private static readonly DEFAULT_ADV_PARTICIPATION_RATE: number = 25;
    private static readonly DEFAULT_ADV_PARTICIPATION_RATE_EQUITY: number = 25;
    private static readonly DEFAULT_ADV_PARTICIPATION_RATE_OTHER: number = 100;

    horizon: number;
    advParticipationRate: number;
    advParticipationRateEquity: number;
    advParticipationRateOther: number;

    /**
     * Initialises the liquidity settings with the default settings.
     */
    initialize(defaultSettings: Map<string, boolean>) {
        super.initialize(defaultSettings);

        this.horizon = GeneralLiquiditySettings.DEFAULT_HORIZON;
        this.advParticipationRate = GeneralLiquiditySettings.DEFAULT_ADV_PARTICIPATION_RATE;
        this.advParticipationRateEquity = GeneralLiquiditySettings.DEFAULT_ADV_PARTICIPATION_RATE_EQUITY;
        this.advParticipationRateOther = GeneralLiquiditySettings.DEFAULT_ADV_PARTICIPATION_RATE_OTHER;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            horizon: this.horizon,
            advParticipationRate: this.advParticipationRate,
            advParticipationRateEquity: this.advParticipationRateEquity,
            advParticipationRateOther: this.advParticipationRateOther
        };
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }

        this.horizon = !isNil(data.horizon) ? data.horizon : GeneralLiquiditySettings.DEFAULT_HORIZON;
        this.advParticipationRate = !isNil(data.advParticipationRate) ? data.advParticipationRate : GeneralLiquiditySettings.DEFAULT_ADV_PARTICIPATION_RATE;
        this.advParticipationRateEquity = !isNil(data.advParticipationRateEquity) ? data.advParticipationRateEquity : GeneralLiquiditySettings.DEFAULT_ADV_PARTICIPATION_RATE_EQUITY;
        this.advParticipationRateOther = !isNil(data.advParticipationRateOther) ? data.advParticipationRateOther : GeneralLiquiditySettings.DEFAULT_ADV_PARTICIPATION_RATE_OTHER;
    }

    /**
     * Return true if two object are same otherwise return false
     */
    equals(option: AbstractLiquiditySettings) {
        if (!(option instanceof GeneralLiquiditySettings)) {
            return false;
        }

        if (this.horizon !== option.horizon) {
            return false;
        }

        if (this.advParticipationRate !== option.advParticipationRate) {
            return false;
        }

        if (this.advParticipationRateEquity !== option.advParticipationRateEquity) {
            return false;
        }

        return (this.advParticipationRateOther === option.advParticipationRateOther);
    }

    /**
     * Add value to request params
     */
    addRequestParams(requestParam: any): void {
        requestParam.horizon = this.horizon;
        requestParam.advParticipationRate = this.advParticipationRate;

        if (this.advParticipationRateEquity !== GeneralLiquiditySettings.DEFAULT_ADV_PARTICIPATION_RATE_EQUITY) {
            requestParam.advParticipationRateEquity = this.advParticipationRateEquity;
        }

        if (this.advParticipationRateOther !== GeneralLiquiditySettings.DEFAULT_ADV_PARTICIPATION_RATE_OTHER) {
            requestParam.advParticipationRateOther = this.advParticipationRateOther;
        }
    }
}
