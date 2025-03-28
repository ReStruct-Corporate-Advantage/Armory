import {
    AbstractConfig,
    RequestParamsCreator,
    SerializeFavoriteType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';

/**
 * Model for LightLookthrough
 */
export class LightLookthrough extends AbstractConfig implements WidgetInput, RequestParamsCreator {

    // Flag to enable light lookthrough
    isEnabled: boolean;

    /**
     * Constructor to create an instance of GridLines
     */
    constructor(isEnabled?: boolean) {
        super();
        this.isEnabled = !!isEnabled;
    }

    /**
     * comparing items of LightLookthrough
     */
    equals(widgetInput: WidgetInput): boolean {
        return widgetInput instanceof LightLookthrough ? this.isEnabled === widgetInput.isEnabled : false;
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
        this.isEnabled = !!data;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Serialize this object properties to be saved in favorites
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return !!this.isEnabled;
    }

    /**
     * See RequestParamsCreator.addRequestParams
     */
    addRequestParams(requestParams: any, paramName?: string): void {
        const paramNameToUse = paramName ? paramName : LightLookthrough.configType;

        requestParams[paramNameToUse] = this.serialize();
    }

    /**
     * @returns config type.
     */
    static get configType(): string {
        return WidgetInputType.IS_LIGHT_LOOK_THROUGH_ENABLED;
    }

    getConfigType() {
        return WidgetInputType.IS_LIGHT_LOOK_THROUGH_ENABLED;
    }

}
