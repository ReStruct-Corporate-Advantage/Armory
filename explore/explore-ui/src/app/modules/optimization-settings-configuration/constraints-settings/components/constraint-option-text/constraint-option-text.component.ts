import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ConstraintOption} from '@optimization-settings-configuration/constraints-settings/models/constraint-option';
import {ConstraintOptionValueUpdate} from '@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update';
import {Observable} from 'rxjs';
import {AuxTextInputValueChangedDetailInterface} from '@blk/aladdin-angular-components';
import {OptionValueComponent} from '@optimization-settings-configuration/constraints-settings/interfaces/option-value-component.interface';

/**
 * generic text component for constraints
 */
@Component({
  selector: 'app-constraint-option-text',
  templateUrl: './constraint-option-text.component.html'
})
export class ConstraintOptionTextComponent implements OptionValueComponent<string, any>, OnInit  {
    @Input() isDisabled: boolean;
    @Input() options: Array<ConstraintOption<string>>;
    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<string>> = new EventEmitter();

    value$: Observable<string>;
    label: string;
    key: string;

    ngOnInit(): void {
        const option: ConstraintOption<string> = this.options[0];
        this.value$ = option.value$;
        this.label = option.optionAttribute.title;
        this.key = option.optionAttribute.key;
    }

    onValueChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        this.updated.emit({
            key: this.key,
            value: event.detail.value
        });
    }
}
