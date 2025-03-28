import {Component, Input} from '@angular/core';
import {ExpostTimeSeriesSettings} from '../../../models/expostSettings/expost-time-series-settings.model';

@Component({
    selector: 'app-expost-time-series-settings',
    templateUrl: './expost-time-series-settings.component.html',
    styleUrls: ['./expost-time-series-settings.component.scss']
})
/**
 * Component for expost time series settings
 */
export class ExpostTimeSeriesSettingsComponent {

    @Input() expostTimeSeriesSettings: ExpostTimeSeriesSettings;
}
