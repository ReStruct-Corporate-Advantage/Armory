import {TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import {JobService} from './job.service';
import {HTTP_SERVICE_TOKEN} from '@blk/explore-ui-core';
import {RequestConstants} from '@constants/request.constants';
import {DataRequestConstants} from '@constants/data-request.constants';
import {
    ExportHubJob,
    ExportHubJobExecutionHistory
} from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import moment from 'moment';
import {HttpParams} from '@angular/common/http';

describe('JobService', () => {
    let service: JobService;

    const http2BmsServiceStub = {
        get$: jest.fn(),
        post$: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {provide: HTTP_SERVICE_TOKEN, useValue: http2BmsServiceStub},
            ]
        });
        service = TestBed.inject(JobService);
    });

    describe('getDailyExecutionHistories$', () => {
        it('should fetch scheduled jobs successfully', () => {
            const response = { data: [new ExportHubJobExecutionHistory()] };
            http2BmsServiceStub.post$.mockReturnValue(of(response));

            service.getDailyExecutionHistories$().subscribe(jobs => {
                expect(jobs.length).toBe(1);
            });

            expect(http2BmsServiceStub.post$).toHaveBeenCalledTimes(1);
        });

        it('should return an empty array if response data is not an array', () => {
            const response = { data: {} };
            http2BmsServiceStub.post$.mockReturnValue(of(response));

            service.getDailyExecutionHistories$().subscribe(jobs => {
                expect(jobs.length).toBe(0);
            });
            const todayDate = moment().format('MM/DD/YYYY');
             expect(http2BmsServiceStub.post$).toHaveBeenCalledTimes(2);

        });
    });

    describe('scheduleJob$', () => {
        it('should create job and return true on success', () => {
            const job = new ExportHubJob();
            const response = {
                data: {id: 'test'},
                status: DataRequestConstants.SUCCESS_RESPONSE
            };
            http2BmsServiceStub.post$.mockReturnValue(of(response));

            service.scheduleJob$(job, false).subscribe(result => {
                expect(result).toBe('test');
            });

            expect(http2BmsServiceStub.post$).toHaveBeenCalledWith(RequestConstants.CREATE_EXPORT_HUB_JOB, {exportHubJob: btoa(String.fromCharCode(...job.serializeBinary()))}, expect.anything());
        });

        it('should edit job and return true on success', () => {
            const job = new ExportHubJob();
            const response = {
                data: {id: 'test'},
                status: DataRequestConstants.SUCCESS_RESPONSE
            };
            http2BmsServiceStub.post$.mockReturnValue(of(response));

            service.scheduleJob$(job, true).subscribe(result => {
                expect(result).toBe('test');
            });

            expect(http2BmsServiceStub.post$).toHaveBeenCalledWith(RequestConstants.CREATE_EXPORT_HUB_JOB, {exportHubJob: btoa(String.fromCharCode(...job.serializeBinary()))}, expect.anything());
        });

        it('should return false on failure', () => {
            const job = new ExportHubJob();
            const response = { status: 'FAILURE' };
            http2BmsServiceStub.post$.mockReturnValue(of(response));

            service.scheduleJob$(job, false).subscribe(result => {
                expect(result).toBe(false);
            });

            expect(http2BmsServiceStub.post$).toHaveBeenCalledWith(RequestConstants.CREATE_EXPORT_HUB_JOB, {exportHubJob: btoa(String.fromCharCode(...job.serializeBinary()))}, expect.anything());
        });
    });

    describe('getAllScheduledJobs$', () => {
        it('should fetch all scheduled jobs successfully', () => {
            const response = { data: [new ExportHubJob()] };
            http2BmsServiceStub.get$.mockReturnValue(of(response));

            service.getAllScheduledJobs$().subscribe(jobs => {
                expect(jobs.length).toBe(1);
                expect(jobs[0]).toBeInstanceOf(ExportHubJob);
            });

            expect(http2BmsServiceStub.get$).toHaveBeenCalledWith(RequestConstants.GET_ALL_EXPORT_HUB_JOBS, expect.any(HttpParams));
        });

        it('should return an empty array if response data is not an array', () => {
            const response = { data: {} };
            http2BmsServiceStub.get$.mockReturnValue(of(response));

            service.getAllScheduledJobs$().subscribe(jobs => {
                expect(jobs.length).toBe(0);
            });

            expect(http2BmsServiceStub.get$).toHaveBeenCalledWith(RequestConstants.GET_ALL_EXPORT_HUB_JOBS, expect.any(HttpParams));
        });

        it('should handle error when fetching all scheduled jobs fails', () => {
            http2BmsServiceStub.get$.mockReturnValue(throwError('error'));

            service.getAllScheduledJobs$().subscribe({
                next: () => fail('expected an error, not a success'),
                error: error => expect(error).toBe('error')
            });

            expect(http2BmsServiceStub.get$).toHaveBeenCalledWith(RequestConstants.GET_ALL_EXPORT_HUB_JOBS, expect.any(HttpParams));
        });

        it('should handle timeout error', () => {
            const timeoutError = new Error('Request timed out');
            timeoutError.name = 'TimeoutError';
            http2BmsServiceStub.get$.mockReturnValue(throwError(timeoutError));

            service.getAllScheduledJobs$().subscribe({
                next: () => fail('expected an error, not a success'),
                error: error => expect(error.message).toBe('Request timed out')
            });

            expect(http2BmsServiceStub.get$).toHaveBeenCalledWith(RequestConstants.GET_ALL_EXPORT_HUB_JOBS, expect.any(HttpParams));
        });
    });


    describe('delete$', () => {
        it('should return execution status on success', () => {
            const jobId = '1';
            const response = { data: { executionStatus: 'SUCCESS' } };
            http2BmsServiceStub.post$.mockReturnValue(of(response));

            service.delete$(jobId).subscribe(result => {
                expect(result).toBe('SUCCESS');
            });

        });

        it('should handle error when delete fails', () => {
            const jobId = '1';
            http2BmsServiceStub.post$.mockReturnValue(throwError('error'));

            service.delete$(jobId).subscribe({
                next: () => fail('expected an error, not a success'),
                error: error => expect(error).toBe('error')
            });

        });
    });

    describe('getJobExecutionHistoryById$', () => {
        it('should fetch job execution history by job id successfully', () => {
            const jobId = '1';
            const response = { data: [new ExportHubJobExecutionHistory()] };
            http2BmsServiceStub.post$.mockReturnValue(of(response));

            service.getJobExecutionHistoryById$(jobId).subscribe(history => {
                expect(history.length).toBe(1);
                expect(history[0]).toBeInstanceOf(ExportHubJobExecutionHistory);
            });

        });

        it('should return an empty array if response data is not an array', () => {
            const jobId = '1';
            const response = { data: {} };
            http2BmsServiceStub.post$.mockReturnValue(of(response));

            service.getJobExecutionHistoryById$(jobId).subscribe(history => {
                expect(history.length).toBe(0);
            });

        });

        it('should handle error when fetching job execution history by id fails', () => {
            const jobId = '1';
            http2BmsServiceStub.post$.mockReturnValue(throwError('error'));

            service.getJobExecutionHistoryById$(jobId).subscribe({
                next: () => fail('expected an error, not a success'),
                error: error => expect(error).toBe('error')
            });

        });
    });

    describe('getAllScheduledJobs', () => {
        it('should fetch all scheduled jobs successfully', () => {
            const response = { data: [new ExportHubJob()] };
            http2BmsServiceStub.get$.mockReturnValue(of(response));

            service.getAllScheduledJobs$().subscribe(jobs => {
                expect(jobs.length).toBe(1);
                expect(jobs[0]).toBeInstanceOf(ExportHubJob);
            });

            expect(http2BmsServiceStub.get$).toHaveBeenCalledWith(RequestConstants.GET_ALL_EXPORT_HUB_JOBS, expect.any(HttpParams));
        });

        it('should return an empty array if response data is not an array', () => {
            const response = { data: {} };
            http2BmsServiceStub.get$.mockReturnValue(of(response));

            service.getAllScheduledJobs$().subscribe(jobs => {
                expect(jobs.length).toBe(0);
            });

            expect(http2BmsServiceStub.get$).toHaveBeenCalledWith(RequestConstants.GET_ALL_EXPORT_HUB_JOBS, expect.any(HttpParams));
        });

        it('should handle error when fetching all scheduled jobs fails', () => {
            http2BmsServiceStub.get$.mockReturnValue(throwError('error'));

            service.getAllScheduledJobs$().subscribe({
                next: () => fail('expected an error, not a success'),
                error: error => expect(error).toBe('error')
            });

            expect(http2BmsServiceStub.get$).toHaveBeenCalledWith(RequestConstants.GET_ALL_EXPORT_HUB_JOBS, expect.any(HttpParams));
        });
    });

    describe('getJobById$', () => {
        it('should fetch job by id successfully', () => {
            const jobId = '1';
            const response = { data: new ExportHubJob() };
            http2BmsServiceStub.post$.mockReturnValue(of(response));

            service.getScheduledJobById$(jobId).subscribe(job => {
                expect(job).toBeInstanceOf(ExportHubJob);
            });

        });

        it('should handle error when fetching job by id fails', () => {
            const jobId = '1';
            http2BmsServiceStub.post$.mockReturnValue(throwError('error'));

            service.getScheduledJobById$(jobId).subscribe({
                next: () => fail('expected an error, not a success'),
                error: error => expect(error).toBe('error')
            });

        });
    });

    describe('runTestJob$', () => {
        it('should return true on successful test job run', () => {
            const job = new ExportHubJob();
            const response = { status: DataRequestConstants.SUCCESS_RESPONSE };
            http2BmsServiceStub.post$.mockReturnValue(of(response));

            service.runTestJob$(job).subscribe(result => {
                expect(result).toBe(true);
            });

            expect(http2BmsServiceStub.post$).toHaveBeenCalledWith(RequestConstants.RUN_TEST_EXPORT_HUB_JOB, { exportHubJob: btoa(String.fromCharCode(...job.serializeBinary())) }, expect.anything());
        });

        it('should return false on failed test job run', () => {
            const job = new ExportHubJob();
            const response = { status: 'FAILURE' };
            http2BmsServiceStub.post$.mockReturnValue(of(response));

            service.runTestJob$(job).subscribe(result => {
                expect(result).toBe(false);
            });

            expect(http2BmsServiceStub.post$).toHaveBeenCalledWith(RequestConstants.RUN_TEST_EXPORT_HUB_JOB, { exportHubJob: btoa(String.fromCharCode(...job.serializeBinary())) }, expect.anything());
        });

        it('should handle error during test job run', () => {
            const job = new ExportHubJob();
            http2BmsServiceStub.post$.mockReturnValue(throwError('error'));

            service.runTestJob$(job).subscribe({
                next: () => fail('expected an error, not a success'),
                error: error => expect(error).toBe('error')
            });

            expect(http2BmsServiceStub.post$).toHaveBeenCalledWith(RequestConstants.RUN_TEST_EXPORT_HUB_JOB, { exportHubJob: btoa(String.fromCharCode(...job.serializeBinary())) }, expect.anything());
        });
    });
});
