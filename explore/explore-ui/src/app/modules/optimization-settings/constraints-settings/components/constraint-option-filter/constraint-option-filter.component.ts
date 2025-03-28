import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {OptionValueComponent} from '@optimization-settings-configuration/constraints-settings/interfaces/option-value-component.interface';
import {ConstraintOption} from '@optimization-settings-configuration/constraints-settings/models/constraint-option';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {ConstraintOptionValueUpdate} from '@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {isEmpty} from 'lodash';
import {CustomFilter} from '@blk/explore-ui-breakdown';

@Component({
    selector: 'app-constraint-option-filter',
    templateUrl: './constraint-option-filter.component.html',
    styleUrls: ['./constraint-option-filter.component.scss']
})
export class ConstraintOptionFilterComponent implements OptionValueComponent<CustomFilter, OptimizationSettings>, OnInit {
    @Input() options: Array<ConstraintOption<CustomFilter>>;
    @Input() portFilter: CustomFilter;

    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<CustomFilter>> = new EventEmitter();
    @Output() portFilterUpdated: EventEmitter<CustomFilter> = new EventEmitter();

    openModal = false;
    key: string;
    filterName$: Observable<string>;
    filter$: Observable<CustomFilter>;

    ngOnInit(): void {
        if (!isEmpty(this.options)) {
            const option: ConstraintOption<CustomFilter> = this.options[0];
            this.key = option.optionAttribute.key;
            this.filter$ = option.value$;
            this.filterName$ = this.filter$.pipe(map((filter: CustomFilter) => filter ? filter['title'] : undefined));
        } else {
            this.filter$ = of(this.portFilter);
            this.filterName$ = of(this.portFilter ? this.portFilter.title : undefined);
        }
    }

    onEdited(): void {
        this.openModal = true;
    }

    onSubmitted(filter: CustomFilter) {
        this.openModal = false;
        if (this.portFilter) {
            this.filter$ = of(filter);
            this.filterName$ = of(filter ? filter.title : undefined);
            this.portFilterUpdated.emit(filter);
        } else {
            this.updated.emit({
                key: this.key,
                value: filter
            });
        }
    }

    onCancelled() {
        this.openModal = false;
    }
}
