import { ComponentFixture, TestBed } from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CoreDefinitionStore} from '@blk/explore-ui-core';
import {EsmaLiquidationHeaderLiquiditySettingsComponent} from './esma-liquidation-header-liquidity-settings.component';
import {EsmaLiquidationHeaderLiquiditySettings} from '../../../models/esma-liquidity-settings/esma-liquidation-header-liquidity-settings.model';

describe('ESMALiquidationHeaderLiquiditySettingsComponent test', () => {
    let component: EsmaLiquidationHeaderLiquiditySettingsComponent;
    let fixture: ComponentFixture<EsmaLiquidationHeaderLiquiditySettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [EsmaLiquidationHeaderLiquiditySettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(EsmaLiquidationHeaderLiquiditySettingsComponent);
        component = fixture.componentInstance;

        component.optionAttributes = new Map<string, boolean>();
        component.optionAttributes.set('INCLUDE_TRANSACTION_COST', true);

        component.underlyingLiquiditySettings = new EsmaLiquidationHeaderLiquiditySettings();
        component.underlyingLiquiditySettings.initialize(component.optionAttributes);

        fixture.detectChanges();
    });

    it('Test component got initialized', () => {
        component.ngOnInit();
        expect(component).toBeDefined();
        expect(component.underlyingLiquiditySettings.navMultiplier).toBe(1);
        expect(component.includeOptions.length).toBe(2);
        expect(component.showIncludeOptions).toBe(true);
        CoreDefinitionStore.tokens['enableEquityHedgeFundCash'] = 'Y';
        component.ngOnInit();
        expect(component.includeOptions.length).toBe(3);
        expect(component.label).toBe('Liquidation options');
    });

    it('Test component got initialized with fund Settings', () => {
        component.optionAttributes.set('HAS_FUND_SETTINGS', true);

        component.underlyingLiquiditySettings = new EsmaLiquidationHeaderLiquiditySettings();
        component.underlyingLiquiditySettings.initialize(component.optionAttributes);
        component.includeOptions = [];
        CoreDefinitionStore.tokens['enableEquityHedgeFundCash'] = 'N';
        fixture.detectChanges();

        component.ngOnInit();
        expect(component).toBeDefined();
        expect(component.underlyingLiquiditySettings.navMultiplier).toBe(1);
        expect(component.includeOptions.length).toBe(2);
        expect(component.label).toBe('Redemption settings');
    });

    it('Test onNavMultiplierChanged', () => {
        expect(component.onNavMultiplierChanged(null)).toBeUndefined();
        const event = {detail: {value: '3'}} as CustomEvent;
        component.onNavMultiplierChanged(event);
        expect(component.underlyingLiquiditySettings.navMultiplier).toBe(3);
    });

    it('Test onIncludeOptionsChanged', () => {
        expect(component.onIncludeOptionsChanged(null)).toBeUndefined();
        let event: CustomEvent = {detail: {value: {label: 'Settlement period', checked: true}}} as CustomEvent;
        component.onIncludeOptionsChanged(event);
        expect(component.underlyingLiquiditySettings.includeSettlementPeriodFlag).toBeTruthy();

        event = {detail: {value: {label: 'Equity hedge fund cash', checked: true}}} as CustomEvent;
        component.onIncludeOptionsChanged(event);
        expect(component.underlyingLiquiditySettings.includeEquityHFCashFlag).toBeTruthy();
    });

    it('Test onCapacityApproachChanged', () => {
        expect(component.onCapacityApproachChanged(null)).toBeUndefined();

        const event = {detail: {value: {eventData: 'liquidFirst'}}} as CustomEvent;
        component.onCapacityApproachChanged(event);
        expect(component.underlyingLiquiditySettings.capacityApproach).toBe('liquidFirst');
    });
});
