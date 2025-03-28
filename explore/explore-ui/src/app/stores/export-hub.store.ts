import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {ScheduleJobModalParams} from '../modules/export-hub/types/schedule-job-modal-params.interface';
import {
    ExportHubJob
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {JobExecutionHistoryParamsInterface} from '../modules/export-hub/types/job-execution-history-params.interface';

@Injectable({
    providedIn: 'root'
})
export class ExportHubStore {

    scheduleJobModalOpen$ = new Subject<ScheduleJobModalParams>();

    jobExecutionHistoriesModalOpen$ = new Subject<JobExecutionHistoryParamsInterface>();

    // Scheduled Jobs
    scheduledJobsMap = new Map<string, ExportHubJob>();

    recentlyCreatedJobsMap = new Map<string, ExportHubJob>();


    getScheduledJobs(): ExportHubJob[] {
        return Array.from(this.scheduledJobsMap.values());
    }

    openScheduleJobModal(scheduledJob?: ExportHubJob) {
        this.scheduleJobModalOpen$.next({isOpen: true, job: scheduledJob});
    }

    closeScheduleJobModal() {
        this.scheduleJobModalOpen$.next({isOpen: false});
    }

    populateJobsMap(jobs: ExportHubJob[]) {
        this.scheduledJobsMap.clear();
        jobs.forEach(job => {
            this.scheduledJobsMap.set(job.getId(), job);
        });

        if (this.recentlyCreatedJobsMap.size > 0) {
            this.recentlyCreatedJobsMap.forEach((job, key) => {
                this.scheduledJobsMap.set(key, job);
            });
            this.recentlyCreatedJobsMap.clear();
        }
    }
}
