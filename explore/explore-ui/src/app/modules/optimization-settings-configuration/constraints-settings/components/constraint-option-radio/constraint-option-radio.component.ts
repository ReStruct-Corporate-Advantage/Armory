import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {OptionValueComponent} from '../../interfaces/option-value-component.interface';
import {ConstraintOption, ConstraintOptionAttribute, ConstraintOptionAttributeValue} from '../../models/constraint-option';
import {ConstraintOptionValueUpdate} from '../../models/constraint-option-value-update';
import {AuxRadioGroupChangedDetailInterface, AuxRadioInterface} from '@blk/aladdin-angular-components';
import {get} from 'lodash';
import {Observable} from 'rxjs';
import {distinctUntilChanged, map} from 'rxjs/operators';

@Component({
    selector: 'app-constraint-option-radio',
    templateUrl: './constraint-option-radio.component.html'
})
export class ConstraintOptionRadioComponent<T> implements OptionValueComponent<T, any>, OnInit {
    @Input() options: Array<ConstraintOption<T>>;
    @Input() isStacked = false;

    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<T>> = new EventEmitter();

    data$: Observable<AuxRadioInterface[]>;
    key: string;
    label: string;

    ngOnInit(): void {
        const option: ConstraintOption<T> = this.options[0];
        const {optionAttribute, value$}: {optionAttribute: ConstraintOptionAttribute<T>, value$: Observable<T>} = option;
        this.key = optionAttribute.key;
        this.label = optionAttribute.title;
        this.data$ = value$.pipe(
            map((value: T) => this.createData(value, optionAttribute)),
            distinctUntilChanged()
        );
    }

    onRadioGroupChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        this.updated.emit({
            key: this.key,
            value: event.detail.value.eventData
        });
    }

    private createData(value: T, optionAttribute: ConstraintOptionAttribute<T>): AuxRadioInterface[] {
        const selectedValue: T = value ? value : get(optionAttribute, ['defaultValue', 'value']);
        let defaultValue: any;
        const hasValue: boolean = !!selectedValue;

        const data: AuxRadioInterface[] = optionAttribute.values.map((attributeValue: ConstraintOptionAttributeValue<T>, index: number) => {
            const checked: boolean = (hasValue && selectedValue === attributeValue.value) || (!hasValue && index === 0);
            if (checked) {
                defaultValue = attributeValue.value;
            }
            return {
                label: attributeValue.label,
                eventData: attributeValue.value,
                checked
            };
        });

        if (!value) {
            this.updated.emit({
                key: this.key,
                value: defaultValue
            });
        }

        return data;
    }
}
