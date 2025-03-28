import {LiquidityColumnOptionComponent} from './liquidity-column-option.component';
import {LiquidityColumnOption} from '../../../models/column-option/liquidity-column-option.model';
import {ColumnOptionTestBed} from '../../../test-utils';
import {AdvancedLiquiditySettings} from '../../../liquidity/models/advanced-liquidity-settings.model';
import {CoreDefinitionStore, TokenConstants} from '@blk/explore-ui-core';

describe('LiquidityColumnOptionComponent test', () => {
    let testBed: ColumnOptionTestBed<LiquidityColumnOptionComponent, LiquidityColumnOption>;

    beforeEach(() => {
        const defaultSettings = {
            columnOptionAttributes: [{
                values: [{label: 'HORIZON', value: true}, {label: 'FIXED_COST_SHOCK', value: true},
                    {label: 'SEC_VARY', value: false}, {label: 'DAYS_TO_UNWIND', value: true}, {label: 'HOLIDAY_LOOKUP', value: true},
                    {label: 'TCOST_STRESS_FLAG', value: true}, {label: 'IS_JITA_COLUMN', value: true},
                    {label: 'MODEL_SELECTION_SETTINGS', value: true}]
            }]
        };

        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ENABLE_MODEL_SELECTION] = 'Y';

        const liquidityColumnOption: LiquidityColumnOption = new LiquidityColumnOption();
        liquidityColumnOption.initialize(defaultSettings, new Map<string, any>());

        testBed = new ColumnOptionTestBed<LiquidityColumnOptionComponent, LiquidityColumnOption>(LiquidityColumnOptionComponent, liquidityColumnOption, defaultSettings);
    });

    it('Test initialization', () => {
        expect(testBed.component.isShowGeneralLiquiditySettings).toBeTruthy();
        expect(testBed.component.isShowStressLiquiditySettings).toBeTruthy();
        expect(testBed.component.isShowPartialLiquiditySettings).toBeFalsy();
        expect(testBed.component.isShowQuantitativeTieringLiquiditySettings).toBeTruthy();
        expect(testBed.component.isShowSecLiquiditySettings).toBeFalsy();
        expect(testBed.component.isShowFundSettings).toBeFalsy();
        expect(testBed.component.isHolidayLookup).toBeTruthy();
        expect(testBed.component.isJITAColumn).toBeTruthy();
        expect(testBed.component.isShowStressLiquiditySettings).toBeTruthy();
        expect(testBed.component.optionValue.esmaLiquidationFundLiquiditySettings).toBeUndefined();
        expect(testBed.component.isShowAdvancedSettings).toBeTruthy();
    });

    it('Test onPortfolioSideTabChanged', () => {
        const event = {detail: {eventData: 'portfolioLiabilities'}};
        testBed.component.onPortfolioSideChanged(event as CustomEvent);
        expect(testBed.component.isPortfolioSideAssets).toBeFalsy();
        expect(testBed.component.isPortfolioSideLiabilities).toBeTruthy();

        event.detail.eventData = 'portfolioAssets';
        testBed.component.onPortfolioSideChanged(event as CustomEvent);
        expect(testBed.component.isPortfolioSideAssets).toBeTruthy();
        expect(testBed.component.isPortfolioSideLiabilities).toBeFalsy();
    });

    it('Test updateAdvancedLiquiditySettings', () => {
        const event: AdvancedLiquiditySettings = new AdvancedLiquiditySettings();

        testBed.component.updateAdvancedLiquiditySettings(event);
        expect(testBed.component.optionValue.advancedLiquiditySettings).toBeDefined();
    });

    it('Test openAdvancedLiquiditySettingsModal', () => {
        expect(testBed.component.isAdvancedLiquiditySettingsModalOpen).toBeFalsy();
        testBed.component.openAdvancedLiquiditySettingsModal();
        expect(testBed.component.isAdvancedLiquiditySettingsModalOpen).toBeTruthy();
    });

    it('Test closeAdvancedLiquiditySettingsModal', () => {
        expect(testBed.component.isAdvancedLiquiditySettingsModalOpen).toBeFalsy();
        testBed.component.closeAdvancedLiquiditySettingsModal();
        expect(testBed.component.isAdvancedLiquiditySettingsModalOpen).toBeFalsy();
    });

    it('Test assetClassModelMapping initialization', () => {
       expect(testBed.component.assetClassModelMapping.length).toEqual(0);
    });
});
