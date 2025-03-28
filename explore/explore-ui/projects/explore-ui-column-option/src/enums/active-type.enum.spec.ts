/**
 * Purpose of this Test file is to test the various methods of Activetype enum.
 */
import {ActiveType, ActiveTypeUtils} from './active-type.enum';
import {isEqual} from 'lodash';

describe('ActiveType class tests', function() {
    it('Test getDisplayName function', function () {
        const activeType: ActiveType = ActiveType.RATIO_2TO1;
        // validating the values.
        expect(ActiveTypeUtils.getDisplayName(activeType)).toBe('Portfolio / Benchmark');
    });

    it('Test getAllActiveTypes function', function () {
        const activeList: Array<{ value: string, label: string }> = [{
            'value': 'DIFF_1MINUS2', 'label': 'Portfolio - Benchmark'
        }, {'value': 'RATIO_2TO1', 'label': 'Portfolio / Benchmark'}, {
            'value': 'PCT_DIFF_BY_1', 'label': '(Portfolio - Benchmark) / Portfolio'
        }, {'value': 'PCT_DIFF_BY_2', 'label': '(Portfolio - Benchmark) / Benchmark'}];

        const expectedList: Array<{ value: string, label: string }> = ActiveTypeUtils.getAllActiveTypes();
        // validating the values.
        expect(isEqual(expectedList[0], activeList[0])).toBeTruthy();
        expect(isEqual(expectedList[1], activeList[1])).toBeTruthy();
        expect(isEqual(expectedList[2], activeList[2])).toBeTruthy();
        expect(isEqual(expectedList[3], activeList[3])).toBeTruthy();
    });
});
