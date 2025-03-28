import {Component} from '@angular/core';
import {AuxRadioInterface} from '@blk/aladdin-angular-components';
import {ScatterDrilldownSetting} from '@models/widget/inputs/chart-settings/scatter-drilldown-setting.model';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {GridLines} from '@models/widget/inputs/chart-settings/grid-lines.model';
import {WidgetDisplayInputConfigType} from '@blk/explore-ui-core';

@Component({
    selector: 'app-scatter-drilldown-settings',
    templateUrl: './scatter-drilldown-settings.component.html',
    styleUrls: ['../chart-settings.component.scss']
})
/**
 * Component class to control ScatterDrilldownSettings for a Scatter Plot widget
 */
export class ScatterDrilldownSettingsComponent extends BaseWidgetSettingComponent<ScatterDrilldownSetting> {
    drilldownOptions: AuxRadioInterface[] = [];
    gridLines: GridLines;

    /**
     * Performs required initialization
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    initializeComponent(): void {
        this.initializeDrilldownOptions();
        this.gridLines = this.inputs.get(WidgetDisplayInputConfigType.SHOW_GRID_LINES) as GridLines;

    }

    /**
     * Callback to update the ScatterDrilldownSetting with what the user selected
     */
    onRadioGroupChanged(option: AuxRadioInterface): void {
        this.widgetInput.groupByFirstLevelData = option.eventData;
    }

    /**
     * Initialize the drilldown setting options
     */
    initializeDrilldownOptions(): void {
        this.drilldownOptions = [
            {
                label: 'Drilldown into sector',
                eventData: false,
                checked: !this.widgetInput.groupByFirstLevelData
            },
            {
                label: 'Drilldown into breakdown levels',
                eventData: true,
                checked: this.widgetInput.groupByFirstLevelData === true
            }
        ];
    }
}
