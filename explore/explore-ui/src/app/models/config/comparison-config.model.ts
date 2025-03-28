import {AppUtils} from '@utils/app.utils';
import {AbstractConfig, SerializeFavoriteType} from '@blk/explore-ui-core';
import {isEmpty} from 'lodash';

/**
 * Model class for ComparisonConfig object which contains portComparisonList and portAnchorId
 * Used when report is in compare mode
 */

export class ComparisonConfig extends AbstractConfig {
    portComparisonList: Array<string> = new Array<string>();
    portAnchorId: string;

    /**
     * Constructor
     */
    constructor(data?: any) {
        super();
        if (AppUtils.isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Returns true if the ComparisonConfig has portfolios compared
     */
    hasPortfolios(): boolean {
        return !isEmpty(this.portComparisonList);
    }

    /**
     * serialize
     * @param _isNested
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const config: any = {};
        config.portComparisonList = this.portComparisonList;
        config.portAnchorId = this.portAnchorId;

        return config;
    }

    /**
     * deserialize
     * @param data
     */
    deserialize(data: any): void {
        data.portComparisonList = data.portComparisonList ? data.portComparisonList : [];
        this.portComparisonList = data.portComparisonList;
        this.portAnchorId = data.portAnchorId;
    }
}
