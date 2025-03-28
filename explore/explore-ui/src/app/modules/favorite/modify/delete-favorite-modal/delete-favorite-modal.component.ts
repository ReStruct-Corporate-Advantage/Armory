import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {AuxAdvancedTreeListInterface, AuxSearchFieldSearchValueChangedDetailInterface} from '@blk/aladdin-angular-components';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {FavoriteService, NotificationService} from '@services/index';
import {
    AbstractFavoriteConfig,
    AlertConstants,
    ErrorTypeConstants,
    ExploreDeleteFavoriteEventLocation,
    ExploreDialogParam,
    FavoriteType,
    UIErrorParameters
} from '@blk/explore-ui-core';
import {AppStore} from '../../../../app.store';
import {FavoriteConstants} from '@constants/favorite.constants';
import {DeleteFavoriteAction} from '@models/favorite/delete-favorite-action.model';
import {FavoriteTreeModifiableModalDirective} from '../favorite-tree-modifiable-modal.directive';
import {WorkspaceStore} from '@stores/workspace.store';

/**
 * Delete favorite Modal
 */
@Component({
    selector: 'app-delete-favorite-modal',
    templateUrl: './delete-favorite-modal.component.html',
    styleUrls: ['../favorite-tree-modifiable.component.scss']
})
export class DeleteFavoriteModalComponent extends FavoriteTreeModifiableModalDirective implements OnInit {
    @Input() stickySearch?: boolean;

    deleteFavoriteAction$: BehaviorSubject<DeleteFavoriteAction>;
    configToDelete: AbstractFavoriteConfig;


    // to filter favorite tree data based on the term
    favoriteSearchTermSubject$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    favId: number|string;

    isDeleteButtonDisabled = true;
    showDeleteButton = false;

