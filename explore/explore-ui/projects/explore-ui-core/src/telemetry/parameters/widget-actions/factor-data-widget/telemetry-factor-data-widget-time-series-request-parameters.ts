import {isObject} from 'lodash';
import {TelemetryTimeSeriesSettingParameters} from './telemetry-time-series-setting-parameters';
import {TelemetryFactorParameters} from './telemetry-factor-parameters';
import {FactorDataAnalytic} from '../../../enums';

/**
 * TelemetryFactorDataWidgetTimeSeriesRequestParameters captures information related to all widget settings for Factor Data widget - Time series mode
 */
export class TelemetryFactorDataWidgetTimeSeriesRequestParameters {
    factorAnalytic: FactorDataAnalytic;
    riskSettingsChanged: boolean;
    showAsChart: boolean;
    timeSeriesSetting: TelemetryTimeSeriesSettingParameters;
    factorColumnsList: TelemetryFactorParameters[] = [];
    comparisonFactorColumnsList: TelemetryFactorParameters[] = [];

    /**
     * Constructor.
     */
    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize.
     */
    deserialize(data: any): void {
        // Get out of here if there is no data.
        if (!data) {
            return;
        }
        this.factorAnalytic = data.factorAnalytic;
        this.riskSettingsChanged = data.riskSettingsChanged;
        this.showAsChart = data.showAsChart;
        this.timeSeriesSetting = data.timeSeriesSetting;
        this.factorColumnsList = data.factorColumnsList;
        this.comparisonFactorColumnsList = data.comparisonFactorColumnsList;
    }
}
