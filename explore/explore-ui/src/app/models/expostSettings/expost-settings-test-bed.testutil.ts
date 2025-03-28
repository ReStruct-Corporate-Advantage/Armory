import {TimePeriod} from '@blk/explore-ui-core';

/**
 * ExpostSettingsTestBed has methods to help test expost settings
 */
export class ExpostSettingsTestBed {

    constructor() {
        // Empty
    }
    /**
     * @return statistical periods to use in the test
     */
    static createStatisticalPeriods(): Array<TimePeriod> {
        const statisticalPeriod1 = new TimePeriod('1 Day', 1, 'Days');
        const statisticalPeriod2 = new TimePeriod('3 Quarters', 3, 'Quarters');
        return [statisticalPeriod1, statisticalPeriod2];
    }

    /**
     * Validates statistical periods in the given request params.
     * Note: the statistical periods are expected to be created by the "createStatisticalPeriods" function
     * @param requestParams request params with the statistical periods to validate
     */
    static validateStatisticalPeriods(requestParams: any): void {
        expect(requestParams.statisticPeriods.length).toStrictEqual(2);
        expect(requestParams.statisticPeriods[0]).toStrictEqual({numberOfPeriods: 1, shortName : 'Days'});
        expect(requestParams.statisticPeriods[1]).toStrictEqual({numberOfPeriods: 3, shortName : 'Quarters'});
    }
}
