import {isEqual, isNil} from 'lodash';
import {AbstractLiquiditySettings} from '../abstract-liquidity-settings.model';
import {LiquidityConstants} from '../../liquidity.constants';
import {SerializeFavoriteType} from '@blk/explore-ui-core';
import {GlobalStressMultiplier} from '../global-stress-multiplier';

/**
 * ESMA Liquidation Footer model class as a part of ESMA liquidation Settings
 */
export class EsmaLiquidationFooterLiquiditySettings extends AbstractLiquiditySettings {
    private static readonly DEFAULT_USE_NOTIONAL_AMT_LIQ = false;
    private static readonly DEFAULT_NET_AGGREGATION: string = LiquidityConstants.AGGREGATION_NET;
    private static readonly DEFAULT_HOLIDAY_LOOKUP: number = 5;

    private static readonly ESMA_ILLIQUID_MAX_FORMAT = 'esma_illiquid_max_format';
    private static readonly ESMA_ILLIQUID_MAX_ABS = 'esma_illiquid_max_abs_pct';
    private static readonly ESMA_ILLIQUID_MAX_REL = 'esma_illiquid_max_rel';
    private static readonly ESMA_LIQUIDATION_DEF = 'esma_days-to-unwind';
    static readonly DEFAULT_STRESS_MULTIPLIER: number = 1;

    useNotionalAmtLiq: boolean;
    aggregation: string;
    sectorLevelStressTestingFlag: boolean;
    globalLevelStressTestingFlag: boolean;
    illiquidMaxFormat: string;
    absIlliquidMax: number;
    relIlliquidMax: number;
    illiquidDef: number;
    holidayLookup: number;
    illiquidEnabledFlag: boolean;
    assetStressScenario: string;
    globalStressMultiplier: GlobalStressMultiplier;

