import {ReportingColumn} from '@models/reporting-column/reporting-column.model';

describe('reporting column test cases', () => {
    it('serialize/deserialize', () => {
        const column = new ReportingColumn();
        column.columnTag = 'market_value';
        column.uses = 'PORT';

        // Now serialise the item.
        const serializedData: any = column.serialize();

        // Deserialize into a new instance.
        const newColumn = new ReportingColumn(serializedData);

        // Validate.
        expect(newColumn.columnTag).toBe(column.columnTag);
        expect(newColumn.uses).toBe(column.uses);
    });
});
