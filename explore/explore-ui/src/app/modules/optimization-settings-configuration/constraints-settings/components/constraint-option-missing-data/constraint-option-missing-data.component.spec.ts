import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {of} from 'rxjs';
import {ConstraintOptionMissingDataComponent} from '@optimization-settings-configuration/constraints-settings/components/constraint-option-missing-data/constraint-option-missing-data.component';

describe('ConstraintOptionNumberComponent', () => {
    let component: ConstraintOptionMissingDataComponent;
    let fixture: ComponentFixture<ConstraintOptionMissingDataComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionMissingDataComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ConstraintOptionMissingDataComponent);
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

    it('should emit on value changed', () => {
        const emitSpy = jest.spyOn(component.updated, 'emit');
        component.onUpdated('applyDNTConstraint');
        expect(emitSpy).toHaveBeenCalledWith('applyDNTConstraint');
    });
});
