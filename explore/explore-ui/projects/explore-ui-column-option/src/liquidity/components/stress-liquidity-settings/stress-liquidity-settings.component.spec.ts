import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {StressLiquiditySettingsComponent} from './stress-liquidity-settings.component';
import {StressLiquiditySettings} from '../../models/stress-liquidity-settings.model';

describe('StressLiquiditySettingsComponent test', () => {
    let component: StressLiquiditySettingsComponent;
    let fixture: ComponentFixture<StressLiquiditySettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [StressLiquiditySettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(StressLiquiditySettingsComponent);
        component = fixture.componentInstance;

        component.optionAttributes = new Map<string, boolean>();
        component.optionAttributes.set('FIXED_COST_SHOCK', true);

        component.underlyingLiquiditySettings = new StressLiquiditySettings();
        component.underlyingLiquiditySettings.initialize(component.optionAttributes);
        component.underlyingLiquiditySettings.stressAnalysisFlag = true;
        component.underlyingLiquiditySettings.tcostStressFlag = true;

        fixture.detectChanges();
    });

    it('Test component got initialized', () => {
        expect(component).toBeDefined();
        expect(component.isShowStressLabel).toBeTruthy();
        expect(component.stressLiquidityGroup.length).toBe(3);
    });

    it('Test onStressAnalysisFlagToggle', () => {
        expect(component.underlyingLiquiditySettings.stressAnalysisFlag).toBeTruthy();

        expect(component.onStressAnalysisFlagToggle(null)).toBeUndefined();

        const event = {detail: {value: {checked: false}}} as CustomEvent;
        component.onStressAnalysisFlagToggle(event);
        expect(component.underlyingLiquiditySettings.stressAnalysisFlag).toBeFalsy();
    });

    it('Test onTCostStressFlagToggle', () => {
        expect(component.underlyingLiquiditySettings.tcostStressFlag).toBeTruthy();

        expect(component.onTCostStressFlagToggle(null)).toBeUndefined();

        const event = {detail: {value: {checked: false}}} as CustomEvent;
        component.onTCostStressFlagToggle(event);
        expect(component.underlyingLiquiditySettings.tcostStressFlag).toBeFalsy();
    });

    it('Test onStressLiquidityValueChanged', () => {
        expect(component.underlyingLiquiditySettings.fixedCostMultiplier).toBeUndefined();

        expect(component.onStressLiquidityValueChanged(null, '')).toBeUndefined();

        let event = {detail: {value: '0'}} as CustomEvent;
        component.onStressLiquidityValueChanged(event, StressLiquiditySettingsComponent.STRESS_LIQUIDITY_FIXED_COST_LABEL);
        expect(component.underlyingLiquiditySettings.fixedCostMultiplier).toBe(0);

        expect(component.underlyingLiquiditySettings.marketImpactMultiplier).toBeUndefined();
        event = {detail: {value: '3'}} as CustomEvent;
        component.onStressLiquidityValueChanged(event, StressLiquiditySettingsComponent.STRESS_LIQUIDITY_MARKET_IMPACT_LABEL);
        expect(component.underlyingLiquiditySettings.marketImpactMultiplier).toBe(3);

        expect(component.underlyingLiquiditySettings.marketDepthMultiplier).toBeUndefined();
        event = {detail: {value: '2'}} as CustomEvent;
        component.onStressLiquidityValueChanged(event, StressLiquiditySettingsComponent.STRESS_LIQUIDITY_MARKET_DEPTH_LABEL);
        expect(component.underlyingLiquiditySettings.marketDepthMultiplier).toBe(2);
    });
});
