import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConstraintOptionBoundTypeComponent} from './constraint-option-bound-type.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {of} from 'rxjs';

describe('ConstraintOptionBoundTypeComponent', () => {
    let component: ConstraintOptionBoundTypeComponent;
    let fixture: ComponentFixture<ConstraintOptionBoundTypeComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionBoundTypeComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })

        fixture = TestBed.createComponent(ConstraintOptionBoundTypeComponent);
        component = fixture.componentInstance;
        component.options = [{
            optionAttribute: {
                title: 'title1',
                key: 'key1',
                values: [{label: 'label1', value: 'label1'}]
            },
            value$: of('value')
        }];
        fixture.detectChanges();
    });

    it('should set values on initialization', (done: any) => {
        expect(component.selectOptions).toEqual([{
            optionAttribute: {
                title: 'title1',
                key: 'key1',
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
        component.selectOptions[0].value$.subscribe((value: any) => {
            expect(value).toBe('value');
            done();
        });
    });
});
