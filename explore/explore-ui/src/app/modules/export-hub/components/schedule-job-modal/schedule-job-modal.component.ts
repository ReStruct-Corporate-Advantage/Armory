import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {AuxProgressStepperState} from '@blk/aladdin-angular-components';
import {ExportHubStore} from '@stores/export-hub.store';
import {ScheduleJobSteps} from '../../enums/schedule-job-steps';
import {JobService} from '../../services/job.service';
import {BUTTON_LABELS, JobState} from '../../constants/export-hub.constants';
import {
    EndPeriod,
    ExportHubJob,
    ExportHubJobPortfolio,
    ExportHubJobSchedule,
    Frequency
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {isEmpty, isNil} from 'lodash';
import {NotificationService} from '@services/notification';
import {JobPortfoliosComponent} from './job-portfolios/job-portfolios.component';
import {JobCreationParams} from '../../interfaces/job-creation-params.interface';


@Component({
    selector: 'app-schedule-job-modal',
    templateUrl: './schedule-job-modal.component.html',
    styleUrls: ['./schedule-job-modal.component.scss']
})
export class ScheduleJobModalComponent {

    @ViewChild('jobPortfoliosComponent') jobPortfoliosComponent: JobPortfoliosComponent;

    readonly ScheduleJobSteps = ScheduleJobSteps;
    readonly ACTIVE_STATE: AuxProgressStepperState = 'active';
    readonly COMPLETE_STATE: AuxProgressStepperState = 'complete';
    readonly INCOMPLETE_STATE: AuxProgressStepperState = 'incomplete';
    @Input() isOpen = false;
    @Input() exportHubJob: ExportHubJob = new ExportHubJob();
    @Output() createJobHandler = new EventEmitter<JobCreationParams>();
    currentStep = ScheduleJobSteps.PORTFOLIOS_AND_WIDGETS;
    nextButtonLabel = 'Next';
    validatorCallback: () => boolean;
    @ViewChild('contentWrapper') contentWrapper: ElementRef;

    jobSchedulingSteps = [
        {
            state: 'active',
            label: 'Portfolios & Widgets',
            index: 0
        },
        {
            state: 'incomplete',
            label: 'Schedule',
            index: 1
        },
        {
            state: 'incomplete',
            label: 'Settings',
            index: 2
        },
        {
            state: 'incomplete',
            label: 'Review',
            index: 3
        }
    ];

    /**
     * constructor
     */
    constructor(private exportHubStore: ExportHubStore, private jobService: JobService, private notification: NotificationService) {
    }

    /**
     * dialog close event on footer button click
     */
    closeScheduleJobModal() {
        this.isOpen = false;
        this.exportHubStore.closeScheduleJobModal();
    }

    /**
     * progress stepper next clicked event call
     */
    nextStep() {
        // This wil be not null only when we are editing a job, for creation it will be null
        const editJobId = this.exportHubJob.getId();
        this.currentStep = this.jobSchedulingSteps.findIndex(step => step.state === this.ACTIVE_STATE);
        if (!this.isCurrentStepValid()) {
            return;
        }
        if (this.currentStep !== ScheduleJobSteps.REVIEW) {
            this.jobSchedulingSteps[this.currentStep].state = this.COMPLETE_STATE;
            this.jobSchedulingSteps[this.currentStep + 1].state = this.ACTIVE_STATE;
            this.currentStep++;
            this.jobSchedulingSteps = [...this.jobSchedulingSteps];
            if (this.currentStep === ScheduleJobSteps.REVIEW) {
                this.nextButtonLabel = (editJobId) ? BUTTON_LABELS.EDIT_JOB : BUTTON_LABELS.CREATE_JOB;
            }
        } else if (this.currentStep === ScheduleJobSteps.REVIEW) {

            this.jobService.scheduleJob$(this.exportHubJob, !!editJobId).subscribe((id : string)  => {
                if (id) {
                    this.exportHubJob.setId(id);
                    this.exportHubJob.setState(JobState.ACTIVE);
                    this.exportHubStore.recentlyCreatedJobsMap.set(id, this.exportHubJob);
                    this.closeScheduleJobModal();
                    this.createJobHandler.emit({jobName: this.exportHubJob.getName(), isJobEdited : !!editJobId} as JobCreationParams);
                }
            });
        }
        this.scrollToTop();
    }

    /**
     * progress stepper back clicked event call
     */
    backStep() {
        this.currentStep = this.jobSchedulingSteps.findIndex(step => step.state === 'active');
        if (this.currentStep === ScheduleJobSteps.REVIEW) {
            this.nextButtonLabel = BUTTON_LABELS.NEXT;
        }
        if (this.currentStep !== ScheduleJobSteps.PORTFOLIOS_AND_WIDGETS) {
            this.jobSchedulingSteps[this.currentStep].state = this.INCOMPLETE_STATE;
            this.jobSchedulingSteps[this.currentStep - 1].state = this.ACTIVE_STATE;
            this.currentStep--;
            this.jobSchedulingSteps = [...this.jobSchedulingSteps];
        }
        this.scrollToTop();
    }

    private scrollToTop() {
        if (this.contentWrapper) {
            this.contentWrapper.nativeElement.scrollTop = 0;
        }
    }

    /**
     * Handler for current Step event emitter
     * @param currentStep
     */
    currentStepChangeHandler(currentStep: ScheduleJobSteps) {
        this.jobSchedulingSteps[this.currentStep].state = this.COMPLETE_STATE;
        this.currentStep = currentStep;
        this.jobSchedulingSteps[this.currentStep].state = this.ACTIVE_STATE;
        this.jobSchedulingSteps = [...this.jobSchedulingSteps];
        this.nextButtonLabel = 'Next';
    }

    /**
     * Validate the current step
     */
    private isCurrentStepValid(): boolean {
        //this.validatorCallback is validating the dates
        switch (this.currentStep) {
            case ScheduleJobSteps.PORTFOLIOS_AND_WIDGETS:
                return this.validateJobPortAndWidgets();
            case ScheduleJobSteps.SCHEDULE:
                return this.validatorCallback() && this.validateScheduleSettings(this.exportHubJob.getJobSchedulesList()[0]);
            case ScheduleJobSteps.SETTINGS:
                return this.validatorCallback() && this.validateExportSettings(this.exportHubJob);
            case ScheduleJobSteps.REVIEW:
                return true;
        }
    }

    private validateJobPortAndWidgets(): boolean {
        if (!this.exportHubJob.getJobPortfoliosList()?.length || !this.exportHubJob.getJobWidgetsList()?.length) {
            this.notification.error('Please add at least one Portfolio and one Widget');
            return false;
        }

        let uniqueWidgetNames = new Set();
        this.exportHubJob.getJobWidgetsList().forEach(widget => {
            uniqueWidgetNames.add(widget.getTitle());
        })

        if (uniqueWidgetNames.size !== this.exportHubJob.getJobWidgetsList().length) {
            this.notification.error('The widget names should be unique. Please provide a unique name for each widget.');
            return false;
        }

        const downstreamMessage = this.jobPortfoliosComponent.validatePortRecordAttributes();
        if (!isEmpty(downstreamMessage)) {
            this.notification.error(downstreamMessage);
            return false;
        }

        return true;
    }

    /**
     * Validate schedule settings
     */
    validateScheduleSettings(scheduleSettings: ExportHubJobSchedule): boolean {
        // common values for all frequencies
        const isValid = !isNil(scheduleSettings.getJobStartDate()) && !isNil(scheduleSettings.getJobTime())
            && !isNil(scheduleSettings.getJobTimeZone());

        if (!isValid) {
            return false;
        }

        const isValidEndPeriod = ((scheduleSettings.getJobEndPeriod() === EndPeriod.END_PERIOD_NEVER)
            || (scheduleSettings.getJobEndPeriod() === EndPeriod.END_PERIOD_ON_THIS_DAY && !isNil(scheduleSettings.getJobEndDate()))
            || (scheduleSettings.getJobEndPeriod() === EndPeriod.END_PERIOD_AFTER_N_OCCURRENCES && !isNil(scheduleSettings.getJobEndOccurrence())));

        if(scheduleSettings.getJobFrequency()){
            return true
        }else if(!isValidEndPeriod){
            return false;
        }

        switch (scheduleSettings.getJobFrequency()) {
            case Frequency.FREQUENCY_DAILY:
                return !isNil(scheduleSettings.getDaily().getDayInterval());
            case Frequency.FREQUENCY_WEEKLY:
                return  !isNil(scheduleSettings.getWeekly().getWeekDaysList());
            case Frequency.FREQUENCY_MONTHLY:
                return  scheduleSettings.getMonthly().getMonthInterval() && !isNil(scheduleSettings.getMonthly().getMonthDay()) || (!isNil(scheduleSettings.getMonthly().getWeekDayOccurrence()) && !isNil(scheduleSettings.getMonthly().getWeekDay()));
            case Frequency.FREQUENCY_YEARLY:
                return  scheduleSettings.getYearly().getMonth() && !isNil(scheduleSettings.getYearly().getMonthDay()) || (!isNil(scheduleSettings.getYearly().getWeekDayOccurrence()) && !isNil(scheduleSettings.getYearly().getWeekDay()));
        }
    }

    validateExportSettings(scheduledJob: ExportHubJob) {
        return !isEmpty(scheduledJob.getName());
    }

    portfolioChangeHandler($event: ExportHubJobPortfolio[]) {
        this.exportHubJob.setJobPortfoliosList($event);
    }
}
