import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {GeneralLiquiditySettingsComponent} from './general-liquidity-settings.component';
import {GeneralLiquiditySettings} from '../../models/general-liquidity-settings.model';

describe('GeneralLiquiditySettingsComponent test', () => {
    let component: GeneralLiquiditySettingsComponent;
    let fixture: ComponentFixture<GeneralLiquiditySettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GeneralLiquiditySettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(GeneralLiquiditySettingsComponent);
        component = fixture.componentInstance;

        component.optionAttributes = new Map<string, boolean>();
        component.optionAttributes.set('HORIZON', true);
        component.optionAttributes.set('ADV_PARTICIPATION_RATE', false);

        component.underlyingLiquiditySettings = new GeneralLiquiditySettings();
        component.underlyingLiquiditySettings.initialize(component.optionAttributes);

        fixture.detectChanges();
    });

    it('Test component got initialized', () => {
        expect(component).toBeDefined();
        expect(component.isShowAdvanceParticipationRate).toBeFalsy();
        expect(component.isShowHorizonStepper).toBeTruthy();
    });

    it('Test onHorizonChanged', () => {
        // initial value
        expect(component.underlyingLiquiditySettings.horizon).toBe(1);

        // if event is null then it will return
        expect(component.onHorizonChanged(null)).toBeUndefined();

        const event = {detail: {value: '2'}} as CustomEvent;
        component.onHorizonChanged(event);
        expect(component.underlyingLiquiditySettings.horizon).toBe(2);
    });

    it('Test onAdvParticipationRateChanged', () => {
        // initial value
        expect(component.underlyingLiquiditySettings.advParticipationRate).toBe(25);

        // if event is null then it will return
        expect(component.onAdvParticipationRateChanged(null)).toBeUndefined();

        const event = {detail: {value: '27'}} as CustomEvent;
        component.onAdvParticipationRateChanged(event);
        expect(component.underlyingLiquiditySettings.advParticipationRate).toBe(27);
    });

    it('Test onAdvParticipationRateEquityChanged', () => {
        expect(component.underlyingLiquiditySettings.advParticipationRateEquity).toBe(25);

        // if event is null
        component.onAdvParticipationRateEquityChanged(null);
        expect(component.underlyingLiquiditySettings.advParticipationRateEquity).toBe(25);

        // if event value is empty
        let event: CustomEvent = {detail: {value: ''}} as CustomEvent;
        component.onAdvParticipationRateEquityChanged(event);
        expect(component.underlyingLiquiditySettings.advParticipationRateEquity).toBe(0);

        // if event value is changed
        event = {detail: {value: '27'}} as CustomEvent;
        component.onAdvParticipationRateEquityChanged(event);
        expect(component.underlyingLiquiditySettings.advParticipationRateEquity).toBe(27);
    });

    it('Test onAdvParticipationRateOtherChanged', () => {
        expect(component.underlyingLiquiditySettings.advParticipationRateOther).toBe(100);

        // if event is null
        component.onAdvParticipationRateOtherChanged(null);
        expect(component.underlyingLiquiditySettings.advParticipationRateOther).toBe(100);

        // if event value is empty
        let event: CustomEvent = {detail: {value: ''}} as CustomEvent;
        component.onAdvParticipationRateOtherChanged(event);
        expect(component.underlyingLiquiditySettings.advParticipationRateOther).toBe(0);

        // if event value is changed
        event = {detail: {value: '90'}} as CustomEvent;
        component.onAdvParticipationRateOtherChanged(event);
        expect(component.underlyingLiquiditySettings.advParticipationRateOther).toBe(90);
    });
});
