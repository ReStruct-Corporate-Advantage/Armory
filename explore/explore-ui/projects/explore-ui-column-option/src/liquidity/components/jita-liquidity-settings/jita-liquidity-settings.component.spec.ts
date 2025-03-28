import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {JITALiquiditySettingsComponent} from './jita-liquidity-settings.component';
import {JITALiquiditySettings} from '../../models/jita-liquidity-settings.model';
import {ExploreSelectOption} from '@blk/explore-ui-core';
import {GlobalStressMultiplier} from '../../models/global-stress-multiplier';

describe('JITALiquiditySettingsComponent test', () => {
    let component: JITALiquiditySettingsComponent;
    let fixture: ComponentFixture<JITALiquiditySettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [JITALiquiditySettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(JITALiquiditySettingsComponent);
        component = fixture.componentInstance;

        component.optionAttributes = new Map<string, boolean>();
        component.optionAttributes.set('NAV_MULTIPLIER', true);
        component.optionAttributes.set('SHOW_PERCENT_NAV_LIQUIDATED', true);
        component.optionAttributes.set('AGGREGATION', true);
        component.optionAttributes.set('ADDITIONAL_AGGREGATION', true);
        component.optionAttributes.set('LIQUIDATION_UNIT', true);
        component.optionAttributes.set('DISABLE_BUCKET_OPTIONS', false);
        component.optionAttributes.set('DISABLE_STRESS_TESTING_SETTINGS', false);

        component.underlyingLiquiditySettings = new JITALiquiditySettings();
        component.underlyingLiquiditySettings.initialize(component.optionAttributes);

        fixture.detectChanges();
    });

    it('Test component got initialized', () => {
        expect(component).toBeDefined();
        expect(component.isShowNAVPercentLiquidatedOption).toBeTruthy();
        expect(component.isNavMultiplier).toBeTruthy();
        expect(component.liquidityConstraintGroup).toBeDefined();
        expect(component.liquidityConstraintGroup.length).toBe(1);
        expect(component.liquidationConstraintOptions.length).toBe(1);
        expect(component.liquidationStrategyOptions.length).toBe(1);
        expect(component.liquidationStrategyOptions[0].values.length).toBe(2);
        expect(component.liquidationStrategyOptions[0].values[0].displayValue).toBe('Waterfall');
        expect(component.liquidationStrategyOptions[0].values[1].displayValue).toBe('Modified waterfall');
        expect(component.aggregationOptions[0].values.length).toBe(4);
        expect(component.aggregationOptions[0].values[0].value).toBe('net');
        expect(component.aggregationOptions[0].values[1].value).toBe('gross');
        expect(component.aggregationOptions[0].values[2].value).toBe('longOnly');
        expect(component.aggregationOptions[0].values[3].value).toBe('netPositionGrossTotal');
        expect(component.disableBucketOptions).toBe(false);
        expect(component.liquidationBucketOptions.length).toBe(2);
        expect(component.liquidationBucketOptions[0].label).toBe('Equal dollar');
        expect(component.liquidationBucketOptions[1].label).toBe('Last dollar');
        expect(component.liquidationUnitOptions[0].label).toBe('Market value');
        expect(component.liquidationUnitOptions[1].label).toBe('Notional market value');
        expect(component.disableStressTestingSettings).toBe(false);
        expect(component.stressTestingOptions[0].label).toBe('Sector level');
        expect(component.stressTestingOptions[1].label).toBe('Global level');
        expect(component.maxIlliquidTypeOptions[0].label).toBe('Absolute');
        expect(component.maxIlliquidTypeOptions[1].label).toBe('Relative');
        expect(component.isModifiedLiquidationStrategy).toBeFalsy();
        expect(component.stressMultipliersGroup[0].label).toBe(GlobalStressMultiplier.LEGACY_STRESS_MULTIPLIER_LABEL);
    });

    it('Test onLiquidationStrategyChanged', () => {
        // initial value
        expect(component.underlyingLiquiditySettings.liquidationStrategy).toBe('waterfall');

        // if event is null then it will return
        expect(component.onLiquidationStrategyChanged(null)).toBeUndefined();

        const event = {detail: {value: {value: 'modifiedWaterfall'} as ExploreSelectOption}} as CustomEvent;
        component.onLiquidationStrategyChanged(event);
        expect(component.underlyingLiquiditySettings.liquidationStrategy).toBe('modifiedWaterfall');
    });

    it('Test onLiquidationConstraintChanged', () => {
        // initial value
        expect(component.underlyingLiquiditySettings.liquidationConstraint).toBe('percentNAV');

        // if event is null then it will return
        expect(component.onLiquidationConstraintChanged(null)).toBeUndefined();

        const event = {detail: {value: {eventData: 'maxTCost'}}} as CustomEvent;
        component.onLiquidationConstraintChanged(event);
        expect(component.underlyingLiquiditySettings.liquidationConstraint).toBe('maxTCost');
    });

    it('Test onLiquidationConstraintValueChanged', () => {
        // If event is null then it will return
        expect(component.onLiquidationConstraintValueChanged(null, 1)).toBeUndefined();

        // For percentNavLiquidated
        const event = {detail: {value: '2'}} as CustomEvent;
        component.onLiquidationConstraintValueChanged(event, 0);
        expect(component.underlyingLiquiditySettings.percentNavLiquidated).toBe(2);
    });

    it('Test onAggregationChanged', () => {
        // initial value
        expect(component.underlyingLiquiditySettings.aggregation).toBe('net');

        // if event is null then it will return
        expect(component.onAggregationChanged(null)).toBeUndefined();

        const event = {detail: {value: {value: 'gross'} as ExploreSelectOption}} as CustomEvent;
        component.onAggregationChanged(event);
        expect(component.underlyingLiquiditySettings.aggregation).toBe('gross');
    });

    it('Test onLiquidationBucketMethChanged', () => {
        expect(component.onLiquidationBucketMethChanged(null)).toBeUndefined();
        const event = {detail: {value: {eventData: 'Dummy LiquidationBeth String'}}} as CustomEvent;
        component.onLiquidationBucketMethChanged(event);
        expect(component.underlyingLiquiditySettings.liquidationBucketMeth).toBe('Dummy LiquidationBeth String');
    });

    it('Test onLiquidationUnitChanged', () => {
        expect(component.onLiquidationUnitChanged(null)).toBeUndefined();
        const event = {detail: {value: {eventData: false}}} as CustomEvent;
        component.onLiquidationUnitChanged(event);
        expect(component.underlyingLiquiditySettings.useNotionalAmtLiq).toBe(false);
    });


    it('Test onStressTestingOptionsChanged', () => {
        expect(component.onStressTestingOptionsChanged(null)).toBeUndefined();

        const event = {detail: {value: [{checked: true}, {checked: false}]}} as CustomEvent;
        component.onStressTestingOptionsChanged(event);
        expect(component.underlyingLiquiditySettings.sectorLevelStressTestingFlag).toBeTruthy();
        expect(component.underlyingLiquiditySettings.globalLevelStressTestingFlag).toBeFalsy();
    });


    it('Test onStressMultiplierChanged', () => {
        expect(component.onStressMultiplierChanged(null, null, null)).toBeUndefined();

        const event = {detail: {value: '5'}} as CustomEvent;
        component.onStressMultiplierChanged(event, GlobalStressMultiplier.FIXED_COST_MULTIPLIER_LABEL, component.underlyingLiquiditySettings.globalStressMultiplier);
        expect(component.underlyingLiquiditySettings.globalStressMultiplier.fixedCostMultiplier).toBe(5);

        component.onStressMultiplierChanged(event, GlobalStressMultiplier.MARKET_DEPTH_MULTIPLIER_LABEL, component.underlyingLiquiditySettings.globalStressMultiplier);
        expect(component.underlyingLiquiditySettings.globalStressMultiplier.marketDepthMultiplier).toBe(5);

        component.onStressMultiplierChanged(event, GlobalStressMultiplier.MARKET_IMPACT_MULTIPLIER_LABEL, component.underlyingLiquiditySettings.globalStressMultiplier);
        expect(component.underlyingLiquiditySettings.globalStressMultiplier.marketImpactMultiplier).toBe(5);
    });

    it('Test onIlliquidEnabledFlagChanged', () => {
        expect(component.onIlliquidEnabledFlagChanged(null)).toBeUndefined();

        const event = {detail: {value: {checked: true}}} as CustomEvent;
        component.onIlliquidEnabledFlagChanged(event);
        expect(component.underlyingLiquiditySettings.illiquidEnabledFlag).toBeTruthy();

        expect(component.underlyingLiquiditySettings.illiquidMaxFormat).toBe('ABS');
        expect(component.maxIlliquidTypeOptions[0].checked).toBeTruthy();
    });

    it('Test onMaxIlliquidFormatChanged', () => {
        expect(component.onMaxIlliquidFormatChanged(null)).toBeUndefined();

        const event = {detail: {value: {eventData: 'REL'}}} as CustomEvent;
        component.onMaxIlliquidFormatChanged(event);
        expect(component.underlyingLiquiditySettings.illiquidMaxFormat).toBe('REL');
    });

    it('Test onRelIlliquidMaxChanged', () => {
        expect(component.onRelIlliquidMaxChanged(null)).toBeUndefined();

        const event = {detail: {value: '10'}} as CustomEvent;
        component.onRelIlliquidMaxChanged(event);
        expect(component.underlyingLiquiditySettings.relIlliquidMax).toBe(10);
    });

    it('Test onAbsIlliquidMaxChanged', () => {
        expect(component.onAbsIlliquidMaxChanged(null)).toBeUndefined();

        const event = {detail: {value: '9'}} as CustomEvent;
        component.onAbsIlliquidMaxChanged(event);
        expect(component.underlyingLiquiditySettings.absIlliquidMax).toBe(9);
    });

    it('Test onIlliquidDefChanged', () => {
        expect(component.onIlliquidDefChanged(null)).toBeUndefined();

        const event = {detail: {value: '9'}} as CustomEvent;
        component.onIlliquidDefChanged(event);
        expect(component.underlyingLiquiditySettings.illiquidDef).toBe(9);
    });
});
