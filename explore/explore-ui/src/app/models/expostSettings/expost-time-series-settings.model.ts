import {AbstractConfig, CoreWidgetConstants, DerivedSettings, ExpostSettings, RequestParamsCreator, TimePeriod, WidgetInput} from '@blk/explore-ui-core';
import {DecidesChartingLib} from '@interfaces/decides-charting-lib.interface';
import {cloneDeep, isEmpty, isObject} from 'lodash';

/**
 * ExpostTimeSeriesSettings model
 */
export class ExpostTimeSeriesSettings extends AbstractConfig implements DerivedSettings<ExpostSettings>, WidgetInput, RequestParamsCreator, DecidesChartingLib {

    static readonly EXPOST_TIME_SERIES_SETTINGS = 'expostTimeSeriesSettings';

    timePeriod: TimePeriod;
    expostSettings: ExpostSettings;
    showAsChart = false;

    /**
     * Constructor to create an instance of ExpostTimeSeriesSettings
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * @returns config type.
     */
    static get configType(): string {
        return ExpostTimeSeriesSettings.EXPOST_TIME_SERIES_SETTINGS;
    }

    shouldSkipSerialize(): boolean {
        // Default is to not skip serialization
        return false;
    }

    /**
     * Serialize the config to json.
     */
    serialize(): any {
        const data: any = {};
        data.timePeriod = this.timePeriod.serialize();
        data.expostSettings = this.expostSettings.serialize();
        data.showAsChart = this.showAsChart;
        return data;
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }
        this.timePeriod = new TimePeriod();
        this.timePeriod.deserialize(data.timePeriod);
        this.expostSettings = new ExpostSettings();
        this.expostSettings.deserialize(data.expostSettings);
        this.showAsChart = data.showAsChart;
    }

    /**
     * Return false if the passed in ExpostTimeSeriesSettings is not equal to this
     */
    equals(otherExpostTimeSeriesSettings: AbstractConfig): boolean {
        if (!(otherExpostTimeSeriesSettings instanceof ExpostTimeSeriesSettings)) {
            return false;
        }
        if (!this.timePeriod.equals(otherExpostTimeSeriesSettings.timePeriod)) {
            return false;
        }
        if (!this.expostSettings.equals(otherExpostTimeSeriesSettings.expostSettings)) {
            return false;
        }
        return this.showAsChart === otherExpostTimeSeriesSettings.showAsChart;
    }

    /**
     * @return true as it's data store input
     */
    isDataStoreInput(): boolean {
        return true;
    }

    /**
     * AbstractDerivedSettingsColumnOption.getParentPortfolioSettingKey()
     */
    getParentPortfolioSettingKey(): string {
        return ExpostSettings.EXPOST_SETTINGS;
    }

    /**
     * AbstractDerivedSettingsColumnOption.getParentWidgetSettingKey()
     */
    getParentWidgetSettingKey(): string {
        return ExpostTimeSeriesSettings.EXPOST_TIME_SERIES_SETTINGS;
    }

    /**
     * AbstractDerivedSettingsColumnOption.updateDerivedSettings
     * The portfolio settings overrides the widget-level settings when
     * the widget is added for the first time
     */
    updateDerivedSettings(settings: ExpostSettings) {
        this.expostSettings = isEmpty(this.expostSettings.samplingPeriod.timePeriodName) ? cloneDeep(settings) : this.expostSettings;
    }

    /**
     * Adds request parameters
     * @see RequestParamsCreator.addRequestParams
     */
    addRequestParams(requestParams: any, paramName?: string): void {
        ExpostSettings.addRequestParameters(requestParams, this.expostSettings.samplingPeriod, this.expostSettings.statisticPeriods, this.timePeriod);
    }

    /**
     * DecidesChartingLib.getChartingLib()
     */
    getChartingLib(): string {
        return this.showAsChart ? CoreWidgetConstants.CHARTING_LIB.HIGHCHART : CoreWidgetConstants.CHARTING_LIB.AG_GRID;
    }

    /**
     * DecidesChartingLib.toggleChartingLib()
     */
    toggleChartingLib(): void {
        this.showAsChart = !this.showAsChart;
    }
}
