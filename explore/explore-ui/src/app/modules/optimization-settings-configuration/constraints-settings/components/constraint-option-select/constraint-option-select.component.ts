import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {OptionValueComponent} from '../../interfaces/option-value-component.interface';
import {AuxSelectOption, AuxSelectOptionGroup, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {ConstraintOption, ConstraintOptionAttribute, ConstraintOptionAttributeValue} from '../../models/constraint-option';
import {ConstraintOptionValueUpdate} from '../../models/constraint-option-value-update';
import {Observable} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {OptimizationConstants} from '@constants/optimization.constants';
import {SubscribableComponent} from '@blk/explore-ui-core';

@Component({
    selector: 'app-constraint-option-select',
    templateUrl: './constraint-option-select.component.html',
    styleUrls: ['./constraint-option-select.component.scss']
})
export class ConstraintOptionSelectComponent<T> extends SubscribableComponent implements OptionValueComponent<T, any>, OnInit {
    @Input() isDisabled: boolean;
    @Input() options: Array<ConstraintOption<T>>;
    @Input() customWidth: boolean;
    @Input() instructionalText: string;

    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<T>> = new EventEmitter();

    label: string;
    data: AuxSelectOptionGroup[] = [];
    selected: AuxSelectOption;
    key: string;
    trackedChange: string[] = [];

    ngOnInit(): void {
        const option: ConstraintOption<T> = this.options[0];
        const {optionAttribute, value$}: {optionAttribute: ConstraintOptionAttribute<T>, value$: Observable<T>} = option;
        this.key = optionAttribute.key;
        this.label = optionAttribute.title;
        const values: AuxSelectOption[] = optionAttribute.values.map((attribbuteValue: ConstraintOptionAttributeValue<T>) => this.createSelectOption(attribbuteValue));
        this.data = [{values}];
        value$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
            value => {
                this.selected = this.getSelected(value, optionAttribute.defaultValue, values);
                if (this.selected) {
                    this.selected.isSelected = true;
                }
            });
    }

    onSelectionChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.updated.emit({
            changeType: this.trackedChange.concat(OptimizationConstants.PROGRAMMATIC_QUICK_FACTOR_CHANGE).join(','),
            key: this.key,
            value: (event.detail.value as AuxSelectOption).value
        });
        this.trackedChange.length = 0;
    }

    /**
     * dropdown open hook
     */
    onDropdownOpened(): void {
        this.trackedChange = [OptimizationConstants.MANUAL_QUICK_FACTOR_OPENED];
    }

    /**
     * dropdown close hook
     */
    onDropdownClosed(): void {
        this.trackedChange = [];
    }

    private createSelectOption(optionAttributeValue: ConstraintOptionAttributeValue<T>): AuxSelectOption {
        return {
            displayValue: optionAttributeValue.label,
            value: optionAttributeValue.value
        };
    }

    private getSelected(value: T, defaultValue: ConstraintOptionAttributeValue<T>, selectOptions: AuxSelectOption[]): AuxSelectOption {
        if (value !== undefined) {
            return selectOptions.find((selectOption: AuxSelectOption) => selectOption.value === value || selectOption.value === value.toString());
        } else if (defaultValue) {
            this.updated.emit({
                key: this.key,
                value: defaultValue.value
            });
            return selectOptions.find((selectOption: AuxSelectOption) => selectOption.value === defaultValue.value); //this.createSelectOption(defaultValue);
        } else {
            return undefined;
        }
    }
}
