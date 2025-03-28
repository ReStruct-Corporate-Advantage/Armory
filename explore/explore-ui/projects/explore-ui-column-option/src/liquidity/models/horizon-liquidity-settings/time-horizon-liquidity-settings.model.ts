import {isNil, template} from 'lodash';
import {AbstractLiquiditySettings} from '../abstract-liquidity-settings.model';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Time Horizon Liquidity model class
 */
// @dynamic
export class TimeHorizonLiquiditySettings extends AbstractLiquiditySettings {

    private static readonly TITLE_TEMPLATE: string = '<%=minDays%>-<%=maxDays%> days';
    public static readonly TITLE_REGEXP: RegExp = new RegExp(/([0-9]+)-([0-9]+) days/);

    minDays: number;
    maxDays: number;
    title: string;

    /**
     * Constructor
     */
    constructor(minDays?: number, maxDays?: number) {
        super();
        this.minDays = minDays;
        this.maxDays = maxDays;
        if (Number.isInteger(minDays) && Number.isInteger(maxDays)) {
            this.title = this.getDefaultTitle();
        }
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            minDays: this.minDays,
            maxDays: this.maxDays,
            title: this.title
        };
    }

    /**
     * Deserialize the data into this object
     * @param data
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }

        this.minDays = data.minDays;
        this.maxDays = data.maxDays;
        this.title = data.title;
    }

    /**
     * Get params that are to be send as a part of the request param
     * @param requestParam
     */
    addRequestParams(requestParam: any): void {
        requestParam.minDays = this.minDays;
        requestParam.maxDays = this.maxDays;
        requestParam.title = this.title;
    }

    /**
     * Get default title for time horizon
     */
    getDefaultTitle(): string {
        return template(TimeHorizonLiquiditySettings.TITLE_TEMPLATE)(this);
    }
}
