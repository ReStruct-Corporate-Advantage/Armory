import {AbstractConfig, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isObject, isUndefined} from 'lodash';
import {HighlightColumnOption} from '@blk/explore-ui-column-option';

/**
 * FactorDataRiskMatrixSettings model
 */
export class FactorDataHighlightSettings extends AbstractConfig implements WidgetInput {

    static readonly FACTOR_DATA_HIGHLIGHT_SETTINGS = 'factorDataHighlightSettings';

    lowerHighlightSettings: HighlightColumnOption;
    upperHighlightSettings: HighlightColumnOption;

    /**
     * Constructor to create an instance of TimeSeriesSettings
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Return true if the passed in timeSeriesSettings is equal to this timeSeriesSettings
     */
    equals(data: AbstractConfig): boolean {
        if (!(data instanceof FactorDataHighlightSettings)) {
            return false;
        }
        if (isUndefined(this.lowerHighlightSettings) === !isUndefined(data.lowerHighlightSettings)) {
            return false;
        }
        if (!isUndefined(this.lowerHighlightSettings) && !isUndefined(data.lowerHighlightSettings) && !this.lowerHighlightSettings.equals(data.lowerHighlightSettings)) {
            return false;
        }
        if (isUndefined(this.upperHighlightSettings) === !isUndefined(data.upperHighlightSettings)) {
            return false;
        }
        return !(!isUndefined(this.upperHighlightSettings) && !isUndefined(data.upperHighlightSettings) && !this.upperHighlightSettings.equals(data.upperHighlightSettings));
    }

    /**
     * @return true as it's data store input
     */
    isDataStoreInput(): boolean {
        return true;
    }

    /**
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }
        if (!isUndefined(data.lowerHighlightSettings)) {
            this.lowerHighlightSettings = new HighlightColumnOption(data.lowerHighlightSettings);
        }
        if (!isUndefined(data.upperHighlightSettings)) {
            this.upperHighlightSettings = new HighlightColumnOption(data.upperHighlightSettings);
        }
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Serialize Object properties into javascript object to be stored as json in favorite.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            lowerHighlightSettings: !isUndefined(this.lowerHighlightSettings) ? this.lowerHighlightSettings.serialize() : undefined,
            upperHighlightSettings: !isUndefined(this.lowerHighlightSettings) ? this.lowerHighlightSettings.serialize() : undefined,
        };
    }

    /**
     * Add parameters to the request
     */
    addRequestParams(_optionValues: any): void {
        // Not sending params in request
    }

    /**
     * @returns config type.
     */
    static get configType(): string {
        return FactorDataHighlightSettings.FACTOR_DATA_HIGHLIGHT_SETTINGS;
    }

}
