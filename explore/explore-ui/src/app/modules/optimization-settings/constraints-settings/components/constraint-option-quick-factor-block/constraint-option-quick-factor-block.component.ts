import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {OptionValueComponent} from '@optimization-settings-configuration/constraints-settings/interfaces/option-value-component.interface';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {ConstraintOption} from '@optimization-settings-configuration/constraints-settings/models/constraint-option';
import {ConstraintOptionValueUpdate} from '@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update';
import {QUICK_FACTOR_BLOCK_LIST} from '@optimization-settings/constraints-settings/constants/constraint.constants';
import {cloneDeep, isNil} from 'lodash';
import {ConstraintOptionTypeKey} from '@optimization-settings/constraints-settings/enums/constraint-option-type-key.enum';
import {BaseFactorConstraintOptionComponent} from '@optimization-settings/constraints-settings/components/base-factor-constraint-option.component';
import {AppStore} from '../../../../../app.store';
import {OptimizationConstants} from '@constants/optimization.constants';
import {ColumnOptionAttributeValue} from '@blk/explore-ui-core';

/**
 * Component to create constraint option Quick Factor Block
 */
@Component({
  selector: 'app-constraint-option-quick-factor-block',
  templateUrl: './constraint-option-quick-factor-block.component.html'
})
export class ConstraintOptionQuickFactorBlockComponent extends BaseFactorConstraintOptionComponent implements OptionValueComponent<string, OptimizationSettings>, OnInit {

    @Input() parentConfig: OptimizationSettings;

    selectOptions: ConstraintOption<string>[];
    quickFactorBlockValue: ConstraintOptionValueUpdate<string>;

    constructor(appStore: AppStore, cdRef: ChangeDetectorRef) {
        super(appStore, cdRef);
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        const option: ConstraintOption<string> = this.options[0];
        const values: ColumnOptionAttributeValue[] = cloneDeep(QUICK_FACTOR_BLOCK_LIST);
        this.selectOptions = [{
            optionAttribute: {
                title: option.optionAttribute.title,
                key: option.optionAttribute.key,
                values,
                defaultValue: values[0]
            },
            value$: option.value$
        }];
        super.ngOnInit();
    }

    /**
     * on quick factor block value updated manually by the user
     */
    onUpdated(update: ConstraintOptionValueUpdate<string>): void {
        if (update.changeType === OptimizationConstants.MANUAL_QUICK_FACTOR_CHANGE) {
            this.quickFactorBlockValue = update;
            super.onUpdated(update, ConstraintOptionTypeKey.FACTOR_TAG);
        }
    }

    /**
     * on selection of quick factor block radio button
     */
    disableOtherField(): void {
        super.disableOtherField(ConstraintOptionTypeKey.FACTOR_TAG);
        if (!isNil(this.quickFactorBlockValue)) {
            this.onUpdated(this.quickFactorBlockValue);
        }
    }

    getKeyToDisable(): string {
        return ConstraintOptionTypeKey.QUICK_FACTOR_BLOCK;
    }
}

