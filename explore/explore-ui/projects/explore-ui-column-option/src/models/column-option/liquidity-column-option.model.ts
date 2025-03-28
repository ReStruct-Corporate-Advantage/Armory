import {isEmpty, isNil, some, isObject} from 'lodash';
import {LiquidityConstants} from '../../liquidity/liquidity.constants';
import {AbstractLiquiditySettings} from '../../liquidity/models/abstract-liquidity-settings.model';
import {EsmaLiquidationFooterLiquiditySettings} from '../../liquidity/models/esma-liquidity-settings/esma-liquidation-footer-liquidity-settings.model';
import {EsmaLiquidationFundLiquiditySettings} from '../../liquidity/models/esma-liquidity-settings/esma-liquidation-fund-liquidity-settings.model';
import {EsmaLiquidationHeaderLiquiditySettings} from '../../liquidity/models/esma-liquidity-settings/esma-liquidation-header-liquidity-settings.model';
import {EsmaRedemptionLiquiditySettings} from '../../liquidity/models/esma-liquidity-settings/esma-redemption-liquidity-settings.model';
import {PartialLiquiditySettings} from '../../liquidity/models/partial-liquidity-settings.model';
import {SECLiquiditySettings} from '../../liquidity/models/sec-liquidity-settings.model';
import {GeneralLiquiditySettings} from '../../liquidity/models/general-liquidity-settings.model';
import {StressLiquiditySettings} from '../../liquidity/models/stress-liquidity-settings.model';
import {QuantitativeTieringLiquiditySettings} from '../../liquidity/models/quantitative-tiering-liquidity-settings.model';
import {HorizonLiquiditySettings} from '../../liquidity/models/horizon-liquidity-settings/horizon-liquidity-settings.model';
import {AbstractColumnOption, ColumnTitleModifiable} from '@blk/explore-ui-core';
import {DerivedSettings, isDerivedSetting, ColumnOptionValidatorInterface, ColumnOptionMetaDataInterface} from '@blk/explore-ui-core';
import {ExploreInputValidationInfo, NotificationType, PortfolioDefaults} from '@blk/explore-ui-core';
import {JITALiquiditySettings} from '../../liquidity/models/jita-liquidity-settings.model';
import {AdvancedLiquiditySettings} from '../../liquidity/models/advanced-liquidity-settings.model';
import {PrecannedStressScenariosLiquiditySettings} from '../../liquidity/models/precanned-stress-scenarios-liquidity-settings.model';

/**
 * Model class for liquidity column options
 */
export class LiquidityColumnOption extends AbstractColumnOption implements DerivedSettings<PortfolioDefaults>, ColumnTitleModifiable, ColumnOptionValidatorInterface {
    private static readonly DEFAULT_STANDALONE_UNIT_OPTIONS: string = 'scaleAsFractionOfNotionalValue';
    private static readonly DEFAULT_CONTRIBUTION_UNIT_OPTIONS: string = 'scaleAsFractionOfPortNAV';

    static readonly CONFIG_TYPE = 'liquiditySettings';

    generalLiquiditySettings: GeneralLiquiditySettings;
    stressLiquiditySettings: StressLiquiditySettings;
    partialLiquiditySettings: PartialLiquiditySettings;
    secLiquiditySettings: SECLiquiditySettings;
    unitLiquiditySettings: string;
    quantitativeTieringLiquiditySettings: QuantitativeTieringLiquiditySettings;
    horizonLiquiditySettings: HorizonLiquiditySettings;
    esmaLiquidationHeaderLiquiditySettings: EsmaLiquidationHeaderLiquiditySettings;
    esmaLiquidationFooterLiquiditySettings: EsmaLiquidationFooterLiquiditySettings;
    esmaRedemptionLiquiditySettings: EsmaRedemptionLiquiditySettings;
    esmaLiquidationFundLiquiditySettings: EsmaLiquidationFundLiquiditySettings;
    jitaLiquiditySettings: JITALiquiditySettings;
    advancedLiquiditySettings: AdvancedLiquiditySettings;
    precannedStressScenarioLiquiditySettings: PrecannedStressScenariosLiquiditySettings;

