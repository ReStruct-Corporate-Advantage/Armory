import {Directive, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {SubscribableComponent} from '@blk/explore-ui-core';

/**
 * Base class for components used to set comparision value of Column Sector Rule of type attribute
 */
@Directive()
export abstract class BaseSectorAttributeRuleValueFieldComponent<T> extends SubscribableComponent implements OnChanges {

    /**
     * Initial value binding
     */
    @Input()
    value: T;

    /**
     * To notify value change
     */
    @Output()
    valueChange = new EventEmitter<T>();

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.value) {
            this.valueChange.emit(this.value);
        }
        this.onChanges(changes);
    }

    abstract onChanges(onChanges: SimpleChanges): void;

}
