import {AbstractConfig, SerializeFavoriteType} from '@blk/explore-ui-core';
import {isEmpty, isObject} from 'lodash';
import {SectorConstants} from '../../../constants/sector.constants';

/**
 * Object that holds quantile info for a numeric column sector
 */
export class QuantileInfo extends AbstractConfig {
    // The number of even sized quantiles to bucket into
    numberOfQuantiles: number;
    // The breakpoints that we will bucket into (Ex: [20, 60] would create three buckets. 0-20, 21-60, 61-100)
    percentileBreakpoints: number[] = [];
    // quantile based on option (number of securities, portfolio or benchmark)
    quantileBasedOn: string;
    // Which direction we want to create the buckets in
    quantileSortOrder: string = SectorConstants.QUANTILE_SORT.ASCENDING;
    // period type to indicate creating quantile from start or end of period value
    periodType: string = SectorConstants.PERIOD_TYPE.START;

    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the config type for Quantile info
     */
    get configType(): string {
        return SectorConstants.ConfigType.QUANTILE_INFO;
    }

    /**
     * Serialize the config to json
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const data: any = {
            quantileSortOrder: this.quantileSortOrder,
            periodType: this.periodType
        };

        if (!isEmpty(this.percentileBreakpoints)) {
            data.percentileBreakpoints = this.percentileBreakpoints;
        } else if (this.numberOfQuantiles) {
            data.numberOfQuantiles = this.numberOfQuantiles;
        }

        if (this.quantileBasedOn) {
            data.quantileBasedOn = this.quantileBasedOn;
        }
        return data;
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        if (data.numberOfQuantiles) {
            this.numberOfQuantiles = data.numberOfQuantiles;
        }
        if (!isEmpty(data.percentileBreakpoints)) {
            this.percentileBreakpoints = data.percentileBreakpoints;
        }
        if (data.quantileBasedOn) {
            this.quantileBasedOn = data.quantileBasedOn;
        }
        if (data.periodType) {
            this.periodType = data.periodType;
        }
        if (data.quantileSortOrder) {
            this.quantileSortOrder = data.quantileSortOrder;
        }
    }

    /**
     * Returns true if the quantile info configuration is valid
     */
    isValid(): boolean {
        return !!this.numberOfQuantiles || !isEmpty(this.percentileBreakpoints);
    }

    /**
     * Reset the quantile info to default
     */
    reset(): void {
        this.numberOfQuantiles = undefined;
        this.percentileBreakpoints = [];
        this.periodType = SectorConstants.PERIOD_TYPE.START;
        this.quantileSortOrder = SectorConstants.QUANTILE_SORT.ASCENDING;
    }
}
