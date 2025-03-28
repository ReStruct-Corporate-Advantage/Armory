import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FavoriteService} from '@services/favorite';
import {NotificationService} from '@services/notification';
import {ScheduledBatchOverviewModalComponent} from './scheduled-batch-overview-modal.component';
import {BatchExportingStore} from '@stores/batch-exporting.store';
import {BatchReportingTestUtils} from '@services/batch-reporting/batch-reporting.service.spec';
import {CoreDefinitionStore, CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {CalendarTestUtils} from '../../../shared/components/date-picker-with-calendar/calendar-test.utils';
import {of, throwError} from 'rxjs';
import {Http2BmsService} from '@services/bms';
import {ExportUtils} from '@utils/export/export.utils';
import moment from 'moment';
import 'moment-timezone/index';

describe('ScheduledBatchOverviewModalComponent', () => {
    let component: ScheduledBatchOverviewModalComponent;
    let fixture: ComponentFixture<ScheduledBatchOverviewModalComponent>;

    const favoriteServiceStub = {
        saveFavorite$: jest.fn(),
        deleteFavorite$: jest.fn()
    };

    const notificationServiceStub = {
        success: jest.fn(),
        error: jest.fn(),
        openDialog: jest.fn()
    };

    const http2BmsServiceStub = {
        post$: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ScheduledBatchOverviewModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: FavoriteService, useValue: favoriteServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub},
                {provide: Http2BmsService, useValue: http2BmsServiceStub}
            ]
        });

        CoreDefinitionStore.calendars = CalendarTestUtils.getMockCalendars();

        fixture = TestBed.createComponent(ScheduledBatchOverviewModalComponent);
        component = fixture.componentInstance;
        const scheduledBatchConfig1 = BatchReportingTestUtils.createDummyScheduledBatchConfig();
        const scheduledBatchConfig2 = BatchReportingTestUtils.createDummyScheduledBatchConfig();
        scheduledBatchConfig2.batchReportConfigId = 67890;
        scheduledBatchConfig2.batchSchedules[0].dateLastUpdated = '03/01/2021';
        BatchExportingStore.scheduledBatchMap.set(scheduledBatchConfig1.batchReportConfigId, scheduledBatchConfig1);
        BatchExportingStore.scheduledBatchMap.set(scheduledBatchConfig2.batchReportConfigId, scheduledBatchConfig2);
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.login = 'rolin';
        fixture.detectChanges();
    });

    it('Test ngOnInit', () => {
        component.ngOnInit();
        expect(component.scheduledBatches.length).toEqual(2);
    });

    it('Test onEditBatchSchedule', () => {
        const scheduledBatchConfig1 = BatchReportingTestUtils.createDummyScheduledBatchConfig();
        component.onEditBatchSchedule(null, scheduledBatchConfig1);
        expect(BatchExportingStore.getCurrentScheduledBatchConfig()).toBe(scheduledBatchConfig1);
    });

    describe('Test runBatchThroughSchedulerListener', () => {
        // THIS IS TESTING A DEBUG METHOD
        const scheduledBatchConfig = BatchReportingTestUtils.createDummyScheduledBatchConfig();
        it('Test runBatchThroughSchedulerListener success', () => {
            const payload = {data: null};
            http2BmsServiceStub.post$.mockReturnValue(of(payload));
            const mockProcessDownload = jest.fn().mockReturnValue('TEST');
            ExportUtils.processDownload = mockProcessDownload;

            component.runBatchThroughSchedulerListener(null, scheduledBatchConfig);
            expect(mockProcessDownload).toHaveBeenCalled();
        });

        it('Test runBatchThroughSchedulerListener error', () => {
            http2BmsServiceStub.post$.mockReturnValue(throwError('ERROR'));
            const mockProcessDownload = jest.fn().mockReturnValue('TEST');
            ExportUtils.processDownload = mockProcessDownload;

            component.runBatchThroughSchedulerListener(null, scheduledBatchConfig);
            expect(mockProcessDownload).not.toHaveBeenCalled();
            expect(notificationServiceStub.error).toHaveBeenCalled();
        });
    });

    describe('Test onBatchScheduleRemoved', () => {
        const scheduledBatchConfig1 = BatchReportingTestUtils.createDummyScheduledBatchConfig();
        it('Test onBatchScheduleRemoved that has CTRL key pressed', () => {
            const mouseEvent = new MouseEvent('click', {ctrlKey: true});
            jest.spyOn(component, 'doRemoveBatchSchedule').mockImplementation(() => {});
            component.onBatchScheduleRemoved(mouseEvent, scheduledBatchConfig1, scheduledBatchConfig1.batchSchedules[0]);
            expect(component.doRemoveBatchSchedule).toHaveBeenCalledWith({scheduledBatch: scheduledBatchConfig1, batchSchedule: scheduledBatchConfig1.batchSchedules[0]});
        });

        it('Test onBatchScheduleRemoved that will prompt the user', () => {
            const mouseEvent = new MouseEvent('click');
            jest.spyOn(component['notificationService'], 'openDialog');
            component.onBatchScheduleRemoved(mouseEvent, scheduledBatchConfig1, scheduledBatchConfig1.batchSchedules[0]);
            expect(component['notificationService'].openDialog).toHaveBeenCalled();
        });
    });

    describe('Test doRemoveBatchSchedule', () => {
        const scheduledBatchConfig1 = BatchReportingTestUtils.createDummyScheduledBatchConfig();
        let scheduledBatchRemoval = {scheduledBatch: scheduledBatchConfig1, batchSchedule: scheduledBatchConfig1.batchSchedules[0]};
        it('Test doRemoveBatchSchedule with schedules remaining', () => {
            // Add another schedule so that the total number of schedules is 2
            scheduledBatchConfig1.batchSchedules.push(BatchReportingTestUtils.createDummyBatchSchedule());
            expect(scheduledBatchConfig1.batchSchedules.length).toEqual(2);
            jest.spyOn(moment.tz, 'guess').mockReturnValue('America/New_York');
            favoriteServiceStub.saveFavorite$.mockReturnValue(of({status: 'SUCCESS', favoriteId: 6789}));
            component.doRemoveBatchSchedule(scheduledBatchRemoval);
            expect(BatchExportingStore.scheduledBatchMap.get(scheduledBatchConfig1.batchReportConfigId).batchSchedules.length).toEqual(1);
        });

        it('Test doRemoveBatchSchedule with no schedules remaining', () => {
            scheduledBatchRemoval = {scheduledBatch: scheduledBatchConfig1, batchSchedule: scheduledBatchConfig1.batchSchedules[0]};
            expect(scheduledBatchConfig1.batchSchedules.length).toEqual(1);
            favoriteServiceStub.deleteFavorite$.mockReturnValue(of({status: 'SUCCESS'}));
            component.doRemoveBatchSchedule(scheduledBatchRemoval);
            expect(BatchExportingStore.scheduledBatchMap.has(scheduledBatchConfig1.batchReportConfigId)).toBeFalsy();
        });
    });

    it('should display workspace owner name as Enterprise for Admin User', () => {
        const scheduledBatchConfig1 = BatchReportingTestUtils.createDummyScheduledBatchConfig();
        scheduledBatchConfig1.batchReportConfigOwner = '_ADMIN';
        const scheduledBatchConfig2 = BatchReportingTestUtils.createDummyScheduledBatchConfig();
        scheduledBatchConfig2.batchReportConfigOwner = '_ADMIN';
        BatchExportingStore.scheduledBatchMap.set(scheduledBatchConfig1.batchReportConfigId, scheduledBatchConfig1);
        BatchExportingStore.scheduledBatchMap.set(scheduledBatchConfig2.batchReportConfigId, scheduledBatchConfig2);
        component.ngOnInit();
        expect(component.ownerDisplayName).toEqual('Enterprise');
    });

    it('should display workspace owner name as Aladdin for GLOBAL User', () => {
        const scheduledBatchConfig1 = BatchReportingTestUtils.createDummyScheduledBatchConfig();
        scheduledBatchConfig1.batchReportConfigOwner = '_GLOBAL';
        const scheduledBatchConfig2 = BatchReportingTestUtils.createDummyScheduledBatchConfig();
        scheduledBatchConfig2.batchReportConfigOwner = '_GLOBAL';
        BatchExportingStore.scheduledBatchMap.set(scheduledBatchConfig1.batchReportConfigId, scheduledBatchConfig1);
        BatchExportingStore.scheduledBatchMap.set(scheduledBatchConfig2.batchReportConfigId, scheduledBatchConfig2);
        component.ngOnInit();
        expect(component.ownerDisplayName).toEqual('Aladdin');
    });

    it('should display current user name as workspace owner name for  other user', () => {
        const scheduledBatchConfig1 = BatchReportingTestUtils.createDummyScheduledBatchConfig();
        scheduledBatchConfig1.batchReportConfigOwner = 'current user';
        const scheduledBatchConfig2 = BatchReportingTestUtils.createDummyScheduledBatchConfig();
        scheduledBatchConfig2.batchReportConfigOwner = 'current user';
        BatchExportingStore.scheduledBatchMap.set(scheduledBatchConfig1.batchReportConfigId, scheduledBatchConfig1);
        BatchExportingStore.scheduledBatchMap.set(scheduledBatchConfig2.batchReportConfigId, scheduledBatchConfig2);
        component.ngOnInit();
        expect(component.ownerDisplayName).toEqual('current user');
    });

});
