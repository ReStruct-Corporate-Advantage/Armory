import {AuxButtonTypeEnum, AuxTextInput, AuxValuePairLabelPositionEnum} from '@blk/aladdin-angular-components';
import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {WorkspaceStore} from '../../../stores';
import {AppStore} from '../../../app.store';
import {Workspace} from '@models/workspace/workspace.model';
import {BehaviorSubject} from 'rxjs';
import {WorkspaceUtils} from '@utils/workspace.utils';
import {WorkspaceExportComposite} from '@models/export/export-composite/workspace-export-composite.model';
import {ExportDownloadingStatus} from '@interfaces/export-downloading-status.interface';
import {ExportUtils} from '@utils/export/export.utils';
import {
    CoreFavoriteConstants, CoreFavoriteUtils,
    SubscribableComponent
} from '@blk/explore-ui-core';
import {WorkspaceService} from '@services/workspace';

/**
 * Workspace Actions Component
 *
 * @example
 *  <app-workspace-actions></app-workspace-actions>
 */
@Component({
    selector: 'app-workspace-actions',
    templateUrl: './workspace-actions.component.html',
    styleUrls: ['./workspace-actions.component.scss']
})
export class WorkspaceActionsComponent extends SubscribableComponent implements OnInit {
    readonly AuxValuePairLabelPositionEnum = AuxValuePairLabelPositionEnum;
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;
    readonly CoreFavoriteConstants = CoreFavoriteConstants;
    coreFavoriteUtils = CoreFavoriteUtils;

    @ViewChild('workspaceNameField', {static: false}) workspaceNameField: AuxTextInput;
    workspace: Workspace;

    quickSaveButtonDisabled = false;
    editWorkspaceName = false;
    exportingInProgress: boolean;

    quickSaveLoadingStatus$: BehaviorSubject<boolean>;

    /**
     * constructor
     */
    constructor(private appStore: AppStore, private workspaceService: WorkspaceService, private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.quickSaveLoadingStatus$ =  this.appStore.quickSaveLoadingStatus$;
        WorkspaceStore.getWorkspace$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((workspace: Workspace) => {
                this.workspace = workspace;
            }
        );

        // Check if downloading is in progress for Workspace or not
        this.appStore.exportDownloadingStatus$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((downloadStatus: ExportDownloadingStatus) => {
            this.exportingInProgress = ExportUtils.isExportDownloadingStatusValid(downloadStatus) && downloadStatus.exportComposite instanceof WorkspaceExportComposite;
            this.changeDetectorRef.detectChanges();
        });
    }

    /**
     * It is triggered when workspace name field is shown/hidden.
     * If workspace name field is shown, the focus is set to it.
     */
    setEditWorkspaceName(edit: boolean): void {
        this.editWorkspaceName = edit;
        if (edit) {
            // This is done to make setting focus input to workspace name field async
            // as workspaceNameField will not be available in HTML dom until this function execution is finished
            setTimeout(() => {
                if (this.workspaceNameField) {
                    this.workspaceNameField.focusInput();
                }
            }, 0);
        }
    }

    /**
     * Method is triggered on clicking save button to Save Workspace changes
     */
    quickSaveWorkspace(): void {
        this.quickSaveButtonDisabled = true;
        this.editWorkspaceName = false;
        this.appStore.saveFavoriteAction$.next(WorkspaceUtils.getSaveWorkspaceActionObject(this.workspace, true , WorkspaceStore.refreshWorkspace));
    }

    /**
     * Method is triggered when workspace name field is updated
     */
    updateWorkspaceName(workspaceName: string): void {
        if (this.workspace.title !== workspaceName) {
            this.workspace.title = workspaceName;
        }
    }

    /**
     * Callback to load a favorite workspace version through the version log
     */
    loadWorkspaceVersion = (workspaceId: number|string, loadingMessage: string, forceRefresh?: boolean, isGlobalFavorite?: boolean, versionId?: string): void => {
        this.workspaceService.loadFavoriteWorkspaceVersion(workspaceId, loadingMessage, forceRefresh, isGlobalFavorite, versionId);
    }
}
