import {cloneDeep, isObject, isUndefined} from 'lodash';
import {ColumnSector} from './column-sector.model';
import {SectorConstants} from '../../../constants/sector.constants';
import {SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Class for the time span column sector.
 */
export class TimeSpanColumnSector extends ColumnSector {

    // Some of valid breakpoints 1D, 1Y, 1W, 1M, 1.2M, .5M, 2m, 2y, 2, 5.2, 10
    private static BREAKPOINT_REGEX_STRING = '^(\\d*\\.)?\\d+[dwymDWYM]?$';

    private static BREAKPOINT_REGEX = new RegExp(TimeSpanColumnSector.BREAKPOINT_REGEX_STRING);

    bucketBreakpoints: Array<string>;

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
     * Gets the config type for time span column sector options
     */
    get configType(): string {
        return SectorConstants.ConfigType.TIME_SPAN_COLUMN_SECTOR;
    }

    /**
     * Get the sectorRuleType
     */
    get sectorRuleType(): string {
        return 'timeSpan';
    }

    /**
     * Serialize the config to json.
     * isNested an optional parameter to indicate that the favorite is a nested one.
     */
    serialize(isNested?: boolean | SerializeFavoriteType): any {
        // Get the super implementation of the settings.
        const data: any = super.serialize(isNested);

        // Add the settings specific to this implementation.
        if (this.bucketBreakpoints && this.bucketBreakpoints.length > 0) {
            data.timeSpanBucketBreakpoints = cloneDeep(this.bucketBreakpoints);
        }

        return data;
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        super.deserialize(data);

        // Add the settings specific to this implementation.
        if (data.timeSpanBucketBreakpoints && data.timeSpanBucketBreakpoints.length > 0) {
            this.bucketBreakpoints = cloneDeep(data.timeSpanBucketBreakpoints);
        }
    }

    /**
     * Checks if this sector definition is valid.
     */
    isValid(): boolean {
        // Make sure the super is valid first.
        if (!super.isValid()) {
            return false;
        }
        // This is list of breakpoint values.
        return !isUndefined(this.bucketBreakpoints) && this.bucketBreakpoints.length > 0
            && this.bucketBreakpoints.every((breakpoint: string) => {
                return TimeSpanColumnSector.BREAKPOINT_REGEX.test(breakpoint);
            });
    }

    /**
     * @inheritDoc
     */
    getDataType(): string {
        return SectorConstants.SECTOR_DATA_TYPE.TIME_SPAN;
    }
}
