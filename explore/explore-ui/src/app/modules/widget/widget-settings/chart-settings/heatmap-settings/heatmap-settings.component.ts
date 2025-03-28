import {Component, Input, OnInit} from '@angular/core';
import {GridLines} from '@models/widget/inputs/chart-settings/grid-lines.model';
import {WidgetDisplayInputConfigType, WidgetInput} from '@blk/explore-ui-core';

@Component({
    selector: 'app-heatmap-settings',
    templateUrl: './heatmap-settings.component.html',
    styleUrls: ['../chart-settings.component.scss']
})
/**
 * Component class to control Heatmap settings
 */
export class HeatmapSettingsComponent implements OnInit {
    @Input() inputs: Map<string, WidgetInput>;
    gridLines: GridLines;

    ngOnInit(): void {
        this.gridLines = this.inputs.get(WidgetDisplayInputConfigType.SHOW_GRID_LINES) as GridLines;
    }
}
