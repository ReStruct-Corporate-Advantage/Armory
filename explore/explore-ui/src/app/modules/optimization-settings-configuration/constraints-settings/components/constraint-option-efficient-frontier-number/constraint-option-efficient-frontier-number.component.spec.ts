import {ConstraintOptionEfficientFrontierNumberComponent} from '@optimization-settings-configuration/constraints-settings/components/constraint-option-efficient-frontier-number/constraint-option-efficient-frontier-number.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';


describe('ConstraintOptionEfficientFrontierNumberComponent', () => {
    let component: ConstraintOptionEfficientFrontierNumberComponent;
    let fixture: ComponentFixture<ConstraintOptionEfficientFrontierNumberComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintOptionEfficientFrontierNumberComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ConstraintOptionEfficientFrontierNumberComponent);
        component = fixture.componentInstance;
    });

    describe('valid String Test', () => {
        it('should validate and return true for valid strings', () => {
            expect(ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal('2')).toBeTruthy();
            expect(ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal('2.4')).toBeTruthy();
            expect(ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal('-2')).toBeTruthy();
            expect(ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal('-2.4')).toBeTruthy();
            expect(ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal('.4')).toBeTruthy();
            expect(ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal('-.4')).toBeTruthy();
            expect(ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal('.4:.2')).toBeTruthy();
            expect(ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal('-.6:-.2')).toBeTruthy();
            expect(ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal('.4,.2')).toBeTruthy();
            expect(ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal('-.6,-.2')).toBeTruthy();
            expect(ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal('2,4')).toBeTruthy();
            expect(ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal('24.5,30.1')).toBeTruthy();
            expect(ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal('24.5')).toBeTruthy();
            expect(ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal('2,2,4.5')).toBeTruthy();
            expect(ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal('2,2,')).toBeFalsy();
            expect(ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal('2,')).toBeFalsy();
            expect(ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal('2:')).toBeFalsy();
            expect(ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal('2,.8,.4')).toBeTruthy();
            expect(ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal('2.3:5')).toBeTruthy();
            expect(ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal('5:2.3')).toBeTruthy();
        });
    });
});
