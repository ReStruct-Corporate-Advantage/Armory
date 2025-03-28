import {ComponentFixture, TestBed} from '@angular/core/testing';
import {JobManagementComponent} from './job-management.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ExportHubStore} from '@stores/export-hub.store';
import {CommonConstants} from '@constants/common.constants';
import {JobStatus} from '../../../enums/job-status';
import {AuxBadgeStyleEnum, AuxQuickFilterBarClickedDetailInterface} from '@blk/aladdin-angular-components';
import {JOBS, JobState} from '../../../constants/export-hub.constants';
import {
    ExportHubJob,
    ExportHubJobSchedule
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {FREQUENCY_LABELS} from '../../../enums/frequency.constants';
import {JobService} from '../../../services/job.service';
import {of, throwError} from 'rxjs';
import {NotificationService} from '@services/notification';

describe('JobManagementComponent', () => {
    let component: JobManagementComponent;
    let fixture: ComponentFixture<JobManagementComponent>;
    let exportHubStoreStub: any;
    let jobServiceStub: any;
    let notificationServiceStub: any;

    beforeEach(async () => {
        exportHubStoreStub = {
            scheduledJobsMap: new Map<string, ExportHubJob>([
                ['job1', new ExportHubJob()],
                ['job2', new ExportHubJob()]
            ]),
            getScheduledJobs: jest.fn(() => [new ExportHubJob()])
        };
        jobServiceStub = {
            getAllScheduledJobs$: jest.fn()
        };
        notificationServiceStub = {
            success: jest.fn(),
            error: jest.fn()
        };

        await TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [JobManagementComponent],
            providers: [{provide: ExportHubStore, useValue: exportHubStoreStub},
                {provide: JobService, useValue: jobServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub}]
        }).compileComponents();

    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JobManagementComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize allScheduledJobs and filteredScheduledJobs on ngOnInit', () => {
        const job1 = new ExportHubJob();
        job1.setState(JobStatus.IN_PROGRESS);
        const job2 = new ExportHubJob();
        job2.setState(JobStatus.COMPLETE);

        const mockJobs: ExportHubJob[] = [
            job1, job2
        ];
        exportHubStoreStub.getScheduledJobs.mockReturnValue(mockJobs);

        component.ngOnInit();
        expect(component.allScheduledJobs).toEqual(mockJobs);
    });

    it('should filter jobs based on selected tabs', () => {
        const job1 = new ExportHubJob();
        const scheduleSettings = new ExportHubJobSchedule();
        scheduleSettings.setJobFrequency(1);
        job1.addJobSchedules(scheduleSettings);

        const job2 = new ExportHubJob();
        const scheduleSettings2 = new ExportHubJobSchedule();
        scheduleSettings2.setJobFrequency(2);
        job2.addJobSchedules(scheduleSettings2);

        const mockJobs: ExportHubJob[] = [
            job1, job2
        ];

        const event: CustomEvent<AuxQuickFilterBarClickedDetailInterface> = {
            detail: {
                values: [{label: 'Daily'}, {label: 'Monthly'}]
            }
        } as CustomEvent<AuxQuickFilterBarClickedDetailInterface>;
        component.activeJobs = mockJobs;
        component.filterDataChangedHandler(event);

        expect(component.filteredActiveScheduledJobs).toEqual([
            job2
        ]);
    });

    it('should initialize quick filter bar data correctly', () => {
        component.onceCount = 0;
        component.weeklyCount = 0;
        component.dailyCount = 0;
        component.monthlyCount = 0;
        component.yearlyCount = 0;

        const job1 = new ExportHubJob();
        const scheduledJob1 = new ExportHubJobSchedule();
        scheduledJob1.setJobFrequency(1);
        job1.addJobSchedules(scheduledJob1);

        const job2 = new ExportHubJob();
        const scheduledJob2 = new ExportHubJobSchedule();
        scheduledJob2.setJobFrequency(2);
        job2.addJobSchedules(scheduledJob2);

        const job3 = new ExportHubJob();
        const scheduledJob3 = new ExportHubJobSchedule();
        scheduledJob3.setJobFrequency(3);
        job3.addJobSchedules(scheduledJob3);

        const job4 = new ExportHubJob();
        const scheduledJob4 = new ExportHubJobSchedule();
        scheduledJob4.setJobFrequency(4);
        job4.addJobSchedules(scheduledJob4);

        const job5 = new ExportHubJob();
        const scheduledJob5 = new ExportHubJobSchedule();
        scheduledJob5.setJobFrequency(5);
        job5.addJobSchedules(scheduledJob5);

        component.activeJobs = [
            job1, job2, job3, job4, job5
        ];

        component['initializeQuickFilterBarData']();

        expect(component.onceCount).toBe(1);
        expect(component.weeklyCount).toBe(1);
        expect(component.dailyCount).toBe(1);
        expect(component.monthlyCount).toBe(1);
        expect(component.yearlyCount).toBe(1);
    });

    it('should refresh jobs and update the store and component state', () => {
        const newJobs = [new ExportHubJob()];
        jobServiceStub.getAllScheduledJobs$.mockReturnValue(of(newJobs));

        component.refreshJobs();

        expect(jobServiceStub.getAllScheduledJobs$).toHaveBeenCalled();

    });

    it('should delete the job from the export hub store and initialize data', () => {
        const initializeDataSpy = jest.spyOn(component, 'initializeData');

        component.updateFilterBarDataOnDelete('job1');

        expect(exportHubStoreStub.scheduledJobsMap.get('job1').getState()).toBe(JobState.INACTIVE);
        expect(initializeDataSpy).toHaveBeenCalled();
    });

    it('should not delete any job if the job ID does not exist', () => {
        const initializeDataSpy = jest.spyOn(component, 'initializeData');

        component.updateFilterBarDataOnDelete('nonexistentJob');

        expect(exportHubStoreStub.scheduledJobsMap.size).toBe(2);
        expect(initializeDataSpy).toHaveBeenCalled();
    });

    it('should show error notification if no jobs are found', () => {
        jobServiceStub.getAllScheduledJobs$.mockReturnValue(of([]));

        component.refreshJobs();

        expect(notificationServiceStub.error).toHaveBeenCalledWith('No scheduled jobs found');
    });

    it('should show error notification if failed to refresh jobs', () => {
        jobServiceStub.getAllScheduledJobs$.mockReturnValue(throwError(() => new Error('Error')));

        component.refreshJobs();

        expect(notificationServiceStub.error).toHaveBeenCalledWith('Failed to refresh jobs');
    });

    it('should update quick filter data correctly', () => {
        component.onceCount = 1;
        component.weeklyCount = 1;
        component.dailyCount = 1;
        component.monthlyCount = 1;
        component.yearlyCount = 1;


        component['updateQuickFilterData']();

        expect(component.quickFilterBarData).toEqual([
            {
                filterButtonType: 'text',
                data: [
                    {
                        badgeStyle: AuxBadgeStyleEnum.NEUTRAL,
                        label: FREQUENCY_LABELS.ONCE,
                        value: '1' + CommonConstants.SINGLE_SPACE + JOBS,
                        isSelected: false
                    },
                    {
                        badgeStyle: AuxBadgeStyleEnum.NEUTRAL,
                        label: FREQUENCY_LABELS.DAILY,
                        value: '1' + CommonConstants.SINGLE_SPACE + JOBS,
                        isSelected: false
                    },
                    {
                        badgeStyle: AuxBadgeStyleEnum.NEUTRAL,
                        label: FREQUENCY_LABELS.WEEKLY,
                        value: '1' + CommonConstants.SINGLE_SPACE + JOBS,
                        isSelected: false

                    },
                    {
                        badgeStyle: AuxBadgeStyleEnum.NEUTRAL,
                        label: FREQUENCY_LABELS.MONTHLY,
                        value: '1' + CommonConstants.SINGLE_SPACE + JOBS,
                        isSelected: false

                    },
                    {
                        badgeStyle: AuxBadgeStyleEnum.NEUTRAL,
                        label: FREQUENCY_LABELS.YEARLY,
                        value: '1' + CommonConstants.SINGLE_SPACE + JOBS,
                        isSelected: false

                    }
                ]
            }
        ]);
    });
});
