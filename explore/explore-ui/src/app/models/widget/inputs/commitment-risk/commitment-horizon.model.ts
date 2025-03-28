import {
    AbstractConfig,
    RequestParamsCreator,
    SerializeFavoriteType,
    WidgetInput,
    WidgetInputType
} from '@blk/explore-ui-core';
import {isEqual} from 'lodash';

export class CommitmentHorizon extends AbstractConfig implements WidgetInput, RequestParamsCreator {

    horizon: number;

    /**
     * Constructor for the model
     */
    constructor(data?: any) {
        super();
        this.horizon = data;
    }

    /**
     * Deserialization method
     */
    deserialize(data: any): void {
        this.horizon = data;
    }

    equals(widgetInput: WidgetInput): boolean {
        if (!(widgetInput instanceof CommitmentHorizon)) {
            return false;
        }

        const other = widgetInput;

        if (this.horizon !== other.horizon) {
            return false;
        }
        return isEqual(this.horizon, other.horizon);
    }

    /**
     * Method to whether show the param in data store
     */
    isDataStoreInput(): boolean {
        return true;
    }

    /**
     * Adding the request params
     */
    addRequestParams(requestParams: any): void {
        requestParams[WidgetInputType.COMMITMENT_HORIZON] = this.serialize();
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Serialization
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return this.horizon;
    }

    /**
     * Gets the type of the config object.
     */
    public static get configType(): string {
        return WidgetInputType.COMMITMENT_HORIZON;
    }

    /**
     * Gets the type of the config object.
     */
    getConfigType() {
        return WidgetInputType.COMMITMENT_HORIZON;
    }
}
