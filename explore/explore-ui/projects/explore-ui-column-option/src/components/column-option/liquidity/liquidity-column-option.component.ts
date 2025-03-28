import {Component} from '@angular/core';
import {isNil} from 'lodash';
import {Subject} from 'rxjs';
import {LiquidityColumnOption} from '../../../models/column-option/liquidity-column-option.model';
import {AuxTabBarItemInterface, AuxTabBarSelectedDetailInterface} from '@blk/aladdin-angular-components';
import {LiquidityConstants} from '../../../liquidity/liquidity.constants';
import {BaseColumnTitleModifiableColumnOptionComponent} from '../base-column-title-modifiable-column-option.component';
import {AdvancedLiquiditySettings} from '../../../liquidity/models/advanced-liquidity-settings.model';
import {CoreDefinitionStore, TokenUtils, TokenConstants} from '@blk/explore-ui-core';

/**
 * Base liquidity setting component in column options for liquidity columns
 */
@Component({
    selector: 'explore-liquidity-column-option',
    templateUrl: './liquidity-column-option.component.html',
    styleUrls: ['./liquidity-column-option.component.scss']
})
export class LiquidityColumnOptionComponent extends BaseColumnTitleModifiableColumnOptionComponent<LiquidityColumnOption> {
    static readonly OPTION_KEY = LiquidityColumnOption.CONFIG_TYPE;

    originalTitle: string;
    optionAttributes: Map<string, boolean>;

    isShowPortfolioSide: boolean;
    isPortfolioSideAssets: boolean;
    isPortfolioSideLiabilities: boolean;
    portfolioSideOptions: { label: string, eventData: string }[];

    isShowGeneralLiquiditySettings: boolean;

    isShowStressLiquiditySettings: boolean;

    isShowPartialLiquiditySettings: boolean;

    isShowSecLiquiditySettings: boolean;

    isShowUnitLiquiditySettings: boolean;

    isShowQuantitativeTieringLiquiditySettings: boolean;

    isShowHorizonSettings: boolean;

    isShowEsmaLiquidationSettings: boolean;

    isShowEsmaRedemptionSettings: boolean;

    isShowFundSettings: boolean;

    isHolidayLookup: boolean;

    isJITAColumn: boolean;

    isShowAdvancedSettings: boolean;

    isShowPrecannedStressScenarioSettings: boolean;

    // to update EsmaLiquidationFooterLiquiditySettingsComponent on LiquidatedStrategyChanged from EsmaPartialLiquiditySettingsComponent
    liquidityStrategy$ = new Subject<string>();

    isAdvancedLiquiditySettingsModalOpen = false;

    assetClassModelMapping: { text: string, value: string}[];

    preCannedStressScenarios: { text: string, value: string}[];

    modelSelectionToken = false;

    portfolioSideOptionsTabData: AuxTabBarItemInterface[];

    selectedOptionTabUid: string;

    /**
     * Gets the config type that this object is configuring.
     */
    protected getOptionValueConfigType(): string {
        return LiquidityColumnOptionComponent.OPTION_KEY;
    }

