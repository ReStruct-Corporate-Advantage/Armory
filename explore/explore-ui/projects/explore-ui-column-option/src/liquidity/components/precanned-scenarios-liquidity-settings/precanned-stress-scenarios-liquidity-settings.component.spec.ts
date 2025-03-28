import {
    PrecannedStressScenariosLiquiditySettingsComponent
} from './precanned-stress-scenarios-liquidity-settings.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {
    PrecannedStressScenariosLiquiditySettings
} from '../../models/precanned-stress-scenarios-liquidity-settings.model';
import {LiquidityConstants} from '../../liquidity.constants';
import {AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {GlobalStressMultiplier} from '../../models/global-stress-multiplier';

describe('Test PrecannedStressScenariosLiquiditySettingsComponent', () => {
    let component: PrecannedStressScenariosLiquiditySettingsComponent;
    let fixture: ComponentFixture<PrecannedStressScenariosLiquiditySettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PrecannedStressScenariosLiquiditySettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(PrecannedStressScenariosLiquiditySettingsComponent);
        component = fixture.componentInstance;

        component.optionAttributes = new Map<string, boolean>();

        component.underlyingLiquiditySettings = new PrecannedStressScenariosLiquiditySettings();
        component.underlyingLiquiditySettings.initialize(component.optionAttributes);

        fixture.detectChanges();
    });

    it('Test component got initialized', () => {
        expect(component).toBeDefined();

        component.ngOnInit();

        expect(component.isShowPrecannedScenarioSettings).toBeFalsy();

        expect(component.availablePrecannedStressScenarios.length).toBe(1);
        expect(component.availablePrecannedStressScenarios[0].label).toBe(LiquidityConstants.DEFAULT_ASSET_STRESS_SCENARIO);
        expect(component.availablePrecannedStressScenarios[0].value).toBe(LiquidityConstants.DEFAULT_ASSET_STRESS_SCENARIO);

        expect(component.availableMultiplierTypes.length).toBe(4);
        expect(component.availableMultiplierTypes[0].label).toBe(LiquidityConstants.DEFAULT_STRESS_MULTIPLIER_TYPE);
        expect(component.availableMultiplierTypes[0].value).toBe(LiquidityConstants.DEFAULT_STRESS_MULTIPLIER_TYPE);
        expect(component.availableMultiplierTypes[1].label).toBe(GlobalStressMultiplier.FIXED_COST_MULTIPLIER_LABEL);
        expect(component.availableMultiplierTypes[1].value).toBe(LiquidityConstants.FIXED_COST_MULTIPLIER);
        expect(component.availableMultiplierTypes[2].label).toBe(GlobalStressMultiplier.MARKET_IMPACT_MULTIPLIER_LABEL);
        expect(component.availableMultiplierTypes[2].value).toBe(LiquidityConstants.MARKET_IMPACT_MULTIPLIER);
        expect(component.availableMultiplierTypes[3].label).toBe(GlobalStressMultiplier.MARKET_DEPTH_MULTIPLIER_LABEL);
        expect(component.availableMultiplierTypes[3].value).toBe(LiquidityConstants.MARKET_DEPTH_MULTIPLIER);
    });

    it('Test onPrecannedStressScenarioChanged', () => {
        expect(component.underlyingLiquiditySettings.assetStressScenario).toBeUndefined();
        expect(component.underlyingLiquiditySettings.stressMultiplierType).toBeUndefined();

        const option = ({value : 'ABC'} as any) as AuxSelectOption;
        const event = ({detail: {value: option}} as any) as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
        component.onPrecannedStressScenarioChanged(event);
        expect(component.underlyingLiquiditySettings.assetStressScenario).toBe('ABC');
        expect(component.underlyingLiquiditySettings.stressMultiplierType).toBeUndefined();
    });

    it('Test onMultiplierTypeChanged', () => {
        expect(component.underlyingLiquiditySettings.assetStressScenario).toBeUndefined();
        expect(component.underlyingLiquiditySettings.stressMultiplierType).toBeUndefined();

        const option = ({value : 'XYZ'} as any) as AuxSelectOption;
        const event = ({detail: {value: option}} as any) as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
        component.onMultiplierTypeChanged(event);
        expect(component.underlyingLiquiditySettings.assetStressScenario).toBeUndefined();
        expect(component.underlyingLiquiditySettings.stressMultiplierType).toBe('XYZ');
    });
});
