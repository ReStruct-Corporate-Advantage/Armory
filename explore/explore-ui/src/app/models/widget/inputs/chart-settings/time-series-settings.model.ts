import {AbstractConfig, SerializeFavoriteType, WidgetInput, DateValue, CoreCommonConstants} from '@blk/explore-ui-core';
import {isObject, isUndefined, isNil} from 'lodash';

/**
 * Time series chart settings model
 *
 * This model is used with below configTypes:
 *      ChartWidgetInputConfigType.TIME_SERIES_CHART_SETTINGS
 *      ChartWidgetInputConfigType.TIME_SERIES_TIME_PERIOD_SETTINGS
 *      ChartWidgetInputConfigType.TIME_SERIES_FORMAT_SETTINGS
 */
export class TimeSeriesSettings extends AbstractConfig implements WidgetInput {
    static readonly INPUT_CONFIG_NAME = 'timeSeriesSettings';

    frequency: string;


    // Two options are available for time periods: Rolling and By Date.
    // 1. Opting for the "Rolling" enables users to configure periods to represent the desired number of observations with a specified frequency.
    // 2. Opting for the "By Date" enables users to choose a start date and an end date, with the server then calculating the period based on the selected dates and frequency.
    periods: number;
    startDate: DateValue;
    endDate: DateValue;

    chartType = '';
    dateFormat = 'Aladdin date format';
    appendReportDate: boolean;

    includeTotalValues = false;
    showBaseline = false;
    showDataMarker = true;

    // these settings would be used in Factor Data widget,
    // for showing the difference of data between dates as either percentage or value
    compareModeToggle = false;
    compareMode: string;

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
        if (!(data instanceof TimeSeriesSettings)) {
            return false;
        }
        if (this.frequency !== data.frequency) {
            return false;
        }
        if (this.periods !== data.periods) {
            return false;
        }
        if (this.chartType !== data.chartType) {
            return false;
        }
        if (this.dateFormat !== data.dateFormat) {
            return false;
        }
        if (this.showBaseline !== data.showBaseline) {
            return false;
        }
        if (this.appendReportDate !== data.appendReportDate) {
            return false;
        }
        if (this.showDataMarker !== data.showDataMarker) {
            return false;
        }
        if (this.compareMode !== data.compareMode) {
            return false;
        }
        if (this.compareModeToggle !== data.compareModeToggle) {
            return false;
        }
        return this.includeTotalValues === data.includeTotalValues;
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
        this.frequency = data.frequency;
        this.chartType = data.chartType;
        this.dateFormat = isUndefined(data.dateFormat) ? this.dateFormat : data.dateFormat;
        this.includeTotalValues = data.includeTotalValues;
        this.showBaseline = data.showBaseline;
        this.showDataMarker = data.showDataMarker === undefined || data.showDataMarker;
        this.compareMode = data.compareMode;
        this.compareModeToggle = data.compareModeToggle;

        if (data.periods) {
            this.periods = data.periods;
            this.appendReportDate = data.appendReportDate;
            if (isNil(data.appendReportDate) && this.frequency !== 'DAILY' && this.frequency !== 'WEEKLY') {
                this.periods--;
                this.appendReportDate = true;
            }
        } else {
            this.startDate = DateValue.deserializeDateValue(data.startDate);
            this.endDate = DateValue.deserializeDateValue(data.endDate);
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
        const config: any = {
            frequency: this.frequency,
            chartType: this.chartType,
            dateFormat: this.dateFormat,
            includeTotalValues: this.includeTotalValues,
            showBaseline: this.showBaseline,
            showDataMarker: this.showDataMarker,
            compareMode: this.compareMode,
            compareModeToggle: this.compareModeToggle,
        };

        if (this.periods) {
            config.periods = this.periods;
            config.appendReportDate = this.appendReportDate;
        } else {
            config.startDate = this.startDate ? this.startDate.sanitizeAndSerialize() : DateValue.newDate(CoreCommonConstants.EMPTY_STRING).serialize();
            config.endDate = this.endDate ? this.endDate.sanitizeAndSerialize() : DateValue.newDate(CoreCommonConstants.EMPTY_STRING).serialize();
        }
        return config;
    }

    /**
     * Add parameters to the request
     */
    addRequestParams(optionValues: any): void {
        optionValues.freqType = this.frequency;
        optionValues.includeTotalValues = this.includeTotalValues;

        if (this.periods) {
            // If periods is set, add it to the request.
            optionValues.periods = this.periods;
            if (this.frequency !== 'DAILY' && this.frequency !== 'WEEKLY') {
                optionValues.appendReportDate = this.appendReportDate;
            }
        } else {
            // Otherwise, add start/end dates to the request.
            // forDate is overridden with the end date selected for the time series,
            // as our focus is solely on the dates between the specified start and end dates for the time series.
            optionValues.forDate = this.endDate.dateString ? this.endDate.dateStringValue : this.endDate.date;
            optionValues.startDate = this.startDate.dateString ? this.startDate.dateStringValue : this.startDate.date;
        }
    }
}
