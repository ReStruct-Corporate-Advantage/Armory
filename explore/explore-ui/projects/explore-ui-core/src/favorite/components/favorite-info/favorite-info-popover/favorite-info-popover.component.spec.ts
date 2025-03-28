import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FavoriteInfoPopoverComponent} from './favorite-info-popover.component';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {CoreUserMetaDataStore} from '../../../../user-meta-data/core-user-meta-data.store';
import {UserMetaData} from '../../../../user-meta-data/user-meta-data.model';
import {CoreFavoriteStore, CoreFavoriteVersioningStore} from '../../../stores';
import {CoreFavoriteConstants} from '../../../constants';
import {CoreFavoriteUtils} from '../../../utils';
import {ConfigTypeFactory} from '../../../factories';
import {FavoriteDisplayEnum} from '../../../enums';
import {TokenUtils} from '../../../../definition/token/token.utils';
import {ColumnConfig} from '../../../../column/models/column-config/column-config.model';

describe('FavoriteInfoPopoverComponent', () => {
    let component: FavoriteInfoPopoverComponent;
    let fixture: ComponentFixture<FavoriteInfoPopoverComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FavoriteInfoPopoverComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(FavoriteInfoPopoverComponent);
        component = fixture.componentInstance;
        component.favoriteConfig = {owner: 'Admin', title: 'Test'} as any;
        fixture.detectChanges();
    });

    it('if favorite is enterprise', () => {
        const favoriteConfig = {owner: '_ADMIN', displayType: FavoriteDisplayEnum.BREAKDOWN} as any;
        component.favoriteConfig = favoriteConfig;
        component.ngOnChanges({ favoriteConfig: new SimpleChange(favoriteConfig, favoriteConfig, false)});
        expect(component.ownerType).toEqual('Enterprise');
        expect(component.ownerName).toEqual('Enterprise');
    });

    it('if owner is individual', () => {
        const favoriteConfig = {owner: 'simsingh', displayType: FavoriteDisplayEnum.BREAKDOWN} as any;
        component.favoriteConfig = favoriteConfig;
        component.ngOnChanges({ favoriteConfig: new SimpleChange(favoriteConfig, favoriteConfig, false)});
        expect(component.ownerType).toEqual('Personal');
        expect(component.ownerName).toEqual('simsingh');
    });

    it('test for unsaved config', () => {
        const favoriteConfig = {owner: 'seakim', displayType: FavoriteDisplayEnum.BREAKDOWN} as any;
        component.favoriteConfig = favoriteConfig;
        CoreUserMetaDataStore.userMetaData = new UserMetaData({login: 'seakim'});
        component.ngOnChanges({ favoriteConfig: new SimpleChange(favoriteConfig, favoriteConfig, false)});
        expect(component.ownerType).toEqual('Personal');
        expect(component.ownerName).toEqual('seakim');
    });

    it('should test onViewVersionLogClick', () => {
        jest.spyOn(CoreFavoriteVersioningStore.favoriteVersionLogAction$, 'next' as any);
        component.onViewVersionLogClick();
        expect(CoreFavoriteVersioningStore.favoriteVersionLogAction$['next']).toHaveBeenCalled();
    });

    it('should subscribe to CoreFavoriteStore.favSavedNotifier$ on ngOnInit', () => {
        const spy = jest.spyOn(CoreFavoriteStore.favSavedNotifier$, 'pipe').mockReturnValue({
            subscribe: jest.fn()
        } as any);
        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });

    it('should update favoriteConfig and owner details on new favorite ID', () => {
        const newId = 1;
        const mockFavoriteConfig = {id: newId, owner: 'oldOwner'} as any;
        jest.spyOn(ConfigTypeFactory, 'getFavoriteConfig').mockReturnValue(mockFavoriteConfig);
        jest.spyOn(CoreFavoriteUtils, 'isAdminOrGlobalFavorite').mockReturnValue(false);
        jest.spyOn(CoreFavoriteUtils, 'getFavoriteOwnerDisplayName').mockReturnValue('newOwner');

        component.favoriteConfig = {id: 1, owner: 'oldOwner'} as any;
        component.favoriteConfigType = CoreFavoriteConstants.FAVORITE_DISPLAY_TITLE.WORKSPACE;

        CoreFavoriteStore.favSavedNotifier$.next(newId);

        expect(component.favoriteConfig).toEqual(mockFavoriteConfig);
    });

    it('should set ownerType and ownerName correctly on ngOnInit', () => {
        const mockFavoriteConfig = {id: 1, owner: 'admin'} as any;
        jest.spyOn(CoreFavoriteUtils, 'isAdminOrGlobalFavorite').mockReturnValue(true);
        jest.spyOn(CoreFavoriteUtils, 'getFavoriteOwnerDisplayName').mockReturnValue('Enterprise');

        component.favoriteConfig = mockFavoriteConfig;
        component.favoriteConfigType = CoreFavoriteConstants.FAVORITE_DISPLAY_TITLE.REPORT;

        component.ngOnInit();

        CoreFavoriteStore.favSavedNotifier$.next(1);

        expect(component.favoriteConfig).toEqual(mockFavoriteConfig);
    });

    it('should set showVersionLogLink to false for specific display types', () => {
        const mockFavoriteConfig = {id: 1, owner: 'admin', displayType: 'BATCH_REPORT' } as any;
        jest.spyOn(CoreFavoriteUtils, 'isAdminOrGlobalFavorite').mockReturnValue(true);
        jest.spyOn(CoreFavoriteUtils, 'getFavoriteOwnerDisplayName').mockReturnValue('Enterprise');
        component.showVersionLogLink = false;
        component.favoriteConfig = mockFavoriteConfig;
        component.ngOnInit();

        expect(component.showVersionLogLink).toBe(false);
        const mockFavoriteConfigOpto = {id: 1, owner: 'admin', displayType: 'OPTIMIZATION_SETTINGS' } as any;
        component.showVersionLogLink = false;
        component.favoriteConfig = mockFavoriteConfigOpto;

        component.ngOnInit();

        expect(component.showVersionLogLink).toBe(false);
    });

    it('Test setShowVersionLogLink', () => {
        expect(component.setShowVersionLogLink()).toBeFalsy();
        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
        expect(component.setShowVersionLogLink()).toBeFalsy();
        component.favoriteConfig = new ColumnConfig() as any;
        component.favoriteConfig.owner = CoreFavoriteConstants.ADMIN;
        expect(component.setShowVersionLogLink()).toBeFalsy();
        component.favoriteConfig.id = 'abcd';
        expect(component.setShowVersionLogLink()).toBeTruthy();
        component.favoriteConfig.id = 1234;
        expect(component.setShowVersionLogLink()).toBeFalsy();
        component.favoriteConfig.aliasId = 'abcde';
        expect(component.setShowVersionLogLink()).toBeTruthy();
    });
});
