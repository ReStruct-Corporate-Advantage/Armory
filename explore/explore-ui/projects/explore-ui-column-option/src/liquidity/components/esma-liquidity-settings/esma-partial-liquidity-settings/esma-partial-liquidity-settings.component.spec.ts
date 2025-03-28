import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Subject} from 'rxjs';
import {EsmaPartialLiquiditySettingsComponent} from './esma-partial-liquidity-settings.component';
import {PartialLiquiditySettings} from '../../../models/partial-liquidity-settings.model';
import {ExploreSelectOption} from '@blk/explore-ui-core';

describe('ESMAPartialLiquiditySettingsComponent test', () => {
    let component: EsmaPartialLiquiditySettingsComponent;
    let fixture: ComponentFixture<EsmaPartialLiquiditySettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [EsmaPartialLiquiditySettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(EsmaPartialLiquiditySettingsComponent);
        component = fixture.componentInstance;

        component.optionAttributes = new Map<string, boolean>();
        component.optionAttributes.set('LIQUIDATION_SETTINGS', true);
        component.optionAttributes.set('MODIFIED_LIQUIDATION_STRATEGIES_ONLY', false);

        component.underlyingLiquiditySettings = new PartialLiquiditySettings();
        component.underlyingLiquiditySettings.initialize(component.optionAttributes);
        component.liquidityStrategy$ = new Subject<string>();

        fixture.detectChanges();
    });

    it('Test component got initialized', () => {
        component.optionAttributes.set('DISABLE_BUCKET_OPTIONS', true);
        component.ngOnInit();
        expect(component).toBeDefined();
        expect(component.disableBucketOptions).toBeTruthy();
    });

    it('Test component got initialized with waterfall strategy', () => {
        component.optionAttributes.set('SHOW_WATERFALL_STRATEGIES_ONLY', true);
        component.ngOnInit();
        expect(component).toBeDefined();
        expect(component.liquidationStrategyOptions[0].values.length).toBe(2);
    });


    it('Test component got initialized with bucket options disabled', () => {
        component.ngOnInit();
        expect(component).toBeDefined();
        expect(component.liquidationStrategyOptions[0].values.length).toBe(4);
        expect(component.underlyingLiquiditySettings.liquidationStrategy).toBe('waterfall');
    });

    it('Test onPercentNavLiquidatedChanged', () => {
        expect(component.onPercentNavLiquidatedChanged(null)).toBeUndefined();
        const event = {detail: {value: '3'}} as CustomEvent;
        component.onPercentNavLiquidatedChanged(event);
        expect(component.underlyingLiquiditySettings.percentNavLiquidated).toBe(3);
    });

    it('Test onLiquidatedStrategyChanged', () => {
        expect(component.onLiquidatedStrategyChanged(null)).toBeUndefined();
        const event = {detail: {value: {value: 'Selection Value'} as ExploreSelectOption}} as CustomEvent;
        component.onLiquidatedStrategyChanged(event);
        expect(component.underlyingLiquiditySettings.liquidationStrategy).toBe('Selection Value');
    });

    it('Test onLiquidationBucketMethChanged', () => {
        expect(component.onLiquidationBucketMethChanged(null)).toBeUndefined();
        const event = {detail: {value: {eventData: 'Dummy LiquidationBeth String'}}} as CustomEvent;
        component.onLiquidationBucketMethChanged(event);
        expect(component.underlyingLiquiditySettings.liquidationBucketMeth).toBe('Dummy LiquidationBeth String');
    });
});
