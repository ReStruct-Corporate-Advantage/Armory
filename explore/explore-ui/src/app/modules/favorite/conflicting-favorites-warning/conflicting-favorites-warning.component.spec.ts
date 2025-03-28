import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ConflictingFavoritesWarningComponent} from './conflicting-favorites-warning.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('ConflictingFavoritesWarningComponent', () => {
    let component: ConflictingFavoritesWarningComponent;
    let fixture: ComponentFixture<ConflictingFavoritesWarningComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConflictingFavoritesWarningComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConflictingFavoritesWarningComponent);
        component = fixture.componentInstance;
        component.conflictingFavorites = [];
        component.isOpen = true;
        fixture.detectChanges();
    });

    it('should emit event to close modal', () => {
        jest.spyOn(component.modalClosed, 'emit');
        component.closeModal(false);
        component.closeModal(true);
        expect(component.modalClosed.emit).toHaveBeenCalledTimes(2);
        expect(component.isOpen).toEqual(false);
    });
});
