import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MultiLayerSaveSummaryModalComponent} from './multi-layer-save-summary-modal.component';
import {SaveSummariesStateValidationHandler} from './save-summaries-state-validation.handler';
import {AuxTextInputValueChangedDetailInterface} from '@blk/aladdin-web-components';
import {
    CoreFavoriteConstants,
    CoreUserMetaDataStore,
    FavoriteDisplayEnum,
    FavoriteType,
    UserMetaData
} from '@blk/explore-ui-core';
import {WorkspaceFavoriteChange} from '@models/favorite/workspace-favorite-change.model';
import {WorkpadFavoriteChange} from '@models/favorite/workpad-favorite-change.model';
import {SaveSummariesDisplayInfo} from './save-summaries-display-info.interface';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Workspace} from '@models/workspace/workspace.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {FavoriteChange} from '@models/favorite/favorite-change.model';
import {Report} from '@models/workspace/report.model';
import {ColumnSet} from '@blk/explore-ui-column-option';

describe('SaveSummariesModalComponent', () => {
    let component: MultiLayerSaveSummaryModalComponent<any>;
    let fixture: ComponentFixture<MultiLayerSaveSummaryModalComponent<any>>;

    const saveSummariesStateValidationHandlerStub = {
        initializeChangeDetailsValidation: jest.fn(),
        isSavable: jest.fn(() => true)
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MultiLayerSaveSummaryModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).overrideComponent(MultiLayerSaveSummaryModalComponent, {
            set: {
                providers: [
                    { provide: SaveSummariesStateValidationHandler, useValue: saveSummariesStateValidationHandlerStub }
                ]
            }
        })
            .compileComponents();

        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.login = 'seakim';
        fixture = TestBed.createComponent(MultiLayerSaveSummaryModalComponent);
        component = fixture.componentInstance;
        component.favoritesTree = new WorkspaceFavoriteChange(new Workspace());
        component.favoritesTree.savingUser = '_ADMIN';

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should initialize displayInfo for WorkspaceFavoriteChange', () => {
            const workspaceChange = new WorkspaceFavoriteChange(new Workspace());
            component.favoritesTree = workspaceChange;
            jest.spyOn(component, 'initializeWorkspaceInfoToDisplay' as any).mockReturnValue({} as SaveSummariesDisplayInfo);

            component.ngOnInit();

            expect(component['initializeWorkspaceInfoToDisplay']).toHaveBeenCalledWith(workspaceChange);
        });

        it('should initialize displayInfo for WorkpadFavoriteChange', () => {
            const reportChange = new FavoriteChange(new ColumnSet(), FavoriteDisplayEnum.COLUMN_SET, FavoriteType.REPORT);
            component.favoritesTree = reportChange;
            jest.spyOn(component, 'initializeReportInfoToDisplay' as any).mockReturnValue({} as SaveSummariesDisplayInfo);

            component.ngOnInit();

            expect(component['initializeReportInfoToDisplay']).toHaveBeenCalledWith(reportChange);
        });
    });

    describe('updateChangeSummariesOnSave', () => {
        it('should update favorites tree and close modal', () => {
            jest.spyOn(component, 'updateFavoritesTreeWithSaveSummary' as any);
            jest.spyOn(component, 'closeModal' as any);

            component.updateChangeSummariesOnSave();

            expect(component['updateFavoritesTreeWithSaveSummary']).toHaveBeenCalled();
            expect(component['closeModal']).toHaveBeenCalledWith(true);
        });
    });

    describe('changeSummaryUpdated', () => {
        it('should update save button state and displayInfo changeSummary', () => {
            const displayInfo: SaveSummariesDisplayInfo = { changeSummary: '', nestedChanges: [] } as SaveSummariesDisplayInfo;
            const event: CustomEvent<AuxTextInputValueChangedDetailInterface> = {
                detail: { value: 'New Summary' }
            } as CustomEvent<AuxTextInputValueChangedDetailInterface>;

            component.changeSummaryUpdated(displayInfo, event);

            expect(component.saveButtonDisabled$.value).toBe(false);
            expect(displayInfo.changeSummary).toBe('New Summary');
        });
    });

    describe('initializeWorkspaceInfoToDisplay', () => {
        it('should create and return workspace info', () => {
            const workspaceChange = new WorkspaceFavoriteChange(new Workspace());
            workspaceChange.savingUser = '_ADMIN';
            workspaceChange.isSelected = true;
            const result = component['initializeWorkspaceInfoToDisplay'](workspaceChange);

            expect(result).toBeTruthy();
        });
    });

    describe('initializeWorkpadInfoToDisplay', () => {
        it('should create and return workpad info', () => {
            const workpadChange = new WorkpadFavoriteChange(new FlatWorkpad({portfolio: {fullName: 'SNP500'}}));
            const result = component['initializeWorkpadInfoToDisplay'](workpadChange);

            expect(result).toBeNull();
        });
    });

    describe('initializeReportInfoToDisplay', () => {
        it('should create and return report info', () => {
            const reportChange = new FavoriteChange(new Report(), FavoriteDisplayEnum.REPORT, FavoriteType.LAYOUT);
            reportChange.savingUser = '_ADMIN';
            reportChange.isSelected = false;
            const result = component['initializeReportInfoToDisplay'](reportChange);

            expect(result).toBeNull();
        });
    });

    describe('initializeNestedChangeInfoToDisplay', () => {
        it('should create and return nested change info', () => {
            const nestedChange = new FavoriteChange(new ColumnSet(), FavoriteDisplayEnum.COLUMN_SET, FavoriteType.REPORT);
            nestedChange.savingUser = '_ADMIN';
            nestedChange.isSelected = false;
            const result = component['initializeNestedChangeInfoToDisplay'](nestedChange);

            expect(result).toBeUndefined();
        });
    });

    describe('createDisplayInfo', () => {
        it('should create and return display info', () => {
            const change = new FavoriteChange(new ColumnSet(), FavoriteDisplayEnum.COLUMN_SET, FavoriteType.REPORT);
            const result = component['createDisplayInfo'](change);

            expect(result).toBeTruthy();
        });
    });

    describe('isEnterpriseFavorite', () => {
        it('should return true for enterprise favorite', () => {
            const result = component['isEnterpriseFavorite'](CoreFavoriteConstants.ADMIN);

            expect(result).toBe(true);
        });

        it('should return false for non-enterprise favorite', () => {
            const result = component['isEnterpriseFavorite']('seakim');

            expect(result).toBe(false);
        });
    });

    describe('updateFavoritesTreeWithSaveSummary', () => {
        it('should update favorites tree with save summary', () => {
            const displayInfo: SaveSummariesDisplayInfo = {
                changeSummary: 'Summary',
                nestedChanges: []
            } as SaveSummariesDisplayInfo;

            component['updateFavoritesTreeWithSaveSummary'](displayInfo);

            expect(displayInfo.changeSummary).toBe('Summary');
        });
    });
});
