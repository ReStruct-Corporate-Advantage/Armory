import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {AuxInlineMenuItemClickedDetailInterface} from '@blk/aladdin-angular-components';
import {
    CoreFavoriteConstants, CoreFavoriteStore, CoreFavoriteUtils,
    CoreFavoriteVersioningStore,
    CoreUserMetaDataStore, FavoriteStatus,
    FavoriteType,
    MenuOptionsParameters,
    SubscribableComponent,
    TelemetryActionConstants,
    TelemetryService,
    TokenConstants,
    TokenUtils
} from '@blk/explore-ui-core';
import {FavoriteConstants} from '@constants/favorite.constants';
import {ExportConfig} from '@interfaces/export-config.interface';
import {WorkspaceExportComposite} from '@models/export/export-composite/workspace-export-composite.model';
import {PDFExportConfig} from '@models/export/pdf-export-config.model';
import {WorkpadExcelExportConfig} from '@models/export/workpad-excel-export-config.model';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {Workspace} from '@models/workspace/workspace.model';
import {BatchReportingService} from '@services/batch-reporting/batch-reporting.service';
import {FavoriteChangeDetectionService} from '@services/favorite-change-detection/favorite-change-detection.service';
import {LoadAllService} from '@services/load-all/load-all.service';
import {WorkspaceUtils} from '@utils/workspace.utils';
import {ClipboardService} from 'ngx-clipboard';
import {takeUntil} from 'rxjs/operators';
import {AppStore} from '../../../../app.store';
import {URLConstants, UserPreference, WorkspaceMenuItemsConstants} from '../../../../constants';
import {NotificationService, WorkspaceService} from '../../../../shared/services';
import {UserMetaDataStore, WorkspaceStore} from '../../../../stores';
import {ExportOptionsModalComponent} from '../../../export/export-options-modal/export-options-modal.component';

/**
 * Workspace Actions Menu Component
 *
 * @example
 *  <app-workspace-actions-menu (renameWorkspace)="setEditWorkspaceName(true)"></app-workspace-actions-menu>
 */
@Component({
    selector: 'app-workspace-actions-menu',
    templateUrl: './workspace-actions-menu.component.html'
})
export class WorkspaceActionsMenuComponent extends SubscribableComponent implements OnInit {
    @Output() renameWorkspace = new EventEmitter();

    @ViewChild(ExportOptionsModalComponent, {static: false})
    exportOptionsModalComponent: ExportOptionsModalComponent;

    clickedMenuItem: string;

    // aux-inline-menu data
    menuOptions: any;

    // export
    exportConfig: ExportConfig;

    isLoadWorkspaceWarningModalOpen = false;

    /**
     * constructor
     */
    constructor(private notificationService: NotificationService, private appStore: AppStore, private workspaceService: WorkspaceService, private loadAllService: LoadAllService, private clipboardService: ClipboardService, private favoriteChangeDetectionService: FavoriteChangeDetectionService) {
        super();
    }

    closeLoadWorkspaceWarningModal(): void {
        this.isLoadWorkspaceWarningModalOpen = false;
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        this.updateMenuOptions();
        this.loadAllService.workspacePercentLoaded$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((workspacePercentLoaded) => {
            // if the load all is in progress then update the title with workspace percentage loaded
            if (LoadAllService.loadAllInProgress) {
                this.menuOptions[0].splice(2, 1, {
                    label: WorkspaceMenuItemsConstants.LABELS.RUN_ALL_REPORTS + workspacePercentLoaded,
                    isDisabled: true
                });
            } else {
                // restore the title once complete workspace has loaded
                this.menuOptions[0].splice(2, 1, {
                    label: WorkspaceMenuItemsConstants.LABELS.RUN_ALL_REPORTS,
                    isDisabled: false
                });
            }
            this.menuOptions = [...this.menuOptions];
        });
    }

    /**
     * Opens unsaved changes warning modal if the user has unsaved changes
     * @param clickedMenuItem New Workspace or Load Workspace clicked
     */
    checkForUnsavedChanges(clickedMenuItem: string): boolean {
        const currentWorkspace = WorkspaceStore.getWorkspace();
        // do not open modal if user is on app default homepage (empty workspace, no workpads)
        if (!currentWorkspace.workpads.length) {
            return false;
        }

        // do not open modal if user has not modified a saved workspace
        if (currentWorkspace.id && this.favoriteChangeDetectionService.getWorkspaceChangedFavoritesTree(currentWorkspace, []).getChangesCount() === 0) {
            return false;
        }

        this.clickedMenuItem = clickedMenuItem;
        this.isLoadWorkspaceWarningModalOpen = true;
        return true;
    }

