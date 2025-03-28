import {cloneDeep, isEmpty, isObject, isUndefined} from 'lodash';
import {ColumnSector} from './column-sector.model';
import {SectorConstants} from '../../../constants/sector.constants';
import {QuantileInfo} from './quantile-info.model';
import {ConfigTypeFactory, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Class for the numeric column sector.
 */
export class NumericColumnSector extends ColumnSector {
    bucketBreakpoints: number[];
    bucketIntervals: number;
    bucketLabelPrefix: string;
    decimalDigitsToDisplay: number;
    quantileInfo: QuantileInfo = new QuantileInfo();
    // Scalar added to the sector to properly scale certain column values so the sectoring can be done properly on the server
    scalingFactor: number;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the config type for numeric column sector options
     */
    get configType(): string {
        return SectorConstants.ConfigType.NUMERIC_COLUMN_SECTOR;
    }

    /**
     * Get the sectorRuleType
     */
    get sectorRuleType(): string {
        return 'Numeric';
    }

    /**
     * Serialize the config to json.
     * isNested an optional parameter to indicate that the favorite is a nested one.
     */
    serialize(isNested?: boolean | SerializeFavoriteType): any {
        // Get the super implementation of the settings.
        const data: any = super.serialize(isNested);

        // Add the settings specific to this implementation.
        data.bucketLabelNoOfDecimalDigitsToDisplay = this.decimalDigitsToDisplay;
        data.bucketLabelPrefix = this.bucketLabelPrefix;
        data.scalingFactor = this.scalingFactor;
        if (this.bucketIntervals) {
            data.bucketIntervals = this.bucketIntervals;
        } else if (!isEmpty(this.bucketBreakpoints)) {
            data.bucketBreakpoints = cloneDeep(this.bucketBreakpoints);
        } else if (this.quantileInfo.isValid()) {
            data.quantileInfo = this.quantileInfo.serialize();
        } else {
            // By default if there are is nothing defined use an empty array as this forces in all points.
            data.bucketBreakpoints = [];
        }

        return data;
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        super.deserialize(data);

        // Add the settings specific to this implementation.
        this.decimalDigitsToDisplay = data.bucketLabelNoOfDecimalDigitsToDisplay;
        this.bucketLabelPrefix = data.bucketLabelPrefix;
        this.scalingFactor = data.scalingFactor;
        if (!isEmpty(data.bucketBreakpoints)) {
            this.bucketBreakpoints = cloneDeep(data.bucketBreakpoints);
        } else if (data.bucketIntervals) {
            this.bucketIntervals = data.bucketIntervals;
        } else if (data.quantileInfo) {
            this.quantileInfo = ConfigTypeFactory.createConfig(data.quantileInfo, SectorConstants.ConfigType.QUANTILE_INFO, true);
        }
    }

    /**
     * @inheritDoc
     */
    getDataType(): string {
        return SectorConstants.SECTOR_DATA_TYPE.NUMERIC;
    }

    /**
     * Checks if this sector definition is valid.
     */
    isValid(): boolean {
        // Make sure the super is valid first.
        if (!super.isValid()) {
            return false;
        }

        if (!isUndefined(this.bucketBreakpoints) && this.bucketBreakpoints.length) {
            // check if all bucket breakpoints are valid number
            return this.bucketBreakpoints.every((breakpoint: number) => !isNaN(breakpoint));
        } else if (!isUndefined(this.bucketIntervals)) {
            // check if bucket intervals value is valid number
            return !isNaN(this.bucketIntervals);
        } else {
            return true;
        }
    }

    /**
     * Checks if the NumericColumnSector is configured for quantiles
     */
    isQuantile(): boolean {
        return !this.bucketIntervals && isEmpty(this.bucketBreakpoints) && this.quantileInfo.isValid();
    }
}