    /**
     * constructor
     */
    constructor(private favoriteService: FavoriteService, private notificationService: NotificationService, private appStore: AppStore, private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    /**
     * ngOnInit
     */
    ngOnInit(): void {
        // create local saveFavoriteAction$ to pass favType and favTreeType down to favorite-tree
        this.deleteFavoriteAction$ = this.appStore.deleteFavoriteAction$;

        this.deleteFavoriteAction$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((deleteWorkspaceAction: DeleteFavoriteAction) => {
                if (!deleteWorkspaceAction.configToDelete || !deleteWorkspaceAction.type) {
                    return;
                }

                this.showFavoriteOwnerOptions(deleteWorkspaceAction.type);
                this.configToDelete = deleteWorkspaceAction.configToDelete;
                this.favType = deleteWorkspaceAction.type;
                this.favTreeType = deleteWorkspaceAction.treeType;
                this.favDisplayName = deleteWorkspaceAction.displayName;
                this.callback = deleteWorkspaceAction.callback;
                this.originalTitle = deleteWorkspaceAction.configToDelete.title;

                // set to show delete button
                this.setShowButton();
            });

        // update selectedNode and favoriteTitle
        this.selectedFavoriteNode$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((node: AuxAdvancedTreeListInterface) => {
                if (!node) {
                    return;
                }
                if (node.eventData.type !== FavoriteConstants.FOLDER) {
                    this.selectedNode = node;
                    this.favoriteTitle = node.label;
                    this.favId = node.eventData.favoriteId;
                    this.isDeleteButtonDisabled = false;
                } else {
                    this.selectedNode = null;
                    this.favoriteTitle = '';
                    this.favId = null;
                    this.isDeleteButtonDisabled = true;
                }
            });
    }

    /**
     * on search value changed
     */
    onSearchValueChanged(event: CustomEvent<AuxSearchFieldSearchValueChangedDetailInterface>): void {
        this.favoriteSearchTermSubject$.next(event.detail.submitValue.searchValue.toLowerCase());
    }

    /**
     * This method deletes the selected favorite item
     */
    onDeleteButtonClicked(): void {
        let workspaceDeleteMsg;
        if (this.originalTitle === this.favoriteTitle) {
            workspaceDeleteMsg = new ExploreDialogParam(
                AlertConstants.TYPE.ALERT_WITH_OPTIONS,
                AlertConstants.HEADER.DELETE_FAV_CURR_TITLE + this.favDisplayName,
                this.getDeleteFavoriteMessageBodyByType(true),
                AlertConstants.BTN.CONFIRM,
                AlertConstants.BTN.CANCEL,
                () =>  {
                    this.onDeleteButtonConfirm(true);
                }
            );
        } else {
            workspaceDeleteMsg = new ExploreDialogParam(
                AlertConstants.TYPE.ALERT_WITH_OPTIONS,
                AlertConstants.HEADER.DELETE_FAV_TITLE + this.favDisplayName,
                this.getDeleteFavoriteMessageBodyByType(false),
                AlertConstants.BTN.CONFIRM,
                AlertConstants.BTN.CANCEL,
                () =>  {
                    this.onDeleteButtonConfirm(false);
                }
            );
        }
        this.notificationService.openDialog(workspaceDeleteMsg);
    }

    /**
     * Delete favorite with same current favorite
     */
    onDeleteButtonConfirm(isCurrentFav: boolean): void {
        this.deleteFavorite(this.favId, this.favType, this.favoriteTitle, this.selectedUser$.getValue())
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((result: boolean) => {
                if (result) {
                    if (isCurrentFav) {
                        this.closeModal();
                        if (this.favType === FavoriteType.WORKSPACE) {
                            WorkspaceStore.newWorkspace();
                        }
                    }
                    if (this.favType === FavoriteType.LAYOUT) {
                        this.removeReportFromPanelIfPresent(this.favId);
                    }
                }
            }, error => {
                console.log(error);
                this.notificationService.error('Error occurred while deleting : ' + error.toString());
                this.isDeleteButtonDisabled = false;
            });
    }

    /**
     * Delete Favorite and pop up success/error toast
     */
    deleteFavorite(favId: number|string, favType: string, favName: string, owner: string): Observable<boolean> {
        const result = new Subject<boolean>();
        this.isDeleteButtonDisabled = true;
        this.favoriteService.deleteFavorite$(favId, favType, favName, owner)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((_response: any) => {
                if (typeof favId === 'number') {
                    this.notificationService.success('Successfully deleted ' + this.favoriteTitle);
                } else if (typeof favId === 'string') {
                    this.notificationService.success('Successfully deleted the latest version and all the versions of the enterprise component ' + this.favoriteTitle);
                }
                this.updateFavoriteTreeStructure$.next({selectedNode: this.selectedNode, title: favName, id: favId});
                if (this.callback) {
                    WorkspaceStore.refreshWorkspace();
                }
                result.next(true);
                this.favoriteService.postDeleteTelemetry(ExploreDeleteFavoriteEventLocation.EXPLORE_DELETE_FAVORITE_EVENT_LOCATION_MENU, favType, favId, favName, owner);
                result.complete();
            }, error => {
                console.error(error);
                this.notificationService.error('Error occurred while deleting : ' + error.toString(), ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_DELETE_FAVORITE_ERROR);
                this.isDeleteButtonDisabled = false;
                result.next(true);
                result.complete();
            });

        return result.asObservable();
    }

    /**
     * Set show Delete button
     * Show "Delete":
     * for non existing favorite (brand new) and login's favorite (login can be either current user or admin if Type: admin is selected for user with admin perm ONLY)
     */
    setShowButton(): void {
        this.isDeleteButtonDisabled = true;
        this.showDeleteButton = !!this.configToDelete.owner;
        this.changeDetectorRef.markForCheck();
    }

    /**
     * Returns alert body based on FavType
     */
    getDeleteFavoriteMessageBodyByType(isCurrent: boolean): string {
        if (isCurrent) {
            switch (this.favType) {
                case FavoriteType.WORKSPACE: return this.favoriteTitle + AlertConstants.BODY.CURR_WORKSPACE_DEL_CONFIRM_SUFFIX;
                case FavoriteType.LAYOUT: return this.favoriteTitle + AlertConstants.BODY.CURR_REPORT_DEL_CONFIRM_SUFFIX;
            }
        }
        return AlertConstants.BODY.FAV_DEL_CONFIRM_PREFIX + this.favoriteTitle + AlertConstants.BODY.FAV_DEL_CONFIRM_SUFFIX;
    }

    /**
     * This method removes open report from report panel if present
     */
    removeReportFromPanelIfPresent(favId: number | string) {
        const selectedReport =  WorkspaceStore.getCurrentWorkpad().reports.find(report => report.id === favId);
        if (selectedReport) {
            this.callback(selectedReport);
        }
    }
}
