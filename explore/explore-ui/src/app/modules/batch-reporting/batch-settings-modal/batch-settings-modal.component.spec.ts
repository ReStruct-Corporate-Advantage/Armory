import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BatchSettingsModalComponent} from './batch-settings-modal.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BatchReportingService} from '@services/batch-reporting/batch-reporting.service';
import {AppStore} from '../../../app.store';
import {BehaviorSubject, Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {NotificationService} from '@services/notification';
import {BatchReportingTestUtils} from '@services/batch-reporting/batch-reporting.service.spec';
import {BatchReportConfig} from '@models/batch-reporting/batch-report-config.model';
import {ExportService} from '@services/export/export.service';
import {AppUtils} from '@utils/app.utils';
import {BatchExportingStore} from '../../../stores';
import {CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';

describe('BatchSettingsModalComponent', () => {
    let component: BatchSettingsModalComponent;
    let fixture: ComponentFixture<BatchSettingsModalComponent>;

    const dummyBatchReportConfig: BatchReportConfig = BatchReportingTestUtils.createDummyBatchReportConfig();
    const batchReportingServiceStub = {
        batchReportConfig: dummyBatchReportConfig,
        setBatchReport: jest.fn(),
        runBatchExport: jest.fn(),
        batchSchedulerModalOpen$: new Subject(),
        loadAllScheduledBatchConfigs: jest.fn()
    };

    const appStoreStub = {
        saveFavoriteAction$: new BehaviorSubject(new SaveFavoriteAction(null, null, null, null, null, null))
    };

    const notificationServiceStub = {
        openDialog: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BatchSettingsModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: BatchReportingService, useValue: batchReportingServiceStub},
                {provide: AppStore, useValue: appStoreStub},
                {provide: NotificationService, useValue: notificationServiceStub},
                {provide: ExportService, useValue: {}},
            ]
        });

        fixture = TestBed.createComponent(BatchSettingsModalComponent);
        component = fixture.componentInstance;
        BatchExportingStore.currentBatchReport$.next(BatchReportingTestUtils.createDummyBatchReportConfig());
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.sharedFavPerms = true;
        fixture.detectChanges();
    });

    it('Test createNewBatchReport', () => {
        // Set a filename on the old batchReportConfig
        component.batchReportConfig.fileName = 'Test file name';
        // Add another BatchRowConfig
        component.batchReportConfig.addBatchRowConfig();

        expect(component.batchReportConfig.fileName).toEqual('Test file name');
        expect(component.batchReportConfig.batchRowConfigs.length).toEqual(2);

        component.createNewBatchReport();
        // When creating a new batch report, it should default to a blank file name
        expect(component.batchReportConfig.fileName).toEqual('');
        // And only one BatchRowConfig
        expect(component.batchReportConfig.batchRowConfigs.length).toEqual(1);
    });

    it('Test onFileNameChanged', () => {
        const customEvent = new CustomEvent('build', {detail: {value: 'TEST FILE NAME', host: null, srcEvent: null}});
        // Should be a blank fileName
        expect(component.batchReportConfig.fileName).toEqual('');
        component.onFileNameChanged(customEvent);
        // The fileName should be updated
        expect(component.batchReportConfig.fileName).toEqual('TEST FILE NAME');
    });

    it('Test onMergeInOneFileChanged', () => {
        const customEvent = new CustomEvent('build', {detail: {value: {checked: true}, srcEvent: null}});
        // mergeInOneFile should be falsy
        expect(component.batchReportConfig.mergeInOneFile).toBeFalsy();
        component.onMergeInOneFileChanged(customEvent);
        // mergeInOneFile should be set to true
        expect(component.batchReportConfig.mergeInOneFile).toBeTruthy();
    });

    it('Test onDownloadDirectoryChanged', () => {
        const customEvent = new CustomEvent('build', {detail: {value: 'test download directory', host: null, srcEvent: null}});
        // Should be a blank downloadDirectory
        expect(component.batchReportConfig.downloadDirectory).toEqual('');
        component.onDownloadDirectoryChanged(customEvent);
        // The downloadDirectory should be updated
        expect(component.batchReportConfig.downloadDirectory).toEqual('test download directory');
    });

    describe('Test open/close BatchSchedulerModal', () => {
        it('Test openBatchSchedulerModal with no associated ScheduledBatchConfig', () => {
            BatchExportingStore.scheduledBatchMap.clear();
            component.batchReportConfig.title = 'TEST NAME';
            component.batchReportConfig.id = 12345;
            component.openBatchSchedulerModal();
            expect(BatchExportingStore.getCurrentScheduledBatchConfig().title).toEqual(component.batchReportConfig.title);
            expect(BatchExportingStore.getCurrentScheduledBatchConfig().batchReportConfigId).toEqual(component.batchReportConfig.id);
        });

        it('Test openBatchSchedulerModal with an associated ScheduledBatchConfig', () => {
            component.batchReportConfig.id = 12345;
            const scheduledBatchConfig = BatchReportingTestUtils.createDummyScheduledBatchConfig();
            BatchExportingStore.scheduledBatchMap.set(component.batchReportConfig.id, scheduledBatchConfig);
            component.openBatchSchedulerModal();

            expect(BatchExportingStore.getCurrentScheduledBatchConfig()).toEqual(scheduledBatchConfig);
        });

        it('Test closeBatchSchedulerModal', () => {
            component.closeBatchSchedulerModal();
            expect(component.isBatchSchedulerModalOpen).toBeFalsy();
        });
    });

    describe('Test runBatchRequest', () => {
        it('Test runBatchRequest with downloadInProgress', () => {
            component.downloadInProgress = true;
            component.runBatchRequest(null);
            expect(batchReportingServiceStub.runBatchExport).not.toHaveBeenCalled();
        });

        it('Test runBatchRequest with download not in progress', () => {
            component.downloadInProgress = false;
            component.runBatchRequest(null);
            expect(batchReportingServiceStub.runBatchExport).toHaveBeenCalled();
        });
    });

    it('Test cancelBatch', () => {
        jest.spyOn(AppUtils, 'alertNotification');
        component.cancelBatch(null);
        expect(AppUtils.alertNotification).toHaveBeenCalled();
    });

    it('Test closeModal', () => {
        jest.spyOn(component.modalClosed, 'emit');
        component.closeModal();

        BatchReportingService.batchSettingsModalOpen$.asObservable()
            .pipe(
                map((modalOpen: boolean) => {
                    expect(modalOpen).toBeFalsy();
                })
            );

        expect(component.isOpen).toBeFalsy();
        expect(component.modalClosed.emit).toHaveBeenCalled();
    });

    it('test isFileDownloaderVisible and IsDirectoryVisible', () => {
        //if ExploreFileDownloaderInEbc enabled and using the web version, and enableFileDownloader disbled , then Launch file downloader and directory field will be hidden
        component.ebcDownloader = false;
        component.ebcDownloaderWeb = true;
        component.enableFileDownloader = false;
        expect(component.isFileDownloaderVisible()).toBeFalsy();
        expect(component.isDirectoryVisible()).toBeFalsy();

        //if ExploreFileDownloaderInEbc enabled and using the java version, and enableFileDownloader disabled , then Launch file downloader will be hidden, directory field will be visible
        component.ebcDownloader = true;
        component.ebcDownloaderWeb = false;
        expect(component.isFileDownloaderVisible()).toBeFalsy();
        expect(component.isDirectoryVisible()).toBeTruthy();

        //if request is not for ebc client, ExploreFileDownloaderInEbc disabled and enableFileDownloader disabled , then Launch file downloader and directory field will be hidden
        component.ebcDownloader = false;
        component.ebcDownloaderWeb = false;
        component.enableFileDownloader = false;
        expect(component.isFileDownloaderVisible()).toBeFalsy();
        expect(component.isDirectoryVisible()).toBeFalsy();

        //if request is not for ebc client, ExploreFileDownloaderInEbc disabled and enableFileDownloader enabled , then Launch file downloader and directory field will be visible
        component.ebcDownloader = false;
        component.ebcDownloaderWeb = false;
        component.enableFileDownloader = true;
        expect(component.isFileDownloaderVisible()).toBeTruthy();
        expect(component.isDirectoryVisible()).toBeTruthy();

    })
});
