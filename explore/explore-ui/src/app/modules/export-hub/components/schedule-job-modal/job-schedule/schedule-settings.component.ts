import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {
    AuxCalendarHolidays,
    AuxDatePicker,
    AuxDatePickerDateFormatEnum,
    AuxDatePickerSeparatorsEnum,
    AuxFormValidationType,
    AuxTimeEntry,
    Validator
} from '@blk/aladdin-angular-components';
import {
    END_LABEL_MAP,
    FREQUENCY_LABEL_MAP,
    LABEL_WEEKDAY_MAP,
    MONTH_LABEL_MAP,
    WEEK_DAY_LABEL_MAP,
    WEEK_DAY_OCCURRENCE_LABEL_MAP
} from '../../../enums/frequency.constants';
import {
    CalendarDateUtils,
    DateFormatConstants,
    ExploreCheckbox,
    ExploreSelectOption,
    ExploreSelectOptionGroup
} from '@blk/explore-ui-core';
import {isEmpty, isNil} from 'lodash';
import {DateUtils} from '@utils/date.utils';
import {dateValidator, ExportHubUtils, weekValidator} from '../../../utils/export-hub.utils';
import moment from 'moment';
import {
    DailySchedule,
    EndPeriod,
    ExportHubJob,
    ExportHubJobSchedule,
    Frequency,
    Month,
    MonthlySchedule,
    WeekDay,
    WeekDayMap,
    WeekDayOccurrence,
    WeekDayOccurrenceMap,
    WeeklySchedule,
    YearlySchedule
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {TIME_FORMAT} from '../../../constants/export-hub.constants';
import momentTZ from 'moment-timezone';

@Component({
    selector: 'app-schedule-settings',
    templateUrl: './schedule-settings.component.html',
    styleUrls: ['./schedule-settings.component.scss']
})
/**
 * Component for schedule settings for a job
 */
export class ScheduleSettingsComponent implements OnInit {
    @Input() exportHubJob: ExportHubJob;
    @Input() validatorCallback: any;
    @Output() validatorCallbackChange = new EventEmitter<any>();
    @ViewChild('timeEntry') timeEntry: AuxTimeEntry;
    @ViewChild('startDatePicker') startDatePicker: AuxDatePicker;
    @ViewChild('endDatePicker') endDatePicker: AuxDatePicker;


    protected readonly AuxDatePickerSeparatorsEnum = AuxDatePickerSeparatorsEnum;
    protected readonly AuxDatePickerDateFormatEnum = AuxDatePickerDateFormatEnum;
    protected readonly Frequency = Frequency;
    protected readonly EndPeriod = EndPeriod;
    protected readonly AuxFormValidationType = AuxFormValidationType;



    scheduleSettings: ExportHubJobSchedule;
    minDate: string = CalendarDateUtils.getTodayDate();
    minEndDate: string = CalendarDateUtils.getTodayDate();
    holidays: AuxCalendarHolidays;
    frequencyOptions: ExploreSelectOptionGroup[];
    endDateOptions: ExploreSelectOptionGroup[];
    yearlyOptions: ExploreSelectOptionGroup[];
    timeZoneOptions: ExploreSelectOptionGroup[];
    weeklyOptions: ExploreCheckbox[];
    onTheFrequencyOptions: ExploreSelectOptionGroup[];
    daysOfMonthOptions: ExploreSelectOptionGroup[];
    monthlyIntervalOptions: ExploreSelectOptionGroup[];
    dailyIntervalOptions: ExploreSelectOptionGroup[];
    onTheGenericDaysSelectOptions: ExploreSelectOptionGroup[];
    previousFrequencyOption: WeekDayOccurrenceMap[keyof WeekDayOccurrenceMap] = WeekDayOccurrence.WEEK_DAY_OCCURRENCE_FIRST;
    previousDaysOption = 1;
    previousFrequencyDayOption: WeekDayMap[keyof WeekDayMap] = WeekDay.WEEK_DAY_MONDAY;
    onTheRadioChecked = true;
    dateValidator: Validator[];
    weekValidator: Validator[];
    time: string;
    startDate: string;
    endDate: string;
    selectedTimezone: string;

    // Validate time field
    timeValidator : Validator[] = [{
        validate: (value: string) => {
            return !isNil(value) && !isEmpty((value));
        },
        errorMessage: 'No time set'
    },{
        validate: (value: string) => {
            //If the start date is today and the job frequency is once, then the time should be greater than the current time
            if(this.startDate === CalendarDateUtils.getTodayDate()  && this.scheduleSettings.getJobFrequency() === Frequency.FREQUENCY_ONCE){
                const currentTimeInTimezone = moment().tz(this.selectedTimezone).format(TIME_FORMAT);
                if (moment(value, TIME_FORMAT).isBefore(moment(currentTimeInTimezone, TIME_FORMAT))) {
                    return false;
                }
            }
            return true;
        },
        errorMessage: 'Invalid time entered'
    }];


    ngOnInit(): void {
        this.validatorCallbackChange.emit(this.validateFields.bind(this));
        this.scheduleSettings = this.exportHubJob.getJobSchedulesList()[0];
        if (isNil(this.scheduleSettings)) {
            this.scheduleSettings = new ExportHubJobSchedule();
            this.exportHubJob.addJobSchedules(this.scheduleSettings);
        }
        this.initDefaults();
    }

    /**
     * Initialize the default values
     * @private
     */
    private initDefaults(): void {
        if (!this.scheduleSettings.getJobFrequency() || this.scheduleSettings.getJobFrequency() === Frequency.FREQUENCY_UNSPECIFIED) {
            this.scheduleSettings.setJobFrequency(Frequency.FREQUENCY_ONCE);
        }
        if (!this.scheduleSettings.getJobEndPeriod() || this.scheduleSettings.getJobEndPeriod() === EndPeriod.END_PERIOD_UNSPECIFIED) {
            this.scheduleSettings.setJobEndPeriod(EndPeriod.END_PERIOD_ON_THIS_DAY);
        }

        if ((this.scheduleSettings.getMonthly()?.getWeekDay() && this.scheduleSettings.getMonthly().getWeekDay() !== WeekDay.WEEK_DAY_UNSPECIFIED) || (this.scheduleSettings.getYearly()?.getWeekDay() && this.scheduleSettings.getYearly().getWeekDay() !== WeekDay.WEEK_DAY_UNSPECIFIED)) {
            this.onTheRadioChecked = false;
        }
        if (isNil(this.scheduleSettings.getJobStartDate())) {
            this.startDate = this.minDate;
            const startDateObj = ExportHubUtils.convertToProtobufDate(this.startDate);
            this.scheduleSettings.setJobStartDate(startDateObj);
        }

        this.initSelectOptions();
        this.initTimeOptions();
        // validators
        this.dateValidator = dateValidator;
        this.weekValidator = weekValidator;
    }

    /**
     * Function call when frequency change detected
     */
    frequencyChanged(event: any): void {
        if (!isNil((event.value))) {
            this.scheduleSettings.setJobFrequency(event.value);
            switch (this.scheduleSettings.getJobFrequency()) {
                case Frequency.FREQUENCY_ONCE:
                    this.clearEverySelections();
                    break;
                case Frequency.FREQUENCY_DAILY:
                    this.scheduleSettings.setDaily(new DailySchedule());
                    this.initializeDaily();
                    break;
                case Frequency.FREQUENCY_WEEKLY:
                    this.scheduleSettings.setWeekly(new WeeklySchedule());
                    this.initializeWeekly();
                    break;
                case Frequency.FREQUENCY_MONTHLY:
                    this.scheduleSettings.setMonthly(new MonthlySchedule());
                    this.initializeMonthly();
                    break;
                case Frequency.FREQUENCY_YEARLY:
                    this.scheduleSettings.setYearly(new YearlySchedule());
                    this.initializeYearly();
                    break;
            }
            if (this.scheduleSettings.getJobFrequency() !== Frequency.FREQUENCY_ONCE) {
                this.endDate = this.getEndDate(this.startDate);
                this.scheduleSettings.setJobEndDate(ExportHubUtils.convertToProtobufDate(this.endDate));
            }
        }
        this.validateTimeField();

    }

    private clearEverySelections() {
        this.scheduleSettings.getWeekly()?.clearWeekDaysList();
        this.scheduleSettings.getMonthly()?.setMonthInterval(null);
        this.scheduleSettings.getYearly()?.setMonth(null);
    }

    /**
     * Function call when every change detected for weekly frequency
     */
    everyChangedWeekly(event: any): void {
        this.scheduleSettings.getWeekly().setWeekDaysList(event.detail.value.filter(item => item.checked).map(item => LABEL_WEEKDAY_MAP.get(item.label)));
    }

    /**
     * Function call when monthly interval change detected
     * @param event
     */
    onMonthlyIntervalChanged(event:any) {
        this.scheduleSettings.getMonthly().setMonthInterval(event.value);
    }

    /**
     * Function call when every change detected for yearly frequency
     */
    everyChangedYearly(event: any): void {
        this.scheduleSettings.getYearly().setMonth(event.detail.value.value);
    }


    onDailyIntervalChanged(event:any) {
        this.scheduleSettings.getDaily().setDayInterval(event.value);
    }

    /**
     * Function call when start time change detected
     */
    startDateChanged(event: any): void {
        this.startDate = event.detail.value;
        if (!event.detail.value) {
            this.scheduleSettings.setJobStartDate(null)
            return;
        }
        this.minEndDate = event.detail.value;
        const startDate = ExportHubUtils.convertToProtobufDate(event.detail.value);
        // If the end date is set, and it is before the start date, we set the end date to the start date
        if (this.scheduleSettings.getJobEndDate() && ExportHubUtils.compareProtobufDate(this.scheduleSettings.getJobEndDate(), startDate) && this.startDatePicker.isValid) {
            this.endDate = this.startDate;
            this.scheduleSettings.setJobEndDate(startDate);
        }
        this.scheduleSettings.setJobStartDate(startDate);
        this.validateTimeField()
    }

    /**
     * Function call when end date is changed
     */
    endDateChanged(event: any): void {
        if (!event.detail.value) {
            return;
        }
        this.endDate = event.detail.value;
        this.scheduleSettings.setJobEndDate(ExportHubUtils.convertToProtobufDate(event.detail.value));
    }

    /**
     * Function call when end period is changed
     */
    endPeriodChanged(event: any): void {
        this.scheduleSettings.setJobEndPeriod(event.value);
        if (this.scheduleSettings.getJobEndPeriod() === EndPeriod.END_PERIOD_NEVER) {
            this.endDate = undefined;
            this.scheduleSettings.setJobEndDate(undefined);
        } else if (this.scheduleSettings.getJobEndPeriod() === EndPeriod.END_PERIOD_ON_THIS_DAY) {
            this.endDate = this.getEndDate(this.startDate);
            this.scheduleSettings.setJobEndDate(ExportHubUtils.convertToProtobufDate(this.endDate));
        }
    }

    /**
     * Function call when time change detected
     */
    timeChanged(event: any): void {
        this.time = event.detail.value;
        this.scheduleSettings.setJobTime(this.time);
    }

    /**
     * Function call when every change detected
     */
    timeZoneChanged(event: any): void {
       this.selectedTimezone = event.value;
        this.scheduleSettings.setJobTimeZone(event.value);
        this.validateTimeField();

    }

    /**
     * On the radio option changed trigger
     */
    onTheRadioChanged(event: boolean) {
        if (event) {
            this.onTheRadioChecked = true;
            if (this.scheduleSettings.getMonthly()) {
               //Before switching to on the radio and clearing, save the previous values
                this.previousFrequencyOption = this.scheduleSettings.getMonthly().getWeekDayOccurrence();
                this.previousFrequencyDayOption = this.scheduleSettings.getMonthly().getWeekDay();
                //Clearing field for which radio is checked and set the previous values of fields corresponding to unchecked radio button
                this.scheduleSettings.getMonthly().setMonthDay(this.previousDaysOption);
                this.scheduleSettings.getMonthly().setWeekDay(null);
                this.scheduleSettings.getMonthly().setWeekDayOccurrence(null);
            } else {
                //Before switching to on the radio and clearing, save the previous values
                this.previousFrequencyOption = this.scheduleSettings.getYearly().getWeekDayOccurrence();
                this.previousFrequencyDayOption = this.scheduleSettings.getYearly().getWeekDay();
                //Clearing field for which radio is unchecked and set the previous values of fields corresponding to unchecked radio button
                this.scheduleSettings.getYearly().setMonthDay(this.previousDaysOption);
                this.scheduleSettings.getYearly().setWeekDay(null);
                this.scheduleSettings.getYearly().setWeekDayOccurrence(null);
            }
        } else {
            this.onTheRadioChecked = false;

            if (this.scheduleSettings.getMonthly()) {
                //Before switching to on the radio and clearing, save the previous values
                this.previousDaysOption = this.scheduleSettings.getMonthly().getMonthDay();
                //Clearing field for which radio is unchecked and set the previous values of checked radio button
                this.scheduleSettings.getMonthly().setMonthDay(null);
                this.scheduleSettings.getMonthly().setWeekDay(this.previousFrequencyDayOption);
                this.scheduleSettings.getMonthly().setWeekDayOccurrence(this.previousFrequencyOption);
            } else {
                //Before switching to on the radio and clearing, save the previous values
                this.previousDaysOption = this.scheduleSettings.getYearly().getMonthDay();
                //Clearing field for which radio is unchecked and set the previous values of checked radio button
                this.scheduleSettings.getYearly().setMonthDay(null);
                this.scheduleSettings.getYearly().setWeekDay(this.previousFrequencyDayOption);
                this.scheduleSettings.getYearly().setWeekDayOccurrence(this.previousFrequencyOption);
            }
        }

    }

    /**
     * when On the frequency option change is triggered
     * @param event
     */
    onTheFrequencyOptionChanged(event: any): void {
        if (this.onTheRadioChecked) {
            this.previousFrequencyOption = event.value;
            return;
        }

        if (this.scheduleSettings.getMonthly()) {
            this.scheduleSettings.getMonthly().setWeekDayOccurrence(event.value);
        } else {
            this.scheduleSettings.getYearly().setWeekDayOccurrence(event.value);
        }
    }

    /**
     * when On the frequency days option change is triggered for monthly frequency
     * @param event
     */
    onTheFrequencyDaysOptionChanged(event: any): void {
        if (this.onTheRadioChecked) {
            this.previousFrequencyDayOption = event.value;
            return;
        }

        if (this.scheduleSettings.getMonthly()) {
            this.scheduleSettings.getMonthly().setWeekDay(event.value);
        } else {
            this.scheduleSettings.getYearly().setWeekDay(event.value);
        }
    }

    /**
     * when On the days option change is triggered
     * @param event
     */
    onTheDaysOptionSelected(event : any) {
        if (!this.onTheRadioChecked) {
            this.previousDaysOption = event.value;
            return;
        }

        if (this.scheduleSettings.getMonthly()) {
            this.scheduleSettings.getMonthly().setMonthDay(event.value);
        } else {
            this.scheduleSettings.getYearly().setMonthDay(event.value);
        }
    }


    /**
     * when End After stepper value change is triggered
     * @param event
     */
    endAfterStepperChanged(event: any): void {
        this.scheduleSettings.setJobEndOccurrence(event.detail.value);
    }

    /**
     * Initialize the select options
     * @private
     */
    private initSelectOptions(): void {

        // initialize the frequency options
        this.frequencyOptions = [new ExploreSelectOptionGroup(
            // We are slicing the keys because the first key is UNSPECIFIED
            Object.keys(Frequency).slice(1).map(frequency => new ExploreSelectOption(FREQUENCY_LABEL_MAP.get(Frequency[frequency]), Frequency[frequency], Frequency[frequency] === this.scheduleSettings.getJobFrequency())))
        ];
        // initialize the end date options without unspecified and after n occurences
        this.endDateOptions = [new ExploreSelectOptionGroup(
            Object.keys(EndPeriod).slice(1, -1).map(end => new ExploreSelectOption(END_LABEL_MAP.get(EndPeriod[end]), EndPeriod[end], EndPeriod[end] === this.scheduleSettings.getJobEndPeriod())))
        ];
        // initialize the yearly frequency options
        this.yearlyOptions = [new ExploreSelectOptionGroup(
            Object.keys(Month).slice(1).map(month => new ExploreSelectOption(MONTH_LABEL_MAP.get(Month[month]), Month[month], isNil(this.scheduleSettings.getYearly()?.getMonth()) ? Month[month] === Month.MONTH_JANUARY : Month[month] === this.scheduleSettings.getYearly()?.getMonth())))
        ];

        this.monthlyIntervalOptions = this.generateIntervalOptions(this.scheduleSettings.getMonthly()?.getMonthInterval());

        this.dailyIntervalOptions = this.generateIntervalOptions( this.scheduleSettings.getDaily()?.getDayInterval());

        const isMonthly = this.scheduleSettings.getMonthly() || !this.scheduleSettings.getYearly();
        const scheduleSettings = isMonthly ? this.scheduleSettings.getMonthly() : this.scheduleSettings.getYearly();

        this.initializeFrequencyOptions(scheduleSettings);

        this.weeklyOptions = Object.keys(WeekDay).slice(1).map(day => new ExploreCheckbox(WEEK_DAY_LABEL_MAP.get(WeekDay[day]), isNil(this.scheduleSettings.getWeekly()?.getWeekDaysList()) ? false : this.scheduleSettings.getWeekly()?.getWeekDaysList().includes(WeekDay[day]), false));

    }

    /**
     * Generate the interval options
     * @param intervalValue
     * @private
     */
    private generateIntervalOptions(intervalValue: number): ExploreSelectOptionGroup[] {
        return [new ExploreSelectOptionGroup(
            Array.from({ length: 99 }, (_, i) => new ExploreSelectOption(
                (i + 1).toString(),
                (i + 1),
                (!intervalValue) ? i + 1 === 1 : i + 1 === intervalValue
            ))
        )];
    }

    /**
     * Initialize the frequency options for yearly or monthly
     * @param scheduleSettings
     * @private
     */
    private initializeFrequencyOptions(scheduleSettings: MonthlySchedule | YearlySchedule): void {
        // initialize the frequency options for the 'On the' options
        this.onTheFrequencyOptions = [new ExploreSelectOptionGroup(
            Object.keys(WeekDayOccurrence).slice(1).map(option => new ExploreSelectOption(
                WEEK_DAY_OCCURRENCE_LABEL_MAP.get(WeekDayOccurrence[option]),
                WeekDayOccurrence[option],
                (!scheduleSettings?.getWeekDayOccurrence()) ? WeekDayOccurrence[option] === WeekDayOccurrence.WEEK_DAY_OCCURRENCE_FIRST : WeekDayOccurrence[option] === scheduleSettings?.getWeekDayOccurrence()
            ))
        )];

        this.daysOfMonthOptions = [new ExploreSelectOptionGroup(Array.from({ length: 31 }, (_, i) => new ExploreSelectOption((i + 1).toString(), (i + 1), (!scheduleSettings?.getMonthDay()) ? i + 1 === 1 : i + 1 === scheduleSettings?.getMonthDay())))];

        // initialize the days options for the 'On the' options
        this.onTheGenericDaysSelectOptions = [new ExploreSelectOptionGroup(
            Object.keys(WeekDay).slice(1).map(day => new ExploreSelectOption(
                WEEK_DAY_LABEL_MAP.get(WeekDay[day]),
                WeekDay[day],
                (!scheduleSettings?.getWeekDay()) ? WeekDay[day] === WeekDay.WEEK_DAY_MONDAY : WeekDay[day] === scheduleSettings?.getWeekDay()
            ))
        )];
    }

    /**
     * Initialize the time zone options
     * @private
     */
    private initTimeOptions(): void {
        if (this.scheduleSettings.getJobStartDate()) {
            // We are appending zero to the date because the date picker expects the date in the format mm/dd/yyyy
            this.startDate = ExportHubUtils.convertProtobufDateToString(this.scheduleSettings.getJobStartDate());
        }

        if (this.scheduleSettings.getJobEndDate()) {
            this.endDate = ExportHubUtils.convertProtobufDateToString( this.scheduleSettings.getJobEndDate());
        }




        const defaultTimeZoneOptions = DateUtils.initializeTimeZoneOptions()?.['timeZoneOptions'];
        //Get the current timezone
        const currentTimeZone = momentTZ.tz.guess();
        if (!this.scheduleSettings.getJobTimeZone()) {
            //Set the default timezone to the current timezone
            this.scheduleSettings.setJobTimeZone(currentTimeZone);
            this.selectedTimezone = currentTimeZone;
        }

        if (this.scheduleSettings.getJobTime()) {
            this.time = this.scheduleSettings.getJobTime();
        }else{
            //Set the default time to the current time in current timezone
            this.time = moment().tz(this.selectedTimezone).format(TIME_FORMAT);
            this.scheduleSettings.setJobTime(this.time);
        }

        this.timeZoneOptions = [new ExploreSelectOptionGroup(defaultTimeZoneOptions[0].values.map((option: ExploreSelectOption) => {
            option.isSelected = option.value === this.scheduleSettings.getJobTimeZone();
            if(option.isSelected) {
                this.selectedTimezone = option.value;
            }
            return option;
        }))];
    }

    /**
     * Initialize the daily frequency
     * @private
     */
    private initializeDaily() {
        this.scheduleSettings.getDaily().setDayInterval(1);
    }

    /**
     * Initialize the weekly frequency
     * @private
     */
    private initializeWeekly() {
        this.scheduleSettings.getWeekly().setWeekDaysList([WeekDay.WEEK_DAY_MONDAY]);
        this.initSelectOptions();
    }

    /**
     * Initialize the yearly frequency
     * @private
     */
    private initializeYearly() {
        this.scheduleSettings.getYearly().setMonth(Month.MONTH_JANUARY);

        if (this.onTheRadioChecked) {
            this.scheduleSettings.getYearly().setMonthDay(1);
        } else {
            this.scheduleSettings.getYearly().setWeekDayOccurrence(WeekDayOccurrence.WEEK_DAY_OCCURRENCE_FIRST);
            this.scheduleSettings.getYearly().setWeekDay(WeekDay.WEEK_DAY_MONDAY);
        }
        this.initializeFrequencyOptions(this.scheduleSettings.getYearly());
    }

    /**
     * Initialize the monthly frequency
     * @private
     */
    private initializeMonthly() {
        this.scheduleSettings.getMonthly().setMonthInterval(1);

        if (this.onTheRadioChecked) {
            this.scheduleSettings.getMonthly().setMonthDay(1);
        } else {
            this.scheduleSettings.getMonthly().setWeekDayOccurrence(WeekDayOccurrence.WEEK_DAY_OCCURRENCE_FIRST);
            this.scheduleSettings.getMonthly().setWeekDay(WeekDay.WEEK_DAY_MONDAY);
        }
        this.initializeFrequencyOptions(this.scheduleSettings.getMonthly());
    }


    /**
     * Validate the fields
     * @private
     */
    private validateFields(): boolean {
        let isValid = true;
        if (!isNil(this.timeEntry)) {
            isValid = isValid && this.timeEntry.isValid;
        }
        if (!isNil(this.startDatePicker)) {
            isValid = isValid && this.startDatePicker.isValid;
        }
        if (!isNil(this.endDatePicker)) {
            isValid = isValid && this.endDatePicker.isValid;
        }

        //validate start date, end date and time
        return isValid;
    }

    /**
     * Function call when raw time change detected to cater for clearing of time entry
     * @param $event
     */
    rawTimeChanged($event: any) {
        if ($event.detail.value === '') {
            this.time = '';
            this.scheduleSettings.setJobTime(null);
        }
    }


    /**
     * Convert the start date to end date by adding one day
     * @param startDate
     */
    getEndDate(startDate: string): string {
        // add one more day to the start date
        const date = new Date(startDate);
        date.setDate(date.getDate() + 1);
        return CalendarDateUtils.getDateInFormat(date, DateFormatConstants.MMDDYYYY_SLASH);
    }

    /**
     * Method to explicitly call the time validators
     */
    validateTimeField() {
        //Trigger validation to check if past time has been inputted and some other fields have been changed
        if (!this.timeValidator[1].validate(this.time)) {
            this.timeEntry.isValid = false;
            this.timeEntry.errorMessage = this.timeValidator[1].errorMessage;
            return;
        }

        this.timeEntry.isValid = true;
    }


}
