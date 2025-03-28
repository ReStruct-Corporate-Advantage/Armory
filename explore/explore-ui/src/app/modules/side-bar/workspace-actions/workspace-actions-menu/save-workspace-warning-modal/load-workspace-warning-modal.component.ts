import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ModalDirective} from '@blk/explore-ui-core';
import {CommonConstants} from '@constants/common.constants';
import {Workspace} from '@models/workspace/workspace.model';
import {AppStore} from '../../../../../app.store';
import {WorkspaceUtils} from '@utils/workspace.utils';
import {WorkspaceStore} from '@stores/workspace.store';

/**
 * Load Workspace Warning Modal appears when user clicks new or load workspace in menu as a warning to save workspace before continuing.
 */
@Component({
    selector: 'app-load-workspace-warning-modal',
    templateUrl: './load-workspace-warning-modal.component.html',
    styleUrls: ['./load-workspace-warning-modal.component.scss']
})
export class LoadWorkspaceWarningModalComponent extends ModalDirective implements OnInit {

    readonly BUTTON_TEXT = CommonConstants.BUTTON_TEXT;

    // Whether user clicked on "New Workspace" or "Load Workspace"
    @Input() workspaceAction: string;

    // Outputs when user wishes to continue with the workspaceAction
    @Output() continueWithWorkspaceAction = new EventEmitter<string>();

    currentWorkspace: Workspace;

    constructor(private appStore: AppStore) {
        super();
    }

    ngOnInit() {
        this.currentWorkspace = WorkspaceStore.getWorkspace();
    }

    openSaveWorkspaceModal(): void {
        this.appStore.saveFavoriteAction$.next(WorkspaceUtils.getSaveWorkspaceActionObject(WorkspaceStore.getWorkspace(), false, WorkspaceStore.refreshWorkspace));
        this.closeModal();
    }

    onContinueClicked(): void {
        this.continueWithWorkspaceAction.emit(this.workspaceAction);
        this.closeModal();
    }
}
