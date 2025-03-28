import {Component, Input} from '@angular/core';
import {SubscribableComponent} from '@blk/explore-ui-core';
import {CustomFilter} from '@blk/explore-ui-breakdown';

@Component({
    selector: 'app-screening-filter',
    templateUrl: './screening-filter.component.html',
    styleUrls: ['./screening-filter.component.scss'],
})

/**
 * Screening filter component used in risk parity settings
 */
export class ScreeningFilterComponent extends SubscribableComponent {
    @Input() portFilter: CustomFilter;

    /**
     * updates port filter
     */
    updatePortFilter(portFilter: CustomFilter) {
        this.portFilter.deserialize(portFilter.serialize());
    }
}
