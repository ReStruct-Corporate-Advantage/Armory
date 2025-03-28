import {DateFormat} from './date-format.model';

/**
 * Test cases for DateFormat model class
 */
describe('DateFormat', () => {
    /**
     * Test deserialize
     */
    it('deserialize', () => {
        const format: any = {value: 'dd-MMM-yyyy', configType: DateFormat.CONFIG_TYPE, label: -1};
        const colFormat = new DateFormat(format);
        expect(colFormat.label).toBe(-1);
        expect(colFormat.value).toBe('dd-MMM-yyyy');
    });
});
