import {Component, OnInit} from '@angular/core';
import {
    AuxBadgeStyleEnum,
    AuxButtonTypeEnum,
    AuxCardType,
    AuxQuickFilterBarClickedDetailInterface,
    AuxQuickFilterBarInterface,
    AuxQuickFilterButtonTypeEnum
} from '@blk/aladdin-angular-components';
import {JOBS, JobState} from '../../../constants/export-hub.constants';
import {ExportHubStore} from '@stores/export-hub.store';
import {isEmpty} from 'lodash';
import {CommonConstants} from '@constants/common.constants';
import {
    ExportHubJob,
    Frequency
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {FREQUENCY_LABEL_MAP, FREQUENCY_LABELS} from '../../../enums/frequency.constants';
import {JobService} from '../../../services/job.service';
import {NotificationService} from '@services/notification';
import {CalendarDateUtils} from '@blk/explore-ui-core';
import {DateUtils} from '@utils/date.utils';

@Component({
    selector: 'app-job-management',
    templateUrl: './job-management.component.html',
    styleUrls: ['./job-management.component.scss']
})
export class JobManagementComponent implements OnInit {

    weeklyCount : number ;
    onceCount : number;
    dailyCount : number;
    monthlyCount : number;
    yearlyCount : number;
    allScheduledJobs: ExportHubJob[] = [];
    filteredActiveScheduledJobs: ExportHubJob[] = [];
    inactiveJobs: ExportHubJob[] = [];
    activeJobs: ExportHubJob[] = [];
    quickFilterBarData: AuxQuickFilterBarInterface[] = [];

    /**
     * constructor
     */
    constructor(private exportHubStore: ExportHubStore, private jobService : JobService, private notificationService : NotificationService) {
    }

    ngOnInit(): void {
        this.initializeData();
    }

    initializeData(){
        // We are initializing this here because when we refresh jobs we want to reset these values
        this.weeklyCount = 0;
        this.onceCount = 0;
        this.dailyCount = 0;
        this.monthlyCount = 0;
        this.yearlyCount = 0;
        this.allScheduledJobs = this.exportHubStore.getScheduledJobs();
        this.activeJobs = this.allScheduledJobs.filter(job => job.getState() === JobState.ACTIVE);
        this.inactiveJobs = this.allScheduledJobs.filter(job => job.getState() === JobState.INACTIVE || job.getState() === JobState.EXPIRED);
        this.filteredActiveScheduledJobs = this.activeJobs;
        this.initializeQuickFilterBarData();
    }

    updateFilterBarDataOnDelete(jobToDelete : string){
        // delete the job from the export hub store
        for (const key of this.exportHubStore.scheduledJobsMap.keys()) {
            if (key === jobToDelete) {
                const deletedJob = this.exportHubStore.scheduledJobsMap.get(key);
                deletedJob.setState(JobState.INACTIVE);
                deletedJob.setChangeTime(DateUtils.convertDateStringToTimestamp(CalendarDateUtils.getTodayDate()));
                break;
            }
        }

        this.initializeData();
    }

    refreshJobs() {
        this.jobService.getAllScheduledJobs$().subscribe({
            next: (jobs: ExportHubJob[]) => {
                if(!isEmpty(jobs)){
                    this.exportHubStore.populateJobsMap(jobs);
                    //recreate the table and filter data with the new jobs
                    this.initializeData();
                }else{
                    this.notificationService.error('No scheduled jobs found');
                }
            },
            error: () => {
                this.notificationService.error('Failed to refresh jobs');
            }
        });
    }

    /**
     * quick filter bar change event handler
     */
    filterDataChangedHandler(event: CustomEvent<AuxQuickFilterBarClickedDetailInterface>) {
        const selectedTabs = event.detail.values.map(value => value.label);
        if (!isEmpty(selectedTabs)) {
            this.filteredActiveScheduledJobs = this.activeJobs.filter(job => selectedTabs.includes(FREQUENCY_LABEL_MAP.get(job.getJobSchedulesList()[0].getJobFrequency())));
        } else {
            this.filteredActiveScheduledJobs = this.activeJobs;
        }
    }

    /**
     * updating count of jobs
     */
    private initializeQuickFilterBarData() {
        this.activeJobs.forEach(item => {
            switch (item.getJobSchedulesList()[0]?.getJobFrequency()) {
                case Frequency.FREQUENCY_ONCE:
                    this.onceCount++;
                    break;
                case Frequency.FREQUENCY_WEEKLY:
                    this.weeklyCount++;
                    break;
                case Frequency.FREQUENCY_DAILY:
                    this.dailyCount++;
                    break;
                case Frequency.FREQUENCY_MONTHLY:
                    this.monthlyCount++;
                    break;
                case Frequency.FREQUENCY_YEARLY:
                    this.yearlyCount++;
                    break;
            }
        });
        this.updateQuickFilterData();
    }

    /**
     * updating quick filter data
     */
    private updateQuickFilterData() {
        this.quickFilterBarData = [
            {
                filterButtonType: AuxQuickFilterButtonTypeEnum.TEXT,
                data: [
                    {
                        badgeStyle: AuxBadgeStyleEnum.NEUTRAL,
                        label: FREQUENCY_LABELS.ONCE,
                        value: this.onceCount.toString() + CommonConstants.SINGLE_SPACE + JOBS,
                        isSelected: false
                    },
                    {
                        badgeStyle: AuxBadgeStyleEnum.NEUTRAL,
                        label: FREQUENCY_LABELS.DAILY,
                        value: this.dailyCount.toString() + CommonConstants.SINGLE_SPACE + JOBS,
                        isSelected: false
                    },
                    {
                        badgeStyle: AuxBadgeStyleEnum.NEUTRAL,
                        label: FREQUENCY_LABELS.WEEKLY,
                        value: this.weeklyCount.toString() + CommonConstants.SINGLE_SPACE + JOBS,
                        isSelected: false
                    },
                    {
                        badgeStyle: AuxBadgeStyleEnum.NEUTRAL,
                        label: FREQUENCY_LABELS.MONTHLY,
                        value: this.monthlyCount.toString() + CommonConstants.SINGLE_SPACE + JOBS,
                        isSelected: false
                    },
                    {
                        badgeStyle: AuxBadgeStyleEnum.NEUTRAL,
                        label: FREQUENCY_LABELS.YEARLY,
                        value: this.yearlyCount.toString() + CommonConstants.SINGLE_SPACE + JOBS,
                        isSelected: false
                    }
                ]
            }
        ];
    }

    protected readonly AuxCardType = AuxCardType;
    protected readonly AuxButtonTypeEnum = AuxButtonTypeEnum;


}