    /**
     * Method is triggered when any of menu is clicked/selected
     */
    onMenuClicked(event: CustomEvent<AuxInlineMenuItemClickedDetailInterface>): void {
        const menuAction = event.detail.element.label;
        switch (menuAction) {

            case WorkspaceMenuItemsConstants.LABELS.RENAME:
                this.renameWorkspace.emit();
                break;

            case WorkspaceMenuItemsConstants.LABELS.RUN_ALL_REPORTS:
                this.loadAllWorkspace();
                break;

            case WorkspaceMenuItemsConstants.LABELS.UPDATE_STATUS:
                CoreFavoriteStore.favStatusUpdateAction$.next({favorite: WorkspaceStore.getWorkspace(), favoriteType:  FavoriteConstants.WORKSPACE});
                break;
            case WorkspaceMenuItemsConstants.LABELS.LOAD_WORKSPACE:
            case WorkspaceMenuItemsConstants.LABELS.NEW_WORKSPACE:
                const changesExist = this.checkForUnsavedChanges(menuAction);
                if (!changesExist) {
                    this.executeWorkspaceAction(menuAction);
                }
                break;

            case WorkspaceMenuItemsConstants.LABELS.SAVE_WORKSPACE:
                this.appStore.saveFavoriteAction$.next(WorkspaceUtils.getSaveWorkspaceActionObject(WorkspaceStore.getWorkspace(), false, WorkspaceStore.refreshWorkspace));
                break;

            case WorkspaceMenuItemsConstants.LABELS.DELETE_WORKSPACE:
                this.appStore.deleteFavoriteAction$.next(WorkspaceUtils.getDeleteWorkspaceActionObject(WorkspaceStore.getWorkspace(), WorkspaceStore.refreshWorkspace));
                break;

            case WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_PDF:
                this.exportWorkspace(new PDFExportConfig());
                break;

            case WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_EXCEL:
                this.exportWorkspace(new WorkpadExcelExportConfig());
                break;

            case WorkspaceMenuItemsConstants.LABELS.GET_WORKSPACE_URL:
                this.copyWorkspaceURLToClipboard();
                break;

            case WorkspaceMenuItemsConstants.LABELS.MARK_AS_DEFAULT:
                this.markWorkspaceAsDefault();
                break;

            case WorkspaceMenuItemsConstants.LABELS.SET_WORKSPACE_DATE:
                this.setWorkspaceDate();
                break;

            case WorkspaceMenuItemsConstants.LABELS.BATCH_EXPORTING:
                BatchReportingService.batchSettingsModalOpen$.next(true);
                break;

            case WorkspaceMenuItemsConstants.LABELS.UNMARK_AS_DEFAULT:
                this.unmarkWorkspaceAsDefault();
                break;

            case WorkspaceMenuItemsConstants.LABELS.VIEW_VERSION_LOG:
                CoreFavoriteVersioningStore.favoriteVersionLogAction$.next({ id: WorkspaceStore.getWorkspace().id, type: CoreFavoriteConstants.FAVORITE_DISPLAY_TITLE.WORKSPACE, isOpen: true, loadFavoriteCallBack: this.workspaceService.loadFavoriteWorkspaceVersion });
                break;

            case WorkspaceMenuItemsConstants.LABELS.VIEW_USAGE:
                CoreFavoriteVersioningStore.viewUsageTypeAction$.next({ id: WorkspaceStore.getWorkspace().id, type: FavoriteType.WORKSPACE, isOpen: true });
                break;
        }
    }

