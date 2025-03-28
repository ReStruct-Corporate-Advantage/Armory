import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SaveWorkspaceModalComponent} from './save-workspace-modal.component';
import {
    CoreDefinitionStore,
    CoreFavoriteConstants,
    CoreUserMetaDataStore,
    FavoriteDisplayEnum,
    FavoriteType,
    TokenConstants,
    TokenUtils,
    UserMetaData
} from '@blk/explore-ui-core';
import {WorkspaceStore} from '@stores/workspace.store';
import {FavoriteChangeDetectionService} from '@services/favorite-change-detection/favorite-change-detection.service';
import {ReportGroup} from '@models/workspace/report-group.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WorkspaceFavoriteChange} from '@models/favorite/workspace-favorite-change.model';
import {WorkpadFavoriteChange} from '@models/favorite/workpad-favorite-change.model';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BulkSavingHandlerService} from '../service/bulk-saving-handler.service';
import {
    FolderFavoriteTreeService
} from '../nested-favorite-changes/save-detail/folder-structure-modal/folder-favorite-tree.service';
import {NotificationService} from '@services/notification';
import {of} from 'rxjs';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {CustomSector} from '@blk/explore-ui-breakdown';
import {Report} from '@models/workspace/report.model';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {Workspace} from '../../../models/workspace/workspace.model';

