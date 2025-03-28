import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PreviousFavoriteVersionBannerComponent} from './previous-favorite-version-banner.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CoreFavoriteConstants} from '../../constants';
import {CoreFavoriteStore} from '../../stores';
import {Favorite} from '../../models/favorite.model';

describe('PreviousFavoriteVersionBannerComponent', () => {
    let component: PreviousFavoriteVersionBannerComponent;
    let fixture: ComponentFixture<PreviousFavoriteVersionBannerComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PreviousFavoriteVersionBannerComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
        fixture = TestBed.createComponent(PreviousFavoriteVersionBannerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call updateIsPreviousVersion on ngOnChanges', () => {
        jest.spyOn(component, 'updateIsPreviousVersion');
        component.ngOnChanges({
            favoriteId: {currentValue: 'newId', previousValue: 'oldId', firstChange: false, isFirstChange: () => false}
        });
        expect(component.updateIsPreviousVersion).toHaveBeenCalled();
    });

    it('should set isPreviousVersion to false if favoriteId is not set', () => {
        component.favoriteId = null;
        component.updateIsPreviousVersion();
        expect(component.isPreviousVersion).toBe(false);
    });

    it('should set isPreviousVersion to false if owner is not ADMIN', () => {
        component.favoriteId = 'someId';
        component.owner = 'notAdmin';
        component.currentFavoriteVersion = '1.0';
        component.updateIsPreviousVersion();
        expect(component.isPreviousVersion).toBe(false);
    });

    it('should set isPreviousVersion to false if currentFavoriteVersion is not set', () => {
        component.favoriteId = 'someId';
        component.owner = CoreFavoriteConstants.ADMIN;
        component.currentFavoriteVersion = null;
        component.updateIsPreviousVersion();
        expect(component.isPreviousVersion).toBe(false);
    });

    it('should set isPreviousVersion to true if currentFavoriteVersion is different from latestFavoriteVersion', () => {
        component.favoriteId = 'someId';
        component.owner = CoreFavoriteConstants.ADMIN;
        component.currentFavoriteVersion = '1.0';
        jest.spyOn(CoreFavoriteStore.favoriteCache, 'get').mockReturnValue({latestFavoriteVersion: '2.0'} as Favorite);
        component.updateIsPreviousVersion();
        expect(component.isPreviousVersion).toBe(true);
    });

    it('should set isPreviousVersion to false if currentFavoriteVersion is the same as latestFavoriteVersion', () => {
        component.favoriteId = 'someId';
        component.owner = CoreFavoriteConstants.ADMIN;
        component.currentFavoriteVersion = '1.0';
        jest.spyOn(CoreFavoriteStore.favoriteCache, 'get').mockReturnValue({latestFavoriteVersion: '1.0'} as Favorite);
        component.updateIsPreviousVersion();
        expect(component.isPreviousVersion).toBe(false);
    });
});
