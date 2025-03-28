import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConstraintOptionBoundsComponent} from './constraint-option-bounds.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ConstraintOptionValueUpdate} from '../../models/constraint-option-value-update';
import {ConstraintOption} from '../../models/constraint-option';
import {of} from 'rxjs';

describe('ConstraintOptionBoundsComponent', () => {
    let component: ConstraintOptionBoundsComponent;
    let fixture: ComponentFixture<ConstraintOptionBoundsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionBoundsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ConstraintOptionBoundsComponent);
        component = fixture.componentInstance;
        component.options = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set bounds options on init', () => {
        const lowerBoundOption: ConstraintOption<number> = {
            optionAttribute: undefined,
            value$: of(1)
        };
        const upperBoundOption: ConstraintOption<number> = {
            optionAttribute: undefined,
            value$: of(2)
        };
        component.options = [upperBoundOption, lowerBoundOption];
        component.ngOnInit();
        expect(component.lowerBoundOption).toEqual([lowerBoundOption]);
        expect(component.upperBoundOption).toEqual([upperBoundOption]);
    });

    it('should emit on update', () => {
        const emitSpy = jest.spyOn(component.updated, 'emit');
        const update: ConstraintOptionValueUpdate<number> = {
            key: 'key',
            value: 1
        };
        component.onUpdated(update);
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith(update);
    });
});
