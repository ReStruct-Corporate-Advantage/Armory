import {BehaviorSubject, of} from 'rxjs';
import {fakeAsync, tick} from '@angular/core/testing';
import {AuxNotificationStyleEnum, AuxNotificationToastTypeEnum} from '@blk/aladdin-angular-components';
import {BulkSavingModalDirective} from './bulk-saving-modal.directive';
import {getChangedReportFavoritesTreeMock} from './service/bulk-saving-handler.service.spec';
import {Workspace} from '@models/workspace/workspace.model';
import {WorkspaceFavoriteChange} from '@models/favorite/workspace-favorite-change.model';
import {Report} from '@models/workspace/report.model';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {
    BulkSavingAction,
    BulkSavingEventDetailsKey,
    BulkSavingLevel, CoreDefinitionStore, CoreFavoriteConstants,
    CoreUserMetaDataStore,
    Favorite,
    FavoriteDisplayEnum,
    FavoriteType, TokenConstants, TokenUtils,
    UserMetaData
} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {WorkpadFavoriteChange} from '@models/favorite/workpad-favorite-change.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {SavableFavoriteChange} from '@services/favorite-change-detection/favorite-change-detection.service';
import {FavoriteStore} from '@stores/favorite.store';
import {WorkspaceStore} from '@stores/workspace.store';
import {SaveMode} from '@enums/save-mode.enum';

