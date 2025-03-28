import {Directive, EventEmitter, Input, Output} from '@angular/core';
import {Breakdown, BreakdownBuilderSettings} from '@blk/explore-ui-breakdown';
import {SubscribableComponent} from '@blk/explore-ui-core';

/**
 * Base class for breakdown options single level and multi level preview
 */
@Directive()
export class BaseBreakdownTypeComponent extends SubscribableComponent {

    @Input()
    isChecked: boolean;

    @Input()
    breakdown: Breakdown;

    @Input()
    breakdownBuilderSettings: BreakdownBuilderSettings;

    @Output()
    breakdownChanged = new EventEmitter<Breakdown>();

    label: string;

    constructor(label: string) {
        super();
        this.label = label;
    }

}
