import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {LibColumnUtils} from '@blk/explore-ui-column-option';
import {BehaviorSubject, of, throwError} from 'rxjs';

import {CustomFilterComponent} from './custom-filter.component';
import {FavoriteService, NotificationService} from '@services/index';
import {AppStore} from '../../../app.store';
import {ColumnSectorRule, CustomFilter, CustomSector, SectorConstants, SectorRuleBuilderConfig} from '@blk/explore-ui-breakdown';
import {FavoriteConstants} from '@constants/favorite.constants';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {CoreUserMetaDataStore, ErrorTypeConstants, UIErrorParameters, UserMetaData} from '@blk/explore-ui-core';

describe('CustomFilterComponent', () => {
    let component: CustomFilterComponent;
    let fixture: ComponentFixture<CustomFilterComponent>;

    const appStoreStub = {
        openLoadFavoriteModal$: new BehaviorSubject({type: null, treeType: null, displayName: null, loadEnterpriseTree: null, callback: null}),
        saveFavoriteAction$: new BehaviorSubject(new SaveFavoriteAction(null, null, null, null, null, null))
    };
    const favoriteServiceStub = {
        getFavorite$: jest.fn()
    };
    const notificationServiceStub = {
        error: jest.fn()
    };
    const cdRefStub = {
        detectChanges: jest.fn()
    };

    const filter = new CustomFilter();
    filter.customSector = new CustomSector();
    const columnRule = new ColumnSectorRule();

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CustomFilterComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: AppStore, useValue: appStoreStub},
                {provide: FavoriteService, useValue: favoriteServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub},
                {provide: ChangeDetectorRef, useValue: cdRefStub}
            ]
        });

        fixture = TestBed.createComponent(CustomFilterComponent);
        component = fixture.componentInstance;
        component.filter = filter;
        component.filter.customSector.rule = columnRule;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit Test', () => {
        it('should set component variables on initialize', () => {
            component.ngOnInit();

            expect(component.sectorRuleBuilderConfig).toEqual(new SectorRuleBuilderConfig(
                LibColumnUtils.makeColumnTree(component['getColumnsFilter'](), component.fieldToUse),
                null,
                false,
                false,
                SectorConstants.CUSTOM_RULE_BUILDER_HEADERS.CUSTOM_FILTER_RULE));
        });

        describe('getColumnsFilter Test', () => {
            it('should get columns filter', () => {
                expect(component['getColumnsFilter']()).toEqual([{
                    'type': '=',
                    'key': 'isGroupable',
                    'value': true
                }, {
                    'type': '!=',
                    'key': 'columnType',
                    'value': 'FACTOR_ATTRIBUTES'
                }, {
                    'type': '!=',
                    'key': 'columnTag',
                    'value': 'portfolio_group'
                }, {
                    'type': '=',
                    'key': 'levelColumns',
                    'value': undefined
                }, {
                    'type': '!=',
                    'key': 'praadaBreakdown',
                    'value': true
                }, {
                    'key': 'forTopdown',
                    'type': '!=',
                    'value': true
                }]);
            });
        });
    });

    describe('openLoadFavoriteModal Test', () => {
        it('should trigger openLoadFavoriteModal$', () => {
            jest.spyOn(component['appStore'].openLoadFavoriteModal$, 'next');
            component.openLoadFavoriteModal();

            expect(component['appStore'].openLoadFavoriteModal$.next).toHaveBeenCalledWith(
                new LoadFavoriteAction({
                    type: FavoriteConstants.CUSTOM_SECTOR,
                    treeType: FavoriteConstants.CUSTOM_SECTOR_FOLDER,
                    displayName: FavoriteConstants.FILTER_LOWER + 's',
                    callback: component.loadCustomSector,
                    headerDisplayName: FavoriteConstants.FILTER_LOWER
                }));
        });
    });

    describe('openSaveFavoriteModal Test', () => {
        it('should trigger saveFavoriteAction$', () => {
            jest.spyOn(component['appStore'].saveFavoriteAction$, 'next');
            component.openSaveFavoriteModal();

            expect(component['appStore'].saveFavoriteAction$.next).toHaveBeenCalledWith(
                new SaveFavoriteAction(
                    component.filter.customSector,
                    FavoriteConstants.FILTER_LOWER,
                    FavoriteConstants.CUSTOM_SECTOR,
                    FavoriteConstants.CUSTOM_SECTOR_FOLDER
                ));
        });
    });

    describe('loadCustomSector Test', () => {
        it('should call getFavorite$', () => {
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            jest.spyOn(component['favoriteService'], 'getFavorite$').mockReturnValue(of(new CustomSector()));
            jest.spyOn(component['cdRef'], 'detectChanges').mockImplementation(() => {});
            component.loadCustomSector(12345, 'Loading Custom Sector');

            expect(component['favoriteService'].getFavorite$).toHaveBeenCalled();
        });
    });

    describe('loadCustomSector Test', () => {
        it('should update current customSector', async () => {
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            component.filter.customSector = new CustomSector();

            expect(component.filter.customSector.title).toBe(undefined);

            const expectedCustomSector = new CustomSector();
            expectedCustomSector.title = 'custom sector from favorite';
            jest.spyOn(component['favoriteService'], 'getFavorite$').mockReturnValue(of(expectedCustomSector));
            jest.spyOn(component['cdRef'], 'detectChanges').mockImplementation(() => {});
            await component.loadCustomSector(12345, 'Loading Custom Sector');

            expect(component.filter.customSector.title).toBe('custom sector from favorite');
        });

        it('should handle error', async () => {
            jest.spyOn(component['favoriteService'], 'getFavorite$').mockReturnValue(throwError('failed to load custom sector'));
            jest.spyOn(component['notificationService'], 'error');
            await component.loadCustomSector(12345, 'Loading Custom Sector');

            expect(component['notificationService'].error).toHaveBeenCalledWith('failed to load custom sector (filter) with id: 12345', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_FAVORITE_ERROR);
        });
    });

    describe('onApplyFilterToNewWidgetsChanged Test', () => {
        it('should update isApplyFilterToNewWidgetsChecked and emit event when called with true', () => {
            jest.spyOn(component.isApplyFilterToNewWidgetsCheckedChange, 'emit');
            component.onApplyFilterToNewWidgetsChanged(true);

            expect(component.isApplyFilterToNewWidgetsChecked).toBe(true);
            expect(component.isApplyFilterToNewWidgetsCheckedChange.emit).toHaveBeenCalledWith(true);
        });

        it('should update isApplyFilterToNewWidgetsChecked and emit event when called with false', () => {
            jest.spyOn(component.isApplyFilterToNewWidgetsCheckedChange, 'emit');
            component.onApplyFilterToNewWidgetsChanged(false);

            expect(component.isApplyFilterToNewWidgetsChecked).toBe(false);
            expect(component.isApplyFilterToNewWidgetsCheckedChange.emit).toHaveBeenCalledWith(false);
        });
    });

});