    /**
     * Performs the required initialization.
     */
    initializeComponent(): void {
        super.initializeComponent();

        this.optionAttributes = LiquidityColumnOption.options(this.option);

        this.isShowPortfolioSide = this.isOptionsPresent(LiquidityConstants.LIQUIDATION_SETTINGS)
            && this.isOptionsPresent(LiquidityConstants.REDEMPTION_SETTINGS);
        this.isPortfolioSideLiabilities = !this.isOptionsPresent(LiquidityConstants.LIQUIDATION_SETTINGS)
            && this.isOptionsPresent(LiquidityConstants.REDEMPTION_SETTINGS);

        this.isPortfolioSideAssets = !this.isPortfolioSideLiabilities;
        this.portfolioSideOptions = LiquidityConstants.PORTFOLIO_SIDE_OPTIONS.map(portfolioSideOption => {
            return {label: portfolioSideOption.title, eventData: portfolioSideOption.value};
        });

        this.isShowGeneralLiquiditySettings = this.isOptionsPresent(LiquidityConstants.HORIZON)
            || this.isOptionsPresent(LiquidityConstants.ADV_PARTICIPATION_RATE)
            || this.isOptionsPresent(LiquidityConstants.PARTICIPATION_RATE);

        this.isShowStressLiquiditySettings = this.isOptionsPresent(LiquidityConstants.FIXED_COST_SHOCK)
            || this.isOptionsPresent(LiquidityConstants.MARKET_IMPACT_SHOCK)
            || this.isOptionsPresent(LiquidityConstants.MARKET_DEPTH_SHOCK)
            || this.isOptionsPresent(LiquidityConstants.STRESS_ANALYSIS_FLAG)
            || this.isOptionsPresent(LiquidityConstants.TCOST_STRESS_FLAG);

        this.isShowPartialLiquiditySettings = this.isOptionsPresent(LiquidityConstants.PARTIAL_LIQUIDATION);

        this.isShowSecLiquiditySettings = this.isOptionsPresent(LiquidityConstants.SEC_VARY);

        this.isShowUnitLiquiditySettings = this.isOptionsPresent(LiquidityConstants.UNIT_CONTRIBUTION)
            || this.isOptionsPresent(LiquidityConstants.UNIT_STANDALONE);

        this.isShowQuantitativeTieringLiquiditySettings = this.isOptionsPresent(LiquidityConstants.DAYS_TO_UNWIND);

        this.isShowHorizonSettings = this.isOptionsPresent(LiquidityConstants.TIME_HORIZONS);

        this.isShowEsmaLiquidationSettings = this.isOptionsPresent(LiquidityConstants.LIQUIDATION_SETTINGS);

        this.isShowEsmaRedemptionSettings = this.isOptionsPresent(LiquidityConstants.REDEMPTION_SETTINGS);

        this.isShowFundSettings = this.isOptionsPresent(LiquidityConstants.HAS_FUND_SETTINGS);

        this.isHolidayLookup = this.isOptionsPresent(LiquidityConstants.HOLIDAY_LOOKUP);

        this.isJITAColumn = this.isOptionsPresent(LiquidityConstants.IS_JITA_COLUMN);

        this.isShowAdvancedSettings = this.isOptionsPresent(LiquidityConstants.MODEL_SELECTION_SETTINGS)
            && TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_MODEL_SELECTION);

        this.isShowPrecannedStressScenarioSettings = this.isOptionsPresent(LiquidityConstants.PRECANNED_STRESS_SCENARIO_SETTINGS);

        this.assetClassModelMapping = CoreDefinitionStore.assetClassModelMapping;

        this.preCannedStressScenarios = CoreDefinitionStore.preCannedStressScenarios;

        this.portfolioSideOptionsTabData = this.portfolioSideOptions.map( (portfolio, index) => {
            return {label: portfolio.label, eventData: portfolio.eventData, uid: index.toString()};
        });
    }

    /**
     * Return true if value is there in optionAttributes else return false
     */
    private isOptionsPresent(value: string): boolean {
        return (this.optionAttributes && this.optionAttributes.has(value)) ? this.optionAttributes.get(value) : false;
    }

    /**
     * On portfolio side tab changed
     */
    onPortfolioSideChanged(event: CustomEvent<AuxTabBarSelectedDetailInterface>): void {
        if (isNil(event)) {
            return;
        }
        this.selectedOptionTabUid = event.detail.uid;
        const portfolioSide: string = event.detail.eventData;
        this.isPortfolioSideAssets = portfolioSide === LiquidityConstants.PORTFOLIO_SIDE_ASSETS;
        this.isPortfolioSideLiabilities = portfolioSide === LiquidityConstants.PORTFOLIO_SIDE_LIABILITIES;
    }

    /**
     * Update advancedLiquiditySettings with new value from advancedLiquiditySettings modal
     */
    updateAdvancedLiquiditySettings($event: AdvancedLiquiditySettings): void {
        this.optionValue.advancedLiquiditySettings = $event;
    }

    /**
     * Open advanced liquidity settings modal
     */
    openAdvancedLiquiditySettingsModal(): void {
        this.isAdvancedLiquiditySettingsModalOpen = true;
    }

    /**
     * Close advanced liquidity settings modal
     */
    closeAdvancedLiquiditySettingsModal(): void {
        this.isAdvancedLiquiditySettingsModalOpen = false;
    }
}
