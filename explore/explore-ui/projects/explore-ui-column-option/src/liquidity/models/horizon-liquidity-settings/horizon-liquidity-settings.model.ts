import {isEmpty, isEqual, isNil} from 'lodash';
import {AbstractLiquiditySettings} from '../abstract-liquidity-settings.model';
import {TimeHorizonLiquiditySettings} from './time-horizon-liquidity-settings.model';
import {LiquidityHorizonCalendarDay} from '../../enums/liquidity-horizon-calendar-day.enum';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Horizon Liquidity model class as a part of ESMA liquidation Settings
 */
export class HorizonLiquiditySettings extends AbstractLiquiditySettings {

    private static readonly DEFAULT_CALENDAR_DAYS: LiquidityHorizonCalendarDay = LiquidityHorizonCalendarDay.CUMULATIVE;

    calendarDays: LiquidityHorizonCalendarDay;
    timeHorizons: TimeHorizonLiquiditySettings[];

    /**
     * Initialises the liquidity settings with the default settings.
     */
    initialize(defaultSettings: Map<string, boolean>): void {
        super.initialize(defaultSettings);

        this.calendarDays = HorizonLiquiditySettings.DEFAULT_CALENDAR_DAYS;
        this.timeHorizons = LiquidityHorizonCalendarDay.getTimeHorizonsByCalendarDay(this.calendarDays);
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            calendarDays: this.calendarDays,
            timeHorizons: this.timeHorizons ? this.timeHorizons.map(timeHorizon => timeHorizon.serialize()) : undefined
        };
    }

    /**
     * Deserialize the data into this object
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }

        this.calendarDays = data.calendarDays;

        if (data.timeHorizons) {
            this.timeHorizons = data.timeHorizons.map(timeHorizonData => {
                const timeHorizon: TimeHorizonLiquiditySettings = new TimeHorizonLiquiditySettings();
                timeHorizon.deserialize(timeHorizonData);
                return timeHorizon;
            });
        }
    }

    /**
     * Return true if two object are same otherwise return false
     */
    equals(option: AbstractLiquiditySettings) {
        if (!(option instanceof HorizonLiquiditySettings)) {
            return false;
        }

        if (!isEqual(this.calendarDays, option.calendarDays)) {
            return false;
        }

        return (isEqual(this.timeHorizons, option.timeHorizons));
    }

    /**
     * Get params that are to be send as a part of the request param
     */
    addRequestParams(requestParam: any): void {
        if (!isEmpty(this.timeHorizons)) {
            requestParam.timeHorizons = [];
            this.timeHorizons.forEach(timeHorizon => {
                const params: any = {};
                timeHorizon.addRequestParams(params);
                requestParam.timeHorizons.push(params);
            });
        }
    }
}


