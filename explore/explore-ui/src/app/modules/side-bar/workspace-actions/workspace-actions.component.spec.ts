import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {BehaviorSubject, of} from 'rxjs';

import {WorkspaceActionsComponent} from './workspace-actions.component';
import {Workspace} from '@models/workspace/workspace.model';
import {WorkspaceStore} from '../../../stores';
import {AppStore} from '../../../app.store';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {WorkspaceExportComposite} from '@models/export/export-composite/workspace-export-composite.model';
import {ExportDownloadingStatus} from '@interfaces/export-downloading-status.interface';
import {FavoriteConstants} from '@constants/favorite.constants';
import {By} from '@angular/platform-browser';
import {WorkspaceService} from '@services/workspace';

describe('WorkspaceActionsComponent', () => {
    let component: WorkspaceActionsComponent;
    let fixture: ComponentFixture<WorkspaceActionsComponent>;
    let auxTextInput: AuxTextInputStubComponent;

    const appStoreStub = {
        saveFavoriteAction$: new BehaviorSubject(new SaveFavoriteAction(null, null, null, null, null, null))
    };

    const workspaceServiceStub = {
        loadFavoriteWorkspaceVersion: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WorkspaceActionsComponent, AuxTextInputStubComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{provide: AppStore, useValue: appStoreStub}, {provide: WorkspaceService, useValue: workspaceServiceStub}]
        });

        WorkspaceStore.init();

        fixture = TestBed.createComponent(WorkspaceActionsComponent);
        component = fixture.componentInstance;
        auxTextInput = TestBed.createComponent(AuxTextInputStubComponent).componentInstance;
        auxTextInput.ngOnInit();
        component.editWorkspaceName = true;
        component.workspaceNameField = auxTextInput;
        component['appStore'].exportDownloadingStatus$ = new BehaviorSubject<ExportDownloadingStatus>(null);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Test isExportIcon Visible', () => {
        component['appStore'].exportDownloadingStatus$.next({downloadInProgress: true, exportComposite: new WorkspaceExportComposite()});
        expect(component.exportingInProgress).toBeTruthy();
        component['appStore'].exportDownloadingStatus$.next(undefined);
        expect(component.exportingInProgress).toBeFalsy();
    });

    it('Test Set Edit Workspace Name', fakeAsync(() => {
        component.workspaceNameField = {focusInput: jest.fn()} as any;
        jest.spyOn(component.workspaceNameField, 'focusInput');
        component.setEditWorkspaceName(false);
        expect(component.editWorkspaceName).toBeFalsy();
        component.setEditWorkspaceName(true);
        expect(component.editWorkspaceName).toBeTruthy();
        tick(0);
        expect(component.workspaceNameField.focusInput).toHaveBeenCalled();
    }));

    describe('quickSaveWorkspace Test', () => {
        beforeEach(() => {
            component.workspace = new Workspace();
        });

        it('should quick save workspace', () => {
            component.workspace.id = 12345;

            jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(component.workspace);
            jest.spyOn(component['appStore'].saveFavoriteAction$, 'next');
            component.quickSaveWorkspace();

            expect(component.quickSaveButtonDisabled).toBeTruthy();
            expect(component.editWorkspaceName).toBeFalsy();
            expect(component['appStore'].saveFavoriteAction$.next).toHaveBeenCalledWith(
                new SaveFavoriteAction(
                    component.workspace,
                    FavoriteConstants.WORKSPACE_PASCAL,
                    FavoriteConstants.WORKSPACE,
                    FavoriteConstants.WORKSPACE_FOLDER,
                    WorkspaceStore.refreshWorkspace,
                    'QUICK_SAVE'
                ));
        });

        it('should NOT quick save and open the save modal if workspace does not have an id', () => {
            jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(component.workspace);
            jest.spyOn(component['appStore'].saveFavoriteAction$, 'next');
            component.quickSaveWorkspace();

            expect(component['appStore'].saveFavoriteAction$.next).toHaveBeenCalledWith(
                new SaveFavoriteAction(
                    component.workspace,
                    FavoriteConstants.WORKSPACE_PASCAL,
                    FavoriteConstants.WORKSPACE,
                    FavoriteConstants.WORKSPACE_FOLDER,
                    WorkspaceStore.refreshWorkspace
                ));
        });
    });


    it('Test update workspace name', () => {
        const workspace = new Workspace();
        const getWorkspaceMock = jest.fn();
        WorkspaceStore.getWorkspace$ = getWorkspaceMock.bind(WorkspaceStore);
        getWorkspaceMock.mockReturnValue(
            of(workspace)
        );
        component.ngOnInit();
        component.updateWorkspaceName('Test');
        expect(component.workspace.title).toEqual('Test');
    });

    it('should display workspace owner when opening a saved workspace', () => {
        const workspace = new Workspace();
        workspace.title = 'example workspace';
        workspace.owner = 'tilee';
        const getWorkspaceMock = jest.fn();
        WorkspaceStore.getWorkspace$ = getWorkspaceMock.bind(WorkspaceStore);
        getWorkspaceMock.mockReturnValue(
            of(workspace)
        );
        expect(fixture.debugElement.query(By.css('.workspace-author'))).toBeFalsy();
        component.ngOnInit();
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.workspace-author'))).toBeTruthy();
    });

    it('should display workspace owner name as Enterprise for Admin User', () => {
        const workspace = new Workspace();
        workspace.owner = '_ADMIN';
        const getWorkspaceMock = jest.fn();
        WorkspaceStore.getWorkspace$ = getWorkspaceMock.bind(WorkspaceStore);
        getWorkspaceMock.mockReturnValue(
            of(workspace)
        );
        component.ngOnInit();
        expect(workspace.getUserGroup()).toEqual('Enterprise');
    });

    it('should display workspace owner name as Aladdin for GLOBAL User', () => {
        const workspace = new Workspace();
        workspace.owner = '_GLOBAL';
        const getWorkspaceMock = jest.fn();
        WorkspaceStore.getWorkspace$ = getWorkspaceMock.bind(WorkspaceStore);
        getWorkspaceMock.mockReturnValue(
            of(workspace)
        );
        component.ngOnInit();
        expect(workspace.getUserGroup()).toEqual('Aladdin');
    });

    it('should display current user name as workspace owner name for  other user', () => {
        const workspace = new Workspace();
        workspace.owner = 'current user';
        const getWorkspaceMock = jest.fn();
        WorkspaceStore.getWorkspace$ = getWorkspaceMock.bind(WorkspaceStore);
        getWorkspaceMock.mockReturnValue(
            of(workspace)
        );
        component.ngOnInit();
        expect(workspace.getUserGroup()).toEqual('current user');
    });

    it('Test loadWorkspaceVersion', () => {
        workspaceServiceStub.loadFavoriteWorkspaceVersion.mockReturnValue(null);
        component.loadWorkspaceVersion(12345, 'Loading Workspace', false, false);
        expect(workspaceServiceStub.loadFavoriteWorkspaceVersion).toHaveBeenCalled();
    });

});

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'aux-text-input',
    template: `
        <p>Input</p>>
    `
})
class AuxTextInputStubComponent implements OnInit {

    element: any;
    nativeElement: any;

    ngOnInit() {
        this.element = {
            nativeElement: {
                focusInput: jest.fn()
            }
        };
    }

}
