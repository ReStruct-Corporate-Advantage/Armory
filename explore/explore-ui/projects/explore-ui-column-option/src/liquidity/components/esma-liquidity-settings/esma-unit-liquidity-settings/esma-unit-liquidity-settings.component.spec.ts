import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {EsmaUnitLiquiditySettingsComponent} from './esma-unit-liquidity-settings.component';
import {LiquidityColumnOption} from '../../../../models/column-option/liquidity-column-option.model';

describe('ESMAUnitLiquiditySettingsComponent test', () => {
    let component: EsmaUnitLiquiditySettingsComponent;
    let fixture: ComponentFixture<EsmaUnitLiquiditySettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [EsmaUnitLiquiditySettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(EsmaUnitLiquiditySettingsComponent);
        component = fixture.componentInstance;

        component.optionAttributes = new Map<string, boolean>();
        component.optionAttributes.set('UNIT_STANDALONE', true);

        component.liquiditySettings = new LiquidityColumnOption();

        fixture.detectChanges();
    });

    it('Test component got initialized', () => {
        component.ngOnInit();
        expect(component).toBeDefined();
        expect(component.unitOptions.length).toBe(2);
    });

    it('Test onUnitChanged', () => {
        expect(component.onUnitChanged(null)).toBeUndefined();
        const event = {detail: {value: {eventData: 'Dummy String'}}} as CustomEvent;
        component.onUnitChanged(event);
        expect(component.liquiditySettings.unitLiquiditySettings).toBe('Dummy String');
    });
});
