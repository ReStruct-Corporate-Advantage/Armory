import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConstraintOptionBoundsLongShortComponent} from './constraint-option-bounds-long-short.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ConstraintOptionValueUpdate} from '../../models/constraint-option-value-update';
import {ConstraintOption} from '../../models/constraint-option';
import {of} from 'rxjs';

describe('ConstraintOptionBoundsLongShortComponent', () => {
    let component: ConstraintOptionBoundsLongShortComponent;
    let fixture: ComponentFixture<ConstraintOptionBoundsLongShortComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionBoundsLongShortComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ConstraintOptionBoundsLongShortComponent);
        component = fixture.componentInstance;
        component.options = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set bounds options on init', () => {
        const longLowerBoundOption: ConstraintOption<number> = {
            optionAttribute: undefined,
            value$: of(1)
        };
        const longUpperBoundOption: ConstraintOption<number> = {
            optionAttribute: undefined,
            value$: of(2)
        };
        const shortLowerBoundOption: ConstraintOption<number> = {
            optionAttribute: undefined,
            value$: of(3)
        };
        const shortUpperBoundOption: ConstraintOption<number> = {
            optionAttribute: undefined,
            value$: of(4)
        };
        component.options = [longUpperBoundOption, longLowerBoundOption, shortUpperBoundOption, shortLowerBoundOption];
        component.ngOnInit();
        expect(component.longLowerBoundOption).toEqual([longLowerBoundOption]);
        expect(component.longUpperBoundOption).toEqual([longUpperBoundOption]);
        expect(component.shortLowerBoundOption).toEqual([shortLowerBoundOption]);
        expect(component.shortUpperBoundOption).toEqual([shortUpperBoundOption]);
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
