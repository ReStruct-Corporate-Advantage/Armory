import {DateValue} from '../date-value/date-value.model';
import {MultiOverrideDateSettings} from './multi-override-date-settings.model';

/**
 * Test cases for MultiOverrideDateSettings model
 */
describe('MultiOverrideDateSettings tests', function () {

    /**
     * Test case for method equal
     */
    it('Test equals', function () {
        const multiOverrideDateSettings1 = new MultiOverrideDateSettings('MONTH_END', 2, DateValue.newDate(''), DateValue.newDate(''));
        let multiOverrideDateSettings2 = new MultiOverrideDateSettings('DAILY', 2, DateValue.newDate(''), DateValue.newDate(''));

        // Different frequency
        expect(multiOverrideDateSettings1.equals(multiOverrideDateSettings2)).toBe(false);

        // same frequency but different number of observations
        multiOverrideDateSettings2 = new MultiOverrideDateSettings('MONTH_END', 5, DateValue.newDate(''), DateValue.newDate(''));
        expect(multiOverrideDateSettings1.equals(multiOverrideDateSettings2)).toBe(false);

        // same frequency and number of observations but different start date
        multiOverrideDateSettings2 = new MultiOverrideDateSettings('MONTH_END', 2, DateValue.newDate('03/10/2016'), DateValue.newDate(''));
        expect(multiOverrideDateSettings1.equals(multiOverrideDateSettings2)).toBe(false);

        // Same settings
        multiOverrideDateSettings2 = new MultiOverrideDateSettings('MONTH_END', 2, DateValue.newDate(''), DateValue.newDate(''));
        expect(multiOverrideDateSettings1.equals(multiOverrideDateSettings2)).toBe(true);

        // Same settings
        multiOverrideDateSettings2 = new MultiOverrideDateSettings('MONTH_END', 2, DateValue.newDate(''), DateValue.newDate(''), true);
        expect(multiOverrideDateSettings1.equals(multiOverrideDateSettings2)).toBe(false);
    });

});
