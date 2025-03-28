import { Component, Input } from '@angular/core';
import { AuxCheckboxChangedDetailInterface } from '@blk/aladdin-angular-components';
import { CustomFormControlBase } from '../../shared/custom-form-control.base';
/**
 * This component wraps the aux-checkbox component.
 *
 * @example
 *   <explore-checkbox label="Normalized"
 *       [isChecked]="isNormalized.data"
 *       [disabled]="disableNormalizedCheckbox"
 *       (change)="updateNormalizedCheckbox($event.detail.value.checked)">
 *   </explore-checkbox>
 */
@Component({
  selector: 'explore-checkbox',
  templateUrl: './checkbox.component.html',
})
export class CheckboxComponent extends CustomFormControlBase<boolean> {
    @Input()
    label: string;
    @Input()
    size: 'small' | 'regular' = 'regular';
    @Input()
    isChecked: boolean;
    @Input()
    tooltip?: string;

    onCheckboxValueChange(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        event.stopPropagation();
        super.onValueChange(event.detail.value.checked);
      }
}
