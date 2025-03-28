import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MultiLevelBreakdownComponent} from './multi-level-breakdown.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Breakdown, ColumnSector, CustomSector, LinkedFavoriteSector} from '@blk/explore-ui-breakdown';
import {AppStore} from '../../../../app.store';
import {FavoriteService, NotificationService} from '../../../../shared/services';
import {cloneDeep} from 'lodash';
import {of} from 'rxjs';
import {CoreUserMetaDataStore, UserMetaData, TokenUtils, CoreFavoriteConstants} from '@blk/explore-ui-core';
import {FavoriteConstants} from '@constants/favorite.constants';

describe('MultiLevelBreakdownComponent', () => {
    let component: MultiLevelBreakdownComponent;
    let fixture: ComponentFixture<MultiLevelBreakdownComponent>;
    let spyBreakdownChanged;

    const favoriteServiceMock = {
        getFavorite$: jest.fn()
    };

    const notificationServiceMock = {
        error: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MultiLevelBreakdownComponent],
            providers: [
                AppStore,
                {provide: FavoriteService, useValue: favoriteServiceMock},
                {provide: NotificationService, useValue: notificationServiceMock}],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(MultiLevelBreakdownComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        spyBreakdownChanged = jest.spyOn(component.breakdownChanged, 'emit');
    });

    it('Test getReadOnlyBreakdownTreeData', () => {
        const columnSector = new ColumnSector();
        columnSector.columnName = 'Security Group';
        const customSector = new CustomSector();
        customSector.title = 'Custom Sector';
        const linkedFavoriteSector = new LinkedFavoriteSector();
        linkedFavoriteSector.sector = customSector;
        const breakdown = new Breakdown();
        breakdown.addChild(columnSector);
        breakdown.addChild(linkedFavoriteSector);
        const treeList = component['getReadOnlyBreakdownTreeData'](breakdown);
        expect(treeList).toEqual([{
            header: 'Total',
            isExpanded: true,
            disabled: true,
            children: [
                {
                    header: 'Security Group',
                    isExpanded: true,
                    disabled: true,
                    children: undefined
                },
                {
                    header: 'Custom Sector',
                    isExpanded: true,
                    disabled: true,
                    children: undefined
                }
            ]
        }]);
    });

    describe('Test onEditaCopy', () => {
        beforeEach(() => {
            component.multiLevelBreakdown = new Breakdown();
            component.multiLevelBreakdown.id = 123;
            component.multiLevelBreakdown.owner = 'simsingh';
            component.multiLevelBreakdown.title = 'Test Breakdown';
            component.multiLevelBreakdown.children = [new ColumnSector()];
            jest.spyOn<any, any>(component, 'editBreakdown').mockImplementation(
                (breakdown: Breakdown): void => {
                }
            );
        });

        it('edit copy button click', () => {
            const expectedBreakdown = new Breakdown();
            expectedBreakdown.children = [new ColumnSector()];
            component.onEditCopy();
            expect(component['editBreakdown']).toHaveBeenCalledWith(expectedBreakdown);
        });

        it('create new menu click', () => {
            component.onCreateNew();
            expect(component['editBreakdown']).toHaveBeenCalledWith(new Breakdown());
        });

        it('edit original menu click', () => {
            component.onEditOriginal();
            expect(component['editBreakdown']).toHaveBeenCalledWith(cloneDeep(component.multiLevelBreakdown));
        });
    });

    describe('Test Multi level Breakdown Object initialization', () => {

        it('when current breakdown is multi level', () => {
            component.breakdown = new Breakdown();
            component.breakdown.isConfigured = true;
            component.breakdown.title = 'Test Title';
            component.breakdown.addChild(new ColumnSector());
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(false);
            component.multiLevelBreakdown = new Breakdown();
            component.multiLevelBreakdown.owner = '_ADMIN';
            component.ngOnInit();
            expect(component.multiLevelBreakdown !== component.breakdown).toBeTruthy();
            expect(component.multiLevelBreakdown.title).toEqual('Test Title');
        });

        it('when current breakdown is not multi level', () => {
            component.breakdown = new Breakdown();
            component.breakdown.title = 'Test';
            component.breakdown.isConfigured = false;
            component.breakdown.title = 'Test Title';
            component.breakdown.addChild(new ColumnSector());
            component.ngOnInit();
            const multiLevelBreakdown = new Breakdown();
            multiLevelBreakdown.isConfigured = true;
            expect(component.multiLevelBreakdown).toEqual(multiLevelBreakdown);
        });

    });

    it('Test Load Breakdown', () => {
        const favoriteBreakdown = new Breakdown();
        favoriteBreakdown.id = 231;
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.login = 'tsharma';
        jest.spyOn(favoriteServiceMock, 'getFavorite$').mockReturnValue(
            of(favoriteBreakdown)
        );
        component.loadBreakdown(231, 'loading favorite', false, false);
        expect(component.multiLevelBreakdown).toEqual(favoriteBreakdown);
    });

    describe('loadBreakdown', () => {
        it('should load favorite breakdown', () => {
            const favoriteBreakdown = new Breakdown();
            favoriteBreakdown.id = 231;
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            CoreUserMetaDataStore.userMetaData.login = 'tsharma';
            jest.spyOn(favoriteServiceMock, 'getFavorite$').mockReturnValue(
                of(favoriteBreakdown)
            );
            component.loadBreakdown(231, 'loading favorite', false, false);
            expect(component.multiLevelBreakdown).toEqual(favoriteBreakdown);
        });

        it('should load preset breakdown', () => {
            const breakdownTitle = 'IAA Breakdown';
            const presetBreakdownId = 'iaa_breakdown';
            component.loadBreakdown(undefined, 'loading preset breakdown', false, false, breakdownTitle, presetBreakdownId);

            expect(component.multiLevelBreakdown.presetBreakdownId).toEqual(presetBreakdownId);
            expect(component.multiLevelBreakdown.title).toEqual(breakdownTitle);
            expect(component.multiLevelBreakdown.owner).toEqual(FavoriteConstants.PORTFOLIO_SPECIFIC_USER);
            expect(component.multiLevelBreakdown.id).toBeUndefined();

            expect(spyBreakdownChanged).toHaveBeenCalledTimes(1);
        });
    });

    it('Test Edit Breakdown', () => {
        const breakdown = new Breakdown();
        component['editBreakdown'](breakdown);
        component['appStore'].openBreakdownSettingsModal$.getValue().breakdownUpdatedCallback();
        expect(component.multiLevelBreakdown).toBe(breakdown);
    });

    it('Test isEditOriginalEnabled - false, not favorite', () => {
        const breakdown = new Breakdown();

        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.sharedFavPerms = true;
        CoreUserMetaDataStore.userMetaData.login = 'tsharma';

        component['setMultiLevelBreakdown'](breakdown);
        expect(component.isEditOriginalEnabled).toEqual(false);
    });

    it('Test isEditOriginalEnabled - false, not favorite owner', () => {
        const breakdown = new Breakdown();

        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.login = 'tsharma';
        CoreUserMetaDataStore.userMetaData.sharedFavPerms = true;
        breakdown.id = 1234;
        breakdown.owner = 'harshkau';

        component['setMultiLevelBreakdown'](breakdown);
        expect(component.isEditOriginalEnabled).toEqual(false);
    });

    it('Test isEditOriginalEnabled - false, user does not have admin perms', () => {
        const breakdown = new Breakdown();

        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.login = 'tsharma';
        CoreUserMetaDataStore.userMetaData.sharedFavPerms = false;
        breakdown.id = 1234;
        breakdown.owner = CoreFavoriteConstants.ADMIN;

        component['setMultiLevelBreakdown'](breakdown);
        expect(component.isEditOriginalEnabled).toEqual(false);
    });

    it('Test isEditOriginalEnabled - true, favorite owner', () => {
        const breakdown = new Breakdown();

        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.login = 'tsharma';
        CoreUserMetaDataStore.userMetaData.sharedFavPerms = false;
        breakdown.id = 1234;
        breakdown.owner = 'tsharma';

        component['setMultiLevelBreakdown'](breakdown);
        expect(component.isEditOriginalEnabled).toEqual(true);
    });

    it('Test isEditOriginalEnabled - true, user has admin perms', () => {
        const breakdown = new Breakdown();

        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.login = 'tsharma';
        CoreUserMetaDataStore.userMetaData.sharedFavPerms = true;
        breakdown.id = 1234;
        breakdown.owner = CoreFavoriteConstants.ADMIN;

        component['setMultiLevelBreakdown'](breakdown);
        expect(component.isEditOriginalEnabled).toEqual(true);
    });

});
