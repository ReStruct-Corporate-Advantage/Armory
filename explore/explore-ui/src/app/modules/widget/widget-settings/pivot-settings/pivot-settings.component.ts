import {AuxCheckboxChangedDetailInterface} from '@blk/aladdin-angular-components';
import {Component} from '@angular/core';
import {PivotTableSettingsModel} from '@models/widget/inputs/pivot-table-settings.model';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';

@Component({
  selector: 'app-pivot-settings',
  templateUrl: './pivot-settings.component.html'
})
/**
 * Component for the Grid Lines settings
 */
export class PivotSettingsComponent extends BaseWidgetSettingComponent<PivotTableSettingsModel> {

    enablePortBench: boolean;

    /**
     * Performs required initialization
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    initializeComponent(): void {
        if (this.widgetInput) {
            this.enablePortBench = this.widgetInput.portBenchActiveEnabled;
        } else {
            this.widgetInput = new PivotTableSettingsModel();
            this.inputs.set(this.widgetConfigInput.inputName, this.widgetInput);
        }
    }

    /**
     * Enable Port/Bench/Active change handler
     */
    onPortBenchActiveChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        this.widgetInput.portBenchActiveEnabled = event.detail.value.checked;
        this.inputs.set(this.widgetConfigInput.inputName, this.widgetInput);
        this.enablePortBench = this.widgetInput.portBenchActiveEnabled;
    }
}
