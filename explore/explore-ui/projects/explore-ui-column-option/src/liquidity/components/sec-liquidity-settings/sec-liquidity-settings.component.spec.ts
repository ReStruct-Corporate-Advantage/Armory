import { ComponentFixture, TestBed } from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {SecLiquiditySettingsComponent} from './sec-liquidity-settings.component';
import {SECLiquiditySettings} from '../../models/sec-liquidity-settings.model';

describe('SECLiquiditySettingsComponent test', () => {
    let component: SecLiquiditySettingsComponent;
    let fixture: ComponentFixture<SecLiquiditySettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SecLiquiditySettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(SecLiquiditySettingsComponent);
        component = fixture.componentInstance;

        component.optionAttributes = new Map<string, boolean>();

        component.underlyingLiquiditySettings = new SECLiquiditySettings();
        component.underlyingLiquiditySettings.initialize(component.optionAttributes, new Map<string, any>());

        fixture.detectChanges();
    });

    it('Test component got initialized', () => {
        expect(component).toBeDefined();

        component.ngOnInit();
        expect(component.secLiquidityOptions.length).toBe(3);
    });

    it('Test onSecLiquidityOptionChanged', () => {
        expect(component.underlyingLiquiditySettings.secSetting).toBe('rats');

        component.onSecLiquidityOptionChanged('scenario');
        expect(component.underlyingLiquiditySettings.secSetting).toBe('scenario');
    });

    it('Test onRatsValueChanged', () => {
        expect(component.onRatsValueChanged(null)).toBeUndefined();

        const event = {detail: {value: '8'}} as CustomEvent;
        component.onRatsValueChanged(event);
        expect(component.underlyingLiquiditySettings.rats).toBe(8);
    });

    it('Test onPercentNavChanged', () => {
        expect(component.onPercentNavChanged(null)).toBeUndefined();

        const event = {detail: { value: '6'}} as CustomEvent;
        component.onPercentNavChanged(event);
        expect(component.underlyingLiquiditySettings.secPercentNAV).toBe(6);
    });
});
