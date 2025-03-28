import {LiquidityHorizonCalendarDay} from './liquidity-horizon-calendar-day.enum';

describe('Calendar Days type test case', () => {
    it('check enum values test case', () => {
        expect(LiquidityHorizonCalendarDay.CUMULATIVE).toBe(0);
        expect(LiquidityHorizonCalendarDay.DISCRETE).toBe(1);
    });

    it('getTimeHorizonsByCalendarDay test case', () => {
        expect(LiquidityHorizonCalendarDay.getTimeHorizonsByCalendarDay(LiquidityHorizonCalendarDay.CUMULATIVE).length).toBe(13);
        expect(LiquidityHorizonCalendarDay.getTimeHorizonsByCalendarDay(LiquidityHorizonCalendarDay.DISCRETE).length).toBe(13);
    });

    it('should get cumulative time horizon test case', () => {
        expect(LiquidityHorizonCalendarDay.getCumulativeTimeHorizon().length).toBe(13);
    });

    it('should get discrete time horizon test case', () => {
        expect(LiquidityHorizonCalendarDay.getDiscreteTimeHorizon().length).toBe(13);
    });
});
