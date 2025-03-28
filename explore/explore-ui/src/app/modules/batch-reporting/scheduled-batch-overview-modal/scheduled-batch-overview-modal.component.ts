import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
    CommonUtils,
    DateFormatConstants,
    ErrorTypeConstants,
    SubscribableComponent,
    UIErrorParameters,
    ExploreDialogParam,
    AlertConstants,
    CoreFavoriteUtils
} from '@blk/explore-ui-core';
import {BatchReportingService} from '@services/batch-reporting/batch-reporting.service';
import {FavoriteService} from '@services/favorite';
import {ScheduledBatchConfig} from '@models/batch-reporting/scheduled-batch/scheduled-batch-config.model';
import {FavoriteConstants} from '@constants/favorite.constants';
import {AppUtils} from '@utils/app.utils';
import {remove} from 'lodash';
import {NotificationService} from '@services/notification';
import {BatchSchedule} from '@models/batch-reporting/scheduled-batch/batch-schedule.model';
import {takeUntil} from 'rxjs/operators';
import {BatchExportingStore} from '@stores/batch-exporting.store';
import moment from 'moment';
import {DataRequestConstants} from '@constants/data-request.constants';
import {Http2BmsService} from '@services/bms';
import {URLConstants} from '@constants/url.constants';
import {ExportConstants} from '@constants/export.constants';
import {AuxValuePairLabelPositionEnum} from '@blk/aladdin-angular-components';
import {ExportUtils} from '@utils/export/export.utils';

/**
 * ScheduledBatchOverviewModalComponent - component where user can see all previously configured ScheduleBatchConfigs
 */
@Component({
    selector: 'app-scheduled-batch-overview-modal',
    templateUrl: './scheduled-batch-overview-modal.component.html',
    styleUrls: ['./scheduled-batch-overview-modal.component.scss']
})
export class ScheduledBatchOverviewModalComponent extends SubscribableComponent implements OnInit {
    @Input() isOpen: boolean;
    @Output() modalClosed = new EventEmitter<void>();

    readonly AuxValuePairLabelPositionEnum = AuxValuePairLabelPositionEnum;

    scheduledBatches: ScheduledBatchConfig[] = [];

    // Flag to show scheduled batch debug functionality
    scheduledBatchDebug = false;

    // Display name for the batch schedule owners
    ownerDisplayName: string;

    constructor(private favoriteService: FavoriteService, private notificationService: NotificationService, private http2BmsService: Http2BmsService) {
        super();
    }

    ngOnInit(): void {
        const scheduledBatches = Array.from(BatchExportingStore.scheduledBatchMap.values());
        for (const scheduledBatch of scheduledBatches) {
            scheduledBatch.sortBatchSchedulesByLastUpdated();
            if (scheduledBatch.batchReportConfigOwner) {
                this.ownerDisplayName = CoreFavoriteUtils.getFavoriteOwnerDisplayName(scheduledBatch.batchReportConfigOwner);
            }
        }
        // Sort the list based on dateLastUpdate (the oldest will be on top)
        this.scheduledBatches = scheduledBatches.sort((firstScheduledBatchConfig, secondScheduledBatchConfig) => {
            const firstScheduleEarliestUpdateMoment = moment(firstScheduledBatchConfig.batchSchedules[0].dateLastUpdated, DateFormatConstants.MMDDYYYY_SLASH);
            const secondScheduleEarliestUpdateMoment = moment(secondScheduledBatchConfig.batchSchedules[0].dateLastUpdated, DateFormatConstants.MMDDYYYY_SLASH);
            if (firstScheduleEarliestUpdateMoment > secondScheduleEarliestUpdateMoment) {
                return 1;
            } else if (secondScheduleEarliestUpdateMoment > firstScheduleEarliestUpdateMoment) {
                return -1;
            } else {
                return 0;
            }
        });

        this.scheduledBatchDebug = CommonUtils.getURLParam(URLConstants.ENABLE_SCHEDULED_BATCH_DEBUG) === 'true';
    }

    /**
     * Adds a batch schedule to the coordinator server to execute ASAP
     * @param event
     * @param scheduledBatch
     * @param batchSchedule
     */
    addBatchScheduleToQueue(event: MouseEvent, scheduledBatch: ScheduledBatchConfig, batchSchedule: BatchSchedule): void {
        this.http2BmsService.post$(URLConstants.SCHEDULE_BATCH_COMMAND_URL, {
            scheduledBatchConfigId: scheduledBatch.id,
            batchScheduleId: batchSchedule.id,
            broadcastType: ExportConstants.SCHEDULED_BATCH_COMMANDS.ADD_TO_QUEUE
        }).subscribe(() => {
            this.notificationService.success('Successfully queued BatchSchedule');
        }, () => {
            this.notificationService.error('Failed to queue BatchSchedule', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_ADD_BATCH_SCHEDULE_TO_QUEUE_ERROR);
        });
    }

