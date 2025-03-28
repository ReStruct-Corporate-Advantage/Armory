import {AbstractConfig, RequestParamsCreator, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Class to hold the split position settings.
 */
export class SplitPositionSettings extends AbstractConfig implements RequestParamsCreator {

    // Array to hold split position types
    selectedPositionTypes: Array<string>;

    constructor(data?: any) {
        super();
        this.selectedPositionTypes = new Array<string>();
        if (data) {
            this.deserialize(data);
        }
    }

    /**
     * Serialize the content of this into a favorite format.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): string {
        return this.selectedPositionTypes ? this.selectedPositionTypes.join(',') : '';
    }

    /**
     * Deserialize the saved config into this instance.
     */
    deserialize(data: any): void {
        if (data instanceof SplitPositionSettings) {
            // this happens when new Portfolio object is created it's create with actual instances of these objects.
            this.selectedPositionTypes = data.selectedPositionTypes;
        } else if (data && data.selectedPositionTypes) {
            this.selectedPositionTypes = data.selectedPositionTypes.toString().split(',');
        } else if (typeof data === 'string') {
            this.selectedPositionTypes = data.toString().split(',');
        }
    }

    /**
     * Add the request parameters for the split settings.
     */
    addRequestParams(requestParams: any, paramName?: string): void {
        requestParams.splitPositionTypes = this.serialize();
    }
}
