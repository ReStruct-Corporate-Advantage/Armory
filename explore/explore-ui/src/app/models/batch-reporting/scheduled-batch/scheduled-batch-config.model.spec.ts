import {BatchSchedule} from '@models/batch-reporting/scheduled-batch/batch-schedule.model';
import {ScheduledBatchConfig} from '@models/batch-reporting/scheduled-batch/scheduled-batch-config.model';
import {BatchReportingTestUtils} from '@services/batch-reporting/batch-reporting.service.spec';
import {ConfigInitializer} from '../../../initializers/config.initializer';

/**
 * Test class for ScheduledBatchConfig
 */
describe('Models/Batch Reporting/Scheduled Batch', () => {
    describe('ScheduledBatchConfig tests', () => {
        beforeAll(() => {
            ConfigInitializer.initializeConfig();
        });

        it ('Test serialize/deserialize', () => {
            const scheduledBatchConfig = BatchReportingTestUtils.createDummyScheduledBatchConfig();

            const serializedScheduledBatchConfig = scheduledBatchConfig.serialize();
            const scheduledBatchConfig2 = new ScheduledBatchConfig(serializedScheduledBatchConfig);

            expect(scheduledBatchConfig2.batchReportConfigId).toEqual(scheduledBatchConfig.batchReportConfigId);
            expect(scheduledBatchConfig2.batchSchedules.length).toEqual(scheduledBatchConfig.batchSchedules.length);
            expect(scheduledBatchConfig2.batchSchedules[0].timeValue).toEqual(scheduledBatchConfig.batchSchedules[0].timeValue);
            expect(scheduledBatchConfig2.batchSchedules[0].timeZone).toEqual(scheduledBatchConfig.batchSchedules[0].timeZone);
            expect(scheduledBatchConfig2.batchSchedules[0].frequency).toEqual(scheduledBatchConfig.batchSchedules[0].frequency);
            expect(scheduledBatchConfig2.batchSchedules[0].directory).toEqual(scheduledBatchConfig.batchSchedules[0].directory);
        });

        it('Test sortBatchSchedulesByLastUpdated', () => {
            const scheduledBatchConfig = new ScheduledBatchConfig();

            const batchSchedule1 = new BatchSchedule();
            batchSchedule1.dateLastUpdated = '04/08/2021';

            const batchSchedule2 = new BatchSchedule();
            batchSchedule2.dateLastUpdated = '03/23/2021';

            const batchSchedule3 = new BatchSchedule();
            batchSchedule3.dateLastUpdated = '02/14/2021';

            scheduledBatchConfig.batchSchedules.push(batchSchedule1, batchSchedule2, batchSchedule3);

            // Sort the batch schedules based on last updated
            scheduledBatchConfig.sortBatchSchedulesByLastUpdated();

            expect(scheduledBatchConfig.batchSchedules[0].dateLastUpdated).toEqual('02/14/2021');
            expect(scheduledBatchConfig.batchSchedules[1].dateLastUpdated).toEqual('03/23/2021');
            expect(scheduledBatchConfig.batchSchedules[2].dateLastUpdated).toEqual('04/08/2021');
        });
    });
});
