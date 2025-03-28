import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Subject} from 'rxjs';
import {EsmaLiquidationFooterLiquiditySettings} from '../../../models/esma-liquidity-settings/esma-liquidation-footer-liquidity-settings.model';
import {EsmaLiquidationFooterLiquiditySettingsComponent} from './esma-liquidation-footer-liquidity-settings.component';
import {LiquidityConstants} from '../../../liquidity.constants';
import {GlobalStressMultiplier} from '../../../models/global-stress-multiplier';

describe('ESMALiquidationFooterLiquiditySettingsComponent test', () => {
    let component: EsmaLiquidationFooterLiquiditySettingsComponent;
    let fixture: ComponentFixture<EsmaLiquidationFooterLiquiditySettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [EsmaLiquidationFooterLiquiditySettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(EsmaLiquidationFooterLiquiditySettingsComponent);
        component = fixture.componentInstance;

        component.optionAttributes = new Map<string, boolean>();

        component.underlyingLiquiditySettings = new EsmaLiquidationFooterLiquiditySettings();
        component.underlyingLiquiditySettings.initialize(component.optionAttributes, new Map<string, any>());
        component.liquidityStrategy$ = new Subject<string>();

        fixture.detectChanges();
    });

    it('Test component got initialized', () => {
        expect(component).toBeDefined();
        expect(component.aggregationOptions.length).toBe(1);
        expect(component.aggregationOptions[0].values.length).toBe(2);
        expect(component.stressTestingOptions.length).toBe(2);
        expect(component.isModifiedLiquidationStrategy).toBeFalsy();

        expect(component.stressMultipliersGroup[0].label).toBe(GlobalStressMultiplier.LEGACY_STRESS_MULTIPLIER_LABEL);
    });

    it('Test component got initialized with Additional aggregation options', () => {
        component.optionAttributes.set(LiquidityConstants.ADDITIONAL_AGGREGATION, true);
        component.optionAttributes.set(LiquidityConstants.HOLIDAY_LOOKUP, true);
        component.ngOnInit();
        expect(component).toBeDefined();
        expect(component.aggregationOptions.length).toBe(1);
        expect(component.aggregationOptions[0].values.length).toBe(4);
        expect(component.stressTestingOptions.length).toBe(2);
        expect(component.isModifiedLiquidationStrategy).toBeFalsy();
        expect(component.isHolidayLookUp).toBeTruthy();
    });

    it('Test component got initialized with disabled stress testing settings', () => {
        component.optionAttributes.set(LiquidityConstants.DISABLE_STRESS_TESTING_SETTINGS, true);
        component.ngOnInit();
        expect(component).toBeDefined();
        expect(component.disableStressTestingSettings).toBeTruthy();
    });

    it('Test onLiquidationUnitChanged', () => {
        expect(component.onLiquidationUnitChanged(null)).toBeUndefined();

        const event = {detail: {value: {eventData: true}}} as CustomEvent;
        component.onLiquidationUnitChanged(event);
        expect(component.underlyingLiquiditySettings.useNotionalAmtLiq).toBe(true);
    });

    it('Test onAggregationChanged', () => {
        expect(component.onAggregationChanged(null)).toBeUndefined();

        const event = {detail: {value: {value: 'AggregationString'}}} as CustomEvent;
        component.onAggregationChanged(event);
        expect(component.underlyingLiquiditySettings.aggregation).toBe('AggregationString');
    });

    describe('Test onStressTestingOptionsChanged', () => {
        it('null event', () => {
            component.onStressTestingOptionsChanged(null);
            expect(component.underlyingLiquiditySettings.sectorLevelStressTestingFlag).toBeFalsy();
            expect(component.underlyingLiquiditySettings.globalLevelStressTestingFlag).toBeFalsy();
        });

        it('sector stress checked', () => {
            const event = {detail: {value: [{checked: true}, {checked: false}]}} as CustomEvent;
            component.onStressTestingOptionsChanged(event);
            expect(component.underlyingLiquiditySettings.sectorLevelStressTestingFlag).toBeTruthy();
            expect(component.underlyingLiquiditySettings.globalLevelStressTestingFlag).toBeFalsy();
        });

        it('global stress checked', () => {
            const event = {detail: {value: [{checked: false}, {checked: true}]}} as CustomEvent;
            component.onStressTestingOptionsChanged(event);
            expect(component.underlyingLiquiditySettings.sectorLevelStressTestingFlag).toBeFalsy();
            expect(component.underlyingLiquiditySettings.globalLevelStressTestingFlag).toBeTruthy();
        });

        it('both sector and global stress checked', () => {
            const event = {detail: {value: [{checked: true}, {checked: true}]}} as CustomEvent;
            component.onStressTestingOptionsChanged(event);
            expect(component.underlyingLiquiditySettings.sectorLevelStressTestingFlag).toBeTruthy();
            expect(component.underlyingLiquiditySettings.globalLevelStressTestingFlag).toBeTruthy();
        });
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

        const event = {detail: {value: {eventData: 'Test'}}} as CustomEvent;
        component.onMaxIlliquidFormatChanged(event);
        expect(component.underlyingLiquiditySettings.illiquidMaxFormat).toBe('Test');
    });

    it('Test onRelIlliquidMaxChanged', () => {
        expect(component.onRelIlliquidMaxChanged(null)).toBeUndefined();

        const event = {detail: {value: '9'}} as CustomEvent;
        component.onRelIlliquidMaxChanged(event);
        expect(component.underlyingLiquiditySettings.relIlliquidMax).toBe(9);
    });

    it('Test onAbsIlliquidMaxChanged', () => {
        expect(component.onAbsIlliquidMaxChanged(null)).toBeUndefined();

        const event = {detail: {value: '8'}} as CustomEvent;
        component.onAbsIlliquidMaxChanged(event);
        expect(component.underlyingLiquiditySettings.absIlliquidMax).toBe(8);
    });

    it('Test onIlliquidDefChanged', () => {
        expect(component.onIlliquidDefChanged(null)).toBeUndefined();

        const event = {detail: {value: '7'}} as CustomEvent;
        component.onIlliquidDefChanged(event);
        expect(component.underlyingLiquiditySettings.illiquidDef).toBe(7);
    });

    it('Test liquidationStrategy subject', () => {
        component.liquidityStrategy$.next('dummy');
        expect(component.isModifiedLiquidationStrategy).toBeFalsy();

        // Let pass strategy as 'modifiedProRata'
        component.liquidityStrategy$.next('modifiedProRata');
        expect(component.isModifiedLiquidationStrategy).toBeTruthy();
    });

    it('Test onHolidayLookUpChange', () => {
        expect(component.onHolidayLookUpChange(null)).toBeUndefined();

        const event = {detail: {value: '7'}} as CustomEvent;
        component.onHolidayLookUpChange(event);
        expect(component.underlyingLiquiditySettings.holidayLookup).toBe(7);
    });

    it('Test onAssetStressScenarioChanged', () => {
        expect(component.stressTestingOptions.find(option => option.label === EsmaLiquidationFooterLiquiditySettingsComponent.SECTOR_LEVEL).disabled).toBeFalsy();
        component.onAssetStressScenarioChanged('COVID');
        expect(component.stressTestingOptions.find(option => option.label === EsmaLiquidationFooterLiquiditySettingsComponent.SECTOR_LEVEL).disabled).toBeTruthy();
        component.onAssetStressScenarioChanged(LiquidityConstants.DEFAULT_ASSET_STRESS_SCENARIO);
        expect(component.stressTestingOptions.find(option => option.label === EsmaLiquidationFooterLiquiditySettingsComponent.SECTOR_LEVEL).disabled).toBeFalsy();
    });
});
