import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ConstraintOption} from '@optimization-settings-configuration/constraints-settings/models/constraint-option';
import {ConstraintOptionValueUpdate} from '@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update';
import {ColumnOptionAttributeValue} from '@blk/explore-ui-core';
import {OptionValueComponent} from '@optimization-settings-configuration/constraints-settings/interfaces/option-value-component.interface';
import {OptimizationConstants} from '@constants/optimization.constants';

/**
 * Component to create constraint option Bound Type
 */
@Component({
    selector: 'app-constraint-option-bound-type',
    templateUrl: './constraint-option-bound-type.component.html'
})
export class ConstraintOptionBoundTypeComponent implements OptionValueComponent<string, any>, OnInit {

    @Input() options: ConstraintOption<string>[];
    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<string>> = new EventEmitter();

    selectOptions: ConstraintOption<string>[];
    activeSectorInfo = OptimizationConstants.ACTIVE_SECTOR_CONSTRAINTS_INFO;

    /**
     * on init hook
     */
    ngOnInit(): void {
        const option: ConstraintOption<string> = this.options[0];
        const values: ColumnOptionAttributeValue[] = option.optionAttribute.values;
        this.selectOptions = [{
            optionAttribute: {
                title: option.optionAttribute.title,
                key: option.optionAttribute.key,
                values,
                defaultValue: values[0]
            },
            value$: option.value$
        }];
    }

    /**
     * update the constraint option value
     */
    onUpdated(update: ConstraintOptionValueUpdate<string>): void {
        this.updated.emit(update);
    }
}
