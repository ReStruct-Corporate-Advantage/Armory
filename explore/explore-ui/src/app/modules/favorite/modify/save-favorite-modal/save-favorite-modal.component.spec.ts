import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FavoriteConstants} from '@constants/favorite.constants';
import {BehaviorSubject, of, throwError} from 'rxjs';

import {SaveFavoriteModalComponent} from './save-favorite-modal.component';
import {FavoriteService, NotificationService} from '@services/index';
import {FavoriteStore, WorkspaceStore} from '@stores/index';
import {Workspace} from '@models/workspace/workspace.model';
import {AppStore} from '../../../../app.store';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {Report} from '@models/workspace/report.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {
    AlertConstants,
    CoreDefinitionStore,
    CoreFavoriteConstants,
    CoreFavoriteUtils,
    CoreUserMetaDataStore,
    ErrorTypeConstants,
    ExploreDialogParam,
    Favorite,
    FavoriteTitlePipe, FavoriteType,
    TokenConstants,
    TokenUtils,
    UIErrorParameters,
    UserMetaData
} from '@blk/explore-ui-core';

describe('SaveFavoriteModalComponent', () => {
    let component: SaveFavoriteModalComponent;
    let fixture: ComponentFixture<SaveFavoriteModalComponent>;
    const favoriteServiceStub = {
        saveFavorite$: jest.fn(() => of({
            status: 'SUCCESS',
            message: 'Successfully saved the favorite',
            favoriteId: 1757226,
            owner: 'seakim',
            type: 'WORKSPACE'
        })),
    };

    const notificationServiceStub = {
        openDialog: jest.fn(),
        success: jest.fn(),
        error: jest.fn()
    };

    const appStoreStub = {
        saveFavoriteAction$: new BehaviorSubject(new SaveFavoriteAction(null, null, null, null, null, null))
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SaveFavoriteModalComponent, FavoriteTitlePipe],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: FavoriteService, useValue: favoriteServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub},
                {provide: AppStore, useValue: appStoreStub}
            ],
        });

        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.access = true;
        CoreUserMetaDataStore.userMetaData.pricePopupAccess = true;
        CoreUserMetaDataStore.userMetaData.launchApps = ['SECURITY_MASTER', 'ANSER', 'ALADDIN_VIEW'];
        CoreUserMetaDataStore.userMetaData.login = 'seakim';
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS] = 'Y';

        fixture = TestBed.createComponent(SaveFavoriteModalComponent);
        component = fixture.componentInstance;

        component.configToSave = new Workspace();
        component.configToSave.id = 23456;
        WorkspaceStore.init();
        WorkspaceStore.currentWorkpad$.next(new FlatWorkpad());

    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(fixture.debugElement.nativeElement.querySelector('.save-favorite-modal-area')).toMatchSnapshot();
    });

    describe('onInit Test', () => {
        it('should set variables onInit', () => {

            component.ngOnInit();

            expect(component.selectedUser$.getValue()).toBe('seakim');
        });

        describe('favorite owner options Test', () => {
            beforeEach(() => {
                component['appStore'].saveFavoriteAction$ = new BehaviorSubject(new SaveFavoriteAction(new Report(), 'Report', 'REPORT', 'REPORT_FOLDER'));
                CoreUserMetaDataStore.userMetaData.sharedFavPerms = true;
                CoreUserMetaDataStore.userMetaData.globalFavPerms = true;
            });
            it('should show only Personal option in favoriteOwnerOptions if user has no perms', () => {
                CoreUserMetaDataStore.userMetaData.sharedFavPerms = false;
                CoreUserMetaDataStore.userMetaData.globalFavPerms = false;
                component.ngOnInit();
                expect(component.favoriteOwnerOption).toEqual([{
                    values: [
                        {displayValue: FavoriteConstants.PERSONAL_ACCOUNT, isSelected: true},
                    ]
                }]);
            });
            it('should show Admin option in favoriteOwnerOptions if user has sharedFavPerms', () => {
                CoreUserMetaDataStore.userMetaData.globalFavPerms = false;
                component.ngOnInit();
                expect(component.favoriteOwnerOption).toEqual([{
                    values: [
                        {displayValue: FavoriteConstants.PERSONAL_ACCOUNT, isSelected: true},
                        {displayValue: FavoriteConstants.ADMIN_ACCOUNT, isSelected: false}
                    ]
                }]);
            });

            it('should show Global option in favoriteOwnerOptions if user has globalFavPerms', () => {
                CoreUserMetaDataStore.userMetaData.sharedFavPerms = false;
                component.ngOnInit();
                expect(component.favoriteOwnerOption).toEqual([{
                    values: [
                        {displayValue: FavoriteConstants.PERSONAL_ACCOUNT, isSelected: true},
                        {displayValue: FavoriteConstants.GLOBAL_ACCOUNT, isSelected: false}
                    ]
                }]);
            });

            it('should show Admin and Global options in favoriteOwnerOptions if user has sharedFavPerms and globalFavPerms', () => {
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

        it('should subscribe to saveFavoriteAction$ and update variables and save buttons', () => {
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
            const newFavToSave = new Workspace();
            newFavToSave.title = 'New Workspace';
            newFavToSave.owner = '_ADMIN';
            component.selectedUser$ = new BehaviorSubject<string>('_ADMIN');
            component['appStore'].saveFavoriteAction$ = new BehaviorSubject(new SaveFavoriteAction(newFavToSave, 'Workspace', 'WORKSPACE', 'WORKSPACE_FOLDER'));
            jest.spyOn(component, 'setShowButton');
            component.ngOnInit();

            expect(component.configToSave).toEqual(newFavToSave);
            expect(component.favType).toEqual('WORKSPACE');
            expect(component.favDisplayName).toEqual('Workspace');
            expect(component.favoriteTitle).toEqual('New Workspace');
            expect(component.originalTitle).toEqual('New Workspace');
            expect(component['setShowButton']).toHaveBeenCalled();
        });

        it('should subscribe to selectedFavoriteNode$ and update selectedFavoriteId and favoriteTitle', () => {
            component.selectedFavoriteNode$ = new BehaviorSubject({eventData: {favoriteId: 13579}, label: 'Selected Workspace'});
            component.ngOnInit();

            expect(component.selectedNode).toEqual({eventData: {favoriteId: 13579}, label: 'Selected Workspace'});
            expect(component.favoriteTitle).toBe('Selected Workspace');
        });

        describe('onFolderTreeLoaded Test', () => {
            beforeEach(() => {
                expect(component.isSaveButtonDisabled).toBeTruthy();
                expect(component.isSaveAsButtonDisabled).toBeTruthy();
            });

            it('should enable save after favorite tree is loaded', () => {
                component['onFolderTreeLoaded'](true);

                expect(component.isSaveButtonDisabled).toBeFalsy();
                expect(component.isSaveAsButtonDisabled).toBeFalsy();
            });

            it('should handle Prism favorite differently', () => {
                const workspace = new Workspace();
                workspace.tool = 'Prism';
                component['appStore'].saveFavoriteAction$ = new BehaviorSubject(new SaveFavoriteAction(workspace, 'Prism', 'Prism'));

                component.ngOnInit();
                component['onFolderTreeLoaded'](true);

                expect(component.isSaveButtonDisabled).toBeTruthy();
                expect(component.isSaveAsButtonDisabled).toBeFalsy();
            });
        });
    });

    describe('closeModal Test', () => {
        it('should close modal', () => {
            component.isOpen = true;
            jest.spyOn(component.modalClosed, 'emit');
            component.closeModal();

            expect(component.isOpen).toBeFalsy();
            expect(component.modalClosed.emit).toHaveBeenCalled();
        });
    });

    describe('onSaveButtonClicked Test', () => {
        let favToBeOverridden;

        beforeEach(() => {
            component.favoriteTitle = 'Sean\'s workspace';
            component.selectedUser$ = new BehaviorSubject('seakim');
            favToBeOverridden = new Workspace().createFavorite('WORKSPACE');
            favToBeOverridden.title = 'Sean\'s workspace';
            favToBeOverridden.id = 12345;
            jest.spyOn(FavoriteStore, 'getFavoriteFromCache').mockReturnValue(favToBeOverridden);
        });

        it('should return undefined if favoriteTitle is undefined', () => {
            component.favoriteTitle = undefined;
            expect(component.onSaveButtonClicked()).toBeUndefined();
        });

        describe('If Prism favorite', () => {
            beforeEach(() => {
                component.configToSave.tool = 'Prism';
            });

            it('Case 1: (SAVE AS) should create a new favorite if the favorite is Prism favorite, and the title DOESN\'T exists in login\'s favorite list', () => {
                jest.spyOn(FavoriteStore, 'getFavoriteFromCache').mockReturnValue(undefined);
                jest.spyOn(component, 'saveFavorite');
                component.onSaveButtonClicked(true);

                expect(component.saveFavorite).toHaveBeenCalledWith({favoriteId: null, owner: 'seakim'});
            });

            it('Case 2: (SAVE AS) should prompt for confirmation, then override the favorite with duplicate title, if the favorite is Prism favorite, and the title already exists in login\'s favorite list', () => {
                jest.spyOn(FavoriteStore, 'getFavoriteFromCache').mockReturnValue(favToBeOverridden);
                jest.spyOn(component, 'openDialogToSaveFavorite' as any);
                component.onSaveButtonClicked(true);

                expect(component['openDialogToSaveFavorite']).toHaveBeenCalledWith({favoriteId: 12345, owner: 'seakim'});
            });
        });

        describe('If the favorite to save belongs to login', () => {
            beforeEach(() => {
                component.configToSave.owner = 'seakim';
            });

            describe('If the title is unchanged', () => {
                beforeEach(() => {
                    component.originalTitle = 'Sean\'s workspace';
                    jest.spyOn(FavoriteStore, 'getFavoriteFromCache').mockReturnValue(favToBeOverridden);
                });

                it('Case 3: (SAVE AS) should prompt for confirmation, then override the favorite', () => {
                    jest.spyOn(component, 'openDialogToSaveFavorite' as any);

                    component.onSaveButtonClicked(true);

                    expect(component['openDialogToSaveFavorite']).toHaveBeenCalledWith({favoriteId: 23456, owner: 'seakim'});
                });

                it('Case 4: (SAVE) should not override the favorite rather open dialog as fav id is different but title is same', () => {
                    jest.spyOn(component, 'openDialogToSaveFavorite' as any);

                    component.onSaveButtonClicked();

                    expect(component['openDialogToSaveFavorite']).toHaveBeenCalledWith({favoriteId: 12345, owner: 'seakim'});
                });
            });

            describe('If the title is changed, and the title DOESN\'T exists in login\'s favorite list', () => {
                beforeEach(() => {
                    jest.spyOn(FavoriteStore, 'getFavoriteFromCache').mockReturnValue(undefined);
                    jest.spyOn(component, 'saveFavorite' as any);
                    component.favoriteTitle = 'XYZ\'s workspace';
                });

                it('Case 5: (SAVE AS) should save it as a new favorite and update the folder structure if a folder is selected', () => {
                    component.selectedNode = {
                        label: 'folder123',
                        children: [],
                        eventData: {type: 'folder'}
                    };

                    component.onSaveButtonClicked(true);

                    expect(component['saveFavorite']).toHaveBeenCalledWith({favoriteId: null, owner: 'seakim', updateFolderStructure: true});
                });

                it('Case 6: (SAVE) should override the favorite, if the config to save belongs to login, and the title is changed, and the title DOESN\'T exists in login\'s favorite list', () => {
                    component.onSaveButtonClicked();

                    expect(component['saveFavorite']).toHaveBeenCalledWith({favoriteId: 23456, owner: 'seakim'});
                });
            });

            describe('If the title is changed, and the title already exists in login\'s favorite list', () => {
                beforeEach(() => {
                    jest.spyOn(FavoriteStore, 'getFavoriteFromCache').mockReturnValue(favToBeOverridden);
                    jest.spyOn(component, 'openDialogToSaveFavorite' as any);
                    component.favoriteTitle = 'XYZ\'s workspace';
                });

                it('Case 7: (SAVE AS) should prompt for confirmation, then override the favorite with duplicate title, if the config to save belongs to login, and the title is changed, and the title already exists in login\'s favorite list', () => {
                    component.onSaveButtonClicked(true);

                    expect(component['openDialogToSaveFavorite']).toHaveBeenCalledWith({favoriteId: 12345, owner: 'seakim'});
                });

                it('Case 7: (SAVE) should prompt for confirmation, then override the favorite with duplicate title, if the config to save belongs to login, and the title is changed, and the title already exists in login\'s favorite list', () => {
                    component.onSaveButtonClicked();

                    expect(component['openDialogToSaveFavorite']).toHaveBeenCalledWith({favoriteId: 12345, owner: 'seakim'});
                });
            });
        });

        describe('If the favorite to save DOES NOT belong to login,', () => {
            it('Case 8,10: should create a new favorite and update the folder structure if a folder is selected', () => {
                component.selectedNode = {
                    label: 'folder123',
                    children: [],
                    eventData: {type: 'folder'}
                };

                jest.spyOn(FavoriteStore, 'getFavoriteFromCache').mockReturnValue(undefined);
                jest.spyOn(component, 'saveFavorite' as any);
                component.onSaveButtonClicked();

                expect(component['saveFavorite']).toHaveBeenCalledWith({favoriteId: null, owner: 'seakim', updateFolderStructure: true});
            });

            it('Case 9,11: should prompt for confirmation, then override the favorite with duplicate title', () => {
                jest.spyOn(FavoriteStore, 'getFavoriteFromCache').mockReturnValue(favToBeOverridden);
                jest.spyOn(component, 'openDialogToSaveFavorite' as any);
                component.onSaveButtonClicked();

                expect(component['openDialogToSaveFavorite']).toHaveBeenCalledWith({favoriteId: 12345, owner: 'seakim'});
            });
        });
    });

    describe('saveFavorite Test', () => {
        beforeEach(() => {
            component.configToSave.id = 12345;
            component.configToSave.owner = 'aaanand';
            component.configToSave.title = 'Aakanksha\'s workspace';
            component.favoriteTitle = 'Sean\'s workspace';
            component.callback = jest.fn();
        });

        it('should save favorite and update current config', () => {
            jest.spyOn(component['notificationService'], 'success');
            jest.spyOn(component, 'closeModal');
            jest.spyOn(component, 'callback' as any);
            component.saveFavorite({favoriteId: null, owner: 'seakim'});

            // Save buttons are disabled after save clicked and before modal destroyed to prevent multiple saving.
            expect(component.isSaveButtonDisabled).toBe(true);
            expect(component.isSaveAsButtonDisabled).toBe(true);

            expect(component['notificationService'].success).toHaveBeenCalledWith('Successfully saved Sean\'s workspace');
            expect(component.configToSave.id).toBe(1757226);
            expect(component.configToSave.owner).toBe('seakim');
            expect(component.callback).toHaveBeenCalled();
            expect(component.closeModal).toHaveBeenCalled();
        });

        it('should trigger updateFavoriteTreeStructure$', () => {
            component.selectedNode = {
                label: 'folder123',
                children: [],
                eventData: {type: 'folder'}
            };
            jest.spyOn(component.updateFavoriteTreeStructure$, 'next');

            component.saveFavorite({favoriteId: null, owner: 'seakim', updateFolderStructure: true});

            expect(component.updateFavoriteTreeStructure$.next).toHaveBeenCalledWith({selectedNode: component.selectedNode, title: 'Sean\'s workspace', id: 1757226});
        });

        it('should handle error', () => {
            jest.spyOn(component['favoriteService'], 'saveFavorite$').mockReturnValue(throwError('Failed to save the favorite'));
            jest.spyOn(component['notificationService'], 'error');
            jest.spyOn(component, 'closeModal');

            component.saveFavorite({favoriteId: null, owner: 'seakim'});

            expect(component['notificationService'].error).toHaveBeenCalledWith('Error occurred while saving: Failed to save the favorite', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_SAVE_FAVORITE_ERROR);
            expect(component.closeModal).toHaveBeenCalled();
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
            const event = new CustomEvent('build', {detail: {value: {displayValue: 'Personal'}}});

            component.updateFavoriteOwner(event as any);

            expect(component.selectedUser$.getValue()).toBe('seakim');
            expect(component.selectedUser$.next).toHaveBeenCalledWith('seakim');
        });
    });

    describe('openDialogToSaveFavorite Test', () => {
        it('should call openDialog with params and callBack', () => {
            jest.spyOn(component['notificationService'], 'openDialog');
            component['openDialogToSaveFavorite']({favoriteId: 12345, owner: 'seakim'});

            expect(component['notificationService'].openDialog).toHaveBeenCalledWith(
                new ExploreDialogParam(
                    AlertConstants.TYPE.PROMPT,
                    AlertConstants.HEADER.CONFIRM,
                    AlertConstants.BODY.FAVORITE_WITH_SAME_NAME,
                    AlertConstants.BTN.OK,
                    AlertConstants.BTN.CANCEL,
                    component.saveFavorite,
                    null,
                    {favoriteId: 12345, owner: 'seakim'}
                ));
        });
    });

    describe('confirmFavoriteSaveWithSameTitle Test', () => {
        it('Should show notification prompt if Enterprise favorite', () => {
            jest.spyOn(component, 'openDialogToSaveFavorite' as any);
            const favToOverriden = new Favorite();
            favToOverriden.owner = CoreFavoriteConstants.ADMIN;
            component.confirmFavoriteSaveWithSameTitle(124, favToOverriden, 'test');
            expect(component['notificationService'].openDialog).toHaveBeenCalledWith(
                new ExploreDialogParam(
                    AlertConstants.TYPE.ALERT,
                    AlertConstants.HEADER.ENTERPRISE_FAVORITE_TITLE_SAME,
                    AlertConstants.BODY.ENTERPRISE_FAVORITE_TITLE_SAME,
                    AlertConstants.BTN.OK));
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(false);
            component.confirmFavoriteSaveWithSameTitle(124, favToOverriden, 'seakim');
            expect(component['openDialogToSaveFavorite']).toHaveBeenLastCalledWith({favoriteId: 124, owner: 'seakim'});
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
            favToOverriden.owner = 'simsingh';
            component.confirmFavoriteSaveWithSameTitle(124, favToOverriden, 'simsingh');
            expect(component['openDialogToSaveFavorite']).toHaveBeenLastCalledWith({favoriteId: 124, owner: 'simsingh'});
        });
    });

    describe('setShowButton Test', () => {
        it('should set BOTH save and saveAs to true if the favorite owner is current user', () => {
            component.configToSave.owner = 'seakim';
            component.selectedUser$ = new BehaviorSubject('seakim');
            component['setShowButton']();

            expect(component.showSaveButton).toBe(true);
            expect(component.showSaveAsButton).toBe(true);
        });

        it('should set ONLY save to true if the favorite owner does not exist', () => {
            component.configToSave.owner = null;
            component.selectedUser$ = new BehaviorSubject('seakim');
            component['setShowButton']();

            expect(component.showSaveButton).toBe(true);
            expect(component.showSaveAsButton).toBe(false);
        });

        it('should set ONLY saveAs to true if the favorite owner is someone else', () => {
            component.configToSave.owner = 'aaanand';
            component.selectedUser$ = new BehaviorSubject('seakim');
            component['setShowButton']();

            expect(component.showSaveButton).toBe(false);
            expect(component.showSaveAsButton).toBe(true);
        });
    });

    describe('updateFavoriteTitle Test', () => {
        it('should update favoriteTitle with input', () => {
            const event = new CustomEvent('build', {detail: {value: 'Updated Workspace Title'}});

            component.updateFavoriteTitle(event as any);

            expect(component.favoriteTitle).toBe('Updated Workspace Title');
        });
    });

    describe('onSaveButtonClicked', () => {
        beforeEach(() => {
            jest.spyOn(CoreFavoriteUtils, 'isAdminOrGlobalFavorite').mockReturnValue(true);
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
            component.saveSummary = undefined;
        });

        it('should disable save buttons and show save summary input if conditions are met and favorite has id', () => {
            component.isSaveSummaryOpen = false;
            component.isSaveButtonDisabled = false;
            component.selectedUser$ = new BehaviorSubject<string>('_ADMIN');
            component.configToSave.id = '12345';
            component.onSaveButtonClicked();

            expect(component.isSaveSummaryOpen).toBe(true);
        });

        it('should not disable save buttons and show save summary input if conditions are met and favorite has no id', () => {
            component.isSaveSummaryOpen = false;
            component.isSaveButtonDisabled = true;
            component.selectedUser$ = new BehaviorSubject<string>('_ADMIN');
            component.configToSave.id = undefined;
            component.onSaveButtonClicked();

            expect(component.isSaveSummaryOpen).toBe(false);
        });

        it('should disable saveAs button and show save summary input if conditions are met and saveAs is true and version is 2', () => {
            component.selectedUser$ = new BehaviorSubject<string>('_ADMIN');
            component.configToSave.id = '12345';
            component.onSaveButtonClicked(true);

            expect(component.isSaveAsButtonDisabled).toBe(true);
            expect(component.isSaveSummaryOpen).toBe(false);
        });
    });

    it('test closeSaveSummaryDialog', () => {
        const spy = jest.spyOn(component, 'onSaveButtonClicked');
        component.closeSaveSummaryDialog(true);
        expect(spy).toHaveBeenCalled();
        spy.mockReset();
        component.closeSaveSummaryDialog(false);
        expect(spy).not.toHaveBeenCalled();
        component.closeSaveSummaryDialog(new CustomEvent('build', {detail: {value: 'test'}}));
        expect(spy).not.toHaveBeenCalled();
    });

    it('test isDescriptionSupported', () => {
        component.favType = FavoriteType.WORKSPACE;
        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
        expect(component.isDescriptionSupported('_ADMIN')).toBe(true);
        expect(component.isDescriptionSupported('_GLOBAL')).toBe(false);
        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(false);
        expect(component.isDescriptionSupported('_ADMIN')).toBe(false);
        component.favType = FavoriteType.WHATIF_RULES;
        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
        expect(component.isDescriptionSupported('_ADMIN')).toBe(false);
    });

    it('test updateFavoriteDescription', () => {
        component.updateFavoriteDescription({detail: {value: 'test'}} as any);
        expect(component.configToSave.enterpriseDescription).toBe('test');
    });

});
