import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {QuantitativeTieringLiquiditySettingsComponent} from './quantitative-tiering-liquidity-settings.component';
import {QuantitativeTieringLiquiditySettings} from '../../models/quantitative-tiering-liquidity-settings.model';

describe('QuantitativeTieringLiquiditySettings test', () => {
    let component: QuantitativeTieringLiquiditySettingsComponent;
    let fixture: ComponentFixture<QuantitativeTieringLiquiditySettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuantitativeTieringLiquiditySettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(QuantitativeTieringLiquiditySettingsComponent);
        component = fixture.componentInstance;

        component.optionAttributes = new Map<string, boolean>();

        component.underlyingLiquiditySettings = new QuantitativeTieringLiquiditySettings();
        component.underlyingLiquiditySettings.initialize(component.optionAttributes);

        fixture.detectChanges();
    });

    it('Test component got initialized', () => {
        expect(component).toBeDefined();
        expect(component.underlyingLiquiditySettings.minDays).toBe(0);
        expect(component.underlyingLiquiditySettings.maxDays).toBe(500);
    });

    it('Test onInit', () => {
        component.ngOnInit();
        expect(component.minDaysMaxValue).toBe(365);
    });

    it('Test onMinDaysChanged', () => {
        expect(component.onMinDaysChanged(null)).toBeUndefined();

        const event = {detail: {value: '2'}} as CustomEvent;
        component.onMinDaysChanged(event);
        expect(component.underlyingLiquiditySettings.minDays).toBe(2);
    });

    it('Test onMaxDaysChanged', () => {
        expect(component.onMaxDaysChanged(null)).toBeUndefined();

        const event = {detail: {value: '4'}} as CustomEvent;
        component.onMaxDaysChanged(event);
        expect(component.underlyingLiquiditySettings.maxDays).toBe(4);
    });
});
