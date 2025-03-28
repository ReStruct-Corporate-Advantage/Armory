/**
 * Quantitative tiering Liquidity Settings as a part of liquidity Settings
 */
import {AbstractLiquiditySettings} from './abstract-liquidity-settings.model';
import {isNil} from 'lodash';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

export class QuantitativeTieringLiquiditySettings extends AbstractLiquiditySettings {

    private static readonly MIN_DAYS: number = 0;
    private static readonly MAX_DAYS: number = 500;

    minDays: number;
    maxDays: number;

    /**
     * Initialises the liquidity settings with the default settings.
     */
    initialize(defaultSettings: Map<string, boolean>) {
        super.initialize(defaultSettings);

        this.minDays = QuantitativeTieringLiquiditySettings.MIN_DAYS;
        this.maxDays = QuantitativeTieringLiquiditySettings.MAX_DAYS;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            minDays: this.minDays,
            maxDays: this.maxDays
        };
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (isNil(data)) {
            return;
        }
        this.minDays = data.minDays;
        this.maxDays = data.maxDays;
    }

    /**
     * Return true if two object are same otherwise return false
     */
    equals(option: AbstractLiquiditySettings) {
        if (!(option instanceof QuantitativeTieringLiquiditySettings)) {
            return false;
        }

        if (this.minDays !== option.minDays) {
            return false;
        }

        return (this.maxDays === option.maxDays);
    }

    /**
     * Add value to request params
     */
    addRequestParams(requestParam: any): void {
        requestParam.minDays = this.minDays;
        requestParam.maxDays = this.maxDays;
    }

    /**
     * Get title suffix
     */
    getTitleSuffix(): string {
        if (!isNil(this.minDays) && !isNil(this.maxDays)) {
            return this.minDays + '-' + this.maxDays + ' days';
        } else if (!isNil(this.minDays)) {
            return this.minDays + '+ days';
        } else if (!isNil(this.maxDays)) {
            return this.maxDays + '- days';
        }
    }
}
