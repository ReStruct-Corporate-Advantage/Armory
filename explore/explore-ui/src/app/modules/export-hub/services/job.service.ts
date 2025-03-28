import {Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CalendarDateUtils, HTTP_SERVICE_TOKEN, HttpServiceInterface} from '@blk/explore-ui-core';
import {RequestConstants} from '@constants/request.constants';
import {isArray} from 'lodash';
import {catchError, map} from 'rxjs/operators';
import {ScheduledJobExecutionParamsInterface} from '../types/scheduled-job-execution-params.interface';
import {DataRequestConstants} from '@constants/data-request.constants';
import {
    ExportHubJob,
    ExportHubJobExecutionHistory
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import {HttpUtils} from '@utils/http.utils';
import {HttpParams} from '@angular/common/http';
import {StatusConstants} from '@constants/status.constants';
import {ExportHubUtils} from '../utils/export-hub.utils';

@Injectable({
    providedIn: 'root'
})
export class JobService {

    constructor(@Inject(HTTP_SERVICE_TOKEN) private http2BmsService: HttpServiceInterface) {
    }

    /**
     * api call for jobs LIST
     * @returns
     */
    getDailyExecutionHistories$(): Observable<ExportHubJobExecutionHistory[]> {
        const todayDate = CalendarDateUtils.getTodayDate();
        const payload = {
            startDate: todayDate,
            endDate: todayDate
        };

        return this.http2BmsService.post$(RequestConstants.GET_JOB_EXECUTION_HISTORIES, payload).pipe(
            map((response: any): ExportHubJobExecutionHistory[] => {
                if (isArray(response.data)) {
                    return this.transformDataAsExportHubJobExecutionHistory(response.data);
                }
                return [];
            }),
            catchError(error => {
                console.error(error.message);

                throw error;
            })
        );
    }

    /**
     * api call to get all the scheduled jobs
     * @returns
     */
    getAllScheduledJobs$(): Observable<ExportHubJob[]> {
       let params = HttpUtils.getCopiedParamWithLoadingKeyAndMessage(new HttpParams(), StatusConstants.FETCH_ALL_SCHEDULED_JOBS);


        return this.http2BmsService.get$(RequestConstants.GET_ALL_EXPORT_HUB_JOBS, params).pipe(
            map((response: any): ExportHubJob[] => {
                if (isArray(response.data)) {
                    return this.transformDataAsExportHubJob(response.data);
                }
                return [];
            }),
            catchError(error => {
                console.error(error.message);

                throw error;
            })
        );
    }

    /**
     * api call for scheduling jobs
     * @param scheduledJobConfig
     * @param isJobEdited
     * @returns
     */
    scheduleJob$(scheduledJobConfig: ExportHubJob, isJobEdited : boolean): Observable<any> {
        const loadingMessage = isJobEdited ? StatusConstants.UPDATING_EXPORT_HUB_JOB : StatusConstants.CREATING_EXPORT_HUB_JOB;
        const params = HttpUtils.getCopiedParamWithLoadingKeyAndMessage(new HttpParams(), loadingMessage);

        return this.http2BmsService.post$(RequestConstants.CREATE_EXPORT_HUB_JOB,  ExportHubUtils.createExportHubJobPayload(scheduledJobConfig), params).pipe(
            map((response: any): string => {
                if(response && response.status === DataRequestConstants.SUCCESS_RESPONSE) {
                    return response.data.id;
                }
                return null;
            })
        );
    }

    /**
     * api call for jobs DELETE
     * @param id
     * @returns
     */
    delete$(id: string): Observable<ScheduledJobExecutionParamsInterface> {
        return this.http2BmsService.post$(RequestConstants.DELETE_SCHEDULED_JOB, {id}, null).pipe(
            map((response: any) => {
                return {
                    isSuccessful: response.status === DataRequestConstants.SUCCESS_RESPONSE
                } as ScheduledJobExecutionParamsInterface;
            })
        );
    }

    /**
     * get scheduled job corresponding to job id
     * @param id
     */
    getScheduledJobById$(id: string): Observable<ExportHubJob> {
        let params = HttpUtils.getCopiedParamWithLoadingKeyAndMessage(new HttpParams(), StatusConstants.FETCHING_JOB_DETAILS);


        return this.http2BmsService.post$(RequestConstants.GET_EXPORT_HUB_JOB_BY_ID, {id}, params).pipe(
            map((response: any): ExportHubJob => {
                if (response.data) {
                    return ExportHubUtils.decodeExportHubJob(response.data);
                }
            }), catchError((error: Error) => {
                console.error(error.message);
                throw new Error();
            })
        );
    }

    /**
     * Get job execution history by job id
     * @param id
     */
    getJobExecutionHistoryById$(id: string): Observable<ExportHubJobExecutionHistory[]> {
        let params = HttpUtils.getCopiedParamWithLoadingKeyAndMessage(new HttpParams(), StatusConstants.GETTING_JOB_EXECUTION_HISTORY);


        return this.http2BmsService.post$(RequestConstants.GET_JOB_EXECUTION_HISTORY_BY_ID, {id}, params).pipe(
            map((response: any): ExportHubJobExecutionHistory[] => {
                if (response.data) {
                    return this.transformDataAsExportHubJobExecutionHistory(response.data);
                }
            }), catchError((error: Error) => {
                console.error(error.message);
                throw new Error();
            })
        );
    }

    /**
     * api call for scheduling jobs
     * @param scheduledJobConfig
     * @returns
     */
    runTestJob$(scheduledJobConfig: ExportHubJob): Observable<any> {
        let params = HttpUtils.getCopiedParamWithLoadingKeyAndMessage(new HttpParams(), StatusConstants.RUNNING_TEST_JOB);

        return this.http2BmsService.post$(RequestConstants.RUN_TEST_EXPORT_HUB_JOB,  ExportHubUtils.createExportHubJobPayload(scheduledJobConfig), params).pipe(
            map((response: any): boolean => {
                return response && response.status === DataRequestConstants.SUCCESS_RESPONSE;
            }), catchError((error: Error) => {
                console.error(error.message);
                throw new Error();
            })
        );
    }

    /**
     * transform data to ExportHubJobExecutionHistory
     * @param data
     * @private
     */
    private transformDataAsExportHubJob(data: any): ExportHubJob[] {
        return data.map(item => {
            return ExportHubUtils.decodeExportHubJob(item);
        });
    }

    /**
     * transform data to ExportHubJobExecutionHistory
     * @param data
     * @private
     */
    private transformDataAsExportHubJobExecutionHistory(data: any): ExportHubJobExecutionHistory[] {
        return data.map(item => {
            return ExportHubUtils.decodeJobExecutionHistory(item);
        });
    }
}
