import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SaveDetailComponent} from './save-detail.component';
import {Report} from '@models/workspace/report.model';
import {
    CoreDefinitionStore,
    CoreFavoriteConstants,
    CoreUserMetaDataStore,
    FavoriteDisplayEnum, FavoriteType, TokenConstants,
    TokenUtils,
    UserMetaData
} from '@blk/explore-ui-core';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {SaveMode} from '@enums/save-mode.enum';
import {
    FavoriteChangeFolderState,
    FolderFavoriteTreeService
} from './folder-structure-modal/folder-favorite-tree.service';
import {FavoriteService} from '@services/favorite';
import {CustomSector} from '@blk/explore-ui-breakdown';
import {of, throwError} from 'rxjs';
import {FavoriteConstants} from '@constants/favorite.constants';
import {AuxAdvancedTreeListInterface, AuxSelectSelectionChangedDetailInterface, AuxTextInputValueChangedDetailInterface} from '@blk/aladdin-angular-components';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {FavoriteFolderItem} from '@models/favorite/favorite-folder-item.model';
import {SavableFavoriteChange} from '@services/favorite-change-detection/favorite-change-detection.service';
import {FavoriteTreeService} from '../../service/favorite-tree.service';

describe('SaveDetailsComponent', () => {
    let component: SaveDetailComponent;
    let fixture: ComponentFixture<SaveDetailComponent>;

    const favoriteServiceStub = {
        getEnterprisePermGroups$: jest.fn()
    };

    beforeAll(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.login = 'user01';
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SaveDetailComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [HttpClientTestingModule],
            providers: [FolderFavoriteTreeService, {provide: FavoriteService, useValue: favoriteServiceStub}]
        })
            .compileComponents();

        fixture = TestBed.createComponent(SaveDetailComponent);
        component = fixture.componentInstance;
        TokenUtils.isFeatureEnabled = jest.fn().mockReturnValue(false);

        const report = new Report();
        report.title = 'Report 1';
        report.owner = 'user01';
        report.id = 1234;

        component.favoriteChange = new FavoriteChange(report, FavoriteDisplayEnum.REPORT);
        component.auxTextInput = {setValue: jest.fn()} as any;

        component.ngOnChanges({favoriteChange: new SimpleChange(undefined, component.favoriteChange, false)});
        fixture.detectChanges();
    });

    it('should handle showFavoriteOwnerOptions', () => {
        expect(component.personalAccessOnly).toBeTruthy();
        expect(component.userOption[0].values[0].displayValue).toBe(FavoriteConstants.PERSONAL_ACCOUNT);
        expect(component.userOption[0].values[0].isSelected).toBeTruthy();
    });

    it('should handle updateFavoriteOwner', () => {
        component['folderFavoriteTreeService'].favoriteChangeHoldingFolderStateMap.set(component.favoriteChange, new Map());
        component['selectedFolder'] = {label: 'selectedFolder', eventData: {childFavoriteData: []}} as any;

        expect(component.selectedUser).toBe('user01');

        const event = {detail: {value: {displayValue: FavoriteConstants.ADMIN_ACCOUNT, isSelected: true}}};
        component.updateFavoriteOwner(event as any);

        expect(component.selectedUser).toBe('_ADMIN');
    });

    it('should default to "Save" when favorite owner is current user', () => {
        const permGroups = ['Sustainability Regulatory Reporting', 'PMG ESG Client Reporting', 'APG RIO Team', 'BGM ESG Client Reporting'];
        favoriteServiceStub.getEnterprisePermGroups$.mockReturnValue(of(permGroups));
        expect(component.saveOptions[0].checked).toBeTruthy();
        expect(component.saveOptions[1].checked).toBeFalsy();
    });

    it('should update favoriteChange.enterpriseDescription when updateFavoriteDescription is called', () => {
        const event = {
            detail: {
                value: 'New Description'
            }
        } as CustomEvent<AuxTextInputValueChangedDetailInterface>;
        component.updateFavoriteDescription(event);
        expect(component.favoriteChange.enterpriseDescription).toEqual('New Description');
    });

    it('should update selectedPermissionGroups when onPermissionGroupsSelected is called', () => {
        const selectedPermissionGroups = ['group1', 'group2'];
        component.onPermissionGroupsSelected(selectedPermissionGroups);
        expect(component.selectedPermissionGroups).toEqual(selectedPermissionGroups);
    });

    it('should default to "Save As" and disable "Save" when favorite owner is different user', () => {
        const permGroups = ['Sustainability Regulatory Reporting', 'PMG ESG Client Reporting', 'APG RIO Team', 'BGM ESG Client Reporting'];
        favoriteServiceStub.getEnterprisePermGroups$.mockReturnValue(of(permGroups));
        const report = new Report();
        report.title = 'Report 1';
        report.owner = 'user02';
        report.id = 1234;

        component.favoriteChange = new FavoriteChange(report, FavoriteDisplayEnum.REPORT);
        component.ngOnChanges({favoriteChange: new SimpleChange(undefined, component.favoriteChange, false)});

        expect(component.saveOptions[0].checked).toBeFalsy();
        expect(component.saveOptions[0].disabled).toBeTruthy();
        expect(component.saveOptions[1].checked).toBeTruthy();
    });

    it('should handle openFolderStructureModal', () => {
        const permGroups = ['Sustainability Regulatory Reporting', 'PMG ESG Client Reporting', 'APG RIO Team', 'BGM ESG Client Reporting'];
        favoriteServiceStub.getEnterprisePermGroups$.mockReturnValue(of(permGroups));

        expect(component.isFolderStructureModalOpen).toBeFalsy();

        component.openFolderStructureModal();

        expect(component.isFolderStructureModalOpen).toBeTruthy();
    });

    it('should handle closeFolderStructureModal and update savingUser and saveMode', () => {
        const permGroups = ['Sustainability Regulatory Reporting', 'PMG ESG Client Reporting', 'APG RIO Team', 'BGM ESG Client Reporting'];
        favoriteServiceStub.getEnterprisePermGroups$.mockReturnValue(of(permGroups));
        component.isFolderStructureModalOpen = true;
        component.favoriteChange.savingUser = 'seakim';
        component.favoriteChange.saveMode = SaveMode.SAVE;
        component.saveOptions[0].disabled = false;
        component.saveOptions[0].checked = true;
        component.saveOptions[1].disabled = false;

        component.closeFolderStructureModal('_ADMIN');

        expect(component.isFolderStructureModalOpen).toBeFalsy();
        expect(component.favoriteChange.savingUser).toEqual('_ADMIN');
        expect(component.saveOptions[0].disabled).toBeTruthy();
        expect(component.saveOptions[0].checked).toBeFalsy();
        expect(component.saveOptions[1].checked).toBeTruthy();
        expect(component.favoriteChange.saveMode).toEqual(SaveMode.SAVE_AS);
    });

    it('should update favorite owner to ADMIN and set folderNameText to loadedFolder', () => {
        const event = {
            detail: {
                value: {
                    displayValue: FavoriteConstants.ADMIN_ACCOUNT,
                    isSelected: true
                }
            }
        } as CustomEvent<AuxSelectSelectionChangedDetailInterface>;

        component.loadedFolder = 'Loaded Folder';
        component.updateFavoriteOwner(event);

        expect(component.selectedUser).toBe(CoreFavoriteConstants.ADMIN);
        expect(component.favoriteChange.savingUser).toBe(CoreFavoriteConstants.ADMIN);
        expect(component.folderNameText).toBe('Loaded Folder');
    });

    it('should update favorite owner to PERSONAL and set folderNameText to empty string', () => {
        const event = {
            detail: {
                value: {
                    displayValue: FavoriteConstants.PERSONAL_ACCOUNT,
                    isSelected: true
                }
            }
        } as CustomEvent<AuxSelectSelectionChangedDetailInterface>;

        component.loadedFolder = 'Loaded Folder';
        component.updateFavoriteOwner(event);

        expect(component.selectedUser).toBe(CoreUserMetaDataStore.userMetaData.login);
        expect(component.favoriteChange.savingUser).toBe(CoreUserMetaDataStore.userMetaData.login);
        expect(component.folderNameText).toBe('');
    });

    describe('changeSaveMethod Test', () => {
        it('should handle untouched favorite title', () => {
            const permGroups = ['Sustainability Regulatory Reporting', 'PMG ESG Client Reporting', 'APG RIO Team', 'BGM ESG Client Reporting'];
            favoriteServiceStub.getEnterprisePermGroups$.mockReturnValue(of(permGroups));

            component.favoriteChange.value.title = 'Sean`s report';

            component.favoriteChange.saveMode = SaveMode.SAVE_AS;
            component.favoriteChange.saveTitle = 'Sean`s report Copy';

            component.changeSaveMethod({detail: {value: {eventData: SaveMode.SAVE}}} as any);

            expect(component.favoriteChange.saveMode).toBe(SaveMode.SAVE);
            expect(component.favoriteChange.saveTitle).toBe('Sean`s report');

            component.changeSaveMethod({detail: {value: {eventData: SaveMode.SAVE_AS}}} as any);

            expect(component.favoriteChange.saveMode).toBe(SaveMode.SAVE_AS);
            expect(component.favoriteChange.saveTitle).toBe('Sean`s report Copy');
        });

        it('should update favorite change location in folder when SAVE/SAVE_AS is chosen', () => {
            const permGroups = ['Sustainability Regulatory Reporting', 'PMG ESG Client Reporting', 'APG RIO Team', 'BGM ESG Client Reporting'];
            favoriteServiceStub.getEnterprisePermGroups$.mockReturnValue(of(permGroups));
            const customSector = new CustomSector();
            customSector.title = '1FavCustomSector1-1';
            customSector.id = 2449300;

            const favoriteChange = new FavoriteChange(customSector, FavoriteDisplayEnum.CUSTOM_SECTOR);
            favoriteChange.saveMode = SaveMode.SAVE;
            favoriteChange.saveTitle = '1FavCustomSector1-1 NEW';
            favoriteChange.savingUser = 'seakim';
            component.favoriteChange = favoriteChange;

            component['folderFavoriteTreeService'].folderChangesMap = new Map();
            component['folderFavoriteTreeService'].favoriteChangeHoldingFolderStateMap = new Map();
            component['folderFavoriteTreeService'].favoriteChangeHoldingFolderStateMap.set(favoriteChange, new Map());

            const newFolder = {label: 'folder1-2', eventData: {childFavoriteData: [favoriteChange]}};
            const originalFolder = {label: 'folder-1-1-1', eventData: {childFavoriteData: []}};
            const rootFolder = {label: undefined, eventData: {favoriteId: 2449328, childFavoriteData: []}};

            component['folderFavoriteTreeService'].folderChangesMap.set('seakim,CUSTOM_SEC_FOLDER', rootFolder);
            const favoriteChangeHoldingFolderState = component['folderFavoriteTreeService'].favoriteChangeHoldingFolderStateMap.get(favoriteChange);
            favoriteChangeHoldingFolderState.set(FavoriteChangeFolderState.ORIGINAL, originalFolder);
            favoriteChangeHoldingFolderState.set(FavoriteChangeFolderState.NEW, newFolder);

            expect(favoriteChange.saveMode).toBe(SaveMode.SAVE);
            expect(favoriteChangeHoldingFolderState.get(FavoriteChangeFolderState.NEW).eventData.childFavoriteData.includes(component.favoriteChange)).toBeTruthy();
            expect(favoriteChangeHoldingFolderState.get(FavoriteChangeFolderState.ORIGINAL).eventData.childFavoriteData.includes(component.favoriteChange)).toBeFalsy();

            component.changeSaveMethod({detail: {value: {eventData: SaveMode.SAVE_AS}}} as any);

            expect(favoriteChangeHoldingFolderState.get(FavoriteChangeFolderState.NEW).eventData.childFavoriteData.includes(component.favoriteChange)).toBeTruthy();
            expect(favoriteChangeHoldingFolderState.get(FavoriteChangeFolderState.ORIGINAL).eventData.childFavoriteData.includes(component.favoriteChange)).toBeTruthy();

            component.changeSaveMethod({detail: {value: {eventData: SaveMode.SAVE}}} as any);

            expect(favoriteChangeHoldingFolderState.get(FavoriteChangeFolderState.NEW).eventData.childFavoriteData.includes(component.favoriteChange)).toBeTruthy();
            expect(favoriteChangeHoldingFolderState.get(FavoriteChangeFolderState.ORIGINAL).eventData.childFavoriteData.includes(component.favoriteChange)).toBeFalsy();
        });
    });

    it('updateSaveRequirements test', () => {
        // Test case when enterprise perm group is enabled, required, and saving user is ADMIN
        CoreDefinitionStore.tokens[TokenUtils.EXPLORE_ENABLE_ENTERPRISE_TAGS] = 'Y';
        CoreDefinitionStore.tokens[TokenUtils.EXPLORE_ENTERPRISE_PERM_TAGS_REQUIRED] = 'Y';
        component.isEnterprisePermGroupEnabled = true;
        component.isEnterprisePermGroupRequired = true;
        component.favoriteChange.savingUser = CoreFavoriteConstants.ADMIN;
        component.favoriteChange.userPermGrps = ['group1'];

        component['checkSaveRequirements']();
        expect(component.isRequiredFlagShown).toEqual(true);
        expect(component.isRequiredPermsSelected).toEqual(true);

        // Test case when enterprise perm group is enabled, not required, and saving user is ADMIN
        CoreDefinitionStore.tokens[TokenUtils.EXPLORE_ENABLE_ENTERPRISE_TAGS] = 'Y';
        CoreDefinitionStore.tokens[TokenUtils.EXPLORE_ENTERPRISE_PERM_TAGS_REQUIRED] = 'N';
        component.isEnterprisePermGroupEnabled = true;
        component.isEnterprisePermGroupRequired = false;
        component['checkSaveRequirements']();
        expect(component.isRequiredFlagShown).toEqual(false);
        expect(component.isRequiredPermsSelected).toEqual(true);

        // Test case when enterprise perm group is not enabled
        CoreDefinitionStore.tokens[TokenUtils.EXPLORE_ENABLE_ENTERPRISE_TAGS] = 'N';
        CoreDefinitionStore.tokens[TokenUtils.EXPLORE_ENTERPRISE_PERM_TAGS_REQUIRED] = 'N';
        component.isEnterprisePermGroupEnabled = false;
        component.isEnterprisePermGroupRequired = false;
        component['checkSaveRequirements']();
        expect(component.isRequiredFlagShown).toEqual(false);
        expect(component.isRequiredPermsSelected).toEqual(true);
    });

    describe('traverseAndFindFolderName', () => {
        it('should return the folder name if the favoriteId is found in the tree', () => {
            const node: AuxAdvancedTreeListInterface = {
                label: 'Root Folder',
                children: [
                    {
                        label: 'Child Folder 1',
                        eventData: { favoriteId: 1 },
                        children: []
                    },
                    {
                        label: 'Child Folder 2',
                        eventData: { favoriteId: 2 },
                        children: []
                    }
                ]
            };

            const result = component.traverseAndFindFolderName(node, 1);
            expect(result).toBe('Root Folder');
        });

        it('should return null if the favoriteId is not found in the tree', () => {
            const node: AuxAdvancedTreeListInterface = {
                label: 'Root Folder',
                children: [
                    {
                        label: 'Child Folder 1',
                        eventData: { favoriteId: 1 },
                        children: []
                    },
                    {
                        label: 'Child Folder 2',
                        eventData: { favoriteId: 2 },
                        children: []
                    }
                ]
            };

            const result = component.traverseAndFindFolderName(node, 3);
            expect(result).toBeNull();
        });

        it('should return the folder name if the favoriteId is found in a nested folder', () => {
            const node: AuxAdvancedTreeListInterface = {
                label: 'Root Folder',
                children: [
                    {
                        label: 'Child Folder 1',
                        eventData: { favoriteId: 1 },
                        children: [
                            {
                                label: 'Nested Folder',
                                eventData: { favoriteId: 3 },
                                children: []
                            }
                        ]
                    },
                    {
                        label: 'Child Folder 2',
                        eventData: { favoriteId: 2 },
                        children: []
                    }
                ]
            };

            const result = component.traverseAndFindFolderName(node, 3);
            expect(result).toBe('Child Folder 1');
        });

        it('should return null if the node has no children', () => {
            const node: AuxAdvancedTreeListInterface = {
                label: 'Root Folder',
                children: []
            };

            const result = component.traverseAndFindFolderName(node, 1);
            expect(result).toBeNull();
        });
    });

    describe('getFolderNameText', () => {
        let favoriteChange: SavableFavoriteChange;
        let folderFavoriteTreeService: FolderFavoriteTreeService;
        let favoriteTreeService: FavoriteTreeService;

        beforeEach(() => {
            folderFavoriteTreeService = TestBed.inject(FolderFavoriteTreeService);
            favoriteTreeService = TestBed.inject(FavoriteTreeService);

            favoriteChange = new FavoriteChange(new Report(), FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
            favoriteChange.savingUser = CoreFavoriteConstants.ADMIN;
            favoriteChange.value.id = 1234;

            component.favoriteChange = favoriteChange;
        });

        it('should return empty string if savingUser is not ADMIN', async () => {
            favoriteChange.savingUser = 'user01';
            const result = await component.getFolderNameText(favoriteChange);
            expect(result).toBe('');
        });

        it('should return folder name from cache if available', async () => {
            const rootFolderNode: AuxAdvancedTreeListInterface = {
                label: 'Root Folder',
                children: [
                    {
                        label: 'Child Folder 1',
                        eventData: { favoriteId: 1234 },
                        children: []
                    }
                ]
            };
            jest.spyOn(folderFavoriteTreeService.folderChangesMap, 'get').mockReturnValue(rootFolderNode);
            jest.spyOn(folderFavoriteTreeService, 'generateFavoriteTreeNode').mockReturnValue(rootFolderNode);

            const result = await component.getFolderNameText(favoriteChange);
            expect(result).toBe('Root Folder');
        });

        it('should return folder name from service if not available in cache', async () => {
            const rootFolderNode: AuxAdvancedTreeListInterface = {
                label: 'Root Folder',
                children: [
                    {
                        label: 'Child Folder 1',
                        eventData: { favoriteId: 1234 },
                        children: []
                    }
                ]
            };
            jest.spyOn(folderFavoriteTreeService.folderChangesMap, 'get').mockReturnValue(undefined);
            jest.spyOn(favoriteTreeService, 'getFavoriteFolderStructure$').mockReturnValue(of({
                favoriteId: 1234,
                type: 'folder',
                title: 'Root Folder'
            } as FavoriteFolderItem));
            jest.spyOn(folderFavoriteTreeService, 'generateFavoriteTreeNode').mockReturnValue(rootFolderNode);

            const result = await component.getFolderNameText(favoriteChange);
            expect(result).toBe('Root Folder');
        });

        it('should handle error when fetching folder structure', async () => {
            jest.spyOn(folderFavoriteTreeService.folderChangesMap, 'get').mockReturnValue(undefined);
            jest.spyOn(favoriteTreeService, 'getFavoriteFolderStructure$').mockReturnValue(throwError('Error'));

            try {
                await component.getFolderNameText(favoriteChange);
            } catch (error) {
                expect(error).toBe('Error');
            }
        });
    });

    describe('closeFolderStructureModal', () => {
        let favoriteChange: SavableFavoriteChange;
        let folderFavoriteTreeService: FolderFavoriteTreeService;

        beforeEach(() => {
            folderFavoriteTreeService = TestBed.inject(FolderFavoriteTreeService);

            favoriteChange = new FavoriteChange(new Report(), FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
            favoriteChange.savingUser = CoreFavoriteConstants.ADMIN;
            favoriteChange.value.id = 1234;

            component.favoriteChange = favoriteChange;
        });

        it('should update folderNameText if the folder has changed', () => {
            const latestFolderState = new Map<FavoriteChangeFolderState, AuxAdvancedTreeListInterface>();
            const newSelectedFolder: AuxAdvancedTreeListInterface = { label: 'New Folder' } as AuxAdvancedTreeListInterface;
            latestFolderState.set(FavoriteChangeFolderState.NEW, newSelectedFolder);
            jest.spyOn(folderFavoriteTreeService.favoriteChangeHoldingFolderStateMap, 'get').mockReturnValue(latestFolderState);

            component.closeFolderStructureModal('_ADMIN');

            expect(component.folderNameText).toBe('New Folder');
        });

        it('should not update folderNameText if the folder has not changed', () => {
            const latestFolderState = new Map<FavoriteChangeFolderState, AuxAdvancedTreeListInterface>();
            jest.spyOn(folderFavoriteTreeService.favoriteChangeHoldingFolderStateMap, 'get').mockReturnValue(latestFolderState);

            component.folderNameText = 'Old Folder';
            component.closeFolderStructureModal('_ADMIN');

            expect(component.folderNameText).toBe('Old Folder');
        });

        it('should call checkSaveRequirements', () => {
            const checkSaveRequirementsSpy = jest.spyOn(component, 'checkSaveRequirements');
            component.closeFolderStructureModal('_ADMIN');
            expect(checkSaveRequirementsSpy).toHaveBeenCalled();
        });
    });

    describe('ngOnInit', () => {
        let favoriteChange: SavableFavoriteChange;
        let folderFavoriteTreeService: FolderFavoriteTreeService;
        let favoriteTreeService: FavoriteTreeService;

        beforeEach(() => {
            folderFavoriteTreeService = TestBed.inject(FolderFavoriteTreeService);
            favoriteTreeService = TestBed.inject(FavoriteTreeService);

            favoriteChange = new FavoriteChange(new Report(), FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
            favoriteChange.savingUser = CoreFavoriteConstants.ADMIN;
            favoriteChange.value.id = 1234;

            component.favoriteChange = favoriteChange;
        });

        it('should initialize component and set folderNameText and loadedFolder', async () => {
            const folderName = 'Root Folder';
            jest.spyOn(component, 'getFolderNameText').mockResolvedValue(folderName);
            const checkSaveRequirementsSpy = jest.spyOn(component, 'checkSaveRequirements');

            await component.ngOnInit();

            expect(component.folderNameText).toBe(folderName);
            expect(component.loadedFolder).toBe(folderName);
            expect(checkSaveRequirementsSpy).toHaveBeenCalled();
        });

        it('should handle error when fetching folder name', async () => {
            jest.spyOn(component, 'getFolderNameText').mockRejectedValue('Error');
            const checkSaveRequirementsSpy = jest.spyOn(component, 'checkSaveRequirements');

            await component.ngOnInit();

            expect(component.folderNameText).toBe('');
            expect(component.loadedFolder).toBe('');
        });

        it('should set isEnterprisePermGroupEnabled and isEnterprisePermGroupRequired based on tokens', () => {
            TokenUtils.isFeatureEnabled = jest.fn().mockImplementation((token) => {
                if (token === TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS) {
                    return true;
                } else if (token === TokenConstants.EXPLORE_ENTERPRISE_PERM_TAGS_REQUIRED) {
                    return true;
                }
                return false;
            });

            component.ngOnInit();

            expect(component.isEnterprisePermGroupEnabled).toBe(undefined);
            expect(component.isEnterprisePermGroupRequired).toBe(true);
        });

        it('should set folderText based on isEnterprisePermGroupEnabled', () => {
            component.isEnterprisePermGroupEnabled = true;
            component.ngOnInit();
            expect(component.folderText).toBe('Folder');

            component.isEnterprisePermGroupEnabled = false;
            component.ngOnInit();
            expect(component.folderText).toBe(SaveDetailComponent.FOLDER_TEXT);
        });

        it('should set enterpriseDescriptionText based on favoriteChange.favoriteDisplayType', () => {
            component.favoriteChange.favoriteDisplayType = FavoriteDisplayEnum.REPORT;
            component.ngOnInit();
            expect(component.enterpriseDescriptionText).toBe("e.g. 'This Report will be used for...'. 140 characters max.");
        });

        it('should set selectedUser and selectedPermissionGroups based on favoriteChange', () => {
            component.favoriteChange.savingUser = 'user01';
            component.favoriteChange.userPermGrps = ['group1', 'group2'];
            component.ngOnInit();
            expect(component.selectedUser).toBe('user01');
            expect(component.selectedPermissionGroups).toEqual(['group1', 'group2']);
        });

        it('should call showFavoriteOwnerOptions', () => {
            const showFavoriteOwnerOptionsSpy = jest.spyOn(component, 'showFavoriteOwnerOptions');
            component.ngOnInit();
            expect(showFavoriteOwnerOptionsSpy).toHaveBeenCalled();
        });
    });
});
