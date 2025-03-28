import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {HorizonLiquiditySettingsComponent} from './horizon-liquidity-settings.component';
import {HorizonLiquiditySettings} from '../../models/horizon-liquidity-settings/horizon-liquidity-settings.model';
import {LiquidityHorizonCalendarDay} from '../../enums/liquidity-horizon-calendar-day.enum';
import {TimeHorizonLiquiditySettings} from '../../models/horizon-liquidity-settings/time-horizon-liquidity-settings.model';

describe('HorizonLiquiditySettingsComponent test', () => {
    let component: HorizonLiquiditySettingsComponent;
    let fixture: ComponentFixture<HorizonLiquiditySettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HorizonLiquiditySettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(HorizonLiquiditySettingsComponent);

        component = fixture.componentInstance;

        component.optionAttributes = new Map<string, boolean>();
        component.optionAttributes.set('HORIZON_OPTIONS', true);

        component.underlyingLiquiditySettings = new HorizonLiquiditySettings();
        component.underlyingLiquiditySettings.initialize({});

        fixture.detectChanges();
    });

    it('Test component got initialized', () => {
        component.ngOnInit();
        expect(component).toBeDefined();
        expect(component.calendarDaysOptions.length).toBe(2);
        expect(component.isShowMinDaysTimeHorizonOption).toBeFalsy();
    });

    it('Test onCalendarDayChanged', () => {
        expect(component.onCalendarDayChanged(null)).toBeUndefined();

        const event = {detail: {value: {eventData: 1}}} as CustomEvent;
        component.onCalendarDayChanged(event);

        expect(component.underlyingLiquiditySettings.calendarDays).toBe(1);
        expect(component.underlyingLiquiditySettings.timeHorizons).toStrictEqual(LiquidityHorizonCalendarDay.getDiscreteTimeHorizon());
    });

    it('Test onMinDaysChanged', () => {
        const timeHorizon: TimeHorizonLiquiditySettings = new TimeHorizonLiquiditySettings(2, 5);
        expect(timeHorizon.title).toBe('2-5 days');

        const event = {detail: {value: '3'}} as CustomEvent;
        component.onMinDaysChanged(event, timeHorizon);
        expect(timeHorizon.title).toBe('3-5 days');
    });

    it('Test onMaxDaysChanged', () => {
        const timeHorizon: TimeHorizonLiquiditySettings = new TimeHorizonLiquiditySettings(2, 5);
        expect(timeHorizon.title).toBe('2-5 days');

        const event = {detail: {value: '7'}} as CustomEvent;
        component.onMaxDaysChanged(event, timeHorizon);
        expect(timeHorizon.title).toBe('2-7 days');
    });

    it('Test deleteSelectedTimeHorizon', () => {
        component.underlyingLiquiditySettings.timeHorizons = LiquidityHorizonCalendarDay.getDiscreteTimeHorizon();
        expect(component.underlyingLiquiditySettings.timeHorizons.length).toBe(13);

        component.deleteSelectedTimeHorizon(1);
        expect(component.underlyingLiquiditySettings.timeHorizons.length).toBe(12);
    });

    it('Test addTimeHorizon', () => {
        component.underlyingLiquiditySettings.timeHorizons = LiquidityHorizonCalendarDay.getDiscreteTimeHorizon();
        expect(component.underlyingLiquiditySettings.timeHorizons.length).toBe(13);
        component.addTimeHorizon();
        expect(component.underlyingLiquiditySettings.timeHorizons.length).toBe(14);
    });

    it('Test onTimeHorizonTitleChanged', () => {
        const timeHorizon: TimeHorizonLiquiditySettings = new TimeHorizonLiquiditySettings(2, 4);

        const event = {detail: {value: 'User Specific'}} as CustomEvent;
        component.onTimeHorizonTitleChanged(event, timeHorizon);
        expect(timeHorizon.title).toBe('User Specific');
    });
});
