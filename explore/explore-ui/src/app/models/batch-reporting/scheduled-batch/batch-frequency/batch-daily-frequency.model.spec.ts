import {BatchDailyFrequency} from '@models/batch-reporting/scheduled-batch/batch-frequency/batch-daily-frequency.model';

describe('Models/Batch Reporting/Scheduled Batch/Batch Frequency', () => {
    describe('BatchDailyFrequency tests', () => {
        it('Test serialize/deserialize', () => {
            const batchDailyFrequency = new BatchDailyFrequency();

            // Fully serialize every day
            batchDailyFrequency.sunday = true;
            batchDailyFrequency.monday = true;
            batchDailyFrequency.tuesday = true;
            batchDailyFrequency.wednesday = true;
            batchDailyFrequency.thursday = true;
            batchDailyFrequency.friday = true;
            batchDailyFrequency.saturday = true;

            const serializedBatchDailyFrequency = batchDailyFrequency.serialize();
            const batchDailyFrequency2 = new BatchDailyFrequency(serializedBatchDailyFrequency);

            expect(batchDailyFrequency2.sunday).toBeTruthy();
            expect(batchDailyFrequency2.monday).toBeTruthy();
            expect(batchDailyFrequency2.tuesday).toBeTruthy();
            expect(batchDailyFrequency2.wednesday).toBeTruthy();
            expect(batchDailyFrequency2.thursday).toBeTruthy();
            expect(batchDailyFrequency2.friday).toBeTruthy();
            expect(batchDailyFrequency2.saturday).toBeTruthy();
        });

        it('Test serialize of only populated values', () => {
            const batchDailyFrequency = new BatchDailyFrequency();

            // Only add sunday
            batchDailyFrequency.sunday = true;

            const serializedBatchDailyFrequency = batchDailyFrequency.serialize();
            // Should only have serialized two values in the object
            // configType AND sunday
            expect(Object.keys(serializedBatchDailyFrequency).length).toEqual(2);
        });

        it('Test isValid', () => {
            const batchDailyFrequency = new BatchDailyFrequency();

            expect(batchDailyFrequency.isValid()).toBeFalsy();
            batchDailyFrequency.saturday = true;
            expect(batchDailyFrequency.isValid()).toBeTruthy();
            batchDailyFrequency.friday = true;
            expect(batchDailyFrequency.isValid()).toBeTruthy();
            batchDailyFrequency.thursday = true;
            expect(batchDailyFrequency.isValid()).toBeTruthy();
            batchDailyFrequency.wednesday = true;
            expect(batchDailyFrequency.isValid()).toBeTruthy();
            batchDailyFrequency.tuesday = true;
            expect(batchDailyFrequency.isValid()).toBeTruthy();
            batchDailyFrequency.monday = true;
            expect(batchDailyFrequency.isValid()).toBeTruthy();
            batchDailyFrequency.sunday = true;
            expect(batchDailyFrequency.isValid()).toBeTruthy();
        });
    });
});