    private updateMenuOptions(): void {
        WorkspaceStore.getWorkspace$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((workspace: Workspace) => {
                this.menuOptions = [
                    [
                        {label: WorkspaceMenuItemsConstants.LABELS.RENAME, isDisabled: !workspace},
                        {
                            label: WorkspaceMenuItemsConstants.LABELS.RUN_ALL_REPORTS,
                            isDisabled: !(workspace && workspace.workpads.length)
                        },
                        {label: WorkspaceMenuItemsConstants.LABELS.SET_WORKSPACE_DATE, isDisabled: !workspace}
                    ],
                    [
                        {
                            label: WorkspaceMenuItemsConstants.LABELS.SAVE_WORKSPACE,
                            isDisabled: !(workspace && workspace.workpads.length)
                        }
                    ],
                    [
                        {label: WorkspaceMenuItemsConstants.LABELS.NEW_WORKSPACE},
                        {label: WorkspaceMenuItemsConstants.LABELS.LOAD_WORKSPACE},
                        {
                            label: WorkspaceMenuItemsConstants.LABELS.DELETE_WORKSPACE,
                            isDisabled: this.disableDelete(workspace)
                        },
                        {
                            label: WorkspaceMenuItemsConstants.LABELS.GET_WORKSPACE_URL,
                            isDisabled: this.disableDelete(workspace)
                        }
                    ],
                    [
                        {
                            label: WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_PDF,
                            isDisabled: !(workspace && workspace.workpads.length)
                        },
                        {
                            label: WorkspaceMenuItemsConstants.LABELS.EXPORT_TO_EXCEL,
                            isDisabled: !(workspace && workspace.workpads.length)
                        },
                        {label: WorkspaceMenuItemsConstants.LABELS.BATCH_EXPORTING}
                    ]
                ];

                let defaultWorkspaceId: string|number = CoreUserMetaDataStore.userMetaData.preferences.get(UserPreference.DEFAULT_WORKSPACE.name);
                // parse to number if it is a number, otherwise leave as UUID string/undefined
                defaultWorkspaceId = isNaN(+defaultWorkspaceId) ? defaultWorkspaceId : +defaultWorkspaceId;
                // If we have a default workspace loaded
                if (defaultWorkspaceId && defaultWorkspaceId === workspace.id) {
                    // Remove Mark as Default option from menu if we have one
                    if (this.menuOptions[0][1].label === WorkspaceMenuItemsConstants.LABELS.MARK_AS_DEFAULT) {
                        this.menuOptions[0].splice(1, 1);
                    }
                    // Add option to unmark workspace as default
                    this.menuOptions[0].splice(1, 0, {label: WorkspaceMenuItemsConstants.LABELS.UNMARK_AS_DEFAULT});
                } else {
                    // 'Mark as Default' will be enabled in case of saved fav else will stay disabled
                    // Upon making any fav as 'Default', option will be replaced by 'Unmark by Default'
                    this.menuOptions[0].splice(1, 0, {
                        label: WorkspaceMenuItemsConstants.LABELS.MARK_AS_DEFAULT,
                        isDisabled: !(workspace && workspace.id && workspace.id !== Number(CoreUserMetaDataStore.userMetaData.preferences.get(UserPreference.DEFAULT_WORKSPACE.name)))
                    });
                }
                // Show View Verion Log and View Usage link only to enterprise owner
                if (workspace.owner === CoreFavoriteConstants.ADMIN) {
                    const userPermGroup = CoreUserMetaDataStore.userMetaData.userPermissionGroups;
                    // Show only if 1. Selecetd favorite doesn't have any permission group
                    // 2. User has a permission group which matches the selected favortie's perm group.
                    if (workspace.userPermGrps === undefined || workspace.userPermGrps?.length === 0
                        || userPermGroup?.some((value) => workspace.userPermGrps?.includes(value))) {
                        this.updateMenuOptionsForVersions(workspace);
                    }
                }
                if (CoreFavoriteUtils.showFavStatusTagMenu(workspace)) {
                    this.menuOptions[0].splice(1, 0, {label: WorkspaceMenuItemsConstants.LABELS.UPDATE_STATUS});
                }
            });
    }

