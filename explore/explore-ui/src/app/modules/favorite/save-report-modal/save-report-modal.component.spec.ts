import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SaveReportModalComponent} from './save-report-modal.component';
import {FavoriteChangeDetectionService} from '@services/favorite-change-detection/favorite-change-detection.service';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Report} from '@models/workspace/report.model';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {
    CoreDefinitionStore,
    CoreFavoriteConstants,
    CoreUserMetaDataStore,
    Favorite,
    FavoriteDisplayEnum,
    FavoriteType,
    UserMetaData
} from '@blk/explore-ui-core';
import {WorkspaceStore} from '@stores/workspace.store';
import {
    FolderFavoriteTreeService
} from '../nested-favorite-changes/save-detail/folder-structure-modal/folder-favorite-tree.service';
import {FavoriteStore} from '@stores/favorite.store';
import {getChangedReportFavoritesTreeMock} from '../service/bulk-saving-handler.service.spec';
import {BulkSavingHandlerService} from '../service/bulk-saving-handler.service';
import {NotificationService} from '@services/notification';
import {of} from 'rxjs';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {SaveFavoriteVersionDetailsAndSummary} from '../../../models/favorite-version/favorite-version-log.interface';


describe('SaveReportModalComponent', () => {
    let component: SaveReportModalComponent;
    let fixture: ComponentFixture<SaveReportModalComponent>;

    const favoriteChangeDetectionServiceMock = new FavoriteChangeDetectionService();

    const report = new Report();
    report.id = 13270;
    report.owner = '_GLOBAL';
    report.title = '1test-permissioning';

    const saveSummaryData: SaveFavoriteVersionDetailsAndSummary = {
        changeSummaryDetails: 'short Summary',
        changeSummary: 'Long Summary'
    };

    WorkspaceStore.init();
    WorkspaceStore.currentReport$.next(report);

    beforeEach(async () => {
        const bulkSavingHandlerServiceStub = {
            getAllSlimFavorites$: jest.fn().mockReturnValue(of([])),
            saveChanges$: jest.fn().mockReturnValue(of({savablesInOrder: [], index: 0, failedRequestItems: []}))
        };
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule], // Add HttpClientTestingModule here
            declarations: [SaveReportModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: FavoriteChangeDetectionService, useValue: favoriteChangeDetectionServiceMock},
                {provide: BulkSavingHandlerService, useValue: bulkSavingHandlerServiceStub},
                FolderFavoriteTreeService,
                NotificationService
            ]
        })
            .compileComponents();

        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.access = true;
        CoreUserMetaDataStore.userMetaData.pricePopupAccess = true;
        CoreUserMetaDataStore.userMetaData.launchApps = ['SECURITY_MASTER', 'ANSER', 'ALADDIN_VIEW'];
        CoreUserMetaDataStore.userMetaData.login = 'seakim';
        CoreUserMetaDataStore.userMetaData.globalFavPerms = true;
        CoreUserMetaDataStore.userMetaData.perfDataPerms = true;
        CoreUserMetaDataStore.userMetaData.sharedFavPerms = true;

        fixture = TestBed.createComponent(SaveReportModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should set favoriteDescription in changedFavoritesTree for global permissioning feature', () => {
        CoreDefinitionStore.tokens['enableTemplatePermissioning'] = 'true';

        const globalLayoutFavorite = new Favorite();
        globalLayoutFavorite.id = 13270;
        globalLayoutFavorite.owner = '_GLOBAL';
        globalLayoutFavorite.title = '1test-permissioning';
        globalLayoutFavorite.tool = 'Explore_BETA';
        globalLayoutFavorite.type = 'LAYOUT';
        globalLayoutFavorite.description = 'Token:ExploreESGDataAPIEnabled';

        FavoriteStore.slimFavCache.set('_GLOBAL,LAYOUT', [globalLayoutFavorite]);

        component.changedFavoritesTree = new FavoriteChange(report, FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT, true);

        component.ngOnInit();

        expect(component.changedFavoritesTree.favoriteDescription).toBe('Token:ExploreESGDataAPIEnabled');
    });

    it('should call favorite change detection service', () => {
        const reportFavoriteChange = getChangedReportFavoritesTreeMock();

        const getReportChangedFavoritesTreeMock = jest.fn().mockReturnValue(reportFavoriteChange);
        favoriteChangeDetectionServiceMock.getReportChangedFavoritesTree = getReportChangedFavoritesTreeMock;

        component.ngOnInit();
        expect(getReportChangedFavoritesTreeMock).toHaveBeenCalledTimes(1);
    });

    it('should close modal', () => {
        const modalClosedSpy = jest.spyOn(component.modalClosed, 'emit');

        component.closeModal();

        expect(modalClosedSpy).toHaveBeenCalledTimes(1);
    });

    it('should display warning modal if doing SAVE as ADMIN', () => {
        jest.spyOn(component, 'saveChanges' as any).mockReturnValue(null);

        CoreUserMetaDataStore.userMetaData.sharedFavPerms = true;

        report.owner = CoreFavoriteConstants.ADMIN;
        component.changedFavoritesTree = new FavoriteChange(report, FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT, true);

        component.validateSelectionAndSave();
        expect(component.isAdminOverwriteWarning).toEqual(true);
        expect(component['saveChanges']).not.toHaveBeenCalled();
    });

    it('should close Save Admin warning modal and proceed with saving', () => {
        jest.spyOn(component, 'openSaveSummaryModalIfApplicable' as any).mockReturnValue(null);

        CoreUserMetaDataStore.userMetaData.sharedFavPerms = true;

        report.owner = CoreFavoriteConstants.ADMIN;
        component.changedFavoritesTree = new FavoriteChange(report, FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT, true);
        component.isAdminOverwriteWarning = true;

        component.closeAdminOverwriteDialog(true);

        expect(component.isAdminOverwriteWarning).toEqual(false);
        expect(component['openSaveSummaryModalIfApplicable']).toHaveBeenCalled();
    });
});



