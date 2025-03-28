import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {OptionValueComponent} from '@optimization-settings-configuration/constraints-settings/interfaces/option-value-component.interface';
import {ConstraintOption} from '@optimization-settings-configuration/constraints-settings/models/constraint-option';
import {ConstraintOptionValueUpdate} from '@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update';
import {
    AuxCheckboxChangedDetailInterface,
    AuxTextInputValueChangedDetailInterface,
} from '@blk/aladdin-angular-components';
import {isEmpty, Dictionary} from 'lodash';
import {NumberUtils} from '@utils/number.utils';
import {Subject} from 'rxjs';
import {distinctUntilChanged, pluck, takeUntil} from 'rxjs/operators';
import {ConstraintOptionTypeKey} from '@optimization-settings/constraints-settings/enums/constraint-option-type-key.enum';
import {SubscribableComponent} from '@blk/explore-ui-core';
import {ConstraintOptionValueKey} from '@optimization-settings/constraints-settings/enums/constraint-option-value-key.enum';

@Component({
  selector: 'app-constraint-option-min-trade-size',
  templateUrl: './constraint-option-min-trade-size.component.html',
  styleUrls: ['./constraint-option-min-trade-size.component.scss']
})

/**
 * Component to create Min Trade Size constraint options
 */
export class ConstraintOptionMinTradeSizeComponent extends SubscribableComponent implements OptionValueComponent<number, any>, OnInit {
    @Input() options: ConstraintOption<any>[];
    @Input() customStyle: boolean;
    @Input() optionValues$: Subject<Dictionary<any>>;
    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<any>> = new EventEmitter();

    isMixedIntegerEnabled = false;

    minTradeSize: number;
    tradeIncrement: number;
    minTradeSizeLabel: string;
    minTradeSizeKey: string;
    tradeIncrementLabel: string;
    tradeIncrementKey: string;

    ngOnInit(): void {
        this.minTradeSizeKey = this.options[2].optionAttribute.key;
        this.minTradeSizeLabel = this.options[2].optionAttribute.title;
        this.tradeIncrementKey = this.options[3].optionAttribute.key;
        this.tradeIncrementLabel = this.options[3].optionAttribute.title;
        this.optionValues$.pipe(pluck(ConstraintOptionTypeKey.MIXED_INTEGER_SUPPORT),
            distinctUntilChanged(),
            takeUntil(this.ngUnsubscribe))
            .subscribe((value: any) => {
                    this.isMixedIntegerEnabled = value;
                }
            );
        this.optionValues$.pipe(pluck(this.minTradeSizeKey),
            distinctUntilChanged(),
            takeUntil(this.ngUnsubscribe))
            .subscribe((value: any) => {
                    if (this.isMixedIntegerEnabled) {
                        this.minTradeSize = value;
                    }
                }
            );
        this.optionValues$.pipe(pluck(this.tradeIncrementKey),
            distinctUntilChanged(),
            takeUntil(this.ngUnsubscribe))
            .subscribe((value: any) => {
                    if (this.isMixedIntegerEnabled) {
                        this.tradeIncrement = value;
                    }
                }
            );
    }

    /**
     * Handler when child components update any values
     * @param event
     */
    onValueUpdated(event: any): void {
        this.updated.emit({
            changeType: event.changeType,
            key: event.key,
            value: event.value
        });
    }

    /**
     * Handler to update checkbox
     * @param event
     */
    onCheckBoxChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.isMixedIntegerEnabled = event.detail.value.checked;
        this.emitUpdatedValues(ConstraintOptionTypeKey.MIXED_INTEGER_SUPPORT, this.isMixedIntegerEnabled);
        if (this.isMixedIntegerEnabled) {
            this.emitUpdatedValues(ConstraintOptionValueKey.VALUE, 'Security Default');
        } else {
            this.emitUpdatedValues(ConstraintOptionValueKey.VALUE, '');
        }
    }

    /**
     * Handler to update min Trade Size value
     * @param event
     */
    onMinTradeSizeChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>) {
        if (!isEmpty(event.detail.value) && !NumberUtils.validateIfStringIsNumber(event.detail.value)) {
            return;
        }
        this.minTradeSize = Number(event.detail.value);
        this.emitUpdatedValues(this.minTradeSizeKey, this.minTradeSize);

    }

    /**
     * Handler to update trade Increment value
     * @param event
     */
    onTradeIncrementChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>) {
        if (!isEmpty(event.detail.value) && !NumberUtils.validateIfStringIsNumber(event.detail.value)) {
            return;
        }

        this.tradeIncrement = Number(event.detail.value);
        this.emitUpdatedValues(this.tradeIncrementKey, this.tradeIncrement);
    }

    emitUpdatedValues(key: string, value: any) {
        this.updated.emit({
            key, value
        });
    }
}
