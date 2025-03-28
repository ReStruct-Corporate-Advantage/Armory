import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {of} from 'rxjs';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {
    ColumnConfig,
    CoreUserMetaDataStore,
    FavoriteDisplayEnum,
    FavoriteType,
    UserMetaData
} from '@blk/explore-ui-core';
import {FavoriteTreeService} from './favorite-tree.service';
import {FavoriteService} from '@services/favorite';
import {BulkSavingHandlerService} from './bulk-saving-handler.service';
import {
    FavoriteChangeFolderState
} from '../nested-favorite-changes/save-detail/folder-structure-modal/folder-favorite-tree.service';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {SaveMode} from '@enums/save-mode.enum';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {Report} from '@models/workspace/report.model';
import {FavoriteFolderItem} from '@models/favorite/favorite-folder-item.model';
import {WorkspaceFavoriteChange} from '@models/favorite/workspace-favorite-change.model';
import {Workspace} from '@models/workspace/workspace.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {WorkpadFavoriteChange} from '@models/favorite/workpad-favorite-change.model';
import {CustomSector} from '@blk/explore-ui-breakdown';

describe('BulkSavingHandlerService', () => {
    let service: BulkSavingHandlerService;

    const favoriteServiceStub = {
        saveFavorite$: jest.fn((favoriteToSave, savingUser) => {
            if (favoriteToSave.id === null && favoriteToSave.type === FavoriteType.LAYOUT) {
                return of({
                    status: 'SUCCESS',
                    message: 'Successfully saved the favorite',
                    favoriteId: 1234567,
                    owner: 'seakim',
                    type: 'LAYOUT',
                    savingType: 'favorite'
                });
            } else if (favoriteToSave.id === null && favoriteToSave.type === FavoriteType.COLUMN) {
                return of({
                    status: 'SUCCESS',
                    message: 'Successfully saved the favorite',
                    favoriteId: 7654321,
                    owner: 'seakim',
                    type: 'COLUMN',
                    savingType: 'favorite'
                });
            } else if (favoriteToSave.id === 2435558 && favoriteToSave.type === FavoriteType.REPORT) {
                return of({
                    status: 'SUCCESS',
                    message: 'Successfully saved the favorite',
                    favoriteId: 2435558,
                    owner: 'seakim',
                    type: 'REPORT',
                    savingType: 'favorite'
                });
            }
            return of();
        })
    };

    const favoriteTreeServiceStub = {
        saveFavoriteFolderStructure$: jest.fn((favoriteFolderItem, folderType, folderOwner) => {
            return of({status: 'SUCCESS', owner: 'seakim', type: 'XXXFolder'});
        })
    };

    let reportChange: FavoriteChange;
    let columnSetChange: FavoriteChange;
    let customCalcChange: FavoriteChange;

    const folderChangesMap = new Map<string, AuxAdvancedTreeListInterface>();
    const favoriteChangeHoldingFolderStateMap = new Map<FavoriteChange|WorkspaceFavoriteChange, Map<FavoriteChangeFolderState, AuxAdvancedTreeListInterface>>();

    const originalFolder: AuxAdvancedTreeListInterface = {
        'label': 'folder1-2',
        'eventData': {
            'childFavoriteData': [{
                'children': [],
                'title': '1FavColumnSet1 Copy',
                'type': 'favorite',
                'favoriteId': 2449487
            }]
        },
        'children': [],
        'iconType': 'folder-subtle',
        'contextMenu': [{'label': 'Create folder', 'isFocusable': true}, {'label': 'Rename folder'}],
        'isSelected': false,
        'isExpanded': true,
        'key': 1,
        'nestedLevel': 1,
        'uid': '0353412e-a450-4c5b-b4a2-3b4a751ef54f',
        'isHidden': false,
        'posInSet': 2,
        'setSize': 2
    };

    const newFolder: AuxAdvancedTreeListInterface = {
        'label': 'folder1',
        'eventData': {
            'childFavoriteData': []
        },
        'children': [{
            'label': 'folder1-1',
            'eventData': {
                'childFavoriteData': [{
                    'children': [],
                    'title': '1FavColumnSet1',
                    'type': 'favorite',
                    'favoriteId': 2449299
                }]
            },
            'children': [{
                'label': 'folder1-1-1',
                'eventData': {'type': 'folder'},
                'children': [],
                'iconType': 'folder-subtle',
                'contextMenu': [{'label': 'Create folder'}, {'label': 'Rename folder'}, {'label': 'Delete folder'}],
                'key': 0,
                'nestedLevel': 2,
                'isExpanded': false,
                'uid': '985b63bd-9e1f-40c7-92ac-7896f1780a00',
                'isHidden': false,
                'posInSet': 1,
                'setSize': 1,
                'isSelected': false
            }],
            'iconType': 'folder-subtle',
            'contextMenu': [{'label': 'Create folder', 'isFocusable': true}, {'label': 'Rename folder'}],
            'key': 0,
            'nestedLevel': 1,
            'isExpanded': false,
            'uid': 'a70c5cb4-cd54-4e43-bfa1-6cf1ea08cbe9',
            'isHidden': false,
            'posInSet': 1,
            'setSize': 2,
            'isSelected': false
        }, originalFolder],
        'iconType': 'folder-subtle',
        'contextMenu': [{'label': 'Create folder', 'isFocusable': true}, {'label': 'Rename folder'}],
        'isExpanded': true,
        'key': 0,
        'nestedLevel': 0,
        'uid': '16acb750-eab7-4778-ba2d-c757c8660953',
        'isHidden': false,
        'posInSet': 1,
        'setSize': 1,
        'isSelected': true
    };

    const rootFolder: AuxAdvancedTreeListInterface = {
        children: [newFolder],
        contextMenu: [{'label': 'Create folder', 'isFocusable': true}, {'label': 'Rename folder'}],
        eventData: {favoriteId: 2449326, childFavoriteData: []},
        iconType: 'folder-subtle',
        isExpanded: true,
        label: undefined
    };

    beforeAll(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.access = true;
        CoreUserMetaDataStore.userMetaData.login = 'seakim';
        CoreUserMetaDataStore.userMetaData.sharedFavPerms = true;
        CoreUserMetaDataStore.userMetaData.globalFavPerms = true;

        reportChange = getChangedReportFavoritesTreeMock();
        columnSetChange = reportChange.nestedChanges[0];
        customCalcChange = columnSetChange.nestedChanges[0];
    });

    beforeEach( async () => {
        await TestBed.configureTestingModule({
            providers: [
                {provide: FavoriteTreeService, useValue: favoriteTreeServiceStub},
                {provide: FavoriteService, useValue: favoriteServiceStub},
                BulkSavingHandlerService
            ]
        });

        service = TestBed.inject(BulkSavingHandlerService);

        folderChangesMap.set('seakim,COLUMN_FOLDER', {
            label: '',
            'eventData': {'type': 'folder'},
            'children': [],
            'iconType': 'folder-subtle'
        });

        folderChangesMap.set('seakim,REPORT_FOLDER', rootFolder);
        favoriteChangeHoldingFolderStateMap.set(columnSetChange, new Map());
        favoriteChangeHoldingFolderStateMap.get(columnSetChange).set(FavoriteChangeFolderState.NEW, newFolder);
        favoriteChangeHoldingFolderStateMap.get(columnSetChange).set(FavoriteChangeFolderState.ORIGINAL, originalFolder);
    });

    describe('test saveChanges', () => {
        let subscription;

        beforeEach(() => {
            service.changedFavoritesTree = reportChange;
            service.flattenedFavoriteChanges = [customCalcChange, columnSetChange, reportChange];
            subscription = service.saveChanges$(folderChangesMap, favoriteChangeHoldingFolderStateMap)
                .subscribe();
        });

        afterEach(() => {
            jest.resetAllMocks();
            subscription.unsubscribe();
        });


        it('should calculate savingOrder and set favoriteChangesToSaveInOrder', fakeAsync(() => {
            tick(1);

            customCalcChange.isSaved = false;
            customCalcChange.isSelected = true;
            columnSetChange.isSaved = false;
            columnSetChange.isSelected = true;
            reportChange.isSaved = false;
            reportChange.isSelected = true;

            expect(service['getFavoriteChangesToSaveInOrder']()).toEqual(
                [[customCalcChange, reportChange], [columnSetChange]]
            );
        }));

        it('should sequentially save favorites based on the savingOrder', fakeAsync(() => {
            tick(1);

            expect(reportChange.value.title).toBe('favReport1_SAVE_AS');
            expect(reportChange.value.owner).toBe('seakim');
            expect(reportChange.value.id).toBe(1234567);

            expect(columnSetChange.value.title).toBe('favColumnSet1_SAVE');
            expect(columnSetChange.value.owner).toBe('seakim');
            expect(columnSetChange.value.id).toBe(2435558);

            expect(customCalcChange.value.title).toBe('favCustomCalc1_SAVE_AS');
            expect(customCalcChange.value.owner).toBe('seakim');
            expect(customCalcChange.value.id).toBe(7654321);
        }));

        describe('test folder structure saving', () => {
            it('should get all valid folderChangeMapKeys', () => {
                expect(service['getValidFolderChangeMapKeys']()).toEqual(['seakim,COLUMN_FOLDER', 'seakim,REPORT_FOLDER']);

                customCalcChange.isSelected = false;
                expect(service['getValidFolderChangeMapKeys']()).toEqual(['seakim,REPORT_FOLDER']);
            });

            describe('test handleFavoriteDataInFolderStructures', () => {
                it('Save: case when a destination folder is chosen by user', () => {
                    reportChange.isSelected = false;
                    customCalcChange.isSelected = false;
                    columnSetChange.isSelected = true;
                    columnSetChange.saveMode = SaveMode.SAVE;
                    columnSetChange.originalFavoriteFolderItem = new FavoriteFolderItem({
                        type: 'favorite',
                        title: 'favColumnSet1_SAVE',
                        favoriteId: 2435558
                    });
                    newFolder.eventData.childFavoriteData = [columnSetChange];

                    expect(originalFolder.eventData.childFavoriteData.includes(columnSetChange)).toBeFalsy();

                    service['handleFavoriteDataInFolderStructures']();

                    // target favorite should change to FavoriteFolderItem.
                    expect(newFolder.eventData.childFavoriteData.includes(columnSetChange)).toBeFalsy();
                    expect(newFolder.eventData.childFavoriteData[0] instanceof FavoriteFolderItem).toBeTruthy();
                    expect(newFolder.eventData.childFavoriteData[0].title).toBe(columnSetChange.saveTitle);
                    expect(newFolder.eventData.childFavoriteData[0].favoriteId).toBe(2435558);
                });

                it('SaveAs: case when a destination folder is chosen by user', () => {
                    reportChange.isSelected = false;
                    customCalcChange.isSelected = false;
                    columnSetChange.isSelected = true;
                    columnSetChange.saveMode = SaveMode.SAVE_AS;
                    columnSetChange.originalFavoriteFolderItem = new FavoriteFolderItem({
                        type: 'favorite',
                        title: 'favColumnSet1_SAVE',
                        favoriteId: 2435558
                    });
                    originalFolder.eventData.childFavoriteData.push(columnSetChange);

                    originalFolder.eventData.childFavoriteData = [columnSetChange];
                    newFolder.eventData.childFavoriteData = [columnSetChange];

                    service['handleFavoriteDataInFolderStructures']();

                    // target favorite should be removed from the originalFolder in case of saveAs (same titled favorite).
                    expect(originalFolder.eventData.childFavoriteData.includes(columnSetChange)).toBeFalsy();
                    expect(originalFolder.eventData.childFavoriteData[0] instanceof FavoriteFolderItem).toBeFalsy();

                    // target favorite should be added in the newFolder as new favorite.
                    expect(newFolder.eventData.childFavoriteData.includes(columnSetChange)).toBeFalsy();
                    expect(newFolder.eventData.childFavoriteData[0] instanceof FavoriteFolderItem).toBeTruthy();
                    expect(newFolder.eventData.childFavoriteData[0].title).toBe(columnSetChange.value.title);
                    expect(newFolder.eventData.childFavoriteData[0].favoriteId).toBe(columnSetChange.value.id);
                });

                it('SaveAs: case when a destination folder is NOT chosen by user', () => {
                    // unset newFolder.  Since it's not chosen, it won't exist.
                    service.favoriteChangeHoldingFolderStateMap.get(columnSetChange).set(FavoriteChangeFolderState.NEW, null);

                    reportChange.isSelected = false;
                    customCalcChange.isSelected = false;
                    columnSetChange.isSelected = true;
                    columnSetChange.saveMode = SaveMode.SAVE_AS;
                    columnSetChange.originalFavoriteFolderItem = new FavoriteFolderItem({
                        type: 'favorite',
                        title: 'favColumnSet1_SAVE',
                        favoriteId: 2435558
                    });

                    originalFolder.eventData.childFavoriteData = [columnSetChange];

                    service['handleFavoriteDataInFolderStructures']();

                    // target favorite shouldn't be duplicated in the originalFolder in case of saveAs (same titled favorite).
                    expect(originalFolder.eventData.childFavoriteData.includes(columnSetChange)).toBeFalsy();
                    expect(originalFolder.eventData.childFavoriteData.length).toBe(1);
                    expect(originalFolder.eventData.childFavoriteData[0] instanceof FavoriteFolderItem).toBeTruthy();
                    expect(originalFolder.eventData.childFavoriteData[0].title).toBe(columnSetChange.originalFavoriteFolderItem.title);
                    expect(originalFolder.eventData.childFavoriteData[0].favoriteId).toBe(columnSetChange.originalFavoriteFolderItem.favoriteId);
                });
            });

            describe('Test handleFavoriteDataInFolderStructures with given condition: a favorite is saved within a folder', () => {
                beforeEach(() => {
                    const report = new Report();
                    report.id = 12345;
                    report.title = 'original';
                    report.owner = 'seakim';

                    const reportFavoriteChange = new FavoriteChange(report, FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
                    reportFavoriteChange.isSelected = true;
                    reportFavoriteChange.savingUser = 'seakim';
                    reportFavoriteChange.savingOrder = 0;

                    service.changedFavoritesTree = reportFavoriteChange;
                    service.flattenedFavoriteChanges = [reportFavoriteChange];

                    service.favoriteChangeHoldingFolderStateMap = new Map();
                    service.favoriteChangeHoldingFolderStateMap.set(service.changedFavoritesTree, new Map<FavoriteChangeFolderState, AuxAdvancedTreeListInterface>());
                    service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).set(FavoriteChangeFolderState.ORIGINAL, {
                        label: 'folder A',
                        children: [],
                        eventData: {
                            childFavoriteData: [service.changedFavoritesTree]
                        }
                    });
                });

                describe('Save Case', () => {
                    beforeEach(() => {
                        service.changedFavoritesTree.saveMode = SaveMode.SAVE;
                    });

                    it('Case 1: "Save" favorite with the same title (saving in the same folder)', () => {
                        service['handleFavoriteDataInFolderStructures']();

                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.ORIGINAL).eventData.childFavoriteData.length).toBe(1);
                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.ORIGINAL).eventData.childFavoriteData[0]).toEqual(
                            {'children': [], 'favoriteId': 12345, 'title': 'original', 'type': 'favorite'}
                        );
                    });

                    it('Case 2: "Save" favorite with the new title (saving in the same folder)', () => {
                        service.changedFavoritesTree.saveTitle = 'new';
                        service['handleFavoriteDataInFolderStructures']();

                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.ORIGINAL).eventData.childFavoriteData.length).toBe(1);
                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.ORIGINAL).eventData.childFavoriteData[0]).toEqual(
                            {'children': [], 'favoriteId': 12345, 'title': 'new', 'type': 'favorite'}
                        );
                    });

                    it('Case 3: "Save" favorite with the same title (saving in the new folder)', () => {
                        selectNewFolderForSave();

                        service['handleFavoriteDataInFolderStructures']();

                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.ORIGINAL).eventData.childFavoriteData.length).toBe(0);

                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.NEW).eventData.childFavoriteData.length).toBe(1);
                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.NEW).eventData.childFavoriteData[0]).toEqual(
                            {'children': [], 'favoriteId': 12345, 'title': 'original', 'type': 'favorite'}
                        );
                    });

                    it('Case 4: "Save" favorite with the new title (saving in the new folder)', () => {
                        service.changedFavoritesTree.saveTitle = 'new';
                        selectNewFolderForSave();

                        service['handleFavoriteDataInFolderStructures']();

                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.ORIGINAL).eventData.childFavoriteData.length).toBe(0);

                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.NEW).eventData.childFavoriteData.length).toBe(1);
                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.NEW).eventData.childFavoriteData[0]).toEqual(
                            {'children': [], 'favoriteId': 12345, 'title': 'new', 'type': 'favorite'}
                        );
                    });

                    function selectNewFolderForSave() {
                        service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.ORIGINAL).eventData.childFavoriteData = [];
                        service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).set(FavoriteChangeFolderState.NEW, {
                            label: 'folder B',
                            children: [],
                            eventData: {
                                childFavoriteData: [service.changedFavoritesTree]
                            }
                        });
                    }
                });

                describe('Save AS Case', () => {
                    beforeEach(() => {
                        service.changedFavoritesTree.originalFavoriteFolderItem = new FavoriteFolderItem({
                            title: 'original',
                            type: 'favorite',
                            favoriteId: 12345,
                            children: []
                        });
                        service.changedFavoritesTree.saveMode = SaveMode.SAVE_AS;
                    });

                    it('Case 5: "Save AS" favorite with the same title (saving in the same folder)', () => {
                        service['handleFavoriteDataInFolderStructures']();

                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.ORIGINAL).eventData.childFavoriteData.length).toBe(1);
                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.ORIGINAL).eventData.childFavoriteData[0]).toEqual(
                            {'children': [], 'favoriteId': 12345, 'title': 'original', 'type': 'favorite'}
                        );
                    });

                    it('Case 6: "Save AS" favorite with the new title (saving in the same folder)', () => {
                        service.changedFavoritesTree.saveTitle = 'new';
                        service.changedFavoritesTree.value.id = 67890;
                        service['handleFavoriteDataInFolderStructures']();

                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.ORIGINAL).eventData.childFavoriteData.length).toBe(2);
                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.ORIGINAL).eventData.childFavoriteData[0]).toEqual(
                            {'children': [], 'favoriteId': 12345, 'title': 'original', 'type': 'favorite'}
                        );
                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.ORIGINAL).eventData.childFavoriteData[1]).toEqual(
                            {'children': [], 'favoriteId': 67890, 'title': 'new', 'type': 'favorite'}
                        );
                    });

                    it('Case 7: "Save AS" favorite with the same title (saving in the new folder)', () => {
                        selectNewFolderForSaveAs();

                        service['handleFavoriteDataInFolderStructures']();

                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.ORIGINAL).eventData.childFavoriteData.length).toBe(0);

                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.NEW).eventData.childFavoriteData.length).toBe(1);
                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.NEW).eventData.childFavoriteData[0]).toEqual(
                            {'children': [], 'favoriteId': 12345, 'title': 'original', 'type': 'favorite'}
                        );
                    });

                    it('Case 8: "Save AS" favorite with the new title (saving in the new folder)', () => {
                        service.changedFavoritesTree.saveTitle = 'new';
                        service.changedFavoritesTree.value.id = 67890;
                        selectNewFolderForSaveAs();

                        service['handleFavoriteDataInFolderStructures']();

                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.ORIGINAL).eventData.childFavoriteData.length).toBe(1);
                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.ORIGINAL).eventData.childFavoriteData[0]).toEqual(
                            {'children': [], 'favoriteId': 12345, 'title': 'original', 'type': 'favorite'}
                        );
                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.NEW).eventData.childFavoriteData.length).toBe(1);
                        expect(service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).get(FavoriteChangeFolderState.NEW).eventData.childFavoriteData[0]).toEqual(
                            {'children': [], 'favoriteId': 67890, 'title': 'new', 'type': 'favorite'}
                        );
                    });

                    function selectNewFolderForSaveAs() {
                        service.favoriteChangeHoldingFolderStateMap.get(service.changedFavoritesTree).set(FavoriteChangeFolderState.NEW, {
                            label: 'folder B',
                            children: [],
                            eventData: {
                                childFavoriteData: [service.changedFavoritesTree]
                            }
                        });
                    }
                });
            });
        });
    });

    it('should calculate saving orders for complex nested favorite structure under workspace level', () => {
        const workspaceFavoriteChange = getWorkspaceFavoriteChangeTreeMock();
        service['calculateSavingOrders'](workspaceFavoriteChange);

        expect(workspaceFavoriteChange.savingOrder).toBe(3);

        const workpad1 = workspaceFavoriteChange.nestedChanges[0];
        const workpad1PortfolioFilter1 = workpad1.nestedChanges[0];
        const workpad1PortfolioFilter2 = workpad1.nestedChanges[1];
        const workpad1PortfolioFilter3 = workpad1.nestedChanges[2];
        expect(workpad1PortfolioFilter1.savingOrder).toBe(0);
        expect(workpad1PortfolioFilter2.savingOrder).toBe(0);
        expect(workpad1PortfolioFilter3.savingOrder).toBe(0);

        const workpad1Report1 = workpad1.modifiedReports[0];
        expect(workpad1Report1.savingOrder).toBe(2);

        const workpad1Report1ColumnSet1 = workpad1Report1.nestedChanges[0];
        expect(workpad1Report1ColumnSet1.savingOrder).toBe(1);

        const workpad1Report1ColumnSet1CustomCalc1 = workpad1Report1ColumnSet1.nestedChanges[0];
        expect(workpad1Report1ColumnSet1CustomCalc1.savingOrder).toBe(0);

        const workpadReport2 = workpad1.modifiedReports[1];
        const workpadReport2ColumnSet1 = workpadReport2.nestedChanges[0];
        expect(workpadReport2ColumnSet1.savingOrder).toBe(0);

        const workpad2 = workspaceFavoriteChange.nestedChanges[1];
        const workpad2Report1 = workpad2.modifiedReports[0];
        expect(workpad2Report1.savingOrder).toBe(0);

        const workpad2Report1Filter1 = workpad2Report1.nestedChanges[0];
        expect(workpad2Report1Filter1.savingOrder).toBe(0);
    });

    describe('handleFailedFolderSavingItems Test', () => {
        const savablesInOrder = [['seakim,COLUMN_FOLDER', 'REPORT_FOLDER']];
        const responseMetaData = [
            {status: 'SUCCESS', message: 'Tree structure saved successfully', favoriteId: 12345, owner: 'seakim', type: 'COLUMN_FOLDER'},
            {status: 'SUCCESS', message: 'Tree structure saved successfully', favoriteId: 67890, owner: 'seakim', type: 'REPORT_FOLDER'}
        ];

        it('should add the folderCacheKeys to the failedRequestItems if no responseMetaData', () => {
            expect(service['handleFailedFolderSavingItems'](null, savablesInOrder, 0, [])).toEqual(['seakim,COLUMN_FOLDER', 'REPORT_FOLDER']);
        });

        it('should do nothing when there is no failed items', () => {
            expect(service['handleFailedFolderSavingItems'](responseMetaData, savablesInOrder, 0, [])).toEqual([]);
        });

        it('should add failed folderCacheKey to the failedRequestItems', () => {
            service.folderChangesMap = new Map<string, AuxAdvancedTreeListInterface>();
            service.folderChangesMap.set('COLUMN_FOLDER', {} as any);
            service.folderChangesMap.set('REPORT_FOLDER', {} as any);

            expect(service['handleFailedFolderSavingItems'](responseMetaData, savablesInOrder, 0, ['REPORT_FOLDER'])).toEqual(['REPORT_FOLDER']);
        });
    });
});

