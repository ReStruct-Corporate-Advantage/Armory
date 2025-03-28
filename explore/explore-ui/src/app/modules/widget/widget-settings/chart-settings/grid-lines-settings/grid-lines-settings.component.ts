import {AuxCheckboxChangedDetailInterface} from '@blk/aladdin-angular-components';
import {Component, Input, OnInit} from '@angular/core';
import {GridLines} from '@models/widget/inputs/chart-settings/grid-lines.model';

@Component({
  selector: 'app-grid-lines-settings',
  templateUrl: './grid-lines-settings.component.html'
})
/**
 * Component for the Grid Lines settings
 */
export class GridLinesSettingsComponent implements OnInit {
    @Input() widgetInput: GridLines;
    showGridLines: boolean;

    /**
     * Performs required initialization
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    ngOnInit(): void {
        this.showGridLines = this.widgetInput.showGridLines;
    }

    /**
     * Show Grid Line change handler
     */
    onShowGridLineChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.widgetInput.showGridLines = event.detail.value.checked;
        this.showGridLines = this.widgetInput.showGridLines;
    }
}