    private readonly PORTFOLIO_DEFAULTS = 'portfolioDefaults';
    /**
     * Constructor
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Return liquidity option attribute as a map
     */
    static options(columnOptionMetadata: ColumnOptionMetaDataInterface): Map<string, boolean> {
        const optionsMap: Map<string, boolean> = new Map<string, boolean>();

        if (isNil(columnOptionMetadata) || isEmpty(columnOptionMetadata.columnOptionAttributes)) {
            return optionsMap;
        }

        columnOptionMetadata.columnOptionAttributes[0].values.forEach(option => {
            optionsMap.set(option.label, option.value);
        });

        return optionsMap;
    }

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return LiquidityColumnOption.CONFIG_TYPE;
    }

    /**
     * Return all the constituents of liquidity settings
     */
    private get allLiquiditySettings(): AbstractLiquiditySettings[] {
        return [
            this.generalLiquiditySettings,
            this.stressLiquiditySettings,
            this.partialLiquiditySettings,
            this.secLiquiditySettings,
            this.quantitativeTieringLiquiditySettings,
            this.horizonLiquiditySettings,
            this.esmaLiquidationHeaderLiquiditySettings,
            this.esmaLiquidationFooterLiquiditySettings,
            this.esmaRedemptionLiquiditySettings,
            this.esmaLiquidationFundLiquiditySettings,
            this.jitaLiquiditySettings,
            this.advancedLiquiditySettings,
            this.precannedStressScenarioLiquiditySettings];
    }

    /**
     * Initialize setting with default Settings
     */
    initialize(defaultSettings: any, definitions: Map<string, any>): void {
        // Initialize liquidity option attribute
        const optionAttributes: Map<string, boolean> = LiquidityColumnOption.options(defaultSettings);

        // initialize generalLiquiditySettings
        this.generalLiquiditySettings = new GeneralLiquiditySettings();
        this.generalLiquiditySettings.initialize(optionAttributes);

        // initialize stressLiquiditySettings
        if (optionAttributes.get(LiquidityConstants.FIXED_COST_SHOCK) || optionAttributes.get(LiquidityConstants.MARKET_DEPTH_SHOCK)
         || optionAttributes.get(LiquidityConstants.STRESS_ANALYSIS_FLAG) || optionAttributes.get(LiquidityConstants.LIQUIDATION_SETTINGS)
            || optionAttributes.get(LiquidityConstants.TCOST_STRESS_FLAG)) {
            this.stressLiquiditySettings = new StressLiquiditySettings();
            this.stressLiquiditySettings.initialize(optionAttributes);
        }

        if (optionAttributes.get(LiquidityConstants.IS_JITA_COLUMN)) {
            this.jitaLiquiditySettings = new JITALiquiditySettings();
            this.jitaLiquiditySettings.initialize(optionAttributes);
        }

        // initialize partialLiquiditySettings
        if (optionAttributes.get(LiquidityConstants.PARTIAL_LIQUIDATION) || optionAttributes.get(LiquidityConstants.LIQUIDATION_SETTINGS)) {
            this.partialLiquiditySettings = new PartialLiquiditySettings();
            this.partialLiquiditySettings.initialize(optionAttributes);
        }

        // initialize secLiquiditySettings
        if (optionAttributes.get(LiquidityConstants.SEC_VARY)) {
            this.secLiquiditySettings = new SECLiquiditySettings();
            this.secLiquiditySettings.initialize(optionAttributes, definitions);
            this.secLiquiditySettings.isSECColumn = true;
        }

        // initialize unitLiquiditySettings
        if (optionAttributes.get(LiquidityConstants.UNIT_CONTRIBUTION)) {
            this.unitLiquiditySettings = LiquidityColumnOption.DEFAULT_CONTRIBUTION_UNIT_OPTIONS;
        }
        if (optionAttributes.get(LiquidityConstants.UNIT_STANDALONE)) {
            this.unitLiquiditySettings = LiquidityColumnOption.DEFAULT_STANDALONE_UNIT_OPTIONS;
        }

        // initialize quantitativeTieringLiquiditySettings
        if (optionAttributes.get(LiquidityConstants.DAYS_TO_UNWIND)) {
            this.quantitativeTieringLiquiditySettings = new QuantitativeTieringLiquiditySettings();
            this.quantitativeTieringLiquiditySettings.initialize(optionAttributes);
        }

        // initialize horizonLiquiditySettings
        if (optionAttributes.get(LiquidityConstants.TIME_HORIZONS)) {
            this.horizonLiquiditySettings = new HorizonLiquiditySettings();
            this.horizonLiquiditySettings.initialize(optionAttributes);
        }

        // initialize esmaLiquiditySettings
        if (optionAttributes.get(LiquidityConstants.LIQUIDATION_SETTINGS)) {
            this.esmaLiquidationHeaderLiquiditySettings = new EsmaLiquidationHeaderLiquiditySettings();
            this.esmaLiquidationHeaderLiquiditySettings.initialize(optionAttributes);
            this.esmaLiquidationFooterLiquiditySettings = new EsmaLiquidationFooterLiquiditySettings();
            this.esmaLiquidationFooterLiquiditySettings.initialize(optionAttributes, definitions);
        }

        // initialize esmaRedemptionLiquiditySettings
        if (optionAttributes.get(LiquidityConstants.REDEMPTION_SETTINGS)) {
            this.esmaRedemptionLiquiditySettings = new EsmaRedemptionLiquiditySettings();
            this.esmaRedemptionLiquiditySettings.initialize(optionAttributes, definitions);
        }

        // initialize esmaLiquidationFundLiquiditySettings
        if (optionAttributes.get(LiquidityConstants.HAS_FUND_SETTINGS)) {
            this.esmaLiquidationFundLiquiditySettings = new EsmaLiquidationFundLiquiditySettings();
            this.esmaLiquidationFundLiquiditySettings.initialize(optionAttributes);
        }

        // initialize advancedLiquiditySettings
        if (optionAttributes.get(LiquidityConstants.MODEL_SELECTION_SETTINGS)) {
            this.advancedLiquiditySettings = new AdvancedLiquiditySettings();
            this.advancedLiquiditySettings.initialize(optionAttributes);
        }

        // initialize precannedStressScenarioLiquiditySettings
        if (optionAttributes.get(LiquidityConstants.PRECANNED_STRESS_SCENARIO_SETTINGS)) {
            this.precannedStressScenarioLiquiditySettings = new PrecannedStressScenariosLiquiditySettings();
            this.precannedStressScenarioLiquiditySettings.initialize(optionAttributes);
        }
    }

    /**
     * Return valid if at least one of it's constituents are populated otherwise return false
     */
    isValid(): boolean {
        return some(this.allLiquiditySettings, liquiditySettings => !isNil(liquiditySettings))
            || !isNil(this.unitLiquiditySettings);
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }

        // deserialize generalLiquiditySettings
        if (data.generalLiquiditySettings) {
            this.generalLiquiditySettings = this.generalLiquiditySettings || new GeneralLiquiditySettings();
            this.generalLiquiditySettings.deserialize(data.generalLiquiditySettings);
        }

        // deserialize stressLiquiditySettings
        if (data.stressLiquiditySettings) {
            this.stressLiquiditySettings = this.stressLiquiditySettings || new StressLiquiditySettings();
            this.stressLiquiditySettings.deserialize(data.stressLiquiditySettings);
        }

        // deserialize partialLiquiditySettings
        if (data.partialLiquiditySettings) {
            this.partialLiquiditySettings = this.partialLiquiditySettings || new PartialLiquiditySettings();
            this.partialLiquiditySettings.deserialize(data.partialLiquiditySettings);
        }

        // deserialize secLiquiditySettings
        if (data.secLiquiditySettings) {
            this.secLiquiditySettings = this.secLiquiditySettings || new SECLiquiditySettings();
            this.secLiquiditySettings.deserialize(data.secLiquiditySettings);
        }

        // deserialize unitLiquiditySettings
        this.unitLiquiditySettings = data.unitLiquiditySettings;

        // deserialize quantitativeTieringLiquiditySettings
        if (data.quantitativeTieringLiquiditySettings) {
            this.quantitativeTieringLiquiditySettings = this.quantitativeTieringLiquiditySettings || new QuantitativeTieringLiquiditySettings();
            this.quantitativeTieringLiquiditySettings.deserialize(data.quantitativeTieringLiquiditySettings);
        }

        // deserialize horizonLiquiditySettings
        if (data.horizonLiquiditySettings) {
            this.horizonLiquiditySettings = this.horizonLiquiditySettings || new HorizonLiquiditySettings();
            this.horizonLiquiditySettings.deserialize(data.horizonLiquiditySettings);
        }
        this._deserializeEsmaLiquiditySettings(data);
        this._deserializeJitaLiquiditySEttings(data);
        this._deserializeAdvancedLiquiditySettings(data);
        this._deserializePrecannedStressScenario(data);
    }

    private _deserializeEsmaLiquiditySettings(data: any): void {
        // deserialize esmaLiquidationFundLiquiditySettings
        if (data.esmaLiquidationFundLiquiditySettings) {
            this.esmaLiquidationFundLiquiditySettings = this.esmaLiquidationFundLiquiditySettings || new EsmaLiquidationFundLiquiditySettings();
            this.esmaLiquidationFundLiquiditySettings.deserialize(data.esmaLiquidationFundLiquiditySettings);
        }
        // deserialize esmaRedemptionLiquiditySettings
        if (data.esmaRedemptionLiquiditySettings) {
            this.esmaRedemptionLiquiditySettings = this.esmaRedemptionLiquiditySettings || new EsmaRedemptionLiquiditySettings();
            this.esmaRedemptionLiquiditySettings.deserialize(data.esmaRedemptionLiquiditySettings);
        }
        // deserialize esmaLiquiditySettings
        if (data.esmaLiquidationHeaderLiquiditySettings) {
            this.esmaLiquidationHeaderLiquiditySettings = this.esmaLiquidationHeaderLiquiditySettings || new EsmaLiquidationHeaderLiquiditySettings();
            this.esmaLiquidationHeaderLiquiditySettings.deserialize(data.esmaLiquidationHeaderLiquiditySettings);
        }
        if (data.esmaLiquidationFooterLiquiditySettings) {
            this.esmaLiquidationFooterLiquiditySettings = this.esmaLiquidationFooterLiquiditySettings || new EsmaLiquidationFooterLiquiditySettings();
            this.esmaLiquidationFooterLiquiditySettings.deserialize(data.esmaLiquidationFooterLiquiditySettings);
        }
    }

    private _deserializeJitaLiquiditySEttings(data: any): void {
        if (data.jitaLiquiditySettings) {
            this.jitaLiquiditySettings = this.jitaLiquiditySettings || new JITALiquiditySettings();
            this.jitaLiquiditySettings.deserialize(data.jitaLiquiditySettings);
        }
    }

    private _deserializeAdvancedLiquiditySettings(data: any): void {
        if (data.advancedLiquiditySettings) {
            this.advancedLiquiditySettings = this.advancedLiquiditySettings || new AdvancedLiquiditySettings();
            this.advancedLiquiditySettings.deserialize(data.advancedLiquiditySettings);
        }
    }

    private _deserializePrecannedStressScenario(data: any): void {
        if (data.precannedStressScenarioLiquiditySettings) {
            this.precannedStressScenarioLiquiditySettings = this.precannedStressScenarioLiquiditySettings || new PrecannedStressScenariosLiquiditySettings();
            this.precannedStressScenarioLiquiditySettings.deserialize(data.precannedStressScenarioLiquiditySettings);
        }
    }

    /**
     * See AbstractColumnOption.doAddRequestParams
     */
    protected doAddRequestParams(requestParams: any) {
        requestParams.liquiditySettings = {};

        if (this.unitLiquiditySettings) {
            requestParams.liquiditySettings.unitLiquiditySettings = this.unitLiquiditySettings;
        }

        this.allLiquiditySettings.forEach(liquiditySettings => {
            if (liquiditySettings) {
                liquiditySettings.addRequestParams(requestParams.liquiditySettings);
            }
        });
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested: boolean | number): any {
        const data: any = {};

        // serialize generalLiquiditySettings
        if (this.generalLiquiditySettings) {
            data.generalLiquiditySettings = this.generalLiquiditySettings.serialize();
        }

        // serialize stressLiquiditySettings
        if (this.stressLiquiditySettings) {
            data.stressLiquiditySettings = this.stressLiquiditySettings.serialize();
        }

        // serialize partialLiquiditySettings
        if (this.partialLiquiditySettings) {
            data.partialLiquiditySettings = this.partialLiquiditySettings.serialize();
        }

        // serialize secLiquiditySettings
        if (this.secLiquiditySettings) {
            data.secLiquiditySettings = this.secLiquiditySettings.serialize();
        }

        // serialize unitLiquiditySettings
        if (this.unitLiquiditySettings) {
            data.unitLiquiditySettings = this.unitLiquiditySettings;
        }

        // serialize quantitativeTieringLiquiditySettings
        if (this.quantitativeTieringLiquiditySettings) {
            data.quantitativeTieringLiquiditySettings = this.quantitativeTieringLiquiditySettings.serialize();
        }

        // serialize horizonLiquiditySettings
        if (this.horizonLiquiditySettings) {
            data.horizonLiquiditySettings = this.horizonLiquiditySettings.serialize();
        }

        // serialize esmaLiquiditySettings
        if (this.esmaLiquidationHeaderLiquiditySettings) {
            data.esmaLiquidationHeaderLiquiditySettings = this.esmaLiquidationHeaderLiquiditySettings.serialize();
        }
        if (this.esmaLiquidationFooterLiquiditySettings) {
            data.esmaLiquidationFooterLiquiditySettings = this.esmaLiquidationFooterLiquiditySettings.serialize();
        }

        // serialize esmaRedemptionLiquiditySettings
        if (this.esmaRedemptionLiquiditySettings) {
            data.esmaRedemptionLiquiditySettings = this.esmaRedemptionLiquiditySettings.serialize();
        }

        // serialize esmaLiquidationFundLiquiditySettings
        if (this.esmaLiquidationFundLiquiditySettings) {
            data.esmaLiquidationFundLiquiditySettings = this.esmaLiquidationFundLiquiditySettings.serialize();
        }

        // serialize jitaLiquiditySettings
        if (this.jitaLiquiditySettings) {
            data.jitaLiquiditySettings = this.jitaLiquiditySettings.serialize();
        }

        // serialize advancedLiquiditySettings
        if (this.advancedLiquiditySettings) {
            data.advancedLiquiditySettings = this.advancedLiquiditySettings.serialize();
        }

        // serialize precannedStressScenarioLiquiditySettings
        if (this.precannedStressScenarioLiquiditySettings) {
            data.precannedStressScenarioLiquiditySettings = this.precannedStressScenarioLiquiditySettings.serialize();
        }

        return data;
    }

    /**
     * return true if object are equal otherwise return false
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof LiquidityColumnOption)) {
            return false;
        }
        if ((!this.generalLiquiditySettings && !otherColOption.generalLiquiditySettings) || !(this.generalLiquiditySettings.equals(otherColOption.generalLiquiditySettings))) {
            return false;
        }
        if ((!this.stressLiquiditySettings && !otherColOption.stressLiquiditySettings) || !(this.stressLiquiditySettings.equals(otherColOption.stressLiquiditySettings))) {
            return false;
        }
        if ((!this.partialLiquiditySettings && !otherColOption.partialLiquiditySettings) || !(this.partialLiquiditySettings.equals(otherColOption.partialLiquiditySettings))) {
            return false;
        }
        if ((!this.secLiquiditySettings && !otherColOption.secLiquiditySettings) || !(this.secLiquiditySettings.equals(otherColOption.secLiquiditySettings))) {
            return false;
        }
        if (this.unitLiquiditySettings !== otherColOption.unitLiquiditySettings) {
            return false;
        }
        if ((!this.quantitativeTieringLiquiditySettings && !otherColOption.quantitativeTieringLiquiditySettings) || !(this.quantitativeTieringLiquiditySettings.equals(otherColOption.quantitativeTieringLiquiditySettings))) {
            return false;
        }
        if ((!this.horizonLiquiditySettings && !otherColOption.horizonLiquiditySettings) || !(this.horizonLiquiditySettings.equals(otherColOption.horizonLiquiditySettings))) {
            return false;
        }
        if ((!this.esmaLiquidationFooterLiquiditySettings && !otherColOption.esmaLiquidationFooterLiquiditySettings) || !(this.esmaLiquidationFooterLiquiditySettings.equals(otherColOption.esmaLiquidationFooterLiquiditySettings))) {
            return false;
        }
        if ((!this.esmaLiquidationHeaderLiquiditySettings && !otherColOption.esmaLiquidationHeaderLiquiditySettings) || !(this.esmaLiquidationHeaderLiquiditySettings.equals(otherColOption.esmaLiquidationHeaderLiquiditySettings))) {
            return false;
        }
        if ((!this.esmaLiquidationFundLiquiditySettings && !otherColOption.esmaLiquidationFundLiquiditySettings) || !(this.esmaLiquidationFundLiquiditySettings.equals(otherColOption.esmaLiquidationFundLiquiditySettings))) {
            return false;
        }
        if ((!this.jitaLiquiditySettings && !otherColOption.jitaLiquiditySettings) || !(this.jitaLiquiditySettings.equals(otherColOption.jitaLiquiditySettings))) {
            return false;
        }
        if ((!this.advancedLiquiditySettings && !otherColOption.advancedLiquiditySettings) || !(this.advancedLiquiditySettings.equals(otherColOption.advancedLiquiditySettings))) {
            return false;
        }
        if ((!this.precannedStressScenarioLiquiditySettings && !otherColOption.precannedStressScenarioLiquiditySettings) || !(this.precannedStressScenarioLiquiditySettings.equals(otherColOption.precannedStressScenarioLiquiditySettings))) {
            return false;
        }
        return (!this.esmaRedemptionLiquiditySettings && !otherColOption.esmaRedemptionLiquiditySettings) || (this.esmaRedemptionLiquiditySettings.equals(otherColOption.esmaRedemptionLiquiditySettings));
    }

    /**
     * return modifiable column title
     */
    getModifiedColumnTitle(title: string): any {
        const titleSuffix: string = this.quantitativeTieringLiquiditySettings
            ? this.quantitativeTieringLiquiditySettings.getTitleSuffix()
            : undefined;

        return titleSuffix ? title + '(' + titleSuffix + ')' : title;
    }

    /**
     * key to check for liquidity settings inside widget defaults.
     */
    getParentWidgetSettingKey(): string {
        return this.PORTFOLIO_DEFAULTS;
    }

    /**
     * key to check for liquidity settings inside portfolio defaults.
     */
    getParentPortfolioSettingKey (): string {
        return this.PORTFOLIO_DEFAULTS;
    }

    /**
     * update LiquidityColumnOptions with portfolio defaults.
     */
    updateDerivedSettings(portfolioDefaults: PortfolioDefaults) {
        if (portfolioDefaults) {
            this.allLiquiditySettings.filter(settings => settings && isDerivedSetting(settings))
                .forEach(settings => {
                    const liquidityDefaults = portfolioDefaults[settings.getParentPortfolioSettingKey()];
                    settings.updateDerivedSettings(liquidityDefaults);
                });
        }
    }

    isValidColumnOption(): ExploreInputValidationInfo | undefined {
        if (this.esmaLiquidationHeaderLiquiditySettings && this.partialLiquiditySettings
            && (this.esmaLiquidationHeaderLiquiditySettings.capacityApproach === LiquidityConstants.CAPACITY_APPROACH_LIQUID_FIRST
                && this.partialLiquiditySettings.liquidationStrategy === LiquidityConstants.ESMA_MODIFIED_LIQUIDATION_STRATEGY_WATERFALL)) {
            return new ExploreInputValidationInfo(NotificationType.ERROR, 'Liquid First as a capacity approach and Modified Waterfall as a liquidation strategy cannot currently be used together');
        }
        return undefined;
    }
}
