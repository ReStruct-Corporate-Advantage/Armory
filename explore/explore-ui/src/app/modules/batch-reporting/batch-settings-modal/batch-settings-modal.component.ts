import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {BatchReportConfig} from '@models/batch-reporting/batch-report-config.model';
import {BatchExportingStore} from '../../../stores';
import {BatchReportingService} from '@services/batch-reporting/batch-reporting.service';
import {AppStore} from '../../../app.store';
import {takeUntil} from 'rxjs/operators';
import {NotificationService} from '@services/notification';
import {AppUtils} from '@utils/app.utils';
import {AuxCheckboxChangedDetailInterface, AuxTextInputValueChangedDetailInterface} from '@blk/aladdin-angular-components';
import {ExportService} from '@services/export/export.service';
import {CoreUserMetaDataStore, SubscribableComponent, TokenConstants, TokenUtils, AlertConstants} from '@blk/explore-ui-core';
import {ScheduledBatchConfig} from '@models/batch-reporting/scheduled-batch/scheduled-batch-config.model';
import {BatchSettingsComponent} from './batch-settings/batch-settings.component';

@Component({
    selector: 'app-batch-settings-modal',
    templateUrl: './batch-settings-modal.component.html',
    styleUrls: ['./batch-settings-modal.component.scss']
})
export class BatchSettingsModalComponent extends SubscribableComponent implements OnInit {
    @Input() isOpen: boolean;
    @Output() modalClosed = new EventEmitter<void>();
    @ViewChild(BatchSettingsComponent, {static: true}) batchSettingsComponent: BatchSettingsComponent;

    batchReportConfig: BatchReportConfig;
    enableFileDownloader = false;
    enableScheduledBatch = false;
    downloadInProgress = false;
    // to check if we are in EbC environment. By default this is set to false because we do not want to change anything
    // in Chrome or other browser
    ebcDownloader = AppStore.isEBCDownloaderEnabled;
    // to check if we are using the web version and ExploreFileDownloaderInEbc is enabled
    ebcDownloaderWeb = false;

    isBatchSchedulerModalOpen = false;

    constructor(public batchReportingService: BatchReportingService, protected appStore: AppStore, protected notificationService: NotificationService, private changeDetectorRef: ChangeDetectorRef, protected exportService: ExportService) {
        // ExportService is injected because the service is lazy loaded and we want to init when the user opens the batch modal
        super();
    }

