import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LoadNewFavoriteButtonsComponent} from './load-new-favorite-buttons.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {By} from '@angular/platform-browser';

describe('LoadNewFavoriteButtonsComponent', () => {
    let component: LoadNewFavoriteButtonsComponent;
    let fixture: ComponentFixture<LoadNewFavoriteButtonsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [LoadNewFavoriteButtonsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(LoadNewFavoriteButtonsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(fixture.debugElement.nativeElement.querySelector('.favorite-buttons-container')).toMatchSnapshot();
    });

    it('should disable buttons', () => {
        component.isDisabled = true;
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('aux-button')).properties.isDisabled).toEqual(true);
    });

    it('should show only Load button', () => {
        component.showLoadOnly = true;
        fixture.detectChanges();
        expect(fixture.debugElement.queryAll(By.css('aux-button')).length).toEqual(1);
        expect(fixture.debugElement.nativeElement.querySelector('.favorite-buttons-container')).toMatchSnapshot();
    });

    it('should label New button to CUSTOM', () => {
        component.newButtonLabel = 'CUSTOM';
        fixture.detectChanges();

        expect(fixture.debugElement.queryAll(By.css('aux-button'))[1].properties.label).toEqual('CUSTOM');
    });

    it('should emit event on Load button click', () => {
        jest.spyOn(component.newClick, 'emit');
        jest.spyOn(component.loadClick, 'emit');

        component.onLoadClicked();

        expect(component.newClick.emit).not.toHaveBeenCalled();
        expect(component.loadClick.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit event on New button click', () => {
        jest.spyOn(component.newClick, 'emit');
        jest.spyOn(component.loadClick, 'emit');

        component.onNewClicked();

        expect(component.loadClick.emit).not.toHaveBeenCalled();
        expect(component.newClick.emit).toHaveBeenCalledTimes(1);
    });
});
