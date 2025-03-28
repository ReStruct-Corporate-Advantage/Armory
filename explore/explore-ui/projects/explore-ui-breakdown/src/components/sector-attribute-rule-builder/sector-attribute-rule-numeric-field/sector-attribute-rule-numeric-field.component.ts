import {Component, OnInit, SimpleChanges} from '@angular/core';
import {BaseSectorAttributeRuleValueFieldComponent} from '../base-sector-attribute-rule-value-field';
import {AuxNumericStepperValueChangedDetailInterface} from '@blk/aladdin-angular-components';
import get from 'lodash/get';
import {Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';

/**
 * This component is used to set comparision value of Column Sector Rule of type attribute, when column data type is numeric i.e. INT or DOUBLE
 */
@Component({
    selector: 'explore-sector-attribute-rule-numeric-field',
    templateUrl: './sector-attribute-rule-numeric-field.component.html'
})
export class SectorAttributeRuleNumericFieldComponent extends BaseSectorAttributeRuleValueFieldComponent<number> implements OnInit {

    private numericFieldValueChanged$ = new Subject<CustomEvent<AuxNumericStepperValueChangedDetailInterface>>();

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.numericFieldValueChanged$
            .pipe(
                takeUntil(this.ngUnsubscribe),
                debounceTime(200)
            )
            .subscribe((event) => {
                if (get(event, 'detail.value')) {
                    this.valueChange.emit(Number(event.detail.value));
                } else {
                    this.valueChange.emit(null);
                }
            });
    }

    /**
     * onChanges
     */
    onChanges(onChanges: SimpleChanges): void {
        // Do nothing
    }

    /**
     * Is called when numeric stepper is updated
     */
    onNumericFieldValueChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        this.numericFieldValueChanged$.next(event);
    }

}