export function getWorkspaceFavoriteChangeTreeMock(): WorkspaceFavoriteChange {
    // The workspace has two workpads.
    //  First workpad has:
    //      3 portfolios and they have portfolio filter changes,
    //      2 reports (one is unsaved report) and they have column set, column changes.
    //  second workpad has 2 portfolios with no changes and 1 report with filter change.

    const workspaceMock = new Workspace();
    const workspaceChange = new WorkspaceFavoriteChange(workspaceMock);
    workspaceChange.saveMode = SaveMode.SAVE;
    workspaceChange.saveTitle = '1FavWorkspace1';
    workspaceChange.savingUser = 'seakim';
    workspaceChange.isSelected = true;

    const reportGroup1Mock = new ReportGroup();
    const workpadChange1 = new WorkpadFavoriteChange(reportGroup1Mock);

    const customSectorMock = new CustomSector();
    const portfolioFilterChange1 = new FavoriteChange(customSectorMock, FavoriteDisplayEnum.FILTER, FavoriteType.CUSTOM_SEC);
    portfolioFilterChange1.saveMode = SaveMode.SAVE;
    portfolioFilterChange1.saveTitle = '1PortfolioFilter1';
    portfolioFilterChange1.savingUser = 'seakim';
    portfolioFilterChange1.isSelected = true;

    const portfolioFilterChange2 = new FavoriteChange(customSectorMock, FavoriteDisplayEnum.FILTER, FavoriteType.CUSTOM_SEC);
    portfolioFilterChange2.saveMode = SaveMode.SAVE;
    portfolioFilterChange2.saveTitle = '1PortfolioFilter1';
    portfolioFilterChange2.savingUser = 'seakim';
    portfolioFilterChange2.isSelected = false;

    const portfolioFilterChange3 = new FavoriteChange(customSectorMock, FavoriteDisplayEnum.FILTER, FavoriteType.CUSTOM_SEC);
    portfolioFilterChange3.saveMode = SaveMode.SAVE_AS;
    portfolioFilterChange3.saveTitle = '1PortfolioFilter1New';
    portfolioFilterChange3.savingUser = 'seakim';
    portfolioFilterChange3.isSelected = true;

    workpadChange1.nestedChanges = [portfolioFilterChange1, portfolioFilterChange2, portfolioFilterChange3];

    // report 1
    const report1Mock = new Report();
    report1Mock.id = 12345;
    const reportChange1 = new FavoriteChange(report1Mock, FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
    reportChange1.saveMode = SaveMode.SAVE_AS;
    reportChange1.saveTitle = '1FavReport1New';
    reportChange1.savingUser = 'seakim';
    reportChange1.isSelected = true;

    const columnSetMock = new ColumnSet();
    const columnSetChange1 = new FavoriteChange(columnSetMock, FavoriteDisplayEnum.COLUMN_SET, FavoriteType.REPORT);
    columnSetChange1.saveMode = SaveMode.SAVE_AS;
    columnSetChange1.saveTitle = '1FavColumnSet1New';
    columnSetChange1.savingUser = 'seakim';
    columnSetChange1.isSelected = true;

    const customCalcMock = new ColumnConfig();
    const customCalcChange1 = new FavoriteChange(customCalcMock, FavoriteDisplayEnum.CUSTOM_CALC, FavoriteType.COLUMN);
    customCalcChange1.saveMode = SaveMode.SAVE_AS;
    customCalcChange1.saveTitle = '1FavCustomCalc1New';
    customCalcChange1.savingUser = 'seakim';
    customCalcChange1.isSelected = true;

    columnSetChange1.nestedChanges = [customCalcChange1];
    reportChange1.nestedChanges = [columnSetChange1];

    // report 2 - unsaved report
    const report2Mock = new Report();
    report2Mock.id = null;
    const reportChange2 = new FavoriteChange(report2Mock, FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
    reportChange2.saveMode = SaveMode.SAVE;
    reportChange2.saveTitle = 'Report 2';
    reportChange2.savingUser = 'seakim';
    reportChange2.isSelected = false;

    const columnSetChange2 = new FavoriteChange(columnSetMock, FavoriteDisplayEnum.COLUMN_SET, FavoriteType.REPORT);
    columnSetChange2.saveMode = SaveMode.SAVE;
    columnSetChange2.saveTitle = 'Green Bond Adj';
    columnSetChange2.savingUser = 'seakim';
    columnSetChange2.isSelected = true;

    reportChange2.nestedChanges = [columnSetChange2];
    workpadChange1.modifiedReports = [reportChange1, reportChange2];

    // report group 2
    const reportGroup2Mock = new ReportGroup();
    const workpadChange2 = new WorkpadFavoriteChange(reportGroup2Mock);

    // report 3
    const report3Mock = new Report();
    report3Mock.id = 67890;
    const reportChange3 = new FavoriteChange(report3Mock, FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
    reportChange3.saveMode = SaveMode.SAVE;
    reportChange3.saveTitle = 'test';
    reportChange3.savingUser = 'seakim';
    reportChange3.isSelected = true;

    const filterChange = new FavoriteChange(customSectorMock, FavoriteDisplayEnum.FILTER, FavoriteType.CUSTOM_SEC);
    filterChange.saveMode = SaveMode.SAVE;
    filterChange.saveTitle = '1FavCustomSector3';
    filterChange.savingUser = 'seakim';
    filterChange.isSelected = true;

    reportChange3.nestedChanges = [filterChange];
    workpadChange2.modifiedReports = [reportChange3];
    workspaceChange.nestedChanges = [workpadChange1, workpadChange2];

    return workspaceChange;
}


/**
 * the mock has 3 layers: Report(SAVE_AS), ColumnSet(SAVE), CustomCalc(SAVE_AS)
 */
export function getChangedReportFavoritesTreeMock(): FavoriteChange {
    const report = new Report();
    report.id = 1234;
    report.owner = 'user01';
    report.title = 'fave report';

    const reportFavoriteChange = new FavoriteChange(report, FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
    reportFavoriteChange.saveMode = SaveMode.SAVE_AS;
    reportFavoriteChange.savingUser = 'seakim';
    reportFavoriteChange.saveTitle = 'favReport1_SAVE_AS';

    const columnSet = new ColumnSet();
    columnSet.id = 2435558;
    columnSet.owner = 'seakim';
    columnSet.title = 'favColumnSet1';
    const colSetFavoriteChange = new FavoriteChange(columnSet, FavoriteDisplayEnum.COLUMN_SET, FavoriteType.REPORT);
    colSetFavoriteChange.saveMode = SaveMode.SAVE;
    colSetFavoriteChange.savingUser = 'seakim';
    colSetFavoriteChange.saveTitle = 'favColumnSet1_SAVE';
    reportFavoriteChange.nestedChanges.push(colSetFavoriteChange);

    const customCalc = new ColumnConfig();
    customCalc.id = 2438288;
    customCalc.owner = 'tilee';
    customCalc.title = 'favCustomCalc1';
    const customCalcFavoriteChange = new FavoriteChange(customCalc, FavoriteDisplayEnum.CUSTOM_CALC, FavoriteType.COLUMN);
    customCalcFavoriteChange.saveMode = SaveMode.SAVE_AS;
    customCalcFavoriteChange.savingUser = 'seakim';
    customCalcFavoriteChange.saveTitle = 'favCustomCalc1_SAVE_AS';
    colSetFavoriteChange.nestedChanges.push(customCalcFavoriteChange);

    return reportFavoriteChange;
}
