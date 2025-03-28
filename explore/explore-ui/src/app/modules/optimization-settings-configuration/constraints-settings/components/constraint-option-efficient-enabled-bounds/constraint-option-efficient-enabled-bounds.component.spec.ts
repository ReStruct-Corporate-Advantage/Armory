import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConstraintOptionEfficientEnabledBoundsComponent} from './constraint-option-efficient-enabled-bounds.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ConstraintOption} from '@optimization-settings-configuration/constraints-settings/models/constraint-option';
import {of} from 'rxjs';
import {ConstraintOptionValueUpdate} from '@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update';

describe('ConstraintOptionEfficientEnabledBoundsComponent', () => {
    let component: ConstraintOptionEfficientEnabledBoundsComponent;
    let fixture: ComponentFixture<ConstraintOptionEfficientEnabledBoundsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionEfficientEnabledBoundsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ConstraintOptionEfficientEnabledBoundsComponent);
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
            value$: of(11)
        };
        const upperBoundOption: ConstraintOption<number> = {
            optionAttribute: undefined,
            value$: of(22)
        };
        component.options = [upperBoundOption, lowerBoundOption];
        component.ngOnInit();
        expect(component.lowerBoundOption).toEqual([lowerBoundOption]);
        expect(component.upperBoundOption).toEqual([upperBoundOption]);
    });

    it('should emit on update', () => {
        const emitSpy = jest.spyOn(component.updated, 'emit');
        const update: ConstraintOptionValueUpdate<any> = {
            key: 'key',
            value: [1, 3, 5]
        };
        component.onUpdated(update);
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith(update);
    });
});
