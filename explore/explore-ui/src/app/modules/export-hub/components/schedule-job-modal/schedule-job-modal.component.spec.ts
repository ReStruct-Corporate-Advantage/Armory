import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ScheduleJobModalComponent} from './schedule-job-modal.component';
import {ExportHubStore} from '@stores/export-hub.store';
import {ScheduleJobSteps} from '../../enums/schedule-job-steps';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {JobService} from '../../services/job.service';
import {of} from 'rxjs';
import {
    DailySchedule,
    EndPeriod,
    ExportHubJob,
    ExportHubJobPortfolio,
    ExportHubJobSchedule,
    ExportHubJobWidget,
    Frequency,
    MonthlySchedule,
    WeeklySchedule,
    YearlySchedule
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {Date as ProtoDate} from '@blk/aladdin-graph-everything/google/type/date_pb';
import {Timestamp} from 'google-protobuf/google/protobuf/timestamp_pb';
import {JobPortfoliosComponent} from './job-portfolios/job-portfolios.component';
import {NotificationService} from '@services/notification';
import {BUTTON_LABELS} from '../../constants/export-hub.constants';

describe('ScheduleJobModalComponent', () => {
    let component: ScheduleJobModalComponent;
    let fixture: ComponentFixture<ScheduleJobModalComponent>;
    let exportHubStoreMock: jest.Mocked<ExportHubStore>;
    let jobServiceMock: jest.Mocked<JobService>;
    let notificationService : any;

    beforeEach(() => {
        exportHubStoreMock = {
            closeScheduleJobModal: jest.fn(),
            recentlyCreatedJobsMap: new Map()
        } as unknown as jest.Mocked<ExportHubStore>;

        jobServiceMock = {
            scheduleJob$: jest.fn(() => of(true))
        } as unknown as jest.Mocked<JobService>;

        notificationService = {
            error: jest.fn(),
            success: jest.fn()
        }

        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [ScheduleJobModalComponent],
            providers: [
                {provide: ExportHubStore, useValue: exportHubStoreMock},
                {provide: JobService, useValue: jobServiceMock},
                {provide: NotificationService, useValue: notificationService}
            ]
        });
        fixture = TestBed.createComponent(ScheduleJobModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close the modal and call store method on closeScheduleJobModal', () => {
        component.closeScheduleJobModal();
        expect(component.isOpen).toBe(false);
        expect(exportHubStoreMock.closeScheduleJobModal).toHaveBeenCalled();
    });

    it('should move to the next step on nextStep', () => {
        component.currentStep = ScheduleJobSteps.PORTFOLIOS_AND_WIDGETS;
        component.nextStep();
        expect(component.currentStep).toBe(ScheduleJobSteps.PORTFOLIOS_AND_WIDGETS);
        expect(component.jobSchedulingSteps[0].state).toBe('active');
        expect(component.jobSchedulingSteps[1].state).toBe('incomplete');

        // has at least one port and one widget
        component.exportHubJob.setJobPortfoliosList([new ExportHubJobPortfolio()]);
        component.exportHubJob.setJobWidgetsList([new ExportHubJobWidget()]);
        component.jobPortfoliosComponent = {
            validatePortRecordAttributes: () => 'error message'
        } as never;
        component.nextStep();
        expect(component.jobSchedulingSteps[0].state).toBe('active');
        expect(component.jobSchedulingSteps[1].state).toBe('incomplete');

        // change to valid
        component.jobPortfoliosComponent = {
            validatePortRecordAttributes: () => null
        } as never;
        component.nextStep();
        expect(component.jobSchedulingSteps[0].state).toBe('complete');
        expect(component.jobSchedulingSteps[1].state).toBe('active');
    });

    it('should move to the previous step on backStep', () => {
        component.currentStep = ScheduleJobSteps.SCHEDULE;
        component.backStep();
        expect(component.currentStep).toBe(ScheduleJobSteps.PORTFOLIOS_AND_WIDGETS);
        expect(component.jobSchedulingSteps[0].state).toBe('active');
        expect(component.jobSchedulingSteps[1].state).toBe('incomplete');
    });

    it('should not move to the next step if already at the last step', () => {
        component.jobSchedulingSteps[0].state = 'complete';
        component.jobSchedulingSteps[1].state = 'complete';
        component.jobSchedulingSteps[2].state = 'complete';
        component.jobSchedulingSteps[3].state = 'active';
        component.currentStep = ScheduleJobSteps.REVIEW;
        component.nextStep();
        expect(component.currentStep).toBe(ScheduleJobSteps.REVIEW);
    });

    it('should create job when next clicked on review screen', () => {
        component.jobSchedulingSteps[0].state = 'complete';
        component.jobSchedulingSteps[1].state = 'complete';
        component.jobSchedulingSteps[2].state = 'complete';
        component.jobSchedulingSteps[3].state = 'active';
        component.currentStep = ScheduleJobSteps.REVIEW;

        const emitterSpy = jest.spyOn(component.createJobHandler, 'emit');
        component.nextStep();
        expect(component.isOpen).toBe(false);
    });

    it('should create job when next clicked on review screen', () => {
        component.jobSchedulingSteps[0].state = 'complete';
        component.jobSchedulingSteps[1].state = 'complete';
        component.jobSchedulingSteps[2].state = 'active';
        component.currentStep = ScheduleJobSteps.SETTINGS;
       jest.spyOn(component as any, 'isCurrentStepValid').mockReturnValue(true);
        const emitterSpy = jest.spyOn(component.createJobHandler, 'emit');
        component.nextStep();
        expect(component.isOpen).toBe(false);
        expect(component.nextButtonLabel).toBe(BUTTON_LABELS.CREATE_JOB);
    });

    it('should not move to the previous step if already at the first step', () => {
        component.jobSchedulingSteps[0].state = 'active';
        component.jobSchedulingSteps[1].state = 'incomplete';
        component.jobSchedulingSteps[2].state = 'incomplete';
        component.jobSchedulingSteps[3].state = 'incomplete';
        component.backStep();
        expect(component.currentStep).toBe(ScheduleJobSteps.PORTFOLIOS_AND_WIDGETS);
    });

    it('should change current step when emitted from revie screen', () => {
        component.currentStepChangeHandler(ScheduleJobSteps.SCHEDULE);
        expect(component.currentStep).toBe(ScheduleJobSteps.SCHEDULE);
    });

    it('should return false if common values are invalid and frequency is not ONCE', () => {
        const scheduleSettings = new ExportHubJobSchedule();
        scheduleSettings.setJobFrequency(Frequency.FREQUENCY_DAILY);
        expect(component.validateScheduleSettings(scheduleSettings)).toBe(false);
    });

    it('should return false and show error if there are no portfolios or widgets', () => {
        component.exportHubJob = new ExportHubJob();
        expect(component['validateJobPortAndWidgets']()).toBe(false);
        expect(notificationService.error).toHaveBeenCalledWith('Please add at least one Portfolio and one Widget');
    });

    it('should return false and show error if widget names are not unique', () => {
        const widget1 = new ExportHubJobWidget();
        widget1.setTitle('Widget 1');
        const widget2 = new ExportHubJobWidget();
        widget2.setTitle('Widget 1');
        component.exportHubJob.setJobWidgetsList([widget1, widget2]);
        component.exportHubJob.setJobPortfoliosList([new ExportHubJobPortfolio()]);

        expect(component['validateJobPortAndWidgets']()).toBe(false);
        expect(notificationService.error).toHaveBeenCalledWith('The widget names should be unique. Please provide a unique name for each widget.');
    });

    it('should return false and show error if validatePortRecordAttributes returns an error message', () => {
        const widget = new ExportHubJobWidget();
        widget.setTitle('Widget 1');
        component.exportHubJob.setJobWidgetsList([widget]);
        component.exportHubJob.setJobPortfoliosList([new ExportHubJobPortfolio()]);

        component.jobPortfoliosComponent = {
            validatePortRecordAttributes: () => 'error message'
        } as JobPortfoliosComponent;


        expect(component['validateJobPortAndWidgets']()).toBe(false);
        expect(notificationService.error).toHaveBeenCalledWith('error message');
    });

    it('should return true if all validations pass', () => {
        const widget1 = new ExportHubJobWidget();
        widget1.setTitle('Widget 1');
        const widget2 = new ExportHubJobWidget();
        widget2.setTitle('Widget 2');
        component.exportHubJob.setJobWidgetsList([widget1, widget2]);
        component.exportHubJob.setJobPortfoliosList([new ExportHubJobPortfolio()]);

        component.jobPortfoliosComponent = {
            validatePortRecordAttributes: () => null
        } as JobPortfoliosComponent;

        expect(component['validateJobPortAndWidgets']()).toBe(true);
        expect(notificationService.error).not.toHaveBeenCalled();
    });

    describe('validateScheduleSettings', () => {
        let scheduleSettings: ExportHubJobSchedule;
        let protoDate: ProtoDate;
        let jsDate: Date;

        beforeEach(() => {
            scheduleSettings = new ExportHubJobSchedule();
            protoDate = new ProtoDate();
            jsDate = new Date();
            protoDate.setYear(jsDate.getFullYear());
            protoDate.setMonth(jsDate.getMonth() + 1); // Months are 0-based in JS
            protoDate.setDay(jsDate.getDate());
            scheduleSettings.setJobStartDate(protoDate);
            scheduleSettings.setJobTime(new Timestamp().setSeconds(new Date('1970-01-01T10:00:00Z').getTime() / 1000));
            scheduleSettings.setJobTimeZone('UTC');
            scheduleSettings.setJobEndPeriod(EndPeriod.END_PERIOD_NEVER);
        });

        it('should return true if frequency is ONCE and job start date is valid', () => {
            scheduleSettings.setJobFrequency(Frequency.FREQUENCY_ONCE);
            expect(component.validateScheduleSettings(scheduleSettings)).toBe(true);
        });

        it('should return true if frequency is DAILY and day interval is valid', () => {
            scheduleSettings.setJobFrequency(Frequency.FREQUENCY_DAILY);
            const dailySchedule = new DailySchedule();
            dailySchedule.setDayInterval(1);
            scheduleSettings.setDaily(dailySchedule);
            expect(component.validateScheduleSettings(scheduleSettings)).toBe(true);
        });

        it('should return true if frequency is WEEKLY and week days list is valid', () => {
            scheduleSettings.setJobFrequency(Frequency.FREQUENCY_WEEKLY);
            const weeklySchedule = new WeeklySchedule();
            weeklySchedule.setWeekDaysList([1, 2, 3]);
            scheduleSettings.setWeekly(weeklySchedule);
            expect(component.validateScheduleSettings(scheduleSettings)).toBe(true);
        });

        it('should return true if frequency is MONTHLY and month interval and month day are valid', () => {
            scheduleSettings.setJobFrequency(Frequency.FREQUENCY_MONTHLY);
            const monthlySchedule = new MonthlySchedule();
            monthlySchedule.setMonthInterval(1);
            monthlySchedule.setMonthDay(15);
            scheduleSettings.setMonthly(monthlySchedule);
            expect(component.validateScheduleSettings(scheduleSettings)).toBe(true);
        });

        it('should return true if frequency is YEARLY and month and month day are valid', () => {
            scheduleSettings.setJobFrequency(Frequency.FREQUENCY_YEARLY);
            const yearlySchedule = new YearlySchedule();
            yearlySchedule.setMonth(1);
            yearlySchedule.setMonthDay(15);
            scheduleSettings.setYearly(yearlySchedule);
            expect(component.validateScheduleSettings(scheduleSettings)).toBe(true);
        });
    });

    describe('validateExportSettings', () => {
        it('should return true if the job name is not empty', () => {
            const scheduledJob = new ExportHubJob();
            scheduledJob.setName('Test Job');
            expect(component.validateExportSettings(scheduledJob)).toBe(true);
        });

        it('should return false if the job name is empty', () => {
            const scheduledJob = new ExportHubJob();
            scheduledJob.setName('');
            expect(component.validateExportSettings(scheduledJob)).toBe(false);
        });

        it('should return false if the job name is null', () => {
            const scheduledJob = new ExportHubJob();
            scheduledJob.setName(null);
            expect(component.validateExportSettings(scheduledJob)).toBe(false);
        });

        it('should return false if the job name is undefined', () => {
            const scheduledJob = new ExportHubJob();
            scheduledJob.setName(undefined);
            expect(component.validateExportSettings(scheduledJob)).toBe(false);
        });
    });

    it('should update job portfolios list on portfolioChangeHandler', () => {
        const portfolios: ExportHubJobPortfolio[] = [new ExportHubJobPortfolio(), new ExportHubJobPortfolio()];
        component.portfolioChangeHandler(portfolios);
        expect(component.exportHubJob.getJobPortfoliosList()).toEqual(portfolios);
    });
});
