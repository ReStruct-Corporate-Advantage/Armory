import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ScheduleSettingsComponent} from './schedule-settings.component';
import {FormsModule} from '@angular/forms';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {DailySchedule, EndPeriod, ExportHubJob, ExportHubJobSchedule, Frequency, Month, MonthlySchedule, WeekDay, WeekDayOccurrence, WeeklySchedule, YearlySchedule} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {ExportHubUtils} from '../../../utils/export-hub.utils';
import {CalendarDateUtils} from '../../../../../../../projects/explore-ui-core/src/date/utils';
import {TIME_FORMAT} from '../../../constants/export-hub.constants';
import moment from 'moment';

describe('ScheduleSettingsComponent', () => {
    let component: ScheduleSettingsComponent;
    let fixture: ComponentFixture<ScheduleSettingsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ScheduleSettingsComponent],
            imports: [FormsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ScheduleSettingsComponent);
        component = fixture.componentInstance;
        component.exportHubJob = new ExportHubJob();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize job settings with default values', () => {
        component.scheduleSettings.setJobEndDate(ExportHubUtils.convertToProtobufDate('12/31/2023'));
        component.scheduleSettings.setJobTime(ExportHubUtils.convertToProtobufTimestamp('10:00'));
        component.ngOnInit();
        expect(component.scheduleSettings.getJobFrequency()).toBe(Frequency.FREQUENCY_ONCE);
        expect(component.scheduleSettings.getJobEndPeriod()).toBe(EndPeriod.END_PERIOD_ON_THIS_DAY);
    });

    it('should change frequency', () => {
        const frequencies = [
            Frequency.FREQUENCY_ONCE,
            Frequency.FREQUENCY_DAILY,
            Frequency.FREQUENCY_WEEKLY,
            Frequency.FREQUENCY_MONTHLY,
            Frequency.FREQUENCY_YEARLY
        ];

        frequencies.forEach(freq => {
            const event = { value: freq };
            component.frequencyChanged(event);
            expect(component.scheduleSettings.getJobFrequency()).toBe(freq);

            switch (freq) {
                case Frequency.FREQUENCY_ONCE:
                    expect(component.scheduleSettings.getWeekly()).toBeUndefined();
                    expect(component.scheduleSettings.getMonthly()).toBeUndefined();
                    expect(component.scheduleSettings.getYearly()).toBeUndefined();
                    break;
                case Frequency.FREQUENCY_DAILY:
                    expect(component.scheduleSettings.getDaily()).toBeDefined();
                    break;
                case Frequency.FREQUENCY_WEEKLY:
                    expect(component.scheduleSettings.getWeekly()).toBeDefined();
                    break;
                case Frequency.FREQUENCY_MONTHLY:
                    expect(component.scheduleSettings.getMonthly()).toBeDefined();
                    expect(component.scheduleSettings.getMonthly().getMonthInterval()).toBe(1);
                    break;
                case Frequency.FREQUENCY_YEARLY:
                    expect(component.scheduleSettings.getYearly()).toBeDefined();
                    expect(component.scheduleSettings.getYearly().getMonth()).toBe(Month.MONTH_JANUARY);
                    break;
            }
        });
    });

    it('should change every value for weekly frequency', () => {
        component.scheduleSettings.setWeekly(new WeeklySchedule());
        const event = { detail: { value: [{ label: 'Monday', checked: true }, { label: 'Wednesday', checked: true }, { label: 'Friday', checked: false }] } };
        component.everyChangedWeekly(event);
        expect(component.scheduleSettings.getWeekly().getWeekDaysList()).toEqual([WeekDay.WEEK_DAY_MONDAY, WeekDay.WEEK_DAY_WEDNESDAY]);
    });

    it('should change every value for monthly frequency', () => {
        component.scheduleSettings.setMonthly(new MonthlySchedule());
        const event = { value: '2'  };
        component.onMonthlyIntervalChanged(event);
        expect(component.scheduleSettings.getMonthly().getMonthInterval()).toBe('2');
    });

    it('should change every value for yearly frequency', () => {
        component.scheduleSettings.setYearly(new YearlySchedule());
        const event = { detail: { value: { value: 'JANUARY' } } };
        component.everyChangedYearly(event);
        expect(component.scheduleSettings.getYearly().getMonth()).toBe('JANUARY');
    });

    it('should change every value for daily frequency', () => {
        component.scheduleSettings.setDaily(new DailySchedule());
        const event = { value: '2'  };
        component.onDailyIntervalChanged(event);
        expect(component.scheduleSettings.getDaily().getDayInterval()).toBe('2');
    });


    it('should change start time', () => {
        // Scenario 1: Valid start date provided
        let event = { detail: { value: '01/01/2024' } };
        component.startDateChanged(event);
        expect(component.scheduleSettings.getJobStartDate().getYear()).toBe(2024);
        expect(component.scheduleSettings.getJobStartDate().getMonth()).toBe(1);
        expect(component.scheduleSettings.getJobStartDate().getDay()).toBe(1);

        // Scenario 2: No start date provided
        component.scheduleSettings.setJobStartDate(undefined);
        event = { detail: {} } as any;
        component.startDateChanged(event);
        expect(component.scheduleSettings.getJobStartDate()).toBeNull();

        // Scenario 3: End date is set and is before the start date
        component.scheduleSettings.setJobEndDate(ExportHubUtils.convertToProtobufDate('12/31/2023'));
        event = { detail: { value: '01/01/2024' } };
        component['startDatePicker'].isValid = true;
        component.startDateChanged(event);
        expect(component.scheduleSettings.getJobEndDate().getYear()).toBe(2024);
        expect(component.scheduleSettings.getJobEndDate().getMonth()).toBe(1);
        expect(component.scheduleSettings.getJobEndDate().getDay()).toBe(1);

        // Scenario 4: End date is set and is after the start date
        component.scheduleSettings.setJobEndDate(ExportHubUtils.convertToProtobufDate('01/02/2024'));
        event = { detail: { value: '01/01/2024' } };
        component.startDateChanged(event);
        expect(component.scheduleSettings.getJobEndDate().getYear()).toBe(2024);
        expect(component.scheduleSettings.getJobEndDate().getMonth()).toBe(1);
        expect(component.scheduleSettings.getJobEndDate().getDay()).toBe(2);
    });

    it('should change end date', () => {
        // Scenario 1: Valid end date provided
        let event = { detail: { value: '12/31/2023' } };
        component.endDateChanged(event);
        expect(component.scheduleSettings.getJobEndDate().getYear()).toBe(2023);
        expect(component.scheduleSettings.getJobEndDate().getMonth()).toBe(12);
        expect(component.scheduleSettings.getJobEndDate().getDay()).toBe(31);

        // Scenario 2: No end date provided
        component.scheduleSettings.setJobEndDate(undefined);
        event = { detail: {} } as any;
        component.endDateChanged(event);
        expect(component.scheduleSettings.getJobEndDate()).toBeUndefined();
    });

    it('should change end period', () => {
        const event = { value: EndPeriod.END_PERIOD_AFTER_N_OCCURRENCES };
        component.endPeriodChanged(event);
        expect(component.scheduleSettings.getJobEndPeriod()).toBe(EndPeriod.END_PERIOD_AFTER_N_OCCURRENCES);
    });

    it('should change end period to never', () => {
        const event = { value: EndPeriod.END_PERIOD_NEVER };
        component.endPeriodChanged(event);
        expect(component.scheduleSettings.getJobEndPeriod()).toBe(EndPeriod.END_PERIOD_NEVER);
        expect(component.endDate).toBeUndefined();
        expect(component.scheduleSettings.getJobEndDate()).toBeUndefined();
    });

    it('should change end period to on this day', () => {
        const event = { value: EndPeriod.END_PERIOD_ON_THIS_DAY };
        component.startDate = CalendarDateUtils.getTodayDate();
        component.endPeriodChanged(event);
        expect(component.scheduleSettings.getJobEndPeriod()).toBe(EndPeriod.END_PERIOD_ON_THIS_DAY);
        expect(component.endDate).toBe(component.getEndDate(component.startDate));
        expect(component.scheduleSettings.getJobEndDate()).toEqual(ExportHubUtils.convertToProtobufDate(component.endDate));
    });

    it('should change time', () => {
        const event = { detail: { value: '10:00' } };
        component.timeChanged(event);
        expect(component.scheduleSettings.getJobTime()).toBe('10:00');
    });

    it('should change time zone', () => {
        const event = { displayValue: 'UTC', value: 'UTC' };
        component.timeZoneChanged(event);
        expect(component.scheduleSettings.getJobTimeZone()).toBe('UTC');
    });

    it('should change on the radio option', () => {
        // Scenario 1: Radio option is checked and schedule is monthly
        component.scheduleSettings.setMonthly(new MonthlySchedule());
        component.previousDaysOption = 5;
        component.onTheRadioChanged(true);
        expect(component.onTheRadioChecked).toBeTruthy();
        expect(component.scheduleSettings.getMonthly().getMonthDay()).toBe(5);
        expect(component.scheduleSettings.getMonthly().getWeekDay()).toBe(0);
        expect(component.scheduleSettings.getMonthly().getWeekDayOccurrence()).toBe(0);

        // Scenario 2: Radio option is unchecked and schedule is monthly
        component.previousFrequencyDayOption = WeekDay.WEEK_DAY_FRIDAY;
        component.previousFrequencyOption = WeekDayOccurrence.WEEK_DAY_OCCURRENCE_LAST;
        component.onTheRadioChanged(false);
        expect(component.onTheRadioChecked).toBeFalsy();
        expect(component.scheduleSettings.getMonthly().getMonthDay()).toBe(0);
        expect(component.scheduleSettings.getMonthly().getWeekDay()).toBe(WeekDay.WEEK_DAY_FRIDAY);
        expect(component.scheduleSettings.getMonthly().getWeekDayOccurrence()).toBe(WeekDayOccurrence.WEEK_DAY_OCCURRENCE_LAST);

        // Scenario 3: Radio option is checked and schedule is yearly
        component.scheduleSettings.setYearly(new YearlySchedule());
        component.previousDaysOption = 10;
        component.onTheRadioChanged(true);
        expect(component.onTheRadioChecked).toBeTruthy();
        expect(component.scheduleSettings.getYearly().getMonthDay()).toBe(10);
        expect(component.scheduleSettings.getYearly().getWeekDay()).toBe(0);
        expect(component.scheduleSettings.getYearly().getWeekDayOccurrence()).toBe(0);

        // Scenario 4: Radio option is unchecked and schedule is yearly
        component.previousFrequencyDayOption = WeekDay.WEEK_DAY_MONDAY;
        component.previousFrequencyOption = WeekDayOccurrence.WEEK_DAY_OCCURRENCE_FIRST;
        component.onTheRadioChanged(false);
        expect(component.onTheRadioChecked).toBeFalsy();
        expect(component.scheduleSettings.getYearly().getMonthDay()).toBe(0);
        expect(component.scheduleSettings.getYearly().getWeekDay()).toBe(WeekDay.WEEK_DAY_MONDAY);
        expect(component.scheduleSettings.getYearly().getWeekDayOccurrence()).toBe(WeekDayOccurrence.WEEK_DAY_OCCURRENCE_FIRST);
    });

    it('should change on the frequency option', () => {
        const event = { value: WeekDayOccurrence.WEEK_DAY_OCCURRENCE_LAST };
        component.onTheRadioChecked = false;
        component.scheduleSettings.setMonthly(new MonthlySchedule());
        component.onTheFrequencyOptionChanged(event);
        expect(component.scheduleSettings.getMonthly().getWeekDayOccurrence()).toBe( WeekDayOccurrence.WEEK_DAY_OCCURRENCE_LAST);
    });

    it('should change on the frequency days option', () => {
        const event = { value: WeekDay.WEEK_DAY_MONDAY };
        component.onTheRadioChecked = false;
        component.scheduleSettings.setMonthly(new MonthlySchedule());
        component.onTheFrequencyDaysOptionChanged(event);
        expect(component.scheduleSettings.getMonthly().getWeekDay()).toBe(WeekDay.WEEK_DAY_MONDAY);
    });

    it('should set previousDaysOption when onTheRadioChecked is false', () => {
        component.onTheRadioChecked = false;
        const event = { value: 15 };
        component.onTheDaysOptionSelected(event);
        expect(component.previousDaysOption).toBe(15);
    });

    it('should set month day for monthly schedule when onTheRadioChecked is true', () => {
        component.onTheRadioChecked = true;
        component.scheduleSettings.setMonthly(new MonthlySchedule());
        const event = { value: 10 };
        component.onTheDaysOptionSelected(event);
        expect(component.scheduleSettings.getMonthly().getMonthDay()).toBe(10);
    });

    it('should set month day for yearly schedule when onTheRadioChecked is true', () => {
        component.onTheRadioChecked = true;
        component.scheduleSettings.setYearly(new YearlySchedule());
        const event = { value: 20 };
        component.onTheDaysOptionSelected(event);
        expect(component.scheduleSettings.getYearly().getMonthDay()).toBe(20);
    });


    it('should change end after stepper value', () => {
        const event = { detail: { value: 5 } };
        component.endAfterStepperChanged(event);
        expect(component.scheduleSettings.getJobEndOccurrence()).toBe(5);
    });

    it('should set previousDaysOption when onTheRadioChecked is false', () => {
        component.onTheRadioChecked = false;
        const event = { value: 15 };
        component.onTheDaysOptionSelected(event);
        expect(component.previousDaysOption).toBe(15);
    });

    it('should set month day for monthly schedule when onTheRadioChecked is true', () => {
        component.onTheRadioChecked = true;
        component.scheduleSettings.setMonthly(new MonthlySchedule());
        const event = { value: 10 };
        component.onTheDaysOptionSelected(event);
        expect(component.scheduleSettings.getMonthly().getMonthDay()).toBe(10);
    });

    it('should set month day for yearly schedule when onTheRadioChecked is true', () => {
        component.onTheRadioChecked = true;
        component.scheduleSettings.setYearly(new YearlySchedule());
        const event = { value: 20 };
        component.onTheDaysOptionSelected(event);
        expect(component.scheduleSettings.getYearly().getMonthDay()).toBe(20);
    });


    it('should handle raw time change correctly', () => {
        component.scheduleSettings = new ExportHubJobSchedule();
        const event = { detail: { value: '' } };
        component.rawTimeChanged(event);
        expect(component.time).toBe('');
        expect(component.scheduleSettings.getJobTime()).toBe('');
    });

    it('should validate fields correctly', () => {

        component.timeEntry = {
            validate: () => {},
            isValid: true
        };
        component.startDatePicker = {
            isValid: true
        };

        component.endDatePicker = {
            isValid: true
        };

        expect(component['validateFields']()).toBeTruthy();

        component.timeEntry.isValid = false;
        expect(component['validateFields']()).toBeFalsy();

        component.timeEntry.isValid = true;
        component.startDatePicker.isValid = false;
        expect(component['validateFields']()).toBeFalsy();

        component.startDatePicker.isValid = true;
        component.endDatePicker.isValid = false;
        expect(component['validateFields']()).toBeFalsy();
    });

    it('should validate that time is not empty or null', () => {
        const validator = component.timeValidator[0];
        expect(validator.validate('10:00')).toBe(true);
        expect(validator.validate('')).toBe(false);
        expect(validator.validate(null)).toBe(false);
    });

    it('should validate that time is not before the current time if start date is today', () => {
        const validator = component.timeValidator[1];
        Date.now = jest.fn(() => new Date('2025-01-01T12:33:37.000Z').getTime());
        component.startDate = CalendarDateUtils.getTodayDate();
        const currentTime = moment().format(TIME_FORMAT);
        const validTime = moment(currentTime, TIME_FORMAT).add(1, 'hour').format(TIME_FORMAT);
        const invalidTime = moment(currentTime, TIME_FORMAT).subtract(1, 'hour').format(TIME_FORMAT);

        expect(validator.validate(validTime)).toBe(true);
        expect(validator.validate(invalidTime)).toBe(false);
    });

    it('should validate that time is valid if start date is not today', () => {
        const validator = component.timeValidator[1];
        component.startDate = '01/01/2024';
        expect(validator.validate('10:00')).toBe(true);
        expect(validator.validate('09:00')).toBe(true);
    });
});
