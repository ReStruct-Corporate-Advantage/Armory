import {AuxTextInputValueChangedDetailInterface} from '@blk/aladdin-angular-components';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonConstants} from '@constants/common.constants';
import {CustomFilter} from '@blk/explore-ui-breakdown';

@Component({
    selector: 'app-constraint-option-filter-modal',
    templateUrl: './constraint-option-filter-modal.component.html',
    styleUrls: ['./constraint-option-filter-modal.component.scss']
})
export class ConstraintOptionFilterModalComponent implements OnInit {
    @Input() isOpen: boolean;
    @Input() filter: CustomFilter;

    @Output() submitted: EventEmitter<CustomFilter> = new EventEmitter();
    @Output() cancelled: EventEmitter<void> = new EventEmitter();

    newFilter: CustomFilter;
    filterName: string;
    CommonConstants = CommonConstants;

    ngOnInit() {
        if (this.filter) {
            this.newFilter = new CustomFilter(this.filter.serialize());
            this.newFilter['title'] = this.filter['title'];
        } else {
            this.newFilter = this.createNewFilter();
        }
        this.filterName = this.newFilter['title'];
    }

    onSubmitted(): void {
        this.submitted.emit(this.newFilter);
    }

    onCancelled(): void {
        this.cancelled.emit();
    }

    onValueChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        this.newFilter['title'] = event.detail.value;
    }

    private createNewFilter(): CustomFilter {
        const filter: CustomFilter = new CustomFilter();
        filter['title'] = 'Custom Sector';
        return filter;
    }
}
