import {AbstractLiquiditySettings} from '../abstract-liquidity-settings.model';
import {EsmaLiquidationFundLiquiditySettings} from './esma-liquidation-fund-liquidity-settings.model';

describe('EsmaLiquidationFundLiquiditySettings test', () => {
    let esmaLiquidationFundLiquiditySettings: EsmaLiquidationFundLiquiditySettings;

    beforeEach(() => {
        esmaLiquidationFundLiquiditySettings = new EsmaLiquidationFundLiquiditySettings();
        esmaLiquidationFundLiquiditySettings.initialize(new Map<string, boolean>());
    });

    it('Test model initialization', () => {
        expect(esmaLiquidationFundLiquiditySettings).toBeDefined();
        expect(esmaLiquidationFundLiquiditySettings.includeFundNoticePeriodFlag).toBeUndefined();
        expect(esmaLiquidationFundLiquiditySettings.includeFundSettlementPeriodFlag).toBeUndefined();
    });

    it('Test deserialize', () => {
        const data: any = {
            includeFundNoticePeriodFlag: true,
            includeFundSettlementPeriodFlag: false
        };
        esmaLiquidationFundLiquiditySettings.deserialize(data);

        expect(esmaLiquidationFundLiquiditySettings.includeFundNoticePeriodFlag).toBe(true);
        expect(esmaLiquidationFundLiquiditySettings.includeFundSettlementPeriodFlag).toBe(false);
    });

    it('Test addRequestParams', function () {
        let requestParam: any = {};
        esmaLiquidationFundLiquiditySettings.includeFundSettlementPeriodFlag = true;
        esmaLiquidationFundLiquiditySettings.includeFundNoticePeriodFlag = false;
        esmaLiquidationFundLiquiditySettings.addRequestParams(requestParam);

        expect(requestParam).toBeDefined();
        expect(requestParam.includeFundNoticePeriodFlag).toBe(false);
        expect(requestParam.includeFundSettlementPeriodFlag).toBe(true);
        expect(requestParam.includeSettlementPeriodFlag).toBe(true);
    });

    it('Test serialize', function () {
        let data = esmaLiquidationFundLiquiditySettings.serialize();

        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.includeFundNoticePeriodFlag).toBeUndefined();
        expect(data.includeFundSettlementPeriodFlag).toBeUndefined();
    });

    describe('Test equals', () => {
        it('If not instance of EsmaLiquidationFundLiquiditySettings', () => {
            const object = {} as AbstractLiquiditySettings;
            expect(esmaLiquidationFundLiquiditySettings.equals(object)).toBeFalsy();
        });

        it('For different scenario', () => {
            const esmaLiquidationFundLiquiditySettingsOther: EsmaLiquidationFundLiquiditySettings = new EsmaLiquidationFundLiquiditySettings();
            esmaLiquidationFundLiquiditySettingsOther.initialize(new Map<string, boolean>());

            expect(esmaLiquidationFundLiquiditySettings.equals(esmaLiquidationFundLiquiditySettingsOther)).toBeTruthy();
            esmaLiquidationFundLiquiditySettingsOther.includeFundSettlementPeriodFlag = true;
            expect(esmaLiquidationFundLiquiditySettings.equals(esmaLiquidationFundLiquiditySettingsOther)).toBeFalsy();

            esmaLiquidationFundLiquiditySettingsOther.includeFundSettlementPeriodFlag = true;
            esmaLiquidationFundLiquiditySettings.includeFundSettlementPeriodFlag = true;
            expect(esmaLiquidationFundLiquiditySettings.equals(esmaLiquidationFundLiquiditySettingsOther)).toBeTruthy();
        });
    });
});
