import {Component, Input, OnInit} from '@angular/core';
import {cloneDeep, isNil, some} from 'lodash';
import {takeUntil} from 'rxjs/operators';
import {
    AuxCheckboxChangedDetailInterface,
    AuxCheckboxGroupChangedDetailInterface,
    AuxNumericStepperValueChangedDetailInterface,
    AuxRadioGroupChangedDetailInterface, AuxSelectOption, AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {ExploreRadioButton, ExploreCheckbox, ExploreSelectOption, ExploreSelectOptionGroup, ExploreNumericStepperGroup} from '@blk/explore-ui-core';
import {Subject} from 'rxjs';
import {LiquidityConstants} from '../../../liquidity.constants';
import {EsmaLiquidationFooterLiquiditySettings} from '../../../models/esma-liquidity-settings/esma-liquidation-footer-liquidity-settings.model';
import {BaseGlobalStressMultiplierComponent} from '../../base-global-stress-multiplier-component';

/**
 * ESMA liquidation footer liquidity setting component part of liquidity setting in column options for ESMA column
 */
@Component({
    selector: 'explore-column-option-esma-liquidation-footer-liquidity-settings',
    templateUrl: './esma-liquidation-footer-liquidity-settings.component.html',
    styleUrls: ['./esma-liquidation-footer-liquidity-settings.component.scss']
})
export class EsmaLiquidationFooterLiquiditySettingsComponent extends BaseGlobalStressMultiplierComponent<EsmaLiquidationFooterLiquiditySettings> implements OnInit {

    public static readonly SECTOR_LEVEL: string = 'Sector level';
    private static readonly GLOBAL_LEVEL: string = 'Global level';

    private static readonly MARKET_VALUE: string = 'Market value';
    private static readonly NOTIONAL_MARKET_VALUE: string = 'Notional market value';

    readonly MAX_ILLIQUID_TYPE_ABS: string = LiquidityConstants.MAX_ILLIQUID_TYPE_ABS;
    readonly MAX_ILLIQUID_TYPE_REL: string = LiquidityConstants.MAX_ILLIQUID_TYPE_REL;

    @Input() liquidationStrategy: string;

    // to update EsmaLiquidationFooterLiquiditySettingsComponent on LiquidatedStrategyChanged from EsmaPartialLiquiditySettingsComponent
    @Input() liquidityStrategy$: Subject<string>;

    isModifiedLiquidationStrategy: boolean;

    isHolidayLookUp: boolean;
    disableStressTestingSettings: boolean;

    includeLiquidationUnit: boolean;
    liquidationUnitOptions: ExploreRadioButton[];

    includeAggregation: boolean;
    includeAdditionalAggregation: boolean;
    aggregationOptions: ExploreSelectOptionGroup[];

    stressTestingOptions: ExploreCheckbox[];

    maxIlliquidTypeOptions: ExploreRadioButton[];

    /**
     * Initialize all required fields
     */
    ngOnInit() {
        const MODIFIED_LIQUIDATION_STRATEGIES: string[] = LiquidityConstants.ESMA_MODIFIED_LIQUIDATION_STRATEGY_OPTIONS
            .map(liquidationStrategy => liquidationStrategy.value);
        this.isModifiedLiquidationStrategy = some(MODIFIED_LIQUIDATION_STRATEGIES, modifiedLiquidationStrategy => this.liquidationStrategy === modifiedLiquidationStrategy);

        this.includeLiquidationUnit = this.optionAttributes.get(LiquidityConstants.LIQUIDATION_UNIT);
        this.isHolidayLookUp = this.optionAttributes.get(LiquidityConstants.HOLIDAY_LOOKUP);
        this.disableStressTestingSettings = this.optionAttributes.get(LiquidityConstants.DISABLE_STRESS_TESTING_SETTINGS);
        this.liquidationUnitOptions = [
            new ExploreRadioButton(EsmaLiquidationFooterLiquiditySettingsComponent.MARKET_VALUE, !this.underlyingLiquiditySettings.useNotionalAmtLiq, false, false),
            new ExploreRadioButton(EsmaLiquidationFooterLiquiditySettingsComponent.NOTIONAL_MARKET_VALUE, this.underlyingLiquiditySettings.useNotionalAmtLiq, false, true)
        ];

        this.includeAggregation = this.optionAttributes.get(LiquidityConstants.AGGREGATION);
        this.includeAdditionalAggregation = this.optionAttributes.get(LiquidityConstants.ADDITIONAL_AGGREGATION);

        const options = this.includeAdditionalAggregation ? LiquidityConstants.AGGREGATION_OPTIONS.concat(LiquidityConstants.ADDITIONAL_AGGREGATION_OPTIONS) : LiquidityConstants.AGGREGATION_OPTIONS;
        const exploreSelectOptions = options.map(aggregationOption => new ExploreSelectOption(aggregationOption.title, aggregationOption.value, this.underlyingLiquiditySettings.aggregation === aggregationOption.value));
        this.aggregationOptions = [new ExploreSelectOptionGroup(exploreSelectOptions)];

        this.stressTestingOptions = [
            new ExploreCheckbox(EsmaLiquidationFooterLiquiditySettingsComponent.SECTOR_LEVEL, this.underlyingLiquiditySettings.sectorLevelStressTestingFlag, !isNil(this.underlyingLiquiditySettings.assetStressScenario)),
            new ExploreCheckbox(EsmaLiquidationFooterLiquiditySettingsComponent.GLOBAL_LEVEL, this.underlyingLiquiditySettings.globalLevelStressTestingFlag, false)
        ];

        this.maxIlliquidTypeOptions = LiquidityConstants.MAX_ILLIQUID_TYPE_OPTIONS.map(maxIlliquidTypeOption =>
            new ExploreRadioButton(maxIlliquidTypeOption.title, this.underlyingLiquiditySettings.illiquidMaxFormat === maxIlliquidTypeOption.value, false, maxIlliquidTypeOption.value)
        );

        this.liquidityStrategy$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((strategy) => {
                this.isModifiedLiquidationStrategy = (strategy === LiquidityConstants.ESMA_MODIFIED_LIQUIDATION_STRATEGY_PRO_RATA
                    || strategy === LiquidityConstants.ESMA_MODIFIED_LIQUIDATION_STRATEGY_WATERFALL);
            });

        this.initializeStressMultiplierGroup(this.underlyingLiquiditySettings.globalStressMultiplier);
    }

    /**
     * On liquidation unit changed
     */
    onLiquidationUnitChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.useNotionalAmtLiq = event.detail.value.eventData;
    }

    /**
     * On aggregation changed
     */
    onAggregationChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.aggregation = (event.detail.value as AuxSelectOption).value;
    }

    /**
     * On stress testing options changed
     */
    onStressTestingOptionsChanged(event: CustomEvent<AuxCheckboxGroupChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }
        this.underlyingLiquiditySettings.sectorLevelStressTestingFlag = event.detail.value[0].checked;
        this.underlyingLiquiditySettings.globalLevelStressTestingFlag = event.detail.value[1].checked;
    }

    /**
     * On illiquid enabled flag changed
     */
    onIlliquidEnabledFlagChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.illiquidEnabledFlag = event.detail.value.checked;

        this.underlyingLiquiditySettings.illiquidMaxFormat = this.underlyingLiquiditySettings.illiquidMaxFormat || LiquidityConstants.MAX_ILLIQUID_TYPE_ABS;
        this.maxIlliquidTypeOptions.forEach(maxIlliquidTypeOption => maxIlliquidTypeOption.checked = this.underlyingLiquiditySettings.illiquidMaxFormat === maxIlliquidTypeOption.eventData);
    }

    /**
     * On max illiquid format changed
     */
    onMaxIlliquidFormatChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.illiquidMaxFormat = event.detail.value.eventData;
    }

    /**
     * On rel illiquid max changed
     */
    onRelIlliquidMaxChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.relIlliquidMax = Number(event.detail.value);
    }

    /**
     * On abs illiquid max changed
     */
    onAbsIlliquidMaxChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.absIlliquidMax = Number(event.detail.value);
    }

    /**
     * On illiquid def changed
     */
    onIlliquidDefChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.illiquidDef = Number(event.detail.value);
    }

    /**
     * On holidayLookup changed
     */
    onHolidayLookUpChange(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        if (isNil(event)) {
            return;
        }

        this.underlyingLiquiditySettings.holidayLookup = Number(event.detail.value);
    }

    /**
     * On assetStressScenraio change, if the selected scenario is the default one make the assetStressScenario undefined or set it to received assetStressScenario
     * @param assetStressScenario - selected asset stress scenario
     */
    onAssetStressScenarioChanged(assetStressScenario: string): void {
        const isAssetScenarioNotSelected = LiquidityConstants.DEFAULT_ASSET_STRESS_SCENARIO === assetStressScenario;
        if (isAssetScenarioNotSelected) {
            this.underlyingLiquiditySettings.assetStressScenario = undefined;
        } else {
            this.underlyingLiquiditySettings.assetStressScenario = assetStressScenario;
        }
        this._refreshSectorStressCheckboxStatus(!isAssetScenarioNotSelected);
    }

    private _refreshSectorStressCheckboxStatus(disabled: boolean): void {
        this.stressTestingOptions.find(option => option.label === EsmaLiquidationFooterLiquiditySettingsComponent.SECTOR_LEVEL).disabled = disabled;
        this.stressTestingOptions = cloneDeep(this.stressTestingOptions);
    }
}
