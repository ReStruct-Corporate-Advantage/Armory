import { ComponentFixture, TestBed } from '@angular/core/testing';
import {CoreDefinitionStore} from '@blk/explore-ui-core';
import {head} from 'lodash';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {AuxSelectOption} from '@blk/aladdin-angular-components';
import {EsmaRedemptionLiquiditySettingsComponent} from './esma-redemption-liquidity-settings.component';
import {EsmaRedemptionLiquiditySettings} from '../../../models/esma-liquidity-settings/esma-redemption-liquidity-settings.model';

describe('ESMARedemptionLiquiditySettingsComponent test', () => {
    let component: EsmaRedemptionLiquiditySettingsComponent;
    let fixture: ComponentFixture<EsmaRedemptionLiquiditySettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [EsmaRedemptionLiquiditySettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(EsmaRedemptionLiquiditySettingsComponent);
        component = fixture.componentInstance;

        component.optionAttributes = new Map<string, boolean>();

        component.underlyingLiquiditySettings = new EsmaRedemptionLiquiditySettings();
        component.underlyingLiquiditySettings.initialize(component.optionAttributes, new Map<string, any>());

        CoreDefinitionStore.investorConcentrationScenarios = [
            {'value': 'TOP1', 'text': 'Top 1 Scenario'}, {'value': 'TOP3', 'text': 'Top 3 Scenarios'},
            {'value': 'TOP1OMNI', 'text': 'Top 1 Omni Scenario'}, {'value': 'TOP3OMNI', 'text': 'Top 3 Omni Scenarios'}
            ];
        CoreDefinitionStore.redemptionScenarios = [
            {'value': 'AVG', 'text': 'Average Redemptions'}, {'value': 'WORST', 'text': 'Worst case Redemptions'}
        ];

        fixture.detectChanges();
    });

    it('Test component got initialized', () => {
        component.ngOnInit();
        expect(component).toBeDefined();
        expect(component.underlyingLiquiditySettings.liabilityType).toBe('redemptionScenarios');
        expect(head(component.redemptionOptions).values.length).toBe(2);
        component.underlyingLiquiditySettings.liabilityType = 'investorData';
        expect(component.underlyingLiquiditySettings.liabilityType).toBe('investorData');
        component.ngOnInit();
        expect(head(component.investorOptions).values.length).toBe(4);
    });

    it('Test onLiabilityTypeChanged', () => {
        expect(component.onLiabilityTypeChanged(null)).toBeUndefined();
        const event = {detail: {value: {value: 'Dummy liability Type'} as AuxSelectOption}} as CustomEvent;
        component.onLiabilityTypeChanged(event);
        expect(component.underlyingLiquiditySettings.liabilityType).toBe('Dummy liability Type');
    });

    it('Test onRedemptionScenarioChanged', () => {
        expect(component.onRedemptionScenarioChanged(null)).toBeUndefined();
        const event = {detail: {value: {value: 'Selection Value'} as AuxSelectOption}} as CustomEvent;
        component.onRedemptionScenarioChanged(event);
        expect(component.underlyingLiquiditySettings.redemptionScenario).toBe('Selection Value');
    });

    it('Test onAdditionalCollateralFlagToggle', () => {
        expect(component.onAdditionalCollateralFlagToggle(null)).toBeUndefined();
        const event = {detail: {value: {checked: true}}} as CustomEvent;
        component.onAdditionalCollateralFlagToggle(event);
        expect(component.underlyingLiquiditySettings.includeAdditionalCollateralFlag).toBeTruthy();
    });
});