    ngOnInit() {
        this.enableFileDownloader = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_FILE_DOWNLOADER);
        // set to true if we are using the web version and ExploreFileDownloaderInEbc is enabled
        this.ebcDownloaderWeb = !AppStore.isEBC && TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_FILE_DOWNLOADER_IN_EBC);
        this.enableScheduledBatch = CoreUserMetaDataStore.userMetaData.sharedFavPerms && TokenUtils.isFeatureEnabled(TokenConstants.ENABLE_SCHEDULED_BATCH);

        if (!BatchExportingStore.getCurrentBatchReport()) {
            // If there isn't a batch report already, just create a default one
            const batchReportConfig = new BatchReportConfig();
            batchReportConfig.addBatchRowConfig();
            BatchExportingStore.currentBatchReport$.next(batchReportConfig);
        }

        BatchExportingStore.getCurrentBatchReport$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(batchReport => this.batchReportConfig = batchReport);

        BatchExportingStore.batchDownloadStatus$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((batchDownloadStatus) => {
                this.downloadInProgress = batchDownloadStatus;
                this.changeDetectorRef.markForCheck();
            });

        // Open the batch scheduler modal on subscribe
        BatchReportingService.batchSchedulerModalOpen$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((showModal) => {
                this.isBatchSchedulerModalOpen = showModal;
            });

        // Load all the scheduled batches
        if (this.enableScheduledBatch) {
            // Don't load the favorites if the Map has entries. That means we have loaded them already and the map should be up-to-date
            if (BatchExportingStore.scheduledBatchMap.size) {
                return;
            }
            this.batchReportingService.loadAllScheduledBatchConfigs();
        }
    }

    /**
     * Callback to create a new BatchReportConfig
     */
    createNewBatchReport(): void {
        // Create a new BatchReportConfig
        const batchReportConfig = new BatchReportConfig();
        batchReportConfig.addBatchRowConfig();
        // Set it to the service
        BatchExportingStore.currentBatchReport$.next(batchReportConfig);
    }

    onFileNameChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        // TODO: double check this
        this.batchReportConfig.fileName = event.detail.value;
    }

    onMergeInOneFileChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.batchReportConfig.mergeInOneFile = event.detail.value.checked;
    }

    onDownloadDirectoryChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        // TODO: put an ng-if on download directory input
        // TODO: double check this
        this.batchReportConfig.downloadDirectory = event.detail.value;
    }

    launchFileDownloader(): void {
        AppUtils.launchApp(AppUtils.getFileDownloaderAppName());
    }

    /**
     * Open the batch scheduler modal
     */
    openBatchSchedulerModal(): void {
        BatchReportingService.batchSchedulerModalOpen$.next(true);

        // If there is a scheduled batch config associated with this batch report id, take it from the map
        if (BatchExportingStore.scheduledBatchMap.has(this.batchReportConfig.id)) {
            BatchExportingStore.currentScheduledBatchConfig$.next(BatchExportingStore.scheduledBatchMap.get(this.batchReportConfig.id));
        } else {
            // Else, create a new schedule
            const scheduledBatchConfig = new ScheduledBatchConfig();
            scheduledBatchConfig.batchReportConfigId = this.batchReportConfig.id;
            scheduledBatchConfig.batchReportConfigOwner = this.batchReportConfig.owner;
            // Tie the current user as the author of this ScheduledBatchConfig
            scheduledBatchConfig.author = CoreUserMetaDataStore.userMetaData.login;
            scheduledBatchConfig.title = this.batchReportConfig.title;
            BatchExportingStore.currentScheduledBatchConfig$.next(scheduledBatchConfig);
        }
    }

    /**
     * Close batch scheduler modal
     */
    closeBatchSchedulerModal(): void {
        this.isBatchSchedulerModalOpen = false;
    }

    runBatchRequest(event: MouseEvent): void {
        if (this.downloadInProgress) {
            // Don't proceed with running another batch request if any downloads are still in progress
            return;
        }

        BatchExportingStore.runHardRefresh$.next(AppUtils.isCtrlPressed(event));
        this.batchReportingService.runBatchExport(this.batchReportConfig);
    }

    /**
     * Cancels the current Batch process
     */
    cancelBatch(event: MouseEvent): void {
        AppUtils.alertNotification(
            event,
            AlertConstants.HEADER.CANCEL_BATCH_EXPORTING,
            AlertConstants.BODY.CANCEL_BATCH_EXPORTING,
            AlertConstants.BTN.BATCH.CONFIRM_CANCEL,
            AlertConstants.BTN.BATCH.RESUME,
            () => this.batchReportingService.cancelCurrentBatch(),
            this.notificationService
        );
    }

    /**
     * Returns whether the batch button is disabled or not
     */
    getDisableBatchRun(): boolean {
        return this.downloadInProgress // Any download is in progress
            || !this.batchReportConfig.allActiveBatchRowConfigsFilled(); // All active rows are not filled properly
    }

    /**
     * Close the batch settings modal
     */
    closeModal(): void {
        this.isOpen = false;
        BatchReportingService.batchSettingsModalOpen$.next(false);
        this.modalClosed.emit();
    }

    /*
      method to check Launch file downloader will be hidden or not
     */
    isFileDownloaderVisible(): boolean {
        return (this.ebcDownloaderWeb || this.ebcDownloader) ? false : this.enableFileDownloader;
    }

    /*
      method to check Explore file directory field will be hidden or not
     */
    isDirectoryVisible(): boolean {
        if (this.ebcDownloaderWeb) {
            return false;
        } else {
            return this.ebcDownloader ? true : this.enableFileDownloader;
        }
    }
}
