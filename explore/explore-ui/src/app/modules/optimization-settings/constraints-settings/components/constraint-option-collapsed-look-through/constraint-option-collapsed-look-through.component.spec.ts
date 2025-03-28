import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ConstraintOptionCollapsedLookThroughComponent} from '@optimization-settings/constraints-settings/components/constraint-option-collapsed-look-through/constraint-option-collapsed-look-through.component';
import {of, Subject} from 'rxjs';
import {Dictionary} from 'lodash';
import {ConstraintOptionTypeKey} from '@optimization-settings/constraints-settings/enums/constraint-option-type-key.enum';
import {CustomCalculationConstants} from '@blk/explore-ui-column-option';
import {ColumnConfig} from '@blk/explore-ui-core';
import {CollapsedLookthroughColumnOption} from '@models/columns/column-options/collapsed-lookthrough-column-option.model';

describe('ConstraintOptionCollapsedLookThrough', () => {
    let component: ConstraintOptionCollapsedLookThroughComponent;
    let fixture: ComponentFixture<ConstraintOptionCollapsedLookThroughComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionCollapsedLookThroughComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ConstraintOptionCollapsedLookThroughComponent);
        component = fixture.componentInstance;
        component.options = [
            {
                optionAttribute: {
                    title: 'Type',
                    key: 'subtotalType'
                },
                value$: of(2)
            },
            {
                optionAttribute: {
                    title: 'Weight Type',
                    key: 'weightType'
                },
                value$: of('PORT')
            },
            {
                optionAttribute: {
                    title: '"Column weight type"',
                    key: '"colWeightType"'
                },
                value$: of('NOTIONAL')
            }
        ];
        component.optionValues$ = new Subject<Dictionary<any>>();
        component.optionValues$.next({
            key: ConstraintOptionTypeKey.COLLAPSED_LOOK_THROUGH,
            value: new CollapsedLookthroughColumnOption({})
        });
        component.columnConfig = new ColumnConfig(CustomCalculationConstants.CUSTOM_CALCULATION);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('should set values on init', (done: any) => {
    // });

    it('should emit on selection changed', () => {
        const emitSpy = jest.spyOn(component.updated, 'emit');
        const update = new CollapsedLookthroughColumnOption();
        component.updateOptionValue(update);
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });
});
