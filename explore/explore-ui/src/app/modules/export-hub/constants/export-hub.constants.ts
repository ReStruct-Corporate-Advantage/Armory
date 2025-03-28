import {JobStatus} from '../enums/job-status';
import {
    JobExecutionState,
    JobExecutionStateMap
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';

export const JOB_MANAGEMENT = 'job-management';
export const PREVIOUSLY_USED_WIDGETS = 'previously-used-widgets';
export const PORTFOLIOS = 'portfolios';
export const PORTFOLIO = 'portfolio';
export const WIDGETS = 'widgets';
export const WIDGET = 'widget';
export const JOBS = 'jobs';
export const TIME_FORMAT = 'HH:mm';
export const PORTFOLIOS_RUN_AS_TYPE = 'PORTFOLIOS';



//Context Menu Options
export const CONTEXT_MENU_OPTIONS = {
    VIEW_EDIT: 'View/Edit',
    DELETE: 'Delete',
    DOWNLOAD: 'Download',
    VIEW_JOB_HISTORY: 'View job history'
};

export const CONTEXT_MENU_NOTIFICATION_MESSAGES = {
    DELETE_SUCCESS: 'Successfully deleted ',
    DELETE_FAILURE: 'Failed to delete the job '
};

export const BUTTON_LABELS = {
    NEXT: 'Next',
    CREATE_JOB: 'Create job',
    EDIT_JOB: 'Edit job'
}

export const EXPORT_HUB_JOB_STATES_REVERSED = new Map<JobExecutionStateMap[keyof JobExecutionStateMap], string>([
    [JobExecutionState.JOB_EXECUTION_STATE_FAILED, JobStatus.FAILED],
    [JobExecutionState.JOB_EXECUTION_STATE_IN_PROGRESS, JobStatus.IN_PROGRESS],
    [JobExecutionState.JOB_EXECUTION_STATE_SUCCESS, JobStatus.COMPLETE],
    [JobExecutionState.JOB_EXECUTION_STATE_SCHEDULED, JobStatus.SCHEDULED],
    [JobExecutionState.JOB_EXECUTION_STATE_PARTIAL_SUCCESS, JobStatus.PARTIALLY_COMPLETED],
]);

export enum JobState {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    EXPIRED = 'EXPIRED'
}

export enum JobStateLabel{
    DELETED = 'Deleted',
    ACTIVE = 'Active',
    EXPIRED = 'Expired'
}
