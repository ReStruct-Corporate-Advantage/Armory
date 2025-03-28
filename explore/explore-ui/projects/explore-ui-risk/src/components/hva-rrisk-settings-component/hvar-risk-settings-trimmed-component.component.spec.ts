import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CoreDefinitionStore, DateValue} from '@blk/explore-ui-core';
import {
    AuxCheckboxGroupChangedDetailInterface,
    AuxNumericStepperValueChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {HvarRiskSettingsModel} from '../../models/hvar-risk-settings/hvar-risk-settings.model';
import {HvarRiskSettingsTrimmedComponentComponent} from './hvar-risk-settings-trimmed-component.component';

describe('HVaRRiskSettingsTrimmedComponentComponent', () => {
    let component: HvarRiskSettingsTrimmedComponentComponent;
    let fixture: ComponentFixture<HvarRiskSettingsTrimmedComponentComponent>;

    beforeEach(waitForAsync( () => {
        TestBed.configureTestingModule({
            declarations: [ HvarRiskSettingsTrimmedComponentComponent ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        CoreDefinitionStore.tokens['exploreHVarSecScalingEnabled'] = 'Y';
        CoreDefinitionStore.tokens['exploreHvarStrtDt'] = 'T-5Y';
        fixture = TestBed.createComponent(HvarRiskSettingsTrimmedComponentComponent);
        component = fixture.componentInstance;
        const hvarRiskSettingsModel = new HvarRiskSettingsModel();
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


    it('should test onGeneralCheckboxChanged', () => {
        component.onGeneralCheckboxChanged(null);
        expect(component.hvarRiskSettingsModel.fullRevaluation).toBeUndefined();
        expect(component.hvarRiskSettingsModel.includeTimeReturn).toBeUndefined();
        component.onGeneralCheckboxChanged({detail : {value: [{checked: true}, {checked: true}]}} as CustomEvent<AuxCheckboxGroupChangedDetailInterface>);
        expect(component.hvarRiskSettingsModel.fullRevaluation).toEqual(true);
        expect(component.hvarRiskSettingsModel.includeTimeReturn).toEqual(true);
        component.onGeneralCheckboxChanged({detail : {value: [{checked: true}, {checked: true}]}} as CustomEvent<AuxCheckboxGroupChangedDetailInterface>);
    });

    it('should test onHistoricalReturnDecayChanged', () => {
        component.onHistoricalReturnDecayChanged('HalfLife');
        expect(component.hvarRiskSettingsModel.historicalReturnDecay).toBeUndefined();
        expect(component.decayFactor).toEqual(0.95169515);
        expect(component.halfLifeInDays).toEqual(14);
    });

    it('should test onDecayChanged', () => {
        component.halflifeindaysInput = {
            setValue: jest.fn((value: string) => component.halflifeindaysInput.value = value),
            value: '',
            validate: jest.fn()
        } as any;

        component.onDecayChanged({detail: {srcEvent: {target: {value: '0'}}}} as CustomEvent);
        expect(component.decayFactor).toEqual(0.95169515);
        expect(component.halfLifeInDays).toEqual(14);

        component.onDecayChanged({detail: {srcEvent: {target: {value: '1'}}}} as CustomEvent);
        expect(component.decayFactor).toEqual(0.95169515);
        expect(component.halfLifeInDays).toEqual(14);

        component.onDecayChanged({detail: {srcEvent: {target: {value: '-1'}}}} as CustomEvent);
        expect(component.decayFactor).toEqual(0.95169515);
        expect(component.halfLifeInDays).toEqual(14);

        component.onDecayChanged({detail: {srcEvent: {target: {value: '10'}}}} as CustomEvent);
        expect(component.decayFactor).toEqual(0.95169515);
        expect(component.halfLifeInDays).toEqual(14);
    });

    it('should test onHalfLifeChanged', () => {
        component.decayfactorInput = {
            setValue: jest.fn((value: string) => component.decayfactorInput.value = value),
            value: '',
            validate: jest.fn()
        } as any;

        component.onHalfLifeChanged({detail: {srcEvent: {target: {value: '0'}}}} as CustomEvent);
        expect(component.decayFactor).toEqual(0.95169515);
        expect(component.halfLifeInDays).toEqual(14);

        component.onHalfLifeChanged({detail: {srcEvent: {target: {value: '1'}}}} as CustomEvent);
        expect(component.decayFactor).toEqual(0.5);
        expect(component.halfLifeInDays).toEqual(1);

        component.onHalfLifeChanged({detail: {srcEvent: {target: {value: '-1'}}}} as CustomEvent);
        expect(component.decayFactor).toEqual(0.95169515);
        expect(component.halfLifeInDays).toEqual(14);
    });

    it('should test onReturnHorizonChanged', () => {
        component.onReturnHorizonChanged('OneDay');
        expect(component.hvarRiskSettingsModel.returnHorizonSelection).toEqual('OneDay');
        expect(component.returnHorizonSelection).toEqual('OneDay');
    });

    it('should test onNumberOfDaysChanged', () => {
        component.onNumberOfDaysChanged('', null);
        expect(component.hvarRiskSettingsModel.linear).toBeUndefined();
        expect(component.hvarRiskSettingsModel.numberOfDays).toBeUndefined();
        component.onNumberOfDaysChanged('linear', {detail : {value: 100}} as CustomEvent<AuxNumericStepperValueChangedDetailInterface>);
        expect(component.hvarRiskSettingsModel.linear).toEqual(100);
        expect(component.hvarRiskSettingsModel.numberOfDays).toBeUndefined();
        component.onNumberOfDaysChanged('nonlinear', {detail : {value: 200}} as CustomEvent<AuxNumericStepperValueChangedDetailInterface>);
        expect(component.hvarRiskSettingsModel.linear).toEqual(100);
        expect(component.hvarRiskSettingsModel.numberOfDays).toEqual(200);
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

    it('should test factorScalingReset', () => {
        component.hvarRiskSettingsModel.factorScaling = 'test';
        expect(component.hvarRiskSettingsModel.factorScaling).toEqual('test');
        component.factorScalingReset();
        expect(component.hvarRiskSettingsModel.factorScaling).toBeUndefined();
    });
});
