import {Component} from '@angular/core';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';
import {PieChartDisplayAsOption, PieChartDisplayInput} from '@models/widget/inputs/chart-settings/pie-chart-display-input.model';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';

@Component({
    selector: 'app-pie-chart-display-settings',
    templateUrl: './pie-chart-display-settings.component.html'
})
/**
 * Component for the Pie Chart display settings
 */
export class PieChartDisplaySettingsComponent extends BaseWidgetSettingComponent<PieChartDisplayInput> {
    displayAsOptions: AuxRadioInterface[];

    /**
     * Performs required initialization
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    initializeComponent(): void {
        this.initializeDisplayAsOptions();
    }

    /**
     * Callback to update the PieChartDisplayInput with what the user selected
     */
    onRadioGroupChanged(option: any): void {
        this.widgetInput.displayAs = option.eventData;
    }

    /**
     * Initialize the pie chart display as options
     */
    initializeDisplayAsOptions(): void {
        this.displayAsOptions = [
            {
                label: 'Pie chart',
                eventData: PieChartDisplayAsOption.PIE,
                checked: this.widgetInput.displayAs === PieChartDisplayAsOption.PIE
            },
            {
                label: 'Sunburst chart',
                eventData: PieChartDisplayAsOption.SUNBURST,
                checked: this.widgetInput.displayAs === PieChartDisplayAsOption.SUNBURST
            }
        ];
    }
}