describe('BulkSavingModalDirective Tests', () => {
    WorkspaceStore.workspace$ = new BehaviorSubject(null);
    WorkspaceStore.currentWorkpad$ = new BehaviorSubject(null);
    const favoriteChangeDetectionServiceMock = {} as any;
    const favoriteTreeServiceMock = {} as any;
    let bulkSavingHandlerServiceMock: any;
    let folderFavoriteTreeServiceMock: any;
    let notificationServiceMock: any;
    let bulkSavingModalDirective: BulkSavingModalDirective<SavableFavoriteChange>;

    let reportChange: FavoriteChange;
    let columnSetChange: FavoriteChange;
    let customCalcChange: FavoriteChange;

    beforeAll(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.access = true;
        CoreUserMetaDataStore.userMetaData.pricePopupAccess = true;
        CoreUserMetaDataStore.userMetaData.launchApps = ['SECURITY_MASTER', 'ANSER', 'ALADDIN_VIEW'];
        CoreUserMetaDataStore.userMetaData.login = 'seakim';

        reportChange = getChangedReportFavoritesTreeMock();
        columnSetChange = reportChange.nestedChanges[0];
        customCalcChange = columnSetChange.nestedChanges[0];
    });

    beforeEach(() => {
        bulkSavingHandlerServiceMock = {
            saveChanges$: jest.fn().mockReturnValue(of())
        };
        folderFavoriteTreeServiceMock = {
            folderChangesMap: {},
            currentFavoriteChangeHoldingFolderState: new Map() // Mocking the currentFavoriteChangeHoldingFolderState
        };
        notificationServiceMock = {
            detailedMessage: jest.fn()
        };
        bulkSavingModalDirective = new BulkSavingModalDirective(favoriteTreeServiceMock, favoriteChangeDetectionServiceMock, bulkSavingHandlerServiceMock, folderFavoriteTreeServiceMock, notificationServiceMock);
        bulkSavingModalDirective.changedFavoritesTree = reportChange;
        bulkSavingModalDirective.flattenedFavoriteChanges = [customCalcChange, columnSetChange, reportChange];
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS] = 'Y';
    });

    describe('saveChanges Test', () => {
        it('should handle notifications and and close modal after final series of saving is completed successfully',  fakeAsync(() => {
            const mockResponse = {savablesInOrder: [[customCalcChange, reportChange], [columnSetChange]], index: 1, failedRequestItems: []};
            jest.spyOn(bulkSavingHandlerServiceMock, 'saveChanges$').mockReturnValue(of(mockResponse));
            jest.spyOn(bulkSavingModalDirective, 'handleNotifications' as any);
            jest.spyOn(bulkSavingModalDirective, 'closeModal');

            bulkSavingModalDirective['saveChanges']();
            tick(1);

            expect(bulkSavingModalDirective.submitButtonDisabled$.getValue()).toBeFalsy();
            expect(bulkSavingModalDirective['handleNotifications']).toHaveBeenCalled();
            expect(bulkSavingModalDirective.closeModal).toHaveBeenCalled();
        }));

        describe('handleNotifications Test', () => {

            let notificationMock;

            beforeEach(() => {
                notificationMock = jest.spyOn(bulkSavingModalDirective['notificationService'], 'detailedMessage');
            });

            afterEach(() => {
                notificationMock.mockClear();
            });

            it('should handle success messages', () => {
                const savablesInOrder = [[customCalcChange, reportChange], [columnSetChange]];
                const failedRequestItems = [];

                bulkSavingModalDirective['handleNotifications'](savablesInOrder, failedRequestItems);

                expect(bulkSavingModalDirective['notificationService'].detailedMessage).toHaveBeenCalledWith({
                    toastType: AuxNotificationToastTypeEnum.TIMEOUT,
                    header: bulkSavingModalDirective['SUCCESS_NOTIFICATION_HEADER'],
                    id: expect.any(String),
                    message: [
                        'Custom calculation: <strong>favCustomCalc1_SAVE_AS</strong>',
                        'Report: <strong>favReport1_SAVE_AS</strong>',
                        'Column set: <strong>favColumnSet1_SAVE</strong>'
                    ],
                    notificationStyle: AuxNotificationStyleEnum.SUCCESS
                });
            });

            it('should handle failed messages', () => {
                const savablesInOrder = [[customCalcChange, reportChange], [columnSetChange]];
                const failedRequestItems = [customCalcChange, reportChange, columnSetChange];

                bulkSavingModalDirective['handleNotifications'](savablesInOrder, failedRequestItems);

                expect(bulkSavingModalDirective['notificationService'].detailedMessage).toHaveBeenCalledWith({
                    toastType: AuxNotificationToastTypeEnum.PERSISTENT,
                    header: bulkSavingModalDirective['FAIL_NOTIFICATION_HEADER'],
                    id: expect.any(String),
                    message: [
                        'Custom calculation: <strong>favCustomCalc1_SAVE_AS</strong>',
                        'Report: <strong>favReport1_SAVE_AS</strong>',
                        'Column set: <strong>favColumnSet1_SAVE</strong>'
                    ],
                    notificationStyle: AuxNotificationStyleEnum.ERROR
                });
            });

            it('should handle partially success/failed messages', () => {
                const savablesInOrder = [[customCalcChange, reportChange], [columnSetChange], ['seakim,LAYOUT_FOLDER']];
                const failedRequestItems = [reportChange];

                bulkSavingModalDirective['handleNotifications'](savablesInOrder, failedRequestItems);

                expect(bulkSavingModalDirective['notificationService'].detailedMessage).toHaveBeenNthCalledWith(1, {
                    toastType: AuxNotificationToastTypeEnum.TIMEOUT,
                    header: bulkSavingModalDirective['SUCCESS_NOTIFICATION_HEADER'],
                    id: expect.any(String),
                    message: [
                        'Custom calculation: <strong>favCustomCalc1_SAVE_AS</strong>',
                        'Column set: <strong>favColumnSet1_SAVE</strong>'
                    ],
                    notificationStyle: AuxNotificationStyleEnum.SUCCESS
                });

                expect(bulkSavingModalDirective['notificationService'].detailedMessage).toHaveBeenNthCalledWith(2, {
                    toastType: AuxNotificationToastTypeEnum.PERSISTENT,
                    header: bulkSavingModalDirective['FAIL_NOTIFICATION_HEADER'],
                    id: expect.any(String),
                    message: [
                        'Report: <strong>favReport1_SAVE_AS</strong>',
                    ],
                    notificationStyle: AuxNotificationStyleEnum.ERROR
                });
            });
        });
    });

    describe('Checking for favorite conflicts tests', () => {
        let columnSetFaveChange: FavoriteChange;
        let reportFaveChange: FavoriteChange;
        let workpadChange: WorkpadFavoriteChange;
        let workspaceChange: WorkspaceFavoriteChange;

        beforeEach(() => {
            CoreUserMetaDataStore.userMetaData = new UserMetaData();
            CoreUserMetaDataStore.userMetaData.login = 'user01';

            const columnSet = new ColumnSet();
            columnSet.id = 9012;
            columnSet.owner = 'user01';
            columnSetFaveChange = new FavoriteChange(columnSet, FavoriteDisplayEnum.COLUMN_SET, FavoriteType.REPORT);

            const report = new Report();
            report.id = 5678;
            report.owner = 'user01';
            reportFaveChange = new FavoriteChange(report, FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
            reportFaveChange.nestedChanges = [columnSetFaveChange, columnSetFaveChange];

            workpadChange = new WorkpadFavoriteChange(new FlatWorkpad());
            workpadChange.modifiedReports = [reportFaveChange];

            const workspace = new Workspace();
            workspace.id = 1234;
            workspace.owner = 'user01';
            workspaceChange = new WorkspaceFavoriteChange(workspace);
            workspaceChange.nestedChanges = [workpadChange];
        });

        it ('should check for conflicting favorites', () => {
            bulkSavingModalDirective.changedFavoritesTree = workspaceChange;
            bulkSavingModalDirective.flattenedFavoriteChanges = [columnSetFaveChange, columnSetFaveChange, reportFaveChange, workspaceChange];

            bulkSavingModalDirective.validateSelectionAndSave();

            expect(bulkSavingModalDirective.isConflictingFavorites).toEqual(true);
            expect(bulkSavingModalDirective.conflictingFavorites).toHaveLength(1);
            expect(bulkSavingModalDirective.conflictingFavorites[0]).toEqual({displayType: 'COLUMN_SET', id: 9012, title: undefined});
            expect(bulkSavingModalDirective.conflictingFavoriteIds.size).toEqual(1);
            expect(bulkSavingModalDirective.conflictingFavoriteIds.has(columnSetFaveChange.value.id)).toEqual(true);
            expect(bulkSavingHandlerServiceMock.saveChanges$).not.toHaveBeenCalled();
        });


        it ('should close the conflicting favorites dialog and continue with saving', () => {
            const mockResponse = {savablesInOrder: [[reportFaveChange, workspaceChange]], index: 1, failedRequestItems: []};
            jest.spyOn(bulkSavingHandlerServiceMock, 'saveChanges$').mockReturnValue(of(mockResponse));

            bulkSavingModalDirective.changedFavoritesTree = workspaceChange;
            bulkSavingModalDirective.flattenedFavoriteChanges = [columnSetFaveChange, columnSetFaveChange, reportFaveChange, workspaceChange];
            bulkSavingModalDirective.isConflictingFavorites = true;
            bulkSavingModalDirective.conflictingFavoriteIds = new Set<number>([columnSetFaveChange.value.id]);

            bulkSavingModalDirective.closeConflictingFavoritesDialog(true);

            expect(bulkSavingModalDirective.isConflictingFavorites).toEqual(false);
            expect(bulkSavingHandlerServiceMock.saveChanges$).toHaveBeenCalledTimes(1);
        });

        it ('should close the conflicting favorites dialog and continue without saving', () => {
            bulkSavingModalDirective.changedFavoritesTree = workspaceChange;
            bulkSavingModalDirective.flattenedFavoriteChanges = [columnSetFaveChange, columnSetFaveChange, reportFaveChange, workspaceChange];
            bulkSavingModalDirective.isConflictingFavorites = true;
            bulkSavingModalDirective.conflictingFavoriteIds = new Set<number>([columnSetFaveChange.value.id]);

            bulkSavingModalDirective.closeConflictingFavoritesDialog(false);

            expect(bulkSavingModalDirective.isConflictingFavorites).toEqual(false);
            expect(bulkSavingHandlerServiceMock.saveChanges$).not.toHaveBeenCalled();
        });
    });

    describe('duplicate favorite title handling Test', () => {
        it('should pop up warning dialog if same title favorites exist', () => {
            expect(bulkSavingModalDirective.isDuplicateFavoriteTitles).toBeFalsy();

            FavoriteStore.slimFavCache.set('seakim,COLUMN', [new Favorite({title: 'favCustomCalc1_SAVE_AS', id: 13579})]);
            bulkSavingModalDirective.validateSelectionAndSave();

            expect(bulkSavingModalDirective.favoriteOverrideMap.has(customCalcChange));
            expect(bulkSavingModalDirective.favoriteOverrideMap.get(customCalcChange)).toBe(13579);
            expect(bulkSavingModalDirective.duplicateTitleFavorites[0]).toEqual({displayType: 'CUSTOM_CALC', id: null, title: 'favCustomCalc1_SAVE_AS'});
            expect(bulkSavingModalDirective.isDuplicateFavoriteTitles).toBeTruthy();
            expect(!bulkSavingModalDirective.duplicateEnterpriseTitleFavorites?.length).toBeTruthy();
            expect(bulkSavingModalDirective.isDuplicateEnterpriseFavoriteTitles).toBeFalsy();
        });

        it('should update the favoriteId to override the existing save title favorite', () => {
            bulkSavingModalDirective.favoriteOverrideMap = new Map<SavableFavoriteChange, number>();
            bulkSavingModalDirective.favoriteOverrideMap.set(customCalcChange, 13579);

            jest.spyOn(bulkSavingModalDirective, 'saveChanges' as any);
            expect(customCalcChange.value.id).toBe(2438288);
            expect(customCalcChange.newFavoriteId).toBeUndefined();

            bulkSavingModalDirective.closeDuplicateFavoriteTitlesDialog(true);

            expect(customCalcChange.newFavoriteId).toBe(13579);
            expect(bulkSavingModalDirective['saveChanges']).toHaveBeenCalled();
        });
    });

    describe('duplicate enterprise favorite title handling Test', () => {
        it('should pop up warning dialog if same title favorites exist', () => {
            expect(bulkSavingModalDirective.isDuplicateFavoriteTitles).toBeFalsy();
            customCalcChange.savingUser = '_ADMIN';
            bulkSavingModalDirective.changedFavoritesTree.savingUser = '_ADMIN';
            bulkSavingModalDirective.flattenedFavoriteChanges = [customCalcChange];
            FavoriteStore.slimFavCache.set('_ADMIN,COLUMN', [new Favorite({title: 'favCustomCalc1_SAVE_AS', id: 13579})]);
            CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS] = 'N';
            bulkSavingModalDirective.validateSelectionAndSave();
            expect(!bulkSavingModalDirective.duplicateEnterpriseTitleFavorites?.length).toBeTruthy();
            expect(bulkSavingModalDirective.isDuplicateEnterpriseFavoriteTitles).toBeFalsy();
            CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS] = 'Y';
            bulkSavingModalDirective.validateSelectionAndSave();
            expect(bulkSavingModalDirective.favoriteOverrideMap.has(customCalcChange));
            expect(bulkSavingModalDirective.favoriteOverrideMap.get(customCalcChange)).toBe(13579);
            expect(bulkSavingModalDirective.duplicateEnterpriseTitleFavorites[0]).toEqual({displayType: 'CUSTOM_CALC', id: null, title: 'favCustomCalc1_SAVE_AS'});
            expect(bulkSavingModalDirective.isDuplicateEnterpriseFavoriteTitles).toBeTruthy();
            expect(bulkSavingModalDirective.isAdminOverwriteWarning).toBeFalsy();
            // On prompt close
            bulkSavingModalDirective.closeDuplicateFavoriteTitlesDialog(false);
            expect(!bulkSavingModalDirective.duplicateEnterpriseTitleFavorites?.length).toBeTruthy();
            expect(bulkSavingModalDirective.isDuplicateEnterpriseFavoriteTitles).toBeFalsy();
            // if favorite is same id and same title
            FavoriteStore.slimFavCache.set('_ADMIN,COLUMN', [new Favorite({title: 'favCustomCalc1_SAVE_AS', id: 2438288})]);
            customCalcChange.saveMode = SaveMode.SAVE;
            bulkSavingModalDirective.changedFavoritesTree.saveMode =  SaveMode.SAVE;
            bulkSavingModalDirective.validateSelectionAndSave();
            expect(!bulkSavingModalDirective.duplicateEnterpriseTitleFavorites?.length).toBeTruthy();
            expect(bulkSavingModalDirective.isDuplicateEnterpriseFavoriteTitles).toBeFalsy();
            expect(bulkSavingModalDirective.isAdminOverwriteWarning).toBeTruthy();
            // now check in save mode with different id
            FavoriteStore.slimFavCache.set('_ADMIN,COLUMN', [new Favorite({title: 'favCustomCalc1_SAVE_AS', id: 13579})]);
            bulkSavingModalDirective.validateSelectionAndSave();
            expect(bulkSavingModalDirective.favoriteOverrideMap.has(customCalcChange));
            expect(bulkSavingModalDirective.favoriteOverrideMap.get(customCalcChange)).toBe(13579);
            expect(bulkSavingModalDirective.duplicateEnterpriseTitleFavorites[0]).toEqual({displayType: 'CUSTOM_CALC', id: null, title: 'favCustomCalc1_SAVE_AS'});
            expect(bulkSavingModalDirective.isDuplicateEnterpriseFavoriteTitles).toBeTruthy();
            expect(bulkSavingModalDirective.isAdminOverwriteWarning).toBeFalsy();
        });
    });

    it('should test generateBulkSavingParameters', () => {
        const workspaceFavoriteChange = new WorkspaceFavoriteChange(new Workspace());
        workspaceFavoriteChange.isSelected = true;
        const reportFavoriteChange1 = new FavoriteChange(new Report(), FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
        reportFavoriteChange1.isSelected = false;
        const reportFavoriteChange2 = new FavoriteChange(new Report(), FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
        reportFavoriteChange2.isSelected = false;
        bulkSavingModalDirective.flattenedFavoriteChanges = [workspaceFavoriteChange, reportFavoriteChange1, reportFavoriteChange2];
        bulkSavingModalDirective.changedFavoritesTree = workspaceFavoriteChange;

        expect(bulkSavingModalDirective['generateBulkSavingParameters']().details.get(BulkSavingEventDetailsKey.BULK_SAVING_LEVEL)).toEqual(BulkSavingLevel.WORKSPACE);

        expect(bulkSavingModalDirective['generateBulkSavingParameters'](true).details.get(BulkSavingEventDetailsKey.BULK_SAVING_ACTION)).toEqual(BulkSavingAction.NO_SAVE);

        expect(bulkSavingModalDirective['generateBulkSavingParameters']().details.get(BulkSavingEventDetailsKey.BULK_SAVING_ACTION)).toEqual(BulkSavingAction.SAVE_ROOT_ONLY_MODIFIED);

        reportFavoriteChange1.isSelected = true;
        expect(bulkSavingModalDirective['generateBulkSavingParameters']().details.get(BulkSavingEventDetailsKey.BULK_SAVING_ACTION)).toEqual(BulkSavingAction.SAVE_MODIFIED);

        reportFavoriteChange2.isSelected = true;
        expect(bulkSavingModalDirective['generateBulkSavingParameters']().details.get(BulkSavingEventDetailsKey.BULK_SAVING_ACTION)).toEqual(BulkSavingAction.SAVE_ALL);
    });

    describe('closeAdminFolderDialog Test', () => {
        it('should set isAdminFolderWarning$ to false', () => {
            bulkSavingModalDirective.isFolderWarningModalOpen$.next(true);
            bulkSavingModalDirective.closeAdminFolderDialog();
            expect(bulkSavingModalDirective.isFolderWarningModalOpen$.getValue()).toBe(false);
        });
    });

    describe('checkFavoriteInFolder Test', () => {
        it('should set isAdminFolderWarning$ to true when currentFavoriteChangeHoldingFolderState is empty', () => {
            folderFavoriteTreeServiceMock.currentFavoriteChangeHoldingFolderState = new Map();
            bulkSavingModalDirective.isFavoriteInFolder = false;
            bulkSavingModalDirective.changedFavoritesTree.saveMode = SaveMode.SAVE;

            bulkSavingModalDirective.checkFavoriteInFolder();
            expect(bulkSavingModalDirective.isFolderWarningModalOpen$.getValue()).toBe(true);
        });

        it('should set isAdminFolderWarning$ to true when isFavoriteInFolder is false and currentFavoriteChangeHoldingFolderState is null', () => {
            folderFavoriteTreeServiceMock.currentFavoriteChangeHoldingFolderState = new Map();
            bulkSavingModalDirective.isFavoriteInFolder = false;
            bulkSavingModalDirective.changedFavoritesTree.saveMode = SaveMode.SAVE;

            bulkSavingModalDirective.checkFavoriteInFolder();
            expect(bulkSavingModalDirective.isFolderWarningModalOpen$.getValue()).toBe(true);
        });

        it('should set isAdminFolderWarning$ to true when isFavoriteInFolder is true, currentFavoriteChangeHoldingFolderState is null, and saveMode is SAVE_AS', () => {
            folderFavoriteTreeServiceMock.currentFavoriteChangeHoldingFolderState = new Map();
            bulkSavingModalDirective.isFavoriteInFolder = true;
            bulkSavingModalDirective.changedFavoritesTree.saveMode = SaveMode.SAVE_AS;

            bulkSavingModalDirective.checkFavoriteInFolder();
            expect(bulkSavingModalDirective.isFolderWarningModalOpen$.getValue()).toBe(true);
        });

        it('should set isAdminFolderWarning$ to false when conditions are not met', () => {
            folderFavoriteTreeServiceMock.currentFavoriteChangeHoldingFolderState = new Map();
            bulkSavingModalDirective.isFavoriteInFolder = true;
            bulkSavingModalDirective.changedFavoritesTree.saveMode = SaveMode.SAVE;

            bulkSavingModalDirective.checkFavoriteInFolder();
            expect(bulkSavingModalDirective.isFolderWarningModalOpen$.getValue()).toBe(true);
        });
    });

    describe('validateSelectionAndSave Tests', () => {
        let checkFavoriteConflictsSpy: jest.SpyInstance;
        let checkDuplicateFavoriteTitlesSpy: jest.SpyInstance;
        let checkFavoriteInFolderSpy: jest.SpyInstance;
        let saveChangesSpy: jest.SpyInstance;
        let isAdditionalSavingConflictsSpy: jest.SpyInstance;

        beforeEach(() => {
            checkFavoriteConflictsSpy = jest.spyOn(bulkSavingModalDirective, 'checkFavoriteConflicts' as any).mockReturnValue(false);
            checkDuplicateFavoriteTitlesSpy = jest.spyOn(bulkSavingModalDirective, 'checkDuplicateFavoriteTitles' as any).mockReturnValue(false);
            checkFavoriteInFolderSpy = jest.spyOn(bulkSavingModalDirective, 'checkFavoriteInFolder' as any);
            saveChangesSpy = jest.spyOn(bulkSavingModalDirective, 'saveChanges' as any);
            isAdditionalSavingConflictsSpy = jest.spyOn(bulkSavingModalDirective, 'isAdditionalSavingConflicts' as any).mockReturnValue(false);
        });

        it('should not call checkFavoriteInFolder when token is disabled', () => {
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(false);

            bulkSavingModalDirective.validateSelectionAndSave();

            expect(checkFavoriteInFolderSpy).not.toHaveBeenCalled();
            expect(saveChangesSpy).toHaveBeenCalled();
        });

        it('should call checkFavoriteInFolder when token is enabled, user is admin, and save mode is SAVE', () => {
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
            bulkSavingModalDirective.changedFavoritesTree.savingUser = CoreFavoriteConstants.ADMIN;
            bulkSavingModalDirective.changedFavoritesTree.saveMode = SaveMode.SAVE;

            bulkSavingModalDirective.validateSelectionAndSave();

            expect(checkFavoriteInFolderSpy).toHaveBeenCalled();
            expect(saveChangesSpy).toHaveBeenCalled();
        });

        it('should call checkFavoriteInFolder when token is enabled, user is admin, and save mode is SAVE_AS', () => {
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
            bulkSavingModalDirective.changedFavoritesTree.savingUser = CoreFavoriteConstants.ADMIN;
            bulkSavingModalDirective.changedFavoritesTree.saveMode = SaveMode.SAVE_AS;

            bulkSavingModalDirective.validateSelectionAndSave();

            expect(checkFavoriteInFolderSpy).toHaveBeenCalled();
            expect(saveChangesSpy).toHaveBeenCalled();
        });

        it('should not call saveChanges when there are additional saving conflicts', () => {
            isAdditionalSavingConflictsSpy.mockReturnValue(true);

            bulkSavingModalDirective.validateSelectionAndSave();

            expect(saveChangesSpy).not.toHaveBeenCalled();
        });

        it('should call saveChanges when there are no additional saving conflicts', () => {
            isAdditionalSavingConflictsSpy.mockReturnValue(false);

            bulkSavingModalDirective.validateSelectionAndSave();

            expect(saveChangesSpy).toHaveBeenCalled();
        });
    });

    describe('isAdditionalSavingConflicts Tests', () => {
        beforeEach(() => {
            bulkSavingModalDirective.isConflictingFavorites = false;
            bulkSavingModalDirective.isDuplicateFavoriteTitles = false;
            bulkSavingModalDirective.isAdminOverwriteWarning = false;
            bulkSavingModalDirective.isFolderWarningModalOpen$.next(false);
            bulkSavingModalDirective.isCloseAdminFolderDialog = false;
            bulkSavingModalDirective.changedFavoritesTree.changeSummary = 'summary';
        });

        it('should return false when no conflicts exist', () => {
            expect(bulkSavingModalDirective['isAdditionalSavingConflicts']()).toBe(false);
        });

        it('should return true when there are conflicting favorites', () => {
            bulkSavingModalDirective.isConflictingFavorites = true;
            expect(bulkSavingModalDirective['isAdditionalSavingConflicts']()).toBe(true);
        });

        it('should return true when there are duplicate favorite titles', () => {
            bulkSavingModalDirective.isDuplicateFavoriteTitles = true;
            expect(bulkSavingModalDirective['isAdditionalSavingConflicts']()).toBe(true);
        });

        it('should return true when there is an admin overwrite warning', () => {
            bulkSavingModalDirective.isAdminOverwriteWarning = true;
            expect(bulkSavingModalDirective['isAdditionalSavingConflicts']()).toBe(true);
        });

        it('should return true when the folder warning modal is open', () => {
            bulkSavingModalDirective.isFolderWarningModalOpen$.next(true);
            expect(bulkSavingModalDirective['isAdditionalSavingConflicts']()).toBe(true);
        });

        it('should call checkFavoriteInFolder when isCloseAdminFolderDialog is true', () => {
            jest.spyOn(bulkSavingModalDirective, 'checkFavoriteInFolder');
            bulkSavingModalDirective.isCloseAdminFolderDialog = true;
            bulkSavingModalDirective['isAdditionalSavingConflicts']();
            expect(bulkSavingModalDirective.checkFavoriteInFolder).toHaveBeenCalled();
        });
    });

    describe('checkFavoriteInFolder Tests', () => {
        let currentFavoriteChangeHoldingFolderStateMock: Map<any, any>;

        beforeEach(() => {
            currentFavoriteChangeHoldingFolderStateMock = new Map();
            folderFavoriteTreeServiceMock.currentFavoriteChangeHoldingFolderState = currentFavoriteChangeHoldingFolderStateMock;
        });

        it('should warn admin when currentFavoriteChangeHoldingFolderState is empty', () => {
            currentFavoriteChangeHoldingFolderStateMock.clear();
            bulkSavingModalDirective.checkFavoriteInFolder();
            expect(bulkSavingModalDirective.isFolderWarningModalOpen$.getValue()).toBe(true);
        });

        it('should warn admin when currentFavoriteChangeHoldingFolderState is null and isFavoriteInFolder is false', () => {
            folderFavoriteTreeServiceMock.currentFavoriteChangeHoldingFolderState = null;
            bulkSavingModalDirective.isFavoriteInFolder = false;
            bulkSavingModalDirective.checkFavoriteInFolder();
            expect(bulkSavingModalDirective.isFolderWarningModalOpen$.getValue()).toBe(true);
        });

        it('should warn admin when isFavoriteInFolder is true, currentFavoriteChangeHoldingFolderState is null, and saveMode is SAVE_AS', () => {
            folderFavoriteTreeServiceMock.currentFavoriteChangeHoldingFolderState = null;
            bulkSavingModalDirective.isFavoriteInFolder = true;
            bulkSavingModalDirective.changedFavoritesTree.saveMode = SaveMode.SAVE_AS;
            bulkSavingModalDirective.checkFavoriteInFolder();
            expect(bulkSavingModalDirective.isFolderWarningModalOpen$.getValue()).toBe(true);
        });

        it('should not warn admin when currentFavoriteChangeHoldingFolderState is not empty and isFavoriteInFolder is false', () => {
            currentFavoriteChangeHoldingFolderStateMock.set('key', 'value');
            bulkSavingModalDirective.isFavoriteInFolder = false;
            bulkSavingModalDirective.checkFavoriteInFolder();
            expect(bulkSavingModalDirective.isFolderWarningModalOpen$.getValue()).toBe(false);
        });

        it('should not warn admin when currentFavoriteChangeHoldingFolderState is not empty and isFavoriteInFolder is true', () => {
            currentFavoriteChangeHoldingFolderStateMock.set('key', 'value');
            bulkSavingModalDirective.isFavoriteInFolder = true;
            bulkSavingModalDirective.checkFavoriteInFolder();
            expect(bulkSavingModalDirective.isFolderWarningModalOpen$.getValue()).toBe(false);
        });
    });

    describe('save summary modal test', () => {
        it('should test openSaveSummaryModalIfApplicable - set isSingleLayerSaveSummaryModalOpen to true when conditions are met', () => {
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
            bulkSavingModalDirective.changedFavoritesTree = new FavoriteChange(new Report(), FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
            bulkSavingModalDirective.changedFavoritesTree.savingUser = CoreFavoriteConstants.ADMIN;

            bulkSavingModalDirective['openSaveSummaryModalIfApplicable']();

            expect(bulkSavingModalDirective.isSingleLayerSaveSummaryModalOpen).toBe(true);
        });

        it('should test openSaveSummaryModalIfApplicable - set isMultiLayerSaveSummaryModalOpen to true when conditions are met', () => {
            jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
            bulkSavingModalDirective.changedFavoritesTree = new FavoriteChange(new Report(), FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
            bulkSavingModalDirective.changedFavoritesTree.savingUser = CoreFavoriteConstants.ADMIN;

            const columnSetFavoriteChange = new FavoriteChange(new ColumnSet(), FavoriteDisplayEnum.COLUMN_SET, FavoriteType.REPORT);
            columnSetFavoriteChange.savingUser = CoreFavoriteConstants.ADMIN;
            columnSetFavoriteChange.isSelected = true;

            bulkSavingModalDirective.changedFavoritesTree.nestedChanges.push(columnSetFavoriteChange);

            bulkSavingModalDirective['openSaveSummaryModalIfApplicable']();

            expect(bulkSavingModalDirective.isMultiLayerSaveSummaryModalOpen).toBe(true);
        });

        it('should test isSingleLayerFavoriteChange', () => {
            bulkSavingModalDirective.changedFavoritesTree = new FavoriteChange(new Report(), FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
            expect(bulkSavingModalDirective['isSingleLayerFavoriteChange']()).toBe(true);

            const columnSetFavoriteChange = new FavoriteChange(new ColumnSet(), FavoriteDisplayEnum.COLUMN_SET, FavoriteType.REPORT);
            bulkSavingModalDirective.changedFavoritesTree.nestedChanges.push(columnSetFavoriteChange);

            expect(bulkSavingModalDirective['isSingleLayerFavoriteChange']()).toBe(false);
        });

        it('shouldOpenMultiSaveSummaryModal Test - return true for multi layer changes', () => {
            const reportFavoriteChange = new FavoriteChange(new Report(), FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
            reportFavoriteChange.savingUser = CoreFavoriteConstants.ADMIN;
            reportFavoriteChange.isSelected = true;

            const columnSetFavoriteChange = new FavoriteChange(new ColumnSet(), FavoriteDisplayEnum.COLUMN_SET, FavoriteType.REPORT);
            columnSetFavoriteChange.savingUser = CoreFavoriteConstants.ADMIN;
            columnSetFavoriteChange.isSelected = true;

            reportFavoriteChange.nestedChanges.push(columnSetFavoriteChange);

            expect(bulkSavingModalDirective['shouldOpenMultiSaveSummaryModal'](reportFavoriteChange)).toBe(true);
        });

        it('should test closeSaveSummaryModal', () => {
            bulkSavingModalDirective.isSingleLayerSaveSummaryModalOpen = true;
            bulkSavingModalDirective.isMultiLayerSaveSummaryModalOpen = true;
            jest.spyOn(bulkSavingModalDirective, 'saveChanges' as any);
            jest.spyOn(bulkSavingModalDirective, 'isAdditionalSavingConflicts' as any).mockReturnValue(true);

            bulkSavingModalDirective.closeSaveSummaryModal(true);

            expect(bulkSavingModalDirective.isSingleLayerSaveSummaryModalOpen).toBe(false);
            expect(bulkSavingModalDirective.isMultiLayerSaveSummaryModalOpen).toBe(false);
        });
    });

});
