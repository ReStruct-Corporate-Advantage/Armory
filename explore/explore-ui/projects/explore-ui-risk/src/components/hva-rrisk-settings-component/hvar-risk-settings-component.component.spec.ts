import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import { HvarRiskSettingsComponentComponent } from './hvar-risk-settings-component.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CoreDefinitionStore, DateValue} from '@blk/explore-ui-core';
import {
    AuxNumericStepperValueChangedDetailInterface, AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {HvarRiskSettingsModel} from '../../models/hvar-risk-settings/hvar-risk-settings.model';
import { AdvancedHvarRiskSettingsModel } from '../../models/advance-hvar-risk-settings/advanced-hvar-risk-settings.model';

describe('HVaRRiskSettingsComponentComponent', () => {
    let component: HvarRiskSettingsComponentComponent;
    let fixture: ComponentFixture<HvarRiskSettingsComponentComponent>;

    beforeEach(waitForAsync( () => {
        TestBed.configureTestingModule({
            declarations: [ HvarRiskSettingsComponentComponent ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        CoreDefinitionStore.tokens['exploreHVarSecScalingEnabled'] = 'Y';
        CoreDefinitionStore.tokens['exploreHvarStrtDt'] = 'T-5Y';
        fixture = TestBed.createComponent(HvarRiskSettingsComponentComponent);
        component = fixture.componentInstance;
        const hvarRiskSettingsModel = new HvarRiskSettingsModel();
        hvarRiskSettingsModel.advancedHvarRiskSettings = new AdvancedHvarRiskSettingsModel();
        hvarRiskSettingsModel.advancedHvarRiskSettings.holdingPeriod = 50;
        component.hvarRiskSettingsModel = hvarRiskSettingsModel;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        // check for default
        expect(component.dateValueObject.dateString).toBeTruthy();
        expect(component.dateValueObject.dateStringValue).toBe('T-5Y');
    });

    it('should test onNumberOfObservationChange', () => {
        component.onNumberOfObservationChange({detail : {value: 100}} as CustomEvent<AuxNumericStepperValueChangedDetailInterface>);
        expect(component.hvarRiskSettingsModel.numberOfObservations).toEqual(100);
        expect(component.hvarRiskSettingsModel.isNumberOfObservationsSelected).toEqual(true);
    });


    it('should test onNumberOfObservationsOptionChanges', () => {
        component.onNumberOfObservationsOptionChanges('NUMBER_OF_OBSERVATIONS');
        expect(component.isNumberOfObservationsSelected).toEqual(true);
        expect(component.hvarRiskSettingsModel.isNumberOfObservationsSelected).toEqual(true);
    });


    it('should test onStartDateChange', () => {
        component.onStartDateChange(new DateValue({
            date: '05/18/2020',
            calCode: 'GP_HK_STD'
        }));
        expect(component.isNumberOfObservationsSelected).toEqual(false);
        expect(component.hvarRiskSettingsModel.startDate).toEqual(new DateValue({
            date: '05/18/2020',
            calCode: 'GP_HK_STD'
        }));
    });


    it('should test onHistoricalReturnDecayChanged', () => {
        component.onHistoricalReturnDecayChanged('HalfLife');
        expect(component.hvarRiskSettingsModel.historicalReturnDecay).toBeUndefined();
        expect(component.decayFactor).toEqual(0.95169515);
        expect(component.halfLifeInDays).toEqual(14);
    });

    it('should test onFactorScalingSelectionChanged', () => {
        component.onFactorScalingSelectionChanged({
            detail: {
                value: {
                    value: 'test'
                }
            }
        } as CustomEvent);
        expect(component.hvarRiskSettingsModel.factorScaling).toEqual('test');
    });

    describe('onRiskHorizonChange', () => {

        it('Should test for Same as Return Horizon', () => {
            const otherOption = {value: {value: undefined}} as AuxSelectSelectionChangedDetailInterface;
            const event = {detail: otherOption} as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
            component.onRiskHorizonChange(event);
            expect(component.isOtherRiskHorizonSelected).toBeFalsy();
            expect(component.hvarRiskSettingsModel.advancedHvarRiskSettings.holdingPeriod).toBeUndefined();
        });

        it('Should test for Same as Return Horizon with holding period previously assigned', () => {
            const otherOption = {value: {value: undefined}} as AuxSelectSelectionChangedDetailInterface;
            const event = {detail: otherOption} as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
            component.hvarRiskSettingsModel.advancedHvarRiskSettings.holdingPeriod = 10;
            component.onRiskHorizonChange(event);
            expect(component.isOtherRiskHorizonSelected).toBeFalsy();
            expect(component.hvarRiskSettingsModel.advancedHvarRiskSettings.holdingPeriod).toBeUndefined();
        });

        it('Should test for Other', () => {
            const otherOption = {value: {value: -1}} as AuxSelectSelectionChangedDetailInterface;
            const event = {detail: otherOption} as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
            component.onRiskHorizonChange(event);
            expect(component.isOtherRiskHorizonSelected).toBeTruthy();
            expect(component.hvarRiskSettingsModel.advancedHvarRiskSettings.holdingPeriod).toBeUndefined();
        });

        it('Should test for Other with previously undefined holding period', () => {
            const otherOption = {value: {value: -1}} as AuxSelectSelectionChangedDetailInterface;
            const event = {detail: otherOption} as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
            component.hvarRiskSettingsModel.advancedHvarRiskSettings.holdingPeriod = 20;
            component.onRiskHorizonChange(event);
            expect(component.isOtherRiskHorizonSelected).toBeTruthy();
            expect(component.hvarRiskSettingsModel.advancedHvarRiskSettings.holdingPeriod).toBeUndefined();
        });

        it('Should test for 20', () => {
            const otherOption = {value: {value: 20}} as AuxSelectSelectionChangedDetailInterface;
            const event = {detail: otherOption} as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
            component.onRiskHorizonChange(event);
            expect(component.isOtherRiskHorizonSelected).toBeFalsy();
            expect(component.hvarRiskSettingsModel.advancedHvarRiskSettings.holdingPeriod).toBe(20);
        });
    });

    it('onOtherRiskHorizonValueChange', () => {
        const event = {detail: {value: 40}} as CustomEvent<AuxNumericStepperValueChangedDetailInterface>;
        component.onOtherRiskHorizonValueChange(event);
        expect(component.hvarRiskSettingsModel.advancedHvarRiskSettings.holdingPeriod).toBe(40);
    });

    describe('should test onConfidenceIntervalScalingChange', () => {
        it ('undefined confidenceIntervalScaling', () => {
            component.onConfidenceIntervalScalingChange({
                detail: {
                    value: undefined
                }} as CustomEvent<AuxNumericStepperValueChangedDetailInterface>);
            expect(component.hvarRiskSettingsModel.advancedHvarRiskSettings.confidenceIntervalScaling).toBeUndefined();
        });

        it ('numeric confidenceIntervalScaling', () => {
            component.onConfidenceIntervalScalingChange({
                detail: {
                    value: 99
                }} as CustomEvent<AuxNumericStepperValueChangedDetailInterface>);
            expect(component.hvarRiskSettingsModel.advancedHvarRiskSettings.confidenceIntervalScaling).toBe(99);
        });
    });

    describe('Test ngOnInit', () => {
        it('Test undefined advancedHVaRRiskSettings', () => {
            component.ngOnInit();
            expect(component.selectedConfidenceIntervalScaling).toBeUndefined();
        });

        it('Test advancedHVaRRiskSettings confidenceLevelToScale less than confidenceLevelPercentage', () => {
            component.confidenceLevelPercentage = 95;
            component.hvarRiskSettingsModel.advancedHvarRiskSettings = new AdvancedHvarRiskSettingsModel();
            component.hvarRiskSettingsModel.advancedHvarRiskSettings.confidenceIntervalScaling = 90;
            component.ngOnInit();
            expect(component.selectedConfidenceIntervalScaling).toBeUndefined();
        });

        it('Test advancedHVaRRiskSettings confidenceLevelToScale greater than confidenceLevelPercentage', () => {
            component.confidenceLevelPercentage = 95;
            component.hvarRiskSettingsModel.advancedHvarRiskSettings = new AdvancedHvarRiskSettingsModel();
            component.hvarRiskSettingsModel.advancedHvarRiskSettings.confidenceIntervalScaling = 99;
            component.ngOnInit();
            expect(component.selectedConfidenceIntervalScaling).toBe(99);
        });
    });
});
