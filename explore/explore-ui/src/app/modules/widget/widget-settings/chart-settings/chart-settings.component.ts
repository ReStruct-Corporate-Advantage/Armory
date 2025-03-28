import {Component, Input} from '@angular/core';
import {
    WidgetConfigInput,
    WidgetInput,
    WidgetConfigType,
    ChartWidgetInputConfigType
} from '@blk/explore-ui-core';
import {AxisType} from '@models/widget/inputs/chart-settings/axis-settings.model';

@Component({
    selector: 'app-chart-settings',
    templateUrl: './chart-settings.component.html'
})
/**
 * Container for all chart settings
 */
export class ChartSettingsComponent {
    @Input()
    widgetConfigInput: WidgetConfigInput;
    @Input()
    inputs: Map<string, WidgetInput>;
    @Input()
    widgetType: WidgetConfigType;
    readonly ChartWidgetInputConfigType = ChartWidgetInputConfigType;

    readonly AxisType = AxisType;
}
