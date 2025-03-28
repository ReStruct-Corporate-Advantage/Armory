import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChildren} from '@angular/core';
import {BatchReportConfig} from '@models/batch-reporting/batch-report-config.model';
import {BatchRowConfig} from '@models/batch-reporting/batch-row-config.model';
import {BatchReportingService} from '@services/batch-reporting/batch-reporting.service';
import {NotificationService} from '@services/notification';
import {AppUtils} from '@utils/app.utils';
import {ExploreDialogParam, AlertConstants, ErrorTypeConstants, UIErrorParameters} from '@blk/explore-ui-core';
import {remove} from 'lodash';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {AppStore} from '../../../../app.store';
import {BatchExportingStore} from '../../../../stores';
import {takeUntil} from 'rxjs/operators';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {FavoriteService} from '@services/favorite';
import {CoreFavoriteConstants, SubscribableComponent} from '@blk/explore-ui-core';
import {FavoriteConstants} from '@constants/favorite.constants';
import {AuxButtonSizeEnum, AuxButtonTypeEnum} from '@blk/aladdin-angular-components';
import {BatchSettingsRowComponent} from './batch-settings-row/batch-settings-row.component';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-batch-settings',
    templateUrl: './batch-settings.component.html',
    styleUrls: ['./batch-settings.component.scss']
})
export class BatchSettingsComponent extends SubscribableComponent implements OnInit, OnChanges {
    readonly CoreFavoriteConstants = CoreFavoriteConstants;
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    readonly AuxButtonSizeEnum = AuxButtonSizeEnum;

    @Input() enableScheduledBatch: boolean;
    @Output() createNewBatchReportHandler: EventEmitter<void> = new EventEmitter<void>();
    @ViewChildren(BatchSettingsRowComponent) batchRows: QueryList<BatchSettingsRowComponent>;

    batchReportConfig: BatchReportConfig;
    allActiveRows: boolean;
    selectedBatchSettingsRow: BatchRowConfig;
    downloadInProgress: boolean;
    isScheduledBatchOverviewModalOpen = false;
    readonly favDisplayName = FavoriteConstants.BATCH_REPORT_PASCAL;

    constructor(protected batchReportingService: BatchReportingService, protected notificationService: NotificationService, protected appStore: AppStore, protected favoriteService: FavoriteService, private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        BatchExportingStore.getCurrentBatchReport$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((batchReport) => {
                this.batchReportConfig = batchReport;
                // Select the first batch settings row by default
                this.selectBatchSettingsRow(this.batchReportConfig.batchRowConfigs[0]);
                this.updateAllActiveRowsFlag();
            });

        BatchExportingStore.batchDownloadStatus$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((batchDownloadStatus) => {
                this.downloadInProgress = batchDownloadStatus;
                this.changeDetectorRef.markForCheck();
            });

        // Open the scheduled batch overview modal on subscribe
        BatchReportingService.scheduledBatchOverviewModalOpen$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((showModal) => {
                this.isScheduledBatchOverviewModalOpen = showModal;
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.batchReportConfig) {
            // Always select the first row of a new batch report config
            this.selectBatchSettingsRow(this.batchReportConfig.batchRowConfigs[0]);
        }
    }

    /**
     * Open the scheduled batch overview modal
     */
    openScheduledBatchOverviewModal(): void {
        BatchReportingService.scheduledBatchOverviewModalOpen$.next(true);
    }

    /**
     * Close batch scheduler modal
     */
    closeScheduledBatchOverviewModal(): void {
        this.isScheduledBatchOverviewModalOpen = false;
    }

    /**
     * check if portfolio download is in progress for any batch setting row
     */
    isPortfolioDownloadInProgress() {
        if (this.batchRows) {
            return this.batchRows.toArray().some(batchRow => batchRow.portfolioLoading);
        }
        return false;
    }

    /**
     * Callback to save the batch report
     */
    saveBatchReport(): void {
        this.appStore.saveFavoriteAction$.next(
            new SaveFavoriteAction(
                this.batchReportConfig,
                FavoriteConstants.BATCH_REPORT_PASCAL,
                FavoriteConstants.BATCH_REPORT,
                FavoriteConstants.BATCH_REPORT_FOLDER,
                // Pass a callback to try to update any ScheduledBatchConfig
                // associated with this BatchReportConfig so they maintain parity with the title
                this.enableScheduledBatch ? this.batchReportingService.updateBatchReportTitleInScheduledBatchConfig : null
            )
        );
    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.batchReportConfig.batchRowConfigs, event.previousIndex, event.currentIndex);
      }
    /**
     * Callback to load the batch report favorite
     */
    loadBatchReport(): void {
        this.appStore.openLoadFavoriteModal$.next(
            new LoadFavoriteAction({
                type: FavoriteConstants.BATCH_REPORT,
                treeType: FavoriteConstants.BATCH_REPORT_FOLDER,
                displayName: FavoriteConstants.BATCH_REPORT_PASCAL + 's',
                callback: this.loadBatchFavorite,
                headerDisplayName: FavoriteConstants.BATCH_REPORT_PASCAL,
                ignoreEnterpriseTree: false
            }));
    }

