/**
 * Test cases for TimeSpanColumnFormat model class
 */
import {TimeSpanColumnFormat} from './time-span-column-format.model';

describe('TimeSpanColumnFormat', () => {
    /**
     * Test deserialize
     */
    it('deserialize', () => {
        const format: any = {'formatString': 'C;0;90;24;', 'daysCutOff': 90, 'format': null, 'monthsCutOff': 24, 'displayType': 'CUSTOM',
            'decimalPlaces': 0, 'configType': TimeSpanColumnFormat.CONFIG_TYPE, 'custom': true};
        const colFormat = new TimeSpanColumnFormat();
        const data: any = colFormat.deserialize(format);
        expect(colFormat.formatString).toBe('C;0;90;24;');
        expect(colFormat.daysCutOff).toBe(90);
        expect(colFormat.monthsCutOff).toBe(24);
        expect(colFormat.displayType).toBe('CUSTOM');
        expect(colFormat.decimalPlaces).toBe(0);
    });
});
