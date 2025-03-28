import {AbstractConfig, SerializeFavoriteType, WidgetInput} from '@blk/explore-ui-core';
import {isObject} from 'lodash';
import {FactorTimeSeriesSelectedOption} from '@enums/factor-time-series-selected-option.enum';

/**
 * Factor Data chart settings model
 */
export class FactorDataChartSettings extends AbstractConfig implements WidgetInput {

    static readonly FACTOR_DATA_CHART_SETTINGS = 'factorDataChartSettings';

    isTimeSeriesMode: boolean;
    factorTimeSeriesSelectedOption: FactorTimeSeriesSelectedOption;
    isDefaultWidgetSettingsModalOpen = false;

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
        if (!(data instanceof FactorDataChartSettings)) {
            return false;
        }
        if (this.factorTimeSeriesSelectedOption !== data.factorTimeSeriesSelectedOption) {
            return false;
        }
        return this.isTimeSeriesMode === data.isTimeSeriesMode;
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
        this.isTimeSeriesMode = data.isTimeSeriesMode;
        this.factorTimeSeriesSelectedOption = data.factorTimeSeriesSelectedOption;
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
            isTimeSeriesMode: this.isTimeSeriesMode,
            factorTimeSeriesSelectedOption: this.factorTimeSeriesSelectedOption
        };
    }

    /**
     * Add parameters to the request
     */
    addRequestParams(optionValues: any): void {
        optionValues[FactorDataChartSettings.FACTOR_DATA_CHART_SETTINGS] = {
            isTimeSeriesMode: this.isTimeSeriesMode,
            factorTimeSeriesSelectedOption: this.factorTimeSeriesSelectedOption
        };
    }

    /**
     * @returns config type.
     */
    static get configType(): string {
        return FactorDataChartSettings.FACTOR_DATA_CHART_SETTINGS;
    }
}
