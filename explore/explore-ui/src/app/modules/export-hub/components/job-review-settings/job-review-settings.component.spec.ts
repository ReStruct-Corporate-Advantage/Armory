import {ComponentFixture, TestBed} from '@angular/core/testing';
import {JobReviewSettingsComponent} from './job-review-settings.component';
import {
    DailySchedule,
    EndPeriod,
    ExportHubJob,
    ExportHubJobPortfolio,
    ExportHubJobSchedule,
    ExportHubJobWidget,
    Frequency,
    Month,
    MonthlySchedule,
    WeekDay,
    WeeklySchedule,
    YearlySchedule
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {ScheduleJobSteps} from '../../enums/schedule-job-steps';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {Date} from '@blk/aladdin-graph-everything/google/type/date_pb';
import {Timestamp} from 'google-protobuf/google/protobuf/timestamp_pb';
import {NotificationService} from '@services/notification';
import {JobService} from '../../services/job.service';
import {of, throwError} from 'rxjs';

describe('JobReviewSettingsComponent', () => {
    let component: JobReviewSettingsComponent;
    let fixture: ComponentFixture<JobReviewSettingsComponent>;

    let jobServiceStub: any;
    let notificationServiceStub: any;

    beforeEach(async () => {
        jobServiceStub = {
            runTestJob$: jest.fn()
        };

        notificationServiceStub = {
            success: jest.fn(),
            error: jest.fn()
        };

        await TestBed.configureTestingModule({
            declarations: [JobReviewSettingsComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                {provide: JobService, useValue: jobServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub}
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JobReviewSettingsComponent);
        component = fixture.componentInstance;
        const jobSchedule = new ExportHubJob();
        const scheduleSettings = new ExportHubJobSchedule();
        const startDate = new Date();
        startDate.setYear(2023);
        startDate.setMonth(1);
        startDate.setDay(1);
        scheduleSettings.setJobStartDate(startDate);
        scheduleSettings.setJobFrequency(Frequency.FREQUENCY_DAILY);
        const daily = new DailySchedule();
        daily.setDayInterval(1);
        scheduleSettings.setDaily(daily);

        const timestamp = new Timestamp();
        timestamp.setSeconds(28800);
        scheduleSettings.setJobTime(timestamp);
        scheduleSettings.setJobTimeZone('UTC');
        scheduleSettings.setJobEndPeriod(EndPeriod.END_PERIOD_ON_THIS_DAY);

        const endDate = new Date();
        endDate.setYear(2023);
        endDate.setMonth(12);
        endDate.setDay(31);
        scheduleSettings.setJobEndDate(endDate);

        jobSchedule.setJobSchedulesList([scheduleSettings]);
        component.exportHubJob = jobSchedule;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize noOfPortfolios and noOfWidgets on ngOnInit', () => {

        component.exportHubJob.setJobPortfoliosList([new ExportHubJobPortfolio()]);
        component.exportHubJob.setJobWidgetsList([new ExportHubJobWidget(), new ExportHubJobWidget()]);

        component.ngOnInit();
        expect(component.noOfPortfolios).toBe(1);
        expect(component.noOfWidgets).toBe(2);
    });

    it('should populate scheduleSettingsDisplay correctly', () => {

        component.ngOnInit();
        expect(component.scheduleSettingsDisplay.length).toBeGreaterThan(0);
    });

    it('should populate exportSettingsDisplay correctly', () => {
        component.exportHubJob.setName('Test Job');
        component.exportHubJob.setExportType('pdf');
        component.exportHubJob.setJobDescription('location');
        component.ngOnInit();
        expect(component.exportSettingsDisplay.length).toBeGreaterThan(0);
    });

    it('should emit currentStepEmitter on editButtonClickHandler', () => {
        jest.spyOn(component.currentStepEmitter, 'emit');
        component.editButtonClickHandler(ScheduleJobSteps.SCHEDULE);
        expect(component.currentStepEmitter.emit).toHaveBeenCalledWith(ScheduleJobSteps.SCHEDULE);
    });

    it('should extract every value correctly for daily frequency', () => {
        const scheduleSettings = new ExportHubJobSchedule();
        const every = component.extractEvery(component.exportHubJob.getJobSchedulesList()[0]);
        expect(every.value).toBe('1 day(s)');
    });

    it('should extract every value correctly for weekly frequency', () => {
        const scheduleSettings = component.exportHubJob.getJobSchedulesList()[0];
        scheduleSettings.setJobFrequency(Frequency.FREQUENCY_WEEKLY);
        const weekly = new WeeklySchedule();
        weekly.setWeekDaysList([WeekDay.WEEK_DAY_MONDAY, WeekDay.WEEK_DAY_WEDNESDAY]);
        scheduleSettings.setWeekly(weekly);
        const every = component.extractEvery(scheduleSettings);
        expect(every.value).toBe('Monday, Wednesday');
    });

    it('should extract every value correctly for monthly frequency', () => {
        const scheduleSettings = component.exportHubJob.getJobSchedulesList()[0];
        scheduleSettings.setJobFrequency(Frequency.FREQUENCY_MONTHLY);
        const monthly = new MonthlySchedule();
        monthly.setMonthInterval(1);
        monthly.setMonthDay(15);
        scheduleSettings.setMonthly(monthly);
        const every = component.extractEvery(scheduleSettings);
        expect(every.value).toBe('1 month(s) on the 15 day');
    });

    it('should extract every value correctly for yearly frequency', () => {
        const scheduleSettings = new ExportHubJobSchedule();
        scheduleSettings.setJobFrequency(Frequency.FREQUENCY_YEARLY);
        const yearly = new YearlySchedule();
        yearly.setMonth(1);
        yearly.setMonthDay(Month.MONTH_JANUARY);
        scheduleSettings.setYearly(yearly);
        const every = component.extractEvery(scheduleSettings);
        expect(every.value).toBe('January on the 1 day');
    });

    it('should return empty array for calculateOccurrences', () => {
        const occurrences = component['calculateOccurrences']();
        expect(occurrences).toEqual([]);
    });


    it('should handle successful test job creation', () => {
        jobServiceStub.runTestJob$.mockReturnValue(of(true));

        component.runTestJob();

        expect(notificationServiceStub.success).toHaveBeenCalledWith('Test job successfully ran');
    });

    it('should handle failed test job creation', () => {
        jobServiceStub.runTestJob$.mockReturnValue(of(false));

        component.runTestJob();

        expect(notificationServiceStub.error).toHaveBeenCalledWith('Test job run failed');
    });

    it('should handle error during test job creation', () => {
        jobServiceStub.runTestJob$.mockReturnValue(throwError('error'));

        component.runTestJob();

        expect(notificationServiceStub.error).toHaveBeenCalledWith('Something went wrong while running test job');
    });

});
