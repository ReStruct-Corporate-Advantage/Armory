import { TestBed } from '@angular/core/testing';
import { ExportHubStore } from './export-hub.store';
import { ExportHubJob } from '@blk/aladdin-graph-everything/analytics/portfolio_analytics/export_hub/v1/export_hub_job_pb';
import { take } from 'rxjs/operators';

describe('ExportHubStore', () => {
    let store: ExportHubStore;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ExportHubStore]
        });
        store = TestBed.inject(ExportHubStore);
    });

    it('should be created', () => {
        expect(store).toBeTruthy();
    });

    it('should return an empty array when there are no scheduled jobs', () => {
        expect(store.getScheduledJobs()).toEqual([]);
    });

    it('should return all scheduled jobs', () => {
        const job1 = new ExportHubJob();
        job1.setId('1');
        const job2 = new ExportHubJob();
        job2.setId('2');
        store.scheduledJobsMap.set(job1.getId(), job1);
        store.scheduledJobsMap.set(job2.getId(), job2);

        expect(store.getScheduledJobs()).toEqual([job1, job2]);
    });

    it('should emit openScheduleJobModal with job', (done) => {
        const job = new ExportHubJob();
        job.setId('1');
        store.scheduleJobModalOpen$.pipe(take(1)).subscribe(params => {
            expect(params.isOpen).toBe(true);
            expect(params.job).toEqual(job);
            done();
        });

        store.openScheduleJobModal(job);
    });

    it('should emit openScheduleJobModal without job', (done) => {
        store.scheduleJobModalOpen$.pipe(take(1)).subscribe(params => {
            expect(params.isOpen).toBe(true);
            expect(params.job).toBeUndefined();
            done();
        });

        store.openScheduleJobModal();
    });

    it('should emit closeScheduleJobModal', (done) => {
        store.scheduleJobModalOpen$.pipe(take(1)).subscribe(params => {
            expect(params.isOpen).toBe(false);
            expect(params.job).toBeUndefined();
            done();
        });

        store.closeScheduleJobModal();
    });

    describe('populateJobsMap', () => {
        it('should populate the map with a list of jobs', () => {
            const job1 = new ExportHubJob();
            job1.setId('1');
            const job2 = new ExportHubJob();
            job2.setId('2');
            const job3 = new ExportHubJob();
            job3.setId('3');
            store.recentlyCreatedJobsMap.set('3', job3);


            store.populateJobsMap([job1, job2]);

            expect(store.scheduledJobsMap.size).toBe(3);
            expect(store.scheduledJobsMap.get('1')).toBe(job1);
            expect(store.scheduledJobsMap.get('2')).toBe(job2);
            expect(store.scheduledJobsMap.get('3')).toBe(job3);
        });

        it('should clear the map before populating it', () => {
            const job1 = new ExportHubJob();
            job1.setId('1');
            store.scheduledJobsMap.set('existing', new ExportHubJob());

            store.populateJobsMap([job1]);

            expect(store.scheduledJobsMap.size).toBe(1);
            expect(store.scheduledJobsMap.get('1')).toBe(job1);
        });

        it('should handle an empty list of jobs', () => {
            store.scheduledJobsMap.set('existing', new ExportHubJob());

            store.populateJobsMap([]);

            expect(store.scheduledJobsMap.size).toBe(0);
        });
    });
});
