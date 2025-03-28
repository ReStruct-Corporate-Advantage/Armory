import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {DateValue} from '../../../date/models/date-value/date-value.model';
import {PERFORMANCE_TIME_PERIOD_SETTINGS_SERVICE_TOKEN} from '../../tokens';
import {TimePeriod} from '../../../date/models/time-period/time-period.model';
import {TimePeriodSettingsComponent} from './time-period-settings.component';
import {NOTIFICATION_SERVICE_TOKEN} from '../../../ui/tokens';

describe('TimePeriodSettingsComponent', () => {
    let component: TimePeriodSettingsComponent;
    let fixture: ComponentFixture<TimePeriodSettingsComponent>;
    const observableMock = {
        subscribe: jest.fn(),
        pipe: jest.fn()
    };
    const performanceTimePeriodSettingsServiceMock = {
        getAvailableTypes: jest.fn(),
        getAvailableIntervals: jest.fn(),
        setDatesFromTimePeriod$: jest.fn(() => observableMock),
        populateTimePeriodFromValue$: jest.fn(() => of(new TimePeriod('Week to date', 2, 'WTD', undefined, undefined))),
        getCalCode: jest.fn(),
        modifyTimePeriod$: jest.fn(() => of(new TimePeriod('Week to date', 2, 'WTD', undefined, undefined))),
        getIntervalsByType: jest.fn()
    };
    const notificationServiceStub = {
        warning: jest.fn(),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TimePeriodSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: PERFORMANCE_TIME_PERIOD_SETTINGS_SERVICE_TOKEN, useValue: performanceTimePeriodSettingsServiceMock},
                {provide: NOTIFICATION_SERVICE_TOKEN, useValue: notificationServiceStub},
            ]
        });

        fixture = TestBed.createComponent(TimePeriodSettingsComponent);
        component = fixture.componentInstance;
        component.timePeriod = new TimePeriod('Week to date', 2, 'WTD', undefined, undefined);
        component.defaultTimePeriod = new TimePeriod('Week to date', 2, 'WTD', undefined, undefined);
        component.defaultTimePeriod.interval = 'WEEK';
        fixture.detectChanges();
        component.ngOnChanges(null);

        jest.spyOn(component.resetTimePeriod, 'emit');
        jest.spyOn(component.timePeriodChange, 'emit');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.timePeriod).toBeDefined();
        expect(component.defaultTimePeriod).toBeDefined();
    });

    it('test period type changed event', () => {
        // Add the required spies.
        jest.spyOn(component, 'settingsChanged');
        const newTypes = ['Fiscal Year', 'Previous Month'];
        performanceTimePeriodSettingsServiceMock.getIntervalsByType.mockReturnValue(newTypes);
        performanceTimePeriodSettingsServiceMock.getAvailableIntervals.mockReturnValue(newTypes);

        // trigger the event.
        const event = new CustomEvent<any>('');
        event.initCustomEvent('', true, true, {value: {displayValue: 'OTHER'}});
        component.onTimePeriodTypeChanged(event);

        // Validate that it caused the event to be triggered.
        expect(component.timePeriod.type).toBe('OTHER');
        expect(component.timePeriod.interval).toBe(newTypes[0]);
        expect(component.settingsChanged).toHaveBeenCalledTimes(1);

        // Make sure the intervals for this was also built.
        expect(component.displayDataForAvailableIntervals[0].values.length).toBe(2);

        // Try firing the event again and the settings should not have been called again.
        component.onTimePeriodTypeChanged(event);
        expect(component.settingsChanged).toHaveBeenCalledTimes(1);
    });

    it('test interval changed event', () => {
        // Add the required spies.
        jest.spyOn(component, 'settingsChanged');

        // trigger the event.
        const event = new CustomEvent<any>('');
        event.initCustomEvent('', true, true, {value: {displayValue: 'QUARTER'}});
        component.onTimePeriodIntervalChanged(event);

        // Validate that it caused the event to be triggered.
        expect(component.timePeriod.interval).toBe('QUARTER');
        expect(component.settingsChanged).toHaveBeenCalledTimes(1);
        expect(component.isSettingChanged).toBeTruthy();

        // Try firing the event again and the settings should not have been called again.
        component.onTimePeriodIntervalChanged(event);
        expect(component.settingsChanged).toHaveBeenCalledTimes(1);

        // Set the previously set value to disable reset to default button
        const event2 = new CustomEvent<any>('');
        event2.initCustomEvent('', true, true, {value: {displayValue: 'WEEK'}});
        component.onTimePeriodIntervalChanged(event2);
        expect(component.isSettingChanged).toBeFalsy();
    });

    it('test number of periods changed event', () => {
        // Add the required spies.
        jest.spyOn(component, 'settingsChanged');

        // trigger the event.
        const event = new CustomEvent<string>('');
        event.initCustomEvent('', true, true, '5');
        component.onNumberOfPeriodsChanged(event as CustomEvent);

        // Validate that it caused the event to be triggered.
        expect(component.isSettingChanged).toBeTruthy();
        expect(component.settingsChanged).toHaveBeenCalledTimes(1);
        expect(performanceTimePeriodSettingsServiceMock.modifyTimePeriod$).toHaveBeenCalled();
    });

    it('test reset event', () => {
        // trigger the event.
        component.reset();

        // Validate that it caused the event to be triggered.
        expect(component.resetTimePeriod.emit).toHaveBeenCalled();
    });

    it('test onDateRangeChange event', () => {
        // trigger the event.
        component.timePeriod = new TimePeriod('Custom', 1, 'CUSTOM');
        component.timePeriod.fromDate = new DateValue({date: '02/25/2016'});
        component.timePeriod.toDate = new DateValue({date: '03/08/2016'});
        component.onDateRangeChange();

        // Validate that it caused the event to be triggered.
        expect(performanceTimePeriodSettingsServiceMock.modifyTimePeriod$).toHaveBeenCalled();
        expect(component.timePeriod.toDateValue).toEqual('03/08/2016');
        expect(component.timePeriod.fromDateValue).toEqual('02/25/2016');
    });

    it('test onDateRangeChange event - when timePeriod has relative date', () => {
        // trigger the event.
        component.timePeriod = new TimePeriod('Custom', 1, 'CUSTOM');
        component.timePeriod.fromDate = new DateValue({dateStringValue: 'T-10'});
        component.timePeriod.toDate = new DateValue({dateStringValue: 'T-2'});
        component.onDateRangeChange();
        expect(component.timePeriod.toDateValue).toEqual('T-2');
        expect(component.timePeriod.fromDateValue).toEqual('T-10');
    });

    it('test onChanges method withiout timeperiod type initialized', () => {
        component.ngOnChanges(component.timePeriod);
        expect(component.isSettingChanged).toBeFalsy();
    });

    it('test onChanges method with timeperiod type, numberofPeriods, toDate and fromDate initialized', () => {
        component.timePeriod.type = 'To Date';
        component.ngOnChanges(component.timePeriod);
        expect(component.isSettingChanged).toBeTruthy();
    });

    it('test onChanges method with just timeperiod type initialized', () => {
        component.timePeriod.type = 'To Date';
        component.timePeriod.numberOfPeriods = undefined;
        component.timePeriod.fromDate = undefined;
        component.timePeriod.toDate = undefined;
        component.ngOnChanges(component.timePeriod);
        expect(component.timePeriod.numberOfPeriods).toBe(1);
        expect(component.timePeriod.toDate).not.toBeUndefined();
        expect(component.timePeriod.fromDate).not.toBeUndefined();
        expect(component.isSettingChanged).toBeTruthy();
    });

    it('test method updateTimePeriodDates when timePeriod.isStartDateSetToPerformDate is true', () => {
        jest.spyOn(component['notificationService'], 'warning');
        component.timePeriod.isStartDateSetToPerformDate = true;
        component.updateTimePeriodDates();
        expect(component['notificationService'].warning).toBeCalled();
    });
});