    /**
     * !!!DEBUG METHOD!!!
     * This will allow us to download scheduled batch exports directly into Explore
     * It will follow the scheduled batch export listener but will intercept the file from being saved down into ftp directory
     * and return the file to be downloaded from Explore
     */
    runBatchThroughSchedulerListener(_event: MouseEvent, scheduledBatch: ScheduledBatchConfig): void {
        // Send a request to backend with just the batch id we want to export
        // This will leverage scheduled batch flow of loading/digesting widget requests for the export
        this.http2BmsService.post$(DataRequestConstants.DATA_REQUEST_URL.SCHEDULED_BATCH_REQUEST, {
            batchFavoriteID: scheduledBatch.batchReportConfigId,
            fileNamePrefix: 'TEST',
            isDebugRun: true
        }).subscribe((payload: any) => {
            ExportUtils.processDownload({type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}, payload.data, null);
        }, () => {
            this.notificationService.error('Failed to run BatchSchedule');
        });
    }

    /**
     * Callback when the user clicks Edit on a ScheduleBatchConfig
     */
    onEditBatchSchedule(event: MouseEvent, scheduledBatch: ScheduledBatchConfig): void {
        BatchReportingService.batchSchedulerModalOpen$.next(true);
        // Set the schedule config to the store so the modal can pick it up
        // NOTE: This will need to change if/when we support multiple schedules on a given batch report
        BatchExportingStore.currentScheduledBatchConfig$.next(scheduledBatch);
    }

    /**
     * Callback when the user clicks remove on a BatchSchedule
     * Prompts the user to confirm
     */
    onBatchScheduleRemoved(event: MouseEvent, scheduledBatch: ScheduledBatchConfig, batchSchedule: BatchSchedule): void {
        const scheduledBatchRemoval = {
            scheduledBatch,
            batchSchedule
        };
        if (AppUtils.isCtrlPressed(event)) {
            this.doRemoveBatchSchedule(scheduledBatchRemoval);
        } else {
            // Else, prompt the user to confirm removal
            this.notificationService.openDialog(
                new ExploreDialogParam(
                    AlertConstants.TYPE.ALERT_WITH_OPTIONS,
                    AlertConstants.HEADER.DELETE_BATCH_SCHEDULE,
                    AlertConstants.BODY.DELETE_BATCH_SCHEDULE,
                    AlertConstants.BTN.DELETE,
                    AlertConstants.BTN.CANCEL,
                    this.doRemoveBatchSchedule,
                    null,
                    scheduledBatchRemoval
                ));
        }
    }

    /**
     * Raw logic that deletes the batch schedule from the scheduled batch config
     */
    doRemoveBatchSchedule = (scheduledBatchRemoval: any) => {
        const originalScheduledBatch: ScheduledBatchConfig = scheduledBatchRemoval.scheduledBatch;
        // Remove the schedule
        remove(originalScheduledBatch.batchSchedules, (batchSchedule: BatchSchedule) => scheduledBatchRemoval.batchSchedule === batchSchedule);

        if (originalScheduledBatch.batchSchedules.length > 0) {
            BatchExportingStore.scheduledBatchMap.set(originalScheduledBatch.batchReportConfigId, originalScheduledBatch);
            // If there are more schedules, then re-save the favorite
            this.favoriteService.saveFavorite$(originalScheduledBatch.createFavorite(ScheduledBatchConfig.configType), FavoriteConstants.ADMIN_USER)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((response: any) => {
                    if (response && response.status === DataRequestConstants.SUCCESS_RESPONSE) {
                        this.notificationService.success('Successfully updated batch schedule: ' + originalScheduledBatch.title);
                    }
                }, error => {
                    console.error(error);
                    this.notificationService.error('Error occurred while saving: ' + error.toString(), ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_SAVE_FAVORITE_ERROR);
                });
        } else {
            // If there are no more schedules, then delete the favorite
            this.favoriteService.deleteFavorite$(originalScheduledBatch.id, ScheduledBatchConfig.configType, originalScheduledBatch.title, FavoriteConstants.ADMIN_USER)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(() => {
                    BatchExportingStore.scheduledBatchMap.delete(originalScheduledBatch.batchReportConfigId);
                    this.notificationService.success('Successfully deleted the batch schedule: ' + originalScheduledBatch.title);
                }, error => {
                    this.notificationService.error('Failed to delete favorite: ' + originalScheduledBatch.title, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_DELETE_FAVORITE_ERROR);
                });
        }
    }

    /**
     * Close the scheduled batch overview modal
     */
    closeModal(): void {
        this.isOpen = false;
        BatchReportingService.scheduledBatchOverviewModalOpen$.next(false);
        this.modalClosed.emit();
    }
}
