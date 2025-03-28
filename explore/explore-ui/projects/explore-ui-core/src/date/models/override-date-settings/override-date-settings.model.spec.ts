import {OverrideDateSettings} from './override-date-settings.model';

/**
 * Test cases for OverrideDateSettings model
 */
describe('OverrideDateSettings tests', function () {

    /**
     * Test case for method equal
     */
    it('Test equals', function () {
        const overrideDateSettings1 = new OverrideDateSettings(['PRIOR_DAY', 'MONTH_END', 'CUSTOM'], '04/01/2020');
        let overrideDateSettings2 = new OverrideDateSettings(['PRIOR_DAY', 'MONTH_END', 'QUARTER_END', 'CUSTOM'], '04/01/2020');

        // Different amount override date types
        expect(overrideDateSettings1.equals(overrideDateSettings2)).toBe(false);

        // Same amount of override date types but different types
        overrideDateSettings2 = new OverrideDateSettings(['PRIOR_DAY', 'QUARTER_END', 'CUSTOM'], '04/01/2020');
        expect(overrideDateSettings1.equals(overrideDateSettings2)).toBe(false);

        // Same override date types but different custom date
        overrideDateSettings2 = new OverrideDateSettings(['PRIOR_DAY', 'MONTH_END', 'CUSTOM'], '04/02/2020');
        expect(overrideDateSettings1.equals(overrideDateSettings2)).toBe(false);

        // Same settings
        overrideDateSettings2 = new OverrideDateSettings(['PRIOR_DAY', 'MONTH_END', 'CUSTOM'], '04/01/2020');
        expect(overrideDateSettings1.equals(overrideDateSettings2)).toBe(true);
    });
});
