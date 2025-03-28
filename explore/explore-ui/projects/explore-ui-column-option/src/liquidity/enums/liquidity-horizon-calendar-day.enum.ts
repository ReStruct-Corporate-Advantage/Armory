import {TimeHorizonLiquiditySettings} from '../models/horizon-liquidity-settings/time-horizon-liquidity-settings.model';
import {isNumber} from 'lodash';

/**
 * Enum for calendar days in horizon liquidity settings
 */
export enum LiquidityHorizonCalendarDay {
    CUMULATIVE,
    DISCRETE
}

export namespace LiquidityHorizonCalendarDay {

    /**
     * Get display name for given calendar day
     * @param type enum
     */
    export function displayName(type: LiquidityHorizonCalendarDay): string {
        let label: string;
        switch (type) {
            case LiquidityHorizonCalendarDay.CUMULATIVE:
                label = 'Cumulative';
                break;
            case LiquidityHorizonCalendarDay.DISCRETE:
                label = 'Discrete';
                break;
        }

        return label;
    }

    /**
     * Get calendar days
     */
    export function values(): LiquidityHorizonCalendarDay[] {
        return Object.keys(LiquidityHorizonCalendarDay)
            .map(calendarDay => LiquidityHorizonCalendarDay[calendarDay])
            .filter(calendarDay => isNumber(calendarDay));
    }

    /**
     * Get calendar day
     * @param type enum name
     */
    export function valueOf(type: string): LiquidityHorizonCalendarDay {
        return LiquidityHorizonCalendarDay[type];
    }

    /**
     * Get calendar day name
     * @param type enum
     */
    export function name(type: LiquidityHorizonCalendarDay): string {
        return LiquidityHorizonCalendarDay[type];
    }

    export function getTimeHorizonsByCalendarDay(calendarDay: LiquidityHorizonCalendarDay): TimeHorizonLiquiditySettings[] {
        let timeHorizons: TimeHorizonLiquiditySettings[];

        switch (calendarDay) {
            case LiquidityHorizonCalendarDay.CUMULATIVE:
                timeHorizons = getCumulativeTimeHorizon();
                break;
            case LiquidityHorizonCalendarDay.DISCRETE:
                timeHorizons = getDiscreteTimeHorizon();
                break;
            default:
                timeHorizons = [];

        }
        return timeHorizons;
    }

    /**
     * Return cumulative time horizon arrays of values
     */
    export function getCumulativeTimeHorizon(): TimeHorizonLiquiditySettings[] {
        return getAllTimeHorizonMaxDaysValues().map(value => new TimeHorizonLiquiditySettings(0, value));
    }

    /**
     * Return discrete time horizon arrays of values
     */
    export function getDiscreteTimeHorizon(): TimeHorizonLiquiditySettings[] {
        return getAllTimeHorizonMaxDaysValues().map((value, index) => {
            if (index === 0) {
                return new TimeHorizonLiquiditySettings(0, 1);
            }
            return new TimeHorizonLiquiditySettings(getAllTimeHorizonMaxDaysValues()[index - 1], value);
        });
    }

    /**
     * Return different values for max days for time horizon
     */
    function getAllTimeHorizonMaxDaysValues(): number[] {
        return [1, 2, 3, 4, 5, 10, 15, 21, 42, 63, 126, 189, 252];
    }
}
