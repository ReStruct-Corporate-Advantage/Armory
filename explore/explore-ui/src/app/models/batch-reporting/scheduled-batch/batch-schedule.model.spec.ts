import {BatchSchedule} from '@models/batch-reporting/scheduled-batch/batch-schedule.model';
import * as definitions from '../../../../../mocks/definitions.json';
import {DefinitionsService} from '../../../modules/metadata/definitions/definitions.service';
import {BatchReportingTestUtils} from '@services/batch-reporting/batch-reporting.service.spec';
import {ConfigInitializer} from '../../../initializers/config.initializer';

/**
 * Test class for BatchSchedule
 */
describe('Models/Batch Reporting/Scheduled Batch', () => {
    describe('BatchSchedule tests', () => {

        beforeAll(() => {
            ConfigInitializer.initializeConfig();
            DefinitionsService.initDefinitions(definitions);
        });

        it ('Test serialize/deserialize', () => {
            const batchSchedule = BatchReportingTestUtils.createDummyBatchSchedule();

            const serializedBatchSchedule = batchSchedule.serialize();
            const batchSchedule2 = new BatchSchedule(serializedBatchSchedule);

            expect(batchSchedule2.timeValue).toEqual(batchSchedule.timeValue);
            expect(batchSchedule2.timeZone).toEqual(batchSchedule.timeZone);
            expect(batchSchedule2.frequency).toEqual(batchSchedule.frequency);
            expect(batchSchedule2.directory).toEqual(batchSchedule.directory);
        });
    });
});
