import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConstraintOptionBoundsRelativeComponent} from './constraint-option-bounds-relative.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {of} from 'rxjs';

describe('ConstraintOptionBoundsRelativeComponent', () => {
    let component: ConstraintOptionBoundsRelativeComponent;
    let fixture: ComponentFixture<ConstraintOptionBoundsRelativeComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionBoundsRelativeComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ConstraintOptionBoundsRelativeComponent);
        component = fixture.componentInstance;
        component.options = [
            {
                optionAttribute: {
                    title: 'Upper bound',
                    key: 'ub'
                },
                value$: of(2)
            },
            {
                optionAttribute: {
                    title: 'Lower bound',
                    key: 'lb'
                },
                value$: of(1)
            },
            {
                optionAttribute: {
                    title: 'title1',
                    key: 'ubOperator',
                    values: [{label: 'label1', value: 'label1'}]
                },
                value$: of('value')
            },
            {
                optionAttribute: {
                    title: 'title2',
                    key: 'lbOperator',
                    values: [{label: 'label1', value: 'label1'}]
                },
                value$: of('value')
            }
        ];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set values on initialization', (done: any) => {
        expect(component.lowerBoundSelectOptions).toEqual([{
            optionAttribute: {
                title: 'title2',
                key: 'lbOperator',
                values: [{
                    label: 'label1',
                    value: 'label1'
                }],
                defaultValue: {
                    label: 'label1',
                    value: 'label1'
                }
            },
            value$: expect.anything()
        }]);
        expect(component.lowerBoundOption).toEqual([{
            optionAttribute: {
                title: 'Lower bound',
                key: 'lb',
            },
            value$: expect.anything()
        }]);
        done();
    });
});
