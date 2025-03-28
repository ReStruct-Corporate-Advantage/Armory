import {Component} from '@angular/core';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {MultiOverrideDateSettings} from '@blk/explore-ui-core';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';

/**
 * Component for the Time Series Time Period Settings
 *  This component is separated out from TimeSeriesChartSettingsComponent.
 *  TimeSeriesChartSettingsComponent is not deprecated yet as the component is used for FactorDataChartSettings.
 */
@Component({
    selector: 'app-time-series-time-period-settings',
    templateUrl: './time-series-time-period-settings.component.html',
    styleUrls: ['../chart-settings.component.scss']
})
export class TimeSeriesTimePeriodSettingsComponent extends BaseWidgetSettingComponent<TimeSeriesSettings> {

    multiOverrideDateSettings: MultiOverrideDateSettings;
    dateFormat: string;

    /**
     * Performs required initialization
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    initializeComponent(): void {
        this.multiOverrideDateSettings = new MultiOverrideDateSettings(this.widgetInput.frequency, undefined, undefined, undefined, this.widgetInput.appendReportDate);
        if (this.widgetInput.periods) {
            this.multiOverrideDateSettings.numberOfObservations = this.widgetInput.periods;
        } else {
            this.multiOverrideDateSettings.startDate = this.widgetInput.startDate;
            this.multiOverrideDateSettings.endDate = this.widgetInput.endDate;
        }
        this.dateFormat = this.widgetInput.dateFormat;
    }

    /**
     * When user is trying to change Frequency or Observation this function get called to update the values
     */
    onMultiOverrideDateSettingsChange(): void {
        this.widgetInput.frequency = this.multiOverrideDateSettings.multiOverrideDateTypeFrequency;
        this.widgetInput.periods = this.multiOverrideDateSettings.numberOfObservations;
        this.widgetInput.appendReportDate = this.multiOverrideDateSettings.appendReportDate;
        this.widgetInput.startDate = this.multiOverrideDateSettings.startDate;
        this.widgetInput.endDate = this.multiOverrideDateSettings.endDate;
    }

    /**
     * Update the selected date-format option
     */
    updateDateFormatValue(selectedDateFormat: string): void {
        this.widgetInput.dateFormat = selectedDateFormat;
    }
}
