import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FavoriteInfoComponent} from './favorite-info.component';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {CoreUserMetaDataStore} from '../../../user-meta-data/core-user-meta-data.store';

describe('FavoriteInfoComponent', () => {
    let component: FavoriteInfoComponent;
    let fixture: ComponentFixture<FavoriteInfoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FavoriteInfoComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(FavoriteInfoComponent);
        component = fixture.componentInstance;
        component.favoriteConfig = {owner: 'Admin'} as any;
        CoreUserMetaDataStore.userMetaData = {login: 'simsingh'} as any;
        fixture.detectChanges();
    });

    it('should set favoriteTitleWithType ADMIN', () => {
        const favoriteConfig = {owner: '_ADMIN'} as any;
        component.favoriteConfig = favoriteConfig;
        component.favoriteConfigType = 'Report';
        component.ngOnChanges({ favoriteConfig: new SimpleChange(favoriteConfig, favoriteConfig, false)});
        expect(component.favoriteLabel).toEqual('Enterprise Report');
    });

    it('should set favoriteTitleWithType TEAM', () => {
        const favoriteConfig = {owner: 'ssTest'} as any;
        component.favoriteConfig = favoriteConfig;
        component.favoriteConfigType = 'Report';
        component.ngOnChanges({ favoriteConfig: new SimpleChange(favoriteConfig, favoriteConfig, false)});
        expect(component.favoriteLabel).toEqual('Team Report');
    });

    it('should set favoriteTitleWithType SELF', () => {
        const favoriteConfig = {owner: 'simsingh'} as any;
        component.favoriteConfig = favoriteConfig;
        CoreUserMetaDataStore.userMetaData.login = 'simsingh';
        component.favoriteConfigType = 'Report';
        component.ngOnChanges({ favoriteConfig: new SimpleChange(favoriteConfig, favoriteConfig, false)});
        expect(component.favoriteLabel).toEqual('My Report');
    });

});
