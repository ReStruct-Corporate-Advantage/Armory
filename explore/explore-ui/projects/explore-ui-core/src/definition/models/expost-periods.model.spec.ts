import {ExpostPeriods} from './expost-periods.model';

describe('Expost Period Test Case', () => {

    /**
     * Deserialize test
     */
    it('deserialize test', () => {
        const data: any = {
            timePeriodShortName: 'Days',
            displayName: '1 Day',
            numberOfPeriods: 1
        };

        const expostPeriodCtrl = new ExpostPeriods(data);
        expect(expostPeriodCtrl.timePeriodShortName).toBe('Days');
        expect(expostPeriodCtrl.label).toBe('1 Day');
        expect(expostPeriodCtrl.numberOfPeriods).toBe(1);
    });

});
