import {Component} from '@angular/core';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {AuxCheckboxChangedDetailInterface, AuxRadioGroupChangedDetailInterface, AuxRadioInterface} from '@blk/aladdin-angular-components';
import {Breakdown} from '@blk/explore-ui-breakdown';
import {CommonConstants} from '@constants/common.constants';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {GridLines} from '@models/widget/inputs/chart-settings/grid-lines.model';
import {WidgetDisplayInputConfigType} from '@blk/explore-ui-core';

/**
 * Component for the Time Series Format Settings
 *  This component is separated out from TimeSeriesChartSettingsComponent.
 *  TimeSeriesTimePeriodSettingsComponent is not deprecated yet as the component is used for FactorDataChartSettings.
 */
@Component({
    selector: 'app-time-series-format-settings',
    templateUrl: './time-series-format-settings.component.html',
    styleUrls: ['../chart-settings.component.scss']
})
/**
 * Component for the Time Series Chart Settings
 */
export class TimeSeriesFormatSettingsComponent extends BaseWidgetSettingComponent<TimeSeriesSettings> {
    showTotalLine: boolean;
    showBaseline: boolean;
    dateFormat: string;
    totalSelectionEnabled: boolean;
    showDataMarker: boolean;

    gridLines: GridLines;

    /**
     * Performs required initialization
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    initializeComponent(): void {
        this.showTotalLine = this.widgetInput.includeTotalValues;
        this.showBaseline = this.widgetInput.showBaseline;
        const breakdown = this.inputs?.get(CommonConstants.CONFIG_TYPE.BREAKDOWN_TREE) as Breakdown;
        this.totalSelectionEnabled = breakdown && !breakdown.isEmpty();
        this.showDataMarker = this.widgetInput.showDataMarker;

        this.gridLines = this.inputs.get(WidgetDisplayInputConfigType.SHOW_GRID_LINES) as GridLines;
    }

    /**
     * Show Total Value change handler
     */
    onShowTotalValueChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.showTotalLine = this.widgetInput.includeTotalValues = event.detail.value.checked;
    }

    /**
     * Show Total Value change handler
     */
    onShowDataMarkerChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.showDataMarker = this.widgetInput.showDataMarker = event.detail.value.checked;
    }

    /**
     * Show Total Value change handler
     */
    onShowBaselineValueChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.showBaseline = this.widgetInput.showBaseline = event.detail.value.checked;
    }
}
