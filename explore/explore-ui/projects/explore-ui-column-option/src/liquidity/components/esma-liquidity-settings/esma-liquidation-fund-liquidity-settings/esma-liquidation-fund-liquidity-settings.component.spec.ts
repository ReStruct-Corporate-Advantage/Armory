import { ComponentFixture, TestBed } from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {EsmaLiquidationFundLiquiditySettingsComponent} from './esma-liquidation-fund-liquidity-settings.component';
import {EsmaLiquidationFundLiquiditySettings} from '../../../models/esma-liquidity-settings/esma-liquidation-fund-liquidity-settings.model';
import {LiquidityColumnOption} from '../../../../models/column-option/liquidity-column-option.model';
import {EsmaLiquidationHeaderLiquiditySettings} from '../../../models/esma-liquidity-settings/esma-liquidation-header-liquidity-settings.model';

describe('EsmaLiquidationFundLiquiditySettingsComponent test', () => {
    let component: EsmaLiquidationFundLiquiditySettingsComponent;
    let fixture: ComponentFixture<EsmaLiquidationFundLiquiditySettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [EsmaLiquidationFundLiquiditySettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(EsmaLiquidationFundLiquiditySettingsComponent);
        component = fixture.componentInstance;

        component.optionAttributes = new Map<string, boolean>();
        component.optionAttributes.set('HAS_FUND_SETTINGS', true);

        component.liquidityColumnOption = new LiquidityColumnOption()
        component.liquidityColumnOption.esmaLiquidationFundLiquiditySettings = new EsmaLiquidationFundLiquiditySettings();

        component.underlyingLiquiditySettings = component.liquidityColumnOption.esmaLiquidationFundLiquiditySettings;

        component.underlyingLiquiditySettings.initialize(component.optionAttributes);


        fixture.detectChanges();
    });

    it('Test component got initialized', () => {
        component.ngOnInit();
        expect(component).toBeDefined();
        expect(component.includeOptions.length).toBe(2);
    });

    it('Test onIncludeOptionsChanged', () => {
        expect(component.onIncludeOptionsChanged(null)).toBeUndefined();
        const event = {detail: {value: {label: 'Settlement period', checked: true}}} as CustomEvent;
        component.onIncludeOptionsChanged(event);
        expect(component.underlyingLiquiditySettings.includeFundSettlementPeriodFlag).toBe(true);
        const event2 = {detail: {value: {label: 'Notice period', checked: true}}} as CustomEvent;
        component.onIncludeOptionsChanged(event2);
        expect(component.underlyingLiquiditySettings.includeFundNoticePeriodFlag).toBe(true);
    });

    it('Test initialization with old favourite without fundSettings and esma header settings', () => {
        //undefined fund Settings because old favourite format
        component.liquidityColumnOption.esmaLiquidationFundLiquiditySettings = undefined;
        component.underlyingLiquiditySettings = component.liquidityColumnOption.esmaLiquidationFundLiquiditySettings;

        component.ngOnInit();

        expect(component.isShowFundSettings).toBeTruthy();

        expect(component.underlyingLiquiditySettings).toBeDefined();
        expect(component.underlyingLiquiditySettings.includeFundSettlementPeriodFlag).toBeUndefined();
    });

    it('Test initialization with old favourite without fundSettings', () => {
        //undefined fund Settings because old favourite format
        component.liquidityColumnOption.esmaLiquidationFundLiquiditySettings = undefined;
        component.underlyingLiquiditySettings = component.liquidityColumnOption.esmaLiquidationFundLiquiditySettings;

        component.liquidityColumnOption.esmaLiquidationHeaderLiquiditySettings = new EsmaLiquidationHeaderLiquiditySettings();
        component.liquidityColumnOption.esmaLiquidationHeaderLiquiditySettings.includeSettlementPeriodFlag = true;

        component.ngOnInit();

        expect(component.isShowFundSettings).toBeTruthy();

        expect(component.underlyingLiquiditySettings).toBeDefined();
        expect(component.underlyingLiquiditySettings.includeFundSettlementPeriodFlag).toBeTruthy();
    });
});
