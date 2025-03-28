import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {AdvancedLiquiditySettingsModalComponent} from './advanced-liquidity-settings-modal.component';
import {AdvancedLiquiditySettings} from '../../models/advanced-liquidity-settings.model';
import {ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';

describe('AdvancedLiquiditySettingsModalComponent test', () => {
    let component: AdvancedLiquiditySettingsModalComponent;
    let fixture: ComponentFixture<AdvancedLiquiditySettingsModalComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AdvancedLiquiditySettingsModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(AdvancedLiquiditySettingsModalComponent);
        component = fixture.componentInstance;

        component.optionAttributes = new Map<string, boolean>();
        component.optionAttributes.set('MODEL_SELECTION_SETTINGS', true);

        component.underlyingLiquiditySettings = new AdvancedLiquiditySettings();

        component.underlyingLiquiditySettings.initialize(component.optionAttributes);

        component.assetClassModelMapping = [
            {'value': 'Corporate Bond', 'text': 'Unconditional v1.0:CORP20EU'}, {'value': 'Equities', 'text': 'Conditional v2.0:BRSEQ20'},
            {'value': 'Equities', 'text': 'Abstract Model:BRSEQ20T'}, {'value': 'Corporate Bond', 'text': 'Conditional v1.0:CORP20EC'}
        ];

        fixture.detectChanges();
    });

    it('Test component got initialized', () => {
        expect(component).toBeDefined();
        expect(component.isShowModelSelectionSettings).toBeTruthy();

        const models = [new ExploreSelectOptionGroup([
            new ExploreSelectOption('Default', 'Default', true),
            new ExploreSelectOption('Conditional v1.0', 'CORP20EC', false),
            new ExploreSelectOption('Unconditional v1.0', 'CORP20EU', false)
        ])];

       expect(component.assetClassModelGrouping.keys().next().value).toEqual('Corporate Bond');
       expect(component.assetClassModelGrouping.values().next().value).toEqual(models);

    });

    it('Test ngOnInit', () => {
        component.ngOnInit();
        expect(component.assetClassModelMapping).not.toBeUndefined();
        expect(component.modelDescriptionToPurposeMap).not.toBeUndefined();
        expect(component.assetClassModelMapping.length).toBe(4);
        expect(component.assetClassModelMapping[0].text).toEqual('Unconditional v1.0:CORP20EU');
        expect(component.assetClassModelMapping[0].value).toEqual('Corporate Bond');
        expect(component.modelDescriptionToPurposeMap.size).toBe(4);
        expect(component.modelDescriptionToPurposeMap.keys().next().value).toEqual('Unconditional v1.0');
        expect(component.modelDescriptionToPurposeMap.values().next().value).toEqual('CORP20EU');
    });

    it('Test ngOnInit when advancedLiquiditySettings are not defined in case of old favorites', () => {
        component.underlyingLiquiditySettings = undefined;
        component.ngOnInit();
        expect(component.underlyingLiquiditySettings).toBeDefined();
        expect(component.assetClassModelMapping).toBeDefined();
        expect(component.modelDescriptionToPurposeMap).toBeDefined();
    });

    it(' Test onModelSelectionChanged', () => {
       expect(component.underlyingLiquiditySettings.modelSelectionMapping.size).toEqual(0);

       component.onModelSelectionChanged({detail: {value: {value: 'CORP20EC'}}} as CustomEvent, 'Corporate Bond');

        expect(component.underlyingLiquiditySettings.modelSelectionMapping.values().next().value).toEqual('CORP20EC');
        expect(component.underlyingLiquiditySettings.modelSelectionMapping.size).toEqual(1);
    });

    describe('closeModal Test', () => {
        it('should call event emit when apply was clicked', () => {
            jest.spyOn(component.updateAdvancedLiquiditySettingsEvent, 'emit');
            component.closeModal(true);
            expect(component.updateAdvancedLiquiditySettingsEvent.emit).toHaveBeenCalled();
        });
        it('should close modal', () => {
            jest.spyOn(component.modalClosed, 'emit');
            component.closeModal();
            expect(component.isOpen).toBeFalsy();
            expect(component.modalClosed.emit).toHaveBeenCalled();
        });
    });
});
