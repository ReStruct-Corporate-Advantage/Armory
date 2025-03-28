import {AuxTextInputValueChangedDetailInterface, Validator} from '@blk/aladdin-angular-components';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {OptionValueComponent} from '../../interfaces/option-value-component.interface';
import {ConstraintOption} from '../../models/constraint-option';
import {ConstraintOptionValueUpdate} from '../../models/constraint-option-value-update';
import {Observable} from 'rxjs';
import {isEmpty, isNil} from 'lodash';
import {CommonConstants} from '@constants/common.constants';
import {NumberUtils} from '@utils/number.utils';

@Component({
    selector: 'app-constraint-option-number',
    templateUrl: './constraint-option-number.component.html',
    styleUrls: ['./constraint-option-number.component.scss']
})
export class ConstraintOptionNumberComponent implements OptionValueComponent<number, any>, OnInit {
    @Input() options: Array<ConstraintOption<number>>;
    @Input() customStyle: boolean;

    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<number>> = new EventEmitter();

    value$: Observable<number>;
    label: string;
    key: string;
    validator: Validator[];

    ngOnInit(): void {
        const option: ConstraintOption<number> = this.options[0];
        this.value$ = option.value$;
        this.label = option.optionAttribute.title;
        this.key = option.optionAttribute.key;
        this.validator = [{
            validate: (value: number) => {
                return isNil(value) || !isNaN(value);
            },
            errorMessage: CommonConstants.INVALID_INPUT
        }];
    }

    onValueChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        if (!isEmpty(event.detail.value) && !NumberUtils.validateIfStringIsNumber(event.detail.value)) {
            return;
        }
        this.updated.emit({
            key: this.key,
            value: isEmpty(event.detail.value) ? undefined : Number(event.detail.value)
        });
    }
}
