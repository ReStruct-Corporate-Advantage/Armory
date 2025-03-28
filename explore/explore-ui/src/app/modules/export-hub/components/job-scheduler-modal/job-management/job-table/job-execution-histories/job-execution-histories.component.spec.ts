import {ComponentFixture, TestBed} from '@angular/core/testing';
import {JobExecutionHistoriesComponent} from './job-execution-histories.component';
import {
    ExportHubJobExecutionHistory, ExportHubJobTaskExecutionHistory
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {NotificationService} from '@services/notification';
import {JobService} from '../../../../../services/job.service';
import {Timestamp} from 'google-protobuf/google/protobuf/timestamp_pb';
import {ExportHubUtils} from '../../../../../utils/export-hub.utils';
import {EXPORT_HUB_JOB_STATES_REVERSED} from '../../../../../constants/export-hub.constants';
import {CommonConstants} from '@constants/common.constants';
import {of, throwError} from 'rxjs';

describe('JobExecutionHistoriesComponent', () => {
    let component: JobExecutionHistoriesComponent;
    let fixture: ComponentFixture<JobExecutionHistoriesComponent>;
    let jobServiceStub: any;
    let notificationServiceStub: any;



    beforeEach(async () => {
        jobServiceStub = {

            getJobExecutionHistoryById$: jest.fn()
        };

        notificationServiceStub = {
            success: jest.fn(),
            error: jest.fn()
        };

      await TestBed.configureTestingModule({
        declarations: [JobExecutionHistoriesComponent],
        providers: [
          { provide: JobService, useValue: jobServiceStub },
          { provide: NotificationService, useValue: notificationServiceStub }
        ]
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(JobExecutionHistoriesComponent);
        component = fixture.componentInstance;


        const jobExecutionHistory = new ExportHubJobExecutionHistory();
        jobExecutionHistory.setJobId('job-id-1');
        jobExecutionHistory.setJobName('Job 1');
        jobExecutionHistory.setExecutionDate(ExportHubUtils.convertToProtobufDate('10/01/2023'));
        jobExecutionHistory.setJobTime('12:00 PM');
        jobExecutionHistory.setState(1); // Assuming 1 is a valid state
        jobExecutionHistory.setExecutionStartTime(ExportHubUtils.convertToProtobufTimestamp('15:30'));
        jobExecutionHistory.setExecutionEndTime(ExportHubUtils.convertToProtobufTimestamp('22:30'));
        jobExecutionHistory.setExecutionLog('Execution log for Job 1');

        const taskExecutionHistory = new ExportHubJobTaskExecutionHistory();
        taskExecutionHistory.setJobPortfolioName('Portfolio 1');
        taskExecutionHistory.setWidgetType('Widget Type 1');
        taskExecutionHistory.setState(1); // Assuming 1 is a valid state
        taskExecutionHistory.setExecutionStartTime(ExportHubUtils.convertToProtobufTimestamp('17:30'));
        taskExecutionHistory.setExecutionEndTime(ExportHubUtils.convertToProtobufTimestamp('18:30'));
        taskExecutionHistory.setExecutionLog('Execution log for Task 1');
        taskExecutionHistory.setWidgetDescription('Widget description for Task 1');

        jobExecutionHistory.addTaskExecutionHistories(taskExecutionHistory);
        component.jobExecutionHistory = [jobExecutionHistory];
        fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize gridOptions on ngOnInit', () => {
      component.ngOnInit();
      expect(component.gridOptions).toBeDefined();
      expect(component.gridOptions.columnDefs.length).toBe(5);
    });

    it('should close modal and emit event', () => {
      jest.spyOn(component.modalClosed, 'emit');
      component.closeModal();
      expect(component.isOpen).toBeFalsy();
      expect(component.modalClosed.emit).toHaveBeenCalled();
    });

    it('should create column definitions', () => {
      const columnDefs = component['createColumnDefs']();
      expect(columnDefs.length).toBe(5);
      expect(columnDefs[0].field).toBe('status');
    });

    it('should render status cell with badge', () => {
      const params = {
        data: { status: 'Completed' }
      };
      const result = component['statusCellRenderer'](params as any);
      expect(result).toContain('<div');
      expect(result).toContain('aux-badge');
    });

    it('should render status cell with badge', () => {
        const params = {
            data: { status: 'In Progress' }
        };
        const result = component['hierarchicalStatusCellRenderer'](params as any);
        expect(result).toContain('<div');
        expect(result).toContain('aux-badge');
    });

    it('should create row data correctly', () => {
        const expectedRowData = [
            {
                name: ['10/01/2023 - 12:00 PM'],
                status: EXPORT_HUB_JOB_STATES_REVERSED.get(1),
                startDateTime: ExportHubUtils.formatDateTime(ExportHubUtils.convertToProtobufTimestamp('15:30')),
                statusDateTime: ExportHubUtils.formatDateTime(ExportHubUtils.convertToProtobufTimestamp('22:30')),
                info: 'Execution log for Job 1',
                note: CommonConstants.EMPTY_STRING
            },
            {
                name: ['10/01/2023 - 12:00 PM', 'Portfolio 1 / Widget Type 1'],
                status: EXPORT_HUB_JOB_STATES_REVERSED.get(1),
                startDateTime: ExportHubUtils.formatDateTime(ExportHubUtils.convertToProtobufTimestamp('17:30')),
                statusDateTime: ExportHubUtils.formatDateTime(ExportHubUtils.convertToProtobufTimestamp('18:30')),
                info: 'Execution log for Task 1',
                note: 'Widget description for Task 1'
            }
        ];

        const rowData = component['createRowData']();
        expect(rowData).toEqual(expectedRowData);
    });

    it('should refresh history and update jobExecutionHistory', () => {
        const newExecutionHistory = new ExportHubJobExecutionHistory();
        newExecutionHistory.setJobId('job-id-2');
        newExecutionHistory.setJobName('Job 2');
        jobServiceStub.getJobExecutionHistoryById$.mockReturnValue(of([newExecutionHistory]));

        component.refreshHistory();

        expect(jobServiceStub.getJobExecutionHistoryById$).toHaveBeenCalledWith('job-id-1');
        expect(component.jobExecutionHistory[0].getJobId()).toBe('job-id-2');
        expect(component.jobExecutionHistory[0].getJobName()).toBe('Job 2');
    });

    it('should show error notification if no job execution history found', () => {
        jobServiceStub.getJobExecutionHistoryById$.mockReturnValue(of([]));

        component.refreshHistory();

        expect(notificationServiceStub.error).toHaveBeenCalledWith('No job execution history found for Job 1');
    });

    it('should show error notification if failed to fetch job execution history', () => {
        jobServiceStub.getJobExecutionHistoryById$.mockReturnValue(throwError(() => new Error('Error')));

        component.refreshHistory();

        expect(notificationServiceStub.error).toHaveBeenCalledWith('Failed to fetch job execution history for Job 1');
    });

  });