describe('SaveWorkspaceModalComponent', () => {
    let component: SaveWorkspaceModalComponent;
    let fixture: ComponentFixture<SaveWorkspaceModalComponent>;

    let favoriteChangeDetectionServiceMock;

    let flatWorkpad: FlatWorkpad;
    let reportGroup: ReportGroup;

    let mockChangedWorkspaceFavoritesTree: WorkspaceFavoriteChange;

    beforeEach(async () => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.login = 'user01';

        WorkspaceStore.init();
        flatWorkpad = new FlatWorkpad();
        flatWorkpad.portfolio = new Portfolio('SNP500', undefined, false, 'S&P 500 Index');
        reportGroup = new ReportGroup();
        reportGroup.title = 'Equity Report Group';
        WorkspaceStore.addWorkpads([flatWorkpad, reportGroup]);
        WorkspaceStore.getWorkspace().owner = '_ADMIN';
        jest.spyOn(TokenUtils, 'isFeatureEnabled').mockReturnValue(true);
        mockChangedWorkspaceFavoritesTree = new WorkspaceFavoriteChange(WorkspaceStore.getWorkspace());
        mockChangedWorkspaceFavoritesTree.nestedChanges = [new WorkpadFavoriteChange(flatWorkpad), new WorkpadFavoriteChange(reportGroup)];

        favoriteChangeDetectionServiceMock = new FavoriteChangeDetectionService();
        favoriteChangeDetectionServiceMock.getWorkspaceChangedFavoritesTree = jest.fn().mockReturnValue(mockChangedWorkspaceFavoritesTree);

        const bulkSavingHandlerServiceStub = {
            getAllSlimFavorites$: jest.fn().mockReturnValue(of([])),
            saveChanges$: jest.fn().mockReturnValue(of())
        };

        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule], // Add HttpClientTestingModule here
            declarations: [SaveWorkspaceModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: FavoriteChangeDetectionService, useValue: favoriteChangeDetectionServiceMock},
                {provide: BulkSavingHandlerService, useValue: bulkSavingHandlerServiceStub},
                FolderFavoriteTreeService,
                NotificationService
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(SaveWorkspaceModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should display full ticker and portfolio name for flat workpad', () => {
        expect(component.getWorkpadName(flatWorkpad)).toEqual('SNP500');
    });

    it('should display Report Group name for Report Group', () => {
        expect(component.getWorkpadName(reportGroup)).toEqual('Equity Report Group');
    });

    it('should update the selected workpad', () => {
        expect(component.selectedWorkpadIndex).toEqual(0);
        expect(component.selectedWorkpadChange.value).toEqual(flatWorkpad);
        component.onWorkpadChanged(1);
        expect(component.selectedWorkpadIndex).toEqual(1);
        expect(component.selectedWorkpadChange.value).toEqual(reportGroup);
    });

    it('should unselect nested changes when toggled off after clicking Submit', () => {
        const columnSetChange = new FavoriteChange(new ColumnSet(), FavoriteDisplayEnum.COLUMN_SET, FavoriteType.REPORT);
        const reportChange = new FavoriteChange(new Report(), FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
        reportChange.nestedChanges = [columnSetChange];
        mockChangedWorkspaceFavoritesTree.nestedChanges[0].modifiedReports.push(reportChange);

        const portFilterChange = new FavoriteChange(new CustomSector(), FavoriteDisplayEnum.FILTER, FavoriteType.CUSTOM_SEC);
        mockChangedWorkspaceFavoritesTree.nestedChanges[0].nestedChanges.push(portFilterChange);

        component.changedFavoritesTree = mockChangedWorkspaceFavoritesTree;
        component.changedFavoritesTree.isSaveNested = false;

        expect(mockChangedWorkspaceFavoritesTree.nestedChanges[0].modifiedReports[0].nestedChanges[0].isSelected).toEqual(true);
        expect(mockChangedWorkspaceFavoritesTree.nestedChanges[0].modifiedReports[0].isSelected).toEqual(true);
        expect(mockChangedWorkspaceFavoritesTree.nestedChanges[0].nestedChanges[0].isSelected).toEqual(true);

        component.validateSelectionAndSave();

        expect(mockChangedWorkspaceFavoritesTree.nestedChanges[0].modifiedReports[0].nestedChanges[0].isSelected).toEqual(false);
        expect(mockChangedWorkspaceFavoritesTree.nestedChanges[0].modifiedReports[0].isSelected).toEqual(false);
        expect(mockChangedWorkspaceFavoritesTree.nestedChanges[0].nestedChanges[0].isSelected).toEqual(false);
    });

    it('returns false when perm groups are not required', () => {
        CoreDefinitionStore.tokens = [
            {[TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS]: 'Y'},
            {[TokenConstants.EXPLORE_ENTERPRISE_PERM_TAGS_REQUIRED]: 'N'},
        ];
        expect(component['isPermGroupsRequirementsFailed']()).toBe(false);
    });

    it('returns false when all changes meet enterprise perm group requirement', () => {
        CoreDefinitionStore.tokens = [
            {[TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS]: 'Y'},
            {[TokenConstants.EXPLORE_ENTERPRISE_PERM_TAGS_REQUIRED]: 'Y'},
        ];

        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.userPermissionGroups = ['apg-rio'];
        CoreUserMetaDataStore.userMetaData.enterpriseFavPerms = true;

        const workspaceChange = new WorkspaceFavoriteChange(new Workspace());
        workspaceChange.savingUser = CoreFavoriteConstants.ADMIN;
        workspaceChange.isSelected = true;
        workspaceChange.userPermGrps = ['apg-rio'];
        const workpadChange = new WorkpadFavoriteChange(new FlatWorkpad());
        workspaceChange.nestedChanges = [workpadChange];
        const reportChange = new FavoriteChange(new Report(), FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
        reportChange.savingUser = CoreFavoriteConstants.ADMIN;
        reportChange.isSelected = true;
        reportChange.userPermGrps = ['apg-rio'];
        workpadChange.modifiedReports = [reportChange];

        component.changedFavoritesTree = workspaceChange;

        expect(component['isPermGroupsRequirementsFailed']()).toBe(false);
    });

    it('returns true when any nested change does not meet enterprise perm group requirement', () => {
        CoreDefinitionStore.tokens = [
            {[TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS]: 'Y'},
            {[TokenConstants.EXPLORE_ENTERPRISE_PERM_TAGS_REQUIRED]: 'Y'},
        ];

        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.userPermissionGroups = ['apg-rio'];
        CoreUserMetaDataStore.userMetaData.enterpriseFavPerms = true;

        const workspaceChange = new WorkspaceFavoriteChange(new Workspace());
        workspaceChange.savingUser = CoreFavoriteConstants.ADMIN;
        workspaceChange.isSelected = true;
        workspaceChange.userPermGrps = ['apg-rio'];
        const workpadChange = new WorkpadFavoriteChange(new FlatWorkpad());
        workspaceChange.nestedChanges = [workpadChange];
        const reportChange = new FavoriteChange(new Report(), FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
        reportChange.savingUser = CoreFavoriteConstants.ADMIN;
        reportChange.isSelected = true;
        reportChange.userPermGrps = [];
        workpadChange.modifiedReports = [reportChange];

        component.changedFavoritesTree = workspaceChange;

        expect(component['isPermGroupsRequirementsFailed']()).toBe(true);
    });

    it('returns true when enterprise perm group requirement is not met at root level', () => {
        CoreDefinitionStore.tokens = [
            {[TokenConstants.EXPLORE_ENABLE_ENTERPRISE_TAGS]: 'Y'},
            {[TokenConstants.EXPLORE_ENTERPRISE_PERM_TAGS_REQUIRED]: 'Y'},
        ];

        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.userPermissionGroups = ['apg-rio'];
        CoreUserMetaDataStore.userMetaData.enterpriseFavPerms = true;

        const workspaceChange = new WorkspaceFavoriteChange(new Workspace());
        workspaceChange.savingUser = CoreFavoriteConstants.ADMIN;
        workspaceChange.isSelected = true;
        workspaceChange.userPermGrps = [];
        const workpadChange = new WorkpadFavoriteChange(new FlatWorkpad());
        workspaceChange.nestedChanges = [workpadChange];
        const reportChange = new FavoriteChange(new Report(), FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
        reportChange.savingUser = CoreFavoriteConstants.ADMIN;
        reportChange.isSelected = true;
        reportChange.userPermGrps = ['apg-rio'];
        workpadChange.modifiedReports = [reportChange];

        component.changedFavoritesTree = workspaceChange;

        expect(component['isPermGroupsRequirementsFailed']()).toBe(true);
    });
});
