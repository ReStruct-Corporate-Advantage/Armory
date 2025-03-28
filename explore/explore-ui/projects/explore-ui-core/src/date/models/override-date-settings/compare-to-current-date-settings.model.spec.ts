import {OverrideDateConstants} from '../../constants';
import {CompareToCurrentDateSettings} from './compare-to-current-date-settings.model';

/**
 * Test cases for CompareToCurrentDateSettings model
 */
describe('CompareToCurrentDateSettings tests', function () {

    /**
     * Test case for method equal
     */
    it('Test equals', function () {
        const compareToCurrentDateSettings1 = new CompareToCurrentDateSettings(OverrideDateConstants.COMPARE_TO_CURRENT);
        let compareToCurrentDateSettings2 = new CompareToCurrentDateSettings(OverrideDateConstants.PERCENTAGE_COMPARE_TO_CURRENT);

        // Different compare to current value
        expect(compareToCurrentDateSettings1.equals(compareToCurrentDateSettings2)).toBe(false);

        // Same settings
        compareToCurrentDateSettings2 = new CompareToCurrentDateSettings(OverrideDateConstants.COMPARE_TO_CURRENT);
        expect(compareToCurrentDateSettings1.equals(compareToCurrentDateSettings2)).toBe(true);
    });
});
