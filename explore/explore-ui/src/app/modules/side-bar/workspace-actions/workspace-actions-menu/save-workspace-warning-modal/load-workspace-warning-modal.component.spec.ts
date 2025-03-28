import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BehaviorSubject, of} from 'rxjs';
import {Workspace} from '@models/workspace/workspace.model';
import {WorkspaceStore} from '@stores/index';
import {AppStore} from '../../../../../app.store';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {FavoriteConstants} from '@constants/favorite.constants';
import {LoadWorkspaceWarningModalComponent} from './load-workspace-warning-modal.component';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {WorkspaceService} from '@services/workspace';
import {WorkspaceMenuItemsConstants} from '@constants/workspace-menu-items.constants';

describe('LoadWorkspaceWarningModalComponent', () => {
    let component: LoadWorkspaceWarningModalComponent;
    let fixture: ComponentFixture<LoadWorkspaceWarningModalComponent>;

    let workspace: Workspace;

    const appStoreStub = {
        saveFavoriteAction$: new BehaviorSubject(new SaveFavoriteAction(null, null, null, null, null, null)),
        openLoadFavoriteModal$: new BehaviorSubject(new LoadFavoriteAction(null))
    };
    const workspaceServiceStub = {
        loadFavoriteWorkspace: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [LoadWorkspaceWarningModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: AppStore, useValue: appStoreStub},
                {provide: WorkspaceService, useValue: workspaceServiceStub}]
        });

        WorkspaceStore.init();
        workspace = WorkspaceStore.getWorkspace();

        fixture = TestBed.createComponent(LoadWorkspaceWarningModalComponent);
        component = fixture.componentInstance;

        component.currentWorkspace = workspace;
        component.workspaceAction = null;


        fixture.detectChanges();
    });

    it('should create load workspace warning modal', () => {
        expect(component).toBeTruthy();
    });

    describe('Button Tests', () => {
        beforeEach(() => {
            workspace.id = 12345;
            workspace.title = 'TEST';
        });

        it('should save workspace', () => {

            jest.spyOn(component['appStore'].saveFavoriteAction$, 'next');
            component.openSaveWorkspaceModal();

            expect(component['appStore'].saveFavoriteAction$.next).toHaveBeenCalledWith(
                new SaveFavoriteAction(
                    component.currentWorkspace,
                    FavoriteConstants.WORKSPACE_PASCAL,
                    FavoriteConstants.WORKSPACE,
                    FavoriteConstants.WORKSPACE_FOLDER,
                    WorkspaceStore.refreshWorkspace
                ));
        });

        it('should load workspace', () => {
            component.workspaceAction = WorkspaceMenuItemsConstants.LABELS.LOAD_WORKSPACE;

            jest.spyOn(component.continueWithWorkspaceAction, 'emit');
            jest.spyOn(component.modalClosed, 'emit');

            component.onContinueClicked();

            expect(component.continueWithWorkspaceAction.emit).toHaveBeenCalledTimes(1);
            expect(component.continueWithWorkspaceAction.emit).toHaveBeenCalledWith(component.workspaceAction);
            expect(component.modalClosed.emit).toHaveBeenCalled();
        });
    });
});

