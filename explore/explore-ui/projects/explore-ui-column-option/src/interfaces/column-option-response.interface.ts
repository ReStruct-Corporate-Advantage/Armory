import {ColumnOptionMetaDataInterface} from '@blk/explore-ui-core';

/**
 * Interface representing column option response that would be returned by this service
 */
export interface ColumnOptionResponse {
    colTag: string;
    use: string;
    columnOptionType: string;
    options: ColumnOptionMetaDataInterface[];
}
