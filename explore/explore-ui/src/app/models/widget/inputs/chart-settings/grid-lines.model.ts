import {AbstractConfig, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isObject, isUndefined} from 'lodash';

/**
 * Model for GridLines
 *
 * This model is used with below configTypes:
 *      ChartWidgetInputConfigType.GRID_LINES
 *      WidgetDisplayInputConfigType.SHOW_GRID_LINES
 */
export class GridLines extends AbstractConfig implements WidgetInput {

    // Flag indicating showGridLines
    showGridLines: boolean;

    /**
     * Constructor to create an instance of GridLines
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize the passed in data into properties of this object
     */
    deserialize(data: any): void {
        if (isUndefined(data)) {
            return;
        }
        // for old favorites showGridLines is stored inside data.data and
        // for new it will be inside data.showGridLines else it will be a boolean
        if (data.data || data.showGridLines) {
            this.showGridLines = isUndefined(data.data) ? (data.showGridLines.data ? data.showGridLines.data : data.showGridLines) : data.data;
        } else {
            this.showGridLines = data;
        }
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Serialize this object properties into a plain javascript style object to be saved in favorites
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return this.showGridLines;
    }

    /**
     * comparing items of Gridlines
     */
    equals(data: AbstractConfig): boolean {
        return data instanceof GridLines ? this.showGridLines === data.showGridLines : false;
    }

    /**
     * @return false as it's not data store input
     */
    isDataStoreInput(): boolean {
        return false;
    }
}
