import {
    ExportHubJob
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';

export interface ScheduleJobModalParams {
    isOpen: boolean;
    job?: ExportHubJob;
}
