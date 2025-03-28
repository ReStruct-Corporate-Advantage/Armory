import {AbstractConfig, RequestParamsCreator, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isObject} from 'lodash';

/**
 * Margin Analytics Cassini Settings
 */
export class MarginAnalyticsCassiniSettings extends AbstractConfig implements WidgetInput, RequestParamsCreator {
    static MARGIN_ANALYTICS_CASSINI_SETTING_CONFIG_TYPE = 'marginAnalyticsCassiniSettings';

    calculationStyle: string;

    groupingStyle: string;

    /**
     * Constructor to create an instance of PivotTableSettingsModel
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * @param method to check the equality
     * @return true if the given object equals to this one, otherwise false
     */
    equals(other: AbstractConfig): boolean {
        if (!(other instanceof MarginAnalyticsCassiniSettings)) {
            return false;
        }

        if (this.calculationStyle !== other.calculationStyle) {
            return false;
        }

        return this.groupingStyle === other.groupingStyle;
    }

    /**
     * @return true as it's data store input
     */
    isDataStoreInput(): boolean {
        return true;
    }

    /*
     * See AbstractConfig.deserialize
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }

        this.calculationStyle = data.calculationStyle;
        this.groupingStyle = data.groupingStyle;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /*
     * See AbstractConfig.serialize
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            calculationStyle: this.calculationStyle,
            groupingStyle: this.groupingStyle
        };
    }

    /**
     * Adds MarginAnalysisCassiniSettingsModel request attribute to the given request parameters
     */
    addRequestParams(requestParams: any, paramName?: string): void {
        requestParams[MarginAnalyticsCassiniSettings.MARGIN_ANALYTICS_CASSINI_SETTING_CONFIG_TYPE] = this.serialize();
    }

    /**
     * Gets the type of the config object.
     */
    public static get configType(): string {
        return MarginAnalyticsCassiniSettings.MARGIN_ANALYTICS_CASSINI_SETTING_CONFIG_TYPE;
    }

    /**
     * Gets the type of the config object.
     */
    getConfigType() {
        return MarginAnalyticsCassiniSettings.MARGIN_ANALYTICS_CASSINI_SETTING_CONFIG_TYPE;
    }
}