    loadBatchFavorite = (favId: number, loadingMessage: string) => {
        this.loadBatchFavoriteVersion(favId, loadingMessage);
    }

    loadBatchFavoriteVersion = (favId: number, loadingMessage: string, forceRefresh?: boolean, isGlobalFavorite?: boolean, versionId?: string) => {
        this.favoriteService.getFavorite$(favId, loadingMessage, false, false, versionId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((batchReport: BatchReportConfig) => {
                if (batchReport.batchRowConfigs.length === 0) {
                    console.log('Loaded a batch report with no batch rows');
                } else {
                    BatchExportingStore.currentBatchReport$.next(batchReport);
                }
            }, error => {
                this.notificationService.error('Failed to load batch report with id: ' + favId, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_FAVORITE_ERROR);
                console.error(error);
            });
    }

    addBatchRow(): void {
        this.batchReportConfig.addBatchRowConfig();
    }

    createNewBatchReport(): void {
        this.notificationService.openDialog(
            new ExploreDialogParam(
                AlertConstants.TYPE.ALERT_WITH_OPTIONS,
                AlertConstants.HEADER.CONFIRM,
                AlertConstants.BODY.UNSAVING_BATCH,
                AlertConstants.BTN.OK,
                AlertConstants.BTN.CANCEL,
                this.emitCreateNewBatchReport
            ));
    }

    emitCreateNewBatchReport = (): void => {
        this.createNewBatchReportHandler.emit();
    }

    /**
     * Toggles all BatchRowConfigs to be active/inactive
     */
    toggleActiveRows(): void {
        const allActive: boolean = this.batchReportConfig.allBatchRowConfigsActive();
        this.allActiveRows = !allActive;

        for (const batchRow of this.batchReportConfig.batchRowConfigs) {
            batchRow.active = !allActive;
        }
    }

    /**
     * Callback to update the allActiveRows flag
     */
    updateAllActiveRowsFlag(): void {
        this.allActiveRows = this.batchReportConfig.allBatchRowConfigsActive();
    }

    selectBatchSettingsRow = (batchRow: BatchRowConfig) => {
        this.selectedBatchSettingsRow = batchRow;
    }

    /**
     * Returns a label for which batch row is selected
     */
    getSelectedBatchRowLabel(): string {
        return 'Selected batch row export options: ' + (this.selectedBatchSettingsRow.portfolio ? this.selectedBatchSettingsRow.portfolio.portName : '');
    }

    /**
     * Remove a batch row. Do nothing if a batch is running.
     */
    removeBatchRow(event: CustomEvent): void {
        if (!this.downloadInProgress) {
            if (event.detail.batchRowConfig.isEffectivelyEmpty() || AppUtils.isCtrlPressed(event.detail.originalEvent)) {
                this.doRemoveBatchRow(event.detail.batchRowConfig);
            } else {
                // Else, prompt the user to confirm removal
                this.notificationService.openDialog(
                    new ExploreDialogParam(
                        AlertConstants.TYPE.ALERT_WITH_OPTIONS,
                        AlertConstants.HEADER.REMOVE_BATCH_CONFIGURATION,
                        AlertConstants.BODY.DELETE_BATCH_ROW,
                        AlertConstants.BTN.DELETE,
                        AlertConstants.BTN.CANCEL,
                        this.doRemoveBatchRow,
                        null,
                        event.detail.batchRowConfig
                    ));
            }
        }
    }

    /**
     * Raw logic that deletes the batch row from the batch report
     */
    doRemoveBatchRow = (removedRowConfig: BatchRowConfig) => {
        // Remove the row
        remove(this.batchReportConfig.batchRowConfigs, (batchRowConfig: BatchRowConfig) => batchRowConfig === removedRowConfig);
        // If the removed row was the selectedBatchRow
        if (removedRowConfig === this.selectedBatchSettingsRow) {
            if (this.batchReportConfig.batchRowConfigs.length > 0) {
                // If there are batch rows remaining, select the first one
                this.selectBatchSettingsRow(this.batchReportConfig.batchRowConfigs[0]);
            } else {
                // Or else just create a new batch report
                this.createNewBatchReport();
            }
        }
    }
}
