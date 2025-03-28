import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConstraintOptionTextComponent} from './constraint-option-text.component';
import {of} from 'rxjs';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('ConstraintOptionTextComponent', () => {
    let component: ConstraintOptionTextComponent;
    let fixture: ComponentFixture<ConstraintOptionTextComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionTextComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ConstraintOptionTextComponent);
        component = fixture.componentInstance;
        component.options = [{
            optionAttribute: {
                title: 'title',
                key: 'key'
            },
            value$: of('abc')
        }];
        fixture.detectChanges();
    });

    it('should set values on init', (done: any) => {
        component.value$.subscribe((value: string) => {
            expect(value).toBe('abc');
            done();
        });
        expect(component.label).toBe('title');
        expect(component.key).toBe('key');
    });

    it('should emit on value changed', () => {
        const emitSpy = jest.spyOn(component.updated, 'emit');
        component.onValueChanged({detail: {value: 'abc'}} as any);
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith({
            key: 'key',
            value: 'abc'
        });
    });
});