    disableDelete(workspace: Workspace): boolean {
        // When token for versionlog is enabled and is an enterprise favorite and is not the latest version then disable
        if ( workspace && workspace.id && workspace.latestFavoriteVersion && workspace.currentFavoriteVersion &&
            TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_ENTERPRISE_VERSIONS)
            && workspace.owner === CoreFavoriteConstants.ADMIN) {
                return (workspace.latestFavoriteVersion !== workspace.currentFavoriteVersion);
        }
        return !(workspace && workspace.id);
    }

    updateMenuOptionsForVersions(workspace: Workspace) {
        if (TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_ENTERPRISE_VERSIONS)) {
            this.menuOptions[0].splice(4, 0, {
                label: WorkspaceMenuItemsConstants.LABELS.VIEW_VERSION_LOG,
                isDisabled: !(workspace && workspace.id && isNaN(Number(workspace.id)))
            });
        }
        if (TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_ENABLE_FAVORITE_USERS)) {
            this.menuOptions[0].splice(5, 0, {
                label: WorkspaceMenuItemsConstants.LABELS.VIEW_USAGE,
                isDisabled: !(workspace && workspace.id)
            });
        }
    }

    /**
     * Processes all requests in a workspace
     */
    private loadAllWorkspace(): void {
        if (LoadAllService.loadAllInProgress) {
            // If Load All is already in progress or the token is disabled, do nothing
            console.log('Loading is in progress');
            return;
        }
        if (!TokenUtils.isFeatureEnabled(TokenConstants.ENABLE_LOAD_ALL)) {
            console.log('Enable load all token is disabled');
            return;
        }
        this.telemetryTrackRunAllReportsClicked(WorkspaceStore.getWorkspace());
        this.loadAllService.initiateLoadAllProcess(WorkspaceStore.getWorkspace());
        // update the Run all reports title
        this.menuOptions[0].splice(2, 1, {
            label: WorkspaceMenuItemsConstants.LABELS.RUN_ALL_REPORTS + ' (0%)',
            isDisabled: true
        });
    }

    private telemetryTrackRunAllReportsClicked(workspace: Workspace) {
        const workspaceId = workspace.id ? workspace.id : 0;
        const workspaceOwner = workspace.owner ? workspace.owner : 'Untitled Workspace';
        const workspaceTitle = workspace.title;
        const runAllReportsParameters = new MenuOptionsParameters(TelemetryActionConstants.MENU_OPTIONS.RUN_ALL_REPORTS,
            workspaceId,
            workspaceTitle,
            workspaceOwner);
        TelemetryService.track(TelemetryActionConstants.MENU_OPTIONS.RUN_ALL_REPORTS,
            runAllReportsParameters);
    }

    /**
     * Opens the Export options modal to export the workspace to either PDF or Excel
     */
    private exportWorkspace(exportConfig: ExportConfig): void {
        const exportComposite = new WorkspaceExportComposite();
        exportComposite.workspace = WorkspaceStore.getWorkspace();
        exportComposite.exportConfig = exportConfig;
        // TODO - modify export compiste to accept workspace, workpad, report as well. At the moment it only accepts widget
        // TODO: When we do export workspace/workpad, we can leverage Batch models
        this.appStore.openExportOptionsModal$.next(exportComposite);
    }

    /**
     * Method to copy url to the user's clipboard
     */
    copyWorkspaceURLToClipboard(): void {
        const currentWorkspace = WorkspaceStore.getWorkspace();
        this.telemetryTrackGetWorkspaceURLClicked(currentWorkspace);
        // copy url to clipboard
        this.clipboardService.copyFromContent(currentWorkspace.generateWorkspaceUrl());
        this.notificationService.success(URLConstants.WORKSPACE_URL_COPY_SUCCESS);
    }

    private telemetryTrackGetWorkspaceURLClicked(workspace: Workspace) {
        const workspaceId = workspace.id;
        const workspaceOwner = workspace.owner;
        const workspaceTitle = workspace.title;
        const getWorkspaceURLParameters = new MenuOptionsParameters(TelemetryActionConstants.MENU_OPTIONS.GET_WORKSPACE_URL,
            workspaceId,
            workspaceTitle,
            workspaceOwner);
        TelemetryService.track(
            TelemetryActionConstants.MENU_OPTIONS.GET_WORKSPACE_URL,
            getWorkspaceURLParameters
        );
    }

    /**
     * Opens the set workspace date modal
     */
    private setWorkspaceDate(): void {
        this.appStore.openSetWorkspaceDateModal$.next(true);
    }

    /**
     * Marks the current Workspace as Default Workspace
     */
    private markWorkspaceAsDefault(): void {
        UserMetaDataStore.setPreferenceValue(UserPreference.DEFAULT_WORKSPACE, WorkspaceStore.getWorkspace().id.toString());
        this.notificationService.success('Workspace ' + WorkspaceStore.getWorkspace().title + ' marked as default');
        // Updates whether unmark as default option is disabled or not
        this.updateMenuOptions();
    }

    /**
     * Unmarks the current Workspace as Default Workspace
     */
    private unmarkWorkspaceAsDefault(): void {
        UserMetaDataStore.setPreferenceValue(UserPreference.DEFAULT_WORKSPACE, null);
        this.notificationService.success('Workspace ' + WorkspaceStore.getWorkspace().title + ' unmarked as default');
        // Updates whether unmark as default option is disabled or not
        this.updateMenuOptions();
    }

    executeWorkspaceAction(workspaceAction: string): void {
        if (workspaceAction === WorkspaceMenuItemsConstants.LABELS.NEW_WORKSPACE) {
            WorkspaceStore.newWorkspace();
        } else if (workspaceAction === WorkspaceMenuItemsConstants.LABELS.LOAD_WORKSPACE) {
            this.appStore.openLoadFavoriteModal$.next(
                new LoadFavoriteAction({
                    type: FavoriteConstants.WORKSPACE,
                    treeType: FavoriteConstants.WORKSPACE_FOLDER,
                    displayName: FavoriteConstants.WORKSPACE_PASCAL + 's',
                    callback: this.workspaceService.loadFavoriteWorkspace,
                    headerDisplayName: FavoriteConstants.WORKSPACE_PASCAL
                }));
        }
    }
}
