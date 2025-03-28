import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConstraintOptionNumberComponent} from './constraint-option-number.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {of} from 'rxjs';

describe('ConstraintOptionNumberComponent', () => {
    let component: ConstraintOptionNumberComponent;
    let fixture: ComponentFixture<ConstraintOptionNumberComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionNumberComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ConstraintOptionNumberComponent);
        component = fixture.componentInstance;
        component.options = [{
            optionAttribute: {
                title: 'title',
                key: 'key'
            },
            value$: of(1)
        }];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set values on init', (done: any) => {
        component.value$.subscribe((value: number) => {
            expect(value).toBe(1);
            done();
        });
        expect(component.label).toBe('title');
        expect(component.key).toBe('key');
    });

    it('should emit on value changed', () => {
        const emitSpy = jest.spyOn(component.updated, 'emit');
        component.onValueChanged({detail: {value: '1'}} as any);
        expect(emitSpy).toHaveBeenCalledWith({
            key: 'key',
            value: 1
        });

        component.onValueChanged({detail: {value:-2.3}} as any);
        component.onValueChanged({detail: {value:.8}} as any);
        component.onValueChanged({detail: {value:'invalid'}} as any);
        expect(emitSpy).toHaveBeenCalledTimes(3);
    });

    it('should validate the input in text input box', () => {
        component.ngOnInit();
        expect(component.validator[0].validate('a')).toBeFalsy();
        expect(component.validator[0].validate(123)).toBeTruthy();
        expect(component.validator[0].validate('123abc')).toBeFalsy();
    });
});
