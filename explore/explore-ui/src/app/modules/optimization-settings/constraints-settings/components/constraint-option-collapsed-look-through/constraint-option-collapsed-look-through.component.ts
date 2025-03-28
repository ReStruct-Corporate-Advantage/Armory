import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ColumnConfig, SubscribableComponent} from '@blk/explore-ui-core';
import {OptionValueComponent} from '@optimization-settings-configuration/constraints-settings/interfaces/option-value-component.interface';
import {ConstraintOption} from '@optimization-settings-configuration/constraints-settings/models/constraint-option';
import {Subject} from 'rxjs';
import {Dictionary, isNil} from 'lodash';
import {ConstraintOptionValueUpdate} from '@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update';
import {distinctUntilChanged, pluck, takeUntil} from 'rxjs/operators';
import {ConstraintOptionTypeKey} from '@optimization-settings/constraints-settings/enums/constraint-option-type-key.enum';
import {CollapsedLookthroughColumnOption} from '@models/columns/column-options/collapsed-lookthrough-column-option.model';

@Component({
    selector: 'app-constraint-option-collapsed-look-through',
    templateUrl: './constraint-option-collapsed-look-through.component.html',
    styleUrls: ['./constraint-option-collapsed-look-through.component.scss']
})
export class ConstraintOptionCollapsedLookThroughComponent extends SubscribableComponent implements OnInit, OptionValueComponent<any, any> {
    @Input() options: ConstraintOption<any>[];
    @Input() optionValues$: Subject<Dictionary<any>>;
    @Input() columnConfig: ColumnConfig;

    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<CollapsedLookthroughColumnOption | string>> = new EventEmitter();

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.optionValues$.pipe(pluck(ConstraintOptionTypeKey.COLLAPSED_LOOK_THROUGH),
            distinctUntilChanged(),
            takeUntil(this.ngUnsubscribe))
            .subscribe((value: any) => {
                if (!isNil(value)) {
                    this.columnConfig.optionValues = [value instanceof CollapsedLookthroughColumnOption ? value : new CollapsedLookthroughColumnOption(value)];
                }
            });
    }

    /**
     * Emit the updated constraint option value
     */
    updateOptionValue(event: CollapsedLookthroughColumnOption): void {
        this.updated.emit({
            key: ConstraintOptionTypeKey.COLLAPSED_LOOK_THROUGH,
            value: event
        });
    }

}
