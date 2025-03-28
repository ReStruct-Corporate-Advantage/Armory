import {AbstractLiquiditySettings} from './abstract-liquidity-settings.model';
import {isEmpty, isEqual, isNil} from 'lodash';
import {JITATierInfo} from './jita-tier-info.model';
import {LiquidityConstants} from '../liquidity.constants';
import {SerializeFavoriteType} from '@blk/explore-ui-core';
import {GlobalStressMultiplier} from './global-stress-multiplier';

/**
 * JITA liquidity Setting model as a part of liquidity Setting model
 */
export class JITALiquiditySettings extends AbstractLiquiditySettings {

    private static readonly DEFAULT_NAV_MULTIPLIER: number = 1;
    private static readonly DEFAULT_PERCENT_NAV_LIQUIDATED: number = 100;
    private static readonly DEFAULT_LIQUIDATION_CONSTRAINT: string = LiquidityConstants.LIQUIDATION_CONSTRAINT_PERCENT_NAV;
    private static readonly DEFAULT_NET_AGGREGATION: string = LiquidityConstants.AGGREGATION_NET;
    private static readonly DEFAULT_LIQUIDATION_BUCKET_METH: string = LiquidityConstants.LIQUIDATION_BUCKET_EQUAL_DOLLAR;

    navMultiplier: number;
    liquidationStrategy: string;
    liquidationConstraint: string;
    percentNavLiquidated: number;
    aggregation: string;
    liquidationBucketMeth: string;
    useNotionalAmtLiq: boolean;
    sectorLevelStressTestingFlag: boolean;
    globalLevelStressTestingFlag: boolean;
    illiquidEnabledFlag: boolean;
    illiquidMaxFormat: string;
    absIlliquidMax: number;
    relIlliquidMax: number;
    illiquidDef: number;
    assetStressScenario: string;
    globalStressMultiplier: GlobalStressMultiplier;

    tierInfos: JITATierInfo[];

    /**
     * Initialises the liquidity settings with the default settings.
     */
    initialize(defaultSettings: Map<string, boolean>): void {
        super.initialize(defaultSettings);
        this.navMultiplier = JITALiquiditySettings.DEFAULT_NAV_MULTIPLIER;
        this.liquidationStrategy = LiquidityConstants.ESMA_NON_MODIFIED_LIQUIDATION_STRATEGY_WATERFALL;
        this.liquidationConstraint = JITALiquiditySettings.DEFAULT_LIQUIDATION_CONSTRAINT;
        this.percentNavLiquidated = JITALiquiditySettings.DEFAULT_PERCENT_NAV_LIQUIDATED;
        this.aggregation = JITALiquiditySettings.DEFAULT_NET_AGGREGATION;
        this.liquidationBucketMeth = JITALiquiditySettings.DEFAULT_LIQUIDATION_BUCKET_METH;
        this.globalStressMultiplier = new GlobalStressMultiplier();
        this.tierInfos = defaultSettings.get(LiquidityConstants.HAS_JITA_TIER_INFOS) ? [new JITATierInfo(1), new JITATierInfo(2), new JITATierInfo(3), new JITATierInfo(4)] : [];
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {
            navMultiplier: this.navMultiplier,
            liquidationStrategy: this.liquidationStrategy,
            liquidationConstraint: this.liquidationConstraint,
            percentNavLiquidated: this.percentNavLiquidated,
            aggregation: this.aggregation,
            liquidationBucketMeth: this.liquidationBucketMeth,
            useNotionalAmtLiq: this.useNotionalAmtLiq,
            sectorLevelStressTestingFlag: this.sectorLevelStressTestingFlag,
            globalLevelStressTestingFlag: this.globalLevelStressTestingFlag,
            illiquidEnabledFlag: this.illiquidEnabledFlag,
            illiquidMaxFormat: this.illiquidMaxFormat,
            absIlliquidMax: this.absIlliquidMax,
            relIlliquidMax: this.relIlliquidMax,
            illiquidDef: this.illiquidDef,
            tierInfos: this.tierInfos ? this.tierInfos.map(tierInfo => tierInfo.serialize()) : undefined
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
     * Deserialize the data into this object
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }
        this.navMultiplier = !isNil(data.navMultiplier) ? data.navMultiplier : JITALiquiditySettings.DEFAULT_NAV_MULTIPLIER;
        this.liquidationStrategy = !isNil(data.liquidationStrategy) ? data.liquidationStrategy : LiquidityConstants.ESMA_NON_MODIFIED_LIQUIDATION_STRATEGY_WATERFALL;
        this.liquidationConstraint = !isNil(data.liquidationConstraint) ? data.liquidationConstraint : JITALiquiditySettings.DEFAULT_LIQUIDATION_CONSTRAINT;
        this.percentNavLiquidated = !isNil(data.percentNavLiquidated) ? data.percentNavLiquidated : JITALiquiditySettings.DEFAULT_PERCENT_NAV_LIQUIDATED;
        this.aggregation = !isNil(data.aggregation) ? data.aggregation : JITALiquiditySettings.DEFAULT_NET_AGGREGATION;
        this.liquidationBucketMeth = !isNil(data.liquidationBucketMeth) ? data.liquidationBucketMeth : JITALiquiditySettings.DEFAULT_LIQUIDATION_BUCKET_METH;
        this.useNotionalAmtLiq = !isNil(data.useNotionalAmtLiq) ? data.useNotionalAmtLiq : undefined;
        this.sectorLevelStressTestingFlag = data.sectorLevelStressTestingFlag;
        this.globalLevelStressTestingFlag = data.globalLevelStressTestingFlag;
        this.illiquidEnabledFlag = data.illiquidEnabledFlag;
        this.illiquidMaxFormat = data.illiquidMaxFormat;
        this.absIlliquidMax = data.absIlliquidMax;
        this.relIlliquidMax = data.relIlliquidMax;
        this.illiquidDef = data.illiquidDef;
        this.globalStressMultiplier = new GlobalStressMultiplier(data);
        if (data.assetStressScenario) {
            this.assetStressScenario = data.assetStressScenario;
        }
        if (data.tierInfos) {
            this.tierInfos = data.tierInfos.map(d => {
                const jitaTierInfo: JITATierInfo = new JITATierInfo();
                jitaTierInfo.deserialize(d);
                return jitaTierInfo;
            });
        }
    }

