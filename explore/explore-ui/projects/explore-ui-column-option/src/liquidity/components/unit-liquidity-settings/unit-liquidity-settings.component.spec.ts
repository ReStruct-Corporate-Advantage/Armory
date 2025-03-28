import { ComponentFixture, TestBed } from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {UnitLiquiditySettingsComponent} from './unit-liquidity-settings.component';
import {LiquidityColumnOption} from '../../../models/column-option/liquidity-column-option.model';

describe('UnitLiquiditySettingsComponent test', () => {
    let component: UnitLiquiditySettingsComponent;
    let fixture: ComponentFixture<UnitLiquiditySettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [UnitLiquiditySettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(UnitLiquiditySettingsComponent);
        component = fixture.componentInstance;

        component.optionAttributes = new Map<string, boolean>();
        component.optionAttributes.set('UNIT_STANDALONE', false);

        component.liquiditySettings = new LiquidityColumnOption();
        component.liquiditySettings.unitLiquiditySettings = 'scaleAsFractionOfPortNAV';

        fixture.detectChanges();
    });

    it('Test component got initialized', () => {
        expect(component).toBeDefined();
        component.ngOnInit();
        expect(component.unitOptions.length).toBe(2);
    });

    it('Test onUnitChanged', () => {
        // if event is null then it will return
        expect(component.onUnitChanged(null)).toBeUndefined();

        const event = {detail: {value: {eventData: 'scaleAsFractionOfPortNAV'}}} as CustomEvent;
        component.onUnitChanged(event);
        expect(component.liquiditySettings.unitLiquiditySettings).toBe('scaleAsFractionOfPortNAV');
    });
});
