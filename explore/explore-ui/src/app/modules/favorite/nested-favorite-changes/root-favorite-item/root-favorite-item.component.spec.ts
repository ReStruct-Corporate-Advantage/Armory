import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RootFavoriteItemComponent} from './root-favorite-item.component';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {
    CoreFavoriteConstants,
    CoreUserMetaDataStore,
    FavoriteDisplayEnum,
    FavoriteType,
    UserMetaData
} from '@blk/explore-ui-core';
import {Report} from '@models/workspace/report.model';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {By} from '@angular/platform-browser';

describe('RootFavoriteItemComponent', () => {
    let component: RootFavoriteItemComponent;
    let fixture: ComponentFixture<RootFavoriteItemComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RootFavoriteItemComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.login = 'user01';

        fixture = TestBed.createComponent(RootFavoriteItemComponent);
        component = fixture.componentInstance;

        const report = new Report();
        report.title = 'Report 1';
        report.owner = 'user01';
        report.id = 1234;

        component.favoriteChange = new FavoriteChange(report, FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
        component.ngOnChanges({favoriteChange: new SimpleChange(undefined, component.favoriteChange, false)});

        fixture.detectChanges();
    });

    it('should display message if favorite is owned by a different user', () => {
        expect(fixture.debugElement.query(By.css('.other-owner-container'))).toBeFalsy();

        component.favoriteChange.value.owner = 'user02';
        component.ngOnChanges({favoriteChange: new SimpleChange(undefined, component.favoriteChange, false)});
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('.other-owner-container'))).toBeTruthy();
    });

    it('should display message if favorite is an admin favorite', () => {
        CoreUserMetaDataStore.userMetaData.sharedFavPerms = true;
        component.isModalRootItem = true;

        const report = new Report();
        report.title = 'Report 1';
        report.owner = CoreFavoriteConstants.ADMIN;
        report.id = 1234;

        component.favoriteChange = new FavoriteChange(report, FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT, true);
        component.ngOnChanges({favoriteChange: new SimpleChange(undefined, component.favoriteChange, false)});
        fixture.detectChanges();

        expect(component.isAdminOrGlobalFavorite).toEqual(true);
    });

    it('should display workspace owner name as Enterprise for Admin User', () => {
        component.favoriteChange.value.owner = '_ADMIN';
        component.ngOnChanges({favoriteChange: new SimpleChange(undefined, component.favoriteChange, false)});
        fixture.detectChanges();
        expect(component.ownerDisplayName).toEqual('Enterprise');
        expect(component.isAdminOrGlobalFavorite).toEqual(true);
    });

    it('should display workspace owner name as Aladdin for GLOBAL User', () => {
        component.favoriteChange.value.owner = '_GLOBAL';
        component.ngOnChanges({favoriteChange: new SimpleChange(undefined, component.favoriteChange, false)});
        fixture.detectChanges();
        expect(component.ownerDisplayName).toEqual('Aladdin');
        expect(component.isAdminOrGlobalFavorite).toEqual(true);
    });

    it('should display current user name as workspace owner name for  other user', () => {
        component.favoriteChange.value.owner = 'current user';
        component.ngOnChanges({favoriteChange: new SimpleChange(undefined, component.favoriteChange, false)});
        fixture.detectChanges();
        expect(component.ownerDisplayName).toEqual('current user');
        expect(component.isAdminOrGlobalFavorite).toEqual(false);
    });

});