    /**
     * Return true if two object are same otherwise return false
     */
    equals(option: AbstractLiquiditySettings) {
        if (!(option instanceof JITALiquiditySettings)) {
            return false;
        }
        if (this.navMultiplier !== option.navMultiplier) {
            return false;
        }
        if (this.liquidationStrategy !== option.liquidationStrategy) {
            return false;
        }
        if (this.liquidationConstraint !== option.liquidationConstraint) {
            return false;
        }
        if (this.percentNavLiquidated !== option.percentNavLiquidated) {
            return false;
        }
        if (this.aggregation !== option.aggregation) {
            return false;
        }
        if (this.liquidationBucketMeth !== option.liquidationBucketMeth) {
            return false;
        }
        if (this.useNotionalAmtLiq !== option.useNotionalAmtLiq) {
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
        if (!isEqual(this.tierInfos, option.tierInfos)) {
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
        if (this.assetStressScenario !== option.assetStressScenario) {
            return false;
        }
        return (this.illiquidEnabledFlag === option.illiquidEnabledFlag);
    }

    /**
     * Get params that are to be sent as a part of the request param
     */
    addRequestParams(requestParam: any): void {
        requestParam.navMultiplier = this.navMultiplier;
        requestParam.liquidationStrategy = this.liquidationStrategy;
        requestParam.liquidationConstraint = this.liquidationConstraint;
        requestParam.percentNAVLiquidated = this.percentNavLiquidated / 100;
        requestParam.aggregation = this.aggregation;
        requestParam.liquidationBucketMeth = this.liquidationBucketMeth;
        requestParam.useNotionalAmtLiq = this.useNotionalAmtLiq;
        requestParam.sectorLevelStressFlag = this.sectorLevelStressTestingFlag;
        requestParam.globalLevelStressFlag = this.globalLevelStressTestingFlag;
        if (this.globalLevelStressTestingFlag && this.globalStressMultiplier) {
            this.globalStressMultiplier.addRequestParams(requestParam);
        }
        if (this.assetStressScenario && this.assetStressScenario !== LiquidityConstants.DEFAULT_ASSET_STRESS_SCENARIO) {
            requestParam.assetStressScenario = this.assetStressScenario;
        }
        if (!isEmpty(this.tierInfos)) {
            requestParam.tierInfos = [];
            this.tierInfos.forEach(info => {
                const params: any = {};
                info.addRequestParams(params);
                requestParam.tierInfos.push(params);
            });
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