    /**
     * Initialises the liquidity settings with the default settings.
     */
    initialize(defaultSettings: Map<string, boolean>, definitions: Map<string, any>): void {
        super.initialize(defaultSettings, definitions);

        const liquidityDefaults: {string: any} = this.getLiquidityDefaults(definitions);

        this.useNotionalAmtLiq = EsmaLiquidationFooterLiquiditySettings.DEFAULT_USE_NOTIONAL_AMT_LIQ;
        this.aggregation = EsmaLiquidationFooterLiquiditySettings.DEFAULT_NET_AGGREGATION;
        this.globalStressMultiplier = new GlobalStressMultiplier();
        this.holidayLookup = EsmaLiquidationFooterLiquiditySettings.DEFAULT_HOLIDAY_LOOKUP;

        if (liquidityDefaults && EsmaLiquidationFooterLiquiditySettings.ESMA_ILLIQUID_MAX_FORMAT in liquidityDefaults) {
            this.illiquidMaxFormat = String(liquidityDefaults[EsmaLiquidationFooterLiquiditySettings.ESMA_ILLIQUID_MAX_FORMAT]);
        }

        if (liquidityDefaults && EsmaLiquidationFooterLiquiditySettings.ESMA_ILLIQUID_MAX_ABS in liquidityDefaults) {
            this.absIlliquidMax = Number(liquidityDefaults[EsmaLiquidationFooterLiquiditySettings.ESMA_ILLIQUID_MAX_ABS]) * 100;
        }
        if (liquidityDefaults && EsmaLiquidationFooterLiquiditySettings.ESMA_ILLIQUID_MAX_REL in liquidityDefaults) {
            this.relIlliquidMax = Number(liquidityDefaults[EsmaLiquidationFooterLiquiditySettings.ESMA_ILLIQUID_MAX_REL]);
        }

        if (liquidityDefaults && EsmaLiquidationFooterLiquiditySettings.ESMA_LIQUIDATION_DEF in liquidityDefaults) {
            this.illiquidDef = Number(liquidityDefaults[EsmaLiquidationFooterLiquiditySettings.ESMA_LIQUIDATION_DEF]);
        }
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {
            useNotionalAmtLiq: this.useNotionalAmtLiq,
            aggregation: this.aggregation,
            sectorLevelStressTestingFlag: this.sectorLevelStressTestingFlag,
            globalLevelStressTestingFlag: this.globalLevelStressTestingFlag,
            illiquidMaxFormat: this.illiquidMaxFormat,
            absIlliquidMax: this.absIlliquidMax,
            relIlliquidMax: this.relIlliquidMax,
            illiquidDef: this.illiquidDef,
            illiquidEnabledFlag: this.illiquidEnabledFlag,
            holidayLookup: this.holidayLookup
        };
        if (this.globalStressMultiplier) {
            this.globalStressMultiplier.serializeInto(data);
        }
        if (this.assetStressScenario && data.assetStressScenario !== LiquidityConstants.DEFAULT_ASSET_STRESS_SCENARIO) {
            data.assetStressScenario = this.assetStressScenario;
        }
        return data;
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }
        this.useNotionalAmtLiq = !isNil(data.useNotionalAmtLiq) ? data.useNotionalAmtLiq : EsmaLiquidationFooterLiquiditySettings.DEFAULT_USE_NOTIONAL_AMT_LIQ;
        this.aggregation = !isNil(data.aggregation) ? data.aggregation : EsmaLiquidationFooterLiquiditySettings.DEFAULT_NET_AGGREGATION;
        this.sectorLevelStressTestingFlag = data.sectorLevelStressTestingFlag;
        this.globalLevelStressTestingFlag = data.globalLevelStressTestingFlag;
        this.globalStressMultiplier = new GlobalStressMultiplier(data);
        this.illiquidMaxFormat = data.illiquidMaxFormat;
        this.absIlliquidMax = data.absIlliquidMax;
        this.relIlliquidMax = data.relIlliquidMax;
        this.illiquidDef = data.illiquidDef;
        this.illiquidEnabledFlag = data.illiquidEnabledFlag;
        this.holidayLookup = data.holidayLookup ? data.holidayLookup : EsmaLiquidationFooterLiquiditySettings.DEFAULT_HOLIDAY_LOOKUP;
        if (!isNil(data.assetStressScenario)) {
            this.assetStressScenario = data.assetStressScenario;
        }
    }

    /**
     * return true if two object are same otherwise return false
     */
    equals(option: AbstractLiquiditySettings) {
        if (!(option instanceof EsmaLiquidationFooterLiquiditySettings)) {
            return false;
        }

        if (this.useNotionalAmtLiq !== option.useNotionalAmtLiq) {
            return false;
        }
        if (this.aggregation !== option.aggregation) {
            return false;
        }
        if (this.sectorLevelStressTestingFlag !== option.sectorLevelStressTestingFlag) {
            return false;
        }
        if (this.globalLevelStressTestingFlag !== option.globalLevelStressTestingFlag) {
            return false;
        }
        if (!isEqual(this.globalStressMultiplier, option.globalStressMultiplier)) {
            return false;
        }
        if (this.illiquidMaxFormat !== option.illiquidMaxFormat) {
            return false;
        }
        if (this.absIlliquidMax !== option.absIlliquidMax) {
            return false;
        }
        if (this.relIlliquidMax !== option.relIlliquidMax) {
            return false;
        }
        if (this.illiquidDef !== option.illiquidDef) {
            return false;
        }

        if (this.holidayLookup !== option.holidayLookup) {
            return false;
        }
        if (this.assetStressScenario !== option.assetStressScenario) {
            return false;
        }

        return (this.illiquidEnabledFlag === option.illiquidEnabledFlag);
    }

    /**
     * Get params that are to be sent as a part of the request param
     */
    addRequestParams(requestParam: any): void {
        requestParam.useNotionalAmtLiq = this.useNotionalAmtLiq;
        requestParam.aggregation = this.aggregation;
        requestParam.sectorLevelStressFlag = this.sectorLevelStressTestingFlag;
        requestParam.globalLevelStressFlag = this.globalLevelStressTestingFlag;
        // Add global level stress multiplier only if global stress checkbox is selected
        if (this.globalLevelStressTestingFlag && this.globalStressMultiplier) {
            this.globalStressMultiplier.addRequestParams(requestParam);
        }
        requestParam.holidayLookup = this.holidayLookup;
        if (this.assetStressScenario && this.assetStressScenario !== LiquidityConstants.DEFAULT_ASSET_STRESS_SCENARIO) {
            requestParam.assetStressScenario = this.assetStressScenario;
        }

        if (this.illiquidEnabledFlag) {
            requestParam.illiquidMaxFormat = this.illiquidMaxFormat;
            requestParam.illiquidDef = this.illiquidDef;
            if (this.illiquidMaxFormat === LiquidityConstants.MAX_ILLIQUID_TYPE_ABS) {
                requestParam.absIlliquidMax = this.absIlliquidMax;
            } else if (this.illiquidMaxFormat === LiquidityConstants.MAX_ILLIQUID_TYPE_REL) {
                requestParam.relIlliquidMax = this.relIlliquidMax;
            }
        }
    }
}
