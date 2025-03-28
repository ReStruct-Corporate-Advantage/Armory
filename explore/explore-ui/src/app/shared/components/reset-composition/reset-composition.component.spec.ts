import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ResetCompositionComponent} from './reset-composition.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('ResetCompositionComponent', () => {
    let component: ResetCompositionComponent;
    let fixture: ComponentFixture<ResetCompositionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ResetCompositionComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ResetCompositionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit resetComposition', () => {
        jest.spyOn(component.resetComposition, 'emit');
        component.onResetComposition();
        expect(component.resetComposition.emit).toHaveBeenCalled();
    });
});
