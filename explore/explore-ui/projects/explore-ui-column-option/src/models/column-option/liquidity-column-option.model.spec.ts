import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {EsmaLiquidationFooterLiquiditySettings} from '../../liquidity/models/esma-liquidity-settings/esma-liquidation-footer-liquidity-settings.model';
import {EsmaLiquidationFundLiquiditySettings} from '../../liquidity/models/esma-liquidity-settings/esma-liquidation-fund-liquidity-settings.model';
import {EsmaLiquidationHeaderLiquiditySettings} from '../../liquidity/models/esma-liquidity-settings/esma-liquidation-header-liquidity-settings.model';
import {EsmaRedemptionLiquiditySettings} from '../../liquidity/models/esma-liquidity-settings/esma-redemption-liquidity-settings.model';
import {GeneralLiquiditySettings} from '../../liquidity/models/general-liquidity-settings.model';
import {HorizonLiquiditySettings} from '../../liquidity/models/horizon-liquidity-settings/horizon-liquidity-settings.model';
import {PartialLiquiditySettings} from '../../liquidity/models/partial-liquidity-settings.model';
import {QuantitativeTieringLiquiditySettings} from '../../liquidity/models/quantitative-tiering-liquidity-settings.model';
import {SECLiquiditySettings} from '../../liquidity/models/sec-liquidity-settings.model';
import {StressLiquiditySettings} from '../../liquidity/models/stress-liquidity-settings.model';
import {LiquidityColumnOption} from './liquidity-column-option.model';
import {JITALiquiditySettings} from '../../liquidity/models/jita-liquidity-settings.model';
import {AdvancedLiquiditySettings} from '../../liquidity/models/advanced-liquidity-settings.model';
import {
    PrecannedStressScenariosLiquiditySettings
} from '../../liquidity/models/precanned-stress-scenarios-liquidity-settings.model';

