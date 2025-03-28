import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {FavoriteTitlePipe} from '../../pipes/favorite-title.pipe';

import {LoadSaveFavoriteButtonsComponent} from './load-save-favorite-buttons.component';

describe('LoadSaveFavoriteButtonsComponent', () => {
    let component: LoadSaveFavoriteButtonsComponent;
    let fixture: ComponentFixture<LoadSaveFavoriteButtonsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [LoadSaveFavoriteButtonsComponent, FavoriteTitlePipe],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(LoadSaveFavoriteButtonsComponent);
        component = fixture.componentInstance;
        component.favDisplayName = 'column set';

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('onLoadButtonClicked/onSaveButtonClicked Test', () => {
        const event = new CustomEvent('');

        it('should emit on event onLoadButtonClicked', () => {

            jest.spyOn(component.loadButtonClicked, 'emit');
            component.onLoadButtonClicked(event);

            expect(component.loadButtonClicked.emit).toHaveBeenCalled();
        });

        it('should emit on event onSaveButtonClicked', () => {
            jest.spyOn(component.saveButtonClicked, 'emit');
            component.onSaveButtonClicked(event);

            expect(component.saveButtonClicked.emit).toHaveBeenCalled();
        });
    });

    it('should not show current favorite info when no title or owner passed in', () => {
        component.favoriteTitle = undefined;
        component.favoriteOwner = undefined;
        fixture.detectChanges();

        expect(fixture.debugElement.nativeElement.querySelector('.load-save-favorite-container')).toMatchSnapshot();
        expect(fixture.debugElement.query(By.css('.selected-favorite-container'))).toBeFalsy();
    });

    it('should show current favorite info when title and owner passed in', () => {
        component.favoriteTitle = 'example favorite';
        component.favoriteOwner = 'tilee';
        fixture.detectChanges();

        expect(fixture.debugElement.nativeElement.querySelector('.load-save-favorite-container')).toMatchSnapshot();
        expect(fixture.debugElement.query(By.css('.selected-favorite-container'))).toBeTruthy();
    });

    it('should display workspace owner name as Enterprise for Admin User', () => {
        component.favoriteOwner  = '_ADMIN';
        const event = new CustomEvent('');
        jest.spyOn(component.loadButtonClicked, 'emit');
        component.onLoadButtonClicked(event);
        expect(component.ownerDisplayName).toEqual('Enterprise');
    });

    it('should display workspace owner name as Aladdin for GLOBAL User', () => {
        component.favoriteOwner = '_GLOBAL';
        const event = new CustomEvent('');
        jest.spyOn(component.loadButtonClicked, 'emit');
        component.onLoadButtonClicked(event);
        expect(component.ownerDisplayName).toEqual('Aladdin');
    });

    it('should display current user name as workspace owner name for  other user', () => {
        component.favoriteOwner = 'current user';
        const event = new CustomEvent('');
        jest.spyOn(component.loadButtonClicked, 'emit');
        component.onLoadButtonClicked(event);
        expect(component.ownerDisplayName).toEqual('current user');
    });

});
