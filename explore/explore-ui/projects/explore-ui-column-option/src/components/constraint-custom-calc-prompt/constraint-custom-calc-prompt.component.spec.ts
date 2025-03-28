import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ConstraintCustomCalcPromptComponent} from './constraint-custom-calc-prompt.component';

describe('ConstraintCustomCalcPromptComponent', () => {
    let component: ConstraintCustomCalcPromptComponent;
    let fixture: ComponentFixture<ConstraintCustomCalcPromptComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConstraintCustomCalcPromptComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ConstraintCustomCalcPromptComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
