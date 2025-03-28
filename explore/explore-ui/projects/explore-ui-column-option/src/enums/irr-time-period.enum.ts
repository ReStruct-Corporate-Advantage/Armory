import {ExploreSelectOption} from '@blk/explore-ui-core';

/**
 * ActiveType enum.
 * @author Ashish Agarwal
 */

export enum IRRTimePeriod {
    ONE_YEAR,
    THREE_YEARS,
    FIVE_YEARS,
    SEVEN_YEARS,
    TEN_YEARS,
    ITD
}

export class IRRTimePeriodUtil {

    /**
     * Returns the display name corresponding to each IRRTimePeriod.
     */
    public static getDisplayName(timePeriod: IRRTimePeriod): string {
        switch (timePeriod) {
            case IRRTimePeriod.ONE_YEAR:
                return '1 Year';
            case IRRTimePeriod.THREE_YEARS:
                return '3 Years';
            case IRRTimePeriod.FIVE_YEARS:
                return '5 Years';
            case IRRTimePeriod.SEVEN_YEARS:
                return '7 Years';
            case IRRTimePeriod.TEN_YEARS:
                return '10 Years';
            case IRRTimePeriod.ITD:
                return 'Inception To Date (ITD)';
        }
    }

    /**
     * Get IRRTimePeriod list with its values and label
     */
    public static getAllIRRTimePeriods(selectedTimePeriods: string[]): ExploreSelectOption[] {
        const items: IRRTimePeriod[] = Object.keys(IRRTimePeriod).map(k => IRRTimePeriod[k]).filter(v => typeof v === 'number') as number[];
        const validIRRTimePeriods: ExploreSelectOption[] = [];
        const l: number = items.length;
        for (let i = 0; i < l; i++) {
            validIRRTimePeriods.push(new ExploreSelectOption(IRRTimePeriodUtil.getDisplayName(items[i]), IRRTimePeriod[i], selectedTimePeriods.includes(IRRTimePeriod[i])));
        }
        return validIRRTimePeriods;
    }
}
