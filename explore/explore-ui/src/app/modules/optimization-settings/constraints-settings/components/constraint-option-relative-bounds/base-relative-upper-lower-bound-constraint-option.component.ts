import {Directive, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ConstraintOption} from '@optimization-settings-configuration/constraints-settings/models/constraint-option';
import {ConstraintOptionValueUpdate} from '@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update';
import {OptionValueComponent} from '@optimization-settings-configuration/constraints-settings/interfaces/option-value-component.interface';
import {ColumnOptionAttributeValue} from '@blk/explore-ui-core';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';

/**
 * Base class for relative upper lower bounds constraint options
 */
@Directive()
export class BaseRelativeUpperLowerBoundConstraintOptionDirective implements OptionValueComponent<any, any>, OnInit {

    @Input() options: ConstraintOption<any>[];

    @Input() parentConfig: OptimizationSettings;

    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<any>> = new EventEmitter();

    lowerBoundOption: ConstraintOption<number>[];
    upperBoundOption: ConstraintOption<number>[];
    lowerBoundSelectOptions: ConstraintOption<string>[];
    upperBoundSelectOptions: ConstraintOption<string>[];

    /**
     * onInit hook
     */
    ngOnInit(): void {
        this.upperBoundOption = [this.options[0]];
        this.lowerBoundOption = [this.options[1]];
        const ubOption: ConstraintOption<string> = this.options[2];
        const lbOption: ConstraintOption<string> = this.options[3];
        const lbValues: ColumnOptionAttributeValue[] = lbOption.optionAttribute.values;
        const ubValues: ColumnOptionAttributeValue[] = ubOption.optionAttribute.values;
        this.lowerBoundSelectOptions = [{
            optionAttribute: {
                title: lbOption.optionAttribute.title,
                key: lbOption.optionAttribute.key,
                values: lbValues,
                defaultValue: lbValues[0]
            },
            value$: lbOption.value$
        }];
        this.upperBoundSelectOptions = [{
            optionAttribute: {
                title: ubOption.optionAttribute.title,
                key: ubOption.optionAttribute.key,
                values: ubValues,
                defaultValue: ubValues[0]
            },
            value$: ubOption.value$
        }];
    }

    /**
     * On constraint option value update
     */
    onUpdated(update: ConstraintOptionValueUpdate<any>): void {
        this.updated.emit(update);
    }

}
