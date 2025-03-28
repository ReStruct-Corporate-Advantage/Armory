import {Component} from '@angular/core';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {CustomColorPositiveNegative} from '@models/widget/inputs/chart-settings/custom-color-positive-negative';
import {AuxColorPickerIconEnum} from '@blk/aladdin-angular-components';
import {Breakdown} from '@blk/explore-ui-breakdown';

@Component({
    selector: 'app-custom-color-positive-negative',
    templateUrl: './custom-color-positive-negative.component.html',
    styleUrls: ['./custom-color-positive-negative.component.scss'],
})
/**
 * Component for the Color Scale settings
 */
export class CustomColorPositiveNegativeComponent extends BaseWidgetSettingComponent<CustomColorPositiveNegative> {

    colorPickerIcons = AuxColorPickerIconEnum;

    disableOption: boolean;

    initializeComponent(): void {
       const stackedBreakdown = this.getInput('stackedBreakdownTree');
        this.disableOption = stackedBreakdown && !(stackedBreakdown as Breakdown).isEmpty();
        if (this.disableOption) {
            this.widgetInput.disableAndResetColors();
        }
    }

    /**
     * Checkbox change handler
     */
    onCheckboxGroupChanged(isChecked: boolean): void {
        this.widgetInput.isEnabled = isChecked;
    }

}
