import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {isEmpty, isNil} from 'lodash';
import {
    FREQUENCY_LABEL_MAP,
    MONTH_LABEL_MAP,
    WEEK_DAY_LABEL_MAP,
    WEEK_DAY_OCCURRENCE_LABEL_MAP
} from '../../enums/frequency.constants';
import {ScheduleJobSteps} from '../../enums/schedule-job-steps';
import {JobReviewSettingsHolder} from '../../interfaces/job-review-settings-holder.interface';
import {
    EndPeriod,
    ExportHubJob,
    ExportHubJobSchedule,
    Frequency
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {JobService} from '../../services/job.service';
import {NotificationService} from '@services/notification';
import {DateUtils} from '@utils/date.utils';
import {ExploreSelectOption} from '@blk/explore-ui-core';
import {ExportHubUtils} from '../../utils/export-hub.utils';

@Component({
    selector: 'app-job-review-settings',
    templateUrl: './job-review-settings.component.html',
    styleUrls: ['./job-review-settings.component.scss']
})
export class JobReviewSettingsComponent implements OnInit {
    protected readonly ScheduleJobSteps = ScheduleJobSteps;

    @Input() exportHubJob: ExportHubJob;
    @Output() currentStepEmitter = new EventEmitter<ScheduleJobSteps>();

    noOfPortfolios: number;
    noOfWidgets: number;
    scheduleSettingsDisplay: JobReviewSettingsHolder [];
    exportSettingsDisplay: JobReviewSettingsHolder [];
    options: Intl.DateTimeFormatOptions = {
        day: 'numeric', month: 'long', year: 'numeric'
    };

    constructor(private jobService : JobService, private notificationService : NotificationService) {
    }

    ngOnInit() {
        this.noOfPortfolios = this.exportHubJob.getJobPortfoliosList()?.length;
        this.noOfWidgets = this.exportHubJob.getJobWidgetsList()?.length;
        const scheduleSettings = this.exportHubJob.getJobSchedulesList()[0];
        const timeZones : ExploreSelectOption[] = DateUtils.initializeTimeZoneOptions()['timeZoneOptions'][0].values;
        this.scheduleSettingsDisplay = [
            ...(isNil(scheduleSettings.getJobStartDate()) ? [] : [{ displayName: 'From', value: new Date(scheduleSettings.getJobStartDate().getYear(), scheduleSettings.getJobStartDate().getMonth() - 1, scheduleSettings.getJobStartDate().getDay()).toLocaleDateString('en-GB', this.options)}]),
            ...(isNil(scheduleSettings.getJobFrequency()) ? [] : [{ displayName: 'Frequency', value: FREQUENCY_LABEL_MAP.get(scheduleSettings.getJobFrequency())}]),
            ...(isNil(this.extractEvery(scheduleSettings)) ? [] : [this.extractEvery(scheduleSettings)]),
            ...(isNil(scheduleSettings.getJobTime()) ? [] : [{displayName: 'At', value: scheduleSettings.getJobTime() + ' ' + timeZones.find(option => option.value === scheduleSettings.getJobTimeZone()).displayValue}]),
            ...(scheduleSettings.getJobEndPeriod() === EndPeriod.END_PERIOD_ON_THIS_DAY && !isNil(scheduleSettings.getJobEndDate()) ? [{displayName: 'End', value: new Date(scheduleSettings.getJobEndDate().getYear(), scheduleSettings.getJobEndDate().getMonth() - 1, scheduleSettings.getJobEndDate().getDay()).toLocaleDateString('en-GB', this.options)}] : [])
        ];
        if (scheduleSettings.getJobEndPeriod() === EndPeriod.END_PERIOD_AFTER_N_OCCURRENCES || scheduleSettings.getJobEndPeriod() === EndPeriod.END_PERIOD_ON_THIS_DAY) {
            const occurrences = this.calculateOccurrences();
            if (!isEmpty(occurrences)) {
                this.scheduleSettingsDisplay.push({displayName: 'First ' + occurrences.length + ' Occurrences', value: occurrences.join('\r\n')});
            }
        }
        this.exportSettingsDisplay = [
            { displayName: 'Job Name', value: this.exportHubJob.getName()},
            { displayName: 'Export As', value: this.exportHubJob.getExportType().toUpperCase()},
            { displayName: 'To', value: ExportHubUtils.getOutputLocation()},
        ];
    }

    extractEvery(scheduleSettings: ExportHubJobSchedule) {
        const every = {
            displayName: 'Every',
            value : ''
        };
        switch (scheduleSettings.getJobFrequency()) {
            case Frequency.FREQUENCY_ONCE:
                return;
            case Frequency.FREQUENCY_DAILY:
                every.value = scheduleSettings.getDaily().getDayInterval().toString() + ' day(s)';
                break;
            case Frequency.FREQUENCY_WEEKLY:
                every.value = scheduleSettings.getWeekly().getWeekDaysList().map(weekday => WEEK_DAY_LABEL_MAP.get(weekday)).join(', ');
                break;
            case Frequency.FREQUENCY_MONTHLY:
                every.value = scheduleSettings.getMonthly().getMonthInterval().toString() + ' month(s) on the ' + ((scheduleSettings.getMonthly().getMonthDay()) ? (scheduleSettings.getMonthly().getMonthDay().toString()) + ' day' : WEEK_DAY_OCCURRENCE_LABEL_MAP.get(scheduleSettings.getMonthly().getWeekDayOccurrence()).toLowerCase() + ' ' + WEEK_DAY_LABEL_MAP.get(scheduleSettings.getMonthly().getWeekDay()).toLowerCase());
                break;
            case Frequency.FREQUENCY_YEARLY:
                every.value = MONTH_LABEL_MAP.get(scheduleSettings.getYearly().getMonth()) + ' on the ' + ((scheduleSettings.getYearly().getMonthDay()) ? (scheduleSettings.getYearly().getMonthDay().toString()) + ' day' : WEEK_DAY_OCCURRENCE_LABEL_MAP.get(scheduleSettings.getYearly().getWeekDayOccurrence()).toLowerCase() + ' ' + WEEK_DAY_LABEL_MAP.get(scheduleSettings.getYearly().getWeekDay()).toLowerCase());
                break;
        }

        return every;
    }


    /**
     * Calculate the occurrences
     * @private
     */
    private calculateOccurrences(): string [] {
        // TODO make call to BE once date resolution logic is done in BE
        return [];
    }


    /**
     * handler for edit buttons
     * @param jobStep
     */
    editButtonClickHandler(jobStep: ScheduleJobSteps) {
        this.currentStepEmitter.emit(jobStep);
    }

    /**
     * handler for run test job button
     */
    runTestJob() {
        this.jobService.runTestJob$(this.exportHubJob).subscribe({
                next: (isSuccessful : boolean) => {
                    if (isSuccessful) {
                        this.notificationService.success('Test job successfully ran');
                    } else {
                        this.notificationService.error('Test job run failed');
                    }
                },
                error: () => {
                    this.notificationService.error('Something went wrong while running test job');
                }
        });
    }
}
