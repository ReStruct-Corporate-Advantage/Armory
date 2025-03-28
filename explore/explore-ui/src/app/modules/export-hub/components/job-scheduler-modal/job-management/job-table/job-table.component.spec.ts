import {ComponentFixture, TestBed} from '@angular/core/testing';
import {JobTableComponent} from './job-table.component';
import {JobService} from '../../../../services/job.service';
import {ExportHubStore} from '@stores/export-hub.store';
import {NotificationService} from '@services/notification';
import {of, throwError} from 'rxjs';
import {ChangeDetectorRef} from '@angular/core';
import {
    ExportHubJob, ExportHubJobExecutionHistory, ExportHubJobPortfolio, ExportHubJobSchedule, ExportHubJobWidget
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {CONTEXT_MENU_NOTIFICATION_MESSAGES, CONTEXT_MENU_OPTIONS} from '../../../../constants/export-hub.constants';
import {DateUtils} from '@utils/date.utils';
import {ExportHubUtils} from '../../../../utils/export-hub.utils';
import {AuxGridColumnType, AuxGridConstants} from '@blk/aladdin-angular-components';
import {ColDef} from 'ag-grid-community';

describe('JobTableComponent', () => {
    let component: JobTableComponent;
    let fixture: ComponentFixture<JobTableComponent>;
    let jobServiceStub: any;
    let exportHubStoreStub: any;
    let notificationServiceStub: any;
    let cdrStub: any;

    beforeEach(async () => {
        jobServiceStub = {
            delete$: jest.fn(),
            getScheduledJobById$: jest.fn(),
            getJobExecutionHistoryById$: jest.fn()
        };
        exportHubStoreStub = {
            openScheduleJobModal: jest.fn(),
            scheduledJobsMap: new Map(),
            getScheduledJobs: jest.fn(),
            jobExecutionHistoriesModalOpen$: { next: jest.fn() }
        };
        notificationServiceStub = {
            success: jest.fn(),
            error: jest.fn()
        };
        cdrStub = {
            markForCheck: jest.fn()
        };

        await TestBed.configureTestingModule({
            declarations: [JobTableComponent],
            providers: [
                { provide: JobService, useValue: jobServiceStub },
                { provide: ExportHubStore, useValue: exportHubStoreStub },
                { provide: NotificationService, useValue: notificationServiceStub },
                { provide: ChangeDetectorRef, useValue: cdrStub }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JobTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize rowData and gridOptions on ngOnInit', () => {
        const job = new ExportHubJob();
        const scheduleSettings = new ExportHubJobSchedule();
        scheduleSettings.setJobFrequency(1)
        scheduleSettings.setJobStartDate(ExportHubUtils.convertToProtobufDate('11/11/2025'))
        scheduleSettings.setJobEndDate(ExportHubUtils.convertToProtobufDate('11/15/2025'))
        job.addJobSchedules(scheduleSettings);
        component.scheduledJobs = [job];
        component.ngOnInit();
        expect(component.rowData.length).toBe(1);
        expect(component.gridOptions).toBeDefined();
    });

    it('should update rowData on ngOnChanges', () => {
        const job = new ExportHubJob();
        const scheduleSettings = new ExportHubJobSchedule();
        const portfolio = new ExportHubJobPortfolio();
        portfolio.setJobPortfolioName('Portfolio')
        const widget = new ExportHubJobWidget();
        component.isActiveJobsTable = true;
        widget.setTitle('Widget')
        job.addJobWidgets(widget);
        job.addJobPortfolios(portfolio);
        job.addJobWidgets(widget);
        scheduleSettings.setJobFrequency(1);
        scheduleSettings.setJobStartDate(ExportHubUtils.convertToProtobufDate('11/11/2025'));
        scheduleSettings.setJobEndDate(ExportHubUtils.convertToProtobufDate('11/15/2025'));
        scheduleSettings.setNextRunDate(ExportHubUtils.convertToProtobufDate('11/12/2025'));
        job.addJobSchedules(scheduleSettings);
        const changes = { scheduledJobs: { currentValue: [job] } } as any;
        component.scheduledJobs = [job];
        jest.spyOn(DateUtils, 'convertProtobufTimestampToString').mockReturnValue('01/01/2022')
        component.ngOnChanges(changes);
        expect(component.rowData.length).toBe(1);
        component.isActiveJobsTable = false;
        component.ngOnChanges(changes);
        expect(component.rowData.length).toBe(1);
    });

    it('should call viewEditJob on VIEW_EDIT context menu action', () => {
        const job = new ExportHubJob();
        job.setId('1');
        component.scheduledJobs = [job];
        const event = { detail: { element: { label: CONTEXT_MENU_OPTIONS.VIEW_EDIT, rowId: '1' } } };
        jest.spyOn(DateUtils, 'convertProtobufTimestampToString').mockReturnValue('01/01/2022')
        const exportHubJob = new ExportHubJob();
        jobServiceStub.getScheduledJobById$.mockReturnValue(of(exportHubJob));
        component['actionRowData'].ac.inlineMenuItemClicked(event);
        expect(exportHubStoreStub.openScheduleJobModal).toHaveBeenCalledWith(exportHubJob);
    });


    it('should call deleteJob on DELETE context menu action', () => {
        const job = new ExportHubJob();
        job.setId('1');
        component.scheduledJobs = [job];
        const event = { detail: { element: { label: CONTEXT_MENU_OPTIONS.DELETE, rowId: job.getId() } } };
        jobServiceStub.delete$.mockReturnValueOnce(of({isSuccessful:true, jobId: job.getId()}));
        component['actionRowData'].ac.inlineMenuItemClicked(event);
        expect(jobServiceStub.delete$).toHaveBeenCalledWith('1');
        expect(exportHubStoreStub.scheduledJobsMap.size).toBe(0);

    });

    it('should return correct column definitions for active jobs table', () => {
        const expectedColDefs: ColDef[] = [
            {
                headerName: '',
                field: 'ac',
                type: AuxGridColumnType.AUX_ACTION_COLUMN,
                cellClass: AuxGridConstants.AUX_CENTER_ALIGN_CELL as string,
                headerClass: AuxGridConstants.AUX_CENTER_ALIGN_HEADER_NO_LABEL as string,
                width: 32,
                maxWidth: 42,
                sortable: false,
                pinned: 'left'
            },
            {
                field: 'name',
                headerName: 'Job Name',
                suppressSizeToFit: true,
                minWidth: 150,
                width: 150,
                maxWidth: 200
            },
            {
                field: 'frequency',
                headerName: 'Frequency',
                type: AuxGridColumnType.AUX_TEXT_COLUMN,
                suppressSizeToFit: true,
                minWidth: 150,
                width: 150,
                maxWidth: 200
            },
            {
                field: 'nextRunDate',
                headerName: 'Next Run Date',
                type: AuxGridColumnType.AUX_DATE_TIME_COLUMN,
                cellClass: AuxGridConstants.AUX_RIGHT_ALIGN_CELL as string,
                width: 150,
                maxWidth: 400
            },
        ];

        const colDefs = component.activeJobTableSpecificColDefs();
        expect(colDefs).toEqual(expectedColDefs);
    });

    it('should return correct column definitions for inactive jobs table', () => {
        const expectedColDefs: ColDef[] = [
            {
                field: 'name',
                headerName: 'Job Name',
                suppressSizeToFit: true,
                minWidth: 150,
                width: 150,
                maxWidth: 200
            },
            {
                field: 'status',
                headerName: 'Status',
                type: AuxGridColumnType.AUX_TEXT_COLUMN,
                suppressSizeToFit: true,
                minWidth: 150,
                width: 150,
                maxWidth: 200
            },
            {
                field: 'frequency',
                headerName: 'Frequency',
                type: AuxGridColumnType.AUX_TEXT_COLUMN,
                suppressSizeToFit: true,
                minWidth: 150,
                width: 150,
                maxWidth: 200
            }
        ];

        const colDefs = component.inactiveJobsTableSpecificColDefs();
        expect(colDefs).toEqual(expectedColDefs);
    });


    it('should handle failed job deletion', () => {
        const job = new ExportHubJob();
        job.setId(1);
        job.setName('Test Job');
        component.scheduledJobs = [job];
        exportHubStoreStub.scheduledJobsMap.set(1, job);
        jobServiceStub.delete$.mockReturnValue(of({ isSuccessful: false, jobId: 1 }));
        component['deleteJob'](job);
        expect(notificationServiceStub.error).toHaveBeenCalledWith(CONTEXT_MENU_NOTIFICATION_MESSAGES.DELETE_FAILURE + 'Test Job');
    });

    it('should handle job deletion error', () => {
        const job = new ExportHubJob();
        job.setId('1');
        job.setName('Test Job');
        component.scheduledJobs = [job];
        exportHubStoreStub.scheduledJobsMap.set(1, job);
        jobServiceStub.delete$.mockReturnValueOnce(throwError('Network Error'));
        component['deleteJob'](job);
        expect(notificationServiceStub.error).toHaveBeenCalledWith(CONTEXT_MENU_NOTIFICATION_MESSAGES.DELETE_FAILURE + 'Test Job');
    });

    it('should call viewJobHistory on VIEW_JOB_HISTORY context menu action', () => {
        const job = new ExportHubJob();
        job.setId('1');
        component.scheduledJobs = [job];
        const event = { detail: { element: { label: CONTEXT_MENU_OPTIONS.VIEW_JOB_HISTORY, rowId: '1' } } };
        const jobExecutionHistory = [new ExportHubJobExecutionHistory()];
        jobServiceStub.getJobExecutionHistoryById$.mockReturnValue(of(jobExecutionHistory));
        component['actionRowData'].ac.inlineMenuItemClicked(event);
        expect(exportHubStoreStub.jobExecutionHistoriesModalOpen$.next).toHaveBeenCalledWith({ isOpen: true, jobHistory: jobExecutionHistory });
    });

    it('should call viewJobHistory on VIEW_JOB_HISTORY with empty jobs history', () => {
        const job = new ExportHubJob();
        job.setId('1');
        component.scheduledJobs = [job];
        const event = { detail: { element: { label: CONTEXT_MENU_OPTIONS.VIEW_JOB_HISTORY, rowId: '1' } } };
        jobServiceStub.getJobExecutionHistoryById$.mockReturnValue(of([]));
        component['actionRowData'].ac.inlineMenuItemClicked(event);
        expect(exportHubStoreStub.jobExecutionHistoriesModalOpen$.next).toHaveBeenCalledTimes(0);
    });

    it('should call viewJobHistory on VIEW_JOB_HISTORY with error', () => {
        const job = new ExportHubJob();
        job.setId('1');
        component.scheduledJobs = [job];
        const event = { detail: { element: { label: CONTEXT_MENU_OPTIONS.VIEW_JOB_HISTORY, rowId: '1' } } };
        jobServiceStub.getJobExecutionHistoryById$.mockReturnValue(throwError(() => new Error('Error')) );
        component['actionRowData'].ac.inlineMenuItemClicked(event);
        expect(notificationServiceStub.error).toHaveBeenCalledTimes(1);
    });
});
