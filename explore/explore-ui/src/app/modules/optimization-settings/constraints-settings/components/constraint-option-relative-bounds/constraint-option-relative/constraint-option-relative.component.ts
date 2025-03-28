import {Component, EventEmitter, Input, Output, OnInit} from '@angular/core';
import {ConstraintOption} from '@optimization-settings-configuration/constraints-settings/models/constraint-option';
import {ConstraintOptionValueUpdate} from '@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {ColumnOptionAttributeValue} from '@blk/explore-ui-core';
import {OptionValueComponent} from '@optimization-settings-configuration/constraints-settings/interfaces/option-value-component.interface';
import {InvestmentUniverseSecurity} from '@models/portfolio/investmentUniverse/investment-universe-security.model';

/**
 * Component to create constraint option Relative to port or bench
 */
@Component({
  selector: 'app-constraint-option-relative',
  templateUrl: './constraint-option-relative.component.html'
})
export class ConstraintOptionRelativeComponent implements OptionValueComponent<string, any>, OnInit {

    @Input() options: ConstraintOption<string>[];
    @Input() parentConfig: OptimizationSettings;

    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<string>> = new EventEmitter();

    selectOptions: ConstraintOption<string>[];

    ngOnInit() {
        const option: ConstraintOption<string> = this.options[0];
        const values: ColumnOptionAttributeValue[] = this.parentConfig.investmentUniverseSettings.investmentUniverse.filter(obj => !(obj instanceof InvestmentUniverseSecurity))
            .map(({label}: {label: string}) => ({
                label,
                value: label
            }));
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