describe('LiquidityColumnOption test', () => {
    let liquidityColumnOption: LiquidityColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(LiquidityColumnOption.CONFIG_TYPE, LiquidityColumnOption);
    });

    beforeEach(() => {
        liquidityColumnOption = new LiquidityColumnOption();

        const defaultSettings: Map<string, boolean> = new Map<string, boolean>();
        const definitions: Map<string, any> = new Map<string, any>();

        liquidityColumnOption.generalLiquiditySettings = new GeneralLiquiditySettings();
        liquidityColumnOption.generalLiquiditySettings.initialize(defaultSettings);

        liquidityColumnOption.stressLiquiditySettings = new StressLiquiditySettings();
        liquidityColumnOption.stressLiquiditySettings.initialize(defaultSettings);

        liquidityColumnOption.secLiquiditySettings = new SECLiquiditySettings();
        liquidityColumnOption.secLiquiditySettings.initialize(defaultSettings, definitions);

        liquidityColumnOption.quantitativeTieringLiquiditySettings = new QuantitativeTieringLiquiditySettings();
        liquidityColumnOption.quantitativeTieringLiquiditySettings.initialize(defaultSettings);

        liquidityColumnOption.unitLiquiditySettings = 'scaleAsFractionOfNotionalValue';

        liquidityColumnOption.partialLiquiditySettings = new PartialLiquiditySettings();
        liquidityColumnOption.partialLiquiditySettings.initialize(defaultSettings);

        liquidityColumnOption.horizonLiquiditySettings = new HorizonLiquiditySettings();
        liquidityColumnOption.horizonLiquiditySettings.initialize(defaultSettings);

        liquidityColumnOption.esmaLiquidationHeaderLiquiditySettings = new EsmaLiquidationHeaderLiquiditySettings();
        liquidityColumnOption.esmaLiquidationHeaderLiquiditySettings.initialize(defaultSettings);

        liquidityColumnOption.esmaLiquidationFooterLiquiditySettings = new EsmaLiquidationFooterLiquiditySettings();
        liquidityColumnOption.esmaLiquidationFooterLiquiditySettings.initialize(defaultSettings, definitions);

        liquidityColumnOption.esmaRedemptionLiquiditySettings = new EsmaRedemptionLiquiditySettings();
        liquidityColumnOption.esmaRedemptionLiquiditySettings.initialize(defaultSettings, definitions);

        liquidityColumnOption.esmaLiquidationFundLiquiditySettings = new EsmaLiquidationFundLiquiditySettings();
        liquidityColumnOption.esmaLiquidationFundLiquiditySettings.initialize(defaultSettings);

        liquidityColumnOption.jitaLiquiditySettings = new JITALiquiditySettings();
        liquidityColumnOption.jitaLiquiditySettings.initialize(defaultSettings);

        liquidityColumnOption.advancedLiquiditySettings = new AdvancedLiquiditySettings();
        liquidityColumnOption.advancedLiquiditySettings.initialize(defaultSettings);

        liquidityColumnOption.precannedStressScenarioLiquiditySettings = new PrecannedStressScenariosLiquiditySettings();
    });

    it('Test model initialization', () => {
        expect(liquidityColumnOption).toBeDefined();
        expect(liquidityColumnOption).not.toBeNull();
    });

    it('Test initialize', () => {
        const defaultSettings = {
            columnOptionAttributes: [{
                values: [{label: 'SEC_VARY', value: true}, {label: 'UNIT_CONTRIBUTION', value: true},
                    {label: 'LIQUIDATION_SETTINGS', value: true}, {
                        label: 'REDEMPTION_SETTINGS',
                        value: true
                    }, {label: 'TIME_HORIZONS', value: true},
                    {label: 'HAS_FUND_SETTINGS', value: true},
                    {label: 'IS_JITA_COLUMN', value: true}]
            }]
        };
        liquidityColumnOption.initialize(defaultSettings, new Map<string, any>());

        expect(liquidityColumnOption.generalLiquiditySettings).toBeDefined();
        expect(liquidityColumnOption.stressLiquiditySettings).toBeDefined();
        expect(liquidityColumnOption.partialLiquiditySettings).toBeDefined();
        expect(liquidityColumnOption.secLiquiditySettings).toBeDefined();
        expect(liquidityColumnOption.secLiquiditySettings.isSECColumn).toBeTruthy();
        expect(liquidityColumnOption.quantitativeTieringLiquiditySettings).toBeDefined();
        expect(liquidityColumnOption.esmaLiquidationHeaderLiquiditySettings).toBeDefined();
        expect(liquidityColumnOption.esmaLiquidationFooterLiquiditySettings).toBeDefined();
        expect(liquidityColumnOption.esmaRedemptionLiquiditySettings).toBeDefined();
        expect(liquidityColumnOption.horizonLiquiditySettings).toBeDefined();
        expect(liquidityColumnOption.unitLiquiditySettings).toBe('scaleAsFractionOfPortNAV');
        expect(liquidityColumnOption.esmaLiquidationFundLiquiditySettings).toBeDefined();
        expect(liquidityColumnOption.jitaLiquiditySettings).toBeDefined();
    });

    it('Test deserialize', function () {
        const data: any = {
            generalLiquiditySettings: {horizon: 0, advParticipationRate: 1},
            stressLiquiditySettings: {fixedCostMultiplier: 8},
            partialLiquiditySettings: {partialLiquidation: 5},
            secLiquiditySettings: {rats: 8},
            quantitativeTieringLiquiditySettings: {},
            unitLiquiditySettings: 'scaleAsFractionOfNotionalValue',
            horizonLiquiditySettings: {},
            esmaLiquidationHeaderLiquiditySettings: {},
            esmaLiquidationFooterLiquiditySettings: {},
            esmaRedemptionLiquiditySettings: {},
            esmaLiquidationFundLiquiditySettings: {},
            jitaLiquiditySettings: {}
        };
        const model: LiquidityColumnOption = new LiquidityColumnOption(data);
        expect(model).toBeDefined();
        expect(model.generalLiquiditySettings.horizon).toBe(0);
        expect(model.stressLiquiditySettings.fixedCostMultiplier).toBe(8);
        expect(model.unitLiquiditySettings).toBe('scaleAsFractionOfNotionalValue');
        expect(model.esmaLiquidationFundLiquiditySettings).toBeDefined();
        expect(model.jitaLiquiditySettings).toBeDefined();
    });

    it('Test addRequestParams', function () {
        const requestParam: any = {};
        liquidityColumnOption.addRequestParams(requestParam);
        expect(requestParam.liquiditySettings).toBeDefined();
        expect(requestParam.liquiditySettings.horizon).toBe(1);
        expect(requestParam.liquiditySettings.stressAnalysisFlag).toBeFalsy();
    });

    it('Test serialize', () => {
        const data = liquidityColumnOption.serialize();
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.configType).toBe(LiquidityColumnOption.CONFIG_TYPE);
        expect(data.generalLiquiditySettings.advParticipationRate).toBe(25);
        expect(data.unitLiquiditySettings).toBe('scaleAsFractionOfNotionalValue');
    });

    it('Test isValid', () => {
        expect(liquidityColumnOption.isValid()).toBeTruthy();

        const liquidityColumnOptionOther = new LiquidityColumnOption();
        expect(liquidityColumnOptionOther.isValid()).toBeFalsy();
    });

    it('Test getModifiedColumnTitle', () => {
        liquidityColumnOption.quantitativeTieringLiquiditySettings = new QuantitativeTieringLiquiditySettings();
        expect(liquidityColumnOption.getModifiedColumnTitle('ABC')).toEqual('ABC');

        liquidityColumnOption.quantitativeTieringLiquiditySettings.minDays = 0;
        expect(liquidityColumnOption.getModifiedColumnTitle('ABC')).toEqual('ABC(0+ days)');

        liquidityColumnOption.quantitativeTieringLiquiditySettings.maxDays = 1;
        expect(liquidityColumnOption.getModifiedColumnTitle('ABC')).toEqual('ABC(0-1 days)');

        liquidityColumnOption.quantitativeTieringLiquiditySettings.minDays = null;
        expect(liquidityColumnOption.getModifiedColumnTitle('ABC')).toEqual('ABC(1- days)');
    });

    describe('Test equals', () => {
        it('If not instance of LiquidityColumnOptions', () => {
            const object = {} as AbstractColumnOption;
            expect(liquidityColumnOption.equals(object)).toBeFalsy();
        });

        it('For different scenario', () => {
            const liquidityColumnOptionOther: LiquidityColumnOption = new LiquidityColumnOption();
            const defaultSettings: Map<string, boolean> = new Map<string, boolean>();
            const definitions: Map<string, any> = new Map<string, any>();

            liquidityColumnOptionOther.generalLiquiditySettings = new GeneralLiquiditySettings();
            liquidityColumnOptionOther.generalLiquiditySettings.initialize(defaultSettings);

            liquidityColumnOptionOther.stressLiquiditySettings = new StressLiquiditySettings();
            liquidityColumnOptionOther.stressLiquiditySettings.initialize(defaultSettings);

            liquidityColumnOptionOther.secLiquiditySettings = new SECLiquiditySettings();
            liquidityColumnOptionOther.secLiquiditySettings.initialize(defaultSettings, definitions);

            liquidityColumnOptionOther.quantitativeTieringLiquiditySettings = new QuantitativeTieringLiquiditySettings();
            liquidityColumnOptionOther.quantitativeTieringLiquiditySettings.initialize(defaultSettings);

            liquidityColumnOptionOther.unitLiquiditySettings = 'scaleAsFractionOfNotionalValue';

            liquidityColumnOptionOther.partialLiquiditySettings = new PartialLiquiditySettings();
            liquidityColumnOptionOther.partialLiquiditySettings.initialize(defaultSettings);

            liquidityColumnOptionOther.horizonLiquiditySettings = new HorizonLiquiditySettings();
            liquidityColumnOptionOther.horizonLiquiditySettings.initialize(defaultSettings);

            liquidityColumnOptionOther.esmaLiquidationHeaderLiquiditySettings = new EsmaLiquidationHeaderLiquiditySettings();
            liquidityColumnOptionOther.esmaLiquidationHeaderLiquiditySettings.initialize(defaultSettings);

            liquidityColumnOptionOther.esmaLiquidationFooterLiquiditySettings = new EsmaLiquidationFooterLiquiditySettings();
            liquidityColumnOptionOther.esmaLiquidationFooterLiquiditySettings.initialize(defaultSettings, definitions);

            liquidityColumnOptionOther.esmaRedemptionLiquiditySettings = new EsmaRedemptionLiquiditySettings();
            liquidityColumnOptionOther.esmaRedemptionLiquiditySettings.initialize(defaultSettings, definitions);

            liquidityColumnOptionOther.esmaLiquidationFundLiquiditySettings = new EsmaLiquidationFundLiquiditySettings();
            liquidityColumnOptionOther.esmaLiquidationFundLiquiditySettings.initialize(defaultSettings);

            liquidityColumnOptionOther.jitaLiquiditySettings = new JITALiquiditySettings();
            liquidityColumnOptionOther.jitaLiquiditySettings.initialize(defaultSettings);

            liquidityColumnOptionOther.advancedLiquiditySettings = new AdvancedLiquiditySettings();
            liquidityColumnOptionOther.advancedLiquiditySettings.initialize(defaultSettings);

            liquidityColumnOptionOther.precannedStressScenarioLiquiditySettings = new PrecannedStressScenariosLiquiditySettings();

            expect(liquidityColumnOption.equals(liquidityColumnOptionOther)).toBeTruthy();

            liquidityColumnOptionOther.partialLiquiditySettings.maxTransactionCost = 10;
            liquidityColumnOptionOther.secLiquiditySettings.isSECColumn = false;
            expect(liquidityColumnOption.equals(liquidityColumnOptionOther)).toBeFalsy();
        });
    });
});
