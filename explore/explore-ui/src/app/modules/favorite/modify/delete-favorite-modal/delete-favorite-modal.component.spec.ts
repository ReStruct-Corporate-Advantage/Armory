import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {
    AlertConstants,
    CoreFavoriteConstants,
    CoreUserMetaDataStore,
    ErrorTypeConstants,
    FavoriteTitlePipe,
    FavoriteType,
    UIErrorParameters,
    UserMetaData
} from '@blk/explore-ui-core';
import {FavoriteConstants} from '@constants/favorite.constants';
import {BehaviorSubject, of, throwError} from 'rxjs';
import {FavoriteService, NotificationService} from '@services/index';
import {WorkspaceStore} from '@stores/index';
import {Workspace} from '@models/workspace/workspace.model';
import {AppStore} from '../../../../app.store';
import {Report} from '@models/workspace/report.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {DeleteFavoriteModalComponent} from './delete-favorite-modal.component';
import {DeleteFavoriteAction} from '@models/favorite/delete-favorite-action.model';

describe('DeleteFavoriteModalComponent', () => {
    let component: DeleteFavoriteModalComponent;
    let fixture: ComponentFixture<DeleteFavoriteModalComponent>;
    const favoriteServiceStub = {
        deleteFavorite$: jest.fn((any) => of({})),
        postDeleteTelemetry: jest.fn(() => of({}))
    };

    const notificationServiceStub = {
        openDialog: jest.fn(),
        success: jest.fn(),
        error: jest.fn()
    };

    const appStoreStub = {
        deleteFavoriteAction$: new BehaviorSubject(new DeleteFavoriteAction(null, null, null, null, null))
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DeleteFavoriteModalComponent, FavoriteTitlePipe],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: FavoriteService, useValue: favoriteServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub},
                {provide: AppStore, useValue: appStoreStub}
            ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.access = true;
        CoreUserMetaDataStore.userMetaData.login = 'random';
        fixture = TestBed.createComponent(DeleteFavoriteModalComponent);
        component = fixture.componentInstance;

        component.configToDelete = new Workspace();
        component.configToDelete.id = 23456;
        WorkspaceStore.init();
        WorkspaceStore.currentWorkpad$.next(new FlatWorkpad());
    });

    it('should create delete favorite modal', () => {
        expect(component).toBeTruthy();
    });

    describe('onInit Test', () => {
        it('should set variables onInit', () => {
            component.ngOnInit();

            expect(component.selectedUser$.getValue()).toBe('random');
        });

        describe('favorite owner options Test', () => {
            beforeEach(() => {
                component['appStore'].deleteFavoriteAction$ = new BehaviorSubject(new DeleteFavoriteAction(new Report(), 'Report', 'REPORT', 'REPORT_FOLDER'));
                CoreUserMetaDataStore.userMetaData.sharedFavPerms = true;
                CoreUserMetaDataStore.userMetaData.globalFavPerms = true;
            });
            it('Should show only Personal option in favoriteOwnerOptions if user has no perms', () => {
                CoreUserMetaDataStore.userMetaData.sharedFavPerms = false;
                CoreUserMetaDataStore.userMetaData.globalFavPerms = false;
                component.ngOnInit();
                expect(component.favoriteOwnerOption).toEqual([{
                    values: [
                        {displayValue: FavoriteConstants.PERSONAL_ACCOUNT, isSelected: true},
                    ]
                }]);
            });
            it('Should show Admin option in favoriteOwnerOptions if user has sharedFavPerms', () => {
                CoreUserMetaDataStore.userMetaData.globalFavPerms = false;
                component.ngOnInit();
                expect(component.favoriteOwnerOption).toEqual([{
                    values: [
                        {displayValue: FavoriteConstants.PERSONAL_ACCOUNT, isSelected: true},
                        {displayValue: FavoriteConstants.ADMIN_ACCOUNT, isSelected: false}
                    ]
                }]);
            });

            it('Should show Global option in favoriteOwnerOptions if user has globalFavPerms', () => {
                CoreUserMetaDataStore.userMetaData.sharedFavPerms = false;
                component.ngOnInit();
                expect(component.favoriteOwnerOption).toEqual([{
                    values: [
                        {displayValue: FavoriteConstants.PERSONAL_ACCOUNT, isSelected: true},
                        {displayValue: FavoriteConstants.GLOBAL_ACCOUNT, isSelected: false}
                    ]
                }]);
            });

            it('Should show Admin and Global options in favoriteOwnerOptions if user has sharedFavPerms and globalFavPerms', () => {
                component.ngOnInit();
                expect(component.favoriteOwnerOption).toEqual([{
                    values: [
                        {displayValue: FavoriteConstants.PERSONAL_ACCOUNT, isSelected: true},
                        {displayValue: FavoriteConstants.ADMIN_ACCOUNT, isSelected: false},
                        {displayValue: FavoriteConstants.GLOBAL_ACCOUNT, isSelected: false}
                    ]
                }]);
            });
        });

        it('Should subscribe to selectedFavoriteNode$ with type', () => {
            component.selectedFavoriteNode$ = new BehaviorSubject({eventData: {favoriteId: 13579}, label: 'Selected Workspace'});
            component.ngOnInit();

            expect(component.selectedNode).toEqual({eventData: {favoriteId: 13579}, label: 'Selected Workspace'});
            expect(component.favoriteTitle).toBe('Selected Workspace');
            expect(component.isDeleteButtonDisabled).toBeFalsy();
        });

        it('should subscribe to selectedFavoriteNode$ with type folder', () => {
            component.selectedFavoriteNode$ = new BehaviorSubject({eventData: {favoriteId: 13579, type: 'folder'}, label: 'Selected Workspace'});
            component.ngOnInit();

            expect(component.selectedNode).toEqual(null);
            expect(component.favoriteTitle).toBe('');
            expect(component.favId).toBe(null);
            expect(component.isDeleteButtonDisabled).toBeTruthy();
        });
    });

    describe('Close Modal Test', () => {
        it('should close modal', () => {
            component.isOpen = true;
            jest.spyOn(component.modalClosed, 'emit');
            component.closeModal();

            expect(component.isOpen).toBeFalsy();
            expect(component.modalClosed.emit).toHaveBeenCalled();
        });
    });

    describe('On Delete Button Confirm', () => {
        beforeEach(() => {
            component.favId = 12345;
            component.callback = jest.fn();
        });
        it('For Current Favorite Test with Workspace', () => {
            jest.spyOn(component, 'deleteFavorite').mockReturnValue(of(true));
            component.favType = FavoriteType.WORKSPACE;
            component.onDeleteButtonConfirm(true);
            expect(component.deleteFavorite).toHaveBeenCalled();
        });

        it('For Current Favorite Test with Report with Favorite', () => {
            jest.spyOn(component, 'deleteFavorite').mockReturnValue(of(true));
            component.favType = FavoriteType.LAYOUT;
            const report = new Report('ABC');
            report.id = 12345;
            const workpad = new FlatWorkpad();
            workpad.reports.push(report);
            WorkspaceStore.currentWorkpad$.next(workpad);
            component.onDeleteButtonConfirm(true);
            expect(component.deleteFavorite).toHaveBeenCalled();
        });
    });

    describe('onDeleteButtonClicked Test', () => {
        beforeEach(() => {
            component.originalTitle = 'LT Search';
            jest.spyOn(component['notificationService'], 'openDialog');
        });

        it('Should delete with regular delete message', () => {
            component.favoriteTitle = 'Not same as workspace';
            component.onDeleteButtonClicked();
            expect(component['notificationService'].openDialog).toHaveBeenCalled();
        });

        it('Should delete with same workspace delete message', () => {
            component.favoriteTitle = 'LT Search';
            component.onDeleteButtonClicked();
            expect(component['notificationService'].openDialog).toHaveBeenCalled();
        });
    });

    describe('getDeleteFavoriteMessageBodyByType Test', () => {
        beforeEach(() => {
            component.favoriteTitle = 'LT Search';
        });

        it('getDeleteFavoriteMessageBodyByType with Type Workspace is current', () => {
            component.favType = FavoriteType.WORKSPACE;
            expect(component.getDeleteFavoriteMessageBodyByType(true)).toEqual('LT Search' + AlertConstants.BODY.CURR_WORKSPACE_DEL_CONFIRM_SUFFIX);
        });

        it('getDeleteFavoriteMessageBodyByType with Type Layout is current', () => {
            component.favType = FavoriteType.LAYOUT;
            expect(component.getDeleteFavoriteMessageBodyByType(true)).toEqual('LT Search' + AlertConstants.BODY.CURR_REPORT_DEL_CONFIRM_SUFFIX);
        });

        it('getDeleteFavoriteMessageBodyByType generic message', () => {
            expect(component.getDeleteFavoriteMessageBodyByType(true)).toEqual(AlertConstants.BODY.FAV_DEL_CONFIRM_PREFIX + 'LT Search' + AlertConstants.BODY.FAV_DEL_CONFIRM_SUFFIX);
        });
    });
    describe('deleteFavorite Test UUID', () => {
        beforeEach(() => {
            component.favId = 'UUID';
            component.favType = FavoriteConstants.WORKSPACE;
            component.favoriteTitle = 'Test Favorite';
            component.selectedUser$ = new BehaviorSubject('shabraha');
            component.callback = jest.fn();
        });

        it('should display success message for string favId', () => {
            jest.spyOn(component['notificationService'], 'success');
            jest.spyOn(component.updateFavoriteTreeStructure$, 'next');
            component.deleteFavorite(component.favId, component.favType, component.favoriteTitle, component.selectedUser$.getValue());
            expect(component['notificationService'].success).toHaveBeenCalledWith('Successfully deleted the latest version and all the versions of the enterprise component Test Favorite');
            expect(component['favoriteService'].deleteFavorite$).toHaveBeenCalled();
        });
    });

    describe('deleteFavorite Test', () => {
        beforeEach(() => {
            component.favId = 12345;
            component.favType = FavoriteConstants.WORKSPACE;
            component.favoriteTitle = 'LT Search';
            component.selectedUser$ = new BehaviorSubject('abchakra');
            component.callback = jest.fn();
        });

        it('should save favorite and update current config', () => {
            jest.spyOn(component['notificationService'], 'success');
            jest.spyOn(component.updateFavoriteTreeStructure$, 'next');
            component.deleteFavorite(component.favId, component.favType, component.favoriteTitle, component.selectedUser$.getValue());

            // Save buttons are disabled after save clicked and before modal destroyed to prevent multiple saving.
            expect(component.isDeleteButtonDisabled).toBe(true);
            expect(component['notificationService'].success).toHaveBeenCalledWith('Successfully deleted LT Search');
            expect(component['favoriteService'].deleteFavorite$).toHaveBeenCalled();
        });

        it('should trigger updateFavoriteTreeStructure$', () => {
            component.selectedNode = {
                label: 'folder123',
                children: [],
                eventData: {type: 'folder'}
            };
            jest.spyOn(component.updateFavoriteTreeStructure$, 'next');
            component.deleteFavorite(component.favId, component.favType, component.favoriteTitle, component.selectedUser$.getValue());
            expect(component.updateFavoriteTreeStructure$.next).toHaveBeenCalled();
        });

        it('should handle error', () => {
            jest.spyOn(component['favoriteService'], 'deleteFavorite$').mockReturnValue(throwError('Failed to delete the favorite'));
            jest.spyOn(component['notificationService'], 'error');
            jest.spyOn(console, 'error');

            component.deleteFavorite(component.favId, component.favType, component.favoriteTitle, component.selectedUser$.getValue());

            expect(console.error).toHaveBeenCalledWith('Failed to delete the favorite');
            expect(component['notificationService'].error).toHaveBeenCalledWith('Error occurred while deleting : Failed to delete the favorite', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_DELETE_FAVORITE_ERROR);
            expect(component.isDeleteButtonDisabled).toBeFalsy();
        });
    });

    describe('updateFavoriteOwner Test', () => {
        beforeEach(() => {
            component.selectedUser$ = new BehaviorSubject<string>(null);
            jest.spyOn(component.selectedUser$, 'next');
        });

        it('should update to display admin\'s favoriteTree and update save/saveAs button', () => {
            const event = new CustomEvent('build', {detail: {value: {displayValue: FavoriteConstants.ADMIN_ACCOUNT}}});

            component.updateFavoriteOwner(event as any);

            expect(component.selectedUser$.getValue()).toBe(FavoriteConstants.ADMIN_USER);
            expect(component.selectedUser$.next).toHaveBeenCalledWith('_ADMIN');
        });

        it('should update to display global\'s favoriteTree and update save/saveAs button', () => {
            const event = new CustomEvent('build', {detail: {value: {displayValue: FavoriteConstants.GLOBAL_ACCOUNT}}});

            component.updateFavoriteOwner(event as any);

            expect(component.selectedUser$.getValue()).toBe(CoreFavoriteConstants.GLOBAL_USER);
            expect(component.selectedUser$.next).toHaveBeenCalledWith('_GLOBAL');
        });

        it('should update to display login\'s favoriteTree and update save/saveAs button', () => {
            const event = new CustomEvent('build', {detail: {value: {displayValue: FavoriteConstants.PERSONAL_ACCOUNT}}});

            component.updateFavoriteOwner(event as any);

            expect(component.selectedUser$.getValue()).toBe('random');
            expect(component.selectedUser$.next).toHaveBeenCalledWith('random');
        });
    });
});
