import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FavoriteDetailsHeaderComponent} from './favorite-details-header.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CoreUserMetaDataStore} from '../../../user-meta-data/core-user-meta-data.store';
import {UserMetaData} from '../../../user-meta-data/user-meta-data.model';
import {CoreFavoriteConstants} from '../../constants';
import {By} from '@angular/platform-browser';

describe('FavoriteDetailsHeaderComponent', () => {
    let component: FavoriteDetailsHeaderComponent;
    let fixture: ComponentFixture<FavoriteDetailsHeaderComponent>;

    beforeAll(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.login = 'tilee';
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FavoriteDetailsHeaderComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(FavoriteDetailsHeaderComponent);
        component = fixture.componentInstance;

        component.title = 'Favorite Breakdown';
        component.owner = CoreFavoriteConstants.ADMIN;
        component.displayType = CoreFavoriteConstants.FAVORITE_DISPLAY_TITLE.BREAKDOWN;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(fixture.debugElement.nativeElement.querySelector('.favorite-details-container')).toMatchSnapshot();
    });

    it('should display icon and author for Enterprise breakdowns', () => {
        component.owner = CoreFavoriteConstants.ADMIN;
        fixture.detectChanges();

        expect(fixture.debugElement.nativeElement.querySelector('.favorite-details-container')).toMatchSnapshot();

        // icon
        expect(fixture.debugElement.query(By.css('aux-icon'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('aux-icon')).properties.type).toEqual('template-loaded');

        expect(fixture.debugElement.query(By.css('.favorite-title')).nativeElement.textContent).toEqual('Enterprise Breakdown: Favorite Breakdown');
    });

    it('should display icon and author for Team breakdowns', () => {
        component.owner = 'teammate01';
        fixture.detectChanges();

        expect(fixture.debugElement.nativeElement.querySelector('.favorite-details-container')).toMatchSnapshot();

        // icon
        expect(fixture.debugElement.query(By.css('aux-icon'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('aux-icon')).properties.type).toEqual('template-loaded');

        // author
        expect(fixture.debugElement.query(By.css('.favorite-author'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.favorite-author')).nativeElement.textContent).toEqual('Ownerteammate01');

        expect(fixture.debugElement.query(By.css('.favorite-title')).nativeElement.textContent).toEqual('Team Breakdown: Favorite Breakdown');
    });

    it('should not display icon or author for personal breakdowns', () => {
        component.owner = 'tilee';
        fixture.detectChanges();

        expect(fixture.debugElement.nativeElement.querySelector('.favorite-details-container')).toMatchSnapshot();

        // icon
        expect(fixture.debugElement.query(By.css('aux-icon'))).toBeFalsy();

        // author
        expect(fixture.debugElement.query(By.css('.favorite-author'))).toBeFalsy();

        expect(fixture.debugElement.query(By.css('.favorite-title')).nativeElement.textContent).toEqual('My Breakdown: Favorite Breakdown');
    });

    it('should display workspace owner name as Enterprise for Admin User', () => {
        component.displayType = 'Breakdown';
        component.owner = '_ADMIN';
        component.ngOnInit();
        expect(component.ownerDisplayName).toEqual('Enterprise');
    });

    it('should display workspace owner name as Aladdin for GLOBAL User', () => {
        component.owner = '_GLOBAL';
        component.ngOnInit();
        expect(component.ownerDisplayName).toEqual('Aladdin');
    });

    it('should display current user name as workspace owner name for  other user', () => {
        component.owner = 'current user';
        component.ngOnInit();
        expect(component.ownerDisplayName).toEqual('current user');
    });
});
