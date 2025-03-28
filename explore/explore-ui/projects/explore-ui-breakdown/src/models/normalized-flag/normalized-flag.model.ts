import {
    AbstractConfig,
    RequestParamsCreator,
    SerializeFavoriteType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {isObject} from 'lodash';

/**
 * Model for NormalizedFlag
 */
export class NormalizedFlag extends AbstractConfig implements WidgetInput, RequestParamsCreator {

    static readonly NORMALIZED_WIDGET_FILTER = 'normalizedWidgetFilter';

    // Flag to enable normalized flag
    data: boolean;

    /**
     * Constructor to create an instance of normalized flag
     */
    constructor(data?: boolean) {
        super();
        this.data = !!data;
    }

    /**
     * comparing items of normalized flag
     */
    equals(widgetInput: WidgetInput): boolean {
        return widgetInput instanceof NormalizedFlag ? this.data === widgetInput.data : false;
    }

    /**
     * @return false as it's not data store input
     */
    isDataStoreInput(): boolean {
        return true;
    }

    /**
     * Deserialize the passed in data into properties of this object
     */
    deserialize(data: any): void {
        // An existing explore favorite has a nested data element.
        this.data = isObject(data) ? data && !!(data as any).data : !!data;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Serialize this object properties to be saved in favorites
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return !!this.data;
    }

    /**
     * See RequestParamsCreator.addRequestParams
     */
    addRequestParams(requestParams: any, paramName?: string): void {
        const paramNameToUse = paramName ? paramName : this.configType;
        requestParams[paramNameToUse] = this.serialize();
    }

    /**
     * @returns config type.
     */
    get configType(): string {
        return WidgetInputType.NORMALIZED_FLAG;
    }

    getConfigType() {
        return WidgetInputType.NORMALIZED_FLAG;
    }
}
