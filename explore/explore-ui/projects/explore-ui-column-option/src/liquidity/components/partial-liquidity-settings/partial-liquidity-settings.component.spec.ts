import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {PartialLiquiditySettingsComponent} from './partial-liquidity-settings.component';
import {PartialLiquiditySettings} from '../../models/partial-liquidity-settings.model';

describe('PartialLiquiditySettings test', () => {
    let component: PartialLiquiditySettingsComponent;
    let fixture: ComponentFixture<PartialLiquiditySettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PartialLiquiditySettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(PartialLiquiditySettingsComponent);
        component = fixture.componentInstance;

        component.optionAttributes = new Map<string, boolean>();

        component.underlyingLiquiditySettings = new PartialLiquiditySettings();
        component.underlyingLiquiditySettings.initialize(component.optionAttributes);

        fixture.detectChanges();
    });

    it('Test component got initialized', () => {
        expect(component).toBeDefined();
        component.ngOnInit();
        expect(component.liquidationStrategyOptions[0].values.length).toBe(3);
        expect(component.liquidationConstraintOptions.length).toBe(4);
        expect(component.liquidityConstraintGroup.length).toBe(4);
    });

    it('Test onLiquidationStrategyChanged', () => {
        // If event is null then it will return
        expect(component.onLiquidationStrategyChanged(null)).toBeUndefined();

        const event = {detail: {value: {value: 'ascendingCost'}}} as CustomEvent;
        component.onLiquidationStrategyChanged(event);
        expect(component.underlyingLiquiditySettings.liquidationStrategy).toBe('ascendingCost');
    });

    it('Test onLiquidationConstraintChanged', () => {
        // If event is null then it will return
        expect(component.onLiquidationConstraintChanged(null)).toBeUndefined();

        const event = {detail: {value: {eventData: 'maxTCost'}}} as CustomEvent;
        component.onLiquidationConstraintChanged(event);
        expect(component.underlyingLiquiditySettings.liquidationConstraint).toBe('maxTCost');
    });

    it('Test onLiquidationConstraintValueChanged', () => {
        // If event is null then it will return
        expect(component.onLiquidationConstraintValueChanged(null, 1)).toBeUndefined();

        // For percentNavLiquidated
        let event = {detail: {value: '2'}} as CustomEvent;
        component.onLiquidationConstraintValueChanged(event, 0);
        expect(component.underlyingLiquiditySettings.percentNavLiquidated).toBe(2);

        // For MaxTransactionCost
        event = {detail: {value: '3'}} as CustomEvent;
        component.onLiquidationConstraintValueChanged(event, 1);
        expect(component.underlyingLiquiditySettings.maxTransactionCost).toBe(3);

        // For MaxMarketImpact
        event = {detail: {value: '4'}} as CustomEvent;
        component.onLiquidationConstraintValueChanged(event, 2);
        expect(component.underlyingLiquiditySettings.maxMarketImpact).toBe(4);

        // For MAxRatio
        event = {detail: {value: '0.3'}} as CustomEvent;
        component.onLiquidationConstraintValueChanged(event, 3);
        expect(component.underlyingLiquiditySettings.maxRatio).toBe(0.3);
    });
});
