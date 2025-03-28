import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuxTextInputBlurDetailInterface } from '@blk/aladdin-angular-components';
import { CustomFormControlBase } from '../../shared/custom-form-control.base';

/**
 * This component wraps the aux-text-input component.
 *
 * @example
 *   <explore-text-input id="compareValue"
 *       class="rule-input-item" placeholder="Value"
 *       style="width: 36%"
 *       [isDisabled]="!highlightSettings.isEnabled"
 *       [value]="highlightSettings.comparisonValues[0]"
 *       (change)="updateCompareValue(0, $event)"
 *       (inputBlur)="validateComparisonValue(0)">
 *   </explore-text-input>
 */
@Component({
  selector: 'explore-text-input',
  templateUrl: './text-input.component.html',
})
export class TextInputComponent extends CustomFormControlBase<any> {
    @Output()
    inputBlur = new EventEmitter<string>();
    @Input()
    errorMessage: string;
    @Input()
    valid = true;
    @Input()
    size: 'small' | 'regular' = 'regular';
    @Input()
    label = '';
    @Input()
    placeholder = '';
    @Input()
    isLeftLabel = false;
    @Input()
    type: 'text' | 'number' | 'currency' | 'contact' | 'email' | 'password' | 'tel' | 'url' = 'text';

    onInputBlur(event: CustomEvent<AuxTextInputBlurDetailInterface>) {
        event.stopPropagation();
        this.inputBlur.emit((event.detail.srcEvent.target as HTMLAuxTextInputElement).value);
    }
}
