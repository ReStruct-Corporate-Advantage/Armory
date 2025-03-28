import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {cloneDeep} from 'lodash';
import {BatchReportingService} from '@services/batch-reporting/batch-reporting.service';
import {BatchExportingStore} from '@stores/batch-exporting.store';
import {takeUntil} from 'rxjs/operators';
import {
    CalendarDateUtils,
    CoreUserMetaDataStore,
    ErrorTypeConstants,
    ExploreCheckbox,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    SaveFavoriteResult,
    SubscribableComponent,
    UIErrorParameters
} from '@blk/explore-ui-core';
import {
    AuxCheckboxGroupChangedDetailInterface,
    AuxInputMaskValueChangedDetailInterface,
    AuxNumericStepperValueChangedDetailInterface,
    AuxSelectOptionGroup,
    AuxSelectSelectionChangedDetailInterface,
    AuxTextInputValueChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {BatchScheduleFrequency} from '@enums/batch-reporting/batch-schedule-frequency.enum';
import {ScheduledBatchConfig} from '@models/batch-reporting/scheduled-batch/scheduled-batch-config.model';
import {FavoriteService} from '@services/favorite';
import {NotificationService} from '@services/notification';
import {BatchSchedule} from '@models/batch-reporting/scheduled-batch/batch-schedule.model';
import {FavoriteConstants} from '@constants/favorite.constants';
import {DataRequestConstants} from '@constants/data-request.constants';
import {BatchFrequency} from '@interfaces/batch-frequency.interface';
import {BatchDailyFrequency} from '@models/batch-reporting/scheduled-batch/batch-frequency/batch-daily-frequency.model';
import {
    BatchMonthlyFrequency
} from '@models/batch-reporting/scheduled-batch/batch-frequency/batch-monthly-frequency.model';
import {ExportUtils} from '@utils/export/export.utils';
import {DateUtils} from '@utils/date.utils';

/**
 * Batch Scheduler Modal Component - Component where a user can configure a schedule for a batch report favorite
 */
@Component({
    selector: 'app-batch-scheduler-modal',
    templateUrl: './batch-scheduler-modal.component.html',
    styleUrls: ['./batch-scheduler-modal.component.scss']
})
export class BatchSchedulerModalComponent extends SubscribableComponent implements OnInit {
    static timeRegEx = new RegExp(/([012]|[0-9]):[0-5][0-9]/); // Regular expression to match 24 hour time format (ex: 16:30)
    static stringRegEx = new RegExp(/\S+/); // Regular expression to match on any number of non-whitespace characters

    @Input() isOpen: boolean;
    @Output() modalClosed = new EventEmitter<void>();

    scheduledBatchConfig: ScheduledBatchConfig;

    timeValue: string; // Time that the scheduled batch will run
    timeZone: string;
    dailyFrequencyHolder: BatchDailyFrequency = new BatchDailyFrequency();
    monthlyFrequencyHolder: BatchMonthlyFrequency = new BatchMonthlyFrequency();
    batchFrequencySelection: BatchFrequency;
    fileNamePrefix = '';
    directory = '';

    timeZoneOptions: AuxSelectOptionGroup[];
    frequencyOptions: AuxSelectOptionGroup[];
    dailyFrequencyOptions: ExploreCheckbox[];

    constructor(private favoriteService: FavoriteService, private notificationService: NotificationService) {
        super();
    }

    ngOnInit(): void {
        const {timeZone, timeZoneOptions} = DateUtils.initializeTimeZoneOptions();
        [this.timeZone, this.timeZoneOptions] = [timeZone, timeZoneOptions];
        this.initializeFrequencyOptions();

        BatchExportingStore.getCurrentScheduledBatchConfig$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((scheduledBatchConfig) => {
                this.scheduledBatchConfig = scheduledBatchConfig;

                // If there is already a schedule, populate the fields with those values
                // NOTE: currently this is hardcoded to expect only 1 schedule per BatchReportConfig, but that can change in the future
                if (this.scheduledBatchConfig.batchSchedules[0]) {
                    const batchScheduleToUse = this.scheduledBatchConfig.batchSchedules[0];

                    this.timeValue = batchScheduleToUse.timeValue;
                    this.directory = batchScheduleToUse.directory;
                    this.fileNamePrefix = batchScheduleToUse.fileNamePrefix ?? '';
                    this.timeZone = batchScheduleToUse.timeZone;
                    // Make a copy of the BatchFrequency currently set in the BatchSchedule
                    this.batchFrequencySelection = cloneDeep(batchScheduleToUse.frequency);
                    if (batchScheduleToUse.frequency instanceof BatchDailyFrequency) {
                        this.dailyFrequencyHolder = this.batchFrequencySelection as BatchDailyFrequency;
                    } else {
                        this.monthlyFrequencyHolder = this.batchFrequencySelection as BatchMonthlyFrequency;
                    }
                    // Reinitialize the frequency options so we can pre-populate the fields
                    this.initializeFrequencyOptions();
                } else {
                    this.scheduledBatchConfig.batchSchedules.push(new BatchSchedule());
                }
            });
    }

    /**
     * Initialize the frequency options for the dropdown
     */
    initializeFrequencyOptions(): void {
        const selectedValue = this.batchFrequencySelection?.getBatchScheduleFrequency();
        this.frequencyOptions = ExploreSelectOptionGroup.createSimpleSelectOptionGroup([BatchScheduleFrequency.DAILY, BatchScheduleFrequency.MONTHLY], null, selectedValue);
        // Create checkbox options for each day
        this.dailyFrequencyOptions = [
            new ExploreCheckbox('Sunday', this.dailyFrequencyHolder.sunday, false),
            new ExploreCheckbox('Monday', this.dailyFrequencyHolder.monday, false),
            new ExploreCheckbox('Tuesday', this.dailyFrequencyHolder.tuesday, false),
            new ExploreCheckbox('Wednesday', this.dailyFrequencyHolder.wednesday, false),
            new ExploreCheckbox('Thursday', this.dailyFrequencyHolder.thursday, false),
            new ExploreCheckbox('Friday', this.dailyFrequencyHolder.friday, false),
            new ExploreCheckbox('Saturday', this.dailyFrequencyHolder.saturday, false)
        ];
    }

    /**
     * Callback when the time entry value has been changed
     * @param event - event from the web component
     */
    onTimeValueChanged(event: CustomEvent<AuxInputMaskValueChangedDetailInterface>): void {
        if (BatchSchedulerModalComponent.timeRegEx.test(event.detail.value)) {
            // Set the time value after validating
            this.timeValue = event.detail.value;
        }
    }

    /**
     * Callback when the time zone dropdown has been changed
     * @param event - event from the web component
     */
    onTimeZoneChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.timeZone = (event.detail.value as ExploreSelectOption).value;
    }

    /**
     * Callback when the frequency dropdown has been changed
     * @param event - event from the web component
     */
    onFrequencyChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.batchFrequencySelection = (event.detail.value as ExploreSelectOption).value === BatchScheduleFrequency.DAILY ? this.dailyFrequencyHolder : this.monthlyFrequencyHolder;
    }

    /**
     * Callback when the daily frequency checkbox group has been changed
     * @param event - event from the web component
     */
    onDailyFrequencyChanged(event: CustomEvent<AuxCheckboxGroupChangedDetailInterface>): void {
        const batchDailyFrequency = this.batchFrequencySelection as BatchDailyFrequency;
        // Go through each of the checkbox options and map to the corresponding attribute in the Daily frequency
        for (const checkboxOption of event.detail.value) {
            batchDailyFrequency[checkboxOption.label.toLowerCase()] = checkboxOption.checked;
        }
    }
    /**
     * Callback when the monthly frequency numeric stepper has been changed
     * @param event - event from the web component
     */
    onMonthlyFrequencyChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        (this.batchFrequencySelection as BatchMonthlyFrequency).numericalDay = event.detail.value;
    }

    /**
     * Callback when the folder name input value has been changed
     * @param event - event from the web component
     */
    onDirectoryNameChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        this.directory = event.detail.value;
    }

    /**
     * Callback when the file name prefix input value has been changed
     * @param event - event from the web component
     */
    onFileNamePrefixChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        this.fileNamePrefix = event.detail.value;
    }

    /**
     * Returns true if we want to disable the schedule button
     */
    disableScheduleButton(): boolean {
        return !BatchSchedulerModalComponent.timeRegEx.test(this.timeValue) || !this.timeZone || !this.batchFrequencySelection || !this.batchFrequencySelection.isValid();
    }

    /**
     * Callback when the user clicks the schedule batch
     */
    scheduleBatchConfig(): void {
        // NOTE: We are only supporting one schedule per BatchReportConfig, so this is hardcoded to update the first schedule
        const batchSchedule = this.scheduledBatchConfig.batchSchedules[0];
        batchSchedule.timeValue = this.timeValue;
        batchSchedule.timeZone = this.timeZone;
        batchSchedule.frequency = this.batchFrequencySelection;
        // batchSchedule.directory = BatchSchedulerModalComponent.stringRegEx.test(this.directory) ? this.directory.trim() : this.scheduledBatchConfig.title;
        // TODO: figure out what to allow for file name prefixes. Is empty string okay?
        batchSchedule.fileNamePrefix = BatchSchedulerModalComponent.stringRegEx.test(this.fileNamePrefix) ? ExportUtils.sanitizeFileName(this.fileNamePrefix.trim()) : this.scheduledBatchConfig.title;
        batchSchedule.dateLastUpdated = CalendarDateUtils.getTodayDate();
        batchSchedule.lastUpdatedBy = CoreUserMetaDataStore.userMetaData.login;

        // In case the scheduledBatchConfig doesn't have an author, add the current user as the main author
        if (!this.scheduledBatchConfig.author) {
            this.scheduledBatchConfig.author = CoreUserMetaDataStore.userMetaData.login;
        }

        this.favoriteService.saveFavorite$(this.scheduledBatchConfig.createFavorite(this.scheduledBatchConfig.getConfigType()), FavoriteConstants.ADMIN_USER)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((response: SaveFavoriteResult) => {
                if (response && response.status === DataRequestConstants.SUCCESS_RESPONSE) {
                    this.notificationService.success('Successfully scheduled batch export config - ' + this.scheduledBatchConfig.title);
                    this.scheduledBatchConfig.id = response.favoriteId;
                    this.scheduledBatchConfig.owner = FavoriteConstants.ADMIN_USER;
                    BatchExportingStore.scheduledBatchMap.set(this.scheduledBatchConfig.batchReportConfigId, this.scheduledBatchConfig);
                }
                this.closeModal();
            }, error => {
                console.error(error);
                this.notificationService.error('Error occurred while saving: ' + error.toString(), ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_SAVE_FAVORITE_ERROR);
                this.closeModal();
            });
    }

    /**
     * Close the batch scheduler modal
     */
    closeModal(): void {
        this.isOpen = false;
        BatchReportingService.batchSchedulerModalOpen$.next(false);
        this.modalClosed.emit();
    }
}
