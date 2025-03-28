import { ComponentFixture, TestBed } from '@angular/core/testing';

import {FavoriteLabelComponent} from './favorite-label.component';
import {FavoriteTitlePipe} from '../../pipes/favorite-title.pipe';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('FavoriteLabelComponent', () => {
    let component: FavoriteLabelComponent;
    let fixture: ComponentFixture<FavoriteLabelComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FavoriteLabelComponent, FavoriteTitlePipe],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(FavoriteLabelComponent);
        component = fixture.componentInstance;
        component.favDisplayName = 'column set';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('onLoadButtonClicked/onSaveButtonClicked Test', () => {
        it('should emit on event onLoadButtonClicked', () => {
            jest.spyOn(component.loadButtonClicked, 'emit');
            component.onLoadButtonClicked();

            expect(component.loadButtonClicked.emit).toHaveBeenCalled();
        });

        it('should emit on event onSaveButtonClicked', () => {
            jest.spyOn(component.saveButtonClicked, 'emit');
            component.onSaveButtonClicked();

            expect(component.saveButtonClicked.emit).toHaveBeenCalled();
        });
    });
});
