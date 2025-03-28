import {SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Batch schedule frequency interface
 */
export interface BatchFrequency {

    /**
     * Returns the corresponding BatchScheduleFrequency enum value
     */
    getBatchScheduleFrequency(): string;

    /**
     * Returns text to display for the scheduled batch overview screen
     */
    getOverviewText(): string;

    /**
     * Checks if the BatchFrequency is valid
     */
    isValid(): boolean;

    /**
     * Serializes the export configuration
     */
    serialize(isNested?: boolean | SerializeFavoriteType): any;
}
