import {BatchMonthlyFrequency} from '@models/batch-reporting/scheduled-batch/batch-frequency/batch-monthly-frequency.model';

describe('Models/Batch Reporting/Scheduled Batch/Batch Frequency', () => {
    describe('BatchMonthlyFrequency tests', () => {
        it('Test serialize/deserialize', () => {
            const batchMonthlyFrequency = new BatchMonthlyFrequency();

            batchMonthlyFrequency.numericalDay = 15;
            const serializedBatchMonthlyFrequency = batchMonthlyFrequency.serialize();

            const batchMonthlyFrequency2 = new BatchMonthlyFrequency(serializedBatchMonthlyFrequency);
            expect(batchMonthlyFrequency2.numericalDay).toEqual(batchMonthlyFrequency.numericalDay);
        });

        it('Test isValid', () => {
            const batchMonthlyFrequency = new BatchMonthlyFrequency();

            // Set to null. Should never happen
            batchMonthlyFrequency.numericalDay = null;
            expect(batchMonthlyFrequency.isValid()).toBeFalsy();

            // Set to 0. Should never happen
            batchMonthlyFrequency.numericalDay = 0;
            expect(batchMonthlyFrequency.isValid()).toBeFalsy();

            // Set to 32. Should never happen
            batchMonthlyFrequency.numericalDay = 32;
            expect(batchMonthlyFrequency.isValid()).toBeFalsy();

            batchMonthlyFrequency.numericalDay = 15;
            expect(batchMonthlyFrequency.isValid()).toBeTruthy();
        });
    });
});

